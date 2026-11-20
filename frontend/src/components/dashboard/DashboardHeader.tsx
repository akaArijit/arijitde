'use client';

import Link from 'next/link';
import { LogOut, Layout, LayoutDashboard } from 'lucide-react';

interface DashboardHeaderProps {
  userData: {
    name?: string;
    email?: string;
    role?: string;
  } | null;
  onSignOut: () => void;
}

export function DashboardHeader({ userData, onSignOut }: DashboardHeaderProps) {
  return (
    <header className="relative z-20 w-full border-b border-border bg-white/35 backdrop-blur-md px-6 py-4 flex items-center justify-between text-neutral-900">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:border-neutral-400 bg-white/40 text-neutral-600 hover:text-neutral-900 text-xs font-semibold transition duration-200 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span>Back to Home</span>
        </Link>
        <div className="hidden md:flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="font-chillax font-bold tracking-wider text-sm uppercase">
            FinAnalysis Workspace
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {userData && (
          <>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/40 border border-border text-xs font-medium text-neutral-800">
              <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h10a7 7 0 00-7-7z" /></svg>
              <span>{userData.name || userData.email}</span>
            </div>
          </>
        )}
        <button
          onClick={onSignOut}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:border-red-500/30 bg-white/40 hover:bg-red-500/10 text-neutral-600 hover:text-red-600 text-xs font-semibold transition duration-200 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>
      </div>
    </header>
  );
}