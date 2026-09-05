import { PortfolioRow, Goal } from '@prisma/client';
import type { AssessmentContext, DimensionResult } from './index';

/**
 * Goal Alignment — Investor Profiling Matrix (max 20 pts)
 *
 * 1. Goal defined                    → +4
 * 2. Goal + Tenure match             → +4
 * 3. Life stage + Goal coherence     → +4
 * 4. Monthly investment adequacy     → +4
 * 5. Emergency fund readiness        → +4
 */

/** Goals that map to short-term behavior (< 5 years) */
const SHORT_TERM_GOALS: Goal[] = [
  Goal.SHORT_TERM,
  Goal.MARRIAGE,
  Goal.TAX_SAVING,
];

/** Goals that map to long-term behavior (5+ years) */
const LONG_TERM_GOALS: Goal[] = [
  Goal.LONG_TERM,
  Goal.WEALTH_CREATION,
  Goal.RETIREMENT,
  Goal.CHILD_EDUCATION,
  Goal.HOUSE_PURCHASE,
  Goal.PASSIVE_INCOME,
];

/** Life stage → naturally aligned goals mapping */
const LIFE_STAGE_GOAL_ALIGNMENT: Record<string, Goal[]> = {
  STUDENT: [Goal.WEALTH_CREATION, Goal.TAX_SAVING],
  EARLY_CAREER: [
    Goal.WEALTH_CREATION,
    Goal.HOUSE_PURCHASE,
    Goal.TAX_SAVING,
    Goal.MARRIAGE,
  ],
  MID_CAREER: [
    Goal.WEALTH_CREATION,
    Goal.CHILD_EDUCATION,
    Goal.HOUSE_PURCHASE,
    Goal.RETIREMENT,
    Goal.TAX_SAVING,
  ],
  BUSINESS_OWNER: [
    Goal.WEALTH_CREATION,
    Goal.TAX_SAVING,
    Goal.RETIREMENT,
    Goal.PASSIVE_INCOME,
  ],
  HIGH_LEVEL_PROFESSIONAL: [
    Goal.WEALTH_CREATION,
    Goal.RETIREMENT,
    Goal.PASSIVE_INCOME,
    Goal.CHILD_EDUCATION,
  ],
  RETIRED: [Goal.PASSIVE_INCOME, Goal.RETIREMENT],
};

/** Investment tenure string → approximate years */
function tenureToYears(tenure: string | null | undefined): number {
  if (!tenure) return 0;
  switch (tenure) {
    case 'LESS_THAN_3_YEARS':
      return 2;
    case '3_TO_5_YEARS':
      return 4;
    case '5_TO_10_YEARS':
      return 7;
    case '10_TO_20_YEARS':
      return 15;
    case 'MORE_THAN_20_YEARS':
      return 25;
    default:
      return 0;
  }
}

/** Monthly investment string → approximate amount */
function monthlyInvestmentToAmount(mi: string | null | undefined): number {
  if (!mi) return 0;
  switch (mi) {
    case 'NOT_INVESTING':
      return 0;
    case 'BELOW_1000':
      return 500;
    case '1500_2500':
      return 2000;
    case '3000_5000':
      return 4000;
    case '6000_10000':
      return 8000;
    case '15000_PLUS':
      return 15000;
    default:
      return 0;
  }
}

export function scoreDimension(
  rows: PortfolioRow[],
  assessment: AssessmentContext,
): DimensionResult {
  let score = 0;
  const insights: string[] = [];

  const hasNoGoal =
    !assessment.goal ||
    assessment.goal === Goal.EXPLORING ||
    assessment.goal === Goal.NOT_SURE_YET;

  // ── 1. Goal Defined (+4) ──
  if (hasNoGoal) {
    insights.push(
      'Goal Alignment: No specific investment goal defined — having a clear goal improves portfolio direction and discipline',
    );
  } else {
    score += 4;
  }

  // ── 2. Goal + Tenure Match (+4) ──
  if (!hasNoGoal) {
    const tenureYears = tenureToYears(assessment.investmentTenure);
    const isShortTermGoal = SHORT_TERM_GOALS.includes(assessment.goal!);
    const isLongTermGoal = LONG_TERM_GOALS.includes(assessment.goal!);

    if (
      (isLongTermGoal && tenureYears >= 5) ||
      (isShortTermGoal && tenureYears < 5)
    ) {
      score += 4;
    } else if (
      (isLongTermGoal && tenureYears >= 3) ||
      (isShortTermGoal && tenureYears < 7)
    ) {
      score += 2;
      insights.push(
        `Goal Alignment: Investment tenure (${assessment.investmentTenure?.replace(/_/g, ' ').toLowerCase() || 'unknown'}) is partially aligned with your ${isLongTermGoal ? 'long-term' : 'short-term'} goal — consider adjusting`,
      );
    } else {
      insights.push(
        `Goal Alignment: Tenure mismatch — Your ${isLongTermGoal ? 'long-term' : 'short-term'} goal requires a ${isLongTermGoal ? 'longer' : 'shorter'} investment horizon`,
      );
    }
  }

  // ── 3. Life Stage + Goal Coherence (+4) ──
  if (!hasNoGoal && assessment.lifeStage) {
    const alignedGoals = LIFE_STAGE_GOAL_ALIGNMENT[assessment.lifeStage] || [];
    if (alignedGoals.includes(assessment.goal!)) {
      score += 4;
    } else {
      score += 1;
      insights.push(
        `Goal Alignment: Your goal may not be optimally aligned with your current life stage (${assessment.lifeStage.replace(/_/g, ' ').toLowerCase()}) — consider reviewing`,
      );
    }
  } else if (!hasNoGoal) {
    // No life stage provided, give partial credit
    score += 2;
  }

  // ── 4. Monthly Investment Adequacy (+4) ──
  const monthlyAmt = monthlyInvestmentToAmount(assessment.monthlyInvestment);
  const isGrowthGoal =
    assessment.goal && LONG_TERM_GOALS.includes(assessment.goal);
  const isTaxGoal = assessment.goal === Goal.TAX_SAVING;

  if (isGrowthGoal) {
    if (monthlyAmt >= 3000) {
      score += 4;
    } else if (monthlyAmt >= 1500) {
      score += 2;
      insights.push(
        'Goal Alignment: Monthly investment is below ₹3,000 — consider increasing for growth-oriented goals',
      );
    } else {
      score += 0;
      insights.push(
        'Goal Alignment: Monthly investment is insufficient for wealth-building goals — ₹3,000+ recommended',
      );
    }
  } else if (isTaxGoal) {
    if (monthlyAmt >= 1500) {
      score += 4;
    } else if (monthlyAmt >= 500) {
      score += 2;
    } else {
      insights.push(
        'Goal Alignment: Monthly investment is very low for tax saving — ₹1,500+ recommended for ELSS',
      );
    }
  } else if (!hasNoGoal) {
    // Short-term / other goals
    if (monthlyAmt >= 1000) {
      score += 4;
    } else if (monthlyAmt > 0) {
      score += 2;
    } else {
      score += 1;
      insights.push(
        'Goal Alignment: Currently not investing monthly — systematic investing is recommended',
      );
    }
  }

  // ── 5. Emergency Fund Readiness (+4) ──
  const ef = assessment.emergencyFund;
  if (ef === 'YES_MORE_THAN_6_MONTHS') {
    score += 4;
  } else if (ef === 'YES_3_TO_6_MONTHS') {
    score += 3;
  } else if (ef === 'YES_LESS_THAN_3_MONTHS') {
    score += 1;
    insights.push(
      'Goal Alignment: Emergency fund covers less than 3 months — aim for at least 6 months of expenses',
    );
  } else {
    // NO_EMERGENCY_FUND or null
    insights.push(
      'Goal Alignment: No emergency fund — building one should be a priority before aggressive investing',
    );
  }

  return { score: Math.min(20, Math.max(0, score)), insights };
}
