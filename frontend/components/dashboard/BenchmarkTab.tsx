'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, Minus, Info, RefreshCw, Download, FileText,
  Search, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AdminBenchmarkResponse,
  AdminBenchmarkMeta,
  Timeframe,
  BenchmarkTimePoint,
  BenchmarkMetrics,
} from '@finanalysis/shared';

interface ExistingClientSummary {
  id: string;
  name: string | null;
  pan: string | null;
  email: string | null;
  mobile: string | null;
  aum: number | null;
}

interface PortfolioSummary {
  id: string;
  createdAt: string;
  rowCount: number;
  totalInvested: number;
  totalCurrentValue: number;
  assessment?: { goal?: string | null } | null;
}

const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: '1Y', label: '1Y' },
  { value: '3Y', label: '3Y' },
  { value: '5Y', label: '5Y' },
  { value: 'ALL', label: 'All' },
];

const METRIC_CONFIG = [
  { key: 'portfolioXIRR', label: 'Portfolio XIRR', suffix: '%', higherBetter: true, ideal: undefined },
  { key: 'alpha', label: 'Alpha (vs Nifty 50 TRI)', suffix: '%', higherBetter: true, ideal: undefined },
  { key: 'beta', label: 'Beta (vs Nifty 50 TRI)', suffix: 'x', higherBetter: null, ideal: 1 },
  { key: 'sharpeRatio', label: 'Sharpe Ratio', suffix: '', higherBetter: true, ideal: undefined },
  { key: 'informationRatio', label: 'Information Ratio', suffix: '', higherBetter: true, ideal: undefined },
  { key: 'maxDrawdown', label: 'Max Drawdown', suffix: '%', higherBetter: false, ideal: undefined },
] as const;

type MetricKey = typeof METRIC_CONFIG[number]['key'];

function formatNumber(value: number, key: MetricKey): string {
  if (key === 'beta' || key === 'sharpeRatio' || key === 'informationRatio') {
    return value.toFixed(2);
  }
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

function getMetricColor(value: number, higherBetter: boolean | null, ideal?: number): string {
  if (higherBetter === null && ideal !== undefined) {
    return Math.abs(value - ideal) < 0.15 ? 'text-emerald-600' : 'text-neutral-900';
  }
  return higherBetter ? (value > 0 ? 'text-emerald-600' : 'text-red-600') : (value < 0 ? 'text-emerald-600' : 'text-red-600');
}

function getQualityBadge(dataQuality: AdminBenchmarkMeta['dataQuality']) {
  if (dataQuality === 'FULL_RECONSTRUCTION') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-700 rounded-full">
        <CheckCircle className="w-2.5 h-2.5" /> Full Reconstruction
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-bold bg-amber-100 text-amber-700 rounded-full">
      <AlertTriangle className="w-2.5 h-2.5" /> Reported Metrics Only
    </span>
  );
}

function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 w-48 bg-neutral-200 rounded" />
        <div className="h-6 w-32 bg-neutral-200 rounded" />
      </div>
      <div className="h-[380px] bg-neutral-200 rounded-2xl" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 bg-neutral-200 rounded-2xl">
            <div className="h-3 w-3/4 bg-neutral-300 rounded mb-2" />
            <div className="h-8 w-1/2 bg-neutral-300 rounded mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-neutral-200 rounded-2xl">
      <Info className="w-12 h-12 text-neutral-300 mb-4" />
      <p className="text-neutral-500 text-sm font-sans mb-4">{message}</p>
      {action}
    </div>
  );
}

interface BenchmarkTabProps {
  userPortfolios: PortfolioSummary[];
  clientData: ExistingClientSummary | null;
  report: AdminBenchmarkResponse | null;
  loading: boolean;
  error: string | null;
  timeframe: Timeframe;
  onFetchBenchmark: (params: { portfolioId?: string; clientId?: string; timeframe: Timeframe }) => Promise<void>;
  onTimeframeChange: (tf: Timeframe) => void;
}

export function BenchmarkTab({
  userPortfolios,
  clientData,
  report,
  loading,
  error,
  timeframe,
  onFetchBenchmark,
  onTimeframeChange,
}: BenchmarkTabProps) {
  const [source, setSource] = useState<'portfolio' | 'client'>('portfolio');
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('');
  const [showPortfolioDropdown, setShowPortfolioDropdown] = useState(false);
  const [portfolioSearch, setPortfolioSearch] = useState('');

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const filteredPortfolios = useMemo(() => {
    if (!portfolioSearch) return userPortfolios;
    const search = portfolioSearch.toLowerCase();
    return userPortfolios.filter(p =>
      p.id.toLowerCase().includes(search) ||
      p.assessment?.goal?.toLowerCase().includes(search) ||
      new Date(p.createdAt).toLocaleDateString('en-IN').includes(search)
    );
  }, [userPortfolios, portfolioSearch]);

  const chartData = useMemo(() => {
    if (!report?.timeSeries) return [];
    return report.timeSeries.map((point: BenchmarkTimePoint) => ({
      date: new Date(point.date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      Portfolio: point.portfolioValue,
      'Nifty 50 TRI': point.nifty50TRI,
      'Nifty 500 TRI': point.nifty500TRI,
      'Midcap 150 TRI': point.niftyMidcap150TRI,
      'Smallcap 250 TRI': point.niftySmallcap250TRI,
      'Category Avg': point.categoryAverage,
    }));
  }, [report]);

  const metrics = useMemo(() => {
    if (!report?.metrics) return [];
    const m = report.metrics as BenchmarkMetrics;
    return METRIC_CONFIG.map(({ key, label, suffix, higherBetter, ideal }) => {
      const value = m[key] as number;
      const formatted = formatNumber(value, key);
      const isPositive = higherBetter === null
        ? Math.abs(value - (ideal || 0)) < 0.15
        : higherBetter ? value > 0 : value < 0;
      return { label, value: formatted, raw: value, isPositive, higherBetter, key };
    });
  }, [report]);

  const handleExportCSV = () => {
    if (!report) return;
    const rows = [
      ['Metric', 'Value'],
      ['Source', report.source],
      ['Client/Portfolio', report.clientName || report.portfolioId || ''],
      ['Timeframe', timeframe],
      ['Generated', new Date().toISOString()],
      [''],
      ['Metric', 'Value'],
      ...Object.entries(report.metrics).map(([k, v]) => [k, typeof v === 'number' ? v.toFixed(4) : v]),
      [''],
      ['Meta', 'Value'],
      ['Fund Count', report.meta.fundCount.toString()],
      ['Dominant Category', report.meta.dominantCategory],
      ['Benchmark Used', report.meta.benchmarkUsed],
      ['Data Quality', report.meta.dataQuality],
      ['Warnings', report.meta.warnings?.join('; ') || 'None'],
      [''],
      ['Date', 'Portfolio', 'Nifty 50 TRI', 'Nifty 500 TRI', 'Midcap 150 TRI', 'Smallcap 250 TRI', 'Category Avg'],
      ...report.timeSeries.map(p => [
        p.date,
        p.portfolioValue.toFixed(2),
        p.nifty50TRI.toFixed(2),
        p.nifty500TRI.toFixed(2),
        p.niftyMidcap150TRI.toFixed(2),
        p.niftySmallcap250TRI.toFixed(2),
        p.categoryAverage.toFixed(2),
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `benchmark-${report.clientName || report.portfolioId || 'report'}-${timeframe}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleSourceChange = (newSource: 'portfolio' | 'client') => {
    setSource(newSource);
    setSelectedPortfolioId('');
    setPortfolioSearch('');
    setShowPortfolioDropdown(false);
    if (newSource === 'portfolio' && userPortfolios.length > 0) {
      onFetchBenchmark({ portfolioId: userPortfolios[0].id, timeframe });
    } else if (newSource === 'client' && clientData) {
      onFetchBenchmark({ clientId: clientData.id, timeframe });
    }
  };

  const handlePortfolioSelect = (portfolioId: string) => {
    setSelectedPortfolioId(portfolioId);
    const portfolio = userPortfolios.find(p => p.id === portfolioId);
    if (portfolio) {
      const date = new Date(portfolio.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' });
      setPortfolioSearch(`${portfolio.rowCount} funds · ₹${portfolio.totalCurrentValue.toLocaleString('en-IN')} · ${date}`);
    }
    setShowPortfolioDropdown(false);
    onFetchBenchmark({ portfolioId, timeframe });
  };

  if (loading && !report) return <SkeletonLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
            Portfolio Benchmarking
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-clash text-neutral-900 mt-1">
            Market Comparison & Risk Analytics
          </h2>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportCSV}
            disabled={!report}
            className="px-4 py-2 text-xs font-bold font-mono bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl transition duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Source Selector */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Data Source:</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="benchmark-source"
                checked={source === 'portfolio'}
                onChange={() => handleSourceChange('portfolio')}
                className="w-4 h-4 text-primary border-primary focus:ring-primary accent-primary"
              />
              <span className="text-sm font-medium text-neutral-900">My Portfolio</span>
              {userPortfolios.length > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-mono bg-neutral-100 text-neutral-600 rounded-full">
                  {userPortfolios.length}
                </span>
              )}
            </label>
            {clientData && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="benchmark-source"
                  checked={source === 'client'}
                  onChange={() => handleSourceChange('client')}
                  className="w-4 h-4 text-primary border-primary focus:ring-primary accent-primary"
                />
                <span className="text-sm font-medium text-neutral-900">Certified Valuation</span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-100 text-emerald-700 rounded-full">
                  CRM Matched
                </span>
              </label>
            )}
          </div>
        </div>

        {/* Portfolio Dropdown */}
        {source === 'portfolio' && userPortfolios.length > 0 && (
          <div className="relative">
            <div className="flex items-center gap-2 border border-neutral-200 rounded-xl bg-white">
              <Search className="w-4 h-4 text-neutral-400 ml-3" />
              <input
                type="text"
                placeholder="Search portfolios by ID, goal, date..."
                value={portfolioSearch}
                onChange={(e) => setPortfolioSearch(e.target.value)}
                className="flex-1 pl-10 pr-10 py-3 text-sm border-0 bg-transparent focus:outline-none text-neutral-900 placeholder-neutral-400"
                readOnly
              />
              {portfolioSearch && (
                <button
                  onClick={() => setPortfolioSearch('')}
                  className="mr-3 text-neutral-400 hover:text-neutral-900"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setShowPortfolioDropdown(!showPortfolioDropdown)}
                className="mr-3 text-neutral-400 hover:text-neutral-900"
              >
                {showPortfolioDropdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {showPortfolioDropdown && filteredPortfolios.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden z-10 max-h-60 overflow-y-auto">
                {filteredPortfolios.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handlePortfolioSelect(p.id)}
                    className={cn(
                      'w-full px-4 py-3 text-left text-sm border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition',
                      selectedPortfolioId === p.id && 'bg-primary/5'
                    )}
                  >
                    <div className="font-semibold text-neutral-900">
                      {p.assessment?.goal ? `Goal: ${p.assessment.goal}` : 'Portfolio'}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1 text-[10px] font-mono text-neutral-500">
                      <span>{p.rowCount} funds</span>
                      <span>Invested: ₹{p.totalInvested.toLocaleString('en-IN')}</span>
                      <span>Current: ₹{p.totalCurrentValue.toLocaleString('en-IN')}</span>
                      <span>{new Date(p.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {showPortfolioDropdown && filteredPortfolios.length === 0 && userPortfolios.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg p-4 text-center text-neutral-500 text-sm">
                No portfolios match your search
              </div>
            )}
          </div>
        )}

        {/* Certified Valuation Info */}
        {source === 'client' && clientData && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="font-medium text-emerald-800">Using certified CRM valuation data</span>
            </div>
            <div className="mt-2 text-xs text-emerald-700 font-sans">
              Client: <span className="font-mono">{clientData.name || 'Unknown'}</span>
              {clientData.pan && (
                <>
                  <span className="mx-2">|</span> <span className="font-mono">PAN: {clientData.pan}</span>
                </>
              )}
              {clientData.aum && (
                <>
                  <span className="mx-2">|</span> <span className="font-mono">AUM: ₹{clientData.aum.toLocaleString('en-IN')}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Data Quality Badge */}
        {report && (
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            {getQualityBadge(report.meta.dataQuality)}
            {report.meta.warnings && report.meta.warnings.length > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                <AlertTriangle className="w-3 h-3" />
                <span>{report.meta.warnings[0]}</span>
              </div>
            )}
            <div className="ml-auto text-[10px] font-mono text-neutral-500">
              {report.meta.fundCount} funds · {report.meta.dominantCategory} · {report.metrics.computationTimeMs}ms
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && !report && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
          <button onClick={() => onFetchBenchmark({ portfolioId: selectedPortfolioId || undefined, clientId: source === 'client' && clientData ? clientData.id : undefined, timeframe })} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {/* Timeframe Selector */}
      {report && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Timeframe:</span>
          {TIMEFRAMES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onTimeframeChange(value)}
              className={cn(
                'px-3 py-1.5 text-xs font-mono font-medium rounded-xl transition-all',
                timeframe === value
                  ? 'bg-neutral-900 text-white shadow-md'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Growth Trajectory Chart */}
      {report && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-bold font-clash text-neutral-900">Growth Trajectory (Normalized to 100)</h3>
            <p className="text-[10px] font-mono text-neutral-500 mt-0.5">
              Portfolio value vs benchmarks over selected period
            </p>
          </div>
          <div className="h-[380px] w-full" style={{ minHeight: '380px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fontFamily: 'monospace', fill: '#737373' }}
                  axisLine={{ stroke: '#e5e5e5' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fontFamily: 'monospace', fill: '#737373' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v.toFixed(0)}`}
                  domain={['dataMin - 10', 'dataMax + 10']}
                />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any, name: any) => [
                    name === 'date' ? value : typeof value === 'number' ? `${value.toFixed(1)}` : '-',
                    String(name ?? ''),
                  ]}
                  labelFormatter={(date) => `As of ${date}`}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '8px' }}
                  formatter={(value) => (
                    <span className="text-xs font-mono text-neutral-600">{value}</span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="Portfolio"
                  stroke="#09090b"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 2, fill: '#09090b', stroke: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="Nifty 50 TRI"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Category Avg"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs font-mono text-neutral-500">
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-0.5 bg-[#09090b]" /> Portfolio
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-0.5 border-t-[1.5px] border-dashed border-[#10b981]" /> Nifty 50 TRI
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-0.5 border-t-[1.5px] border-dashed border-[#06b6d4]" /> Category Avg
            </span>
          </div>
        </div>
      )}

      {/* Risk Metrics Grid */}
      {report && metrics.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics.map(({ label, value, isPositive, higherBetter, raw }) => (
            <div
              key={label}
              className="p-4 bg-white border border-neutral-200 rounded-2xl text-center"
            >
              <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1.5">
                {label}
              </p>
              <p className={cn(
                'text-2xl font-bold font-chillax',
                getMetricColor(raw, higherBetter)
              )}>
                {value}
              </p>
              {higherBetter !== null && (
                <span className={cn(
                  'text-[9px] font-mono mt-1 inline-block',
                  isPositive ? 'text-emerald-600' : 'text-red-600'
                )}>
                  {isPositive ? '▲' : '▼'} vs Benchmark
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !report && !error && (
        <EmptyState
          message={source === 'portfolio'
            ? userPortfolios.length === 0
              ? 'No portfolios uploaded yet. Upload a portfolio to see benchmark analysis.'
              : 'Select a portfolio to view benchmark analysis'
            : 'No certified valuation data available. Ensure CRM data is imported.'}
          action={
            <p className="text-[10px] font-mono text-neutral-400">
              {source === 'portfolio' && userPortfolios.length === 0
                ? 'Use the Upload Portfolio tab to add your holdings'
                : 'Use the dropdown above to choose a portfolio'}
            </p>
          }
        />
      )}

      {!loading && !report && !error && selectedPortfolioId && (
        <EmptyState
          message="No benchmark data available for this selection"
          action={
            <button
              onClick={() => onFetchBenchmark({ portfolioId: selectedPortfolioId, timeframe })}
              className="px-4 py-2 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary/90 transition"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Retry
            </button>
          }
        />
      )}

      {/* Footer Meta */}
      {report && (
        <div className="pt-4 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-neutral-500">
          <span>Primary Benchmark: {report.meta.benchmarkUsed}</span>
          <span>Data Points: {report.metrics.dataPoints}</span>
          <span>Computed in {report.metrics.computationTimeMs}ms</span>
        </div>
      )}
    </div>
  );
}