import { describe, it, expect } from 'vitest';
import { scoreDimension } from '../../services/scoring/goalAlignment';
import { Goal, FundType } from '@prisma/client';

describe('Goal Alignment Scoring', () => {
  const dummyRows = [
    {
      id: '1',
      portfolioId: 'p1',
      fundName: 'HDFC Top 100',
      type: FundType.SIP,
      startDate: new Date('2022-01-01'),
      sipAmount: 5000,
      invested: 100000,
      currentValue: 120000,
    },
  ];

  it('awards points for defined long-term goal with matching tenure and emergency fund', () => {
    const assessment = {
      age: 32,
      goal: Goal.WEALTH_CREATION,
      investmentTenure: '5_TO_10_YEARS',
      lifeStage: 'EARLY_CAREER',
      monthlyInvestment: '6000_10000',
      emergencyFund: 'YES_MORE_THAN_6_MONTHS',
    };

    const res = scoreDimension(dummyRows, assessment);
    expect(res.score).toBe(20);
    expect(res.insights.length).toBe(0);
  });

  it('penalizes missing goal and missing emergency fund', () => {
    const assessment = {
      age: 28,
      goal: Goal.NOT_SURE_YET,
      investmentTenure: 'LESS_THAN_3_YEARS',
      lifeStage: 'EARLY_CAREER',
      monthlyInvestment: 'NOT_INVESTING',
      emergencyFund: null,
    };

    const res = scoreDimension(dummyRows, assessment);
    expect(res.score).toBeLessThan(10);
    expect(res.insights.some((i) => i.includes('No specific investment goal'))).toBe(true);
    expect(res.insights.some((i) => i.includes('No emergency fund'))).toBe(true);
  });
});
