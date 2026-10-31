'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, Layout, Loader2, LayoutDashboard } from 'lucide-react';
import { AssessmentQuiz } from './AssessmentQuiz';
import { BookingCalendar } from './BookingCalendar';
import { PortfolioAnalyzer } from './PortfolioAnalyzer';
import { ScoreReport } from './ScoreReport';
import { ClientStatus } from './ClientStatus';
import { PhoneModal } from './PhoneModal';
import SoftBoxBlurBg from '@/components/SoftBoxBlurBg';
import GradualBlur from '@/components/GradualBlur';
import ChatbotWidget from '@/components/ChatbotWidget';
import Footer from '@/components/Footer';

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
  insights: string[] | { textInsights: string[]; comparison?: any };
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

export function DashboardLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoaded, setIsLoaded] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [dashboardStage, setDashboardStage] = useState<DashboardStage>('LOADING');
  const [error, setError] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Wallet and Session booking states
  const [sessions, setSessions] = useState<any[]>([]);
  const [slot1, setSlot1] = useState('');
  const [slot2, setSlot2] = useState('');
  const [slot3, setSlot3] = useState('');

  // Phone Modal state
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [dobInput, setDobInput] = useState('');
  const [anniversaryInput, setAnniversaryInput] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Quiz State
  const [quizStep, setQuizStep] = useState(1);
  const [quizAgeRange, setQuizAgeRange] = useState<string>('25_35');
  const [quizAge, setQuizAge] = useState<number>(30);
  const [quizLifeStage, setQuizLifeStage] = useState<string>('');
  const [quizGoal, setQuizGoal] = useState<string>('');
  const [quizInvestmentTenure, setQuizInvestmentTenure] = useState<string>('');
  const [quizIsCompletePortfolio, setQuizIsCompletePortfolio] = useState<
    boolean | null
  >(true);
  const [quizInvestmentStyle, setQuizInvestmentStyle] = useState<string>('');
  const [quizExpectedReturn, setQuizExpectedReturn] = useState<string>('');
  const [quizRiskBehavior, setQuizRiskBehavior] = useState<string>('');
  const [quizMonthlyInvestment, setQuizMonthlyInvestment] = useState<string>('');
  const [quizEmergencyFund, setQuizEmergencyFund] = useState<string>('');
  const [showNotSureMessage, setShowNotSureMessage] = useState(false);

  // DB Identifiers
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(
    null,
  );
  const [activePortfolioId, setActivePortfolioId] = useState<string | null>(
    null,
  );
  const [scoreReport, setScoreReport] = useState<{
    total: number;
    goalAlignment: number;
    assetAlloc: number;
    diversification: number;
    discipline: number;
    efficiency: number;
    tag: 'ALIGNED' | 'MODERATE' | 'NEEDS_REVIEW' | 'NEEDS_STRUCTURING';
    insights: string[] | { textInsights: string[]; comparison?: any };
  } | null>(null);
  const [payments, setPayments] = useState<any[]>([]);

  // Booking & availability state variables
  const [bookings, setBookings] = useState<any[]>([]);
  const [freeSlots, setFreeSlots] = useState<string[]>([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');

  // Analyze Section State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showDateForm, setShowDateForm] = useState(false);
  const [pendingFunds, setPendingFunds] = useState<
    Array<{
      fundName: string;
      invested: number;
      currentValue: number;
      startDate: string;
      type: 'LUMPSUM' | 'SIP' | '';
      sipAmount: number;
    }>
  >([]);
  const [showGrowwGuide, setShowGrowwGuide] = useState(false);

  // Existing Client Detection
  const [isExistingClient, setIsExistingClient] = useState(false);
  const [existingClientData, setExistingClientData] = useState<any>(null);

  // Phone Modal state
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [dobInput, setDobInput] = useState('');
  const [anniversaryInput, setAnniversaryInput] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Groww Guide state
  const [showGrowwGuide, setShowGrowwGuide] = useState(false);

  // Uploaded file state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Existing Client Detection
  const [isExistingClient, setIsExistingClient] = useState(false);
  const [existingClientData, setExistingClientData] = useState<any>(null);

  // Auth Guard & Initial Fetch
  useEffect(() => {
    document.title = 'Workspace | FinAnalysis';
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!savedToken || !savedUser) {
      router.push('/onboarding');
      return;
    }

    try {
      const userObj = JSON.parse(savedUser);
      if (userObj.role === 'CLIENT') {
        router.push('/dashboard/client');
        return;
      }
      if (userObj.role === 'ADMIN') {
        router.push('/dashboard/admin');
        return;
      }

      setToken(savedToken);
      setUserData(userObj);
      if (userObj.dob) {
        const computedAge = calculateAge(userObj.dob);
        setQuizAge(computedAge);
        setQuizAgeRange(getAgeRangeFromAge(computedAge));
      }
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/onboarding');
      return;
    }

    setIsLoaded(true);
  }, []);

  // Fetch complete database state for user when token is ready
  useEffect(() => {
    if (!token) return;
    fetchDashboardState();
  }, [token]);

  const fetchDashboardState = async () => {
    try {
      setError(null);
      setDashboardStage('LOADING');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch user profile role updates with clientDate for daily reward check
      const todayISO = new Date().toLocaleDateString('en-CA');
      const meRes = await fetch(`/api/auth/me?clientDate=${todayISO}`, { headers });
      if (meRes.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/onboarding');
        return;
      }
      const meData = await meRes.json();
      if (!meRes.ok) throw new Error('Auth verify failed');

      const currentRole = meData.data?.role || 'GUEST';
      if (currentRole === 'CLIENT') {
        router.push('/dashboard/client');
        return;
      }
      if (currentRole === 'ADMIN') {
        router.push('/dashboard/admin');
        return;
      }

      const currentPhone = meData.data?.phone;

      // Update local storage user just in case role changed
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const uObj = JSON.parse(savedUser);
        uObj.role = currentRole;
        uObj.phone = currentPhone;
        uObj.walletBalance = meData.data.walletBalance;
        uObj.referralCode = meData.data.referralCode;
        uObj.dob = meData.data.dob;
        localStorage.setItem('user', JSON.stringify(uObj));
        setUserData(uObj);
      } else {
        setUserData(meData.data);
      }

      if (meData.data?.dob) {
        const computedAge = calculateAge(meData.data.dob);
        setQuizAge(computedAge);
        setQuizAgeRange(getAgeRangeFromAge(computedAge));
      }

      if (!currentPhone) {
        setShowPhoneModal(true);
      } else {
        setShowPhoneModal(false);
      }

      // 2. Fetch payments (Mocked - payment router disabled)
      const userPayments: any[] = [];
      setPayments(userPayments);

      // 3. Parallel fetch of independent data
      const [
        leadsRes,
        sessionsRes,
        assessRes,
        ecRes,
        portRes,
      ] = await Promise.all([
        fetch(`/api/leads/my-bookings`, { headers }),
        fetch(`/api/leads/my-sessions`, { headers }),
        fetch(`/api/assess`, { headers }),
        fetch(`/api/portfolio/client-data`, { headers }),
        fetch(`/api/portfolio`, { headers }),
      ]);

      const [
        leadsData,
        sessionsData,
        assessData,
        ecData,
        portData,
      ] = await Promise.all([
        leadsRes.json(),
        sessionsRes.json(),
        assessRes.json(),
        ecRes.json(),
        portRes.json(),
      ]);

      const userBookings = leadsData.success ? leadsData.data : [];
      setBookings(userBookings);

      const userSessions = sessionsData.success ? sessionsData.data : [];
      setSessions(userSessions);

      // If user has a booked session, show the status panel
      const hasSession = userSessions.length > 0;

      // 3. Fetch assessments
      const userAssessments = assessData.success ? assessData.data : [];

      if (userAssessments.length === 0) {
        setDashboardStage('QUIZ');
        return;
      }

      const latestAssessment = userAssessments[0];
      setActiveAssessmentId(latestAssessment.id);
      if (meData.data?.dob) {
        const computedAge = calculateAge(meData.data.dob);
        setQuizAge(computedAge);
        setQuizAgeRange(getAgeRangeFromAge(computedAge));
      } else {
        setQuizAge(latestAssessment.age);
        if (latestAssessment.ageRange)
          setQuizAgeRange(latestAssessment.ageRange);
      }
      setQuizGoal(latestAssessment.goal);
      if (latestAssessment.lifeStage)
        setQuizLifeStage(latestAssessment.lifeStage);
      if (latestAssessment.investmentTenure)
        setQuizInvestmentTenure(latestAssessment.investmentTenure);
      if (
        latestAssessment.isCompletePortfolio !== null &&
        latestAssessment.isCompletePortfolio !== undefined
      )
        setQuizIsCompletePortfolio(latestAssessment.isCompletePortfolio);
      if (latestAssessment.investmentStyle)
        setQuizInvestmentStyle(latestAssessment.investmentStyle);
      if (latestAssessment.expectedReturn)
        setQuizExpectedReturn(latestAssessment.expectedReturn);
      if (latestAssessment.riskBehavior)
        setQuizRiskBehavior(latestAssessment.riskBehavior);
      if (latestAssessment.monthlyInvestment)
        setQuizMonthlyInvestment(latestAssessment.monthlyInvestment);
      if (latestAssessment.emergencyFund)
        setQuizEmergencyFund(latestAssessment.emergencyFund);

      // 4. Check if user is an existing client (has matching folio records)
      try {
        if (
          ecData.success &&
          ecData.data &&
          ecData.data.folios &&
          ecData.data.folios.length > 0
        ) {
          setIsExistingClient(true);
          setExistingClientData(ecData.data);
        } else {
          setIsExistingClient(false);
          setExistingClientData(null);
        }
      } catch (ecErr) {
        console.error('Failed to check existing client status:', ecErr);
        setIsExistingClient(false);
        setExistingClientData(null);
      }

      // 5. Fetch portfolios
      const userPortfolios = portData.success ? portData.data : [];

      if (userPortfolios.length === 0) {
        setDashboardStage('ANALYZE');
        return;
      }

      const latestPortfolio = userPortfolios[0];
      setActivePortfolioId(latestPortfolio.id);

      if (latestPortfolio.score) {
        setScoreReport(latestPortfolio.score);
        if (hasSession) {
          setDashboardStage('CLIENT_STATUS');
        } else {
          setDashboardStage('REPORT');
        }
      } else {
        // Portfolio uploaded but not scored yet, score it now
        setDashboardStage('LOADING');
        setStatusMsg('Calculating portfolio scores...');
        await calculatePortfolioScore(latestPortfolio.id);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data. Please try again.');
      setDashboardStage('QUIZ');
    }
  };

  const calculateAge = (dobString: string | Date) => {
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const getAgeRangeFromAge = (age: number) => {
    if (age < 25) return 'BELOW_25';
    if (age <= 35) return '25_35';
    if (age <= 45) return '36_45';
    if (age <= 60) return '46_60';
    return 'ABOVE_60';
  };

  const fetchFreeSlots = async () => {
    try {
      setFetchingSlots(true);
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`/api/leads/availability`, { headers });
      const resData = await res.json();
      setFreeSlots(resData.data || []);
    } catch (err) {
      console.error('Error fetching free slots:', err);
    } finally {
      setFetchingSlots(false);
    }
  };

  const handleBookMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot1 || !slot2 || !slot3) {
      setError('Please select all 3 preferred time slots.');
      return;
    }

    setError(null);
    setApiLoading(true);
    setStatusMsg('Submitting your slot preferences to Arijit...');

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const res = await fetch(`/api/leads/book-session`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          slot1,
          slot2,
          slot3,
        }),
      });
      const resData = await res.json();

      if (resData.success) {
        await fetchDashboardState();
      } else {
        setError(resData.error || 'Failed to submit booking preferences.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error while submitting slots.');
    } finally {
      setApiLoading(false);
    }
  };

  const handleQuizSubmit = async (data: {
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
  }) => {
    if (
      !data.ageRange ||
      !data.goal ||
      !data.lifeStage ||
      !data.investmentTenure ||
      !data.monthlyInvestment ||
      !data.emergencyFund
    ) {
      setError('Please complete all assessment fields.');
      return;
    }

    setError(null);
    setApiLoading(true);
    setStatusMsg('Registering your financial profile...');

    try {
      const res = await fetch(`/api/assess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          age: data.age,
          goal: data.goal,
          ageRange: data.ageRange,
          lifeStage: data.lifeStage,
          investmentTenure: data.investmentTenure,
          monthlyInvestment: data.monthlyInvestment,
          emergencyFund: data.emergencyFund,
        }),
      });
      const resData = await res.json();

      if (resData.success) {
        setActiveAssessmentId(resData.data.assessmentId);
        await fetchDashboardState();
      } else {
        setError(resData.error || 'Failed to submit assessment');
      }
    } catch (err) {
      setError('Could not submit assessment. Verify network connection.');
    } finally {
      setApiLoading(false);
    }
  };

  const calculatePortfolioScore = async (portfolioId: string) => {
    try {
      const res = await fetch(`/api/score/${portfolioId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (data.success) {
        setScoreReport(data.data);
        // Refresh full dashboard state to capture payments / updated roles
        await fetchDashboardState();
      } else {
        setError(data.error || 'Failed to score portfolio.');
        setDashboardStage('ANALYZE');
      }
    } catch (err) {
      setError('Network error running score calculation.');
      setDashboardStage('ANALYZE');
    } finally {
      setApiLoading(false);
    }
  };

  const handleFolioImport = async () => {
    if (!activeAssessmentId) {
      setError('Assessment context missing. Please re-run assessment.');
      return;
    }

    setError(null);
    setApiLoading(true);
    setStatusMsg('Importing your existing fund records...');

    try {
      const res = await fetch(`/api/portfolio/from-folios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assessmentId: activeAssessmentId }),
      });
      const data = await res.json();

      if (data.success) {
        const pId = data.data.portfolioId;
        setActivePortfolioId(pId);
        setStatusMsg(
          'Running comprehensive portfolio scoring with AMFI benchmarks...',
        );
        await calculatePortfolioScore(pId);
      } else {
        setError(data.error || 'Failed to import folio records.');
      }
    } catch (err) {
      setError('Network error while importing records.');
    } finally {
      setApiLoading(false);
    }
  };

  const handleFileUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile) {
      setError('Please select a file to upload.');
      return;
    }
    if (!activeAssessmentId) {
      setError('Assessment context missing. Please re-run assessment.');
      return;
    }

    setError(null);
    setApiLoading(true);
    setStatusMsg('Uploading investment document...');

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('assessmentId', activeAssessmentId);

      const res = await fetch(`/api/portfolio/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        if (data.data.requiresDates) {
          const initialFunds = data.data.funds.map((f: any) => ({
            fundName: f.fundName,
            invested: f.invested,
            currentValue: f.currentValue,
            startDate: '',
            type: '',
            sipAmount: 0,
          }));
          setPendingFunds(initialFunds);
          setShowDateForm(true);
          setStatusMsg('');
        } else {
          const pId = data.data.portfolioId;
          setActivePortfolioId(pId);
          setStatusMsg('Analyzing asset allocation and discipline...');
          await calculatePortfolioScore(pId);
        }
      } else {
        setError(data.error || 'Failed to process Excel upload.');
      }
    } catch (err) {
      setError('Network error while uploading file.');
    } finally {
      setApiLoading(false);
    }
  };

  const handleDateFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssessmentId) {
      setError('Assessment context missing. Please re-run assessment.');
      return;
    }

    for (const f of pendingFunds) {
      if (!f.type) {
        setError(`Please choose type of investment for ${f.fundName}`);
        return;
      }
      if (!f.startDate) {
        setError(`Please enter a start date for ${f.fundName}`);
        return;
      }
      if (f.type === 'SIP' && f.sipAmount <= 0) {
        setError(`Please enter a monthly SIP amount for ${f.fundName}`);
        return;
      }
    }

    setError(null);
    setApiLoading(true);
    setStatusMsg('Analyzing asset allocation and portfolio score...');

    try {
      const res = await fetch(`/api/portfolio/manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assessmentId: activeAssessmentId,
          rows: pendingFunds.map((f) => ({
            fundName: f.fundName,
            type: f.type,
            startDate: new Date(f.startDate).toISOString(),
            sipAmount: Number(f.sipAmount),
            invested: Number(f.invested),
            currentValue: Number(f.currentValue),
          })),
        }),
      });
      const data = await res.json();

      if (data.success) {
        const pId = data.data.portfolioId;
        setActivePortfolioId(pId);
        setShowDateForm(false);
        await calculatePortfolioScore(pId);
      } else {
        setError(data.error || 'Failed to submit portfolio.');
      }
    } catch (err) {
      setError('Network error while submitting portfolio.');
    } finally {
      setApiLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/onboarding');
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneInput.trim().length < 10) {
      setModalError('Phone number must be at least 10 digits.');
      return;
    }
    if (!dobInput) {
      setModalError('Date of birth is mandatory.');
      return;
    }
    const selectedDob = new Date(dobInput);
    if (selectedDob > new Date()) {
      setModalError('Date of birth cannot be in the future.');
      return;
    }
    if (anniversaryInput) {
      const selectedAnniversary = new Date(anniversaryInput);
      if (selectedAnniversary > new Date()) {
        setModalError('Anniversary date cannot be in the future.');
        return;
      }
    }

    setModalError(null);
    setModalSubmitting(true);

    try {
      const res = await fetch(`/api/auth/phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: phoneInput.trim(),
          dob: dobInput,
          anniversary: anniversaryInput || null,
        }),
      });
      const data = await res.json();

      if (data.success) {
        // Update local user details
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const uObj = JSON.parse(savedUser);
          uObj.phone = data.data.phone;
          uObj.dob = data.data.dob;
          uObj.anniversary = data.data.anniversary;
          localStorage.setItem('user', JSON.stringify(uObj));
          setUserData(uObj);
        }
        setShowPhoneModal(false);
        // Refresh state
        await fetchDashboardState();
      } else {
        setModalError(data.error || 'Failed to update details.');
      }
    } catch (err) {
      setModalError('Network error. Please try again.');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/onboarding');
  };

  const calculateAge = (dobString: string | Date) => {
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const getAgeRangeFromAge = (age: number) => {
    if (age < 25) return 'BELOW_25';
    if (age <= 35) return '25_35';
    if (age <= 45) return '36_45';
    if (age <= 60) return '46_60';
    return 'ABOVE_60';
  };

  if (!isLoaded) {
    return (
      <main className="relative min-h-screen w-full bg-transparent text-neutral-900 flex flex-col font-clash">
        <div className="page-backdrop fixed inset-0 z-0 select-none pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        </div>
        <div className="fixed inset-0 z-10 flex flex-col justify-center items-center px-6">
          <Loader2 className="w-12 h-12 text-primary animate-spin stroke-[1.5] mb-6" />
          <h3 className="text-lg font-medium text-neutral-900">
            Loading Dashboard
          </h3>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full bg-transparent text-neutral-900 flex flex-col relative font-clash select-none overflow-x-hidden">
      <div className="page-backdrop fixed inset-0 z-0 select-none pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      </div>

      <header className="relative z-20 w-full border-b border-border bg-white/35 backdrop-blur-md px-6 py-4 flex items-center justify-between text-neutral-900">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:border-neutral-400 bg-white/40 text-neutral-600 hover:text-neutral-900 text-xs font-semibold transition duration-200 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span>Back to Home</span>
          </a>
          <div className="hidden md:flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="font-chillax font-bold tracking-wider text-sm uppercase">
              FinAnalysis Workspace
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {userData && (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/40 border border-border text-xs font-medium text-neutral-800">
                <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h10a7 7 0 00-7-7z" /></svg>
                <span>{userData.name || userData.email}</span>
              </div>
            </>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:border-red-500/30 bg-white/40 hover:bg-red-500/10 text-neutral-600 hover:text-red-600 text-xs font-semibold transition duration-200 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span>Exit</span>
          </button>
        </div>
      </header>

      <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 flex flex-col justify-center items-center relative z-10">
        {error && (
          <div className="w-full max-w-md mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl text-xs flex gap-3 items-start text-left font-sans animate-in fade-in slide-in-from-top-4">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">
                Operation failed
              </span>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-neutral-900 font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}

        {dashboardStage === 'LOADING' && (
          <div className="flex flex-col items-center justify-center p-12 text-center max-w-sm">
            <Loader2 className="w-10 h-10 text-primary animate-spin stroke-[1.5] mb-6" />
            <h3 className="text-lg font-medium text-neutral-900">
              Please Wait
            </h3>
            <p className="text-neutral-500 text-xs font-sans mt-2 leading-relaxed">
              {statusMsg ||
                'We are querying database clusters to build your investment cockpit.'}
            </p>
          </div>
        )}

        {dashboardStage === 'QUIZ' && (
          <AssessmentQuiz
            initialData={{
              ageRange: quizAgeRange,
              age: quizAge,
              lifeStage: quizLifeStage,
              goal: quizGoal,
              investmentTenure: quizInvestmentTenure,
              isCompletePortfolio: quizIsCompletePortfolio,
              investmentStyle: quizInvestmentStyle,
              expectedReturn: quizExpectedReturn,
              riskBehavior: quizRiskBehavior,
              monthlyInvestment: quizMonthlyInvestment,
              emergencyFund: quizEmergencyFund,
            }}
            onComplete={async (data) => {
              await handleQuizSubmit(data);
            }}
            onBack={() => setDashboardStage('QUIZ')}
            isLoading={apiLoading}
          />
        )}

        {dashboardStage === 'BOOKING' && (
          <BookingCalendar
            onBook={handleBookMeeting}
            isLoading={apiLoading}
            freeSlots={freeSlots}
            isFetchingSlots={fetchingSlots}
            onFetchSlots={fetchFreeSlots}
            onBack={() => setDashboardStage('ANALYZE')}
          />
        )}

        {dashboardStage === 'ANALYZE' && (
          <PortfolioAnalyzer
            onUpload={handleFileUploadSubmit}
            onSubmitDates={handleDateFormSubmit}
            onFolioImport={handleFolioImport}
            isLoading={apiLoading}
            statusMsg={statusMsg}
            error={error}
            pendingFunds={pendingFunds}
            showDateForm={showDateForm}
            showGrowwGuide={showGrowwGuide}
            uploadedFile={uploadedFile}
            isExistingClient={isExistingClient}
            existingClientData={existingClientData}
            assessmentId={activeAssessmentId}
            onBack={() => setDashboardStage('QUIZ')}
            onFileChange={setUploadedFile}
            onDateFormSubmit={handleDateFormSubmit}
            onFileUpload={handleFileUploadSubmit}
            setShowDateForm={setShowDateForm}
            setShowGrowwGuide={setShowGrowwGuide}
            setUploadedFile={setUploadedFile}
            setPendingFunds={setPendingFunds}
            onFolioImportClick={handleFolioImport}
          />
        )}

        {dashboardStage === 'REPORT' && scoreReport && (
          <ScoreReport
            scoreReport={scoreReport}
            onBookCall={() => {
              setDashboardStage('BOOKING');
              fetchFreeSlots();
            }}
            sessions={sessions}
            showBookCall={sessions.length === 0}
          />
        )}

        {dashboardStage === 'CLIENT_STATUS' && (
          <ClientStatus
            userData={userData}
            sessions={sessions}
            scoreReport={scoreReport}
            onViewReport={() => setDashboardStage('REPORT')}
            onGoToClientDashboard={() => router.push('/dashboard/client')}
          />
        )}
      </div>

      {showPhoneModal && (
        <PhoneModal
          isOpen={showPhoneModal}
          onClose={() => setShowPhoneModal(false)}
          onSubmit={handlePhoneSubmit}
          phoneInput={phoneInput}
          setPhoneInput={setPhoneInput}
          dobInput={dobInput}
          setDobInput={setDobInput}
          anniversaryInput={anniversaryInput}
          setAnniversaryInput={setAnniversaryInput}
          modalSubmitting={modalSubmitting}
          modalError={modalError}
          setModalError={setModalError}
          setModalSubmitting={setModalSubmitting}
        />
      )}

      <ChatbotWidget />
      <Footer />
    </main>
  );
}

// Helper functions (moved here for self-contained layout)
function calculateAge(dobString: string | Date) {
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

function getAgeRangeFromAge(age: number) {
  if (age < 25) return 'BELOW_25';
  if (age <= 35) return '25_35';
  if (age <= 45) return '36_45';
  if (age <= 60) return '46_60';
  return 'ABOVE_60';
}