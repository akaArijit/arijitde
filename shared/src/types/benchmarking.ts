export type Timeframe = '1Y' | '3Y' | '5Y' | 'ALL';

export type DataSource = 'UPLOADED_PORTFOLIO' | 'CRM_IMPORT';
export type DataQuality = 'FULL_RECONSTRUCTION' | 'REPORTED_METRICS_ONLY';

export interface MonthlyPoint {
  date: string;
  value: number;
}

export interface BenchmarkTimePoint {
  date: string;
  portfolioValue: number;
  nifty50TRI: number;
  nifty500TRI: number;
  niftyMidcap150TRI: number;
  niftySmallcap250TRI: number;
  categoryAverage: number;
}

export interface BenchmarkMetrics {
  portfolioXIRR: number;
  portfolioCAGR: number;
  nifty50TRI_CAGR: number;
  nifty500TRI_CAGR: number;
  niftyMidcap150TRI_CAGR: number;
  niftySmallcap250TRI_CAGR: number;
  categoryAverage_CAGR: number;
  alpha: number;
  beta: number;
  sharpeRatio: number;
  informationRatio: number;
  maxDrawdown: number;
  riskFreeRate: number;
  dataPoints: number;
  computationTimeMs: number;
}

export interface AdminBenchmarkMeta {
  fundCount: number;
  dominantCategory: string;
  benchmarkUsed: string;
  dataQuality: DataQuality;
  warnings?: string[];
}

export interface AdminBenchmarkResponse {
  source: DataSource;
  clientName?: string;
  portfolioId?: string;
  timeSeries: BenchmarkTimePoint[];
  metrics: BenchmarkMetrics;
  meta: AdminBenchmarkMeta;
}

export interface Cashflow {
  date: Date;
  amount: number;
}

export interface PortfolioRowForBenchmark {
  fundName: string;
  type: 'SIP' | 'LUMPSUM';
  startDate: Date;
  sipAmount: number;
  invested: number;
  currentValue: number;
}

export interface ExistingClientForBenchmark {
  name?: string | null;
  xirr?: number | null;
  cagr?: number | null;
  currentValue?: number | null;
  purchaseValue?: number | null;
  balanceUnits?: number | null;
  absoluteReturn?: number | null;
  avgHoldingDays?: number | null;
}

export interface FolioForBenchmark {
  schemeName?: string | null;
  units?: number | null;
  aum?: number | null;
  purchaseValue?: number | null;
  currentValue?: number | null;
}