'use client';

import { useState, useMemo } from 'react';
import { DataTable, Pagination } from '@/components/admin/DataTable';
import { Search, Filter, ChevronDown, ChevronUp, RefreshCw, Eye, Download, Plus, Trash2, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminUsers, useAdminUpdateUser } from '@/lib/api-hooks';
import { DetailDrawer } from '@/components/admin/DetailDrawer';
import { UploadZone } from '@/components/admin/UploadZone';
import { Loader2 } from 'lucide-react';
import type { AdminUser as ApiAdminUser } from '@/lib/api-client';

interface UsersTableColumn {
  key: string;
  header: string;
  render: (user: ApiAdminUser) => React.ReactNode;
  sortable?: boolean;
}

const createColumns = (selectUserForDetails: (user: ApiAdminUser) => void, handleRoleChange: (userId: string, role: 'GUEST' | 'CLIENT' | 'ADMIN') => void): UsersTableColumn[] => [
  {
    key: 'createdAt',
    header: 'Register Date',
    render: (user) => (
      <span className="font-mono text-neutral-500 text-[11px]">
        {new Date(user.createdAt).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </span>
    ),
    sortable: true,
  },
  {
    key: 'name',
    header: 'User Details',
    render: (user) => (
      <div>
        <div className="font-semibold text-neutral-900 text-sm group-hover:text-neutral-700 transition-colors duration-150">
          {user.name || 'Anonymous User'}
        </div>
        <div className="text-neutral-500 font-mono text-[11px] mt-0.5">
          {user.email}
        </div>
        {user.phone && (
          <div className="text-neutral-500 font-mono text-[11px] mt-0.5">
            {user.phone}
          </div>
        )}
        {user.pan && (
          <div className="text-[10px] text-neutral-500 font-mono uppercase bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200 mt-0.5">
            PAN: {user.pan}
          </div>
        )}
      </div>
    ),
  },
  {
    key: 'role',
    header: 'Role',
    render: (user) => (
      <select
        value={user.role}
        onChange={(e) => handleRoleChange(user.id, e.target.value as 'GUEST' | 'CLIENT' | 'ADMIN')}
        className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border ${
          user.role === 'ADMIN'
            ? 'bg-neutral-900 text-white border-neutral-900'
            : user.role === 'CLIENT'
            ? 'bg-amber-500/10 text-amber-700 border-amber-500/25'
            : 'bg-neutral-100 text-neutral-600 border-neutral-200'
        }`}
      >
        <option value="GUEST">GUEST</option>
        <option value="CLIENT">CLIENT</option>
        <option value="ADMIN">ADMIN</option>
      </select>
    ),
    sortable: true,
  },
  {
    key: 'activity',
    header: 'Activity Summary',
    render: (user) => (
      <div className="flex flex-wrap gap-2 text-[10px] font-mono text-neutral-500">
        <span className="px-1.5 py-0.5 bg-neutral-50 border border-neutral-200 rounded">
          Assessments: {user._count?.assessments || 0}
        </span>
        <span className="px-1.5 py-0.5 bg-neutral-50 border border-neutral-200 rounded">
          Portfolios: {user._count?.portfolios || 0}
        </span>
        <span className="px-1.5 py-0.5 bg-neutral-50 border border-neutral-200 rounded">
          Leads: {user._count?.leads || 0}
        </span>
      </div>
    ),
    sortable: false,
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (user) => (
      <button
        onClick={() => selectUserForDetails(user)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 bg-white hover:bg-neutral-900 hover:text-white rounded-lg transition duration-200 text-xs font-semibold cursor-pointer text-neutral-900"
      >
        View Details
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    ),
  },
];

export function UsersTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'GUEST' | 'CLIENT' | 'ADMIN'>('ALL');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<ApiAdminUser | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);

  const { data: usersData, isLoading, refetch } = useAdminUsers(page, 20);

  const updateMutation = useAdminUpdateUser({
    onSuccess: () => {
      refetch();
    },
  });

  const users = usersData?.data?.items || [];
  const apiPagination = usersData?.data?.pagination;

  const pagination: Pagination | undefined = apiPagination ? {
    page: apiPagination.page,
    pageSize: 20,
    total: apiPagination.total,
    onPageChange: setPage,
  } : undefined;

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone?.includes(searchQuery);
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const selectUserForDetails = (user: ApiAdminUser) => {
    setSelectedUser(user);
  };

  const handleRoleChange = (userId: string, role: 'GUEST' | 'CLIENT' | 'ADMIN') => {
    updateMutation.mutate({ userId, role });
  };

  if (!pagination) return null;

  const columns = createColumns(selectUserForDetails, handleRoleChange);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch">
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by name, email or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-primary transition duration-200 text-neutral-900 placeholder-neutral-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 border border-neutral-200 rounded-xl px-3 bg-white">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'ALL' | 'GUEST' | 'CLIENT' | 'ADMIN')}
            className="text-xs font-bold font-clash uppercase border-none focus:outline-none bg-transparent py-2.5 cursor-pointer pr-4 text-neutral-900"
          >
            <option value="ALL">All Roles</option>
            <option value="GUEST">Guests</option>
            <option value="CLIENT">Clients</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>

      <div className="border border-neutral-200 bg-white rounded-2xl overflow-hidden shadow-sm">
        <DataTable
          data={filteredUsers}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Search users..."
          loading={isLoading}
          pagination={pagination}
          onRowClick={selectUserForDetails}
        />
      </div>
    </div>
  );
}

export default UsersTab;