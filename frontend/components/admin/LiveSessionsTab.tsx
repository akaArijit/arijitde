'use client';

import { useState } from 'react';
import { Search, RefreshCw, Eye, Users, Clock, AlertCircle, CheckCircle, XCircle, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminLiveSessions, useAdminEndSession } from '@/hooks/admin-hooks';
import type { LiveSession } from '@/lib/api-client';

export function LiveSessionsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'waiting' | 'ended'>('all');
  const [page, setPage] = useState(1);
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null);

  const {
    data: sessionsData,
    isLoading: fetchingSessions,
    refetch,
  } = useAdminLiveSessions({ page, limit: 50, search: searchQuery, status: statusFilter });

  const endSessionMutation = useAdminEndSession({
    onSuccess: () => {
      refetch();
    },
  });

  const sessions = sessionsData?.data?.items || [];
  const pagination = sessionsData?.data ? { page: sessionsData.data.page, pages: sessionsData.data.pages, total: sessionsData.data.total } : null;

  const handleEndSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to end this session?')) {
      return;
    }

    try {
      await endSessionMutation.mutateAsync(sessionId);
      alert('Session ended successfully.');
    } catch (err) {
      const error = err as Error;
      alert(error.message || 'Failed to end session');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-800 text-xs font-semibold rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Active
          </span>
        );
      case 'waiting':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 text-yellow-800 text-xs font-semibold rounded-full">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
            Waiting
          </span>
        );
      case 'ended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-600 text-xs font-semibold rounded-full">
            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full" />
            Ended
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sessions by client name, PAN, email, consultant..."
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
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'waiting' | 'ended')}
            className="px-4 py-3 text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 transition duration-200 text-neutral-900 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="waiting">Waiting</option>
            <option value="ended">Ended</option>
          </select>
          <button
            onClick={() => refetch()}
            disabled={fetchingSessions}
            className="px-4 py-3 border border-neutral-200 bg-white rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 cursor-pointer transition flex items-center gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", fetchingSessions && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="border border-neutral-200 bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs font-sans text-neutral-900">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 uppercase tracking-widest text-[10px] font-bold text-neutral-500 select-none">
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Consultant</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Start Time</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {fetchingSessions ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-neutral-500 font-mono">
                    <RefreshCw className="w-6 h-6 text-neutral-900 animate-spin mx-auto mb-2" />
                    Loading live sessions...
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-neutral-500 font-mono">
                    No live sessions found
                  </td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <tr
                    key={session.id}
                    className="hover:bg-neutral-50 transition duration-150 group"
                  >
                    <td className="px-6 py-4 font-sans">
                      <div className="font-semibold text-neutral-900 text-sm group-hover:text-neutral-700 transition-colors duration-150">
                        {session.clientName}
                      </div>
                      <div className="flex flex-wrap gap-2 items-center mt-0.5">
                        <span className="text-[10px] text-neutral-500 font-mono bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                          {session.clientEmail}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono uppercase bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                          PAN: {session.clientPan}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-sans">
                      <div className="font-semibold text-neutral-900 text-sm">
                        {session.consultantName}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                        {session.consultantEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(session.status)}
                    </td>
                    <td className="px-6 py-4 font-mono text-neutral-700">
                      {new Date(session.startTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-mono text-neutral-700">
                      {formatDuration(session.duration)}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {session.status === 'active' && (
                        <button
                          onClick={() => handleEndSession(session.id)}
                          disabled={endSessionMutation.isPending}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition duration-200 text-xs font-semibold cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          End Session
                        </button>
                      )}
                      {session.status !== 'active' && (
                        <button
                          onClick={() => setSelectedSession(session)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 bg-white hover:bg-neutral-900 hover:text-white rounded-lg transition duration-200 text-xs font-semibold cursor-pointer text-neutral-900"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </button>
                      )}
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
                disabled={pagination.page <= 1 || fetchingSessions}
                onClick={() => setPage((prev) => prev - 1)}
                className="px-3 py-1.5 border border-neutral-200 bg-white rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 cursor-pointer select-none"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.pages || fetchingSessions}
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

export default LiveSessionsTab;