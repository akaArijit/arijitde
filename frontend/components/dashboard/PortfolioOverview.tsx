'use client';

import { useMemo, useRef, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, Percent, Target, BarChart3, RefreshCw, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChartAreaInteractive } from '@/components/ChartAreaInteractive';
import { ChartRadarDots } from '@/components/ChartRadarDots';
import { ErrorBoundary } from '@/components/ErrorBoundary';



interface ScoreData {
  total: number;
  goalAlignment: number;
  assetAlloc: number;
  diversification: number;
  discipline: number;
  efficiency: number;
  tag: 'ALIGNED' | 'MODERATE' | 'NEEDS_REVIEW' | 'NEEDS_STRUCTURING';
  insights?: {
    summary?: string;
    recommendations?: string[];
  };
}

interface PortfolioOverviewProps {
  currentVal: number;
  investedVal: number;
  unifiedFolios: Array<{
    schemeName: string;
    purchaseValue: number;
    aum: number;
    units: number;
  }>;
  scoreReport: ScoreData | null;
  activePortfolioId: string | null;
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onViewFullReport: () => void;
  viewFullReport: boolean;
  setViewFullReport: (val: boolean) => void;
  onAnalyzePortfolio: () => void;
}

const getSchemeCategory = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('bluechip') || n.includes('large cap') || n.includes('large-cap') || n.includes('index')) return 'Large Cap';
  if (n.includes('mid cap') || n.includes('midcap') || n.includes('mid-cap')) return 'Mid Cap';
  if (n.includes('small cap') || n.includes('smallcap') || n.includes('small-cap')) return 'Small Cap';
  if (n.includes('flexi cap') || n.includes('flexicap') || n.includes('flexi-cap') || n.includes('multicap') || n.includes('multi cap')) return 'Flexi Cap';
  if (n.includes('elss') || n.includes('tax saver') || n.includes('tax-saver')) return 'ELSS (Tax Saver)';
  if (n.includes('debt') || n.includes('bond') || n.includes('liquid') || n.includes('treasury') || n.includes('money market') || n.includes('gilt')) return 'Debt';
  if (n.includes('hybrid') || n.includes('balanced') || n.includes('arbitrage') || n.includes('asset allocator')) return 'Hybrid';
  return 'Equity - Other';
};

const formatCurrency = (val: number) => {
  if (val >= 1e7) return `₹${(val / 1e7).toFixed(2)} Cr`;
  if (val >= 1e5) return `₹${(val / 1e5).toFixed(2)} L`;
  return `₹${val.toLocaleString('en-IN')}`;
};

const formatPercent = (val: number) => {
  const color = val >= 0 ? 'text-green-600' : 'text-red-600';
  const prefix = val >= 0 ? '+' : '';
  return <span className={`font-bold ${color}`}>{prefix}{val.toFixed(2)}%</span>;
};

function PortfolioOverviewContent({
  currentVal,
  investedVal,
  unifiedFolios,
  scoreReport,
  activePortfolioId,
  isLoading,
  onRefresh,
  onViewFullReport,
  viewFullReport,
  setViewFullReport,
  onAnalyzePortfolio,
}: PortfolioOverviewProps) {
  const totalGain = currentVal - investedVal;
  const totalReturnPct = investedVal > 0 ? (totalGain / investedVal) * 100 : 0;

  const categoryBreakdown = unifiedFolios.reduce((acc, folio) => {
    const cat = getSchemeCategory(folio.schemeName || '');
    acc[cat] = (acc[cat] || 0) + (folio.aum || 0);
    return acc;
  }, {} as Record<string, number>);

  const categories = Object.entries(categoryBreakdown).map(([category, value]) => ({
    category,
    value,
    percentage: currentVal > 0 ? (value / currentVal) * 100 : 0,
  }));

  const nowRef = useRef<number>(Date.now());
  useEffect(() => {
    nowRef.current = Date.now();
  }, []);

  const chartData = useMemo(() => {
    const now = nowRef.current;
    return unifiedFolios.length > 0
      ? unifiedFolios.map((f, i) => ({
          date: new Date(now - (unifiedFolios.length - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          currentValue: f.aum || 0,
          investedValue: f.purchaseValue || 0,
        }))
      : [{
          date: new Date(now).toISOString().split('T')[0],
          currentValue: currentVal,
          investedValue: investedVal,
        }];
  }, [unifiedFolios, currentVal, investedVal]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-neutral-200 rounded w-1/3 mb-4" />
              <div className="h-8 bg-neutral-200 rounded w-full" />
            </div>
          ))}
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 animate-pulse h-96" />
      </div>
    );
  }

  const hasScore = !!scoreReport;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-clash text-neutral-900">Portfolio Overview</h2>
          <p className="text-neutral-500 text-sm mt-1">
            Real-time snapshot of your investment portfolio health
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-200 bg-white rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Refresh
          </button>
          <button
            onClick={onAnalyzePortfolio}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl text-sm font-semibold hover:bg-neutral-700 transition"
          >
            <BarChart3 className="w-4 h-4" />
            Analyze Portfolio
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-500 font-medium">Current Value</span>
            <Wallet className="w-5 h-5 text-neutral-400" />
          </div>
          <p className="text-3xl font-bold font-clash text-neutral-900">{formatCurrency(currentVal)}</p>
          <p className="text-sm text-neutral-500 mt-1">
            {unifiedFolios.length} holdings across {Object.keys(
              unifiedFolios.reduce((acc, f) => {
                acc[getSchemeCategory(f.schemeName || '')] = true;
                return acc;
              }, {} as Record<string, boolean>)
            ).length} categories
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-500 font-medium">Total Invested</span>
            <Percent className="w-5 h-5 text-neutral-400" />
          </div>
          <p className="text-3xl font-bold font-clash text-neutral-900">{formatCurrency(investedVal)}</p>
          <p className="text-sm text-neutral-500 mt-1">Total capital deployed</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-500 font-medium">Total Gain/Loss</span>
            <TrendingUp className="w-5 h-5 text-neutral-400" />
          </div>
          <p className="text-3xl font-bold font-clash text-neutral-900">
            {formatCurrency(totalGain)}
          </p>
          <p className={`text-sm mt-1 ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercent(totalReturnPct)} return
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold font-clash text-neutral-900">Portfolio Allocation</h3>
                <p className="text-sm text-neutral-500">Breakdown by fund category</p>
              </div>
              <button
                onClick={() => setViewFullReport(!viewFullReport)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 bg-white rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition"
              >
                {viewFullReport ? 'Show Less' : 'View Full Report'}
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {viewFullReport && scoreReport ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-neutral-900 mb-3">Score Breakdown</h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Goal Alignment', value: scoreReport.goalAlignment, color: 'bg-blue-500' },
                        { label: 'Asset Allocation', value: scoreReport.assetAlloc, color: 'bg-green-500' },
                        { label: 'Diversification', value: scoreReport.diversification, color: 'bg-amber-500' },
                        { label: 'Discipline', value: scoreReport.discipline, color: 'bg-purple-500' },
                        { label: 'Efficiency', value: scoreReport.efficiency, color: 'bg-red-500' },
                      ].map((item) => (
                        <div key={item.label} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600">{item.label}</span>
                            <span className="font-bold text-neutral-900">{item.value}/100</span>
                          </div>
                          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${item.color}`}
                              style={{ width: `${item.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-neutral-900 mb-3">Portfolio Tag</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-3xl font-bold font-clash text-neutral-900">{scoreReport.total}</span>
                        <span className="text-neutral-500 ml-2">/100</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        scoreReport.tag === 'ALIGNED' ? 'bg-green-100 text-green-700' :
                        scoreReport.tag === 'MODERATE' ? 'bg-amber-100 text-amber-700' :
                        scoreReport.tag === 'NEEDS_REVIEW' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {scoreReport.tag}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 mt-3">{scoreReport.insights?.summary || 'Portfolio analysis complete'}</p>
                  </div>
                </div>
                <div className="relative h-64">
                  <ChartRadarDots
                    data={[
                      { month: 'Goal Alignment', desktop: scoreReport?.goalAlignment || 0 },
                      { month: 'Asset Allocation', desktop: scoreReport?.assetAlloc || 0 },
                      { month: 'Diversification', desktop: scoreReport?.diversification || 0 },
                      { month: 'Discipline', desktop: scoreReport?.discipline || 0 },
                      { month: 'Efficiency', desktop: scoreReport?.efficiency || 0 },
                    ]}
                    categoryKey="month"
                    dataKey="desktop"
                    dataLabel="Score"
                    title="Score Breakdown"
                    descriptionText="Portfolio health metrics across key dimensions"
                  />
                </div>
              </>
            ) : (
              <div className="relative h-64">
                <ChartAreaInteractive
                  data={chartData}
                />
              </div>
            )}
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold font-clash text-neutral-900 mb-4">Category Allocation</h3>
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">{cat.category}</span>
                    <span className="font-bold text-neutral-900">{formatCurrency(cat.value)} ({cat.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neutral-900 rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold font-clash text-neutral-900 mb-4">Holdings Detail</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {unifiedFolios.map((folio, index) => (
                <div key={index} className="bg-neutral-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center text-neutral-600 font-bold text-sm">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-neutral-900 text-sm">{folio.schemeName || 'Unknown Fund'}</p>
                        <p className="text-xs text-neutral-500">{getSchemeCategory(folio.schemeName || '')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neutral-900">{formatCurrency(folio.aum || 0)}</p>
                      <p className="text-xs text-neutral-500">{folio.units?.toLocaleString() || '0'} units</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-neutral-500">Invested</p>
                      <p className="font-semibold text-neutral-900">{formatCurrency(folio.purchaseValue || 0)}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Current</p>
                      <p className="font-semibold text-neutral-900">{formatCurrency(folio.aum || 0)}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Gain/Loss</p>
                      <p className={`font-semibold ${(folio.aum || 0) - (folio.purchaseValue || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency((folio.aum || 0) - (folio.purchaseValue || 0))}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {hasScore && scoreReport && (
            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold font-clash text-neutral-900 mb-4">Score Insights</h3>
              <div className="prose prose-sm max-w-none text-neutral-700">
                <p>{scoreReport.insights?.summary || 'No insights available'}</p>
                {scoreReport.insights?.recommendations && scoreReport.insights.recommendations.length > 0 && (
                  <ul className="list-disc list-inside mt-3 space-y-1">
                    {scoreReport.insights.recommendations.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PortfolioOverview(props: PortfolioOverviewProps) {
  return (
    <ErrorBoundary>
      <PortfolioOverviewContent {...props} />
    </ErrorBoundary>
  );
}

export default PortfolioOverview;