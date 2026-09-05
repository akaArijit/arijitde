export type FundType = 'SIP' | 'LUMPSUM';
export type UploadType = 'EXCEL' | 'MANUAL';

export interface PortfolioRow {
  id: string;
  portfolioId: string;
  fundName: string;
  type: FundType;
  startDate: Date;
  sipAmount: number;
  invested: number;
  currentValue: number;
}

export interface Portfolio {
  id: string;
  userId: string;
  assessmentId: string;
  uploadType: UploadType;
  createdAt: Date;
  rows: PortfolioRow[];
}
