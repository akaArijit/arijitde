'use client';

import { useState } from 'react';
import { Send, Loader2, Mail, MessageSquare, X, ChevronDown, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useMySupportQueries, useSubmitSupportQuery } from '@/hooks/useSupport';
import type { SupportQuery } from '@/lib/api-client';

interface SupportCenterProps {
  isLoading: boolean;
}

export function SupportCenter({ isLoading }: SupportCenterProps) {
  const [querySubject, setQuerySubject] = useState('');
  const [queryMessage, setQueryMessage] = useState('');
  const [querySuccess, setQuerySuccess] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [submittingQuery, setSubmittingQuery] = useState(false);

  const { data: queries, isLoading: fetchingQueries } = useMySupportQueries();
  const submitQueryMutation = useSubmitSupportQuery();

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!querySubject.trim() || !queryMessage.trim()) {
      setQueryError('Please fill out all fields.');
      return;
    }

    try {
      setSubmittingQuery(true);
      setQueryError(null);
      setQuerySuccess(false);

      await submitQueryMutation.mutateAsync({
        subject: querySubject,
        message: queryMessage,
        priority: 'MEDIUM',
      });

      setQuerySuccess(true);
      setQuerySubject('');
      setQueryMessage('');
    } catch (err) {
      const error = err as Error;
      setQueryError(error.message || 'An error occurred while submitting your query');
    } finally {
      setSubmittingQuery(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6" id="support">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-clash text-neutral-900">Support Center</h2>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold font-clash text-neutral-900 mb-4">Submit a Query</h3>
          <form onSubmit={handleQuerySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Subject</label>
              <input
                type="text"
                value={querySubject}
                onChange={(e) => setQuerySubject(e.target.value)}
                placeholder="Brief summary of your issue"
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Message</label>
              <textarea
                value={queryMessage}
                onChange={(e) => setQueryMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                rows={4}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                required
              />
            </div>
            {queryError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {queryError}
              </div>
            )}
            {querySuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Your query has been submitted successfully! We&apos;ll get back to you soon.
              </div>
            )}
            <button
              type="submit"
              disabled={submittingQuery || isLoading}
              className="w-full py-3 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {submittingQuery ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Query
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold font-clash text-neutral-900">Your Queries</h3>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 bg-white rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          {fetchingQueries ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-neutral-900 animate-spin" />
            </div>
          ) : queries && queries.length > 0 ? (
            <div className="space-y-4">
              {queries.map((query: SupportQuery) => (
                <div key={query.id} className="border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-neutral-900">{query.subject}</h4>
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-bold',
                          query.priority === 'URGENT' && 'bg-red-100 text-red-700',
                          query.priority === 'HIGH' && 'bg-orange-100 text-orange-700',
                          query.priority === 'MEDIUM' && 'bg-amber-100 text-amber-700',
                          query.priority === 'LOW' && 'bg-green-100 text-green-700'
                        )}>
                          {query.priority}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 mb-2">{query.message}</p>
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <span>Status: <span className="font-semibold capitalize">{query.status?.toLowerCase() || 'pending'}</span></span>
                        <span>{new Date(query.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">No queries submitted yet</p>
              <p className="text-sm text-neutral-400 mt-1">Submit your first query above</p>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default SupportCenter;