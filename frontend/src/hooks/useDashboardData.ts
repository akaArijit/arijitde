'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/api-hooks';
import type { AdvisorySession, ExistingClientData } from '@finanalysis/shared';

type DashboardStage =
  | 'LOADING'
  | 'QUIZ'
  | 'BOOKING'
  | 'ANALYZE'
  | 'REPORT'
  | 'CLIENT_STATUS';

interface UserData {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  createdAt?: string;
  referralCode?: string;
  dob?: string;
}

interface AssessmentData {
  age: number;
  ageRange: string;
  lifeStage: string;
  goal: string;
  investmentTenure: string;
  isCompletePortfolio: boolean | null;
  investmentStyle: string;
  expectedReturn: string;
  riskBehavior: string;
  monthlyInvestment: string;
  emergencyFund: string;
}

interface ScoreReport {
  total: number;
  goalAlignment: number;
  assetAlloc: number;
  diversification: number;
  discipline: number;
  efficiency: number;
  tag: 'ALIGNED' | 'MODERATE' | 'NEEDS_REVIEW' | 'NEEDS_STRUCTURING';
  insights: string[] | { textInsights: string[]; comparison?: unknown };
}

interface Session {
  id: string;
  userId: string;
  preferredSlot1: string;
  preferredSlot2: string;
  preferredSlot3: string;
  confirmedSlot?: string;
  googleMeetLink?: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardState {
  isLoaded: boolean;
  userData: UserData | null;
  token: string | null;
  dashboardStage: DashboardStage;
  error: string | null;
  apiLoading: boolean;
  statusMsg: string;
  sessions: AdvisorySession[];
  slot1: string;
  slot2: string;
  slot3: string;
  showPhoneModal: boolean;
  phoneInput: string;
  dobInput: string;
  anniversaryInput: string;
  modalSubmitting: boolean;
  modalError: string | null;
  uploadedFile: File | null;
  showDateForm: boolean;
  pendingFunds: Array<{ fundName: string; invested: number; currentValue: number; startDate: string; type: 'LUMPSUM' | 'SIP'; sipAmount: number }>;
  showGrowwGuide: boolean;
  isExistingClient: boolean;
  existingClientData: ExistingClientData | null;
  activeAssessmentId: string | null;
  activePortfolioId: string | null;
  localActivePortfolio: { id: string; name: string } | null;
  scoreReport: ScoreReport | null;
  viewFullReport: boolean;
  payments: Array<{ id: string; productType: string; status: string; amount: number; createdAt: string }>;
  bookings: Array<{ id: string; productName: string; scheduledAt: string; status: string }>;
  selectedSlot: string;
  bookingName: string;
  bookingPhone: string;
  freeSlots: string[];
  fetchingSlots: boolean;
  manualRows: Array<{ fundName: string; invested: number; currentValue: number; startDate: string; type: 'LUMPSUM' | 'SIP'; sipAmount: number }>;
  quizStep: number;
  quizAgeRange: string;
  quizAge: number;
  quizLifeStage: string;
  quizGoal: string;
  quizInvestmentTenure: string;
  quizIsCompletePortfolio: boolean | null;
  quizInvestmentStyle: string;
  quizExpectedReturn: string;
  quizRiskBehavior: string;
  quizMonthlyInvestment: string;
  quizEmergencyFund: string;
  showNotSureMessage: boolean;
}

const getTokenFromStorage = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

const fetchWithAuth = async (url: string, token: string) => {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export function useDashboardData() {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<DashboardState>({
    isLoaded: false,
    userData: null,
    token: null,
    dashboardStage: 'LOADING',
    error: null,
    apiLoading: false,
    statusMsg: '',
    sessions: [],
    slot1: '',
    slot2: '',
    slot3: '',
    showPhoneModal: false,
    phoneInput: '',
    dobInput: '',
    anniversaryInput: '',
    modalSubmitting: false,
    modalError: null,
    uploadedFile: null,
    showDateForm: false,
    pendingFunds: [],
    showGrowwGuide: false,
    isExistingClient: false,
    existingClientData: null,
    activeAssessmentId: null,
    activePortfolioId: null,
    localActivePortfolio: null,
    scoreReport: null,
    viewFullReport: false,
    payments: [],
    bookings: [],
    selectedSlot: '',
    bookingName: '',
    bookingPhone: '',
    freeSlots: [],
    fetchingSlots: false,
    manualRows: [],
    quizStep: 1,
    quizAgeRange: '',
    quizAge: 0,
    quizLifeStage: '',
    quizGoal: '',
    quizInvestmentTenure: '',
    quizIsCompletePortfolio: null,
    quizInvestmentStyle: '',
    quizExpectedReturn: '',
    quizRiskBehavior: '',
    quizMonthlyInvestment: '',
    quizEmergencyFund: '',
    showNotSureMessage: false,
  });

  const fetchDashboardState = useCallback(async () => {
    const storedToken = getTokenFromStorage();
    if (!storedToken) {
      setState(prev => ({ ...prev, isLoaded: true }));
      return;
    }

    try {
      setState(prev => ({ ...prev, apiLoading: true, statusMsg: 'Fetching your profile...' }));

      const token = storedToken;
      const headers = { Authorization: `Bearer ${token}` };

      const [
        userRes,
        sessionsRes,
        paymentsRes,
        leadsRes,
        assessRes,
        ecRes,
        portRes,
      ] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/auth/me`, { headers }).catch(() => null),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/leads/my-sessions`, { headers }).catch(() => null),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/payment/my-payments`, { headers }).catch(() => null),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/leads`, { headers }).catch(() => null),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/assess`, { headers }).catch(() => null),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/portfolio/client-data`, { headers }).catch(() => null),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/portfolio`, { headers }).catch(() => null),
      ]);

      const userData = await userRes?.json();
      const sessions = await sessionsRes?.json();
      const payments = await paymentsRes?.json();
      const leads = await leadsRes?.json();
      const assessments = await assessRes?.json();
      const existingClientData = await ecRes?.json();
      const portfolios = await portRes?.json();

      if (userData) {
        setState(prev => ({ ...prev, userData, token }));
      }

      if (sessions) setState(prev => ({ ...prev, sessions }));
      if (payments) setState(prev => ({ ...prev, payments }));
      if (leads) setState(prev => ({ ...prev, bookings: leads }));
      if (assessments) setState(prev => ({ ...prev, quizStep: assessments.length > 0 ? 5 : 1 }));
      if (existingClientData) setState(prev => ({ ...prev, existingClientData }));
      if (portfolios) {
        const activePortfolio = (portfolios as Array<{ id: string; name?: string }>).find((p) => p.id === state.activePortfolioId) || portfolios[0];
        if (activePortfolio) {
          setState(prev => ({ ...prev, activePortfolioId: activePortfolio.id, localActivePortfolio: { id: activePortfolio.id, name: activePortfolio.name } }));
        }
      }

      if (!state.userData) {
        setState(prev => ({ ...prev, dashboardStage: 'QUIZ' }));
      } else if (state.existingClientData && !state.activeAssessmentId) {
        setState(prev => ({ ...prev, dashboardStage: 'ANALYZE' }));
      } else if (state.activeAssessmentId && !state.activePortfolioId) {
        setState(prev => ({ ...prev, dashboardStage: 'ANALYZE' }));
      } else if (state.activePortfolioId && !state.scoreReport) {
        setState(prev => ({ ...prev, dashboardStage: 'REPORT' }));
      } else if (state.scoreReport) {
        setState(prev => ({ ...prev, dashboardStage: 'CLIENT_STATUS' }));
      }

      setState(prev => ({ ...prev, isLoaded: true }));
    } catch (err) {
      console.error('Failed to fetch dashboard state:', err);
      setState(prev => ({ ...prev, error: 'Failed to load dashboard. Please refresh the page.', isLoaded: true }));
    } finally {
      setState(prev => ({ ...prev, apiLoading: false }));
    }
  }, []);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    // Defer to avoid synchronous setState in effect
    setTimeout(() => {
      if (mountedRef.current) {
        fetchDashboardState();
      }
    }, 0);
    return () => {
      mountedRef.current = false;
    };
     
  }, [fetchDashboardState]);

  const handleSignOut = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    setState(prev => ({ ...prev, userData: null, token: null, isLoaded: false }));
    router.push('/');
  }, [router]);

  const fetchWithAuth = useCallback(async (url: string) => {
    const token = getTokenFromStorage();
    if (!token) throw new Error('No token');
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }, []);

  return {
    // State
    ...state,
    // Actions
    handleSignOut,
    fetchDashboardState,
    setState: setState as React.Dispatch<React.SetStateAction<DashboardState>>,
    fetchWithAuth,
  };
}