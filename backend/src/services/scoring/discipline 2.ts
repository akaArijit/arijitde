import { PortfolioRow, Goal } from '@prisma/client';
import type { AssessmentContext, DimensionResult } from './index';

/**
 * Discipline Matrix (max 20 pts)
 *
 * 1. SIP presence             → +5
 * 2. SIP consistency ratio    → +4
 * 3. Adequate SIP amount      → +3
 * 4. Emergency fund discipline→ +4
 * 5. Investment tenure maturity→+4
 */

export function scoreDimension(
  rows: PortfolioRow[],
  assessment: AssessmentContext,
): DimensionResult {
  let score = 0;
  const insights: string[] = [];

  const fundCount = rows.length;
  if (fundCount === 0) {
    return { score: 0, insights: ['Discipline: No funds in portfolio'] };
  }

  const sipRows = rows.filter((r) => r.type === 'SIP');
  const sipCount = sipRows.length;
  const sipRatio = sipCount / fundCount;

  // ── 1. SIP Presence (+5) ──
  if (sipCount >= 1) {
    score += 5;
  } else {
    insights.push(
      'Discipline: No SIP investments found — systematic investing is highly recommended for building long-term wealth',
    );
  }

  // ── 2. SIP Consistency Ratio (+4) ──
  if (sipRatio >= 0.5) {
    score += 4;
  } else if (sipRatio >= 0.3) {
    score += 2;
    insights.push(
      `Discipline: SIP ratio is ${(sipRatio * 100).toFixed(0)}% — aim for at least 50% of your funds as SIPs for consistent growth`,
    );
  } else if (sipCount > 0) {
    score += 1;
    insights.push(
      `Discipline: Only ${(sipRatio * 100).toFixed(0)}% of your funds are systematic (SIP) — consider converting more investments to SIP mode`,
    );
  }

  // ── 3. Adequate SIP Amount (+3) ──
  if (sipCount > 0) {
    const lowSipRows = sipRows.filter((r) => r.sipAmount < 500);
    if (lowSipRows.length === 0) {
      score += 3;
    } else {
      score += 1;
      const worstSip = lowSipRows.reduce(
        (min, r) => (r.sipAmount < min.sipAmount ? r : min),
        lowSipRows[0]!,
      );
      insights.push(
        `Discipline: ${worstSip.fundName} has a monthly SIP of only ₹${worstSip.sipAmount.toLocaleString('en-IN')} — ₹500+ per SIP recommended`,
      );
    }
  }

  // ── 4. Emergency Fund Discipline (+4) ──
  const ef = assessment.emergencyFund;
  if (ef === 'YES_MORE_THAN_6_MONTHS') {
    score += 4;
  } else if (ef === 'YES_3_TO_6_MONTHS') {
    score += 3;
  } else if (ef === 'YES_LESS_THAN_3_MONTHS') {
    score += 1;
    insights.push(
      'Discipline: Emergency fund is less than 3 months — build it up before increasing market exposure',
    );
  } else {
    // NO_EMERGENCY_FUND or null
    insights.push(
      'Discipline: No emergency fund — this increases the risk of premature portfolio redemption during emergencies',
    );
  }

  // ── 5. Investment Tenure Maturity (+4) ──
  let totalTenure = 0;
  for (const row of rows) {
    const tenureInMs = Date.now() - new Date(row.startDate).getTime();
    const tenureInYears = Math.max(
      0,
      tenureInMs / (365.25 * 24 * 60 * 60 * 1000),
    );
    totalTenure += tenureInYears;
  }
  const avgTenure = totalTenure / fundCount;

  if (avgTenure >= 3) {
    score += 4;
  } else if (avgTenure >= 1) {
    score += 2;
    insights.push(
      `Discipline: Average investment tenure is ${avgTenure.toFixed(1)} years — staying invested for 3+ years is ideal for compounding`,
    );
  } else {
    score += 1;
    insights.push(
      `Discipline: Portfolio is very new (avg tenure ${avgTenure.toFixed(1)} years) — give your investments time to grow`,
    );
  }

  return { score: Math.min(20, Math.max(0, score)), insights };
}
