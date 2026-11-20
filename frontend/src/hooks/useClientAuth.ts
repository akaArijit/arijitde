'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/api-hooks';
import type { User } from '@/lib/api-client';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoaded: boolean;
}

interface AuthResponseWrapper {
  success: boolean;
  data?: {
    user: User;
    accessToken: string;
  };
  error?: string;
  message?: string;
}

function getTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function useClientAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoaded: false,
  });

  const queryClient = useQueryClient();

  const { data: meData, isLoading: isAuthLoading } = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: () => api.auth.me(),
    enabled: !!getTokenFromStorage(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Sync auth state with query data
  const user = useMemo(() => meData ?? authState.user, [meData, authState.user]);
  const isLoaded = useMemo(() => !!meData || authState.isLoaded, [meData, authState.isLoaded]);

  const setAuthSession = useCallback((token: string, userData: User, remember: boolean) => {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));

    const expiry = remember ? `max-age=${30 * 24 * 60 * 60}` : '';
    document.cookie = `token=${token}; path=/; ${expiry}; SameSite=Lax; Secure`;
    document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; ${expiry}; SameSite=Lax; Secure`;

    setAuthState({ user: userData, token, isLoaded: true });
    queryClient.setQueryData(queryKeys.currentUser, userData);
  }, [queryClient]);

  const clearAuthSession = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    setAuthState({ user: null, token: null, isLoaded: true });
    queryClient.clear();
  }, [queryClient]);

  const logout = useMutation({
    mutationFn: () => api.auth.logout(),
    onSuccess: () => {
      clearAuthSession();
    },
    onError: () => {
      clearAuthSession();
    },
  });

  const login = useMutation<AuthResponseWrapper, Error, { email: string; password: string }>({
    mutationFn: (data) => api.auth.login(data),
    onSuccess: (data) => {
      if (data.success && data.data) {
        setAuthSession(data.data.accessToken, data.data.user, true);
      }
    },
  });

  const register = useMutation<AuthResponseWrapper, Error, { email: string; password: string; name: string; phone?: string }>({
    mutationFn: (data) => api.auth.register(data),
  });

  const googleLogin = useMutation<AuthResponseWrapper, Error, string>({
    mutationFn: (credential) => api.auth.google(credential),
    onSuccess: (data) => {
      if (data.success && data.data) {
        setAuthSession(data.data.accessToken, data.data.user, true);
      }
    },
  });

  const verifyOtp = useMutation<AuthResponseWrapper, Error, { email: string; otp: string; name?: string; password?: string; referredBy?: string }>({
    mutationFn: (data) => api.auth.verifyOtp(data),
    onSuccess: (data) => {
      if (data.success && data.data) {
        setAuthSession(data.data.accessToken, data.data.user, true);
      }
    },
  });

  const forgotPassword = useMutation<AuthResponseWrapper, Error, string>({
    mutationFn: (email) => api.auth.forgotPassword(email),
  });

  const resetPassword = useMutation<AuthResponseWrapper, Error, { email: string; otp: string; newPassword: string }>({
    mutationFn: (data) => api.auth.resetPassword(data),
  });

  return {
    user,
    token: authState.token,
    isLoaded,
    isAuthLoading,
    login,
    register,
    googleLogin,
    verifyOtp,
    forgotPassword,
    resetPassword,
    logout,
    setAuthSession,
    clearAuthSession,
  };
}