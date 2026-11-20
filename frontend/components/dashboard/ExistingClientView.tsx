'use client';

import { useState } from 'react';
import { Eye, ChevronRight, Loader2, Download, FileSpreadsheet, X, Search, Filter, ChevronDown, ChevronUp, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { ExistingClientData, ExistingClientFolio } from '@/lib/api-client';

interface ExistingClientViewProps {
  existingClientData: ExistingClientData | null;
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onViewFolios: (client: ExistingClientFolio) => void;
}

export function ExistingClientView({
  existingClientData,
  isLoading,
  onRefresh,
  onViewFolios,
}: ExistingClientViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const clients = existingClientData?.folios || [];
  const pagination = existingClientData ? { page: 1, pages: 1, total: clients.length } : null;

  const filteredClients = clients.filter((client: ExistingClientFolio) =>
    client.schemeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.folioNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (val: number | null | undefined) => {
    if (!val) return 'N/A';
    if (val >= 1e7) return `\u20B9${(val / 1e7).toFixed(2)} Cr`;
    if (val >= 1e5) return `\u20B9${(val / 1e5).toFixed(2)} L`;
    return `\u20B9${val.toLocaleString('en-IN')}`;
  };

  const renderRows = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={8} className="px-6 py-12 text-center text-sm text-neutral-500 font-mono">
            <Loader2 className="w-6 h-6 text-neutral-900 animate-spin mx-auto mb-2" />
            Loading client data...
          </td>
        </tr>
      );
    }

    if (filteredClients.length === 0) {
      return (
        <tr>
          <td colSpan={8} className="px-6 py-12 text-center text-sm text-neutral-500 font-mono">
            No clients found
          </td>
        </tr>
      );
    }

    return filteredClients.map((client: ExistingClientFolio) => (
      <tr key={client.id} className="hover:bg-neutral-50 transition duration-150">
        <td className="px-6 py-4">
          <div className="font-semibold text-neutral-900 text-sm">
            {client.schemeName || 'N/A'}
          </div>
          <div className="flex flex-wrap gap-2 items-center mt-0.5">
            {client.folioNumber && (
              <span className="text-[10px] text-neutral-500 font-mono uppercase bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                Folio: {client.folioNumber}
              </span>
            )}
          </div>
        </td>
        <td className="px-6 py-4 font-mono text-neutral-500">
          {client.folioNumber || 'N/A'}
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-wrap gap-2 items-center">
            {client.clientName && (
              <span className="text-[10px] text-neutral-500 font-mono bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                {client.clientName}
              </span>
            )}
            {client.clientPan && (
              <span className="text-[10px] text-neutral-500 font-mono uppercase bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                PAN: {client.clientPan}
              </span>
            )}
          </div>
        </td>
        <td className="px-6 py-4 font-mono text-neutral-900 font-bold text-right">
          {formatCurrency(client.aum)}
        </td>
        <td className="px-6 py-4 font-mono text-neutral-700 text-right">
          {formatCurrency(client.purchaseValue)}
        </td>
        <td className="px-6 py-4 font-mono text-neutral-900 font-bold text-right">
          {formatCurrency(client.currentValue)}
        </td>
        <td className="px-6 py-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-full">
            1 Folio
          </span>
        </td>
        <td className="px-6 py-4 text-right">
          <button
            onClick={() => onViewFolios(client)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 bg-white hover:bg-neutral-900 hover:text-white rounded-lg transition duration-200 text-xs font-semibold cursor-pointer text-neutral-900"
          >
            View Details
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6" id="existing-clients">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div>
            <h2 className="text-xl font-bold font-clash text-neutral-900">Existing Clients</h2>
            <p className="text-neutral-500 text-sm">Certified client data from MF statements</p>
          </div>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-200 bg-white rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex-1 relative w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, PAN, email, mobile..."
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
        </div>

        <div className="border border-neutral-200 bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans text-neutral-900">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 uppercase tracking-widest text-[10px] font-bold text-neutral-500 select-none">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">PAN</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4 text-right">AUM</th>
                  <th className="px-6 py-4 text-right">Purchase Value</th>
                  <th className="px-6 py-4 text-right">Current Value</th>
                  <th className="px-6 py-4">Folios</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {renderRows()}
              </tbody>
            </table>
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="border-t border-neutral-200 px-6 py-4 flex items-center justify-between bg-neutral-50">
              <span className="text-[11px] font-mono text-neutral-500">
                Showing page {pagination.page} of {pagination.pages} ({pagination.total} total records)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1 || isLoading}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 border border-neutral-200 bg-white rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.pages || isLoading}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 border border-neutral-200 bg-white rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default ExistingClientView;