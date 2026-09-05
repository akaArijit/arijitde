/**
 * AMFI API Service
 * Provides mutual fund NAV data, scheme search, and benchmark comparisons
 * using the public api.mfapi.in API.
 */

// ── In-memory cache with TTL ──
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

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

// ── AMFI API Types ──
interface MFSearchResult {
  schemeCode: number;
  schemeName: string;
}

interface NAVDataPoint {
  date: string;
  nav: string;
}

interface MFSchemeData {
  meta: {
    fund_house: string;
    scheme_type: string;
    scheme_category: string;
    scheme_code: number;
    scheme_name: string;
  };
  data: NAVDataPoint[];
}

// ── Category Benchmark Index Fund Codes ──
// These are representative low-cost index funds for each category
const CATEGORY_BENCHMARKS: Record<string, number> = {
  large_cap: 120503, // Nifty 50 Index Fund (UTI)
  mid_cap: 147622, // Nifty Midcap 150 Index Fund
  small_cap: 145197, // Nifty Smallcap 250 Index Fund
  flexi_cap: 120503, // Use Nifty 50 as proxy
  multi_cap: 120503, // Use Nifty 50 as proxy
  elss: 120503, // Use Nifty 50 as proxy
  balanced: 119551, // Balanced Advantage category
  debt: 119551, // Debt category proxy
  index: 120503, // Nifty 50
  liquid: 119551, // Liquid category proxy
  default: 120503, // Fallback to Nifty 50
};

// ── Category Top Performing Fund Codes ──
// High-performing representative funds for each category
export const CATEGORY_TOP_PERFORMERS: Record<
  string,
  { code: number; name: string }
> = {
  large_cap: { code: 118768, name: 'HDFC Top 100 Fund Growth' },
  mid_cap: { code: 127039, name: 'Motilal Oswal Midcap Fund Growth' },
  small_cap: { code: 120828, name: 'Nippon India Small Cap Fund Growth' },
  flexi_cap: { code: 122639, name: 'Parag Parikh Flexi Cap Fund Growth' },
  multi_cap: { code: 122639, name: 'Parag Parikh Flexi Cap Fund Growth' },
  elss: { code: 120843, name: 'SBI Long Term Equity Fund Growth (ELSS)' },
  balanced: {
    code: 119047,
    name: 'ICICI Prudential Equity & Debt Fund Growth',
  },
  debt: { code: 119018, name: 'HDFC Medium Term Debt Fund Growth' },
  index: { code: 120716, name: 'UTI Nifty 50 Index Fund Growth' },
  liquid: { code: 119062, name: 'SBI Liquid Fund Growth' },
  default: { code: 122639, name: 'Parag Parikh Flexi Cap Fund Growth' },
};

// ── Fund Category Detection ──
export function detectFundCategory(fundName: string): string {
  const name = fundName.toLowerCase();

  if (
    name.includes('liquid') ||
    name.includes('overnight') ||
    name.includes('money market')
  )
    return 'liquid';
  if (
    name.includes('small cap') ||
    name.includes('smallcap') ||
    name.includes('small-cap')
  )
    return 'small_cap';
  if (
    name.includes('mid cap') ||
    name.includes('midcap') ||
    name.includes('mid-cap')
  )
    return 'mid_cap';
  if (
    name.includes('large cap') ||
    name.includes('largecap') ||
    name.includes('large-cap') ||
    name.includes('bluechip') ||
    name.includes('blue chip') ||
    name.includes('top 100') ||
    name.includes('top 200')
  )
    return 'large_cap';
  if (
    name.includes('flexi cap') ||
    name.includes('flexicap') ||
    name.includes('flexi-cap') ||
    name.includes('multicap') ||
    name.includes('multi cap') ||
    name.includes('multi-cap')
  )
    return 'flexi_cap';
  if (
    name.includes('elss') ||
    name.includes('tax') ||
    name.includes('tax saver') ||
    name.includes('tax saving')
  )
    return 'elss';
  if (
    name.includes('balanced') ||
    name.includes('hybrid') ||
    name.includes('aggressive') ||
    name.includes('conservative') ||
    name.includes('dynamic asset') ||
    name.includes('equity saving')
  )
    return 'balanced';
  if (
    name.includes('debt') ||
    name.includes('bond') ||
    name.includes('gilt') ||
    name.includes('corporate') ||
    name.includes('short duration') ||
    name.includes('medium duration') ||
    name.includes('long duration') ||
    name.includes('credit risk') ||
    name.includes('banking & psu') ||
    name.includes('fixed maturity') ||
    name.includes('ultra short') ||
    name.includes('low duration') ||
    name.includes('floater')
  )
    return 'debt';
  if (
    name.includes('index') ||
    name.includes('nifty') ||
    name.includes('sensex') ||
    name.includes('etf')
  )
    return 'index';

  // Default — classify as flexi_cap (broad equity)
  return 'flexi_cap';
}

// ── AMC Detection ──
const AMC_KEYWORDS = [
  'HDFC',
  'ICICI',
  'SBI',
  'Axis',
  'Kotak',
  'Nippon',
  'Aditya Birla',
  'UTI',
  'DSP',
  'Tata',
  'Mirae',
  'Parag Parikh',
  'PPFAS',
  'Motilal',
  'Franklin',
  'HSBC',
  'Invesco',
  'Canara',
  'L&T',
  'Sundaram',
  'Edelweiss',
  'IDFC',
  'Bandhan',
  'Baroda',
  'Quant',
  'Mahindra',
  'JM',
  'PGIM',
  'ITI',
  'Groww',
  'WhiteOak',
  'Samco',
  'Trust',
  'Navi',
  'Quantum',
  'LIC',
  'Bank of India',
  'Union',
  'IDBI',
  'BOI AXA',
  'Principal',
  'Reliance',
];

export function detectAMC(fundName: string): string {
  const name = fundName.toLowerCase();
  for (const amc of AMC_KEYWORDS) {
    if (name.includes(amc.toLowerCase())) {
      return amc;
    }
  }
  // Fallback: use first word as AMC
  return fundName.split(' ')[0] || 'Unknown';
}

// ── Is Equity Category? ──
export function isEquityCategory(category: string): boolean {
  return [
    'large_cap',
    'mid_cap',
    'small_cap',
    'flexi_cap',
    'multi_cap',
    'elss',
    'index',
  ].includes(category);
}

export function isDebtCategory(category: string): boolean {
  return ['debt', 'liquid'].includes(category);
}

// ── AMFI API Functions ──

/**
 * Search for a mutual fund scheme by name
 */
export async function searchScheme(
  schemeName: string,
): Promise<MFSearchResult[]> {
  const cacheKey = `search:${schemeName.toLowerCase().trim()}`;
  const cached = getCached<MFSearchResult[]>(cacheKey);
  if (cached) return cached;

  try {
    // Clean up the name for better search
    const searchQuery = schemeName
      .replace(/\s*-\s*(growth|dividend|direct|regular|plan|option)\s*/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .slice(0, 4) // Take first 4 words for better matching
      .join(' ');

    const res = await fetch(
      `https://api.mfapi.in/mf/search?q=${encodeURIComponent(searchQuery)}`,
    );
    if (!res.ok) return [];

    const data = (await res.json()) as MFSearchResult[];
    const results = data.slice(0, 10); // Take top 10 matches
    setCache(cacheKey, results);
    return results;
  } catch (err) {
    console.error(`AMFI search failed for "${schemeName}":`, err);
    return [];
  }
}

/**
 * Get NAV data for a scheme by its code
 */
export async function getSchemeNAV(
  schemeCode: number,
): Promise<MFSchemeData | null> {
  const cacheKey = `nav:${schemeCode}`;
  const cached = getCached<MFSchemeData>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
    if (!res.ok) return null;

    const data = (await res.json()) as MFSchemeData;
    if (!data.data || data.data.length === 0) return null;

    setCache(cacheKey, data);
    return data;
  } catch (err) {
    console.error(`AMFI NAV fetch failed for code ${schemeCode}:`, err);
    return null;
  }
}

/**
 * Calculate 1-year return for a scheme
 */
export async function calculate1YReturn(
  schemeCode: number,
): Promise<number | null> {
  const cacheKey = `return1y:${schemeCode}`;
  const cached = getCached<number>(cacheKey);
  if (cached !== null) return cached;

  try {
    const data = await getSchemeNAV(schemeCode);
    if (!data || data.data.length < 2) return null;

    // NAV data is sorted newest first
    const latestNAV = parseFloat(data.data[0]!.nav);

    // Find NAV from ~1 year ago
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
  } catch (err) {
    console.error(`1Y return calc failed for code ${schemeCode}:`, err);
    return null;
  }
}

/**
 * Get benchmark return for a fund category
 */
export async function getCategoryBenchmarkReturn(
  category: string,
): Promise<number | null> {
  const benchmarkCode =
    CATEGORY_BENCHMARKS[category] || CATEGORY_BENCHMARKS['default']!;
  return calculate1YReturn(benchmarkCode);
}

/**
 * Get 1-year return for a fund by name (searches, then fetches NAV)
 */
export async function getFundReturn(
  fundName: string,
): Promise<{ returnPct: number | null; schemeCode: number | null }> {
  try {
    const results = await searchScheme(fundName);
    if (results.length === 0) return { returnPct: null, schemeCode: null };

    // Use the first (best) match
    const bestMatch = results[0]!;
    const returnPct = await calculate1YReturn(bestMatch.schemeCode);
    return { returnPct, schemeCode: bestMatch.schemeCode };
  } catch (err) {
    console.error(`getFundReturn failed for "${fundName}":`, err);
    return { returnPct: null, schemeCode: null };
  }
}
