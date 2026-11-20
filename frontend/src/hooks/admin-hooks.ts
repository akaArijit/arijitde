import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/api-hooks';
import type {
  PaginatedResponse,
  AUMData,
  LiveSession,
  AdminSupportQuery,
  UploadPortfolioResponse,
  Folio,
  AdminUploadResponse,
  AdminUser,
} from '@/lib/api-client';

type AUMParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
};

type LiveSessionsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

type QueriesParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
};

type FoliosParams = {
  page?: number;
  limit?: number;
  search?: string;
};

// AUM Hooks
export function useAdminAUM(params: AUMParams = {}, options?: UseQueryOptions<PaginatedResponse<AUMData>, Error>) {
  return useQuery({
    queryKey: queryKeys.adminAUM(params),
    queryFn: () => api.admin.getAUM(params),
    ...options,
  });
}

export function useAdminRecalculateAUM(options?: UseMutationOptions<AUMData, Error, string>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clientId: string) => api.admin.recalculateAUM(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'aum'] });
    },
    ...options,
  });
}

// Live Sessions Hooks
export function useAdminLiveSessions(params: LiveSessionsParams = {}, options?: UseQueryOptions<PaginatedResponse<LiveSession>, Error>) {
  return useQuery({
    queryKey: queryKeys.adminLiveSessions(params),
    queryFn: () => api.admin.getLiveSessions(params),
    ...options,
  });
}

export function useAdminEndSession(options?: UseMutationOptions<LiveSession, Error, string>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => api.admin.endSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'live-sessions'] });
    },
    ...options,
  });
}

// Queries Hooks
export function useAdminQueries(params: QueriesParams = {}, options?: UseQueryOptions<PaginatedResponse<AdminSupportQuery>, Error>) {
  return useQuery({
    queryKey: queryKeys.adminQueries(params),
    queryFn: () => api.admin.getQueries(params),
    ...options,
  });
}

export function useAdminUpdateQueryStatus(options?: UseMutationOptions<AdminSupportQuery, Error, { queryId: string; status: AdminSupportQuery['status'] }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ queryId, status }) => api.admin.updateQueryStatus(queryId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'queries'] });
    },
    ...options,
  });
}

export function useAdminReplyQuery(options?: UseMutationOptions<AdminSupportQuery, Error, { queryId: string; message: string }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ queryId, message }) => api.admin.replyQuery(queryId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'queries'] });
    },
    ...options,
  });
}

// Folios Hooks
export function useAdminFolios(params: FoliosParams = {}, options?: UseQueryOptions<PaginatedResponse<Folio>, Error>) {
  return useQuery({
    queryKey: queryKeys.adminFolios(params),
    queryFn: () => api.admin.getFolios(params),
    ...options,
  });
}

export function useAdminUploadFolios(options?: UseMutationOptions<AdminUploadResponse, Error, FormData>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.admin.uploadFolios(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'folios'] });
    },
    ...options,
  });
}

export function useClearFolios(options?: UseMutationOptions<{ success: boolean; message?: string }, Error>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.admin.clearFolios(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'folios'] });
    },
    ...options,
  });
}

export function useDeleteFolio(options?: UseMutationOptions<{ success: boolean; message?: string }, Error, string>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.admin.deleteFolio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'folios'] });
    },
    ...options,
  });
}