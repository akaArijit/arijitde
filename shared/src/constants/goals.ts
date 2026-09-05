import type {
  Goal,
  AgeRange,
  LifeStage,
  InvestmentTenure,
  InvestmentStyle,
  ExpectedReturn,
  RiskBehavior,
} from '../types/assessment';

// ──── Goal Config ────

export const GOAL_LABELS: Record<Goal, string> = {
  WEALTH_CREATION: 'Wealth Creation',
  RETIREMENT: 'Retirement Planning',
  HOUSE_PURCHASE: 'House Purchase',
  CHILD_EDUCATION: 'Child Education',
  MARRIAGE: 'Marriage',
  PASSIVE_INCOME: 'Passive Income',
  TAX_SAVING: 'Tax Saving',
  NOT_SURE_YET: 'Not Sure Yet',
  // Legacy
  SHORT_TERM: 'Short-term Goal (1-3 years)',
  LONG_TERM: 'Long-term Goal (5+ years)',
  EXPLORING: 'Just Exploring',
};

export const GOAL_HORIZONS_MONTHS: Record<Goal, number> = {
  WEALTH_CREATION: 120,
  RETIREMENT: 240,
  HOUSE_PURCHASE: 60,
  CHILD_EDUCATION: 120,
  MARRIAGE: 36,
  PASSIVE_INCOME: 60,
  TAX_SAVING: 12,
  NOT_SURE_YET: 36,
  // Legacy
  SHORT_TERM: 24,
  LONG_TERM: 60,
  EXPLORING: 36,
};

export const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: 'WEALTH_CREATION', label: 'Wealth Creation' },
  { value: 'RETIREMENT', label: 'Retirement Planning' },
  { value: 'HOUSE_PURCHASE', label: 'House Purchase' },
  { value: 'CHILD_EDUCATION', label: 'Child Education' },
  { value: 'MARRIAGE', label: 'Marriage' },
  { value: 'PASSIVE_INCOME', label: 'Passive Income' },
  { value: 'TAX_SAVING', label: 'Tax Saving' },
  { value: 'NOT_SURE_YET', label: 'Not Sure Yet' },
];

// ──── Age Range Config ────

export const AGE_RANGE_OPTIONS: { value: AgeRange; label: string }[] = [
  { value: 'BELOW_25', label: 'Below 25' },
  { value: '25_35', label: '25–35' },
  { value: '36_45', label: '36–45' },
  { value: '46_60', label: '46–60' },
  { value: 'ABOVE_60', label: 'Above 60' },
];

/** Map age range to a representative numeric age for scoring */
export const AGE_RANGE_TO_NUMERIC: Record<AgeRange, number> = {
  BELOW_25: 22,
  '25_35': 30,
  '36_45': 40,
  '46_60': 53,
  ABOVE_60: 65,
};

// ──── Life Stage Config ────

export const LIFE_STAGE_OPTIONS: { value: LifeStage; label: string }[] = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'EARLY_CAREER', label: 'Early Career Professional' },
  { value: 'MID_CAREER', label: 'Mid-Career Professional' },
  { value: 'BUSINESS_OWNER', label: 'Business Owner' },
  {
    value: 'HIGH_LEVEL_PROFESSIONAL',
    label: 'High-Level Professional (10+ Years Experience)',
  },
  { value: 'RETIRED', label: 'Retired' },
];

// ──── Investment Tenure Config ────

export const INVESTMENT_TENURE_OPTIONS: {
  value: InvestmentTenure;
  label: string;
}[] = [
  { value: 'LESS_THAN_3_YEARS', label: 'Less than 3 Years' },
  { value: '3_TO_5_YEARS', label: '3–5 Years' },
  { value: '5_TO_10_YEARS', label: '5–10 Years' },
  { value: '10_TO_20_YEARS', label: '10–20 Years' },
  { value: 'MORE_THAN_20_YEARS', label: 'More than 20 Years' },
];

// ──── Investment Style Config ────

export const INVESTMENT_STYLE_OPTIONS: {
  value: InvestmentStyle;
  label: string;
}[] = [
  { value: 'REGULAR_MONTHLY_SIP', label: 'Regular Monthly SIP' },
  { value: 'OCCASIONAL_SIP', label: 'Occasional SIP' },
  { value: 'MOSTLY_LUMPSUM', label: 'Mostly Lumpsum' },
  { value: 'RARELY_INVEST', label: 'Rarely Invest' },
  { value: 'FIRST_TIME_INVESTOR', label: 'First-Time Investor' },
];

// ──── Expected Return Config ────

export const EXPECTED_RETURN_OPTIONS: {
  value: ExpectedReturn;
  label: string;
}[] = [
  { value: '6_TO_8', label: '6–8%' },
  { value: '8_TO_12', label: '8–12%' },
  { value: '12_TO_15', label: '12–15%' },
  { value: '15_PLUS', label: '15%+' },
  { value: 'NOT_SURE', label: 'Not Sure' },
];

// ──── Risk Behavior Config ────

export const RISK_BEHAVIOR_OPTIONS: { value: RiskBehavior; label: string }[] = [
  { value: 'SELL_EVERYTHING', label: 'Sell everything' },
  { value: 'STOP_INVESTING', label: 'Stop investing temporarily' },
  { value: 'WAIT_PATIENTLY', label: 'Wait patiently' },
  { value: 'INVEST_MORE', label: 'Invest more' },
  {
    value: 'REVIEW_FUNDAMENTALS',
    label: 'Review and decide based on fundamentals',
  },
];
