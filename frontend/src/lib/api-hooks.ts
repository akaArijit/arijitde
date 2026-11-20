import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { api } from './api-client';
import type {
  User,
  Assessment,
  Lead,
  Portfolio,
  AdvisorySession,
  PaginatedResponse,
  ExistingClientData,
  SupportQuery,
  ClientData,
  UploadPortfolioResponse,
  Score,
  ContactMessage,
  AdminContactMessage,
  AdminUser,
} from './api-client';

type PaginatedResponseWithPagination<T = unknown> = PaginatedResponse<T> & {
  data: PaginatedResponse<T>['data'] & {
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
      onPageChange: (page: number) => void;
    };
  };
};

// Query keys factory
export const queryKeys = {
  // Auth
  currentUser: ['auth', 'me'] as const,

  // Assessments
  assessments: (userId: string) => ['assessments', userId] as const,
  assessment: (id: string) => ['assessment', id] as const,
  userAssessment: (userId: string) => ['assessment', 'user', userId] as const,

  // Leads
  leads: (params?: { status?: string; page?: number; limit?: number }) =>
    ['leads', params] as const,
  myBookings: ['leads', 'my-bookings'] as const,
  availability: ['leads', 'availability'] as const,
  mySessions: ['leads', 'my-sessions'] as const,
  adminSessions: ['leads', 'admin', 'sessions'] as const,

  // Portfolios
  portfolios: (userId: string) => ['portfolios', userId] as const,
  portfolio: (id: string) => ['portfolio', id] as const,
  clientData: ['portfolio', 'client-data'] as const,

  // Scores
  portfolioScores: (portfolioId: string) => ['scores', portfolioId] as const,
  score: (id: string) => ['score', id] as const,

  // Admin
  adminUsers: (page?: number, limit?: number) => ['admin', 'users', page, limit] as const,
  adminLeads: (page?: number, limit?: number) => ['admin', 'leads', page, limit] as const,
  adminExistingClients: (params?: { page?: number; limit?: number; search?: string }) =>
    ['admin', 'existing-clients', params] as const,
  adminAUM: (params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string }) =>
    ['admin', 'aum', params] as const,
  adminLiveSessions: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    ['admin', 'live-sessions', params] as const,
  adminQueries: (params?: { page?: number; limit?: number; search?: string; status?: string; priority?: string }) =>
    ['admin', 'queries', params] as const,
  adminFolios: (params?: { page?: number; limit?: number; search?: string }) =>
    ['admin', 'folios', params] as const,

  // Support
  supportQueries: ['support'] as const,
} as const;

// Auth hooks
export function useCurrentUser(options?: UseQueryOptions<User, Error>) {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: () => api.auth.me(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string }) => api.auth.login(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: { email: string; password: string; name: string; phone?: string }) => api.auth.register(data),
  });
}

export function useGoogleLogin() {
  return useMutation({
    mutationFn: (credential: string) => api.auth.google(credential),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.auth.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => api.auth.forgotPassword(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: { email: string; otp: string; newPassword: string }) => api.auth.resetPassword(data),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: (data: { email: string; otp: string }) => api.auth.verifyOtp(data),
  });
}

// Assessment hooks
export function useAssessments(userId: string, options?: UseQueryOptions<Assessment[], Error>) {
  return useQuery({
    queryKey: queryKeys.assessments(userId),
    queryFn: () => api.assess.list(),
    enabled: !!userId,
    ...options,
  });
}

export function useAssessment(id: string, options?: UseQueryOptions<Assessment, Error>) {
  return useQuery({
    queryKey: queryKeys.assessment(id),
    queryFn: () => api.assess.get(id),
    enabled: !!id,
    ...options,
  });
}

export function useUserAssessment(userId: string, options?: UseQueryOptions<Assessment | null, Error>) {
  return useQuery({
    queryKey: queryKeys.userAssessment(userId),
    queryFn: () => api.assess.getUser(userId),
    enabled: !!userId,
    ...options,
  });
}

export function useCreateAssessment(options?: UseMutationOptions<Assessment, Error, Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.assess.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.userAssessment(variables.userId) });
    },
    ...options,
  });
}

// Lead hooks
export function useLeads(params?: { status?: string; page?: number; limit?: number }, options?: UseQueryOptions<PaginatedResponse<Lead>, Error>) {
  return useQuery({
    queryKey: queryKeys.leads(params),
    queryFn: () => api.leads.list(params),
    ...options,
  });
}

export function useMyBookings(options?: UseQueryOptions<Lead[], Error>) {
  return useQuery({
    queryKey: queryKeys.myBookings,
    queryFn: () => api.leads.myBookings(),
    ...options,
  });
}

export function useAvailability(options?: UseQueryOptions<string[], Error>) {
  return useQuery({
    queryKey: queryKeys.availability,
    queryFn: () => api.leads.availability(),
    ...options,
  });
}

export function useMySessions(options?: UseQueryOptions<AdvisorySession[], Error>) {
  return useQuery({
    queryKey: queryKeys.mySessions,
    queryFn: () => api.leads.mySessions(),
    ...options,
  });
}

export function useAdminSessions(options?: UseQueryOptions<AdvisorySession[], Error>) {
  return useQuery({
    queryKey: queryKeys.adminSessions,
    queryFn: () => api.leads.adminSessions(),
    ...options,
  });
}

export function useCreateLead(options?: UseMutationOptions<Lead, Error, { name: string; phone: string; scoreId?: string; slot?: string }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.leads.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    ...options,
  });
}

export function useUpdateLeadStatus(options?: UseMutationOptions<Lead, Error, { id: string; status: Lead['status']; notes?: string }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.leads.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminSessions });
    },
    ...options,
  });
}

export function useBookSession(options?: UseMutationOptions<AdvisorySession, Error, { slot1: string; slot2: string; slot3: string }>) {
  return useMutation({
    mutationFn: (data) => api.leads.bookSession(data),
    ...options,
  });
}

export function useBookSessionPublic(options?: UseMutationOptions<AdvisorySession, Error, { name: string; phone: string; email: string; slot1: string; slot2: string; slot3: string }>) {
  return useMutation({
    mutationFn: (data) => api.leads.bookSessionPublic(data),
    ...options,
  });
}

export function useAdminConfirmSession(options?: UseMutationOptions<AdvisorySession, Error, { id: string; confirmedSlot: string; googleMeetLink: string }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.leads.adminConfirm(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminSessions });
    },
    ...options,
  });
}

export function useAdminUpdateSessionNotes(options?: UseMutationOptions<AdvisorySession, Error, { id: string; notes?: string }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.leads.adminNotes(id, data.notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminSessions });
    },
    ...options,
  });
}

export function useAdminRefundSession(options?: UseMutationOptions<AdvisorySession, Error, string>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.leads.adminRefund(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminSessions });
    },
    ...options,
  });
}

export function useAdminDeleteSession(options?: UseMutationOptions<void, Error, string>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.leads.adminDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminSessions });
    },
    ...options,
  });
}

// Portfolio hooks
export function usePortfolios(userId: string, options?: UseQueryOptions<Portfolio[], Error>) {
  return useQuery({
    queryKey: queryKeys.portfolios(userId),
    queryFn: () => api.portfolio.list(),
    enabled: !!userId,
    ...options,
  });
}

export function usePortfolio(id: string, options?: UseQueryOptions<Portfolio, Error>) {
  return useQuery({
    queryKey: queryKeys.portfolio(id),
    queryFn: () => api.portfolio.get(id),
    enabled: !!id,
    ...options,
  });
}

export function useClientData(options?: UseQueryOptions<ClientData, Error>) {
  return useQuery({
    queryKey: queryKeys.clientData,
    queryFn: () => api.portfolio.clientData(),
    ...options,
  });
}

export function useCreatePortfolio(options?: UseMutationOptions<Portfolio, Error, { name: string; assessmentId: string; description?: string }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.portfolio.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolios(variables.assessmentId) });
    },
    ...options,
  });
}

// Score hooks
export function usePortfolioScores(portfolioId: string, options?: UseQueryOptions<Score[], Error>) {
  return useQuery({
    queryKey: queryKeys.portfolioScores(portfolioId),
    queryFn: () => api.score.portfolio(portfolioId),
    enabled: !!portfolioId,
    ...options,
  });
}

export function useScore(id: string, options?: UseQueryOptions<Score, Error>) {
  return useQuery({
    queryKey: queryKeys.score(id),
    queryFn: () => api.score.get(id),
    enabled: !!id,
    ...options,
  });
}

export function useCalculateScore(options?: UseMutationOptions<Score, Error, string>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (portfolioId) => api.score.calculate(portfolioId),
    onSuccess: (_, portfolioId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolioScores(portfolioId) });
    },
    ...options,
  });
}

// Admin hooks
export function useAdminUsers(page = 1, limit = 20, options?: UseQueryOptions<PaginatedResponseWithPagination<AdminUser>, Error>) {
  return useQuery({
    queryKey: queryKeys.adminUsers(page, limit),
    queryFn: () => api.admin.users(page, limit),
    select: (data) => ({
      ...data,
      data: {
        ...data.data,
        pagination: data.data ? {
          page: data.data.page,
          pageSize: limit,
          total: data.data.total,
          onPageChange: () => {},
        } : undefined,
      },
    }),
    ...options,
  });
}

export function useAdminLeads(page = 1, limit = 20, options?: UseQueryOptions<PaginatedResponse<Lead>, Error>) {
  return useQuery({
    queryKey: queryKeys.adminLeads(page, limit),
    queryFn: () => api.admin.leads(page, limit),
    ...options,
  });
}

export function useAdminExistingClients(params?: { page?: number; limit?: number; search?: string }, options?: UseQueryOptions<PaginatedResponseWithPagination<ExistingClientData>, Error>) {
  return useQuery({
    queryKey: queryKeys.adminExistingClients(params),
    queryFn: () => api.admin.existingClients(params),
    select: (data) => ({
      ...data,
      data: {
        ...data.data,
        pagination: data.data ? {
          page: data.data.page,
          pageSize: params?.limit || 50,
          total: data.data.total,
          onPageChange: () => {},
        } : undefined,
      },
    }),
    ...options,
  });
}

export function useAdminUploadPortfolio(options?: UseMutationOptions<UploadPortfolioResponse, Error, FormData>) {
  return useMutation({
    mutationFn: (data) => api.admin.uploadPortfolio(data),
    ...options,
  });
}

export function useAdminSyncFolios(options?: UseMutationOptions<unknown, Error>) {
  return useMutation({
    mutationFn: () => api.admin.syncFolios(),
    ...options,
  });
}

export function useAdminUploadExistingClients(options?: UseMutationOptions<unknown, Error, FormData>) {
  return useMutation({
    mutationFn: (data) => api.admin.uploadExistingClients(data),
    ...options,
  });
}

export function useAdminClearExistingClients(options?: UseMutationOptions<unknown, Error>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.admin.clearExistingClients(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'existing-clients'] });
    },
    ...options,
  });
}

export function useAdminDeleteExistingClient(options?: UseMutationOptions<{ success: boolean; message?: string }, Error, string>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.admin.deleteExistingClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'existing-clients'] });
    },
    ...options,
  });
}

// Chat hooks
export function useChat(options?: UseMutationOptions<{ response: string }, Error, { message: string; context?: string }>) {
  return useMutation({
    mutationFn: (data) => api.chat(data),
    ...options,
  });
}

// Contact hooks
export function useContact(options?: UseMutationOptions<{ success: boolean; message?: string }, Error, { name: string; email: string; phone?: string; subject?: string; message: string }>) {
  return useMutation({
    mutationFn: (data) => api.contact(data),
    ...options,
  });
}

// Support hooks
export function useSupportQueries(options?: UseQueryOptions<SupportQuery[], Error>) {
  return useQuery({
    queryKey: queryKeys.supportQueries,
    queryFn: () => api.support.list(),
    ...options,
  });
}

export function useSubmitSupport(options?: UseMutationOptions<SupportQuery, Error, { subject: string; message: string; priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' }>) {
  return useMutation({
    mutationFn: (data) => api.support.submit(data),
    onSuccess: () => {
      // Invalidate support queries if using useSupportQueries
    },
    ...options,
  });
}

export function useAdminUpdateUser(options?: UseMutationOptions<AdminUser, Error, { userId: string; role: 'GUEST' | 'CLIENT' | 'ADMIN' }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }) => api.admin.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    ...options,
  });
}

export function useAdminUpdateUserProfile(options?: UseMutationOptions<AdminUser, Error, { userId: string; advisorNotes?: string; activePlan?: string; pan?: string | null }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, ...data }) => api.admin.updateUserProfile(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    ...options,
  });
}

// Health check
export function useHealthCheck(options?: UseQueryOptions<{ status: string }, Error>) {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api.health(),
    refetchInterval: 30000,
    ...options,
  });
}