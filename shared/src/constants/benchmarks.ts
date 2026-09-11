import type { Timeframe } from '../types/benchmarking';

export const BENCHMARK_INDICES = {
  NIFTY_50_TRI: '^NSEI',
  NIFTY_500_TRI: '^NSE500',
  NIFTY_MIDCAP_150_TRI: '^CNXMIDCAP',
  NIFTY_SMALLCAP_250_TRI: '^CNXSMALLCAP',
  NIFTY_BANK_TRI: '^NSEBANK',
  NIFTY_IT_TRI: '^CNXIT',
  NIFTY_PHARMA_TRI: '^CNXPHARMA',
} as const;

export type BenchmarkIndexKey = keyof typeof BENCHMARK_INDICES;

export const CATEGORY_BENCHMARK_MAP: Record<string, string> = {
  large_cap: BENCHMARK_INDICES.NIFTY_50_TRI,
  flexi_cap: BENCHMARK_INDICES.NIFTY_500_TRI,
  multi_cap: BENCHMARK_INDICES.NIFTY_500_TRI,
  mid_cap: BENCHMARK_INDICES.NIFTY_MIDCAP_150_TRI,
  small_cap: BENCHMARK_INDICES.NIFTY_SMALLCAP_250_TRI,
  elss: BENCHMARK_INDICES.NIFTY_500_TRI,
  balanced: BENCHMARK_INDICES.NIFTY_50_TRI,
  index: BENCHMARK_INDICES.NIFTY_50_TRI,
  debt: BENCHMARK_INDICES.NIFTY_50_TRI,
  liquid: BENCHMARK_INDICES.NIFTY_50_TRI,
  default: BENCHMARK_INDICES.NIFTY_500_TRI,
};

export const RISK_FREE_RATE = 0.07;

export const TIMEFRAME_DAYS: Record<Timeframe, number> = {
  '1Y': 365,
  '3Y': 1095,
  '5Y': 1825,
  'ALL': 7300,
};

export const PRIMARY_BENCHMARK = BENCHMARK_INDICES.NIFTY_50_TRI;

export const BENCHMARK_DISPLAY_NAMES: Record<string, string> = {
  [BENCHMARK_INDICES.NIFTY_50_TRI]: 'Nifty 50 TRI',
  [BENCHMARK_INDICES.NIFTY_500_TRI]: 'Nifty 500 TRI',
  [BENCHMARK_INDICES.NIFTY_MIDCAP_150_TRI]: 'Nifty Midcap 150 TRI',
  [BENCHMARK_INDICES.NIFTY_SMALLCAP_250_TRI]: 'Nifty Smallcap 250 TRI',
  [BENCHMARK_INDICES.NIFTY_BANK_TRI]: 'Nifty Bank TRI',
  [BENCHMARK_INDICES.NIFTY_IT_TRI]: 'Nifty IT TRI',
  [BENCHMARK_INDICES.NIFTY_PHARMA_TRI]: 'Nifty Pharma TRI',
};

export const CHART_SERIES_CONFIG = {
  portfolio: { key: 'portfolioValue', label: 'Portfolio', color: '#09090b', strokeWidth: 2.5, dash: '' },
  nifty50TRI: { key: 'nifty50TRI', label: 'Nifty 50 TRI', color: '#10b981', strokeWidth: 2, dash: '5 5' },
  categoryAverage: { key: 'categoryAverage', label: 'Category Avg', color: '#06b6d4', strokeWidth: 2, dash: '8 4' },
} as const;