'use client';

import { Bell, Search, Menu, Sun, Moon, User, LogOut, ChevronDown, Settings } from 'lucide-react';
import { useState } from 'react';

export function AdminHeader() {
  const [showProfile, setShowProfile] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-200">
      <div className="flex items-center justify-between h-16 px-6 lg:px-8">
        {/* Left side - Mobile menu toggle */}
        <div className="lg:hidden">
          <button className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Center - Search */}
        <div className="hidden md:block flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users, clients, folios..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 transition duration-200 text-neutral-900 placeholder-neutral-400"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-neutral-100 transition"
            >
              <div className="w-8 h-8 bg-neutral-900 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                AD
              </div>
              <span className="hidden sm:block text-sm font-medium text-neutral-900">Admin</span>
              <ChevronDown className="w-4 h-4 text-neutral-500 hidden sm:block" />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-xl shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-neutral-200">
                  <p className="text-sm font-semibold text-neutral-900">Admin User</p>
                  <p className="text-xs text-neutral-500">admin@finanalysis.com</p>
                </div>
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition">
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <hr className="my-2 border-neutral-200" />
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;