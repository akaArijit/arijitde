import { ScoreTag } from '../types/scoring';

export const SCORE_THRESHOLDS = {
  ALIGNED: 75,
  MODERATE: 60,
};

export const SCORE_TAG_LABELS: Record<ScoreTag, string> = {
  ALIGNED: 'Aligned',
  MODERATE: 'Moderate — Can Improve',
  NEEDS_REVIEW: 'Needs Review',
  NEEDS_STRUCTURING: 'Needs Structuring',
};

export const SCORE_TAG_COLORS: Record<ScoreTag, string> = {
  ALIGNED: '#16A34A',
  MODERATE: '#D97706',
  NEEDS_REVIEW: '#DC2626',
  NEEDS_STRUCTURING: '#1D4ED8',
};

export const DIMENSION_WEIGHTS = {
  goalAlignment: 20,
  assetAlloc: 20,
  diversification: 20,
  discipline: 20,
  efficiency: 20,
};

export const EQUITY_BENCHMARKS = [
  { minAge: 0, maxAge: 29, minEquity: 70, maxEquity: 90, label: 'under 30' },
  { minAge: 30, maxAge: 40, minEquity: 60, maxEquity: 75, label: '30-40' },
  { minAge: 41, maxAge: 120, minEquity: 0, maxEquity: 60, label: '40+' },
];
