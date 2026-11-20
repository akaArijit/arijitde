'use client';

import { useState } from 'react';
import { FileSpreadsheet, Loader2, Plus, Trash2, Download, X, ChevronRight, Upload, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UploadZone } from '@/components/admin/UploadZone';
import { PasswordStrengthMeter } from '@/components/PasswordStrengthMeter';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { PortfolioRow, Portfolio, ExistingClientData, FundType } from '@finanalysis/shared';

// Local type for manual entry rows (string dates, no DB IDs)
interface ManualPortfolioRow {
  fundName: string;
  type: FundType;
  startDate: string;
  sipAmount: number;
  invested: number;
  currentValue: number;
}

interface PortfolioAnalyzerProps {
  activeAssessmentId: string | null;
  existingClientData: ExistingClientData | null;
  activePortfolio: Portfolio | null;
  isLoading: boolean;
  onAnalyze: () => void;
  onUploadSubmit: (file: File) => Promise<void>;
  onManualSubmit: (e: React.FormEvent) => Promise<void>;
  onAddManualRow: () => void;
  onRemoveManualRow: (index: number) => void;
  onDownloadTemplate: () => void;
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  manualRows: ManualPortfolioRow[];
  setManualRows: (rows: ManualPortfolioRow[]) => void;
  analyzeTab: 'FILE' | 'MANUAL';
  setAnalyzeTab: (tab: 'FILE' | 'MANUAL') => void;
}

export function PortfolioAnalyzer({
  activeAssessmentId,
  existingClientData,
  activePortfolio,
  isLoading,
  onAnalyze,
  onUploadSubmit,
  onManualSubmit,
  onAddManualRow,
  onRemoveManualRow,
  onDownloadTemplate,
  uploadedFile,
  setUploadedFile,
  manualRows,
  setManualRows,
  analyzeTab,
  setAnalyzeTab,
}: PortfolioAnalyzerProps) {
  const [showTemplate, setShowTemplate] = useState(false);

  if (!activeAssessmentId) {
    return (
      <ErrorBoundary>
        <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Complete Your Profile First</h3>
          <p className="text-neutral-500 mb-6 max-w-md mx-auto">
            Please complete your lifecycle assessment to unlock portfolio analysis features.
          </p>
          <button
            onClick={() => window.location.href = '/quiz'}
            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-700 transition"
          >
            Complete Assessment
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </ErrorBoundary>
    );
  }

  const hasExistingClientData = existingClientData && existingClientData.folios && existingClientData.folios.length > 0;

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div>
            <h2 className="text-xl font-bold font-clash text-neutral-900">Portfolio Analyzer</h2>
            <p className="text-neutral-500 text-sm">Upload or manually enter your portfolio for analysis</p>
          </div>
        </div>

        <div className="flex gap-2 border-b border-neutral-200 mb-6">
          <button
            onClick={() => setAnalyzeTab('FILE')}
            className={`px-4 py-2 text-sm font-semibold rounded-t-xl transition ${
              analyzeTab === 'FILE'
                ? 'bg-white border-b-2 border-neutral-900 text-neutral-900'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Upload File
          </button>
          <button
            onClick={() => setAnalyzeTab('MANUAL')}
            className={`px-4 py-2 text-sm font-semibold rounded-t-xl transition ${
              analyzeTab === 'MANUAL'
                ? 'bg-white border-b-2 border-neutral-900 text-neutral-900'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Manual Entry
          </button>
        </div>

        {analyzeTab === 'FILE' && (
          <>
            <UploadZone
              onUpload={async (file) => {
                setUploadedFile(file);
                await onUploadSubmit(file);
              }}
              accept=".csv,.xlsx,.xls"
              loading={isLoading}
              title="Upload Portfolio File"
              description="CSV or Excel format supported"
              subDescription="Columns: Fund Name, Type, Start Date, SIP Amount, Invested, Current Value"
              className="mb-4"
            />

            {uploadedFile && !isLoading && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">File Ready</p>
                    <p className="text-sm text-green-600">{uploadedFile.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onDownloadTemplate}
                className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-200 bg-white rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition"
              >
                <Download className="w-4 h-4" />
                Download Template
              </button>
              {uploadedFile && !isLoading && (
                <button
                  onClick={() => setUploadedFile(null)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl text-sm font-semibold hover:bg-neutral-700 transition"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </>
        )}

        {analyzeTab === 'MANUAL' && (
          <div className="space-y-4">
            <div className="bg-neutral-50 rounded-xl p-4">
              <p className="text-sm text-neutral-600 mb-4">
                Enter your portfolio holdings manually. Add up to 15 rows.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="px-3 py-2 text-left text-xs font-bold text-neutral-500 uppercase">Fund Name</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-neutral-500 uppercase">Type</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-neutral-500 uppercase">Start Date</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-neutral-500 uppercase">SIP Amt</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-neutral-500 uppercase">Invested</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-neutral-500 uppercase">Current</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-neutral-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manualRows.map((row, index) => (
                      <tr key={index} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={row.fundName}
                            onChange={(e) => setManualRows(manualRows.map((r, i) => i === index ? { ...r, fundName: e.target.value } : r))}
                            placeholder="Fund Name"
                            className="w-full px-3 py-1.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={row.type}
                            onChange={(e) => setManualRows(manualRows.map((r, i) => i === index ? { ...r, type: e.target.value as FundType } : r))}
                            className="w-full px-3 py-1.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="SIP">SIP</option>
                            <option value="LUMPSUM">Lumpsum</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="date"
                            value={row.startDate}
                            onChange={(e) => setManualRows(manualRows.map((r, i) => i === index ? { ...r, startDate: e.target.value } : r))}
                            className="w-full px-3 py-1.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={row.sipAmount}
                            onChange={(e) => setManualRows(manualRows.map((r, i) => i === index ? { ...r, sipAmount: Number(e.target.value) } : r))}
                            placeholder="0"
                            className="w-full px-3 py-1.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={row.invested}
                            onChange={(e) => setManualRows(manualRows.map((r, i) => i === index ? { ...r, invested: Number(e.target.value) } : r))}
                            placeholder="0"
                            className="w-full px-3 py-1.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={row.currentValue}
                            onChange={(e) => setManualRows(manualRows.map((r, i) => i === index ? { ...r, currentValue: Number(e.target.value) } : r))}
                            placeholder="0"
                            className="w-full px-3 py-1.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => manualRows.length > 1 && onRemoveManualRow(index)}
                            disabled={manualRows.length <= 1}
                            className="text-red-500 hover:text-red-700 disabled:opacity-30 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={onAddManualRow}
                  disabled={manualRows.length >= 15}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-200 bg-white rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Row
                </button>
                <button
                  onClick={onDownloadTemplate}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-200 bg-white rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition"
                >
                  <Download className="w-4 h-4" />
                  Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default PortfolioAnalyzer;