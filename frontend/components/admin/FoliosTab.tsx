'use client';

import { useState, useMemo } from 'react';
import { DataTable, Pagination } from '@/components/admin/DataTable';
import { Search, Filter, ChevronDown, ChevronUp, RefreshCw, Eye, Download, Plus, Trash2, FileSpreadsheet, Loader2, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminFolios, useAdminUploadFolios, useClearFolios, useDeleteFolio } from '@/hooks/admin-hooks';
import { DetailDrawer } from '@/components/admin/DetailDrawer';
import { UploadZone } from '@/components/admin/UploadZone';
import type { Folio } from '@/lib/api-client';

const formatAvgHolding = (days: number | null) => {
  if (!days) return 'N/A';
  const years = (days / 365).toFixed(1);
  return `${years} yrs`;
};

type AdminFolio = Folio & {
  schemeName?: string | null;
  units?: number | null;
  currentValue?: number | null;
  oneDayChange?: number | null;
  dividend?: number | null;
  averageHoldingDays?: number | null;
  gain?: number | null;
  absoluteReturn?: number | null;
  cagr?: number | null;
  xirr?: number | null;
  clientName?: string | null;
  clientPan?: string | null;
  name?: string | null;
  pan?: string | null;
  mobile?: string | null;
  email?: string | null;
  city?: string | null;
};

export function FoliosTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [uploadingFolioFile, setUploadingFolioFile] = useState(false);
  const [selectedFolio, setSelectedFolio] = useState<AdminFolio | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; danger?: boolean } | null>(null);

  const {
    data: foliosData,
    isLoading: fetchingFolios,
    refetch,
  } = useAdminFolios({ page, limit: 50, search: searchQuery });

  const uploadMutation = useAdminUploadFolios({
    onSuccess: () => {
      refetch();
    },
  });

  const clearMutation = useClearFolios({
    onSuccess: () => {
      setPage(1);
      refetch();
    },
  });

  const deleteMutation = useDeleteFolio({
    onSuccess: () => {
      refetch();
    },
  });

  const folios = foliosData?.data?.items || [];
  const apiPagination = foliosData?.data ? { page: foliosData.data.page, pages: foliosData.data.pages, total: foliosData.data.total } : null;

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
      setUploadingFolioFile(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/admin/folios/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to upload folio records');
      }

      alert(resData.message || 'Folio holdings imported and matched successfully!');
      refetch();
    } catch (err) {
      const error = err as Error;
      alert(error.message || 'Failed to upload file');
    } finally {
      setUploadingFolioFile(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleClearFolios = () => {
    setShowConfirmModal({
      isOpen: true,
      title: 'Delete Folio Database',
      message:
        'Are you absolutely sure you want to delete all folio records? This action is irreversible and will permanently wipe the imported folio database.',
      danger: true,
      onConfirm: () => clearMutation.mutate(),
    });
  };

  const handleDeleteFolio = async (id: string) => {
    if (!confirm('Are you sure you want to delete this folio record? This action is permanent.')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      alert('Folio record deleted successfully.');
      refetch();
    } catch (err) {
      const error = err as Error;
      alert(error.message || 'Failed to delete folio record');
    }
  };

  const columns = useMemo(() => ([
    {
      key: 'name',
      header: 'Client Name',
      render: (folio: AdminFolio) => (
        <div>
          <div className="font-semibold text-neutral-900 text-sm group-hover:text-neutral-700 transition-colors duration-150">
            {folio.name || 'N/A'}
          </div>
          <div className="flex flex-wrap gap-2 items-center mt-0.5">
            {folio.pan && (
              <span className="text-[10px] text-neutral-500 font-mono uppercase bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                PAN: {folio.pan}
              </span>
            )}
            {folio.mobile && (
              <span className="text-[10px] text-neutral-500 font-mono bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                Phone: {folio.mobile}
              </span>
            )}
            {folio.email && (
              <span className="text-[10px] text-neutral-500 font-mono bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                Email: {folio.email}
              </span>
            )}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'id',
      header: 'Folio',
      render: (folio: AdminFolio) => (
        <span className="text-xs font-mono font-semibold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200 inline-block">
          {folio.id || 'N/A'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'city',
      header: 'City',
      render: (folio: AdminFolio) => (
        <span className="text-xs font-bold text-neutral-800 truncate max-w-[200px] block">
          {folio.city || 'N/A'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'aum',
      header: 'AUM',
      render: (folio: AdminFolio) => (
        <span className="font-mono text-neutral-900 font-bold text-right">
          {folio.aum !== null && folio.aum !== undefined
            ? `₹${folio.aum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
            : 'N/A'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'purchaseValue',
      header: 'Purchase Value',
      render: (folio: AdminFolio) => (
        <span className="font-mono text-neutral-700 text-right">
          {folio.purchaseValue !== null && folio.purchaseValue !== undefined
            ? `₹${folio.purchaseValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
            : 'N/A'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'createdAt',
      header: 'Created At',
      render: (folio: AdminFolio) => (
        <span className="font-mono text-neutral-700 text-right">
          {folio.createdAt ? new Date(folio.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (folio: AdminFolio) => (
        <button
          onClick={() => setSelectedFolio(folio)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 bg-white hover:bg-neutral-900 hover:text-white rounded-lg transition duration-200 text-xs font-semibold cursor-pointer text-neutral-900"
        >
          Audit Details
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ]), []);

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <div className="border border-dashed border-neutral-300 bg-white hover:border-neutral-900 transition-colors duration-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative min-h-[140px]">
          {uploadingFolioFile ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-neutral-900 animate-spin" />
              <span className="text-sm font-bold font-clash text-neutral-900">
                Uploading & Parsing Folios File...
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                Extracting all columns to database
              </span>
            </div>
          ) : (
            <label
              htmlFor="existing-client-folio-upload"
              className="cursor-pointer flex flex-col items-center gap-3 w-full h-full select-none"
            >
              <div className="p-3 bg-neutral-100 rounded-2xl text-neutral-900">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <span className="text-sm font-bold font-clash text-neutral-900 block">
                  Click to Upload Folio Holdings CSV / Excel
                </span>
                <span className="text-[11px] text-neutral-500 font-mono mt-1 block">
                  Matches by PAN & Name to update mutual fund folios
                </span>
              </div>
              <input
                type="file"
                id="existing-client-folio-upload"
                accept=".csv,.xlsx"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          )}
        </div>
      </div>

      {/* Search & Listing */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex-1 relative w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search folios by client name, PAN, folio number, scheme..."
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

        {/* Existing Clients Table */}
        <div className="border border-neutral-200 bg-white rounded-2xl overflow-hidden shadow-sm">
          <DataTable
            data={folios}
            columns={columns}
            searchKey="folioNumber"
            searchPlaceholder="Search folios..."
            loading={fetchingFolios}
            pagination={pagination}
            onRowClick={setSelectedFolio}
          />
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowConfirmModal(null)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">{showConfirmModal.title}</h3>
            <p className="text-neutral-600 mb-4">{showConfirmModal.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirmModal(null)} className="px-4 py-2 border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-100">
                Cancel
              </button>
              <button onClick={() => { showConfirmModal.onConfirm(); setShowConfirmModal(null); }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedFolio && (
        <DetailDrawer
          isOpen={!!selectedFolio}
          onClose={() => setSelectedFolio(null)}
          title={`Folio: ${selectedFolio.id || 'N/A'}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-neutral-500">Client Name</p>
                <p className="font-semibold">{selectedFolio.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-neutral-500">Client PAN</p>
                <p className="font-semibold font-mono">{selectedFolio.pan || 'N/A'}</p>
              </div>
              <div>
                <p className="text-neutral-500">Folio ID</p>
                <p className="font-semibold font-mono">{selectedFolio.id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-neutral-500">City</p>
                <p className="font-semibold">{selectedFolio.city || 'N/A'}</p>
              </div>
              <div>
                <p className="text-neutral-500">Mobile</p>
                <p className="font-semibold">{selectedFolio.mobile || 'N/A'}</p>
              </div>
              <div>
                <p className="text-neutral-500">Email</p>
                <p className="font-semibold">{selectedFolio.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-neutral-500">AUM</p>
                <p className="font-semibold font-mono">{selectedFolio.aum != null ? `₹${selectedFolio.aum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-neutral-500">Purchase Value</p>
                <p className="font-semibold font-mono">{selectedFolio.purchaseValue != null ? `₹${selectedFolio.purchaseValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-neutral-500">Created At</p>
                <p className="font-semibold">{selectedFolio.createdAt ? new Date(selectedFolio.createdAt).toLocaleString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-neutral-500">Updated At</p>
                <p className="font-semibold">{selectedFolio.updatedAt ? new Date(selectedFolio.updatedAt).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </DetailDrawer>
      )}
    </div>
  );
}

export default FoliosTab;