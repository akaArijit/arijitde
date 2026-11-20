const API_BASE = '/api/v1';

interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  nextCursor?: string;
  nextCursorId?: string;
}

interface ApiError extends Error {
  status: number;
  data?: unknown;
}

class AdminApiClient {

  async getStats() {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      credentials: 'include',
    });
    return res.json();
  }

  async getUsers(page = 1, limit = 20) {
    const res = await fetch(`${API_BASE}/admin/users?page=${page}&limit=${limit}`, {
      credentials: 'include',
    });
    return res.json();
  }

  async updateUserRole(userId: string, role: string) {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ role }),
    });
    return res.json();
  }

  async updateClientProfile(userId: string, data: { advisorNotes?: string; activePlan?: string; pan?: string }) {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/client-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async getLeads(page = 1, limit = 20) {
    const res = await fetch(`${API_BASE}/admin/leads?page=${page}&limit=${limit}`, {
      credentials: 'include',
    });
    return res.json();
  }

  async getExistingClients(params: { page?: number; limit?: number; search?: string } = {}) {
    const searchParams = new URLSearchParams({
      page: String(params.page || 1),
      limit: String(params.limit || 20),
      ...(params.search && { search: params.search }),
    });
    const res = await fetch(`${API_BASE}/admin/existing-clients?${searchParams}`, {
      credentials: 'include',
    });
    return res.json();
  }

  async uploadExistingClients(formData: FormData) {
    const res = await fetch(`${API_BASE}/admin/existing-clients/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    return res.json();
  }

  async deleteExistingClient(id: string) {
    const res = await fetch(`${API_BASE}/admin/existing-clients/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return res.json();
  }

  async clearExistingClients() {
    const res = await fetch(`${API_BASE}/admin/existing-clients/clear`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return res.json();
  }

  async getPortfolioValuations(params: { page?: number; limit?: number; search?: string } = {}) {
    const searchParams = new URLSearchParams({
      page: String(params.page || 1),
      limit: String(params.limit || 50),
      ...(params.search && { search: params.search }),
    });
    const res = await fetch(`${API_BASE}/admin/portfolio-valuations?${searchParams}`, {
      credentials: 'include',
    });
    return res.json();
  }

  async uploadPortfolioValuations(formData: FormData) {
    const res = await fetch(`${API_BASE}/admin/portfolio-valuations/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    return res.json();
  }

  async clearPortfolioValuations() {
    const res = await fetch(`${API_BASE}/admin/portfolio-valuations/clear`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return res.json();
  }

  async uploadFolios(formData: FormData) {
    const res = await fetch(`${API_BASE}/admin/folios/upload?confirm=true`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    return res.json();
  }

  async getFolios(params: { page?: number; limit?: number; search?: string } = {}) {
    const searchParams = new URLSearchParams({
      page: String(params.page || 1),
      limit: String(params.limit || 50),
      ...(params.search && { search: params.search }),
    });
    const res = await fetch(`${API_BASE}/admin/folios?${searchParams}`, {
      credentials: 'include',
    });
    return res.json();
  }

  async clearFolios() {
    const res = await fetch(`${API_BASE}/admin/folios/clear`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return res.json();
  }

  async getContactMessages() {
    const res = await fetch(`${API_BASE}/admin/contact-messages`, {
      credentials: 'include',
    });
    return res.json();
  }

  async getAvailability() {
    const res = await fetch(`${API_BASE}/admin/availability`, {
      credentials: 'include',
    });
    return res.json();
  }

  async saveAvailability(slots: string[]) {
    const res = await fetch(`${API_BASE}/admin/availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ slots }),
    });
    return res.json();
  }

  async getAumDistribution() {
    const res = await fetch(`${API_BASE}/admin/aum-distribution`, {
      credentials: 'include',
    });
    return res.json();
  }

  async getSupportQueries() {
    const res = await fetch(`${API_BASE}/admin/queries`, {
      credentials: 'include',
    });
    return res.json();
  }

  async updateSupportQuery(id: string, status: 'PENDING' | 'RESOLVED') {
    const res = await fetch(`${API_BASE}/admin/queries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    return res.json();
  }

  async deleteSupportQuery(id: string) {
    const res = await fetch(`${API_BASE}/admin/queries/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return res.json();
  }

  async getAdminSessions() {
    const res = await fetch(`${API_BASE}/leads/admin/sessions`, {
      credentials: 'include',
    });
    return res.json();
  }

  async confirmSession(id: string, confirmedSlot: string, googleMeetLink: string) {
    const res = await fetch(`${API_BASE}/leads/admin/sessions/${id}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ confirmedSlot, googleMeetLink }),
    });
    return res.json();
  }

  async updateSessionNotes(id: string, notes: string) {
    const res = await fetch(`${API_BASE}/leads/admin/sessions/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ notes }),
    });
    return res.json();
  }

  async refundSession(id: string) {
    const res = await fetch(`${API_BASE}/leads/admin/sessions/${id}/refund`, {
      method: 'POST',
      credentials: 'include',
    });
    return res.json();
  }

  async deleteSession(id: string) {
    const res = await fetch(`${API_BASE}/leads/admin/sessions/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return res.json();
  }

  async deleteFolio(id: string) {
    const res = await fetch(`${API_BASE}/admin/folios/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return res.json();
  }
}

export const adminApi = new AdminApiClient();