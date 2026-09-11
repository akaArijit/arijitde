import type { Timeframe } from '../types/benchmarking';

export const BENCHMARK_INDICES = {
  NIFTY_50_TRI: '^NSEI',
  NIFTY_500_TRI: '^NSE500',
  NIFTY_MIDCAP_150_TRI: '^CNXMIDCAP',
  NIFTY_SMALLCAP_250_TRI: '^CNXSMALLCAP',
  NIFTY_NEXT_50_TRI: '^NSMIDCP',
  NIFTY_BANK_TRI: '^NSEBANK',
  NIFTY_IT_TRI: '^CNXIT',
  NIFTY_PHARMA_TRI: '^CNXPHARMA',
  NIFTY_FMCG_TRI: '^CNXFMCG',
  NIFTY_AUTO_TRI: '^CNXAUTO',
  NIFTY_ENERGY_TRI: '^CNXENERGY',
  NIFTY_INFRA_TRI: '^CNXINFRA',
  NIFTY_METAL_TRI: '^CNXMETAL',
  NIFTY_REALTY_TRI: '^CNXREALTY',
  NIFTY_CONSUMPTION_TRI: '^CNXCONSUM',
  NIFTY_HEALTHCARE_TRI: '^CNXHEALTH',
  NIFTY_MNC_TRI: '^CNXMNC',
  NIFTY_PSE_TRI: '^CNXPSE',
  NIFTY_COMMODITIES_TRI: '^CNXCOMM',
} as const;

export type BenchmarkIndexKey = keyof typeof BENCHMARK_INDICES;

export const CATEGORY_BENCHMARK_MAP: Record<string, string> = {
  large_cap: 'NIFTY_50_TRI',
  flexi_cap: 'NIFTY_500_TRI',
  multi_cap: 'NIFTY_500_TRI',
  mid_cap: 'NIFTY_MIDCAP_150_TRI',
  small_cap: 'NIFTY_SMALLCAP_250_TRI',
  elss: 'NIFTY_500_TRI',
  balanced: 'NIFTY_50_TRI',
  index: 'NIFTY_50_TRI',
  debt: 'NIFTY_50_TRI',
  liquid: 'NIFTY_50_TRI',
  banking: 'NIFTY_BANK_TRI',
  technology: 'NIFTY_IT_TRI',
  pharma: 'NIFTY_PHARMA_TRI',
  auto: 'NIFTY_AUTO_TRI',
  energy: 'NIFTY_ENERGY_TRI',
  infra: 'NIFTY_INFRA_TRI',
  metal: 'NIFTY_METAL_TRI',
  realty: 'NIFTY_REALTY_TRI',
  consumption: 'NIFTY_CONSUMPTION_TRI',
  healthcare: 'NIFTY_HEALTHCARE_TRI',
  mnc: 'NIFTY_MNC_TRI',
  pse: 'NIFTY_PSE_TRI',
  default: 'NIFTY_500_TRI',
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
  [BENCHMARK_INDICES.NIFTY_NEXT_50_TRI]: 'Nifty Next 50 TRI',
  [BENCHMARK_INDICES.NIFTY_BANK_TRI]: 'Nifty Bank TRI',
  [BENCHMARK_INDICES.NIFTY_IT_TRI]: 'Nifty IT TRI',
  [BENCHMARK_INDICES.NIFTY_PHARMA_TRI]: 'Nifty Pharma TRI',
  [BENCHMARK_INDICES.NIFTY_FMCG_TRI]: 'Nifty FMCG TRI',
  [BENCHMARK_INDICES.NIFTY_AUTO_TRI]: 'Nifty Auto TRI',
  [BENCHMARK_INDICES.NIFTY_ENERGY_TRI]: 'Nifty Energy TRI',
  [BENCHMARK_INDICES.NIFTY_INFRA_TRI]: 'Nifty Infra TRI',
  [BENCHMARK_INDICES.NIFTY_METAL_TRI]: 'Nifty Metal TRI',
  [BENCHMARK_INDICES.NIFTY_REALTY_TRI]: 'Nifty Realty TRI',
  [BENCHMARK_INDICES.NIFTY_CONSUMPTION_TRI]: 'Nifty Consumption TRI',
  [BENCHMARK_INDICES.NIFTY_HEALTHCARE_TRI]: 'Nifty Healthcare TRI',
  [BENCHMARK_INDICES.NIFTY_MNC_TRI]: 'Nifty MNC TRI',
  [BENCHMARK_INDICES.NIFTY_PSE_TRI]: 'Nifty PSE TRI',
  [BENCHMARK_INDICES.NIFTY_COMMODITIES_TRI]: 'Nifty Commodities TRI',
};

export const CHART_SERIES_CONFIG = {
  portfolio: { key: 'portfolioValue', label: 'Portfolio', color: '#09090b', strokeWidth: 2.5, dash: '' },
  compositeBenchmark: { key: 'compositeBenchmark', label: 'Composite Benchmark', color: '#10b981', strokeWidth: 2, dash: '5 5' },
  nifty50TRI: { key: 'nifty50TRI', label: 'Nifty 50 TRI', color: '#3b82f6', strokeWidth: 1.5, dash: '8 4' },
  categoryAverage: { key: 'categoryAverage', label: 'Category Avg', color: '#06b6d4', strokeWidth: 2, dash: '8 4' },
  achievableValue: { key: 'achievableValue', label: 'Achievable', color: '#f59e0b', strokeWidth: 2, dash: '3 6' },
} as const;