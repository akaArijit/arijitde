import type { MonthlyPoint } from '@finanalysis/shared';
import { LRUCache } from '../lib/lruCache';

const CACHE_TTL_MS = 60 * 60 * 1000;
const cache = new LRUCache<any>(300, CACHE_TTL_MS);

function getCached<T>(key: string): T | null {
  return cache.get(key) as T | null;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, data, CACHE_TTL_MS);
}

interface YahooChartResponse {
  chart: {
    result: Array<{
      meta: {
        symbol: string;
        regularMarketPrice: number;
        currency: string;
      };
      timestamp: number[];
      indicators: {
        quote: Array<{ close: (number | null)[] }>;
        adjclose: Array<{ adjclose: (number | null)[] }>;
      };
    }>;
    error: null | any;
  };
}

async function fetchWithTimeout(url: string, timeoutMs = 8000, retries = 2): Promise<Response> {
  let lastError: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (res.ok) return res;
      if (res.status >= 500 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 400 * Math.pow(2, attempt)));
        continue;
      }
      return res;
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 400 * Math.pow(2, attempt)));
      }
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError || new Error(`Failed to fetch ${url} after ${retries} retries`);
}

export async function fetchIndexHistory(
  symbol: string,
  from: Date,
  to: Date
): Promise<MonthlyPoint[]> {
  const cacheKey = `yahoo:${symbol}:${from.toISOString()}:${to.toISOString()}`;
  const cached = getCached<MonthlyPoint[]>(cacheKey);
  if (cached) return cached;

  const period1 = Math.floor(from.getTime() / 1000);
  const period2 = Math.floor(to.getTime() / 1000);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=1mo`;

  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) {
      throw new Error(`Yahoo Finance HTTP ${res.status}`);
    }
    const data = (await res.json()) as YahooChartResponse;

    if (!data.chart?.result?.[0]) {
      throw new Error('No data returned from Yahoo Finance');
    }

    const result = data.chart.result[0];
    const timestamps = result.timestamp || [];
    const adjClose = result.indicators?.adjclose?.[0]?.adjclose || [];
    const close = result.indicators?.quote?.[0]?.close || [];

    const values = adjClose.length > 0 ? adjClose : close;

    const points: MonthlyPoint[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      const val = values[i];
      if (val !== null && val !== undefined && !isNaN(val)) {
        const date = new Date(timestamps[i] * 1000);
        points.push({
          date: date.toISOString().split('T')[0],
          value: val,
        });
      }
    }

    if (points.length === 0) {
      throw new Error('No valid data points');
    }

    setCache(cacheKey, points);
    return points;
  } catch (err) {
    console.error(`Yahoo Finance fetch failed for ${symbol}:`, err);
    throw err;
  }
}

export function normalizeToBase100(series: MonthlyPoint[]): MonthlyPoint[] {
  if (series.length === 0) return [];
  const base = series[0].value;
  if (base === 0) return series;
  return series.map((p) => ({
    date: p.date,
    value: (p.value / base) * 100,
  }));
}

export async function fetchBenchmarkCAGR(
  symbol: string,
  timeframeDays: number
): Promise<number | null> {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - timeframeDays);

  try {
    const points = await fetchIndexHistory(symbol, from, to);
    if (points.length < 2) return null;

    const start = points[0].value;
    const end = points[points.length - 1].value;
    const years = timeframeDays / 365.25;

    if (start <= 0) return null;
    const cagr = (Math.pow(end / start, 1 / years) - 1) * 100;
    return cagr;
  } catch {
    return null;
  }
}

export async function fetchAllBenchmarkIndices(
  timeframeDays: number
): Promise<Record<string, number>> {
  const symbols = [
    'NIFTY_50_TRI',
    'NIFTY_500_TRI',
    'NIFTY_MIDCAP_150_TRI',
    'NIFTY_SMALLCAP_250_TRI',
  ] as const;

  const results = await Promise.allSettled(
    symbols.map((s) => fetchBenchmarkCAGR(s, timeframeDays))
  );

  const output: Record<string, number> = {};
  symbols.forEach((s, i) => {
    if (results[i].status === 'fulfilled' && results[i].value !== null) {
      output[s] = results[i].value;
    }
  });
  return output;
}

export async function fetchAllBenchmarkSeries(
  timeframeDays: number
): Promise<Record<string, MonthlyPoint[]>> {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - timeframeDays);

  const symbols = [
    'NIFTY_50_TRI',
    'NIFTY_500_TRI',
    'NIFTY_MIDCAP_150_TRI',
    'NIFTY_SMALLCAP_250_TRI',
  ] as const;

  const results = await Promise.allSettled(
    symbols.map((s) => fetchIndexHistory(s, from, to))
  );

  const output: Record<string, MonthlyPoint[]> = {};
  symbols.forEach((s, i) => {
    if (results[i].status === 'fulfilled') {
      output[s] = normalizeToBase100(results[i].value);
    } else {
      output[s] = [];
    }
  });
  return output;
}

export async function fetchMultipleIndices(
  symbols: string[],
  from: Date,
  to: Date
): Promise<Record<string, MonthlyPoint[]>> {
  const uniqueSymbols = [...new Set(symbols)];
  const results = await Promise.allSettled(
    uniqueSymbols.map((s) => fetchIndexHistory(s, from, to))
  );

  const output: Record<string, MonthlyPoint[]> = {};
  uniqueSymbols.forEach((s, i) => {
    if (results[i].status === 'fulfilled') {
      output[s] = normalizeToBase100(results[i].value);
    } else {
      output[s] = [];
      console.error(`Failed to fetch ${s}:`, results[i].reason);
    }
  });
  return output;
}