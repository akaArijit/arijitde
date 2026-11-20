import { getCsrfToken } from './csrf';
import type {
  User,
  Assessment,
  Lead,
  Portfolio,
  ScoreTag,
  ScoreInsight,
  Score,
  SupportQuery,
  PaginatedResponse,
  PaginatedData,
  Folio,
  ClientData,
  UploadPortfolioResponse,
  AUMData,
  LiveSession,
  AdminQuery,
  AdminUser,
  ExistingClientData,
  ExistingClientFolio,
  AdminSupportQuery,
  AdminUploadResponse,
  AdminUserFilters,
  AdminClientFilters,
  AdminSessionFilters,
  AdminQueryFilters,
  PaginationParams,
  SearchParams,
  AdminSessionConfirm,
  AdminSessionNotes,
  AdminTab,
  UserRole,
  SessionStatus,
  QueryStatus,
  AvailabilitySlot,
  AdminContactMessage,
  ContactMessage,
  AdvisorySession,
  AuthResponse,
} from '@finanalysis/shared';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly response: Response,
    public readonly data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      data = await response.text();
    }
    
    const errorData = data as Record<string, unknown> | undefined;
    return new ApiError(
      (errorData?.detail as string) || (errorData?.error as string) || response.statusText,
      response.status,
      response,
      data
    );
  }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const csrfToken = getCsrfToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw await ApiError.fromResponse(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('Content-Type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }

  return response.text() as T;
}

const API_BASE = '/api/v1';

export const api = {
  // Auth
  auth: {
    me: () => fetchApi<User>('/auth/me'),
    login: (data: { email: string; password: string }) => 
      fetchApi<{ success: boolean; data: AuthResponse; message?: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    register: (data: { email: string; password: string; name: string; phone?: string }) =>
      fetchApi<{ success: boolean; data: AuthResponse; message?: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    google: (credential: string) =>
      fetchApi<{ success: boolean; data: AuthResponse; message?: string }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential }),
      }),
    logout: () => fetchApi<{ success: boolean; message?: string }>('/auth/logout', { method: 'POST' }),
    forgotPassword: (email: string) =>
      fetchApi<{ success: boolean; message?: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
      fetchApi<{ success: boolean; data: AuthResponse; message?: string }>('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
    verifyOtp: (data: { email: string; otp: string }) =>
      fetchApi<{ success: boolean; data: AuthResponse; message?: string }>('/auth/verify-otp', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Assessments
  assess: {
    list: () => fetchApi<Assessment[]>('/assess'),
    get: (id: string) => fetchApi<Assessment>(`/assess/${id}`),
    getUser: (userId: string) => fetchApi<Assessment>(`/assess/user/${userId}`),
    create: (data: Partial<Assessment>) =>
      fetchApi<Assessment>('/assess', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Leads
  leads: {
    list: (params?: { status?: string; page?: number; limit?: number }) => {
      const search = new URLSearchParams(params as Record<string, string>).toString();
      return fetchApi<PaginatedResponse<Lead>>(`/leads${search ? `?${search}` : ''}`);
    },
    myBookings: () => fetchApi<Lead[]>('/leads/my-bookings'),
    availability: () => fetchApi<string[]>('/leads/availability'),
    mySessions: () => fetchApi<AdvisorySession[]>('/leads/my-sessions'),
    adminSessions: () => fetchApi<AdvisorySession[]>('/leads/admin/sessions'),
    create: (data: { name: string; phone: string; scoreId?: string; slot?: string }) =>
      fetchApi<Lead>('/leads', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: string, data: { status: string; notes?: string }) =>
      fetchApi<Lead>(`/leads/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
    bookSession: (data: { slot1: string; slot2: string; slot3: string }) =>
      fetchApi<AdvisorySession>('/leads/book-session', { method: 'POST', body: JSON.stringify(data) }),
    bookSessionPublic: (data: { name: string; phone: string; email: string; slot1: string; slot2: string; slot3: string }) =>
      fetchApi<AdvisorySession>('/leads/book-session-public', { method: 'POST', body: JSON.stringify(data) }),
    adminConfirm: (id: string, data: { confirmedSlot: string; googleMeetLink: string }) =>
      fetchApi<AdvisorySession>(`/leads/admin/sessions/${id}/confirm`, { method: 'POST', body: JSON.stringify(data) }),
    adminNotes: (id: string, notes?: string) =>
      fetchApi<AdvisorySession>(`/leads/admin/sessions/${id}/notes`, { method: 'POST', body: JSON.stringify({ notes }) }),
    adminRefund: (id: string) => fetchApi<AdvisorySession>(`/leads/admin/sessions/${id}/refund`, { method: 'POST' }),
    adminDelete: (id: string) => fetchApi<void>(`/leads/admin/sessions/${id}`, { method: 'DELETE' }),
  },

  // Portfolios
  portfolio: {
    list: () => fetchApi<Portfolio[]>('/portfolio'),
    get: (id: string) => fetchApi<Portfolio>(`/portfolio/${id}`),
    clientData: () => fetchApi<ClientData>('/portfolio/client-data'),
    create: (data: { name: string; assessmentId: string; description?: string }) =>
      fetchApi<Portfolio>('/portfolio', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Scores
  score: {
    portfolio: (portfolioId: string) => fetchApi<Score[]>(`/score/portfolio/${portfolioId}`),
    get: (id: string) => fetchApi<Score>(`/score/${id}`),
    calculate: (portfolioId: string) => fetchApi<Score>(`/score/${portfolioId}`, { method: 'POST' }),
  },

  // Admin
  admin: {
    users: (page = 1, limit = 20) => fetchApi<PaginatedResponse<AdminUser>>(`/admin/users?page=${page}&limit=${limit}`),
    leads: (page = 1, limit = 20) => fetchApi<PaginatedResponse<Lead>>(`/admin/leads?page=${page}&limit=${limit}`),
    existingClients: (params?: { page?: number; limit?: number; search?: string }) => {
      const search = new URLSearchParams(params as Record<string, string>).toString();
      return fetchApi<PaginatedResponse<ExistingClientData>>(`/admin/existing-clients${search ? `?${search}` : ''}`);
    },
    uploadPortfolio: (formData: FormData) => fetchApi<UploadPortfolioResponse>('/admin/portfolio-upload', { method: 'POST', body: formData, headers: {} }),
    syncFolios: () => fetchApi<{ success: boolean; message?: string }>('/admin/sync-folios', { method: 'POST' }),
    uploadExistingClients: (formData: FormData) => fetchApi<AdminUploadResponse>('/admin/existing-clients/upload', { method: 'POST', body: formData, headers: {} }),
    clearExistingClients: () => fetchApi<{ success: boolean; message?: string }>('/admin/existing-clients/clear', { method: 'DELETE' }),
    deleteExistingClient: (id: string) => fetchApi<{ success: boolean; message?: string }>(`/admin/existing-clients/${id}`, { method: 'DELETE' }),
    getAUM: (params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string }) => {
      const search = new URLSearchParams(params as Record<string, string>).toString();
      return fetchApi<PaginatedResponse<AUMData>>(`/admin/aum${search ? `?${search}` : ''}`);
    },
    recalculateAUM: (clientId: string) => fetchApi<AUMData>(`/admin/aum/recalculate/${clientId}`, { method: 'POST' }),
    getLiveSessions: (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
      const search = new URLSearchParams(params as Record<string, string>).toString();
      return fetchApi<PaginatedResponse<LiveSession>>(`/admin/live-sessions${search ? `?${search}` : ''}`);
    },
    endSession: (sessionId: string) => fetchApi<LiveSession>(`/admin/live-sessions/${sessionId}/end`, { method: 'POST' }),
    getQueries: (params?: { page?: number; limit?: number; search?: string; status?: string; priority?: string }) => {
      const search = new URLSearchParams(params as Record<string, string>).toString();
      return fetchApi<PaginatedResponse<AdminSupportQuery>>(`/admin/queries${search ? `?${search}` : ''}`);
    },
    updateQueryStatus: (queryId: string, status: string) => fetchApi<AdminSupportQuery>(`/admin/queries/${queryId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    replyQuery: (queryId: string, message: string) => fetchApi<AdminSupportQuery>(`/admin/queries/${queryId}/reply`, { method: 'POST', body: JSON.stringify({ message }) }),
    getFolios: (params?: { page?: number; limit?: number; search?: string }) => {
      const search = new URLSearchParams(params as Record<string, string>).toString();
      return fetchApi<PaginatedResponse<Folio>>(`/admin/folios${search ? `?${search}` : ''}`);
    },
    uploadFolios: (formData: FormData) => fetchApi<AdminUploadResponse>('/admin/folios/upload', { method: 'POST', body: formData, headers: {} }),
    clearFolios: () => fetchApi<{ success: boolean; message?: string }>('/admin/folios/clear', { method: 'DELETE' }),
    deleteFolio: (id: string) => fetchApi<{ success: boolean; message?: string }>(`/admin/folios/${id}`, { method: 'DELETE' }),
    updateUserRole: (userId: string, role: 'GUEST' | 'CLIENT' | 'ADMIN') => fetchApi<AdminUser>(`/admin/users/${userId}/role`, { method: 'POST', body: JSON.stringify({ role }) }),
    updateUserProfile: (userId: string, data: { advisorNotes?: string; activePlan?: string; pan?: string | null }) => fetchApi<AdminUser>(`/admin/users/${userId}/client-profile`, { method: 'POST', body: JSON.stringify(data) }),
  },

  // Chat
  chat: (data: { message: string; context?: string }) =>
    fetchApi<{ response: string }>('/chat', { method: 'POST', body: JSON.stringify(data) }),

  // Contact
  contact: (data: { name: string; email: string; phone?: string; subject?: string; message: string }) =>
    fetchApi<{ success: boolean; message?: string }>('/contact', { method: 'POST', body: JSON.stringify(data) }),

  // Support
  support: {
    list: () => fetchApi<SupportQuery[]>('/support'),
    submit: (data: { subject: string; message: string; priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' }) =>
      fetchApi<SupportQuery>('/support', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Health
  health: () => fetchApi<{ status: string }>('/health'),
};

export { fetchApi };

// Re-export types from shared (deduplicated)
export type {
  User,
  Assessment,
  Lead,
  Portfolio,
  ScoreTag,
  ScoreInsight,
  Score,
  SupportQuery,
  PaginatedResponse,
  PaginatedData,
  Folio,
  ClientData,
  UploadPortfolioResponse,
  AUMData,
  LiveSession,
  AdminQuery,
  AdminUser,
  ExistingClientData,
  ExistingClientFolio,
  AdminSupportQuery,
  AdminUploadResponse,
  AdminUserFilters,
  AdminClientFilters,
  AdminSessionFilters,
  AdminQueryFilters,
  PaginationParams,
  SearchParams,
  AdminSessionConfirm,
  AdminSessionNotes,
  AdminTab,
  UserRole,
  SessionStatus,
  QueryStatus,
  AvailabilitySlot,
  AdminContactMessage,
  ContactMessage,
  AdvisorySession,
};