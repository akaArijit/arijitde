export type ScoreTag = 'ALIGNED' | 'MODERATE' | 'NEEDS_REVIEW' | 'NEEDS_STRUCTURING';

export interface ScoreInsight {
  dimension: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

export interface Score {
  id: string;
  portfolioId: string;
  total: number;
  goalAlignment: number;
  assetAlloc: number;
  diversification: number;
  discipline: number;
  efficiency: number;
  tag: ScoreTag;
  insights: ScoreInsight[];
  createdAt: Date;
}

export interface MLResult {
  isAnomaly: boolean;
  anomalyScore: number;
  flags: string[];
}
