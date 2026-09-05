import { PortfolioRow, Goal, ScoreTag } from '@prisma/client';
import { scoreDimension as scoreGoalAlignment } from './goalAlignment';
import { scoreDimension as scoreAssetAllocation } from './assetAllocation';
import { scoreDimension as scoreDiversification } from './diversification';
import { scoreDimension as scoreDiscipline } from './discipline';
import { scoreDimension as scoreEfficiency } from './efficiency';

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
    const scaledTotal = Math.min(97, Math.max(2, qScore * 5));

    let tag: ScoreTag;
    if (
      !assessment.goal ||
      assessment.goal === Goal.EXPLORING ||
      assessment.goal === Goal.NOT_SURE_YET
    ) {
      tag = ScoreTag.NEEDS_STRUCTURING;
    } else if (scaledTotal >= 75) {
      tag = ScoreTag.ALIGNED;
    } else if (scaledTotal >= 60) {
      tag = ScoreTag.MODERATE;
    } else {
      tag = ScoreTag.NEEDS_REVIEW;
    }

    const selectedInsights = [...goalResult.insights];
    const generalInsights = [
      'Portfolio: Review and rebalance your portfolio annually to maintain your target risk profile',
      'Portfolio: Maintain an emergency fund separate from your market-linked investments',
      'Portfolio: Review your investment goals periodically to account for any lifecycle changes',
    ];
    let padIdx = 0;
    while (selectedInsights.length < 3) {
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
        textInsights: selectedInsights.slice(0, 5),
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
  const total = Math.min(97, Math.max(2, rawTotal));

  // Determine Tag
  let tag: ScoreTag;
  if (
    !assessment.goal ||
    assessment.goal === Goal.EXPLORING ||
    assessment.goal === Goal.NOT_SURE_YET
  ) {
    tag = ScoreTag.NEEDS_STRUCTURING;
  } else if (total >= 75) {
    tag = ScoreTag.ALIGNED;
  } else if (total >= 60) {
    tag = ScoreTag.MODERATE;
  } else {
    tag = ScoreTag.NEEDS_REVIEW;
  }

  // Collect all insights from all dimensions, prioritize by dimension score (worst first)
  const dimensions = [
    {
      name: 'Goal Alignment',
      score: goalResult.score,
      maxScore: 20,
      insights: goalResult.insights,
    },
    {
      name: 'Asset Allocation',
      score: assetResult.score,
      maxScore: 20,
      insights: assetResult.insights,
    },
    {
      name: 'Diversification',
      score: divResult.score,
      maxScore: 20,
      insights: divResult.insights,
    },
    {
      name: 'Discipline',
      score: discResult.score,
      maxScore: 20,
      insights: discResult.insights,
    },
    {
      name: 'Efficiency',
      score: effResult.score,
      maxScore: 20,
      insights: effResult.insights,
    },
  ];

  // Sort by score ascending (worst-scoring dimensions first)
  dimensions.sort((a, b) => a.score - b.score);

  const selectedInsights: string[] = [];
  for (const dim of dimensions) {
    for (const insight of dim.insights) {
      selectedInsights.push(insight);
      if (selectedInsights.length === 5) break;
    }
    if (selectedInsights.length === 5) break;
  }

  // Pad to at least 3 insights
  const generalInsights = [
    'Portfolio: Review and rebalance your portfolio annually to maintain your target risk profile',
    'Portfolio: Maintain an emergency fund separate from your market-linked investments',
    'Portfolio: Review your investment goals periodically to account for any lifecycle changes',
  ];
  let padIdx = 0;
  while (selectedInsights.length < 3) {
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
