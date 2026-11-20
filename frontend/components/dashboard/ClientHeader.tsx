'use client';

import { LogOut, User, Shield, Wallet, ChevronDown, Menu, X, Bell } from 'lucide-react';
import { useState } from 'react';
import { useClientAuth } from '@/hooks';
import Link from 'next/link';

interface ClientHeaderProps {
  user: {
    name?: string;
    email?: string;
    role?: string;
    client?: {
      activePlan: string | null;
    } | null;
  } | null;
  onLogout: () => void;
}

const PLAN_LABELS: Record<string, string> = {
  FREE: 'Free Tier',
  PREMIUM: 'Premium Pro Plan',
  MAX: 'Max Portfolio Plan',
};

const PLAN_ICONS: Record<string, React.ElementType> = {
  FREE: User,
  PREMIUM: Wallet,
  MAX: Shield,
};

const PLAN_COLORS: Record<string, string> = {
  FREE: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  PREMIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  MAX: 'bg-blue-50 text-blue-700 border-blue-200',
};

export function ClientHeader({ user, onLogout }: ClientHeaderProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { logout } = useClientAuth();

  const plan = user?.client?.activePlan || 'FREE';
  const PlanIcon = PLAN_ICONS[plan] || User;
  const planColor = PLAN_COLORS[plan] || PLAN_COLORS.FREE;

  const handleLogout = () => {
    onLogout();
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
      <div className="flex items-center justify-between h-16 px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition"
            aria-label="Toggle menu"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link href="/dashboard/client" className="flex items-center gap-2">
            <span className="w-8 h-8 bg-neutral-900 rounded-xl flex items-center justify-center text-white font-bold text-sm">FA</span>
            <span className="font-clash text-xl font-bold text-neutral-900 hidden sm:block">FinAnalysis</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard/client" className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition">
            Dashboard
          </Link>
          <Link href="/dashboard/client#portfolio" className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition">
            Portfolio
          </Link>
          <Link href="/dashboard/client#analysis" className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition">
            Analysis
          </Link>
          <Link href="/dashboard/client#booking" className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition">
            Book Session
          </Link>
          <Link href="/dashboard/client#support" className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition">
            Support
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-neutral-100 transition"
            >
              <div className="w-8 h-8 bg-neutral-900 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:block text-sm font-medium text-neutral-900">
                {user?.name || 'User'}
              </span>
              <ChevronDown className="w-4 h-4 text-neutral-500 hidden sm:block" />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-xl shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-neutral-200">
                  <p className="text-sm font-semibold text-neutral-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-neutral-500">{user?.email}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <PlanIcon className="w-3.5 h-3.5" />
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${planColor}`}>
                      {PLAN_LABELS[plan] || plan}
                    </span>
                  </div>
                </div>
                <Link
                  href="/dashboard/client#profile"
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition"
                  onClick={() => setShowProfile(false)}
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <Link
                  href="/dashboard/client#settings"
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition"
                  onClick={() => setShowProfile(false)}
                >
                  <Shield className="w-4 h-4" />
                  Settings
                </Link>
                <hr className="my-2 border-neutral-200" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showMobileMenu && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-neutral-200 py-4 px-4">
          <nav className="flex flex-col gap-4">
            <Link href="/dashboard/client" className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition" onClick={() => setShowMobileMenu(false)}>
              Dashboard
            </Link>
            <Link href="/dashboard/client#portfolio" className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition" onClick={() => setShowMobileMenu(false)}>
              Portfolio
            </Link>
            <Link href="/dashboard/client#analysis" className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition" onClick={() => setShowMobileMenu(false)}>
              Analysis
            </Link>
            <Link href="/dashboard/client#booking" className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition" onClick={() => setShowMobileMenu(false)}>
              Book Session
            </Link>
            <Link href="/dashboard/client#support" className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition" onClick={() => setShowMobileMenu(false)}>
              Support
            </Link>
            <hr className="border-neutral-200" />
            <button onClick={handleLogout} className="w-full text-left text-sm text-red-600 hover:text-red-700 transition flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </nav>
        </div>
      )}
    </header>
  );

  }