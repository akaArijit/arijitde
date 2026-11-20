import { detectFundCategory, detectAMC, isEquityCategory, isDebtCategory, CATEGORY_BENCHMARKS, CATEGORY_TOP_PERFORMERS } from './amfiService';

describe('AMFI Service', () => {
  describe('detectFundCategory', () => {
    it('should detect liquid funds', () => {
      expect(detectFundCategory('SBI Liquid Fund')).toBe('liquid');
      expect(detectFundCategory('HDFC Overnight Fund')).toBe('liquid');
      expect(detectFundCategory('ICICI Money Market Fund')).toBe('liquid');
    });

    it('should detect small cap funds', () => {
      expect(detectFundCategory('Nippon Small Cap Fund')).toBe('small_cap');
      expect(detectFundCategory('SBI Smallcap Fund')).toBe('small_cap');
      expect(detectFundCategory('HDFC Small-Cap Fund')).toBe('small_cap');
    });

    it('should detect mid cap funds', () => {
      expect(detectFundCategory('Motilal Oswal Midcap Fund')).toBe('mid_cap');
      expect(detectFundCategory('Axis Midcap Fund')).toBe('mid_cap');
      expect(detectFundCategory('Kotak Mid-Cap Fund')).toBe('mid_cap');
    });

    it('should detect large cap funds', () => {
      expect(detectFundCategory('HDFC Top 100 Fund')).toBe('large_cap');
      expect(detectFundCategory('SBI Bluechip Fund')).toBe('large_cap');
      expect(detectFundCategory('ICICI Large Cap Fund')).toBe('large_cap');
    });

    it('should detect flexi cap funds', () => {
      expect(detectFundCategory('Parag Parikh Flexi Cap Fund')).toBe('flexi_cap');
      expect(detectFundCategory('UTI Flexicap Fund')).toBe('flexi_cap');
      expect(detectFundCategory('HDFC Multi Cap Fund')).toBe('flexi_cap');
    });

    it('should detect ELSS funds', () => {
      expect(detectFundCategory('SBI Long Term Equity Fund')).toBe('elss');
      expect(detectFundCategory('Axis Tax Saver Fund')).toBe('elss');
      expect(detectFundCategory('HDFC Tax Saving Fund')).toBe('elss');
    });

    it('should detect balanced/hybrid funds', () => {
      expect(detectFundCategory('ICICI Pru Equity & Debt Fund')).toBe('balanced');
      expect(detectFundCategory('HDFC Hybrid Equity Fund')).toBe('balanced');
      expect(detectFundCategory('SBI Balanced Advantage Fund')).toBe('balanced');
    });

    it('should detect debt funds', () => {
      expect(detectFundCategory('HDFC Medium Term Debt Fund')).toBe('debt');
      expect(detectFundCategory('SBI Corporate Bond Fund')).toBe('debt');
      expect(detectFundCategory('ICICI Gilt Fund')).toBe('debt');
    });

    it('should detect index funds', () => {
      expect(detectFundCategory('UTI Nifty 50 Index Fund')).toBe('index');
      expect(detectFundCategory('HDFC Nifty 50 ETF')).toBe('index');
      expect(detectFundCategory('SBI Sensex Index Fund')).toBe('index');
    });

    it('should default to flexi_cap for unknown funds', () => {
      expect(detectFundCategory('Unknown Random Fund')).toBe('flexi_cap');
    });
  });

  describe('detectAMC', () => {
    it('should detect major AMCs', () => {
      expect(detectAMC('HDFC Top 100 Fund')).toBe('HDFC');
      expect(detectAMC('ICICI Pru Bluechip Fund')).toBe('ICICI');
      expect(detectAMC('SBI Bluechip Fund')).toBe('SBI');
      expect(detectAMC('Axis Bluechip Fund')).toBe('Axis');
      expect(detectAMC('Kotak Standard Multicap Fund')).toBe('Kotak');
      expect(detectAMC('Nippon India Small Cap Fund')).toBe('Nippon');
      expect(detectAMC('Aditya Birla Sun Life Frontline Equity')).toBe('Aditya Birla');
      expect(detectAMC('UTI Nifty 50 Index Fund')).toBe('UTI');
    });

    it('should fallback to first word for unknown AMC', () => {
      expect(detectAMC('Unknown AMC Fund')).toBe('Unknown');
    });
  });

  describe('Category Helpers', () => {
    it('should identify equity categories', () => {
      expect(isEquityCategory('large_cap')).toBe(true);
      expect(isEquityCategory('mid_cap')).toBe(true);
      expect(isEquityCategory('small_cap')).toBe(true);
      expect(isEquityCategory('flexi_cap')).toBe(true);
      expect(isEquityCategory('multi_cap')).toBe(true);
      expect(isEquityCategory('elss')).toBe(true);
      expect(isEquityCategory('index')).toBe(true);
    });

    it('should identify debt categories', () => {
      expect(isDebtCategory('debt')).toBe(true);
      expect(isDebtCategory('liquid')).toBe(true);
    });

    it('should not identify balanced as equity or debt', () => {
      expect(isEquityCategory('balanced')).toBe(false);
      expect(isDebtCategory('balanced')).toBe(false);
    });
  });

  describe('Benchmark and Top Performer Constants', () => {
    it('should have benchmarks for all categories', () => {
      expect(CATEGORY_BENCHMARKS.large_cap).toBeDefined();
      expect(CATEGORY_BENCHMARKS.mid_cap).toBeDefined();
      expect(CATEGORY_BENCHMARKS.small_cap).toBeDefined();
      expect(CATEGORY_BENCHMARKS.flexi_cap).toBeDefined();
      expect(CATEGORY_BENCHMARKS.debt).toBeDefined();
      expect(CATEGORY_BENCHMARKS.liquid).toBeDefined();
      expect(CATEGORY_BENCHMARKS.default).toBeDefined();
    });

    it('should have top performers for all categories', () => {
      expect(CATEGORY_TOP_PERFORMERS.large_cap).toBeDefined();
      expect(CATEGORY_TOP_PERFORMERS.mid_cap).toBeDefined();
      expect(CATEGORY_TOP_PERFORMERS.small_cap).toBeDefined();
      expect(CATEGORY_TOP_PERFORMERS.flexi_cap).toBeDefined();
      expect(CATEGORY_TOP_PERFORMERS.debt).toBeDefined();
      expect(CATEGORY_TOP_PERFORMERS.liquid).toBeDefined();
      expect(CATEGORY_TOP_PERFORMERS.default).toBeDefined();
    });

    it('should have valid scheme codes', () => {
      Object.values(CATEGORY_BENCHMARKS).forEach(code => {
        expect(typeof code).toBe('number');
        expect(code).toBeGreaterThan(0);
      });

      Object.values(CATEGORY_TOP_PERFORMERS).forEach(performer => {
        expect(typeof performer.code).toBe('number');
        expect(performer.code).toBeGreaterThan(0);
        expect(typeof performer.name).toBe('string');
        expect(performer.name.length).toBeGreaterThan(0);
      });
    });
  });
});