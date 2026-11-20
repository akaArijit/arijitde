export type Role = 'GUEST' | 'CLIENT' | 'ADMIN';

export interface User {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  role: Role;
  dob?: string;
  anniversary?: string;
  createdAt: string;
  pan?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface AdminUser extends User {
  pan: string | null;
  referralCode: string | null;
  referrerId: string | null;
  client: ClientProfile | null;
  _count: {
    assessments: number;
    portfolios: number;
    leads: number;
  };
}

export interface ClientProfile {
  activePlan: string | null;
  advisorNotes: string | null;
  activatedAt: string;
}