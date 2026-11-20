import { PortfolioRow, Goal, ScoreTag } from '@prisma/client';
import { scoreDimension as scoreGoalAlignment } from './goalAlignment';
import { scoreDimension as scoreAssetAllocation } from './assetAllocation';
import { scoreDimension as scoreDiversification } from './diversification';
import { scoreDimension as scoreDiscipline } from './discipline';
import { scoreDimension as scoreEfficiency } from './efficiency';
import { SCORING_CONSTANTS } from './constants';

export interface AssessmentContext {
  age: number;
  goal: Goal | null;
  ageRange?: string | null;
  lifeStage?: string | null;
  investmentTenure?: string | null;
  isCompletePortfolio?: boolean | null;
  investmentStyle?: string | null;
  expectedReturn?: string | null;
  riskBehavior?: string | null;
  monthlyInvestment?: string | null;
  emergencyFund?: string | null;
  requestId?: string;
}

export interface DimensionResult {
  score: number;
  insights: string[];
}

export interface ScoreResult {
  total: number;
  goalAlignment: number;
  assetAlloc: number;
  diversification: number;
  discipline: number;
  efficiency: number;
  tag: ScoreTag;
  insights: any;
}

/**
 * Main scoring orchestrator.
 * Each dimension scores 0–20. Total 0–100.
 * Display clamped to 2–97.
 */
export async function calculateScore(
  rows: PortfolioRow[],
  assessment: AssessmentContext,
): Promise<ScoreResult> {
  if (rows.length === 0) {
    const goalResult = scoreGoalAlignment(rows, assessment);
    const qScore = goalResult.score;
    const scaledTotal = Math.min(
      SCORING_CONSTANTS.MAX_DISPLAY_SCORE,
      Math.max(SCORING_CONSTANTS.MIN_DISPLAY_SCORE, qScore * SCORING_CONSTANTS.EMPTY_PORTFOLIO_MULTIPLIER),
    );

    let tag: ScoreTag;
    if (
      !assessment.goal ||
      SCORING_CONSTANTS.SPECIAL_GOALS.includes(assessment.goal)
    ) {
      tag = ScoreTag.NEEDS_STRUCTURING;
    } else if (scaledTotal >= SCORING_CONSTANTS.TAG_THRESHOLDS.ALIGNED) {
      tag = ScoreTag.ALIGNED;
    } else if (scaledTotal >= SCORING_CONSTANTS.TAG_THRESHOLDS.MODERATE) {
      tag = ScoreTag.MODERATE;
    } else {
      tag = ScoreTag.NEEDS_REVIEW;
    }

    const selectedInsights = [...goalResult.insights];
    const generalInsights = SCORING_CONSTANTS.GENERAL_INSIGHTS;
    let padIdx = 0;
    while (selectedInsights.length < SCORING_CONSTANTS.MIN_INSIGHTS) {
      selectedInsights.push(
        generalInsights[padIdx++] ||
          'Portfolio: Stay invested for the long-term to beat inflation',
      );
    }

    return {
      total: scaledTotal,
      goalAlignment: qScore,
      assetAlloc: qScore,
      diversification: qScore,
      discipline: qScore,
      efficiency: qScore,
      tag,
      insights: {
        textInsights: selectedInsights.slice(0, SCORING_CONSTANTS.MAX_INSIGHTS),
        comparison: null,
      },
    };
  }

  // Run all dimensions (efficiency is async due to AMFI API calls)
  const [goalResult, assetResult, divResult, discResult, effResult] =
    await Promise.all([
      Promise.resolve(scoreGoalAlignment(rows, assessment)),
      Promise.resolve(scoreAssetAllocation(rows, assessment)),
      Promise.resolve(scoreDiversification(rows, assessment)),
      Promise.resolve(scoreDiscipline(rows, assessment)),
      scoreEfficiency(rows, assessment),
    ]);

  const rawTotal =
    goalResult.score +
    assetResult.score +
    divResult.score +
    discResult.score +
    effResult.score;

  // Clamp display score: min 2, max 97
  const total = Math.min(
    SCORING_CONSTANTS.MAX_DISPLAY_SCORE,
    Math.max(SCORING_CONSTANTS.MIN_DISPLAY_SCORE, rawTotal),
  );

  // Determine Tag
  let tag: ScoreTag;
  if (
    !assessment.goal ||
    SCORING_CONSTANTS.SPECIAL_GOALS.includes(assessment.goal)
  ) {
    tag = ScoreTag.NEEDS_STRUCTURING;
  } else if (total >= SCORING_CONSTANTS.TAG_THRESHOLDS.ALIGNED) {
    tag = ScoreTag.ALIGNED;
  } else if (total >= SCORING_CONSTANTS.TAG_THRESHOLDS.MODERATE) {
    tag = ScoreTag.MODERATE;
  } else {
    tag = ScoreTag.NEEDS_REVIEW;
  }

  // Collect all insights from all dimensions, prioritize by dimension score (worst first)
  const dimensions = SCORING_CONSTANTS.DIMENSIONS.map((dim, index) => {
    const result = [goalResult, assetResult, divResult, discResult, effResult][index];
    return {
      name: dim.name,
      score: result.score,
      maxScore: dim.maxScore,
      insights: result.insights,
    };
  });

  // Sort by score ascending (worst-scoring dimensions first)
  dimensions.sort((a, b) => a.score - b.score);

  const selectedInsights: string[] = [];
  for (const dim of dimensions) {
    for (const insight of dim.insights) {
      selectedInsights.push(insight);
      if (selectedInsights.length === SCORING_CONSTANTS.MAX_INSIGHTS) break;
    }
    if (selectedInsights.length === SCORING_CONSTANTS.MAX_INSIGHTS) break;
  }

  // Pad to at least 3 insights
  const generalInsights = SCORING_CONSTANTS.GENERAL_INSIGHTS;
  let padIdx = 0;
  while (selectedInsights.length < SCORING_CONSTANTS.MIN_INSIGHTS) {
    selectedInsights.push(
      generalInsights[padIdx++] ||
        'Portfolio: Stay invested for the long-term to beat inflation',
    );
  }

  return {
    total,
    goalAlignment: goalResult.score,
    assetAlloc: assetResult.score,
    diversification: divResult.score,
    discipline: discResult.score,
    efficiency: effResult.score,
    tag,
    insights: {
      textInsights: selectedInsights,
      comparison: (effResult as any).comparison || null,
    },
  };
}

export { SCORING_CONSTANTS } from './constants';