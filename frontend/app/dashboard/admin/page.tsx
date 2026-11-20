'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { UsersTab } from '@/components/admin/UsersTab';
import { ExistingClientsTab } from '@/components/admin/ExistingClientsTab';
import { ConsultationsTab } from '@/components/admin/ConsultationsTab';
import { FoliosTab } from '@/components/admin/FoliosTab';
import { LiveSessionsTab } from '@/components/admin/LiveSessionsTab';
import { AUMTab } from '@/components/admin/AUMTab';
import { QueriesTab } from '@/components/admin/QueriesTab';

const tabs = [
  { id: 'users', label: 'Users' },
  { id: 'clients', label: 'Existing Clients' },
  { id: 'consultations', label: 'Consultations' },
  { id: 'folios', label: 'Folios' },
  { id: 'live-sessions', label: 'Live Sessions' },
  { id: 'aum', label: 'AUM' },
  { id: 'queries', label: 'Queries' },
  { id: 'settings', label: 'Settings' },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('users');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UsersTab />;
      case 'clients':
        return <ExistingClientsTab />;
      case 'consultations':
        return <ConsultationsTab />;
      case 'folios':
        return <FoliosTab />;
      case 'live-sessions':
        return <LiveSessionsTab />;
      case 'aum':
        return <AUMTab />;
      case 'queries':
        return <QueriesTab />;
      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold font-clash text-neutral-900">Settings</h1>
              <p className="text-neutral-500 mt-1">Admin settings and configuration</p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
              <p className="text-neutral-500">Settings panel coming soon...</p>
            </div>
          </div>
        );
      default:
        return <UsersTab />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTabContent()}
    </AdminLayout>
  );
}