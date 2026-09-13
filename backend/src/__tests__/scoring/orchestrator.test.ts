import { describe, it, expect } from 'vitest';
import { calculateScore } from '../../services/scoring/index';
import { Goal, FundType, ScoreTag } from '@prisma/client';

describe('Scoring Orchestrator Clamping & Tagging', () => {
  it('correctly tags and scores empty portfolios with goal exploration tag', async () => {
    const res = await calculateScore([], {
      age: 25,
      goal: Goal.NOT_SURE_YET,
      emergencyFund: 'NO_EMERGENCY_FUND',
      lifeStage: 'STUDENT',
      investmentTenure: 'LESS_THAN_3_YEARS',
      monthlyInvestment: 'BELOW_1000',
    });

    expect(res.tag).toBe(ScoreTag.NEEDS_STRUCTURING);
    expect(res.total).toBeGreaterThanOrEqual(2);
    expect(res.total).toBeLessThanOrEqual(97);
    expect(res.insights.textInsights.length).toBeGreaterThanOrEqual(3);
  });

  it('clamps display score strictly between 2 and 97', async () => {
    const rows = [
      {
        id: '1',
        portfolioId: 'p1',
        fundName: 'HDFC Top 100',
        type: FundType.SIP,
        startDate: new Date('2020-01-01'),
        sipAmount: 5000,
        invested: 200000,
        currentValue: 350000,
      },
      {
        id: '2',
        portfolioId: 'p1',
        fundName: 'Parag Parikh Flexi Cap',
        type: FundType.SIP,
        startDate: new Date('2020-01-01'),
        sipAmount: 5000,
        invested: 200000,
        currentValue: 380000,
      },
      {
        id: '3',
        portfolioId: 'p1',
        fundName: 'SBI Small Cap Fund',
        type: FundType.SIP,
        startDate: new Date('2020-01-01'),
        sipAmount: 5000,
        invested: 200000,
        currentValue: 400000,
      },
      {
        id: '4',
        portfolioId: 'p1',
        fundName: 'HDFC Corporate Bond Fund',
        type: FundType.SIP,
        startDate: new Date('2020-01-01'),
        sipAmount: 5000,
        invested: 100000,
        currentValue: 120000,
      },
    ];

    const res = await calculateScore(rows, {
      age: 30,
      goal: Goal.WEALTH_CREATION,
      investmentTenure: 'MORE_THAN_20_YEARS',
      emergencyFund: 'YES_MORE_THAN_6_MONTHS',
      lifeStage: 'EARLY_CAREER',
      monthlyInvestment: '15000_PLUS',
    });

    expect(res.total).toBeGreaterThanOrEqual(2);
    expect(res.total).toBeLessThanOrEqual(97);
    expect(res.tag).toBe(ScoreTag.ALIGNED);
  });
});
