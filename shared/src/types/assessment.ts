export type Goal =
  | 'WEALTH_CREATION'
  | 'RETIREMENT'
  | 'HOUSE_PURCHASE'
  | 'CHILD_EDUCATION'
  | 'MARRIAGE'
  | 'PASSIVE_INCOME'
  | 'TAX_SAVING'
  | 'NOT_SURE_YET'
  // Legacy values kept for backward compat
  | 'SHORT_TERM'
  | 'LONG_TERM'
  | 'EXPLORING';

export type AgeRange = 'BELOW_25' | '25_35' | '36_45' | '46_60' | 'ABOVE_60';

export type LifeStage =
  | 'STUDENT'
  | 'EARLY_CAREER'
  | 'MID_CAREER'
  | 'BUSINESS_OWNER'
  | 'HIGH_LEVEL_PROFESSIONAL'
  | 'RETIRED';

export type InvestmentTenure =
  | 'LESS_THAN_3_YEARS'
  | '3_TO_5_YEARS'
  | '5_TO_10_YEARS'
  | '10_TO_20_YEARS'
  | 'MORE_THAN_20_YEARS';

export type InvestmentStyle =
  | 'REGULAR_MONTHLY_SIP'
  | 'OCCASIONAL_SIP'
  | 'MOSTLY_LUMPSUM'
  | 'RARELY_INVEST'
  | 'FIRST_TIME_INVESTOR';

export type ExpectedReturn =
  | '6_TO_8'
  | '8_TO_12'
  | '12_TO_15'
  | '15_PLUS'
  | 'NOT_SURE';

export type RiskBehavior =
  | 'SELL_EVERYTHING'
  | 'STOP_INVESTING'
  | 'WAIT_PATIENTLY'
  | 'INVEST_MORE'
  | 'REVIEW_FUNDAMENTALS';

export interface Assessment {
  id: string;
  userId: string;
  age: number;
  goal: Goal;
  ageRange?: AgeRange | null;
  lifeStage?: LifeStage | null;
  investmentTenure?: InvestmentTenure | null;
  isCompletePortfolio?: boolean | null;
  investmentStyle?: InvestmentStyle | null;
  expectedReturn?: ExpectedReturn | null;
  riskBehavior?: RiskBehavior | null;
  createdAt: Date;
}
