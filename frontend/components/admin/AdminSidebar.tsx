'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Users, UserPlus, FileText, BarChart3, MessageSquare, Settings, LayoutDashboard, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'users', label: 'Users', icon: Users },
  { id: 'clients', label: 'Existing Clients', icon: UserPlus },
  { id: 'consultations', label: 'Consultations', icon: FileText },
  { id: 'folios', label: 'Folios', icon: BarChart3 },
  { id: 'live-sessions', label: 'Live Sessions', icon: MessageSquare },
  { id: 'aum', label: 'AUM', icon: BarChart3 },
  { id: 'queries', label: 'Queries', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-neutral-200 transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center justify-between h-16 px-4 border-b border-neutral-200", collapsed && "justify-center")}>
        {!collapsed && (
          <span className="font-clash text-xl font-bold text-neutral-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-neutral-900 rounded-xl flex items-center justify-center text-white font-bold text-sm">FA</span>
            Admin
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium",
                isActive
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? tab.label : undefined}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-white")} />
              {!collapsed && <span>{tab.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn("p-4 border-t border-neutral-200", collapsed && "flex justify-center")}>
        {!collapsed && (
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        )}
        {collapsed && (
          <button
            className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
}

export default AdminSidebar;