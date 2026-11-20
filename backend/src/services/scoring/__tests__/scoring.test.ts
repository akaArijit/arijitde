import { PortfolioRow, Goal, FundType } from '@prisma/client';
import { scoreDimension as scoreGoalAlignment } from '../goalAlignment';
import { scoreDimension as scoreAssetAllocation } from '../assetAllocation';
import { scoreDimension as scoreDiversification } from '../diversification';
import { scoreDimension as scoreDiscipline } from '../discipline';
import { SCORING_CONSTANTS } from '../constants';

const createMockRow = (overrides: Partial<PortfolioRow> = {}): PortfolioRow => ({
  id: 'test-id',
  portfolioId: 'portfolio-id',
  fundName: 'Test Fund',
  type: FundType.SIP,
  startDate: new Date('2022-01-01'),
  sipAmount: 5000,
  invested: 100000,
  currentValue: 120000,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const createMockAssessment = (overrides: any = {}) => ({
  age: 30,
  goal: Goal.WEALTH_CREATION,
  ageRange: '25_35',
  lifeStage: 'EARLY_CAREER',
  investmentTenure: '10_TO_20_YEARS',
  isCompletePortfolio: true,
  investmentStyle: 'REGULAR_MONTHLY_SIP',
  expectedReturn: '12_TO_15',
  riskBehavior: 'WAIT_PATIENTLY',
  monthlyInvestment: '6000_10000',
  emergencyFund: 'YES_MORE_THAN_6_MONTHS',
  ...overrides,
});

describe('Scoring Engine', () => {
  describe('Goal Alignment', () => {
    it('should give full score for well-aligned goal', () => {
      const rows = [createMockRow()];
      const assessment = createMockAssessment({ goal: Goal.WEALTH_CREATION });
      const result = scoreGoalAlignment(rows, assessment);
      expect(result.score).toBeGreaterThan(15);
    });

    it('should penalize undefined goal', () => {
      const rows = [createMockRow()];
      const assessment = createMockAssessment({ goal: Goal.NOT_SURE_YET });
      const result = scoreGoalAlignment(rows, assessment);
      expect(result.insights.some(i => i.includes('No specific investment goal defined'))).toBe(true);
    });

    it('should penalize tenure mismatch for long-term goal', () => {
      const rows = [createMockRow()];
      const assessment = createMockAssessment({ 
        goal: Goal.RETIREMENT,
        investmentTenure: 'LESS_THAN_3_YEARS',
      });
      const result = scoreGoalAlignment(rows, assessment);
      expect(result.insights.some(i => i.includes('Tenure mismatch'))).toBe(true);
    });

    it('should penalize missing emergency fund', () => {
      const rows = [createMockRow()];
      const assessment = createMockAssessment({ emergencyFund: 'NO_EMERGENCY_FUND' });
      const result = scoreGoalAlignment(rows, assessment);
      expect(result.insights.some(i => i.includes('No emergency fund'))).toBe(true);
    });
  });

  describe('Asset Allocation', () => {
    it('should score well for age-appropriate equity allocation', () => {
      const rows = [
        createMockRow({ fundName: 'HDFC Top 100 Fund', currentValue: 80000, invested: 70000 }),
        createMockRow({ fundName: 'SBI Liquid Fund', type: FundType.LUMPSUM, currentValue: 20000, invested: 20000, sipAmount: 0 }),
      ];
      const assessment = createMockAssessment({ age: 30 });
      const result = scoreAssetAllocation(rows, assessment);
      expect(result.score).toBeGreaterThan(10);
    });

    it('should penalize over-concentration in equity for older age', () => {
      const rows = [
        createMockRow({ fundName: 'HDFC Top 100 Fund', currentValue: 90000, invested: 70000 }),
        createMockRow({ fundName: 'Nippon Small Cap Fund', currentValue: 10000, invested: 10000 }),
      ];
      const assessment = createMockAssessment({ age: 55 });
      const result = scoreAssetAllocation(rows, assessment);
      expect(result.insights.some(i => i.includes('far from the recommended'))).toBe(true);
    });
  });

  describe('Diversification', () => {
    it('should score well for diversified portfolio', () => {
      const rows = [
        createMockRow({ fundName: 'HDFC Top 100 Fund', currentValue: 40000 }),
        createMockRow({ fundName: 'Parag Parikh Flexi Cap Fund', currentValue: 35000 }),
        createMockRow({ fundName: 'SBI Liquid Fund', type: FundType.LUMPSUM, currentValue: 15000, sipAmount: 0 }),
        createMockRow({ fundName: 'ICICI Pru Balanced Advantage Fund', currentValue: 10000 }),
      ];
      const assessment = createMockAssessment();
      const result = scoreDiversification(rows, assessment);
      expect(result.score).toBeGreaterThan(10);
    });

    it('should penalize single fund portfolio', () => {
      const rows = [createMockRow({ currentValue: 100000 })];
      const assessment = createMockAssessment();
      const result = scoreDiversification(rows, assessment);
      expect(result.insights.some(i => i.includes('same category'))).toBe(true);
    });

    it('should penalize over-diversification', () => {
      const rows = Array.from({ length: 15 }, (_, i) => 
        createMockRow({ fundName: `Fund ${i}`, currentValue: 10000 })
      );
      const assessment = createMockAssessment();
      const result = scoreDiversification(rows, assessment);
      expect(result.insights.some(i => i.includes('Over-diversified'))).toBe(true);
    });
  });

  describe('Discipline', () => {
    it('should score well for SIP-heavy portfolio', () => {
      const rows = [
        createMockRow({ type: FundType.SIP, sipAmount: 5000 }),
        createMockRow({ type: FundType.SIP, sipAmount: 3000 }),
      ];
      const assessment = createMockAssessment();
      const result = scoreDiscipline(rows, assessment);
      expect(result.score).toBeGreaterThan(15);
    });

    it('should penalize no SIP investments', () => {
      const rows = [
        createMockRow({ type: FundType.LUMPSUM, sipAmount: 0 }),
        createMockRow({ type: FundType.LUMPSUM, sipAmount: 0 }),
      ];
      const assessment = createMockAssessment();
      const result = scoreDiscipline(rows, assessment);
      expect(result.insights.some(i => i.includes('No SIP investments'))).toBe(true);
    });

    it('should penalize small SIP amounts', () => {
      const rows = [
        createMockRow({ type: FundType.SIP, sipAmount: 300 }),
      ];
      const assessment = createMockAssessment();
      const result = scoreDiscipline(rows, assessment);
      expect(result.insights.some(i => i.includes('Small SIP amount'))).toBe(true);
    });
  });

  describe('Scoring Constants', () => {
    it('should have correct dimension weights', () => {
      expect(SCORING_CONSTANTS.DIMENSIONS).toHaveLength(5);
      expect(SCORING_CONSTANTS.DIMENSIONS.every(d => d.maxScore === 20)).toBe(true);
    });

    it('should have correct tag thresholds', () => {
      expect(SCORING_CONSTANTS.TAG_THRESHOLDS.ALIGNED).toBe(75);
      expect(SCORING_CONSTANTS.TAG_THRESHOLDS.MODERATE).toBe(60);
    });

    it('should have special goals defined', () => {
      expect(SCORING_CONSTANTS.SPECIAL_GOALS).toContain(Goal.EXPLORING);
      expect(SCORING_CONSTANTS.SPECIAL_GOALS).toContain(Goal.NOT_SURE_YET);
    });
  });
});