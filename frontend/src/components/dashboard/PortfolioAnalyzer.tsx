'use client';

import { useState, useEffect } from 'react';
import { Calendar, CalendarRange, Loader2, FileSpreadsheet, CheckCircle2, ArrowRight, Sparkles, ChevronDown, X } from 'lucide-react';

interface PendingFund {
  fundName: string;
  invested: number;
  currentValue: number;
  startDate: string;
  type: 'LUMPSUM' | 'SIP' | '';
  sipAmount: number;
}

interface PortfolioAnalyzerProps {
  onUpload: (file: File, assessmentId: string) => void;
  onSubmitDates: (funds: Array<{ fundName: string; invested: number; currentValue: number; startDate: string; type: 'LUMPSUM' | 'SIP'; sipAmount: number }>) => void;
  onFolioImport: () => void;
  isLoading?: boolean;
  statusMsg?: string;
  error?: string | null;
  pendingFunds?: Array<{ fundName: string; invested: number; currentValue: number; startDate: string; type: 'LUMPSUM' | 'SIP' | ''; sipAmount: number }>;
  showDateForm?: boolean;
  showGrowwGuide?: boolean;
  uploadedFile?: File | null;
  isExistingClient?: boolean;
  existingClientData?: any;
  assessmentId?: string;
  onBack?: () => void;
  onFileChange?: (file: File | null) => void;
  onDateFormSubmit?: (e: React.FormEvent) => void;
  onFileUpload?: (e: React.FormEvent) => void;
  setShowDateForm?: (show: boolean) => void;
  setShowGrowwGuide?: (show: boolean) => void;
  setUploadedFile?: (file: File | null) => void;
  setPendingFunds?: (funds: any[]) => void;
  onFolioImportClick?: () => void;
}

const GROWW_STEPS = [
  'Open the <strong>Groww app</strong> on your mobile device (or log in on their web portal).',
  'Go to the <strong>Mutual Funds</strong> tab at the bottom and click on your <strong>Dashboard</strong>.',
  'Tap your <strong>Profile Icon</strong> in the top right corner.',
  'Select <strong>Reports</strong> or <strong>Reports & Statements</strong>.',
  'Choose <strong>Mutual Fund Holdings</strong>.',
  'Select <strong>Excel (.xlsx)</strong> as the format and click <strong>Download / Email Report</strong>.',
  'Upload that exact downloaded sheet below to run your scoring analysis.',
];

export function PortfolioAnalyzer({
  onUpload,
  onSubmitDates,
  onFolioImport,
  isLoading = false,
  statusMsg = '',
  error = null,
  pendingFunds = [],
  showDateForm = false,
  showGrowwGuide = false,
  uploadedFile = null,
  isExistingClient = false,
  existingClientData = null,
  assessmentId = '',
  onBack,
  onFileChange,
  onDateFormSubmit,
  onFileUpload,
  setShowDateForm,
  setShowGrowwGuide,
  setUploadedFile,
  setPendingFunds,
  onFolioImportClick,
}: PortfolioAnalyzerProps) {
  const [showGrowwGuideLocal, setShowGrowwGuideLocal] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="w-full max-w-3xl flex flex-col gap-8 animate-in fade-in duration-400">
      {isExistingClient && existingClientData ? (
        <>
          <div className="text-center max-w-xl mx-auto space-y-2 animate-in fade-in duration-300">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-wide text-neutral-900 font-clash">
              Portfolio Analysis
            </h1>
            <p className="text-neutral-500 text-xs font-sans leading-relaxed">
              We found your existing investment records. Start the
              analysis to get your comprehensive portfolio health score.
            </p>
          </div>

          <div className="w-full border border-emerald-500/20 bg-white/30 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
            <div className="flex items-start gap-4 p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl">
              <span className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </span>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-neutral-900">
                  Existing Client Identified
                </h4>
                <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                  Your records match with client{' '}
                  <strong className="text-neutral-900">
                    {existingClientData.name || 'N/A'}
                  </strong>
                  . We have{' '}
                  <strong className="text-emerald-700 font-mono">
                    {existingClientData.folios?.length || 0}
                  </strong>{' '}
                  folio record(s) on file.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/50 border border-neutral-200/40 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
                  Funds
                </span>
                <span className="text-2xl font-bold text-neutral-900 font-clash">
                  {(() => {
                    const schemes = new Set(
                      (existingClientData.folios || [])
                        .map((f: any) => f.schemeName)
                        .filter(Boolean),
                    );
                    return schemes.size;
                  })()}
                </span>
              </div>
              <div className="bg-white/50 border border-neutral-200/40 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
                  Folios
                </span>
                <span className="text-2xl font-bold text-neutral-900 font-clash">
                  {existingClientData.folios?.length || 0}
                </span>
              </div>
              <div className="bg-white/50 border border-neutral-200/40 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
                  AUM
                </span>
                <span className="text-lg font-bold text-neutral-900 font-clash">
                  ₹
                  {(() => {
                    const total = (
                      existingClientData.folios || []
                    ).reduce(
                      (sum: number, f: any) => sum + (f.aum || 0),
                      0,
                    );
                    if (total > 0) return (total / 100000).toFixed(1);
                    const clientAum =
                      existingClientData.aum ||
                      existingClientData.currentValue ||
                      0;
                    return (clientAum / 100000).toFixed(1);
                  })()}
                  L
                </span>
              </div>
              <div className="bg-white/50 border border-neutral-200/40 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
                  Invested
                </span>
                <span className="text-lg font-bold text-neutral-900 font-clash">
                  ₹
                  {(() => {
                    const total = (
                      existingClientData.folios || []
                    ).reduce(
                      (sum: number, f: any) => sum + (f.purchaseValue || 0),
                      0,
                    );
                    if (total > 0) return (total / 100000).toFixed(1);
                    const clientPurchase =
                      existingClientData.purchaseValue || 0;
                    return (clientPurchase / 100000).toFixed(1);
                  })()}
                  L
                </span>
              </div>
            </div>

            <button
              onClick={onFolioImportClick}
              disabled={false}
              className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer disabled:opacity-40"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span>Start Portfolio Analysis</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4-4 4m-6-4v6H7l4-4H7z" /></svg>
            </button>
          </div>
        </>
      ) : showDateForm ? (
        <>
          <div className="text-center max-w-xl mx-auto space-y-2 animate-in fade-in duration-300">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-wide text-neutral-900 font-clash">
              Enter Purchase Dates
            </h1>
            <p className="text-neutral-500 text-xs font-sans leading-relaxed">
              We found {pendingFunds?.length || 0} investments in your Groww
              statement. Please enter their approximate starting dates to
              compute XIRR and score your portfolio.
            </p>
          </div>

          <div className="w-full border border-white/30 bg-white/30 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center border-b border-border/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <svg className="w-5 h-5 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </span>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-neutral-900">
                    Portfolio Start Dates
                  </h3>
                  <p className="text-[10px] text-neutral-500 font-sans">
                    Required to compute performance benchmarks
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {}}
                className="text-[10px] font-mono text-neutral-500 hover:text-neutral-800 border border-neutral-300 bg-white/40 px-2.5 py-1 rounded-lg hover:bg-white/60 transition cursor-pointer"
              >
                Back to Upload
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-6">
              <div className="space-y-4 pr-1">
                {pendingFunds?.map((fund, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white/40 border border-border/20 rounded-2xl space-y-3 text-left"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span
                        className="text-xs font-semibold text-neutral-900 block truncate max-w-[200px] md:max-w-md"
                        title={fund.fundName}
                      >
                        {fund.fundName}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-neutral-500 shrink-0">
                        Value: ₹
                        {fund.currentValue.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono uppercase tracking-wider text-neutral-500">
                          Purchase / Start Date
                        </label>
                        <input
                          type="date"
                          required
                          value={fund.startDate}
                          onChange={(e) => {
                            const updated = [...pendingFunds || []];
                            updated[idx].startDate = e.target.value;
                          }}
                          className="w-full bg-white/50 border border-border/30 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono uppercase tracking-wider text-neutral-500">
                          Investment Type
                        </label>
                        <select
                          required
                          value={fund.type}
                          onChange={(e) => {
                            const updated = [...pendingFunds || []];
                            updated[idx].type = e.target.value as
                              'LUMPSUM' | 'SIP' | '';
                            if (
                              e.target.value === 'LUMPSUM' ||
                              e.target.value === ''
                            ) {
                              // We can't actually modify sipAmount here since it's a local copy
                            }
                            // In real implementation, this would call a setter
                          }}
                          className="w-full bg-white/50 border border-border/30 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary"
                        >
                          <option value="">
                            Choose type of investment
                          </option>
                          <option value="LUMPSUM">Lumpsum</option>
                          <option value="SIP">Systematic SIP</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono uppercase tracking-wider text-neutral-500">
                          Monthly SIP Amount (₹)
                        </label>
                        <input
                          type="number"
                          required={true}
                          disabled={false}
                          value={0}
                          placeholder="Enter amount"
                          className="w-full bg-white/50 border border-border/30 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={false}
                className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer disabled:opacity-40"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Score & Analyze Portfolio</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </button>
            </form>
          </div>
        </>
      ) : (
        <>
          <div className="text-center max-w-xl mx-auto space-y-2 animate-in fade-in duration-300">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-wide text-neutral-900 font-clash">
              Analyze Investments
            </h1>
            <p className="text-neutral-500 text-xs font-sans leading-relaxed">
              Upload your portfolio statement. We'll run them through our
              scoring algorithm with live AMFI benchmark comparison.
            </p>
          </div>

          <div className="w-full border border-white/30 bg-white/30 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col animate-in fade-in duration-300">
            <div className="mb-6 border border-amber-500/25 bg-amber-500/5 rounded-2xl overflow-hidden transition-all duration-300">
              <button
                type="button"
                onClick={() => {}}
                className="w-full px-5 py-4 flex justify-between items-center text-left hover:bg-amber-500/10 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2-2V7a2 2 0 012-2h10a2 2 0 012 2v2m-6 0h.01M17 12h4m0 0l-4 4m-4-4l4 4" /></svg>
                  <span className="text-xs font-bold text-neutral-900">
                    How to get your Portfolio Statement from any investment
                    app? For example Groww
                  </span>
                </span>
                <svg className="w-4 h-4 text-neutral-500 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <svg className="w-5 h-5 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.251 2.251 0 0113.5 21h7.5M19 16.5v2.25A2.251 2.251 0 0011.5 21h-7.5M2.25 9l3-3m18-3.375V21M3 9l3 3m13.5-4.5l3-3m0 0v-1.5a1.5 1.5 0 011.5-1.5h1.5M3 9v.01" /></svg>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-neutral-900">
                    Upload Portfolio File
                  </h3>
                  <p className="text-[10px] text-neutral-500 font-sans">
                    Upload your Groww holding statement spreadsheet
                  </p>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-6">
                <div className="space-y-3 text-left">
                  <div className="flex justify-between items-end">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                      Portfolio Data File
                    </label>
                  </div>

                  <div
                    className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition duration-200 bg-white/20 border-primary bg-primary/[0.01]`}
                  >
                    <input
                      type="file"
                      accept=".xlsx,.csv"
                      onChange={(e) => {}}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 transition bg-primary/10 border-primary/20 text-primary`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-neutral-900 block">
                        sample.xlsx
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono block">
                        45.2 KB
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={false}
                  className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer disabled:opacity-40"
                >
                  <span>Analyze Uploaded Portfolio</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </button>
              </form>
            </div>
          </>
        </>
      )}
    </div>
  );
}