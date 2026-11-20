'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

interface AdminLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminLayout({ children, activeTab, onTabChange }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminSidebar activeTab={activeTab} onTabChange={onTabChange} />
      <div className="lg:ml-64 min-h-screen">
        <AdminHeader />
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;