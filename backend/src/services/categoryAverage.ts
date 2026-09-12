interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL_MS });
}

interface MFSearchResult {
  schemeCode: number;
  schemeName: string;
}

const CATEGORY_SEARCH_TERMS: Record<string, string[]> = {
  large_cap: ['large cap', 'bluechip', 'top 100', 'nifty 50'],
  mid_cap: ['mid cap', 'midcap'],
  small_cap: ['small cap', 'smallcap'],
  flexi_cap: ['flexi cap', 'flexicap'],
  multi_cap: ['multi cap', 'multicap'],
  elss: ['elss', 'tax saver', 'tax saving'],
  balanced: ['balanced', 'hybrid', 'aggressive hybrid', 'conservative hybrid'],
  index: ['index', 'nifty 50', 'sensex'],
  debt: ['debt', 'bond', 'gilt', 'corporate bond', 'banking psu'],
  liquid: ['liquid', 'overnight', 'money market'],
};

async function fetchWithTimeout(url: string, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function searchSchemes(query: string): Promise<MFSearchResult[]> {
  const cacheKey = `search:${query.toLowerCase().trim()}`;
  const cached = getCached<MFSearchResult[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetchWithTimeout(
      `https://api.mfapi.in/mf/search?q=${encodeURIComponent(query)}`
    );
    if (!res.ok) return [];
    const data = (await res.json()) as MFSearchResult[];
    const results = data.slice(0, 15);
    setCache(cacheKey, results);
    return results;
  } catch {
    return [];
  }
}

async function calculate1YReturn(schemeCode: number): Promise<number | null> {
  const cacheKey = `return1y:${schemeCode}`;
  const cached = getCached<number>(cacheKey);
  if (cached !== null) return cached;

  try {
    const res = await fetchWithTimeout(`https://api.mfapi.in/mf/${schemeCode}`);
    if (!res.ok) return null;
    const data = (await res.json()) as any;
    if (!data.data || data.data.length < 2) return null;

    const latestNAV = parseFloat(data.data[0].nav);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    let yearAgoNAV: number | null = null;
    for (const dp of data.data) {
      const [day, month, year] = dp.date.split('-');
      const dpDate = new Date(`${year}-${month}-${day}`);
      if (dpDate <= oneYearAgo) {
        yearAgoNAV = parseFloat(dp.nav);
        break;
      }
    }

    if (!yearAgoNAV || yearAgoNAV <= 0) return null;
    const returnPct = ((latestNAV - yearAgoNAV) / yearAgoNAV) * 100;
    setCache(cacheKey, returnPct);
    return returnPct;
  } catch {
    return null;
  }
}

export async function getCategorySchemes(category: string): Promise<number[]> {
  const cacheKey = `cat_schemes:${category}`;
  const cached = getCached<number[]>(cacheKey);
  if (cached) return cached;

  const terms = CATEGORY_SEARCH_TERMS[category] || [category];
  const allCodes = new Set<number>();

  for (const term of terms) {
    const results = await searchSchemes(term);
    results.forEach((r) => allCodes.add(r.schemeCode));
    if (allCodes.size >= 30) break;
  }

  const codes = Array.from(allCodes).slice(0, 25);
  setCache(cacheKey, codes);
  return codes;
}

export async function computeCategoryAverageReturn(
  category: string,
  timeframe: '1Y' | '3Y' | '5Y' | 'ALL'
): Promise<number | null> {
  const cacheKey = `cat_avg:${category}:${timeframe}`;
  const cached = getCached<number>(cacheKey);
  if (cached !== null) return cached;

  try {
    const schemeCodes = await getCategorySchemes(category);
    if (schemeCodes.length === 0) return null;

    const returnPromises = schemeCodes.map((code) => calculate1YReturn(code));
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 10000)
    );

    const returns = await Promise.race([
      Promise.all(returnPromises),
      timeoutPromise,
    ]);

    if (!returns || !Array.isArray(returns)) return null;

    const validReturns = returns.filter((r): r is number => r !== null && !isNaN(r));
    if (validReturns.length === 0) return null;

    const avg = validReturns.reduce((a, b) => a + b, 0) / validReturns.length;
    setCache(cacheKey, avg);
    return avg;
  } catch {
    return null;
  }
}

export async function computeCategoryAverageSeries(
  category: string,
  timeframeDays: number
): Promise<{ date: string; value: number }[]> {
  const avgReturn = await computeCategoryAverageReturn(category, '1Y');
  if (avgReturn === null) return [];

  const monthlyReturn = Math.pow(1 + avgReturn / 100, 1 / 12) - 1;
  const points: { date: string; value: number }[] = [];
  const to = new Date();
  const months = Math.min(Math.ceil(timeframeDays / 30.44), 120);

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(to);
    date.setMonth(date.getMonth() - i);
    const value = 100 * Math.pow(1 + monthlyReturn, months - i);
    points.push({
      date: date.toISOString().split('T')[0],
      value,
    });
  }
  return points;
}