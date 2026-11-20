'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/api-hooks';
import type { AdvisorySession, Lead } from '@/lib/api-client';

interface BookSessionData {
  slot1: string;
  slot2: string;
  slot3: string;
}

interface BookSessionPublicData {
  name: string;
  phone: string;
  email: string;
  slot1: string;
  slot2: string;
  slot3: string;
}

export function useMyBookings() {
  return useQuery({
    queryKey: queryKeys.myBookings,
    queryFn: () => api.leads.myBookings(),
  });
}

export function useAvailability() {
  return useQuery({
    queryKey: queryKeys.availability,
    queryFn: () => api.leads.availability(),
  });
}

export function useMySessions() {
  return useQuery({
    queryKey: queryKeys.mySessions,
    queryFn: () => api.leads.mySessions(),
  });
}

export function useAdminSessions() {
  return useQuery({
    queryKey: queryKeys.adminSessions,
    queryFn: () => api.leads.adminSessions(),
  });
}

export function useBookSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BookSessionData) => api.leads.bookSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myBookings });
      queryClient.invalidateQueries({ queryKey: queryKeys.mySessions });
      queryClient.invalidateQueries({ queryKey: queryKeys.availability });
    },
  });
}

export function useBookSessionPublic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BookSessionPublicData) => api.leads.bookSessionPublic(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.availability });
    },
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; phone: string; scoreId?: string; slot?: string }) => api.leads.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads() });
    },
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; status: Lead['status']; notes?: string }) => api.leads.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads() });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminSessions });
    },
  });
}

export function useAdminConfirmSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { confirmedSlot: string; googleMeetLink: string } }) => 
      api.leads.adminConfirm(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminSessions });
      queryClient.invalidateQueries({ queryKey: queryKeys.mySessions });
    },
  });
}

export function useAdminUpdateSessionNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => api.leads.adminNotes(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminSessions });
      queryClient.invalidateQueries({ queryKey: queryKeys.mySessions });
    },
  });
}

export function useAdminRefundSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.leads.adminRefund(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminSessions });
      queryClient.invalidateQueries({ queryKey: queryKeys.mySessions });
    },
  });
}

export function useAdminDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.leads.adminDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminSessions });
      queryClient.invalidateQueries({ queryKey: queryKeys.mySessions });
    },
  });
}