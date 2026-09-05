import { PortfolioRow, Goal } from '@prisma/client';
import type { AssessmentContext, DimensionResult } from './index';
import { detectFundCategory, detectAMC } from '../amfiService';

/**
 * Diversification Matrix (max 20 pts)
 *
 * 1. Fund count          → +5
 * 2. Category spread     → +5
 * 3. AMC concentration   → +4
 * 4. Single fund dominance → +3
 * 5. Overlap check       → +3
 */

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
      insights: ['Diversification: No portfolio value recorded'],
    };
  }

  const fundCount = rows.length;

  // Pre-compute categories and AMCs
  const fundData = rows.map((r) => ({
    row: r,
    category: detectFundCategory(r.fundName),
    amc: detectAMC(r.fundName),
  }));

  const distinctCategories = new Set(fundData.map((f) => f.category));
  const distinctAMCs = new Set(fundData.map((f) => f.amc));

  // ── 1. Fund Count (+5) ──
  if (fundCount >= 3 && fundCount <= 8) {
    score += 5;
  } else if (fundCount >= 9 && fundCount <= 12) {
    score += 3;
    insights.push(
      `Diversification: ${fundCount} funds in portfolio — 3-8 funds is optimal to avoid dilution`,
    );
  } else if (fundCount === 1 || fundCount === 2) {
    score += 2;
    insights.push(
      `Diversification: Only ${fundCount} fund(s) — consider adding more for better risk distribution`,
    );
  } else {
    // > 12
    score += 1;
    insights.push(
      `Diversification: Over-diversified with ${fundCount} funds — too many funds can dilute returns. Consolidate to 5-8 quality funds`,
    );
  }

  // ── 2. Category Spread (+5) ──
  const catCount = distinctCategories.size;
  if (catCount >= 3) {
    score += 5;
  } else if (catCount === 2) {
    score += 3;
    insights.push(
      'Diversification: Portfolio covers only 2 fund categories — adding a third category improves risk-adjusted returns',
    );
  } else {
    score += 1;
    insights.push(
      'Diversification: All funds are in the same category — high concentration risk. Diversify across Large Cap, Mid Cap, Debt, etc.',
    );
  }

  // ── 3. AMC Concentration (+4) ──
  // Check if any single AMC > 40% of AUM
  const amcAUM = new Map<string, number>();
  for (const fd of fundData) {
    amcAUM.set(fd.amc, (amcAUM.get(fd.amc) || 0) + fd.row.currentValue);
  }

  let maxAmcPercent = 0;
  let maxAmcName = '';
  for (const [amc, value] of amcAUM) {
    const pct = (value / totalValue) * 100;
    if (pct > maxAmcPercent) {
      maxAmcPercent = pct;
      maxAmcName = amc;
    }
  }

  if (maxAmcPercent <= 40) {
    score += 4;
  } else {
    score += 1;
    insights.push(
      `Diversification: ${maxAmcName} accounts for ${maxAmcPercent.toFixed(0)}% of your portfolio — limit any single AMC to 40% to reduce fund house risk`,
    );
  }

  // ── 4. Single Fund Dominance (+3) ──
  const maxFundRow = rows.reduce(
    (max, r) => (r.currentValue > max.currentValue ? r : max),
    rows[0]!,
  );
  const maxFundPercent = (maxFundRow.currentValue / totalValue) * 100;

  if (maxFundPercent <= 35) {
    score += 3;
  } else if (maxFundPercent <= 50) {
    score += 1;
    insights.push(
      `Diversification: ${maxFundRow.fundName} makes up ${maxFundPercent.toFixed(0)}% of your portfolio — limit any single fund to 35%`,
    );
  } else {
    score += 0;
    insights.push(
      `Diversification: High concentration — ${maxFundRow.fundName} represents ${maxFundPercent.toFixed(0)}% of total portfolio value`,
    );
  }

  // ── 5. Overlap Check (+3) ──
  // Check for two funds in the same sub-category from the same AMC
  const categoryAmcCombos = new Map<string, string[]>();
  for (const fd of fundData) {
    const key = `${fd.category}|${fd.amc}`;
    const existing = categoryAmcCombos.get(key) || [];
    existing.push(fd.row.fundName);
    categoryAmcCombos.set(key, existing);
  }

  let hasOverlap = false;
  for (const [combo, funds] of categoryAmcCombos) {
    if (funds.length > 1) {
      hasOverlap = true;
      const [cat, amc] = combo.split('|');
      insights.push(
        `Diversification: Overlap detected — ${funds.length} ${amc} funds in the same ${cat?.replace(/_/g, ' ')} category (${funds.join(', ')})`,
      );
      break; // Only report first overlap
    }
  }

  if (!hasOverlap) {
    score += 3;
  } else {
    score += 1;
  }

  return { score: Math.min(20, Math.max(0, score)), insights };
}
