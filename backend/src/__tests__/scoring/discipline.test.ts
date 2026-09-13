import { describe, it, expect } from 'vitest';
import { scoreDimension } from '../../services/scoring/discipline';
import { Goal, FundType } from '@prisma/client';

describe('Discipline Scoring', () => {
  it('awards full points for high SIP ratio and regular investments', () => {
    const rows = [
      {
        id: '1',
        portfolioId: 'p1',
        fundName: 'HDFC Top 100',
        type: FundType.SIP,
        startDate: new Date('2022-01-01'),
        sipAmount: 2500,
        invested: 50000,
        currentValue: 60000,
      },
      {
        id: '2',
        portfolioId: 'p1',
        fundName: 'SBI Small Cap',
        type: FundType.SIP,
        startDate: new Date('2022-01-01'),
        sipAmount: 2500,
        invested: 50000,
        currentValue: 60000,
      },
    ];

    const res = scoreDimension(rows, { age: 30, goal: Goal.WEALTH_CREATION });
    expect(res.score).toBe(20);
  });

  it('deducts points for lumpsum-only portfolio without SIP', () => {
    const rows = [
      {
        id: '1',
        portfolioId: 'p1',
        fundName: 'HDFC Top 100',
        type: FundType.LUMPSUM,
        startDate: new Date('2022-01-01'),
        sipAmount: 0,
        invested: 50000,
        currentValue: 60000,
      },
      {
        id: '2',
        portfolioId: 'p1',
        fundName: 'SBI Small Cap',
        type: FundType.LUMPSUM,
        startDate: new Date('2022-01-01'),
        sipAmount: 0,
        invested: 50000,
        currentValue: 60000,
      },
    ];

    const res = scoreDimension(rows, { age: 30, goal: Goal.WEALTH_CREATION });
    expect(res.score).toBeLessThanOrEqual(12);
    expect(res.insights.some((i) => i.includes('No SIP investments found'))).toBe(true);
  });
});
