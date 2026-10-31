'use client';

import { ShieldCheck, Loader2, Calendar, FileText, ChevronRight } from 'lucide-react';

interface ClientStatusProps {
  userData?: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    createdAt?: string;
    referralCode?: string;
  } | null;
  sessions?: any[];
  scoreReport?: {
    total: number;
    goalAlignment: number;
    assetAlloc: number;
    diversification: number;
    discipline: number;
    efficiency: number;
    tag: 'ALIGNED' | 'MODERATE' | 'NEEDS_REVIEW' | 'NEEDS_STRUCTURING';
    insights: string[] | { textInsights: string[]; comparison?: any };
  } | null;
  onViewReport?: () => void;
  onGoToClientDashboard?: () => void;
}

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

export function ClientStatus({
  userData,
  sessions = [],
  scoreReport,
  onViewReport,
  onGoToClientDashboard,
}: ClientStatusProps) {
  const isClient = userData?.role === 'CLIENT';
  const session = sessions[0];

  return (
    <div className="w-full max-w-xl bg-white/30 border border-white/30 rounded-3xl p-8 md:p-10 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300 backdrop-blur-xl">
      {isClient ? (
        <>
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-500/20 flex items-center justify-center text-emerald-600 mx-auto mb-2">
            <svg className="w-8 h-8 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">
              Workspace Activated
            </h2>
            <p className="text-neutral-500 text-xs font-sans leading-relaxed">
              Welcome to the Premium Client Portal! Your 1-on-1 portfolio
              review discussion booking has been verified.
            </p>
          </div>

          {sessions.length > 0 ? (
            <div className="p-5 bg-white/40 border border-white/30 rounded-2xl text-left space-y-3 font-sans text-xs">
              <h3 className="font-semibold text-neutral-800 text-sm border-b border-neutral-100 pb-2 flex items-center justify-between">
                <span>Live Consult Booking</span>
                <span
                  className={`px-2 py-0.5 rounded text-white font-mono text-[9px] font-bold ${
                    session?.status === 'CONFIRMED'
                      ? 'bg-emerald-600 animate-pulse'
                      : session?.status === 'COMPLETED'
                        ? 'bg-blue-600'
                        : session?.status === 'REFUNDED'
                          ? 'bg-red-600'
                          : 'bg-amber-600'
                  }`}
              >
                {session?.status}
              </span>
            </h3>

            {session?.status === 'CONFIRMED' &&
            session?.confirmedSlot ? (
              <div className="space-y-3">
                <div className="flex flex-col gap-1 text-emerald-800 font-semibold bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                  <span className="text-[10px] font-mono text-emerald-600 uppercase tracking-wider">
                    Confirmed Time:
                  </span>
                  <span className="text-xs font-mono">
                    {new Date(session.confirmedSlot).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                    })}
                  </span>
                </div>
                {session.googleMeetLink && (
                  <a
                    href={session.googleMeetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-center font-bold rounded-xl transition duration-200 shadow-md"
                  >
                    📹 Join Google Meet Session
                  </a>
                )}
              </div>
            ) : session?.status === 'REFUNDED' ? (
              <div className="text-red-700 bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl text-xs leading-relaxed">
                <strong>Session Cancelled & Refunded:</strong> A full
                refund has been initiated to your payment source.
              </div>
            ) : (
              <div className="space-y-2 text-neutral-600">
                <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block">
                  Submitted Slots:
                </span>
                <ul className="space-y-1 font-mono text-[10px] pl-4 list-decimal text-neutral-700">
                  <li>
                    {new Date(session?.preferredSlot1).getTime() > 0
                      ? new Date(session.preferredSlot1).toLocaleString()
                      : 'Not scheduled'}
                  </li>
                  <li>
                    {new Date(session?.preferredSlot2).getTime() > 0
                      ? new Date(session.preferredSlot2).toLocaleString()
                      : 'Not scheduled'}
                  </li>
                  <li>
                    {new Date(session?.preferredSlot3).getTime() > 0
                      ? new Date(session.preferredSlot3).toLocaleString()
                      : 'Not scheduled'}
                  </li>
                </ul>
                <p className="text-[10px] text-neutral-400 leading-normal mt-2 border-t border-neutral-100 pt-2 italic">
                  Arijit will confirm one slot and attach the Google
                  Meet link. You will receive an email confirmation.
                </p>
              </div>
            )}

            {session?.notes && (
              <div className="border-t border-neutral-100 pt-2 space-y-1.5">
                <span className="text-neutral-500 font-mono uppercase tracking-wider text-[10px] block">
                  Arijit's Pre-Session Notes:
                </span>
                <div
                  data-lenis-prevent
                  className="bg-neutral-50 border border-neutral-100 p-2.5 rounded-xl font-sans text-xs text-neutral-700 leading-relaxed max-h-[120px] overflow-y-auto italic"
                >
                  {session.notes}
                </div>
              </div>
            )}
          </div>
        )
        : (
          <div className="p-4 bg-white/40 border border-white/30 rounded-2xl text-left space-y-3 font-sans text-xs">
            <div className="flex justify-between items-center">
              <span className="text-neutral-500 font-mono uppercase tracking-wider text-[10px]">
                Client Level:
              </span>
              <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-mono text-[9px] font-bold">
                PREMIUM Tier
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-neutral-500 font-mono uppercase tracking-wider text-[10px]">
                Next Steps:
              </span>
              <span className="text-neutral-800 font-medium text-right max-w-[200px]">
                Our distribution desk is preparing your PDF rebalancing
                plan.
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="w-full p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-[10px] text-blue-700 font-sans leading-relaxed text-left flex gap-2">
        <span className="text-sm">🛡️</span>
        <span>
          <strong>Trust Policy:</strong> If your scheduled session
          does not happen for any reason, you will receive a full
          refund within 24 hours. No questions asked.
        </span>
      </div>

      <button
        onClick={() => { window.location.href = '/dashboard/client'; }}
        className="w-full py-3.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg"
      >
        <span>Enter Client Dashboard</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
      </button>

      {true && (
        <button
          onClick={() => {}}
          className="w-full py-3.5 bg-white/40 border border-border hover:bg-white/60 text-neutral-700 text-xs font-semibold rounded-xl transition cursor-pointer"
        >
          View Scorecard Report
        </button>
      )}
    </div>
  );
}