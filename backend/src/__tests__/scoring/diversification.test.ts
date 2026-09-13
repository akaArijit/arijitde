import { describe, it, expect } from 'vitest';
import { scoreDimension } from '../../services/scoring/diversification';
import { Goal, FundType } from '@prisma/client';

describe('Diversification Scoring', () => {
  it('penalizes single fund portfolio and single AMC dominance', () => {
    const rows = [
      {
        id: '1',
        portfolioId: 'p1',
        fundName: 'HDFC Top 100 Growth',
        type: FundType.SIP,
        startDate: new Date('2022-01-01'),
        sipAmount: 5000,
        invested: 100000,
        currentValue: 120000,
      },
    ];

    const res = scoreDimension(rows, { age: 30, goal: Goal.WEALTH_CREATION });
    expect(res.score).toBeLessThanOrEqual(10);
    expect(res.insights.some((i) => i.includes('High concentration'))).toBe(true);
  });

  it('detects category & AMC overlap', () => {
    const rows = [
      {
        id: '1',
        portfolioId: 'p1',
        fundName: 'ICICI Prudential Large Cap Fund',
        type: FundType.SIP,
        startDate: new Date('2022-01-01'),
        sipAmount: 2000,
        invested: 20000,
        currentValue: 25000,
      },
      {
        id: '2',
        portfolioId: 'p1',
        fundName: 'ICICI Prudential Bluechip Top 100 Fund',
        type: FundType.SIP,
        startDate: new Date('2022-01-01'),
        sipAmount: 2000,
        invested: 20000,
        currentValue: 25000,
      },
      {
        id: '3',
        portfolioId: 'p1',
        fundName: 'SBI Small Cap Fund',
        type: FundType.SIP,
        startDate: new Date('2022-01-01'),
        sipAmount: 2000,
        invested: 20000,
        currentValue: 25000,
      },
    ];

    const res = scoreDimension(rows, { age: 30, goal: Goal.WEALTH_CREATION });
    expect(res.insights.some((i) => i.includes('Overlap detected'))).toBe(true);
  });
});
