import { PrismaClient, PortfolioRow, Portfolio, Assessment, ExistingClient, Folio } from '@prisma/client';
import { detectFundCategory, getSchemeNAV } from './amfiService';
import { fetchAllBenchmarkSeries, fetchAllBenchmarkIndices, fetchMultipleIndices } from './yahooFinance';
import { computeCategoryAverageSeries, computeCategoryAverageReturn } from './categoryAverage';
import {
  MonthlyPoint,
  BenchmarkTimePoint,
  BenchmarkMetrics,
  BenchmarkResponse,
  BenchmarkMeta,
  Cashflow,
  PortfolioRowForBenchmark,
  FolioForBenchmark,
  Timeframe,
  FundBenchmark,
  CompositeBenchmarkInfo,
  BenchmarkMeta as NewBenchmarkMeta,
  DiagnosticContext,
} from '@finanalysis/shared';
import { CATEGORY_BENCHMARK_MAP, TIMEFRAME_DAYS, BENCHMARK_INDICES, BENCHMARK_DISPLAY_NAMES } from '@finanalysis/shared';

const prisma = new PrismaClient();

function calculateXIRR(cashflows: Cashflow[]): number {
  if (cashflows.length < 2) return 0;

  const sorted = [...cashflows].sort((a, b) => a.date.getTime() - b.date.getTime());
  const startDate = sorted[0].date;

  const normalized = sorted.map((cf) => ({
    years: (cf.date.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    amount: cf.amount,
  }));

  let rate = 0.1;
  const maxIterations = 100;
  const tolerance = 1e-6;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;

    for (const cf of normalized) {
      if (cf.years < 0) continue;
      const factor = Math.pow(1 + rate, cf.years);
      npv += cf.amount / factor;
      dnpv -= (cf.amount * cf.years) / (factor * (1 + rate));
    }

    if (Math.abs(npv) < tolerance) break;
    if (dnpv === 0) break;

    const newRate = rate - npv / dnpv;
    if (newRate <= -0.99) {
      rate = (rate - 0.99) / 2;
    } else {
      rate = newRate;
    }

    if (Math.abs(newRate - rate) < tolerance) break;
  }

  return rate * 100;
}

function calculateMonthlyReturns(values: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < values.length; i++) {
    if (values[i - 1] > 0) {
      returns.push((values[i] - values[i - 1]) / values[i - 1]);
    } else {
      returns.push(0);
    }
  }
  return returns;
}

function calculateRiskMetrics(
  portfolioMonthlyReturns: number[],
  benchmarkMonthlyReturns: number[],
  rfAnnual = 0.07
): Pick<BenchmarkMetrics, 'alpha' | 'beta' | 'sharpeRatio' | 'informationRatio' | 'maxDrawdown'> {
  const n = Math.min(portfolioMonthlyReturns.length, benchmarkMonthlyReturns.length);
  if (n < 2) {
    return { alpha: 0, beta: 1, sharpeRatio: 0, informationRatio: 0, maxDrawdown: 0 };
  }

  const pReturns = portfolioMonthlyReturns.slice(-n);
  const bReturns = benchmarkMonthlyReturns.slice(-n);

  const meanP = pReturns.reduce((a, b) => a + b, 0) / n;
  const meanB = bReturns.reduce((a, b) => a + b, 0) / n;

  let cov = 0;
  let varB = 0;
  let varP = 0;

  for (let i = 0; i < n; i++) {
    const dp = pReturns[i] - meanP;
    const db = bReturns[i] - meanB;
    cov += dp * db;
    varB += db * db;
    varP += dp * dp;
  }

  cov /= n;
  varB /= n;
  varP /= n;

  const beta = varB > 0 ? cov / varB : 1;
  const rfMonthly = rfAnnual / 12;
  const alphaMonthly = meanP - (rfMonthly + beta * (meanB - rfMonthly));
  const alpha = alphaMonthly * 12 * 100;

  const sharpeRatio = Math.sqrt(varP) > 0 ? ((meanP - rfMonthly) * Math.sqrt(12)) / Math.sqrt(varP) : 0;

  const excessReturns = pReturns.map((r, i) => r - bReturns[i]);
  const meanExcess = excessReturns.reduce((a, b) => a + b, 0) / n;
  let varExcess = 0;
  for (const er of excessReturns) {
    varExcess += (er - meanExcess) ** 2;
  }
  varExcess /= n;
  const informationRatio = Math.sqrt(varExcess) > 0 ? (meanExcess * Math.sqrt(12)) / Math.sqrt(varExcess) : 0;

  let peak = 0;
  let maxDD = 0;
  let runningValue = 100;
  for (const r of pReturns) {
    runningValue *= 1 + r;
    if (runningValue > peak) peak = runningValue;
    const dd = peak > 0 ? ((peak - runningValue) / peak) * 100 : 0;
    if (dd > maxDD) maxDD = dd;
  }

  const maxDrawdown = maxDD;

  return { alpha, beta, sharpeRatio, informationRatio, maxDrawdown };
}

async function searchSchemeCode(fundName: string): Promise<number | null> {
  try {
    const cleanName = fundName
      .replace(/\s*-\s*(growth|dividend|direct|regular|plan|option)\s*/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .slice(0, 4)
      .join(' ');

    const res = await fetch(
      `https://api.mfapi.in/mf/search?q=${encodeURIComponent(cleanName)}`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as any[];
    return data[0]?.schemeCode || null;
  } catch {
    return null;
  }
}

async function getFundNAVHistory(fundName: string): Promise<MonthlyPoint[] | null> {
  const schemeCode = await searchSchemeCode(fundName);
  if (!schemeCode) return null;

  try {
    const data = await getSchemeNAV(schemeCode);
    if (!data || !data.data || data.data.length === 0) return null;

    const points: MonthlyPoint[] = [];
    for (const dp of data.data) {
      const [day, month, year] = dp.date.split('-');
      const date = new Date(`${year}-${month}-${day}`);
      const nav = parseFloat(dp.nav);
      if (!isNaN(nav)) {
        points.push({ date: date.toISOString().split('T')[0], value: nav });
      }
    }
    return points.sort((a, b) => a.date.localeCompare(b.date));
  } catch {
    return null;
  }
}

async function reconstructPortfolioTimeSeries(
  rows: PortfolioRowForBenchmark[],
  timeframeDays: number
): Promise<MonthlyPoint[]> {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - timeframeDays);

  const fundNAVHistories = await Promise.all(
    rows.map(async (row) => {
      const navHistory = await getFundNAVHistory(row.fundName);
      return { row, navHistory };
    })
  );

  const monthlyGrid: Map<string, number> = new Map();
  const currentDate = new Date(from);
  while (currentDate <= to) {
    const key = currentDate.toISOString().split('T')[0];
    monthlyGrid.set(key, 0);
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  for (const { row, navHistory } of fundNAVHistories) {
    if (!navHistory || navHistory.length === 0) continue;

    const startDate = new Date(row.startDate);
    if (startDate > to) continue;

    let units = 0;
    if (row.type === 'LUMPSUM') {
      const startNAV = navHistory.find((p) => p.date >= startDate.toISOString().split('T')[0])?.value;
      if (startNAV && startNAV > 0) {
        units = row.invested / startNAV;
      }
    }

    for (const [dateKey] of monthlyGrid) {
      const date = new Date(dateKey);
      if (date < startDate) continue;

      const navPoint = navHistory.find((p) => p.date <= dateKey);
      if (!navPoint) continue;

      if (row.type === 'SIP' && date >= startDate) {
        const sipNavPoint = navHistory.find((p) => p.date <= dateKey);
        if (sipNavPoint && sipNavPoint.value > 0) {
          units += row.sipAmount / sipNavPoint.value;
        }
      }

      const value = units * navPoint.value;
      monthlyGrid.set(dateKey, (monthlyGrid.get(dateKey) || 0) + value);
    }
  }

  return Array.from(monthlyGrid.entries())
    .map(([date, value]) => ({ date, value }))
    .filter((p) => p.value > 0);
}

function buildApproximateSeriesFromCAGR(
  cagr: number,
  timeframeDays: number,
  startValue = 100
): MonthlyPoint[] {
  const months = Math.min(Math.ceil(timeframeDays / 30.44), 120);
  const monthlyReturn = Math.pow(1 + cagr / 100, 1 / 12) - 1;
  const points: MonthlyPoint[] = [];
  const to = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(to);
    date.setMonth(date.getMonth() - i);
    const value = startValue * Math.pow(1 + monthlyReturn, months - i);
    points.push({ date: date.toISOString().split('T')[0], value });
  }
  return points;
}

function buildAchievableSeriesFromXIRR(
  xirr: number,
  timeframeDays: number,
  startValue: number
): MonthlyPoint[] {
  const months = Math.min(Math.ceil(timeframeDays / 30.44), 120);
  const monthlyReturn = Math.pow(1 + xirr / 100, 1 / 12) - 1;
  const points: MonthlyPoint[] = [];
  const to = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(to);
    date.setMonth(date.getMonth() - i);
    const value = startValue * Math.pow(1 + monthlyReturn, months - i);
    points.push({ date: date.toISOString().split('T')[0], value });
  }
  return points;
}

function detectDominantCategory(folios: FolioForBenchmark[]): string {
  const categoryCounts: Record<string, number> = {};
  for (const folio of folios) {
    if (folio.schemeName) {
      const cat = detectFundCategory(folio.schemeName);
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }
  }
  let maxCat = 'default';
  let maxCount = 0;
  for (const [cat, count] of Object.entries(categoryCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxCat = cat;
    }
  }
  return maxCat;
}

// ===== NEW HELPER FUNCTIONS =====

interface ScoreResult {
  total: number;
  goalAlignment: number;
  assetAlloc: number;
  diversification: number;
  discipline: number;
  efficiency: number;
  tag: 'ALIGNED' | 'MODERATE' | 'NEEDS_REVIEW' | 'NEEDS_STRUCTURING';
  insights: {
    textInsights: string[];
    comparison: {
      currentXirr: number;
      achievableXirr: number;
      totalGap: number;
      totalCurrentProfit: number;
      totalAchievableProfit: number;
      funds: Array<{
        fundName: string;
        category: string;
        invested: number;
        currentReturn: number;
        bestReturn: number;
        currentProfit: number;
        achievableProfit: number;
        gap: number;
        tenureReturn: number;
      }>;
    };
  };
}

interface FundBenchmarkInput {
  fundName: string;
  category: string;
  benchmarkIndex: string;
  benchmarkDisplayName: string;
  benchmarkSymbol: string;
  weight: number;
  invested: number;
  currentValue: number;
  diagnostics?: {
    category: string;
    currentReturn: number;
    bestReturn: number;
    gap: number;
    currentProfit: number;
    achievableProfit: number;
    tenureReturn: number;
    isUnderperforming: boolean;
  };
}

function assignFundBenchmarks(
  rows: PortfolioRowForBenchmark[],
  diagnosticsComparison?: ScoreResult['insights']['comparison']
): FundBenchmarkInput[] {
  const totalValue = rows.reduce((sum, r) => sum + r.currentValue, 0);
  
  // Build diagnostics lookup by fundName
  const diagLookup = new Map<string, FundBenchmarkInput['diagnostics']>();
  if (diagnosticsComparison?.funds) {
    for (const f of diagnosticsComparison.funds) {
      diagLookup.set(f.fundName, {
        category: f.category,
        currentReturn: f.currentReturn,
        bestReturn: f.bestReturn,
        gap: f.gap,
        currentProfit: f.currentProfit,
        achievableProfit: f.achievableProfit,
        tenureReturn: f.tenureReturn,
        isUnderperforming: f.gap > 0,
      });
    }
  }
  
  return rows.map(row => {
    const diag = diagLookup.get(row.fundName);
    const category = diag?.category || detectFundCategory(row.fundName);
    const benchmarkKey = CATEGORY_BENCHMARK_MAP[category] || CATEGORY_BENCHMARK_MAP.default;
    const benchmarkSymbol = BENCHMARK_INDICES[benchmarkKey as keyof typeof BENCHMARK_INDICES];
    const weight = totalValue > 0 ? row.currentValue / totalValue : 0;
    
    return {
      fundName: row.fundName,
      category,
      benchmarkIndex: benchmarkKey,
      benchmarkDisplayName: BENCHMARK_DISPLAY_NAMES[BENCHMARK_INDICES[benchmarkKey as keyof typeof BENCHMARK_INDICES]] || benchmarkKey,
      benchmarkSymbol,
      weight: totalValue > 0 ? row.currentValue / totalValue : 0,
      invested: row.invested,
      currentValue: row.currentValue,
      diagnostics: diagLookup.get(row.fundName),
    };
  });
}

function buildCompositeBenchmarkInfo(fundBenchmarks: FundBenchmarkInput[]): { name: string; components: Array<{ index: string; displayName: string; symbol: string; weight: number; fundCount: number }> } {
  const indexWeights = new Map<string, { weight: number; fundCount: number }>();
  
  for (const fb of fundBenchmarks) {
    const existing = indexWeights.get(fb.benchmarkIndex) || { weight: 0, fundCount: 0 };
    existing.weight += fb.weight;
    existing.fundCount += 1;
    indexWeights.set(fb.benchmarkIndex, existing);
  }
  
  const components = Array.from(indexWeights.entries())
    .map(([index, { weight, fundCount }]) => ({
      index,
      displayName: BENCHMARK_DISPLAY_NAMES[BENCHMARK_INDICES[index as keyof typeof BENCHMARK_INDICES]] || index,
      symbol: BENCHMARK_INDICES[index as keyof typeof BENCHMARK_INDICES],
      weight,
      fundCount,
    }))
    .sort((a, b) => b.weight - a.weight);
  
  const name = `Portfolio Composite (${components.map(c => `${(c.weight * 100).toFixed(0)}% ${c.displayName}`).join(' + ')})`;
  
  return { name, components };
}

function computeConcentrationRisk(fundBenchmarks: FundBenchmarkInput[]): 'HIGH' | 'MEDIUM' | 'LOW' {
  const categoryCounts = new Map<string, number>();
  let maxWeight = 0;
  
  for (const fb of fundBenchmarks) {
    categoryCounts.set(fb.category, (categoryCounts.get(fb.category) || 0) + 1);
    maxWeight = Math.max(maxWeight, fb.weight);
  }
  
  const numCategories = categoryCounts.size;
  const numFunds = fundBenchmarks.length;
  
  if (numFunds <= 2 || maxWeight > 0.5 || numCategories === 1) return 'HIGH';
  if (numFunds <= 4 || maxWeight > 0.35 || numCategories <= 2) return 'MEDIUM';
  return 'LOW';
}

function computeSipConsistency(rows: PortfolioRowForBenchmark[], assessment: Assessment): 'HIGH' | 'MEDIUM' | 'LOW' {
  const sipFunds = rows.filter(r => r.type === 'SIP');
  if (sipFunds.length === 0) return 'LOW';
  
  const hasStepUp = assessment.investmentStyle?.includes('step') || false;
  const tenure = assessment.investmentTenure || '';
  const isLongTerm = ['5_TO_10_YEARS', '10_TO_20_YEARS', 'MORE_THAN_20_YEARS'].includes(tenure);
  
  if (sipFunds.length === rows.length && hasStepUp && isLongTerm) return 'HIGH';
  if (sipFunds.length / rows.length >= 0.7) return 'MEDIUM';
  return 'LOW';
}

async function benchmarkUploadedPortfolio(
  portfolioId: string,
  rows: PortfolioRow[],
  assessment: Assessment,
  timeframe: Timeframe,
  diagnosticsComparison?: ScoreResult['insights']['comparison']
): Promise<BenchmarkResponse> {
  const startTime = Date.now();
  const timeframeDays = TIMEFRAME_DAYS[timeframe];

  const portfolioRows: PortfolioRowForBenchmark[] = rows.map((r) => ({
    fundName: r.fundName,
    type: r.type,
    startDate: new Date(r.startDate),
    sipAmount: r.sipAmount,
    invested: r.invested,
    currentValue: r.currentValue,
  }));

  // Assign fund benchmarks (uses diagnostics if available)
  const fundBenchmarks = assignFundBenchmarks(portfolioRows, diagnosticsComparison);
  const compositeInfo = buildCompositeBenchmarkInfo(fundBenchmarks);

  // Collect unique benchmark symbols needed
  const uniqueSymbols = [...new Set(fundBenchmarks.map(fb => fb.benchmarkSymbol))];

  // Fetch ALL needed data in parallel
  const [portfolioSeries, benchmarkSeriesMap, categoryAvgReturn, categoryAvgSeries] = await Promise.all([
    reconstructPortfolioTimeSeries(portfolioRows, timeframeDays),
    fetchMultipleIndices(uniqueSymbols, new Date(Date.now() - timeframeDays), new Date()),
    computeCategoryAverageReturn(detectDominantCategory(rows.map((r) => ({ schemeName: r.fundName } as FolioForBenchmark))), timeframe),
    computeCategoryAverageSeries(detectDominantCategory(rows.map((r) => ({ schemeName: r.fundName } as FolioForBenchmark))), timeframeDays),
  ]);

  if (portfolioSeries.length < 2) {
    throw new Error('Insufficient portfolio data for benchmarking');
  }

  // Build per-fund benchmark series
  const fundBenchmarkSeries: Record<string, MonthlyPoint[]> = {};
  for (const fb of fundBenchmarks) {
    const series = benchmarkSeriesMap[fb.benchmarkSymbol];
    if (series && series.length > 0) {
      fundBenchmarkSeries[fb.fundName] = series;
    }
  }

  // Build COMPOSITE benchmark series (weighted)
  const compositeSeries: MonthlyPoint[] = [];
  const dates = portfolioSeries.map(p => p.date);

  for (let i = 0; i < dates.length; i++) {
    let compositeValue = 0;
    const fundBenchmarksAtDate: Record<string, number> = {};

    for (const fb of fundBenchmarks) {
      const series = fundBenchmarkSeries[fb.fundName];
      const point = series?.find(p => p.date === dates[i]);
      if (point) {
        compositeValue += point.value * fb.weight;
        fundBenchmarksAtDate[fb.fundName] = point.value;
      }
    }

    if (compositeValue > 0) {
      compositeSeries.push({ date: dates[i], value: compositeValue });
    }
  }

  // Normalize portfolio to base 100
  const portfolioValues = portfolioSeries.map((p) => p.value);
  const firstValue = portfolioValues[0];
  const normalizedPortfolio = portfolioValues.map((v) => (v / firstValue) * 100);

  // Normalize composite to same base
  const compositeValues = compositeSeries.map(p => p.value);
  const compositeFirst = compositeValues[0];
  const normalizedComposite = compositeValues.map((v) => (v / compositeFirst) * 100);

  // Build ACHIEVABLE series from diagnostics
  let achievableSeries: MonthlyPoint[] = [];
  if (diagnosticsComparison?.achievableXirr) {
    achievableSeries = buildAchievableSeriesFromXIRR(diagnosticsComparison.achievableXirr, timeframeDays, firstValue);
  }

  // Risk metrics vs COMPOSITE (not just Nifty 50)
  const compositeReturns = calculateMonthlyReturns(
    compositeSeries.map(p => (p.value / compositeSeries[0]?.value) * 100)
  );
  const portfolioReturns = calculateMonthlyReturns(
    portfolioSeries.map(p => (p.value / portfolioSeries[0]?.value) * 100)
  );
  const riskMetrics = calculateRiskMetrics(portfolioReturns, compositeReturns);

  // Portfolio CAGR
  const portfolioCAGR = normalizedPortfolio.length > 1
    ? (Math.pow(normalizedPortfolio[normalizedPortfolio.length - 1] / normalizedPortfolio[0], 365.25 / timeframeDays) - 1) * 100
    : 0;

  // XIRR calculation
  const cashflows: Cashflow[] = [];
  for (const row of portfolioRows) {
    if (row.type === 'LUMPSUM') {
      cashflows.push({ date: row.startDate, amount: -row.invested });
    } else {
      const start = new Date(row.startDate);
      const end = new Date();
      const current = new Date(start);
      while (current <= end) {
        cashflows.push({ date: new Date(current), amount: -row.sipAmount });
        current.setMonth(current.getMonth() + 1);
      }
    }
  }
  cashflows.push({ date: new Date(), amount: rows.reduce((s, r) => s + r.currentValue, 0) });

  const xirr = calculateXIRR(cashflows);

  const benchmarkIndices = await fetchAllBenchmarkIndices(timeframeDays);

  const dominantCategory = detectDominantCategory(rows.map((r) => ({ schemeName: r.fundName } as FolioForBenchmark)));

  // Build timeSeries with ALL series
  const timeSeries: BenchmarkTimePoint[] = portfolioSeries.map((p, i) => {
    const compPoint = compositeSeries[i];
    const achPoint = achievableSeries[i];
    
    const fundBenchmarksAtDate: Record<string, number> = {};
    for (const fb of fundBenchmarks) {
      const series = fundBenchmarkSeries[fb.fundName];
      if (series && series[i]) {
        fundBenchmarksAtDate[fb.fundName] = (series[i].value / series[0]?.value) * 100;
      }
    }

    return {
      date: p.date,
      portfolioValue: normalizedPortfolio[i],
      compositeBenchmark: normalizedComposite[i] || 0,
      nifty50TRI: benchmarkSeriesMap['^NSEI']?.[i]?.value || 0,
      nifty500TRI: benchmarkSeriesMap['^NSE500']?.[i]?.value || 0,
      niftyMidcap150TRI: benchmarkSeriesMap['^CNXMIDCAP']?.[i]?.value || 0,
      niftySmallcap250TRI: benchmarkSeriesMap['^CNXSMALLCAP']?.[i]?.value || 0,
      categoryAverage: categoryAvgSeries[i]?.value || 0,
      fundBenchmarks: fundBenchmarksAtDate,
      achievableValue: achPoint ? (achPoint.value / firstValue) * 100 : undefined,
    };
  });

  // Build diagnostic context
  const diagnosticContext = diagnosticsComparison ? {
    totalGap: diagnosticsComparison.totalGap,
    currentXIRR: diagnosticsComparison.currentXirr,
    achievableXIRR: diagnosticsComparison.achievableXirr,
    fundAttribution: fundBenchmarks.map(fb => ({
      fundName: fb.fundName,
      category: fb.category,
      invested: fb.invested,
      currentReturn: fb.diagnostics?.currentReturn || 0,
      bestReturn: fb.diagnostics?.bestReturn || 0,
      gap: fb.diagnostics?.gap || 0,
      isUnderperforming: fb.diagnostics?.isUnderperforming || false,
      weight: fb.weight,
    })),
    dimensionScores: null as any, // Will be filled by caller
    tag: null as any,
    weakestDimension: '',
    strongestDimension: '',
  } : undefined;

  // Build meta
  const concentrationRisk = computeConcentrationRisk(fundBenchmarks);
  const sipConsistency = computeSipConsistency(portfolioRows, assessment);

  // Return complete response
  return {
    source: 'UPLOADED_PORTFOLIO',
    portfolioId,
    timeSeries,
    fundBenchmarks: fundBenchmarks.map(fb => ({
      fundName: fb.fundName,
      category: fb.category,
      benchmarkIndex: fb.benchmarkIndex,
      benchmarkDisplayName: fb.benchmarkDisplayName,
      benchmarkSymbol: fb.benchmarkSymbol,
      weight: fb.weight,
      invested: fb.invested,
      currentValue: fb.currentValue,
      diagnostics: fb.diagnostics,
    })),
    metrics: {
      portfolioXIRR: xirr,
      portfolioCAGR,
      nifty50TRI_CAGR: (await fetchAllBenchmarkIndices(timeframeDays)).NIFTY_50_TRI || 0,
      nifty500TRI_CAGR: (await fetchAllBenchmarkIndices(timeframeDays)).NIFTY_500_TRI || 0,
      niftyMidcap150TRI_CAGR: (await fetchAllBenchmarkIndices(timeframeDays)).NIFTY_MIDCAP_150_TRI || 0,
      niftySmallcap250TRI_CAGR: (await fetchAllBenchmarkIndices(timeframeDays)).NIFTY_SMALLCAP_250_TRI || 0,
      categoryAverage_CAGR: 0, // Will be filled
      compositeBenchmark_CAGR: 0, // Will be filled
      ...riskMetrics,
      riskFreeRate: 0.07,
      dataPoints: portfolioSeries.length,
      computationTimeMs: Date.now() - startTime,
    },
    meta: {
      fundCount: fundBenchmarks.length,
      dominantCategory: detectDominantCategory(rows.map((r) => ({ schemeName: r.fundName } as FolioForBenchmark))),
      benchmarkUsed: 'Composite', // Now composite description
      dataQuality: 'FULL_RECONSTRUCTION',
      warnings: rows.some((r) => r.type === 'SIP') ? undefined : ['No SIP installments; lumpsum-only portfolio'],
      compositeBenchmarkInfo: {
        name: 'Portfolio Composite',
        components: [],
      },
      concentrationRisk: 'MEDIUM',
      sipConsistency: 'MEDIUM',
    },
    diagnosticContext,
  };
}

async function benchmarkCRMImport(
  client: ExistingClient,
  folios: Folio[],
  timeframe: Timeframe
): Promise<BenchmarkResponse> {
  const startTime = Date.now();
  const timeframeDays = TIMEFRAME_DAYS[timeframe];

  const reportedXIRR = client.xirr || 0;
  const reportedCAGR = client.cagr || 0;

  const folioData: FolioForBenchmark[] = folios.map((f) => ({
    schemeName: f.schemeName,
    units: f.units,
    aum: f.aum,
    purchaseValue: f.purchaseValue,
    currentValue: f.aum,
  }));

  const dominantCategory = detectDominantCategory(folioData);

  const benchmarkSeries = await fetchAllBenchmarkSeries(timeframeDays);
  const benchmarkIndices = await fetchAllBenchmarkIndices(timeframeDays);
  const categoryAvgReturn = await computeCategoryAverageReturn(dominantCategory, timeframe);
  const categoryAvgSeries = await computeCategoryAverageSeries(dominantCategory, timeframeDays);

  const cagrToUse = reportedCAGR || reportedXIRR || 0;
  const portfolioSeries = buildApproximateSeriesFromCAGR(cagrToUse, timeframeDays);

  const nifty50TRI = benchmarkSeries.NIFTY_50_TRI || [];
  const nifty50TRIReturns = calculateMonthlyReturns(nifty50TRI.map((p) => p.value));
  const portfolioReturns = calculateMonthlyReturns(portfolioSeries.map((p) => p.value));

  const riskMetrics = calculateRiskMetrics(portfolioReturns, nifty50TRIReturns);

  const timeSeries: BenchmarkTimePoint[] = portfolioSeries.map((p, i) => ({
    date: p.date,
    portfolioValue: p.value,
    compositeBenchmark: 0,
    nifty50TRI: nifty50TRI[i]?.value || 0,
    nifty500TRI: benchmarkSeries.NIFTY_500_TRI?.[i]?.value || 0,
    niftyMidcap150TRI: benchmarkSeries.NIFTY_MIDCAP_150_TRI?.[i]?.value || 0,
    niftySmallcap250TRI: benchmarkSeries.NIFTY_SMALLCAP_250_TRI?.[i]?.value || 0,
    categoryAverage: categoryAvgSeries[i]?.value || 0,
    fundBenchmarks: undefined,
    achievableValue: undefined,
  }));

  const warnings = [
    'Based on reported metrics; no SIP date reconstruction available',
    'Time-series approximated from reported CAGR/XIRR',
  ];
  if (!client.xirr && !client.cagr) {
    warnings.push('No reported XIRR/CAGR; metrics may be inaccurate');
  }

  const meta: NewBenchmarkMeta = {
    fundCount: folios.length,
    dominantCategory,
    benchmarkUsed: CATEGORY_BENCHMARK_MAP[dominantCategory] || CATEGORY_BENCHMARK_MAP.default,
    dataQuality: 'REPORTED_METRICS_ONLY',
    warnings,
    compositeBenchmarkInfo: { name: 'N/A', components: [] },
    concentrationRisk: 'MEDIUM',
    sipConsistency: 'LOW',
  };

  return {
    source: 'CRM_IMPORT',
    clientName: client.name || undefined,
    timeSeries,
    fundBenchmarks: [],
    metrics: {
      portfolioXIRR: reportedXIRR,
      portfolioCAGR: reportedCAGR || reportedXIRR,
      nifty50TRI_CAGR: benchmarkIndices.NIFTY_50_TRI || 0,
      nifty500TRI_CAGR: benchmarkIndices.NIFTY_500_TRI || 0,
      niftyMidcap150TRI_CAGR: benchmarkIndices.NIFTY_MIDCAP_150_TRI || 0,
      niftySmallcap250TRI_CAGR: benchmarkIndices.NIFTY_SMALLCAP_250_TRI || 0,
      categoryAverage_CAGR: categoryAvgReturn || 0,
      compositeBenchmark_CAGR: 0,
      ...riskMetrics,
      riskFreeRate: 0.07,
      dataPoints: portfolioSeries.length,
      computationTimeMs: Date.now() - startTime,
    },
    meta,
    diagnosticContext: undefined,
  };
}

export async function generateBenchmarkReport(params: {
  portfolioId?: string;
  clientId?: string;
  timeframe: Timeframe;
  diagnosticsComparison?: ScoreResult['insights']['comparison'];
}): Promise<BenchmarkResponse> {
  const { portfolioId, clientId, timeframe, diagnosticsComparison } = params;

  if (portfolioId) {
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: { rows: true, assessment: true },
    });
    if (!portfolio) throw new Error('Portfolio not found');
    if (!portfolio.rows.length) throw new Error('Portfolio has no holdings');
    if (!portfolio.assessment) throw new Error('Portfolio has no assessment');

    return benchmarkUploadedPortfolio(portfolioId, portfolio.rows, portfolio.assessment, timeframe, diagnosticsComparison);
  }

  if (clientId) {
    const client = await prisma.existingClient.findUnique({
      where: { id: clientId },
      include: { folios: true },
    });
    if (!client) throw new Error('Client not found');

    return benchmarkCRMImport(client, client.folios, timeframe);
  }

  throw new Error('Either portfolioId or clientId must be provided');
}