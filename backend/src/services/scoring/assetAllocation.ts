import { PortfolioRow, Goal } from '@prisma/client';
import type { AssessmentContext, DimensionResult } from './index';
import {
  detectFundCategory,
  isEquityCategory,
  isDebtCategory,
} from '../amfiService';

/**
 * Asset Allocation Matrix (max 20 pts)
 *
 * 1. Age-based equity/debt allocation alignment → +10
 * 2. Category spread bonus                      → +10
 */

/** Age-based recommended equity % ranges */
function getRecommendedEquityRange(age: number): {
  min: number;
  max: number;
  label: string;
} {
  if (age < 30) return { min: 70, max: 90, label: 'Below 30' };
  if (age < 40) return { min: 60, max: 80, label: '30–39' };
  if (age < 50) return { min: 50, max: 65, label: '40–49' };
  if (age < 60) return { min: 30, max: 50, label: '50–59' };
  return { min: 20, max: 40, label: '60+' };
}

export function scoreDimension(
  rows: PortfolioRow[],
  assessment: AssessmentContext,
): DimensionResult {
  let score = 0;
  const insights: string[] = [];

  const totalValue = rows.reduce((sum, r) => sum + r.currentValue, 0);
  if (totalValue <= 0) {
    return {
      score: 0,
      insights: ['Asset Allocation: No portfolio value recorded'],
    };
  }

  // Classify each fund into category
  const fundCategories = rows.map((r) => ({
    row: r,
    category: detectFundCategory(r.fundName),
  }));

  // Calculate equity vs debt allocation
  let equityValue = 0;
  let debtValue = 0;
  let balancedValue = 0;

  for (const fc of fundCategories) {
    if (isEquityCategory(fc.category)) {
      equityValue += fc.row.currentValue;
    } else if (isDebtCategory(fc.category)) {
      debtValue += fc.row.currentValue;
    } else if (fc.category === 'balanced') {
      // Balanced/hybrid funds: split 60/40 equity/debt
      equityValue += fc.row.currentValue * 0.6;
      debtValue += fc.row.currentValue * 0.4;
      balancedValue += fc.row.currentValue;
    } else {
      equityValue += fc.row.currentValue; // Default to equity
    }
  }

  const equityPercent = (equityValue / totalValue) * 100;
  const debtPercent = (debtValue / totalValue) * 100;

  // ── 1. Age-Based Allocation Alignment (+10) ──
  const recommended = getRecommendedEquityRange(assessment.age);
  const deviation =
    equityPercent < recommended.min
      ? recommended.min - equityPercent
      : equityPercent > recommended.max
        ? equityPercent - recommended.max
        : 0;

  if (deviation === 0) {
    score += 10;
  } else if (deviation <= 10) {
    score += 6;
    insights.push(
      `Asset Allocation: Equity exposure (${equityPercent.toFixed(0)}%) is slightly outside the ${recommended.min}–${recommended.max}% range recommended for age ${recommended.label}`,
    );
  } else if (deviation <= 20) {
    score += 3;
    insights.push(
      `Asset Allocation: Equity exposure (${equityPercent.toFixed(0)}%) deviates significantly from the ${recommended.min}–${recommended.max}% target for age ${recommended.label}`,
    );
  } else {
    score += 0;
    insights.push(
      `Asset Allocation: Equity exposure (${equityPercent.toFixed(0)}%) is far from the recommended ${recommended.min}–${recommended.max}% for age ${recommended.label} — rebalancing strongly advised`,
    );
  }

  // ── 2. Category Spread Bonus (+10) ──
  const distinctCategories = new Set(fundCategories.map((fc) => fc.category));

  let spreadScore = 0;

  // Has Large Cap + Mid Cap → +3
  if (
    distinctCategories.has('large_cap') &&
    distinctCategories.has('mid_cap')
  ) {
    spreadScore += 3;
  } else if (
    distinctCategories.has('large_cap') ||
    distinctCategories.has('mid_cap')
  ) {
    spreadScore += 1;
  }

  // Has Flexi/Multi Cap → +3
  if (
    distinctCategories.has('flexi_cap') ||
    distinctCategories.has('multi_cap')
  ) {
    spreadScore += 3;
  } else if (distinctCategories.has('index')) {
    spreadScore += 2; // Index funds are a decent alternative
  }

  // Has Debt/Hybrid → +2
  if (
    distinctCategories.has('debt') ||
    distinctCategories.has('balanced') ||
    distinctCategories.has('liquid')
  ) {
    spreadScore += 2;
  }

  // Has ELSS (bonus for Tax Saving goal) → +2
  if (distinctCategories.has('elss')) {
    if (assessment.goal === Goal.TAX_SAVING) {
      spreadScore += 2;
    } else {
      spreadScore += 1; // ELSS is fine but not specifically for this goal
    }
  }

  spreadScore = Math.min(10, spreadScore);
  score += spreadScore;

  if (distinctCategories.size <= 1) {
    insights.push(
      'Asset Allocation: Portfolio has very limited category spread — consider diversifying across Large Cap, Mid Cap, Flexi Cap, and Debt',
    );
  } else if (distinctCategories.size === 2) {
    insights.push(
      'Asset Allocation: Portfolio covers only 2 fund categories — adding more variety would improve risk-adjusted returns',
    );
  }

  // Extra insight for no debt
  if (debtPercent === 0 && assessment.age >= 35) {
    insights.push(
      'Asset Allocation: No debt exposure — consider adding debt/hybrid funds for portfolio stability',
    );
  }

  return { score: Math.min(20, Math.max(0, score)), insights };
}
