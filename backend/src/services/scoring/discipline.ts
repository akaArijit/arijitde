import { PortfolioRow, Goal } from '@prisma/client';
import type { AssessmentContext } from './index';

export function scoreDimension(
  rows: PortfolioRow[],
  assessment: AssessmentContext,
): { score: number; insights: string[] } {
  let score = 20;
  const insights: string[] = [];

  const fundCount = rows.length;
  if (fundCount === 0) {
    return { score: 0, insights: ['Discipline: No funds in portfolio'] };
  }

  const sipRows = rows.filter((r) => r.type === 'SIP');
  const sipCount = sipRows.length;

  if (sipCount === 0) {
    score -= 8;
    insights.push(
      'Discipline: No SIP investments found — systematic investing is highly recommended for building long-term wealth',
    );
  } else if (sipCount / fundCount < 0.5) {
    score -= 4;
    insights.push(
      `Discipline: Low SIP ratio — Only ${((sipCount / fundCount) * 100).toFixed(0)}% of your funds are systematic (SIP). Aim for at least 50%`,
    );
  }

  // Any SIP amount < 500
  const lowSipRow = sipRows.find((r) => r.sipAmount < 500);
  if (lowSipRow) {
    score -= 4;
    insights.push(
      `Discipline: Small SIP amount — ${lowSipRow.fundName} has a monthly SIP of ₹${lowSipRow.sipAmount} (recommended minimum ₹500)`,
    );
  }

  if (fundCount === 1) {
    score -= 4;
    insights.push(
      'Discipline: Single fund portfolio — Lack of asset and manager diversification exposes you to higher manager risk',
    );
  }

  return { score: Math.max(0, score), insights };
}
