'use client';

import { useState, useMemo } from 'react';
import { DataTable, Pagination } from '@/components/admin/DataTable';
import { Search, Filter, ChevronDown, ChevronUp, RefreshCw, Eye, Download, Plus, Trash2, ChevronRight, FileSpreadsheet, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminExistingClients, useAdminUploadExistingClients, useAdminDeleteExistingClient, useAdminClearExistingClients } from '@/lib/api-hooks';
import { DetailDrawer } from '@/components/admin/DetailDrawer';
import { UploadZone } from '@/components/admin/UploadZone';
import type { ExistingClientData } from '@/lib/api-client';

interface ExistingClientsTableColumn {
  key: string;
  header: string;
  render: (client: ExistingClientData) => React.ReactNode;
  sortable?: boolean;
}

const createColumns = (handleViewFolios: (client: ExistingClientData) => void): ExistingClientsTableColumn[] => [
  {
    key: 'name',
    header: 'Name',
    render: (client) => (
      <div>
        <div className="font-semibold text-neutral-900 text-sm group-hover:text-neutral-700 transition-colors duration-150">
          {client.title ? `${client.title} ` : ''}
          {client.name || 'N/A'}
        </div>
        <div className="flex flex-wrap gap-2 items-center mt-0.5">
          {client.pan && (
            <span className="text-[10px] text-neutral-500 font-mono uppercase bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
              PAN: {client.pan}
            </span>
          )}
          {client.mobile && (
            <span className="text-[10px] text-neutral-500 font-mono bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
              Phone: {client.mobile}
            </span>
          )}
          {client.email && (
            <span className="text-[10px] text-neutral-500 font-mono bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
              Email: {client.email}
            </span>
          )}
        </div>
      </div>
    ),
  },
  {
    key: 'folio',
    header: 'Folio',
    render: (client) => (
      <div className="font-mono text-neutral-700 max-w-[180px] min-w-[140px]">
        {client.folios && client.folios.length > 0 ? (
          client.folios.length > 1 ? (
            <div className="flex items-center gap-1.5 w-full min-w-0">
              <select
                className="flex-1 min-w-0 text-xs font-mono bg-neutral-50 border border-neutral-200 text-neutral-800 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-neutral-400 cursor-pointer truncate"
                defaultValue={client.folios[0]?.folioNumber || ''}
                title={`${client.folios.length} Folios`}
                onChange={() => handleViewFolios(client)}
              >
                {client.folios.map((folio) => (
                  <option
                    key={folio.id}
                    value={folio.folioNumber || ''}
                    title={`${folio.folioNumber} - ${folio.schemeName || 'Unknown Scheme'}`}
                  >
                    {folio.folioNumber}{' '}
                    {folio.schemeName ? `(${folio.schemeName})` : ''}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleViewFolios(client)}
                className="p-1 text-neutral-500 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded transition cursor-pointer flex items-center justify-center shrink-0"
                title="View selected folio details"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleViewFolios(client)}
              className="font-mono text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-900 hover:text-white px-2 py-0.5 rounded border border-neutral-200 transition duration-150 cursor-pointer"
              title="Click to view details"
            >
              {client.folios[0].folioNumber || 'N/A'}
            </button>
          )
        ) : (
          'N/A'
        )}
      </div>
    ),
    sortable: false,
  },
  {
    key: 'aum',
    header: 'AUM',
    render: (client) => (
      <span className="font-mono text-neutral-900 font-bold text-right">
        {client.aum !== null && client.aum !== undefined
          ? `₹${client.aum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
          : 'N/A'}
      </span>
    ),
    sortable: true,
  },
  {
    key: 'purchaseValue',
    header: 'Purchase Value',
    render: (client) => (
      <span className="font-mono text-neutral-700 text-right">
        {client.purchaseValue !== null && client.purchaseValue !== undefined
          ? `₹${client.purchaseValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
          : 'N/A'}
      </span>
    ),
    sortable: true,
  },
  {
    key: 'currentValue',
    header: 'Current Value',
    render: (client) => (
      <span className="font-mono text-neutral-900 font-bold text-right">
        {client.currentValue !== null && client.currentValue !== undefined
          ? `₹${client.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
          : 'N/A'}
      </span>
    ),
    sortable: true,
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (client) => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleViewFolios(client)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 bg-white hover:bg-neutral-900 hover:text-white rounded-lg transition duration-200 text-xs font-semibold cursor-pointer text-neutral-900"
        >
          View Details
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    ),
  },
];

export function ExistingClientsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [uploadingExistingClientFile, setUploadingExistingClientFile] = useState(false);
  const [selectedExistingClient, setSelectedExistingClient] = useState<ExistingClientData | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; danger?: boolean } | null>(null);
  const [deletingClient, setDeletingClient] = useState(false);

  const { data: clientsData, isLoading, refetch } = useAdminExistingClients({ page, limit: 50, search: searchQuery });

  const uploadMutation = useAdminUploadExistingClients({
    onSuccess: () => {
      setPage(1);
      refetch();
    },
  });

  const clearMutation = useAdminClearExistingClients({
    onSuccess: () => {
      setPage(1);
      refetch();
    },
  });

  const deleteMutation = useAdminDeleteExistingClient({
    onSuccess: () => {
      setDeletingClient(false);
      refetch();
    },
  });

  const clients = clientsData?.data?.items || [];
  const apiPagination = clientsData?.data?.pagination;

  const pagination: Pagination | undefined = apiPagination ? {
    page: apiPagination.page,
    pageSize: 50,
    total: apiPagination.total,
    onPageChange: setPage,
  } : undefined;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingExistingClientFile(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/admin/existing-clients/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to upload existing clients');
      }

      alert(resData.message || 'Existing clients imported successfully!');
      setPage(1);
      refetch();
    } catch (err) {
      const error = err as Error;
      alert(error.message || 'Failed to upload file');
    } finally {
      setUploadingExistingClientFile(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleClearExistingClients = () => {
    setShowConfirmModal({
      isOpen: true,
      title: 'Delete Existing Clients Database',
      message:
        'Are you absolutely sure you want to delete all existing client records? This action is irreversible and will permanently wipe the imported existing clients database.',
      danger: true,
      onConfirm: () => clearMutation.mutate(),
    });
  };

  const handleDeleteExistingClient = (id: string) => {
    setDeletingClient(true);
    setShowConfirmModal({
      isOpen: true,
      title: 'Delete Existing Client',
      message: 'Are you sure you want to delete this existing client record? This action is permanent.',
      danger: true,
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  const handleViewFolios = (client: ExistingClientData) => {
    setSelectedExistingClient(client);
  };

  if (!pagination) return null;

  const columns = createColumns(handleViewFolios);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <div className="border border-dashed border-neutral-300 bg-white hover:border-neutral-900 transition-colors duration-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative min-h-[140px]">
          {uploadingExistingClientFile ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-neutral-900 animate-spin" />
              <span className="text-sm font-bold font-clash text-neutral-900">
                Uploading & Parsing File...
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                Extracting columns to database
              </span>
            </div>
          ) : (
            <label
              htmlFor="existing-client-upload"
              className="cursor-pointer flex flex-col items-center gap-3 w-full h-full select-none"
            >
              <div className="p-3 bg-neutral-100 rounded-2xl text-neutral-900">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <span className="text-sm font-bold font-clash text-neutral-900 block">
                  Click to Upload Existing Clients CSV / Excel
                </span>
                <span className="text-[11px] text-neutral-500 font-mono mt-1 block">
                  {"Matches by PAN > Email > Name"}
                </span>
              </div>
              <input
                type="file"
                id="existing-client-upload"
                accept=".csv,.xlsx"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex-1 relative w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search existing clients by name, PAN, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 transition duration-200 text-neutral-900 placeholder-neutral-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="border border-neutral-200 bg-white rounded-2xl overflow-hidden shadow-sm">
          <DataTable
            data={clients}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search existing clients..."
            loading={isLoading}
            pagination={pagination}
            onRowClick={handleViewFolios}
          />
        </div>
      </div>
    </div>
  );
}

export default ExistingClientsTab;