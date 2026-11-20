'use client';

import { useState } from 'react';
import { Search, RefreshCw, Eye, CheckCircle, X, Reply, ChevronDown, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminQueries, useAdminUpdateQueryStatus, useAdminReplyQuery } from '@/hooks/admin-hooks';
import { DetailDrawer } from '@/components/admin/DetailDrawer';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import type { AdminSupportQuery } from '@/lib/api-client';

type QueryStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type QueryPriority = 'low' | 'medium' | 'high' | 'urgent';

interface DisplayQuery extends AdminSupportQuery {
  displayStatus: QueryStatus;
  displayPriority: QueryPriority;
  category: string;
  assignedTo: string | null;
  replies: Array<{ id: string; adminName: string; adminEmail: string; message: string; createdAt: string }>;
}

const getStatusBadge = (status: QueryStatus) => {
  switch (status) {
    case 'open':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-800 text-xs font-semibold rounded-full">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
          Open
        </span>
      );
    case 'in_progress':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 text-yellow-800 text-xs font-semibold rounded-full">
          <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
          In Progress
        </span>
      );
    case 'resolved':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-800 text-xs font-semibold rounded-full">
          <CheckCircle className="w-3.5 h-3.5" />
          Resolved
        </span>
      );
    case 'closed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-600 text-xs font-semibold rounded-full">
          <X className="w-3.5 h-3.5" />
          Closed
        </span>
      );
    default:
      return <span>{status}</span>;
  }
};

const getPriorityBadge = (priority: QueryPriority) => {
  switch (priority) {
    case 'urgent':
      return <span className="inline-flex px-2 py-1 bg-red-50 text-red-800 text-xs font-semibold rounded-full">Urgent</span>;
    case 'high':
      return <span className="inline-flex px-2 py-1 bg-orange-50 text-orange-800 text-xs font-semibold rounded-full">High</span>;
    case 'medium':
      return <span className="inline-flex px-2 py-1 bg-yellow-50 text-yellow-800 text-xs font-semibold rounded-full">Medium</span>;
    case 'low':
      return <span className="inline-flex px-2 py-1 bg-green-50 text-green-800 text-xs font-semibold rounded-full">Low</span>;
    default:
      return <span>{priority}</span>;
  }
};

const STATUS_OPTIONS: QueryStatus[] = ['open', 'in_progress', 'resolved', 'closed'];
const PRIORITY_OPTIONS: QueryPriority[] = ['low', 'medium', 'high', 'urgent'];

const mapApiStatus = (apiStatus: 'PENDING' | 'RESOLVED'): QueryStatus => {
  switch (apiStatus) {
    case 'PENDING': return 'open';
    case 'RESOLVED': return 'resolved';
    default: return 'open';
  }
};

const mapApiPriority = (apiPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'): QueryPriority => {
  switch (apiPriority?.toLowerCase()) {
    case 'urgent': return 'urgent';
    case 'high': return 'high';
    case 'medium': return 'medium';
    case 'low': return 'low';
    default: return 'medium';
  }
};

const mapDisplayStatus = (displayStatus: QueryStatus): 'PENDING' | 'RESOLVED' => {
  switch (displayStatus) {
    case 'resolved':
    case 'closed':
      return 'RESOLVED';
    default:
      return 'PENDING';
  }
};

const enhanceQuery = (query: AdminSupportQuery): DisplayQuery => ({
  ...query,
  displayStatus: mapApiStatus(query.status),
  displayPriority: mapApiPriority(query.priority),
  category: 'General',
  assignedTo: null,
  replies: [],
});

export function QueriesTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | QueryStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | QueryPriority>('all');
  const [page, setPage] = useState(1);
  const [selectedQuery, setSelectedQuery] = useState<DisplayQuery | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);

  const {
    data: queriesData,
    isLoading: fetchingQueries,
    refetch,
  } = useAdminQueries({ page, limit: 50, search: searchQuery, status: statusFilter, priority: priorityFilter });

  const updateStatusMutation = useAdminUpdateQueryStatus({
    onSuccess: () => {
      refetch();
    },
  });

  const replyMutation = useAdminReplyQuery({
    onSuccess: () => {
      setReplyText('');
      refetch();
    },
  });

  const rawQueries = queriesData?.data?.items || [];
  const queries = rawQueries.map(enhanceQuery);
  const pagination = queriesData?.data ? { page: queriesData.data.page, pages: queriesData.data.pages, total: queriesData.data.total } : null;

  const handleStatusChange = (queryId: string, status: QueryStatus) => {
    const apiStatus = mapDisplayStatus(status);
    if (status === 'closed') {
      setShowConfirmModal({
        isOpen: true,
        title: 'Close Query',
        message: 'Are you sure you want to close this query? The client will no longer be able to reply.',
        onConfirm: () => updateStatusMutation.mutate({ queryId, status: apiStatus }),
      });
    } else {
      updateStatusMutation.mutate({ queryId, status: apiStatus });
    }
  };

  const handleReply = async (queryId: string) => {
    if (!replyText.trim()) {
      alert('Please enter a reply message');
      return;
    }
    try {
      await replyMutation.mutateAsync({ queryId, message: replyText });
      alert('Reply sent successfully');
    } catch (err) {
      const error = err as Error;
      alert(error.message || 'Failed to send reply');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search queries by subject, client name, email, PAN..."
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | QueryStatus)}
            className="px-4 py-3 text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 transition duration-200 text-neutral-900 cursor-pointer"
          >
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as 'all' | QueryPriority)}
            className="px-4 py-3 text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 transition duration-200 text-neutral-900 cursor-pointer"
          >
            <option value="all">All Priority</option>
            {PRIORITY_OPTIONS.map((priority) => (
              <option key={priority} value={priority}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </option>
            ))}
          </select>
          <button
            onClick={() => refetch()}
            disabled={fetchingQueries}
            className="px-4 py-3 border border-neutral-200 bg-white rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 cursor-pointer transition flex items-center gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", fetchingQueries && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Queries Table */}
      <div className="border border-neutral-200 bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs font-sans text-neutral-900">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 uppercase tracking-widest text-[10px] font-bold text-neutral-500 select-none">
                <th className="px-6 py-4">Subject / Category</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Assigned To</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {fetchingQueries ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-neutral-500 font-mono">
                    <RefreshCw className="w-6 h-6 text-neutral-900 animate-spin mx-auto mb-2" />
                    Loading queries...
                  </td>
                </tr>
              ) : queries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-neutral-500 font-mono">
                    No queries found
                  </td>
                </tr>
              ) : (
                queries.map((query) => (
                  <tr
                    key={query.id}
                    className="hover:bg-neutral-50 transition duration-150 group"
                  >
                    <td className="px-6 py-4 max-w-[300px]">
                      <div className="font-semibold text-neutral-900 text-sm group-hover:text-neutral-700 transition-colors duration-150 truncate">
                        {query.subject}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono mt-0.5 truncate">
                        {query.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-sans">
                      <div className="font-semibold text-neutral-900 text-sm group-hover:text-neutral-700 transition-colors duration-150">
                        {query.user?.name || 'Unknown Client'}
                      </div>
                      <div className="flex flex-wrap gap-2 items-center mt-0.5">
                        <span className="text-[10px] text-neutral-500 font-mono bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                          {query.user?.email || 'No email'}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono uppercase bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                          Phone: {query.user?.phone || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(query.displayStatus)}
                    </td>
                    <td className="px-6 py-4">
                      {getPriorityBadge(query.displayPriority)}
                    </td>
                    <td className="px-6 py-4 font-sans text-sm text-neutral-600">
                      {query.assignedTo || <span className="text-neutral-400">Unassigned</span>}
                    </td>
                    <td className="px-6 py-4 font-mono text-neutral-500 text-right">
                      {new Date(query.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedQuery(query)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 bg-white hover:bg-neutral-900 hover:text-white rounded-lg transition duration-200 text-xs font-semibold cursor-pointer text-neutral-900"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
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
                disabled={pagination.page <= 1 || fetchingQueries}
                onClick={() => setPage((prev) => prev - 1)}
                className="px-3 py-1.5 border border-neutral-200 bg-white rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 cursor-pointer select-none"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.pages || fetchingQueries}
                onClick={() => setPage((prev) => prev + 1)}
                className="px-3 py-1.5 border border-neutral-200 bg-white rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 cursor-pointer select-none"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selectedQuery && (
        <DetailDrawer
          isOpen={!!selectedQuery}
          onClose={() => setSelectedQuery(null)}
          title={`Query: ${selectedQuery.subject}`}
        >
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              {getStatusBadge(selectedQuery.displayStatus)}
              {getPriorityBadge(selectedQuery.displayPriority)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-neutral-500 font-mono text-[10px]">Subject</p>
                <p className="font-semibold text-neutral-900">{selectedQuery.subject}</p>
              </div>
              <div>
                <p className="text-neutral-500 font-mono text-[10px]">Category</p>
                <p className="font-semibold text-neutral-900">{selectedQuery.category}</p>
              </div>
              <div>
                <p className="text-neutral-500 font-mono text-[10px]">Client Name</p>
                <p className="font-semibold text-neutral-900">{selectedQuery.user?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-neutral-500 font-mono text-[10px]">Client Email</p>
                <p className="font-semibold text-neutral-900">{selectedQuery.user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-neutral-500 font-mono text-[10px]">Client Phone</p>
                <p className="font-semibold text-neutral-900">{selectedQuery.user?.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-neutral-500 font-mono text-[10px]">Assigned To</p>
                <p className="font-semibold text-neutral-900">{selectedQuery.assignedTo || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-neutral-500 font-mono text-[10px]">Created At</p>
                <p className="font-semibold text-neutral-900">{new Date(selectedQuery.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-neutral-500 font-mono text-[10px]">Updated At</p>
                <p className="font-semibold text-neutral-900">{new Date(selectedQuery.updatedAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Client Message</h3>
              <div className="bg-neutral-50 rounded-xl p-4 text-neutral-900 whitespace-pre-wrap">
                {selectedQuery.message}
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Replies</h3>
              {selectedQuery.replies.length === 0 ? (
                <p className="text-neutral-500 text-sm">No replies yet</p>
              ) : (
                <div className="space-y-4">
                  {selectedQuery.replies.map((reply) => (
                    <div key={reply.id} className="bg-neutral-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <span className="font-semibold text-neutral-900">{reply.adminName}</span>
                        <span className="text-neutral-500 font-mono text-[10px]">{reply.adminEmail}</span>
                        <span className="text-neutral-400 font-mono text-[10px]">{new Date(reply.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-neutral-900 whitespace-pre-wrap">{reply.message}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-neutral-900 mb-2">Send Reply</h4>
                <div className="flex gap-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    rows={3}
                    className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary transition"
                  />
                  <button
                    onClick={() => handleReply(selectedQuery.id)}
                    disabled={!replyText.trim() || replyMutation.isPending}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 cursor-pointer transition"
                  >
                    {replyMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      'Send Reply'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DetailDrawer>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <ConfirmModal
          isOpen={showConfirmModal.isOpen}
          onClose={() => setShowConfirmModal(null)}
          title={showConfirmModal.title}
          message={showConfirmModal.message}
          onConfirm={showConfirmModal.onConfirm}
        />
      )}
    </div>
  );
}

export default QueriesTab;