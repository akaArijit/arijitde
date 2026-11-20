'use client';

import { useState, useMemo } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { Search, Filter, ChevronDown, ChevronUp, RefreshCw, Eye, Download, Plus, Trash2, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminSessions, useAdminConfirmSession, useAdminUpdateSessionNotes, useAdminRefundSession, useAdminDeleteSession } from '@/lib/api-hooks';
import { DetailDrawer } from '@/components/admin/DetailDrawer';
import { UploadZone } from '@/components/admin/UploadZone';
import { Loader2 } from 'lucide-react';
import type { AdvisorySession as ApiAdvisorySession } from '@/lib/api-client';

type AdvisorySession = ApiAdvisorySession & {
  user?: { id: string; name: string | null; email: string | null; phone: string | null; role: string } | undefined;
};

export function ConsultationsTab() {
  const [activeTab, setActiveTab] = useState<'consultations' | 'liveSessions'>('consultations');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [confirmedSlotInput, setConfirmedSlotInput] = useState('');
  const [meetLinkInput, setMeetLinkInput] = useState('');
  const [portfolioNotesInput, setPortfolioNotesInput] = useState('');
  const [updatingSession, setUpdatingSession] = useState(false);

  const { data: advisorySessions, isLoading: loadingAdvisory, refetch } = useAdminSessions();

  const visitorAdvisorySessions = useMemo(() => advisorySessions?.filter(s => s.user?.role !== 'CLIENT') || [], [advisorySessions]);
  const clientAdvisorySessions = useMemo(() => advisorySessions?.filter(s => s.user?.role === 'CLIENT') || [], [advisorySessions]);

  const confirmMutation = useAdminConfirmSession({
    onSuccess: () => {
      setEditingSessionId(null);
      setConfirmedSlotInput('');
      setMeetLinkInput('');
      refetch();
    },
  });

  const notesMutation = useAdminUpdateSessionNotes({
    onSuccess: () => {
      setEditingSessionId(null);
      setPortfolioNotesInput('');
      refetch();
    },
  });

  const refundMutation = useAdminRefundSession({
    onSuccess: () => {
      setEditingSessionId(null);
      refetch();
    },
  });

  const deleteMutation = useAdminDeleteSession({
    onSuccess: () => {
      refetch();
    },
  });

  const defaultMeetLink = 'https://meet.google.com/abc-defg-hij';

  const handleConfirmSlot = (id: string) => {
    if (!confirmedSlotInput || !meetLinkInput) return;
    setUpdatingSession(true);
    confirmMutation.mutate({ id, confirmedSlot: confirmedSlotInput, googleMeetLink: meetLinkInput });
    setUpdatingSession(false);
  };

  const handleUpdatePortfolioNotes = (id: string) => {
    if (!portfolioNotesInput.trim()) return;
    setUpdatingSession(true);
    notesMutation.mutate({ id, notes: portfolioNotesInput });
    setUpdatingSession(false);
  };

  const handleRefundSession = (id: string) => {
    if (!confirm('Are you sure you want to refund this session?')) return;
    refundMutation.mutate(id);
  };

  const handleDeleteSession = (id: string) => {
    if (!confirm('Are you sure you want to delete this session? This action is permanent.')) return;
    deleteMutation.mutate(id);
  };

  const handleDeleteAdvisorySession = (id: string) => {
    if (!confirm('Are you sure you want to delete this booking? This action is permanent.')) return;
    deleteMutation.mutate(id);
  };

  const renderVisitorSession = (session: AdvisorySession) => {
    const isEditing = editingSessionId === session.id;
    const meetLink = session.googleMeetLink || defaultMeetLink;

    return (
      <div
        key={session.id}
        className="border border-neutral-200 bg-white rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-sm hover:shadow-md transition duration-300 text-neutral-900"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-100 pb-4 w-full">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-bold text-neutral-950 text-base">{session.user?.name || 'Visitor'}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-wider ${
                session.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' :
                session.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-700 border border-blue-500/20' :
                session.status === 'REFUNDED' ? 'bg-red-500/10 text-red-700 border border-red-500/20' :
                'bg-amber-500/10 text-amber-700 border border-amber-500/20'
              }`}>
                {session.status}
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-mono mt-0.5">
              Email: {session.user?.email || 'N/A'} | Phone: {session.user?.phone || 'N/A'}
            </p>
          </div>
          <button
            onClick={() => handleDeleteAdvisorySession(session.id)}
            className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-100 hover:border-rose-200 transition rounded-xl cursor-pointer"
            title="Delete Session"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4 col-span-1">
            <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-5 space-y-3">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">
                Visitor&apos;s Proposed Slots
              </span>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-white border border-neutral-100 p-2.5 rounded-xl text-xs font-mono">
                  <span className="text-neutral-500">Option 1:</span>
                  <span className="text-neutral-900 font-bold">
                    {new Date(session.slot1).getTime() > 0
                      ? new Date(session.slot1).toLocaleString()
                      : 'Not submitted'}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white border border-neutral-100 p-2.5 rounded-xl text-xs font-mono">
                  <span className="text-neutral-500">Option 2:</span>
                  <span className="text-neutral-900 font-bold">
                    {new Date(session.slot2).getTime() > 0
                      ? new Date(session.slot2).toLocaleString()
                      : 'Not submitted'}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white border border-neutral-100 p-2.5 rounded-xl text-xs font-mono">
                  <span className="text-neutral-500">Option 3:</span>
                  <span className="text-neutral-900 font-bold">
                    {new Date(session.slot3).getTime() > 0
                      ? new Date(session.slot3).toLocaleString()
                      : 'Not submitted'}
                  </span>
                </div>
              </div>

              {session.confirmedSlot && (
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 space-y-2">
                  <span className="text-[10px] font-mono text-emerald-600 uppercase tracking-widest block font-bold">
                    Confirmed Meeting Schedule
                  </span>
                  <div className="text-xs font-semibold text-emerald-950 font-mono">
                    ⏰ {new Date(session.confirmedSlot).toLocaleString()}
                  </div>
                  {session.googleMeetLink && (
                    <a
                      href={session.googleMeetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-emerald-600 underline hover:text-emerald-700 block"
                    >
                      🔗 {session.googleMeetLink}
                    </a>
                  )}
                </div>
              )}
            </div>

            {session.status !== 'REFUNDED' && session.status !== 'COMPLETED' && (
              <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-5 space-y-4">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block font-bold">
                  {session.status === 'CONFIRMED' ? 'Reschedule / Confirm Slot' : 'Confirm Slot Booking'}
                </span>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-neutral-500">Select Date & Time *</label>
                    <select
                      value={editingSessionId === session.id ? confirmedSlotInput : ''}
                      onChange={(e) => {
                        setEditingSessionId(session.id);
                        setConfirmedSlotInput(e.target.value);
                      }}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-primary font-mono"
                    >
                      <option value="">-- Choose Slot --</option>
                      {new Date(session.slot1).getTime() > 0 && (
                        <option value={new Date(session.slot1).toISOString()}>
                          Option 1 ({new Date(session.slot1).toLocaleString()})
                        </option>
                      )}
                      {new Date(session.slot2).getTime() > 0 && (
                        <option value={new Date(session.slot2).toISOString()}>
                          Option 2 ({new Date(session.slot2).toLocaleString()})
                        </option>
                      )}
                      {new Date(session.slot3).getTime() > 0 && (
                        <option value={new Date(session.slot3).toISOString()}>
                          Option 3 ({new Date(session.slot3).toLocaleString()})
                        </option>
                      )}
                      <option value={new Date().toISOString()}>Custom (Right Now)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-neutral-500">Google Meet Link *</label>
                    <input
                      type="url"
                      placeholder="https://meet.google.com/..."
                      value={editingSessionId === session.id ? meetLinkInput : session.googleMeetLink || ''}
                      onChange={(e) => {
                        setEditingSessionId(session.id);
                        setMeetLinkInput(e.target.value);
                      }}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-primary font-mono"
                    />
                  </div>

                  <button
                    onClick={() => handleConfirmSlot(session.id)}
                    disabled={updatingSession || editingSessionId !== session.id || !confirmedSlotInput || !meetLinkInput}
                    className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition duration-200 disabled:opacity-40 cursor-pointer"
                  >
                    {updatingSession ? 'Processing...' : 'Confirm Schedule & Send Email'}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-5 space-y-3">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block font-bold">
                Portfolio Distribution Notes
              </span>
              <textarea
                rows={3}
                placeholder="Write portfolio audits, rebalancing advice, or general consulting notes..."
                value={editingSessionId === session.id ? portfolioNotesInput : session.notes || ''}
                onChange={(e) => {
                  setEditingSessionId(session.id);
                  setPortfolioNotesInput(e.target.value);
                }}
                className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:border-primary font-sans leading-relaxed"
              />
              <button
                onClick={() => handleUpdatePortfolioNotes(session.id)}
                disabled={updatingSession || editingSessionId !== session.id || !portfolioNotesInput.trim()}
                className="w-full py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl transition duration-200 disabled:opacity-40 cursor-pointer"
              >
                Save Distributor Notes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold font-clash text-neutral-500 uppercase tracking-wider mb-4 text-left flex items-center gap-2">
          <span>
            Visitor Live Portfolio Review Bookings ({visitorAdvisorySessions.length})
          </span>
        </h2>

        {loadingAdvisory ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-neutral-200 rounded-2xl">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-neutral-500 text-xs font-mono">
              Fetching visitor sessions telemetry...
            </p>
          </div>
        ) : visitorAdvisorySessions.length === 0 ? (
          <div className="border border-dashed border-neutral-200 rounded-2xl p-12 text-center text-sm text-neutral-500 bg-neutral-50 font-mono">
            <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            No live portfolio review bookings from new visitors.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {visitorAdvisorySessions.map(renderVisitorSession)}
          </div>
        )}
      </div>
    </div>
  );
}

export default ConsultationsTab;