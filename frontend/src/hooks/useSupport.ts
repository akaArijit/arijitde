'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/api-hooks';
import type { SupportQuery, AdminQuery } from '@/lib/api-client';

interface SubmitSupportQueryData {
  subject: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export function useMySupportQueries() {
  return useQuery({
    queryKey: queryKeys.supportQueries,
    queryFn: () => api.support.list(),
  });
}

export function useSubmitSupportQuery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitSupportQueryData) => api.support.submit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.supportQueries });
    },
  });
}

export function useAdminSupportQueries() {
  return useQuery({
    queryKey: ['support', 'admin'],
    queryFn: () => api.admin.getQueries(),
  });
}

export function useAdminUpdateSupportQuery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AdminQuery['status'] }) => 
      api.admin.updateQueryStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'admin'] });
    },
  });
}