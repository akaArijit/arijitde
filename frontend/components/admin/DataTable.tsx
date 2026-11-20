'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: keyof T | string;
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  pagination?: Pagination;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string, order: 'asc' | 'desc') => void;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchKey,
  searchPlaceholder = 'Search...',
  onRowClick,
  className = '',
  emptyMessage = 'No data available',
  loading = false,
  pagination,
  sortBy,
  sortOrder,
  onSort,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchKey || !searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((row) => {
      const value = (row as Record<string, any>)[searchKey as string];
      return String(value ?? '').toLowerCase().includes(query);
    });
  }, [data, searchKey, searchQuery]);

  const sortedData = useMemo(() => {
    if (!sortBy || !sortOrder) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = (a as Record<string, any>)[sortBy];
      const bVal = (b as Record<string, any>)[sortBy];
      if (aVal === bVal) return 0;
      const order = sortOrder === 'asc' ? 1 : -1;
      if (aVal === null || aVal === undefined) return 1 * (sortOrder === 'asc' ? 1 : -1);
      if (bVal === null || bVal === undefined) return -1 * (sortOrder === 'asc' ? 1 : -1);
      return (aVal > bVal ? 1 : -1) * (sortOrder === 'asc' ? 1 : -1);
    });
  }, [filteredData, sortBy, sortOrder]);

  const handleSort = (key: string) => {
    if (!onSort) return;
    if (sortBy === key) {
      onSort(key, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(key, 'asc');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1;

  const renderRows = () => {
    if (data.length === 0) {
      return (
        <tr>
          <td
            colSpan={columns.length}
            className="px-6 py-12 text-center text-sm text-neutral-500 font-mono"
          >
            {emptyMessage}
          </td>
        </tr>
      );
    }

    return data.map((row, index) => (
      <tr
        key={String((row as Record<string, any>).id ?? index)}
        className="hover:bg-neutral-50/50 transition duration-150"
        onClick={() => onRowClick?.(row)}
        style={{ cursor: onRowClick ? 'pointer' : 'default' }}
      >
        {columns.map((col) => (
          <td key={col.key} className={`px-6 py-4 ${col.className || ''}`}>
            {col.render
              ? col.render(row)
              : String((row as Record<string, any>)[col.key] ?? '')}
          </td>
        ))}
      </tr>
    ));
  };

  return (
    <div className={className}>
      {searchKey && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2 text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
          />
        </div>
      )}

      <div className="border border-neutral-200 bg-white rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans text-neutral-900">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 uppercase tracking-widest text-[10px] font-bold text-neutral-500 select-none">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-6 py-4 ${col.className || ''} ${col.sortable ? 'cursor-pointer hover:bg-neutral-50' : ''}`}
                    onClick={() => col.sortable && onSort && handleSort(col.key)}
                    style={{ width: col.className?.includes('w-') ? undefined : undefined }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {sortBy === col.key && (
                        <span className="flex items-center">
                          {sortOrder === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-primary" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {renderRows()}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="border-t border-neutral-200 px-6 py-4 flex items-center justify-between bg-neutral-50">
            <span className="text-[11px] font-mono text-neutral-500">
              Showing page {pagination.page} of {totalPages} ({pagination.total} total records)
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1 || loading}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                className="px-3 py-1.5 border border-neutral-200 bg-white rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 cursor-pointer select-none"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= totalPages || loading}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                className="px-3 py-1.5 border border-neutral-200 bg-white rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 cursor-pointer select-none"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataTable;