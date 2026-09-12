export type ScoreTag =
  'ALIGNED' | 'MODERATE' | 'NEEDS_REVIEW' | 'NEEDS_STRUCTURING';

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

export interface ScoreResult {
  total: number;
  goalAlignment: number;
  assetAlloc: number;
  diversification: number;
  discipline: number;
  efficiency: number;
  tag: ScoreTag;
  insights: {
    textInsights: string[];
    comparison: {
      currentXirr: number;
      achievableXirr: number;
      totalGap: number;
      totalCurrentProfit: number;
      totalAchievableProfit: number;
      funds: Array<{
        fundName: string;
        category: string;
        invested: number;
        currentReturn: number;
        bestReturn: number;
        currentProfit: number;
        achievableProfit: number;
        gap: number;
        tenureReturn: number;
      }>;
    };
  };
}

export interface MLResult {
  isAnomaly: boolean;
  anomalyScore: number;
  flags: string[];
}
