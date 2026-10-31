'use client';

import { Sparkles, ShieldCheck, FileText, ChevronRight } from 'lucide-react';

interface ScoreReportProps {
  scoreReport: {
    total: number;
    goalAlignment: number;
    assetAlloc: number;
    diversification: number;
    discipline: number;
    efficiency: number;
    tag: 'ALIGNED' | 'MODERATE' | 'NEEDS_REVIEW' | 'NEEDS_STRUCTURING';
    insights: string[] | { textInsights: string[]; comparison?: any };
  };
  onBookCall?: () => void;
  sessions?: any[];
  showBookCall?: boolean;
}

const getScoreColor = (score: number) => {
  if (score >= 75) return 'text-emerald-600 border-emerald-500/20 bg-emerald-50';
  if (score >= 60) return 'text-amber-600 border-amber-500/20 bg-amber-50';
  return 'text-red-600 border-red-500/20 bg-red-50';
};

const getScoreStroke = (score: number) => {
  if (score >= 75) return '#10b981';
  if (score >= 60) return '#d97706';
  return '#ef4444';
};

const getTagLabel = (tag: string) => {
  switch (tag) {
    case 'ALIGNED':
      return 'Perfectly Aligned';
    case 'MODERATE':
      return 'Moderately Aligned';
    case 'NEEDS_REVIEW':
      return 'Needs Critical Review';
    case 'NEEDS_STRUCTURING':
      return 'Needs Structuring';
    default:
      return tag;
  }
};

const getTagDesc = (tag: string) => {
  switch (tag) {
    case 'ALIGNED':
      return 'Your investment discipline, asset diversity, and cost efficiency are in excellent shape. Keep repeating the pattern.';
    case 'MODERATE':
      return 'Your portfolio is robust, but there are opportunities to optimize tax benefits, rebalance sector ratios, or trim overlaps.';
    case 'NEEDS_REVIEW':
      return 'Critical anomalies found. Value erosion, lack of asset diversification, or goal mismatches are dragging down your compound growth.';
    case 'NEEDS_STRUCTURING':
      return 'Your portfolio lacks structural direction relative to your lifecycle targets. A custom roadmap is highly recommended.';
    default:
      return '';
  }
};

export function ScoreReport({
  scoreReport,
  onBookCall,
  sessions = [],
  showBookCall = true,
}: ScoreReportProps) {
  const insightsList = Array.isArray(scoreReport.insights)
    ? scoreReport.insights
    : (scoreReport.insights as any)?.textInsights || [];

  return (
    <div className="w-full max-w-4xl space-y-10 animate-in fade-in duration-500 select-text">
      <div className="text-center max-w-lg mx-auto space-y-2">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-wide text-neutral-900">
          Your Evaluation Scorecard
        </h1>
        <p className="text-neutral-500 text-xs font-sans">
          Below is the core assessment breakdown computed from your
          portfolio's raw telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        <div className="md:col-span-5 border border-white/30 bg-white/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-6">
            COMPREHENSIVE RATING
          </span>

          <div className="relative w-40 h-40 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="68"
                stroke="rgba(0,0,0,0.05)"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="68"
                stroke={getScoreStroke(scoreReport.total)}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={427}
                strokeDashoffset={427 - (427 * scoreReport.total) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-neutral-900">
              <span className="text-5xl font-semibold font-chillax leading-none">
                {scoreReport.total}
              </span>
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mt-1">
                / 100
              </span>
            </div>
          </div>

          <div
            className={`px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider ${getScoreColor(scoreReport.total)}`}
          >
            {getTagLabel(scoreReport.tag)}
          </div>
        </div>

        <div className="md:col-span-7 border border-white/30 bg-white/30 rounded-3xl p-8 flex flex-col justify-between shadow-2xl backdrop-blur-xl">
          <div className="space-y-4">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              METRIC TELEMETRY BREAKDOWN
            </span>
            <h3 className="text-xl font-semibold text-neutral-900 tracking-wide">
              {getTagLabel(scoreReport.tag)}
            </h3>
            <p className="text-neutral-600 text-xs font-sans leading-relaxed">
              {getTagDesc(scoreReport.tag)}
            </p>
          </div>

          <div className="space-y-4.5 mt-8 md:mt-0">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium font-sans">
                <span className="text-neutral-500">Goal Alignment</span>
                <span className="text-neutral-800 font-mono">
                  {scoreReport.goalAlignment} / 20
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                  style={{
                    width: `${(scoreReport.goalAlignment / 20) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium font-sans">
                <span className="text-neutral-500">Asset Allocation</span>
                <span className="text-neutral-800 font-mono">
                  {scoreReport.assetAlloc} / 20
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#8a5cff] rounded-full transition-all duration-1000"
                  style={{
                    width: `${(scoreReport.assetAlloc / 20) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium font-sans">
                <span className="text-neutral-500">Diversification</span>
                <span className="text-neutral-800 font-mono">
                  {scoreReport.diversification} / 20
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-1000"
                  style={{
                    width: `${(scoreReport.diversification / 20) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium font-sans">
                <span className="text-neutral-500">SIP Discipline</span>
                <span className="text-neutral-800 font-mono">
                  {scoreReport.discipline} / 20
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                  style={{
                    width: `${(scoreReport.discipline / 20) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium font-sans">
                <span className="text-neutral-500">
                  Efficiency Matrix
                </span>
                <span className="text-neutral-800 font-mono">
                  {scoreReport.efficiency} / 20
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 rounded-full transition-all duration-1000"
                  style={{
                    width: `${(scoreReport.efficiency / 20) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full border border-white/30 bg-white/30 backdrop-blur-xl rounded-3xl p-8 space-y-6 shadow-2xl">
        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-2.5" /></svg>
          AI Generated Anomaly Insights
        </span>

        {(() => {
          if (insightsList.length === 0)
            return (
              <p className="text-neutral-500 text-xs font-mono py-4">
                No AI generated insights available.
              </p>
            );
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {insightsList.map((insight: string, idx: number) => (
                <div
                  key={idx}
                  className="p-5 bg-white/40 border border-white/30 rounded-2xl flex items-start gap-4"
                >
                  <div className="w-6 h-6 rounded-lg border border-border bg-white/60 flex items-center justify-center text-xs font-mono text-neutral-500 mt-0.5 shrink-0">
                    0{idx + 1}
                  </div>
                  <p className="text-neutral-800 text-xs leading-relaxed font-sans text-left">
                    {insight}
                  </p>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {showBookCall && (
        <div className="w-full border border-primary/20 bg-[radial-gradient(circle_at_top_right,rgba(138,92,255,0.06)_0%,transparent_60%)] bg-white/30 backdrop-blur-xl rounded-3xl p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-2xl relative overflow-hidden">
          <div className="space-y-4 max-w-xl text-left">
            <span className="text-[10px] font-mono text-primary border border-primary/30 bg-primary/5 px-3 py-1 rounded-full uppercase tracking-wider">
              Free Distributor Consulting
            </span>
            <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900 tracking-wide">
              Detailed Distribution Optimization Session
            </h2>
            <p className="text-neutral-600 text-xs font-sans leading-relaxed">
              Book your 1-on-1 strategy call with our distributor Arijit
              De for free! Get a comprehensive optimization roadmap,
              personalized tax restructuring report, and active
              rebalancing insights based on your score.
            </p>
            <div className="flex gap-6 items-center text-neutral-500 text-xs font-sans pt-1">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>SEBI MFD Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V21a2 2 0 002 2h6a2 2 0 002-2v-8a1 1 0 00-1-1h-5M5 9.5A1.5 1.5 0 016.5 7.5h13" /></svg>
                <span>Includes Detailed PDF</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto shrink-0 flex flex-col items-center justify-center p-6 bg-white/40 border border-white/30 rounded-2xl md:min-w-[240px] text-center font-sans">
            <div className="text-4xl font-semibold font-chillax text-neutral-900 mt-1">
              FREE
            </div>
            <button
              onClick={() => {}}
              className="w-full mt-6 py-3.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer shadow-lg"
            >
              <span>Book Consultation</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}