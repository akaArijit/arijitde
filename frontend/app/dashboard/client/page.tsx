'use client';

import { useEffect, useState, useCallback } from 'react';
import { csrfFetch } from '@/lib/csrf';
import { ChartAreaInteractive } from '@/components/ChartAreaInteractive';
import { ChartRadarDots } from '@/components/ChartRadarDots';
import SoftBoxBlurBg from '@/components/SoftBoxBlurBg';
import GradualBlur from '@/components/GradualBlur';
import ChatbotWidget from '@/components/ChatbotWidget';
import Footer from '@/components/Footer';
import { ClientHeader } from '@/components/dashboard/ClientHeader';
import { PortfolioOverview } from '@/components/dashboard/PortfolioOverview';
import { PortfolioAnalyzer } from '@/components/dashboard/PortfolioAnalyzer';
import { AssessmentWizard } from '@/components/dashboard/AssessmentWizard';
import { BookingManager } from '@/components/dashboard/BookingManager';
import { SupportCenter } from '@/components/dashboard/SupportCenter';
import { ExistingClientView } from '@/components/dashboard/ExistingClientView';
import { PanLoginForm } from '@/components/dashboard/PanLoginForm';
import { useClientAuth } from '@/hooks';
import { usePortfolios, usePortfolio, useCreatePortfolio, useUploadPortfolio, useCalculateScore, useClientData, usePortfolioScores, useCreateManualPortfolio } from '@/hooks/usePortfolio';
import { useAssessments, useUserAssessment, useCreateAssessment } from '@/hooks/useAssessment';
import { useMyBookings, useAvailability, useBookSession, useCreateLead, useMySessions } from '@/hooks/useBooking';
import { useMySupportQueries, useSubmitSupportQuery } from '@/hooks/useSupport';

interface PortfolioRow {
  fundName: string;
  type: 'SIP' | 'LUMPSUM';
  startDate: string;
  sipAmount: number;
  invested: number;
  currentValue: number;
}

interface ScoreData {
  total: number;
  goalAlignment: number;
  assetAlloc: number;
  diversification: number;
  discipline: number;
  efficiency: number;
  tag: 'ALIGNED' | 'MODERATE' | 'NEEDS_REVIEW' | 'NEEDS_STRUCTURING';
  insights?: any;
}

const PLAN_LABELS: Record<string, string> = {
  FREE: 'Free Tier',
  PREMIUM: 'Premium Pro Plan',
  MAX: 'Max Portfolio Plan',
};

const getSchemeCategory = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('bluechip') || n.includes('large cap') || n.includes('large-cap') || n.includes('index')) return 'Large Cap';
  if (n.includes('mid cap') || n.includes('midcap') || n.includes('mid-cap')) return 'Mid Cap';
  if (n.includes('small cap') || n.includes('smallcap') || n.includes('small-cap')) return 'Small Cap';
  if (n.includes('flexi cap') || n.includes('flexicap') || n.includes('flexi-cap') || n.includes('multicap') || n.includes('multi cap')) return 'Flexi Cap';
  if (n.includes('elss') || n.includes('tax saver') || n.includes('tax-saver')) return 'ELSS (Tax Saver)';
  if (n.includes('debt') || n.includes('bond') || n.includes('liquid') || n.includes('treasury') || n.includes('money market') || n.includes('gilt')) return 'Debt';
  if (n.includes('hybrid') || n.includes('balanced') || n.includes('arbitrage') || n.includes('asset allocator')) return 'Hybrid';
  return 'Equity - Other';
};

export default function ClientDashboard() {
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(null);
  const [activePortfolioId, setActivePortfolioId] = useState<string | null>(null);
  const [existingClientData, setExistingClientData] = useState<any | null>(null);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [clientBookings, setClientBookings] = useState<string[]>([]);
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [payments, setPayments] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [slot1, setSlot1] = useState('');
  const [slot2, setSlot2] = useState('');
  const [slot3, setSlot3] = useState('');
  const [mustSchedule, setMustSchedule] = useState(false);
  const [analyzeTab, setAnalyzeTab] = useState<'FILE' | 'MANUAL'>('FILE');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [manualRows, setManualRows] = useState<PortfolioRow[]>([
    { fundName: '', type: 'SIP', startDate: '', sipAmount: 0, invested: 0, currentValue: 0 }
  ]);
  const [supportQueries, setSupportQueries] = useState<any[]>([]);
  const [querySubject, setQuerySubject] = useState('');
  const [queryMessage, setQueryMessage] = useState('');
  const [submittingQuery, setSubmittingQuery] = useState(false);
  const [querySuccess, setQuerySuccess] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [showPanLogin, setShowPanLogin] = useState(false);
  const [viewFullReport, setViewFullReport] = useState(false);
  const [localScoreReport, setLocalScoreReport] = useState<ScoreData | null>(null);
  const [localActivePortfolio, setLocalActivePortfolio] = useState<any>(null);

  const {
    user,
    token,
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
  } = useClientAuth();

  const [error, setError] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const [panInput, setPanInput] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [showClientPassword, setShowClientPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authenticating, setAuthenticating] = useState(false);

  const [forgotFlow, setForgotFlow] = useState<'LOGIN' | 'SEND_OTP' | 'VERIFY_RESET'>('LOGIN');
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  const [showQuiz, setShowQuiz] = useState(false);
  const [shouldAnalyzeAfterQuiz, setShouldAnalyzeAfterQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(1);
  const [quizAgeRange, setQuizAgeRange] = useState<string>('25_35');
  const [quizAge, setQuizAge] = useState<number>(30);
  const [quizLifeStage, setQuizLifeStage] = useState<string>('');
  const [quizGoal, setQuizGoal] = useState<string>('WEALTH_CREATION');
  const [quizInvestmentTenure, setQuizInvestmentTenure] = useState<string>('');
  const [quizIsCompletePortfolio, setQuizIsCompletePortfolio] = useState<boolean | null>(true);
  const [quizInvestmentStyle, setQuizInvestmentStyle] = useState<string>('');
  const [quizExpectedReturn, setQuizExpectedReturn] = useState<string>('');
  const [quizRiskBehavior, setQuizRiskBehavior] = useState<string>('');
  const [quizMonthlyInvestment, setQuizMonthlyInvestment] = useState<string>('');
  const [quizEmergencyFund, setQuizEmergencyFund] = useState<string>('');
  const [showNotSureMessage, setShowNotSureMessage] = useState(false);

  const { data: portfoliosData, isLoading: portfoliosLoading } = usePortfolios(user?.id || '');
  const { data: activePortfolio } = usePortfolio(activePortfolioId || '');
  const { data: scoreReport } = usePortfolioScores(activePortfolioId || '');
  const { data: assessmentsData } = useAssessments(user?.id || '');
  const { data: userAssessment } = useUserAssessment(user?.id || '');
  const { data: myBookings } = useMyBookings();
  const { data: availability } = useAvailability();
  const { data: mySessions } = useMySessions();
  const { data: mySupportQueries, isLoading: fetchingQueries } = useMySupportQueries();

  const createPortfolioMutation = useCreatePortfolio();
  const uploadPortfolioMutation = useUploadPortfolio();
  const createManualPortfolioMutation = useCreateManualPortfolio();
  const calculateScoreMutation = useCalculateScore();
  const createAssessmentMutation = useCreateAssessment();
  const bookSessionMutation = useBookSession();
  const createLeadMutation = useCreateLead();
  const submitQueryMutation = useSubmitSupportQuery();

  const hasExistingClientData = !!(existingClientData && (existingClientData.aum || existingClientData.currentValue || 0) > 0);
  const hasActivePortfolioData = !!(localActivePortfolio && localActivePortfolio.rows && localActivePortfolio.rows.length > 0);

  const currentVal = hasExistingClientData
    ? existingClientData.aum || existingClientData.currentValue || 0
    : hasActivePortfolioData
      ? localActivePortfolio.rows.reduce((sum: number, r: any) => sum + (r.currentValue || 0), 0)
      : 0;

  const investedVal = hasExistingClientData && (existingClientData.purchaseValue || 0) > 0
    ? existingClientData.purchaseValue
    : hasActivePortfolioData
      ? localActivePortfolio.rows.reduce((sum: number, r: any) => sum + (r.invested || 0), 0)
      : 0;

  const unifiedFolios = hasExistingClientData && existingClientData.folios?.length > 0
    ? existingClientData.folios
    : hasActivePortfolioData
      ? localActivePortfolio.rows.map((r: any) => ({
          schemeName: r.fundName || 'Unknown Scheme',
          purchaseValue: r.invested || 0,
          aum: r.currentValue || 0,
          units: 0
        }))
      : [];

  const formatCurrency = (val: number) => {
    if (val >= 1e7) return `₹${(val / 1e7).toFixed(2)} Cr`;
    if (val >= 1e5) return `₹${(val / 1e5).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const formatPercent = (val: number) => {
    const color = val >= 0 ? 'text-green-600' : 'text-red-600';
    const prefix = val >= 0 ? '+' : '';
    return <span className={`font-bold ${color}`}>{prefix}{val.toFixed(2)}%</span>;
  };

  const setAuthSessionCallback = useCallback((token: string, user: any, remember: boolean) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    const expiry = remember ? `max-age=${30 * 24 * 60 * 60}` : '';
    document.cookie = `token=${token}; path=/; ${expiry}; SameSite=Lax; Secure`;
    document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; ${expiry}; SameSite=Lax; Secure`;

    setAuthSession(token, user, remember);
  }, [setAuthSession]);

  const clearAuthSessionCallback = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    clearAuthSession();
  }, [clearAuthSession]);

  const handlePanLogin = async (token: string, user: any) => {
    setAuthSessionCallback(token, user, true);
    setShowPanLogin(false);
  };

  const fetchClientData = useCallback(async () => {
    if (!token) return;
    try {
      setApiLoading(true);
      setStatusMsg('Loading premium client workspace...');

      const headers = { Authorization: `Bearer ${token}` };

      // 1. Me check
      const meRes = await fetch(`/api/v1/auth/me`, { headers });
      if (meRes.status === 401) {
        clearAuthSessionCallback();
        window.location.href = '/onboarding';
        return;
      }
      const meData = await meRes.json();
      if (meRes.ok && (meData.data?.role === 'CLIENT' || meData.data?.role === 'ADMIN')) {
        localStorage.setItem('user', JSON.stringify(meData.data));
      }

      // 2. Fetch assessments
      const assessRes = await fetch(`/api/v1/assess`, { headers });
      const assessData = await assessRes.json();
      const userAssessments = assessData.success ? assessData.data : [];

      if (userAssessments.length > 0) {
        const latestAssessment = userAssessments[0];
        setActiveAssessmentId(latestAssessment.id);
      }

      // 3. Fetch portfolios
      const portRes = await fetch(`/api/v1/portfolio`, { headers });
      const portData = await portRes.json();
      const userPortfolios = portData.success ? portData.data : [];

      if (userPortfolios.length > 0) {
        const latestPortfolio = userPortfolios[0];
        setActivePortfolioId(latestPortfolio.id);
        setLocalActivePortfolio(latestPortfolio);
        if (latestPortfolio.score) {
          setLocalScoreReport(latestPortfolio.score);
        }
      }

      // 4. Fetch official matching ExistingClient and Folios data
      try {
        const ecRes = await fetch(`/api/v1/portfolio/client-data`, { headers });
        const ecData = await ecRes.json();
        if (ecData.success && ecData.data) {
          setExistingClientData(ecData.data);
        }
      } catch (ecErr) {
        console.error('Failed to load certified valuation telemetry:', ecErr);
      }

    } catch (err) {
      console.error(err);
      setError('Failed to load diagnostic telemetry data.');
    } finally {
      setApiLoading(false);
    }
  }, [token, clearAuthSessionCallback]);

  const calculatePortfolioScore = async (portfolioId: string) => {
    try {
      const res = await calculateScoreMutation.mutateAsync(portfolioId) as unknown as { success: boolean; data: ScoreData; error?: string };
      if (res.success) {
        setLocalScoreReport(res.data);
      } else {
        setError(res.error || 'Failed to analyze score.');
      }
    } catch (err) {
      setError('Network error running score calculation.');
    }
  };

  const handleAnalyzeCertifiedPortfolio = async (assessmentIdParam?: any) => {
    const targetAssessmentId = (typeof assessmentIdParam === 'string') ? assessmentIdParam : activeAssessmentId;

    if (!targetAssessmentId) {
      setError(null);
      setShouldAnalyzeAfterQuiz(true);
      setQuizStep(1);
      return;
    }

    if (!existingClientData || !existingClientData.folios || existingClientData.folios.length === 0) {
      setError('No certified holdings found to analyze.');
      return;
    }

    setError(null);
    setApiLoading(true);
    setStatusMsg('Analyzing certified portfolio...');

    try {
      const rows = existingClientData.folios
        .filter((f: any) => f.purchaseValue !== null && f.purchaseValue !== undefined && f.purchaseValue > 0 && f.aum !== null && f.aum !== undefined && f.aum > 0)
        .map((f: any) => ({
          fundName: f.schemeName || 'Unknown Fund',
          type: 'LUMPSUM',
          startDate: new Date().toISOString(),
          sipAmount: 0,
          invested: f.purchaseValue,
          currentValue: f.aum
        }));

      const res = await createManualPortfolioMutation.mutateAsync({
        assessmentId: targetAssessmentId,
        rows
      }) as unknown as { id: string };

      if (res.id) {
        const pId = res.id;
        setActivePortfolioId(pId);
        setStatusMsg('Calculating financial health scores...');
        await calculatePortfolioScore(pId);
        await fetchClientData();
      } else {
        setError('Failed to analyze certified portfolio');
      }
    } catch (err) {
      setError('Network error while submitting details.');
    } finally {
      setApiLoading(false);
    }
  };

  const handleBookMeeting = async () => {
    if (!slot1 || !slot2 || !slot3) {
      setError('Please select all 3 preferred time slots.');
      return;
    }

    const livePayment = payments.find(
      (p: any) => p.productType === 'LIVE_SESSION' && p.status === 'APPROVED'
    );

    if (!livePayment) {
      setError('No approved Live Portfolio Review Discussion payment found.');
      return;
    }

    setError(null);
    setApiLoading(true);
    setStatusMsg('Submitting your slot preferences...');

    try {
      await bookSessionMutation.mutateAsync({
        slot1,
        slot2,
        slot3,
      });
      setShowBookingSuccess(true);
      setMustSchedule(false);
    } catch (err) {
      console.error(err);
      setError('Failed to submit booking preferences.');
    } finally {
      setApiLoading(false);
    }
  };

  const handleClientBookCall = async () => {
    try {
      const res = await createLeadMutation.mutateAsync({
        name: user?.name || 'Client',
        phone: user?.phone || '0000000000',
        slot: selectedSlot ? new Date(selectedSlot).toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
      const formattedSlot = selectedSlot
        ? new Date(selectedSlot).toLocaleString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
      const newBooking = `1-on-1 Strategy Session - Confirmed for ${formattedSlot} (Free)`;
      setClientBookings(prev => [newBooking, ...prev]);
      localStorage.setItem('clientBookings', JSON.stringify([newBooking, ...clientBookings]));
      setShowBookingSuccess(true);
    } catch (err) {
      console.error(err);
      setError('Failed to book call.');
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!activeAssessmentId) {
      setError('Assessment profile missing. Please complete lifecycle details first.');
      return;
    }

    setError(null);
    setApiLoading(true);
    setStatusMsg('Uploading investment telemetry file...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('assessmentId', activeAssessmentId);

      const res = await uploadPortfolioMutation.mutateAsync({ file, assessmentId: activeAssessmentId }) as unknown as { id: string };

      if (res.id) {
        const pId = res.id;
        setActivePortfolioId(pId);
        setStatusMsg('Analyzing asset allocation and scoring...');
        await calculatePortfolioScore(pId);
        await fetchClientData();
        setUploadedFile(null);
      } else {
        setError('Failed to process Excel upload.');
      }
    } catch (err) {
      setError('Network error while uploading file.');
    } finally {
      setApiLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssessmentId) {
      setError('Assessment profile missing.');
      return;
    }

    for (let i = 0; i < manualRows.length; i++) {
      const row = manualRows[i];
      if (!row.fundName.trim()) {
        setError(`Row ${i + 1}: Fund name is required`);
        return;
      }
      if (!row.startDate) {
        setError(`Row ${i + 1}: Start date is required`);
        return;
      }
      if (new Date(row.startDate).getTime() > Date.now()) {
        setError(`Row ${i + 1}: Start date cannot be in the future`);
        return;
      }
      if (row.type === 'SIP' && row.sipAmount <= 0) {
        setError(`Row ${i + 1}: SIP amount must be greater than 0`);
        return;
      }
      if (row.invested <= 0 || row.currentValue <= 0) {
        setError(`Row ${i + 1}: Invested and Current Value must be positive numbers`);
        return;
      }
    }

    setError(null);
    setApiLoading(true);
    setStatusMsg('Saving manual investment details...');

    try {
      const formattedRows = manualRows.map(r => ({
        ...r,
        startDate: new Date(r.startDate).toISOString()
      }));

      const res = await createManualPortfolioMutation.mutateAsync({
        assessmentId: activeAssessmentId,
        rows: formattedRows
      }) as unknown as { id: string };

      if (res.id) {
        const pId = res.id;
        setActivePortfolioId(pId);
        setStatusMsg('Calculating financial health scores...');
        await calculatePortfolioScore(pId);
        await fetchClientData();
        setManualRows([{ fundName: '', type: 'SIP', startDate: '', sipAmount: 0, invested: 0, currentValue: 0 }]);
      } else {
        setError('Failed to submit manual portfolio');
      }
    } catch (err) {
      setError('Network error while submitting details.');
    } finally {
      setApiLoading(false);
    }
  };

  const handleAddManualRow = () => {
    if (manualRows.length >= 15) {
      setError('Maximum of 15 rows allowed.');
      return;
    }
    setManualRows([...manualRows, { fundName: '', type: 'SIP', startDate: '', sipAmount: 0, invested: 0, currentValue: 0 }]);
  };

  const handleRemoveManualRow = (index: number) => {
    if (manualRows.length === 1) return;
    setManualRows(manualRows.filter((_, i) => i !== index));
  };

  const handleQuizSubmit = async () => {
    if (!quizAgeRange || !quizGoal || !quizLifeStage || !quizInvestmentTenure || !quizMonthlyInvestment || !quizEmergencyFund) {
      setError('Please complete all assessment fields.');
      return;
    }

    setError(null);
    setApiLoading(true);
    setStatusMsg('Updating your lifecycle diagnostics target...');

    try {
      const res = await createAssessmentMutation.mutateAsync({
        userId: user?.id || '',
        age: quizAge,
        goal: quizGoal,
        ageRange: quizAgeRange,
        lifeStage: quizLifeStage,
        investmentTenure: quizInvestmentTenure,
        monthlyInvestment: quizMonthlyInvestment,
        emergencyFund: quizEmergencyFund,
      }) as unknown as { success: boolean; data: { assessmentId: string }; error?: string };

      if (res.success) {
        const newAssessmentId = res.data.assessmentId;
        setActiveAssessmentId(newAssessmentId);
        setShowQuiz(false);

        if (shouldAnalyzeAfterQuiz) {
          setShouldAnalyzeAfterQuiz(false);
          await handleAnalyzeCertifiedPortfolio(newAssessmentId);
        } else {
          if (activePortfolioId) {
            await calculatePortfolioScore(activePortfolioId);
          }
          await fetchClientData();
        }
      } else {
        setError(res.error || 'Failed to submit assessment target');
      }
    } catch (err) {
      setError('Could not submit assessment. Verify network connection.');
    } finally {
      setApiLoading(false);
    }
  };

  const handleSignOut = () => {
    clearAuthSessionCallback();
    logout.mutate();
    window.location.href = '/onboarding';
  };

  useEffect(() => {
    fetchClientData();
  }, [fetchClientData]);

  useEffect(() => {
    if (token) {
      fetchClientData();
    }
  }, [token]);

  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setCurrentTime(date.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isLoaded || isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-500 font-mono">Loading client workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold font-clash text-neutral-900 mb-4">Welcome Back</h1>
          <p className="text-neutral-500 mb-8">Please sign in to access your premium workspace</p>
          <div className="space-y-4 max-w-md mx-auto">
            <button
              onClick={() => window.location.href = '/onboarding'}
              className="w-full py-3 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-700 transition"
            >
              Sign In / Register
            </button>
            <button
              onClick={() => setShowPanLogin(true)}
              className="w-full py-3 border border-neutral-200 bg-white rounded-xl font-semibold text-neutral-700 hover:bg-neutral-100 transition"
            >
              PAN Login (Existing Clients)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ClientHeader user={user} onLogout={handleSignOut} />
      <main className="min-h-screen bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <PortfolioOverview
              currentVal={currentVal}
              investedVal={investedVal}
              unifiedFolios={unifiedFolios}
              scoreReport={localScoreReport}
              activePortfolioId={activePortfolioId}
              isLoading={apiLoading}
              onRefresh={fetchClientData}
              onViewFullReport={() => setViewFullReport(!viewFullReport)}
              viewFullReport={viewFullReport}
              setViewFullReport={setViewFullReport}
              onAnalyzePortfolio={handleAnalyzeCertifiedPortfolio}
            />

            <PortfolioAnalyzer
              activeAssessmentId={activeAssessmentId}
              existingClientData={existingClientData}
              activePortfolio={localActivePortfolio}
              isLoading={apiLoading}
              onAnalyze={handleAnalyzeCertifiedPortfolio}
              onUploadSubmit={handleFileUpload}
              onManualSubmit={handleManualSubmit}
              onAddManualRow={handleAddManualRow}
              onRemoveManualRow={handleRemoveManualRow}
              onDownloadTemplate={downloadCsvTemplate}
              uploadedFile={uploadedFile}
              setUploadedFile={setUploadedFile}
              manualRows={manualRows}
              setManualRows={setManualRows}
              analyzeTab={analyzeTab}
              setAnalyzeTab={setAnalyzeTab}
            />

            <AssessmentWizard
              showQuiz={showQuiz}
              setShowQuiz={setShowQuiz}
              quizStep={quizStep}
              setQuizStep={setQuizStep}
              quizAgeRange={quizAgeRange}
              setQuizAgeRange={setQuizAgeRange}
              quizAge={quizAge}
              setQuizAge={setQuizAge}
              quizLifeStage={quizLifeStage}
              setQuizLifeStage={setQuizLifeStage}
              quizGoal={quizGoal}
              setQuizGoal={setQuizGoal}
              quizInvestmentTenure={quizInvestmentTenure}
              setQuizInvestmentTenure={setQuizInvestmentTenure}
              quizIsCompletePortfolio={quizIsCompletePortfolio}
              setQuizIsCompletePortfolio={setQuizIsCompletePortfolio}
              quizInvestmentStyle={quizInvestmentStyle}
              setQuizInvestmentStyle={setQuizInvestmentStyle}
              quizExpectedReturn={quizExpectedReturn}
              setQuizExpectedReturn={setQuizExpectedReturn}
              quizRiskBehavior={quizRiskBehavior}
              setQuizRiskBehavior={setQuizRiskBehavior}
              quizMonthlyInvestment={quizMonthlyInvestment}
              setQuizMonthlyInvestment={setQuizMonthlyInvestment}
              quizEmergencyFund={quizEmergencyFund}
              setQuizEmergencyFund={setQuizEmergencyFund}
              showNotSureMessage={showNotSureMessage}
              setShowNotSureMessage={setShowNotSureMessage}
              onQuizSubmit={handleQuizSubmit}
              isLoading={apiLoading}
              activeAssessmentId={activeAssessmentId}
            />

            <BookingManager
              payments={payments}
              sessions={sessions}
              slot1={slot1}
              setSlot1={setSlot1}
              slot2={slot2}
              setSlot2={setSlot2}
              slot3={slot3}
              setSlot3={setSlot3}
              mustSchedule={mustSchedule}
              setMustSchedule={setMustSchedule}
              showBookingSuccess={showBookingSuccess}
              setShowBookingSuccess={setShowBookingSuccess}
              onBookMeeting={handleBookMeeting}
              onClientBookCall={handleClientBookCall}
              selectedSlot={selectedSlot}
              setSelectedSlot={setSelectedSlot}
              isLoading={apiLoading}
              error={error}
            />

            <SupportCenter isLoading={fetchingQueries} />

            <ExistingClientView
              existingClientData={existingClientData}
              isLoading={apiLoading}
              onRefresh={fetchClientData}
              onViewFolios={() => {}}
            />
          </div>
        </div>
      </main>
      <Footer />
      <ChatbotWidget />

      <PanLoginForm
        isOpen={showPanLogin}
        onClose={() => setShowPanLogin(false)}
        onSuccess={handlePanLogin}
      />
    </>
  );
}

function downloadCsvTemplate() {
  const csvContent = 'data:text/csv;charset=utf-8,'
    + 'Fund Name,Investment Type,Start Date,Monthly SIP Amount,Total Invested,Current Value\n'
    + 'HDFC Top 100 Fund,SIP,15/01/2022,5000,240000,295000\n'
    + 'Parag Parikh Flexi Cap Fund,SIP,10/06/2021,10000,500000,680000\n'
    + 'SBI Bluechip Fund,Lumpsum,20/03/2020,0,100000,165000\n';
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'portfolio_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}