'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, RefreshCw, Eye, TrendingUp, DollarSign, BarChart3, Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminAUM, useAdminRecalculateAUM } from '@/hooks/admin-hooks';
import type { AUMData } from '@/lib/api-client';

interface AUMSummary {
  totalAUM: number;
  totalGain: number;
  avgCAGR: number | undefined;
  clientCount: number;
}

const SortIcon = ({ field, sortField, sortOrder }: { field: 'totalAUM' | 'absoluteReturn' | 'cagr' | 'xirr' | 'folioCount'; sortField: string; sortOrder: 'asc' | 'desc' }) => {
  if (sortField !== field) return <span className="w-4 h-4 text-neutral-300" />;
  return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 text-neutral-900" /> : <ChevronDown className="w-4 h-4 text-neutral-900" />;
};

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'N/A';
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
};

const formatPercent = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'N/A';
  const color = value >= 0 ? 'text-green-700' : 'text-red-700';
  const prefix = value >= 0 ? '+' : '';
  return <span className={`font-mono font-bold ${color}`}>{prefix}{value.toFixed(2)}%</span>;
};

export function AUMTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<'totalAUM' | 'absoluteReturn' | 'cagr' | 'xirr' | 'folioCount'>('totalAUM');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const {
    data: aumData,
    isLoading: fetchingAUM,
    refetch,
  } = useAdminAUM({ page, limit: 50, search: searchQuery, sortBy: sortField, sortOrder });

  const recalculateMutation = useAdminRecalculateAUM({
    onSuccess: () => {
      refetch();
    },
  });

  const refetchAUM = refetch as () => Promise<unknown>;

  const aumRecords = aumData?.data?.items || [];
  const pagination = aumData?.data ? { page: aumData.data.page, pages: aumData.data.pages, total: aumData.data.total } : null;
  const summary: AUMSummary | null = aumData?.data ? {
    totalAUM: aumRecords.reduce((sum: number, r: AUMData) => sum + r.totalAUM, 0),
    totalGain: aumRecords.reduce((sum: number, r: AUMData) => sum + r.totalGain, 0),
    avgCAGR: aumRecords.length > 0 ? aumRecords.reduce((sum, r) => sum + (r.cagr || 0), 0) / aumRecords.length : undefined,
    clientCount: aumRecords.length,
  } : null;

  const handleSort = (field: 'totalAUM' | 'absoluteReturn' | 'cagr' | 'xirr' | 'folioCount') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleRecalculate = async (clientId: string) => {
    try {
      await recalculateMutation.mutateAsync(clientId);
      alert('AUM recalculated successfully.');
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || 'Failed to recalculate AUM');
    }
  };

  const handleRecalculateAll = async () => {
    if (!confirm('Recalculate AUM for all clients? This may take a while.')) {
      return;
    }
    try {
      await recalculateMutation.mutateAsync('all');
      alert('AUM recalculated for all clients.');
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || 'Failed to recalculate AUM');
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-neutral-100 rounded-xl text-neutral-900">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 font-medium">Total AUM</p>
                <p className="text-2xl font-bold font-clash text-neutral-900">{formatCurrency(summary.totalAUM)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 rounded-xl text-green-700">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 font-medium">Total Gain</p>
                <p className="text-2xl font-bold font-clash text-green-700">{formatCurrency(summary.totalGain)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-700">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 font-medium">Avg CAGR</p>
                <p className="text-2xl font-bold font-clash text-blue-700">{summary.avgCAGR?.toFixed(2) || 'N/A'}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 rounded-xl text-purple-700">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 font-medium">Clients with Holdings</p>
                <p className="text-2xl font-bold font-clash text-purple-700">{summary.clientCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search, Sort & Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client name, PAN, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 transition duration-200 text-neutral-900 placeholder-neutral-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleRecalculateAll}
            disabled={recalculateMutation.isPending}
            className="px-4 py-3 border border-neutral-200 bg-white rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 cursor-pointer transition flex items-center gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", recalculateMutation.isPending && "animate-spin")} />
            Recalculate All
          </button>
        </div>
      </div>

      {/* AUM Table */}
      <div className="border border-neutral-200 bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs font-sans text-neutral-900">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 uppercase tracking-widest text-[10px] font-bold text-neutral-500 select-none">
                <th className="px-6 py-4 cursor-pointer hover:bg-neutral-100 transition" onClick={() => handleSort('totalAUM')}>
                  <div className="flex items-center gap-1.5">Total AUM <SortIcon field="totalAUM" sortField={sortField} sortOrder={sortOrder} /></div>
                </th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4 cursor-pointer hover:bg-neutral-100 transition" onClick={() => handleSort('folioCount')}>
                  <div className="flex items-center gap-1.5">Folios <SortIcon field="folioCount" sortField={sortField} sortOrder={sortOrder} /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-neutral-100 transition" onClick={() => handleSort('absoluteReturn')}>
                  <div className="flex items-center gap-1.5">Abs Return <SortIcon field="absoluteReturn" sortField={sortField} sortOrder={sortOrder} /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-neutral-100 transition" onClick={() => handleSort('cagr')}>
                  <div className="flex items-center gap-1.5">CAGR <SortIcon field="cagr" sortField={sortField} sortOrder={sortOrder} /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-neutral-100 transition" onClick={() => handleSort('xirr')}>
                  <div className="flex items-center gap-1.5">XIRR <SortIcon field="xirr" sortField={sortField} sortOrder={sortOrder} /></div>
                </th>
                <th className="px-6 py-4">Last Calculated</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {fetchingAUM ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-neutral-500 font-mono">
                    <RefreshCw className="w-6 h-6 text-neutral-900 animate-spin mx-auto mb-2" />
                    Loading AUM data...
                  </td>
                </tr>
              ) : aumRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-neutral-500 font-mono">
                    No AUM data found
                  </td>
                </tr>
              ) : (
                aumRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-neutral-50 transition duration-150 group"
                  >
                    <td className="px-6 py-4 font-mono text-neutral-900 font-bold text-right">
                      {formatCurrency(record.totalAUM)}
                    </td>
                    <td className="px-6 py-4 font-sans">
                      <div className="font-semibold text-neutral-900 text-sm group-hover:text-neutral-700 transition-colors duration-150">
                        {record.clientName}
                      </div>
                      <div className="flex flex-wrap gap-2 items-center mt-0.5">
                        <span className="text-[10px] text-neutral-500 font-mono bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                          {record.clientEmail}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono uppercase bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                          PAN: {record.clientPan}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-neutral-700 text-right">
                      {record.folioCount}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {formatPercent(record.absoluteReturn)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {formatPercent(record.cagr)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {formatPercent(record.xirr)}
                    </td>
                    <td className="px-6 py-4 font-mono text-neutral-500 text-right">
                      {new Date(record.lastCalculated).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRecalculate(record.id)}
                          disabled={recalculateMutation.isPending}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 bg-white hover:bg-neutral-100 rounded-lg transition duration-200 text-xs font-semibold cursor-pointer text-neutral-700 disabled:opacity-50"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Recalc
                        </button>
                        <button
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 bg-white hover:bg-neutral-900 hover:text-white rounded-lg transition duration-200 text-xs font-semibold cursor-pointer text-neutral-900"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="border-t border-neutral-200 px-6 py-4 flex items-center justify-between bg-neutral-50">
            <span className="text-[11px] font-mono text-neutral-500">
              Showing page {pagination.page} of {pagination.pages} ({pagination.total} total records)
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1 || fetchingAUM}
                onClick={() => setPage((prev) => prev - 1)}
                className="px-3 py-1.5 border border-neutral-200 bg-white rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 cursor-pointer select-none"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.pages || fetchingAUM}
                onClick={() => setPage((prev) => prev + 1)}
                className="px-3 py-1.5 border border-neutral-200 bg-white rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 cursor-pointer select-none"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AUMTab;