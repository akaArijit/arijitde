import { describe, it, expect } from 'vitest';
import { scoreDimension } from '../../services/scoring/assetAllocation';
import { Goal, FundType } from '@prisma/client';

describe('Asset Allocation Scoring', () => {
  it('awards high score for age-appropriate equity allocation and category diversity', () => {
    const rows = [
      {
        id: '1',
        portfolioId: 'p1',
        fundName: 'HDFC Top 100 Large Cap',
        type: FundType.SIP,
        startDate: new Date('2022-01-01'),
        sipAmount: 5000,
        invested: 50000,
        currentValue: 60000,
      },
      {
        id: '2',
        portfolioId: 'p1',
        fundName: 'Kotak Midcap Fund',
        type: FundType.SIP,
        startDate: new Date('2022-01-01'),
        sipAmount: 5000,
        invested: 50000,
        currentValue: 60000,
      },
      {
        id: '3',
        portfolioId: 'p1',
        fundName: 'Parag Parikh Flexi Cap Fund',
        type: FundType.SIP,
        startDate: new Date('2022-01-01'),
        sipAmount: 5000,
        invested: 50000,
        currentValue: 60000,
      },
      {
        id: '4',
        portfolioId: 'p1',
        fundName: 'SBI Short Term Debt Fund',
        type: FundType.LUMPSUM,
        startDate: new Date('2022-01-01'),
        sipAmount: 0,
        invested: 20000,
        currentValue: 20000,
      },
    ];

    const assessment = {
      age: 28, // <30 recommended equity: 70-90%
      goal: Goal.WEALTH_CREATION,
    };

    const res = scoreDimension(rows, assessment);
    expect(res.score).toBeGreaterThanOrEqual(16);
  });

  it('handles empty portfolio gracefully', () => {
    const res = scoreDimension([], { age: 30, goal: Goal.WEALTH_CREATION });
    expect(res.score).toBe(0);
    expect(res.insights).toContain('Asset Allocation: No portfolio value recorded');
  });
});
