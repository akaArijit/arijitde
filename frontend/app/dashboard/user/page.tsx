'use client';

import { useEffect, useState } from 'react';
import {
  LogOut,
  Layout,
  User,
  Users,
  Sparkles,
  TrendingUp,
  Calendar,
  Clock,
  Compass,
  ShieldAlert,
  FileSpreadsheet,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Download,
  CreditCard,
  ChevronRight,
  HelpCircle,
  ShieldCheck,
  FileText,
  Coins,
  ChevronDown,
  CalendarRange,
} from 'lucide-react';
import SoftBoxBlurBg from '@/components/SoftBoxBlurBg';
import GradualBlur from '@/components/GradualBlur';
import ChatbotWidget from '@/components/ChatbotWidget';
import Footer from '@/components/Footer';

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

// ──── Quiz Configuration ────
const GOAL_OPTIONS = [
  {
    value: 'WEALTH_CREATION',
    label: 'Wealth Creation',
    desc: 'Long-term compounding to build a substantial corpus',
    icon: Sparkles,
  },
  {
    value: 'RETIREMENT',
    label: 'Retirement Planning',
    desc: 'Securing financial independence for your post-work years',
    icon: ShieldCheck,
  },
  {
    value: 'HOUSE_PURCHASE',
    label: 'House Purchase',
    desc: 'Saving for your dream home',
    icon: TrendingUp,
  },
  {
    value: 'CHILD_EDUCATION',
    label: 'Child Education',
    desc: "Building a corpus for your children's education",
    icon: Calendar,
  },
  {
    value: 'MARRIAGE',
    label: 'Marriage',
    desc: 'Funding an upcoming marriage',
    icon: Sparkles,
  },
  {
    value: 'PASSIVE_INCOME',
    label: 'Passive Income',
    desc: 'Generate steady returns from your investments',
    icon: TrendingUp,
  },
  {
    value: 'TAX_SAVING',
    label: 'Tax Saving',
    desc: 'Optimizing investments for tax efficiency',
    icon: ShieldCheck,
  },
  {
    value: 'NOT_SURE_YET',
    label: 'Not Sure Yet',
    desc: 'Exploring and learning about investment options',
    icon: Compass,
  },
];

const AGE_RANGE_OPTIONS = [
  { value: 'BELOW_25', label: 'Below 25', numericAge: 22 },
  { value: '25_35', label: '25–35', numericAge: 30 },
  { value: '36_45', label: '36–45', numericAge: 40 },
  { value: '46_60', label: '46–60', numericAge: 53 },
  { value: 'ABOVE_60', label: 'Above 60', numericAge: 65 },
];

const LIFE_STAGE_OPTIONS = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'EARLY_CAREER', label: 'Early Career Professional' },
  { value: 'MID_CAREER', label: 'Mid-Career Professional' },
  { value: 'BUSINESS_OWNER', label: 'Business Owner' },
  {
    value: 'HIGH_LEVEL_PROFESSIONAL',
    label: 'High-Level Professional (10+ Years Experience)',
  },
  { value: 'RETIRED', label: 'Retired' },
];

const INVESTMENT_TENURE_OPTIONS = [
  { value: 'LESS_THAN_3_YEARS', label: 'Less than 3 Years' },
  { value: '3_TO_5_YEARS', label: '3–5 Years' },
  { value: '5_TO_10_YEARS', label: '5–10 Years' },
  { value: '10_TO_20_YEARS', label: '10–20 Years' },
  { value: 'MORE_THAN_20_YEARS', label: 'More than 20 Years' },
];

const MONTHLY_INVESTMENT_OPTIONS = [
  { value: 'NOT_INVESTING', label: 'Currently Not Investing' },
  { value: 'BELOW_1000', label: 'Below ₹1,000' },
  { value: '1500_2500', label: '₹1,500 – ₹2,500' },
  { value: '3000_5000', label: '₹3,000 – ₹5,000' },
  { value: '6000_10000', label: '₹6,000 – ₹10,000' },
  { value: '15000_PLUS', label: '₹15,000+' },
];

const EMERGENCY_FUND_OPTIONS = [
  {
    value: 'YES_MORE_THAN_6_MONTHS',
    label: 'Yes, more than 6 months expenses',
  },
  { value: 'YES_3_TO_6_MONTHS', label: 'Yes, 3–6 months expenses' },
  { value: 'YES_LESS_THAN_3_MONTHS', label: 'Less than 3 months expenses' },
  { value: 'NO_EMERGENCY_FUND', label: 'No emergency fund' },
];

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
  insights: string[];
}

export default function UserDashboard() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [userData, setUserData] = useState<{
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    createdAt?: string;
    referralCode?: string;
  } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Flow & State control
  const [dashboardStage, setDashboardStage] = useState<
    | 'LOADING'
    | 'QUIZ'
    | 'PAYMENT_CHOICE'
    | 'BOOKING'
    | 'ANALYZE'
    | 'REPORT'
    | 'CLIENT_STATUS'
  >('LOADING');
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
  const [quizAgeRange, setQuizAgeRange] = useState<string>('25-35');
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
  const [quizMonthlyInvestment, setQuizMonthlyInvestment] =
    useState<string>('');
  const [quizEmergencyFund, setQuizEmergencyFund] = useState<string>('');
  const [showNotSureMessage, setShowNotSureMessage] = useState(false);

  // DB Identifiers
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(
    null,
  );
  const [activePortfolioId, setActivePortfolioId] = useState<string | null>(
    null,
  );
  const [scoreReport, setScoreReport] = useState<ScoreData | null>(null);
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

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Auth Guard & Initial Fetch
  useEffect(() => {
    document.title = 'Workspace | FinAnalysis';
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!savedToken || !savedUser) {
      window.location.href = '/onboarding';
      return;
    }

    try {
      const userObj = JSON.parse(savedUser);
      if (userObj.role === 'CLIENT') {
        window.location.href = '/dashboard/client';
        return;
      }
      if (userObj.role === 'ADMIN') {
        window.location.href = '/dashboard/admin';
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
      window.location.href = '/onboarding';
      return;
    }

    setIsLoaded(true);
  }, []);

  // Auto-scroll to View Scorecard Report button when client status stage is active
  useEffect(() => {
    if (dashboardStage === 'CLIENT_STATUS') {
      const scrollTimer = setTimeout(() => {
        const btn = document.getElementById('view-scorecard-btn');
        if (btn) {
          btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 650);
      return () => clearTimeout(scrollTimer);
    }
  }, [dashboardStage]);
  const fetchFreeSlots = async () => {
    try {
      setFetchingSlots(true);
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${backendUrl}/api/leads/availability`, {
        headers,
      });
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
      const res = await fetch(`${backendUrl}/api/leads/book-session`, {
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
      const todayISO = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local timezone
      const meRes = await fetch(
        `${backendUrl}/api/auth/me?clientDate=${todayISO}`,
        { headers },
      );
      if (meRes.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/onboarding';
        return;
      }
      const meData = await meRes.json();
      if (!meRes.ok) throw new Error('Auth verify failed');

      const currentRole = meData.data?.role || 'GUEST';
      if (currentRole === 'CLIENT') {
        window.location.href = '/dashboard/client';
        return;
      }
      if (currentRole === 'ADMIN') {
        window.location.href = '/dashboard/admin';
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

      // Fetch bookings
      const leadsRes = await fetch(`${backendUrl}/api/leads/my-bookings`, {
        headers,
      });
      const leadsData = await leadsRes.json();
      const userBookings = leadsData.success ? leadsData.data : [];
      setBookings(userBookings);

      // Fetch portfolio review discussions
      const sessionsRes = await fetch(`${backendUrl}/api/leads/my-sessions`, {
        headers,
      });
      const sessionsData = await sessionsRes.json();
      const userSessions = sessionsData.success ? sessionsData.data : [];
      setSessions(userSessions);

      // If user has a booked session, show the status panel
      const hasSession = userSessions.length > 0;

      // 3. Fetch assessments
      const assessRes = await fetch(`${backendUrl}/api/assess`, { headers });
      const assessData = await assessRes.json();
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
        const ecRes = await fetch(`${backendUrl}/api/portfolio/client-data`, {
          headers,
        });
        const ecData = await ecRes.json();
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
      }

      // 5. Fetch portfolios
      const portRes = await fetch(`${backendUrl}/api/portfolio`, { headers });
      const portData = await portRes.json();
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

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/onboarding';
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
      const res = await fetch(`${backendUrl}/api/auth/phone`, {
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

  const handleInitiatePayment = async (
    productType: 'AI_ANALYSIS' | 'LIVE_SESSION',
  ) => {
    setError(null);
    setApiLoading(true);
    setStatusMsg('Initializing checkout order...');

    try {
      const res = await fetch(`${backendUrl}/api/payments/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productType }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to initialize checkout.');
        setApiLoading(false);
        return;
      }

      const checkoutData = data.data;

      if (checkoutData.zeroPayable) {
        setStatusMsg('Payment covered! Processing instant activation...');
        alert('Payment successful (covered by Wallet/Free trial)!');
        await fetchDashboardState();
        setApiLoading(false);
        return;
      }

      if (checkoutData.isMock) {
        setStatusMsg('Mock payment mode. Simulating success...');
        // Auto-confirm mock payment
        const confirmRes = await fetch(
          `${backendUrl}/api/payments/mock-confirm`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpayOrderId: checkoutData.orderId,
              razorpayPaymentId: `pay_mock_${Date.now()}`,
            }),
          },
        );
        const confirmData = await confirmRes.json();
        if (confirmData.success) {
          alert(`Mock payment successful! Paid: ₹${checkoutData.amount}`);
          await fetchDashboardState();
        } else {
          setError(confirmData.error || 'Mock payment confirmation failed.');
        }
        setApiLoading(false);
        return;
      }

      // Normal Razorpay payment
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        const options = {
          key: checkoutData.keyId,
          amount: checkoutData.amount * 100, // paise
          currency: 'INR',
          name: 'FinAnalysis',
          description:
            productType === 'AI_ANALYSIS'
              ? 'AI Portfolio Health Report'
              : 'Live Portfolio Review Discussion',
          order_id: checkoutData.orderId,
          handler: async function (response: any) {
            setStatusMsg('Verifying your payment...');
            alert('Payment successful! Processing verification...');
            await fetchDashboardState();
          },
          prefill: {
            name: userData?.name || '',
            email: userData?.email || '',
            contact: userData?.phone || '',
          },
          theme: {
            color: '#8A5CFF',
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        setError('Razorpay SDK not loaded. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error during payment initialization.');
    } finally {
      setApiLoading(false);
    }
  };

  // Submit Assessment Quiz (Stage 1)
  const handleQuizSubmit = async () => {
    if (
      !quizAgeRange ||
      !quizGoal ||
      !quizLifeStage ||
      !quizInvestmentTenure ||
      !quizMonthlyInvestment ||
      !quizEmergencyFund
    ) {
      setError('Please complete all assessment fields.');
      return;
    }

    setError(null);
    setApiLoading(true);
    setStatusMsg('Registering your financial profile...');

    try {
      const res = await fetch(`${backendUrl}/api/assess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          age: Number(quizAge),
          goal: quizGoal,
          ageRange: quizAgeRange,
          lifeStage: quizLifeStage,
          investmentTenure: quizInvestmentTenure,
          monthlyInvestment: quizMonthlyInvestment,
          emergencyFund: quizEmergencyFund,
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

  // Download CSV Template
  const downloadCsvTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'AMC,Category,Sub-category,Folio No.,Source,Units,Invested Value,Current Value,Returns,XIRR\n' +
      'Sundaram Mutual Fund,Equity,Large & MidCap,6109253583,External,493.914,36998.03,44265.21,7267.18,8.93%\n' +
      'Edelweiss Mutual Fund,Equity,Mid Cap,91017359632,External,454.598,36998.09,48889.29,11891.20,14.18%\n' +
      'Tata Mutual Fund,Equity,Small Cap,9636436,External,956.721,33998.33,36557.46,2559.13,3.59%\n' +
      'ICICI Prudential Mutual Fund,Equity,Flexi Cap,28698878,External,451.068,33998.30,43171.72,9173.41,12.25%\n' +
      'Kotak Mahindra Mutual Fund,Equity,Multi Cap,13280860,External,2317.780,37998.07,46793.66,8795.59,10.38%\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'portfolio_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit Excel File Upload
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

      const res = await fetch(`${backendUrl}/api/portfolio/upload`, {
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

  // Submit Interactive Date-Entry Form
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
      const res = await fetch(`${backendUrl}/api/portfolio/manual`, {
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

  // Existing Client: Auto-import from Folios
  const handleFolioImport = async () => {
    if (!activeAssessmentId) {
      setError('Assessment context missing. Please re-run assessment.');
      return;
    }

    setError(null);
    setApiLoading(true);
    setStatusMsg('Importing your existing fund records...');

    try {
      const res = await fetch(`${backendUrl}/api/portfolio/from-folios`, {
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

  // Run Score Engine API Call
  const calculatePortfolioScore = async (portfolioId: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/score/${portfolioId}`, {
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

  // Helper score color tagging
  const getScoreColor = (score: number) => {
    if (score >= 75)
      return 'text-emerald-600 border-emerald-500/20 bg-emerald-50';
    if (score >= 60) return 'text-amber-600 border-amber-500/20 bg-amber-50';
    return 'text-red-600 border-red-500/20 bg-red-50';
  };

  const getScoreStroke = (score: number) => {
    if (score >= 75) return '#10b981';
    if (score >= 60) return '#d97706';
    return '#ef4444';
  };

  const getTagLabel = (tag: string) => {
    switch (tag) {
      case 'ALIGNED':
        return 'Perfectly Aligned';
      case 'MODERATE':
        return 'Moderately Aligned';
      case 'NEEDS_REVIEW':
        return 'Needs Critical Review';
      case 'NEEDS_STRUCTURING':
        return 'Needs Structuring';
      default:
        return tag;
    }
  };

  const getTagDesc = (tag: string) => {
    switch (tag) {
      case 'ALIGNED':
        return 'Your investment discipline, asset diversity, and cost efficiency are in excellent shape. Keep repeating the pattern.';
      case 'MODERATE':
        return 'Your portfolio is robust, but there are opportunities to optimize tax benefits, rebalance sector ratios, or trim overlaps.';
      case 'NEEDS_REVIEW':
        return 'Critical anomalies found. Value erosion, lack of asset diversification, or goal mismatches are dragging down your compound growth.';
      case 'NEEDS_STRUCTURING':
        return 'Your portfolio lacks structural direction relative to your lifecycle targets. A custom roadmap is highly recommended.';
      default:
        return '';
    }
  };

  const isAdvisorScan = payments.some(
    (p: any) =>
      p.amount === 499 && (p.status === 'PENDING' || p.status === 'APPROVED'),
  );

  return (
    <main className="w-full min-h-screen bg-transparent text-neutral-900 flex flex-col relative font-clash select-none overflow-x-hidden">
      {/* Fixed Background container with User's Gradient Theme */}
      <div className="page-backdrop fixed inset-0 z-0 select-none pointer-events-none">
        <SoftBoxBlurBg />
      </div>

      {/* Floating header */}
      <header className="relative z-20 w-full border-b border-border bg-white/35 backdrop-blur-md px-6 py-4 flex items-center justify-between text-neutral-900">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:border-neutral-400 bg-white/40 text-neutral-600 hover:text-neutral-900 text-xs font-semibold transition duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </a>
          <div className="hidden md:flex items-center gap-2">
            <Layout className="w-5 h-5 text-primary" />
            <span className="font-chillax font-bold tracking-wider text-sm uppercase">
              FinAnalysis Workspace
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {userData && (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/40 border border-border text-xs font-medium text-neutral-800">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>{userData.name || userData.email}</span>
              </div>
            </>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:border-red-500/30 bg-white/40 hover:bg-red-500/10 text-neutral-600 hover:text-red-600 text-xs font-semibold transition duration-200 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 flex flex-col justify-center items-center relative z-10">
        {/* Global Error Banner */}
        {error && (
          <div className="w-full max-w-md mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl text-xs flex gap-3 items-start text-left font-sans animate-in fade-in slide-in-from-top-4">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
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

        {/* ----------------- STAGE 0: LOADING SCREEN ----------------- */}
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

        {/* ----------------- STAGE 1: ASSESSMENT QUIZ (5 Steps) ----------------- */}
        {dashboardStage === 'QUIZ' && (
          <div className="w-full max-w-md bg-white/30 border border-white/30 rounded-3xl p-8 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300">
            {/* Step header */}
            <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 mb-6 uppercase tracking-widest">
              <span>Stage 01: Profile Assessment</span>
              <span>Step {quizStep} of 5</span>
            </div>

            {/* Step 1: Life Stage */}
            {quizStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">
                    Which best describes your current stage?
                  </h2>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                    Context and financial capacity.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {LIFE_STAGE_OPTIONS.map((opt) => {
                    const isSelected = quizLifeStage === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setQuizLifeStage(opt.value)}
                        className={`w-full py-3.5 px-4 rounded-xl border text-xs font-medium transition duration-150 cursor-pointer text-center ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-neutral-900'
                            : 'bg-white/40 border-white/30 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    if (!quizLifeStage) {
                      setError('Please select your life stage.');
                      return;
                    }
                    setError(null);
                    setQuizStep(2);
                  }}
                  className="w-full py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer"
                >
                  Continue
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Step 2: Investment Goal */}
            {quizStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">
                    What is the primary reason you&apos;re investing?
                  </h2>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                    Goal alignment score.
                  </p>
                </div>

                <div
                  data-lenis-prevent
                  className="space-y-3 max-h-[300px] overflow-y-auto pr-1 select-none custom-scrollbar"
                >
                  {GOAL_OPTIONS.map((goal) => {
                    const IconComponent = goal.icon;
                    const isSelected = quizGoal === goal.value;
                    return (
                      <button
                        key={goal.value}
                        onClick={() => {
                          setQuizGoal(goal.value);
                          if (goal.value === 'NOT_SURE_YET') {
                            setShowNotSureMessage(true);
                          } else {
                            setShowNotSureMessage(false);
                          }
                        }}
                        className={`w-full text-left p-4 rounded-2xl border transition duration-200 flex items-start gap-4 cursor-pointer ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-neutral-900'
                            : 'bg-white/40 border-white/30 hover:border-neutral-300 text-neutral-700 hover:text-neutral-900'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-xl border mt-0.5 ${
                            isSelected
                              ? 'bg-primary/20 border-primary/40 text-primary'
                              : 'bg-white/50 border-border text-neutral-500'
                          }`}
                        >
                          <IconComponent className="w-4 h-4 stroke-[1.5]" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-semibold block">
                            {goal.label}
                          </span>
                          <span className="text-[10px] text-neutral-500 block font-sans mt-0.5 leading-relaxed">
                            {goal.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Special "Not Sure Yet" motivational message */}
                {showNotSureMessage && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-sans leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                    <span className="font-bold block mb-1">
                      💡 You&apos;re not alone!
                    </span>
                    More than 60% of investors start investing without a clearly
                    defined goal. Let&apos;s help identify one through your
                    portfolio health report.
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setQuizStep(1)}
                    className="flex-1 py-3.5 bg-white/40 border border-border hover:bg-white/60 text-neutral-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (!quizGoal) {
                        setError('Please choose an investment goal.');
                        return;
                      }
                      setError(null);
                      setQuizStep(3);
                    }}
                    className="flex-1 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer"
                  >
                    Continue
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Investment Tenure */}
            {quizStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">
                    When do you expect to use this money?
                  </h2>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                    Tenure matching.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {INVESTMENT_TENURE_OPTIONS.map((opt) => {
                    const isSelected = quizInvestmentTenure === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setQuizInvestmentTenure(opt.value)}
                        className={`w-full py-3.5 px-4 rounded-xl border text-xs font-medium transition duration-150 cursor-pointer text-center ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-neutral-900'
                            : 'bg-white/40 border-white/30 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setQuizStep(2)}
                    className="flex-1 py-3.5 bg-white/40 border border-border hover:bg-white/60 text-neutral-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (!quizInvestmentTenure) {
                        setError('Please select your investment tenure.');
                        return;
                      }
                      setError(null);
                      setQuizStep(4);
                    }}
                    className="flex-1 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer"
                  >
                    Continue
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Monthly Investment */}
            {quizStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">
                    Approximately how much are you able to invest every month?
                  </h2>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                    Investment capacity profile.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {MONTHLY_INVESTMENT_OPTIONS.map((opt) => {
                    const isSelected = quizMonthlyInvestment === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setQuizMonthlyInvestment(opt.value)}
                        className={`w-full py-3.5 px-4 rounded-xl border text-xs font-medium transition duration-150 cursor-pointer text-center ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-neutral-900'
                            : 'bg-white/40 border-white/30 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setQuizStep(3)}
                    className="flex-1 py-3.5 bg-white/40 border border-border hover:bg-white/60 text-neutral-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (!quizMonthlyInvestment) {
                        setError(
                          'Please select your monthly investment amount.',
                        );
                        return;
                      }
                      setError(null);
                      setQuizStep(5);
                    }}
                    className="flex-1 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer"
                  >
                    Continue
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Emergency Fund */}
            {quizStep === 5 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">
                    Do you have an emergency fund?
                  </h2>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                    Safety reserves check.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {EMERGENCY_FUND_OPTIONS.map((opt) => {
                    const isSelected = quizEmergencyFund === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setQuizEmergencyFund(opt.value)}
                        className={`w-full py-3.5 px-4 rounded-xl border text-xs font-medium transition duration-150 cursor-pointer text-center ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-neutral-900'
                            : 'bg-white/40 border-white/30 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setQuizStep(4)}
                    className="flex-1 py-3.5 bg-white/40 border border-border hover:bg-white/60 text-neutral-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleQuizSubmit}
                    disabled={apiLoading || !quizEmergencyFund}
                    className="flex-1 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer disabled:opacity-40"
                  >
                    {apiLoading ? 'Submitting...' : 'Finish & Score'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------- STAGE 1.7: DISTRIBUTOR BOOKING CALENDAR ----------------- */}
        {dashboardStage === 'BOOKING' && (
          <div className="w-full max-w-xl border border-primary/20 bg-[radial-gradient(circle_at_top_right,rgba(138,92,255,0.06)_0%,transparent_60%)] bg-white/30 backdrop-blur-xl rounded-3xl p-8 md:p-10 flex flex-col gap-6 shadow-2xl relative overflow-hidden animate-in fade-in duration-500 text-left">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-neutral-900 tracking-wide font-clash">
                Schedule Consultation
              </h2>
              <p className="text-neutral-600 text-xs font-sans leading-relaxed">
                You have selected the Live Portfolio Review Discussion. Please
                select your 3 distinct preferred date and time slots for Arijit
                to review and confirm one.
              </p>
            </div>

            <form onSubmit={handleBookMeeting} className="space-y-6">
              <div className="space-y-4">
                {/* Preferred Date & Time Selector 1 */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block font-mono">
                    Preferred Time Option 1 *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={slot1}
                    onChange={(e) => setSlot1(e.target.value)}
                    min={new Date(Date.now() + 3600000)
                      .toISOString()
                      .slice(0, 16)}
                    className="w-full bg-white/50 border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary text-neutral-950 font-mono"
                  />
                </div>

                {/* Preferred Date & Time Selector 2 */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block font-mono">
                    Preferred Time Option 2 *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={slot2}
                    onChange={(e) => setSlot2(e.target.value)}
                    min={new Date(Date.now() + 3600000)
                      .toISOString()
                      .slice(0, 16)}
                    className="w-full bg-white/50 border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary text-neutral-950 font-mono"
                  />
                </div>

                {/* Preferred Date & Time Selector 3 */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block font-mono">
                    Preferred Time Option 3 *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={slot3}
                    onChange={(e) => setSlot3(e.target.value)}
                    min={new Date(Date.now() + 3600000)
                      .toISOString()
                      .slice(0, 16)}
                    className="w-full bg-white/50 border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary text-neutral-950 font-mono"
                  />
                </div>
              </div>

              {/* Prominent Trust Refund Policy Banner */}
              <div className="w-full p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-[11px] text-blue-700 font-sans leading-relaxed flex gap-2.5">
                <span className="text-base">🛡️</span>
                <span>
                  <strong>We value your trust.</strong> If your scheduled
                  session does not happen for any reason, you will receive a
                  full refund within 24 hours. No questions asked.
                </span>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={apiLoading || !slot1 || !slot2 || !slot3}
                  className="w-full py-3.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer shadow-lg disabled:opacity-40"
                >
                  {apiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Slots...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Booking Slots</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ----------------- STAGE 2: ANALYZE PORTFOLIO ----------------- */}
        {dashboardStage === 'ANALYZE' && (
          <div className="w-full max-w-3xl flex flex-col gap-8 animate-in fade-in duration-400">
            {/* Distributor Booking Confirmation Alert */}
            {bookings.some((b: any) => b.slot !== null) && (
              <div className="w-full border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl rounded-3xl p-6 flex items-start gap-4 text-left animate-in fade-in duration-300">
                <span className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </span>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-neutral-900">
                    Distributor Consultation Booked!
                  </h4>
                  <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                    Your 1-on-1 strategy call with distributor Arijit De is
                    scheduled for{' '}
                    <strong className="text-neutral-900 font-semibold font-mono">
                      {new Date(
                        bookings.find((b: any) => b.slot !== null).slot,
                      ).toLocaleString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </strong>
                    . We will reach out to you at{' '}
                    <span className="font-semibold font-mono">
                      {bookings.find((b: any) => b.slot !== null).phone}
                    </span>
                    .
                  </p>
                </div>
              </div>
            )}
            {/* Context Profile Header */}
            <div className="w-full p-6 bg-white/30 border border-white/30 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 backdrop-blur-xl">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                  Active Financial Profile
                </span>
                <div className="flex flex-wrap gap-2 items-center text-xs">
                  <span className="text-neutral-900 font-medium">
                    Age:{' '}
                    {AGE_RANGE_OPTIONS.find((o) => o.value === quizAgeRange)
                      ?.label || quizAge}
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="text-neutral-900 font-medium">
                    Goal:{' '}
                    {GOAL_OPTIONS.find((o) => o.value === quizGoal)?.label ||
                      quizGoal}
                  </span>
                  {quizLifeStage && (
                    <>
                      <span className="text-neutral-300">•</span>
                      <span className="text-neutral-900 font-medium">
                        Stage:{' '}
                        {LIFE_STAGE_OPTIONS.find(
                          (o) => o.value === quizLifeStage,
                        )?.label || quizLifeStage}
                      </span>
                    </>
                  )}
                  {quizInvestmentTenure && (
                    <>
                      <span className="text-neutral-300">•</span>
                      <span className="text-neutral-900 font-medium">
                        Horizon:{' '}
                        {INVESTMENT_TENURE_OPTIONS.find(
                          (o) => o.value === quizInvestmentTenure,
                        )?.label || quizInvestmentTenure}
                      </span>
                    </>
                  )}
                  {quizMonthlyInvestment && (
                    <>
                      <span className="text-neutral-300">•</span>
                      <span className="text-neutral-900 font-medium">
                        Monthly:{' '}
                        {MONTHLY_INVESTMENT_OPTIONS.find(
                          (o) => o.value === quizMonthlyInvestment,
                        )?.label || quizMonthlyInvestment}
                      </span>
                    </>
                  )}
                  {quizEmergencyFund && (
                    <>
                      <span className="text-neutral-300">•</span>
                      <span className="text-neutral-900 font-medium">
                        Emergency Fund:{' '}
                        {EMERGENCY_FUND_OPTIONS.find(
                          (o) => o.value === quizEmergencyFund,
                        )?.label || quizEmergencyFund}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setError(null);
                  setQuizStep(1);
                  setDashboardStage('QUIZ');
                }}
                className="text-[10px] font-mono text-primary hover:underline cursor-pointer border border-primary/20 bg-primary/5 px-3 py-1 rounded-lg hover:bg-primary/10 transition"
              >
                Re-assess profile
              </button>
            </div>

            {isAdvisorScan ? (
              /* Premium glassmorphic Consultation Cockpit */
              <div className="w-full border border-primary/20 bg-[radial-gradient(circle_at_top_right,rgba(138,92,255,0.06)_0%,transparent_60%)] bg-white/35 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl flex flex-col gap-8 text-left animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-200/50 pb-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-primary uppercase tracking-widest font-semibold bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                      Exclusive Client Portal
                    </span>
                    <h2 className="text-3xl font-bold font-clash text-neutral-900 mt-3">
                      Your Roadmap is Being Prepared
                    </h2>
                    <p className="text-neutral-600 text-xs font-sans leading-relaxed max-w-lg">
                      You are in safe hands. Sebi-registered distributor Arijit
                      De is currently analyzing your active financial profile
                      parameters to prepare a tailormade strategy.
                    </p>
                  </div>
                  <div className="bg-white/60 border border-neutral-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm shrink-0 min-w-[160px]">
                    <Clock className="w-6 h-6 text-primary mb-2 stroke-[1.5]" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                      Session Type
                    </span>
                    <span className="text-xs font-semibold text-neutral-800 mt-0.5">
                      1-on-1 Video Call
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-neutral-900 tracking-wider uppercase font-mono">
                    Next Steps Checklist
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Step 1 */}
                    <div className="border border-neutral-200/40 bg-white/20 rounded-2xl p-5 flex items-start gap-4">
                      <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-neutral-800">
                          1. Synchronize Assessment
                        </h4>
                        <p className="text-[11px] text-neutral-600 font-sans leading-normal">
                          Your risk preference and investment goals were
                          captured and stored securely in the database.
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="border border-neutral-200/40 bg-white/20 rounded-2xl p-5 flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-neutral-800">
                          2. Distributor Telemetry Audit
                        </h4>
                        <p className="text-[11px] text-neutral-600 font-sans leading-normal">
                          Arijit De will audit your selected age limits,
                          expectations, and risk thresholds prior to the
                          consultation call.
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="border border-neutral-200/40 bg-white/20 rounded-2xl p-5 flex items-start gap-4">
                      <div className="p-2 bg-neutral-100 rounded-xl text-neutral-500 shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-neutral-800">
                          3. Live 1-on-1 Consultation
                        </h4>
                        <p className="text-[11px] text-neutral-600 font-sans leading-normal">
                          Join the strategy review call at your scheduled time
                          to design a custom asset allocation and select
                          top-performing funds.
                        </p>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="border border-neutral-200/40 bg-white/20 rounded-2xl p-5 flex items-start gap-4">
                      <div className="p-2 bg-neutral-100 rounded-xl text-neutral-500 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-neutral-800">
                          4. Tailored Action Roadmap
                        </h4>
                        <p className="text-[11px] text-neutral-600 font-sans leading-normal">
                          Receive your personalized action PDF detailing
                          restructuring directions, tax optimizations, and
                          rebalancing guidelines.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-neutral-200/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[11px] font-sans font-medium text-neutral-600">
                      Distributor Review status:{' '}
                      <strong className="text-emerald-700 font-semibold font-mono">
                        Assigned & Preparing
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            ) : isExistingClient && existingClientData ? (
              /* ── Existing Client: Auto-Import from Folios ── */
              <>
                {/* Analysis Header */}
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-wide text-neutral-900">
                    Portfolio Analysis
                  </h1>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                    We found your existing investment records. Start the
                    analysis to get your comprehensive portfolio health score.
                  </p>
                </div>

                {/* Existing Client Card */}
                <div className="w-full border border-emerald-500/20 bg-white/30 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
                  {/* Client Match Confirmation */}
                  <div className="flex items-start gap-4 p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl">
                    <span className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600 shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-neutral-900">
                        Existing Client Identified
                      </h4>
                      <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                        Your records match with client{' '}
                        <strong className="text-neutral-900">
                          {existingClientData.name || 'N/A'}
                        </strong>
                        . We have{' '}
                        <strong className="text-emerald-700 font-mono">
                          {existingClientData.folios?.length || 0}
                        </strong>{' '}
                        folio record(s) on file.
                      </p>
                    </div>
                  </div>

                  {/* Fund Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/50 border border-neutral-200/40 rounded-2xl p-4 text-center">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
                        Funds
                      </span>
                      <span className="text-2xl font-bold text-neutral-900 font-clash">
                        {(() => {
                          const schemes = new Set(
                            (existingClientData.folios || [])
                              .map((f: any) => f.schemeName)
                              .filter(Boolean),
                          );
                          return schemes.size;
                        })()}
                      </span>
                    </div>
                    <div className="bg-white/50 border border-neutral-200/40 rounded-2xl p-4 text-center">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
                        Folios
                      </span>
                      <span className="text-2xl font-bold text-neutral-900 font-clash">
                        {existingClientData.folios?.length || 0}
                      </span>
                    </div>
                    <div className="bg-white/50 border border-neutral-200/40 rounded-2xl p-4 text-center">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
                        AUM
                      </span>
                      <span className="text-lg font-bold text-neutral-900 font-clash">
                        ₹
                        {(() => {
                          const total = (
                            existingClientData.folios || []
                          ).reduce(
                            (sum: number, f: any) => sum + (f.aum || 0),
                            0,
                          );
                          if (total > 0) return (total / 100000).toFixed(1);
                          const clientAum =
                            existingClientData.aum ||
                            existingClientData.currentValue ||
                            0;
                          return (clientAum / 100000).toFixed(1);
                        })()}
                        L
                      </span>
                    </div>
                    <div className="bg-white/50 border border-neutral-200/40 rounded-2xl p-4 text-center">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
                        Invested
                      </span>
                      <span className="text-lg font-bold text-neutral-900 font-clash">
                        ₹
                        {(() => {
                          const total = (
                            existingClientData.folios || []
                          ).reduce(
                            (sum: number, f: any) =>
                              sum + (f.purchaseValue || 0),
                            0,
                          );
                          if (total > 0) return (total / 100000).toFixed(1);
                          const clientPurchase =
                            existingClientData.purchaseValue || 0;
                          return (clientPurchase / 100000).toFixed(1);
                        })()}
                        L
                      </span>
                    </div>
                  </div>

                  {/* Start Analysis Button */}
                  <button
                    onClick={handleFolioImport}
                    disabled={apiLoading}
                    className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer disabled:opacity-40"
                  >
                    {apiLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{statusMsg || 'Importing and scoring...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Start Portfolio Analysis</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : showDateForm ? (
              /* ── New Client: Date entry form for statement holdings ── */
              <>
                <div className="text-center max-w-xl mx-auto space-y-2 animate-in fade-in duration-300">
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-wide text-neutral-900 font-clash">
                    Enter Purchase Dates
                  </h1>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                    We found {pendingFunds.length} investments in your Groww
                    statement. Please enter their approximate starting dates to
                    compute XIRR and score your portfolio.
                  </p>
                </div>

                <div className="w-full border border-white/30 bg-white/30 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6 animate-in fade-in duration-300">
                  {/* Header */}
                  <div className="flex justify-between items-center border-b border-border/20 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl text-primary">
                        <CalendarRange className="w-5 h-5 stroke-[1.5]" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm font-bold text-neutral-900">
                          Portfolio Start Dates
                        </h3>
                        <p className="text-[10px] text-neutral-500 font-sans">
                          Required to compute performance benchmarks
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDateForm(false)}
                      className="text-[10px] font-mono text-neutral-500 hover:text-neutral-800 border border-neutral-300 bg-white/40 px-2.5 py-1 rounded-lg hover:bg-white/60 transition cursor-pointer"
                    >
                      Back to Upload
                    </button>
                  </div>

                  <form onSubmit={handleDateFormSubmit} className="space-y-6">
                    <div className="space-y-4 pr-1">
                      {pendingFunds.map((fund, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-white/40 border border-border/20 rounded-2xl space-y-3 text-left"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span
                              className="text-xs font-semibold text-neutral-900 block truncate max-w-[200px] md:max-w-md"
                              title={fund.fundName}
                            >
                              {fund.fundName}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-neutral-500 shrink-0">
                              Value: ₹
                              {fund.currentValue.toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Start Date */}
                            <div className="space-y-1">
                              <label className="block text-[9px] font-mono uppercase tracking-wider text-neutral-500">
                                Purchase / Start Date
                              </label>
                              <input
                                type="date"
                                required
                                value={fund.startDate}
                                onChange={(e) => {
                                  const updated = [...pendingFunds];
                                  updated[idx].startDate = e.target.value;
                                  setPendingFunds(updated);
                                }}
                                className="w-full bg-white/50 border border-border/30 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-primary"
                              />
                            </div>

                            {/* Investment Type */}
                            <div className="space-y-1">
                              <label className="block text-[9px] font-mono uppercase tracking-wider text-neutral-500">
                                Investment Type
                              </label>
                              <select
                                required
                                value={fund.type}
                                onChange={(e) => {
                                  const updated = [...pendingFunds];
                                  updated[idx].type = e.target.value as
                                    'LUMPSUM' | 'SIP' | '';
                                  if (
                                    e.target.value === 'LUMPSUM' ||
                                    e.target.value === ''
                                  ) {
                                    updated[idx].sipAmount = 0;
                                  }
                                  setPendingFunds(updated);
                                }}
                                className="w-full bg-white/50 border border-border/30 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary"
                              >
                                <option value="">
                                  Choose type of investment
                                </option>
                                <option value="LUMPSUM">Lumpsum</option>
                                <option value="SIP">Systematic SIP</option>
                              </select>
                            </div>

                            {/* Monthly SIP Amount */}
                            <div className="space-y-1">
                              <label className="block text-[9px] font-mono uppercase tracking-wider text-neutral-500">
                                Monthly SIP Amount (₹)
                              </label>
                              <input
                                type="number"
                                required={fund.type === 'SIP'}
                                disabled={fund.type === 'LUMPSUM'}
                                value={fund.sipAmount || ''}
                                placeholder={
                                  fund.type === 'LUMPSUM' ? '0' : 'Enter amount'
                                }
                                onChange={(e) => {
                                  const updated = [...pendingFunds];
                                  updated[idx].sipAmount = Number(
                                    e.target.value,
                                  );
                                  setPendingFunds(updated);
                                }}
                                className="w-full bg-white/50 border border-border/30 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-primary disabled:opacity-40"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={apiLoading}
                      className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer disabled:opacity-40"
                    >
                      {apiLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{statusMsg || 'Scoring Portfolio...'}</span>
                        </>
                      ) : (
                        <>
                          <span>Score & Analyze Portfolio</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* ── New Client: CSV Upload Only ── */
              <>
                {/* Analysis Header */}
                <div className="text-center max-w-xl mx-auto space-y-2 animate-in fade-in duration-300">
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-wide text-neutral-900 font-clash">
                    Analyze Investments
                  </h1>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                    Upload your portfolio statement. We'll run them through our
                    scoring algorithm with live AMFI benchmark comparison.
                  </p>
                </div>

                {/* Form Section */}
                <div className="w-full border border-white/30 bg-white/30 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col animate-in fade-in duration-300">
                  {/* Groww Statement Guide Accordion */}
                  <div className="mb-6 border border-amber-500/25 bg-amber-500/5 rounded-2xl overflow-hidden transition-all duration-300">
                    <button
                      type="button"
                      onClick={() => setShowGrowwGuide(!showGrowwGuide)}
                      className="w-full px-5 py-4 flex justify-between items-center text-left hover:bg-amber-500/10 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="text-xs font-bold text-neutral-900">
                          How to get your Portfolio Statement from any ivestment
                          app? For example Groww
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-neutral-500 transition-transform duration-300 ${showGrowwGuide ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {showGrowwGuide && (
                      <div className="px-5 pb-5 pt-1 text-[11px] text-neutral-700 space-y-2 border-t border-amber-500/10 font-sans leading-relaxed text-left">
                        <ol className="list-decimal list-inside space-y-2 pl-1">
                          <li>
                            Open the{' '}
                            <strong className="text-neutral-900">
                              Groww app
                            </strong>{' '}
                            on your mobile device (or log in on their web
                            portal).
                          </li>
                          <li>
                            Go to the{' '}
                            <strong className="text-neutral-900">
                              Mutual Funds
                            </strong>{' '}
                            tab at the bottom and click on your{' '}
                            <strong className="text-neutral-900">
                              Dashboard
                            </strong>
                            .
                          </li>
                          <li>
                            Tap your{' '}
                            <strong className="text-neutral-900">
                              Profile Icon
                            </strong>{' '}
                            in the top right corner.
                          </li>
                          <li>
                            Select{' '}
                            <strong className="text-neutral-900">
                              Reports
                            </strong>{' '}
                            or{' '}
                            <strong className="text-neutral-900">
                              Reports & Statements
                            </strong>
                            .
                          </li>
                          <li>
                            Choose{' '}
                            <strong className="text-neutral-900">
                              Mutual Fund Holdings
                            </strong>
                            .
                          </li>
                          <li>
                            Select{' '}
                            <strong className="text-neutral-900">
                              Excel (.xlsx)
                            </strong>{' '}
                            as the format and click{' '}
                            <strong className="text-neutral-900">
                              Download / Email Report
                            </strong>
                            .
                          </li>
                          <li>
                            Upload that exact downloaded sheet below to run your
                            scoring analysis.
                          </li>
                        </ol>
                      </div>
                    )}
                  </div>

                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                      <FileSpreadsheet className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-bold text-neutral-900">
                        Upload Portfolio File
                      </h3>
                      <p className="text-[10px] text-neutral-500 font-sans">
                        Upload your Groww holding statement spreadsheet
                      </p>
                    </div>
                  </div>

                  {/* File Uploader */}
                  <form onSubmit={handleFileUploadSubmit} className="space-y-6">
                    <div className="space-y-3 text-left">
                      <div className="flex justify-between items-end">
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                          Portfolio Data File
                        </label>
                      </div>

                      {/* Drag & Drop uploader area */}
                      <div
                        className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition duration-200 bg-white/20 ${
                          uploadedFile
                            ? 'border-primary bg-primary/[0.01]'
                            : 'border-border hover:border-neutral-300'
                        }`}
                      >
                        <input
                          type="file"
                          accept=".xlsx,.csv"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setUploadedFile(file);
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div
                          className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 transition ${
                            uploadedFile
                              ? 'bg-primary/10 border-primary/20 text-primary'
                              : 'bg-white/40 border border-border text-neutral-500'
                          }`}
                        >
                          {uploadedFile ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <FileSpreadsheet className="w-5 h-5 stroke-[1.5]" />
                          )}
                        </div>

                        {uploadedFile ? (
                          <div className="space-y-1">
                            <span className="text-xs font-semibold text-neutral-900 block">
                              {uploadedFile.name}
                            </span>
                            <span className="text-[10px] text-neutral-500 font-mono block">
                              {(uploadedFile.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="text-xs font-semibold text-neutral-700 block">
                              Click or Drag Excel/CSV file to upload
                            </span>
                            <span className="text-[10px] text-neutral-500 block leading-relaxed font-sans mt-1">
                              Supported: Groww Holdings Statement Excel (.xlsx)
                              or Standard Template (.csv)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={apiLoading || !uploadedFile}
                      className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer disabled:opacity-40"
                    >
                      {apiLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{statusMsg || 'Processing file...'}</span>
                        </>
                      ) : (
                        <>
                          <span>Analyze Uploaded Portfolio</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        )}

        {/* ----------------- STAGE 3: SCORE REPORT & CTA ----------------- */}
        {dashboardStage === 'REPORT' && scoreReport && (
          <div className="w-full max-w-4xl space-y-10 animate-in fade-in duration-500 select-text">
            {/* Top Score Title */}
            <div className="text-center max-w-lg mx-auto space-y-2">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-wide text-neutral-900">
                Your Evaluation Scorecard
              </h1>
              <p className="text-neutral-500 text-xs font-sans">
                Below is the core assessment breakdown computed from your
                portfolio's raw telemetry.
              </p>
            </div>

            {/* Score Summary Grid (Main radial gauge + badge callout) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
              {/* Left Column: Overall Gauge */}
              <div className="md:col-span-5 border border-white/30 bg-white/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden backdrop-blur-xl">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-6">
                  COMPREHENSIVE RATING
                </span>

                {/* SVG Circular Ring */}
                <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="68"
                      stroke="rgba(0,0,0,0.05)"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="68"
                      stroke={getScoreStroke(scoreReport.total)}
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={427}
                      strokeDashoffset={427 - (427 * scoreReport.total) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-neutral-900">
                    <span className="text-5xl font-semibold font-chillax leading-none">
                      {scoreReport.total}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mt-1">
                      / 100
                    </span>
                  </div>
                </div>

                <div
                  className={`px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider ${getScoreColor(scoreReport.total)}`}
                >
                  {getTagLabel(scoreReport.tag)}
                </div>
              </div>

              {/* Right Column: Breakdown & Description */}
              <div className="md:col-span-7 border border-white/30 bg-white/30 rounded-3xl p-8 flex flex-col justify-between shadow-2xl backdrop-blur-xl">
                <div className="space-y-4">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                    METRIC TELEMETRY BREAKDOWN
                  </span>
                  <h3 className="text-xl font-semibold text-neutral-900 tracking-wide">
                    {getTagLabel(scoreReport.tag)}
                  </h3>
                  <p className="text-neutral-600 text-xs font-sans leading-relaxed">
                    {getTagDesc(scoreReport.tag)}
                  </p>
                </div>

                {/* Horizontal Progress Bars */}
                <div className="space-y-4.5 mt-8 md:mt-0">
                  {/* Goal Alignment */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-medium font-sans">
                      <span className="text-neutral-500">Goal Alignment</span>
                      <span className="text-neutral-800 font-mono">
                        {scoreReport.goalAlignment} / 20
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                        style={{
                          width: `${(scoreReport.goalAlignment / 20) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Asset Allocation */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-medium font-sans">
                      <span className="text-neutral-500">Asset Allocation</span>
                      <span className="text-neutral-800 font-mono">
                        {scoreReport.assetAlloc} / 20
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#8a5cff] rounded-full transition-all duration-1000"
                        style={{
                          width: `${(scoreReport.assetAlloc / 20) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Diversification */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-medium font-sans">
                      <span className="text-neutral-500">Diversification</span>
                      <span className="text-neutral-800 font-mono">
                        {scoreReport.diversification} / 20
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full transition-all duration-1000"
                        style={{
                          width: `${(scoreReport.diversification / 20) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Discipline */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-medium font-sans">
                      <span className="text-neutral-500">SIP Discipline</span>
                      <span className="text-neutral-800 font-mono">
                        {scoreReport.discipline} / 20
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                        style={{
                          width: `${(scoreReport.discipline / 20) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Efficiency */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-medium font-sans">
                      <span className="text-neutral-500">
                        Efficiency Matrix
                      </span>
                      <span className="text-neutral-800 font-mono">
                        {scoreReport.efficiency} / 20
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-pink-500 rounded-full transition-all duration-1000"
                        style={{
                          width: `${(scoreReport.efficiency / 20) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights Section */}
            <div className="w-full border border-white/30 bg-white/30 backdrop-blur-xl rounded-3xl p-8 space-y-6 shadow-2xl">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                AI Generated Anomaly Insights
              </span>

              {(() => {
                const insightsList = Array.isArray(scoreReport.insights)
                  ? scoreReport.insights
                  : (scoreReport.insights as any)?.textInsights || [];
                if (insightsList.length === 0)
                  return (
                    <p className="text-neutral-500 text-xs font-mono py-4">
                      No AI generated insights available.
                    </p>
                  );
                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {insightsList.map((insight: string, idx: number) => (
                      <div
                        key={idx}
                        className="p-5 bg-white/40 border border-white/30 rounded-2xl flex items-start gap-4"
                      >
                        <div className="w-6 h-6 rounded-lg border border-border bg-white/60 flex items-center justify-center text-xs font-mono text-neutral-500 mt-0.5 shrink-0">
                          0{idx + 1}
                        </div>
                        <p className="text-neutral-800 text-xs leading-relaxed font-sans text-left">
                          {insight}
                        </p>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* CTA Box: Book Call */}
            {sessions.length === 0 && (
              <div className="w-full border border-primary/20 bg-[radial-gradient(circle_at_top_right,rgba(138,92,255,0.06)_0%,transparent_60%)] bg-white/30 backdrop-blur-xl rounded-3xl p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-2xl relative overflow-hidden">
                <div className="space-y-4 max-w-xl text-left">
                  <span className="text-[10px] font-mono text-primary border border-primary/30 bg-primary/5 px-3 py-1 rounded-full uppercase tracking-wider">
                    Free Distributor Consulting
                  </span>
                  <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900 tracking-wide">
                    Detailed Distribution Optimization Session
                  </h2>
                  <p className="text-neutral-600 text-xs font-sans leading-relaxed">
                    Book your 1-on-1 strategy call with our distributor Arijit
                    De for free! Get a comprehensive optimization roadmap,
                    personalized tax restructuring report, and active
                    rebalancing insights based on your score.
                  </p>
                  <div className="flex gap-6 items-center text-neutral-500 text-xs font-sans pt-1">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>SEBI MFD Compliant</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-primary" />
                      <span>Includes Detailed PDF</span>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto shrink-0 flex flex-col items-center justify-center p-6 bg-white/40 border border-white/30 rounded-2xl md:min-w-[240px] text-center font-sans">
                  <div className="text-4xl font-semibold font-chillax text-neutral-900 mt-1">
                    FREE
                  </div>
                  <button
                    onClick={() => {
                      setDashboardStage('BOOKING');
                      fetchFreeSlots();
                    }}
                    className="w-full mt-6 py-3.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer shadow-lg"
                  >
                    <span>Book Consultation</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------- STAGE 4: CLIENT STATUS SCREEN ----------------- */}
        {dashboardStage === 'CLIENT_STATUS' && (
          <div className="w-full max-w-xl bg-white/30 border border-white/30 rounded-3xl p-8 md:p-10 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300 backdrop-blur-xl">
            {/* Determine Status */}
            {userData?.role === 'CLIENT' ? (
              // Case A: Approved PREMIUM Client
              <>
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-500/20 flex items-center justify-center text-emerald-600 mx-auto mb-2">
                  <ShieldCheck className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">
                    Workspace Activated
                  </h2>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                    Welcome to the Premium Client Portal! Your 1-on-1 portfolio
                    review discussion booking has been verified.
                  </p>
                </div>

                {sessions.length > 0 ? (
                  <div className="p-5 bg-white/40 border border-white/30 rounded-2xl text-left space-y-3 font-sans text-xs">
                    <h3 className="font-semibold text-neutral-800 text-sm border-b border-neutral-100 pb-2 flex items-center justify-between">
                      <span>Live Consult Booking</span>
                      <span
                        className={`px-2 py-0.5 rounded text-white font-mono text-[9px] font-bold ${
                          sessions[0].status === 'CONFIRMED'
                            ? 'bg-emerald-600 animate-pulse'
                            : sessions[0].status === 'COMPLETED'
                              ? 'bg-blue-600'
                              : sessions[0].status === 'REFUNDED'
                                ? 'bg-red-600'
                                : 'bg-amber-600'
                        }`}
                      >
                        {sessions[0].status}
                      </span>
                    </h3>

                    {sessions[0].status === 'CONFIRMED' &&
                    sessions[0].confirmedSlot ? (
                      <div className="space-y-3">
                        <div className="flex flex-col gap-1 text-emerald-800 font-semibold bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                          <span className="text-[10px] font-mono text-emerald-600 uppercase tracking-wider">
                            Confirmed Time:
                          </span>
                          <span className="text-xs font-mono">
                            {new Date(sessions[0].confirmedSlot).toLocaleString(
                              'en-IN',
                              { timeZone: 'Asia/Kolkata' },
                            )}
                          </span>
                        </div>
                        {sessions[0].googleMeetLink && (
                          <a
                            href={sessions[0].googleMeetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-center font-bold rounded-xl transition duration-200 shadow-md"
                          >
                            📹 Join Google Meet Session
                          </a>
                        )}
                      </div>
                    ) : sessions[0].status === 'REFUNDED' ? (
                      <div className="text-red-700 bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl text-xs leading-relaxed">
                        <strong>Session Cancelled & Refunded:</strong> A full
                        refund has been initiated to your payment source.
                      </div>
                    ) : (
                      <div className="space-y-2 text-neutral-600">
                        <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block">
                          Submitted Slots:
                        </span>
                        <ul className="space-y-1 font-mono text-[10px] pl-4 list-decimal text-neutral-700">
                          <li>
                            {new Date(sessions[0].preferredSlot1).getTime() > 0
                              ? new Date(
                                  sessions[0].preferredSlot1,
                                ).toLocaleString()
                              : 'Not scheduled'}
                          </li>
                          <li>
                            {new Date(sessions[0].preferredSlot2).getTime() > 0
                              ? new Date(
                                  sessions[0].preferredSlot2,
                                ).toLocaleString()
                              : 'Not scheduled'}
                          </li>
                          <li>
                            {new Date(sessions[0].preferredSlot3).getTime() > 0
                              ? new Date(
                                  sessions[0].preferredSlot3,
                                ).toLocaleString()
                              : 'Not scheduled'}
                          </li>
                        </ul>
                        <p className="text-[10px] text-neutral-400 leading-normal mt-2 border-t border-neutral-100 pt-2 italic">
                          Arijit will confirm one slot and attach the Google
                          Meet link. You will receive an email confirmation.
                        </p>
                      </div>
                    )}

                    {sessions[0].notes && (
                      <div className="border-t border-neutral-100 pt-2 space-y-1.5">
                        <span className="text-neutral-500 font-mono uppercase tracking-wider text-[10px] block">
                          Arijit's Pre-Session Notes:
                        </span>
                        <div
                          data-lenis-prevent
                          className="bg-neutral-50 border border-neutral-100 p-2.5 rounded-xl font-sans text-xs text-neutral-700 leading-relaxed max-h-[120px] overflow-y-auto italic"
                        >
                          {sessions[0].notes}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-white/40 border border-white/30 rounded-2xl text-left space-y-3 font-sans text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-500 font-mono uppercase tracking-wider text-[10px]">
                        Client Level:
                      </span>
                      <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-mono text-[9px] font-bold">
                        PREMIUM Tier
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-neutral-500 font-mono uppercase tracking-wider text-[10px]">
                        Next Steps:
                      </span>
                      <span className="text-neutral-800 font-medium text-right max-w-[200px]">
                        Our distribution desk is preparing your PDF rebalancing
                        plan.
                      </span>
                    </div>
                  </div>
                )}

                {/* Prominent Trust Refund Policy Banner */}
                <div className="w-full p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-[10px] text-blue-700 font-sans leading-relaxed text-left flex gap-2">
                  <span className="text-sm">🛡️</span>
                  <span>
                    <strong>Trust Policy:</strong> If your scheduled session
                    does not happen for any reason, you will receive a full
                    refund within 24 hours. No questions asked.
                  </span>
                </div>

                <button
                  onClick={() => (window.location.href = '/dashboard/client')}
                  className="w-full py-3.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <span>Enter Client Dashboard</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {scoreReport && (
                  <button
                    id="view-scorecard-btn"
                    onClick={() => setDashboardStage('REPORT')}
                    className="w-full py-3.5 bg-white/40 border border-border hover:bg-white/60 text-neutral-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    View Scorecard Report
                  </button>
                )}
              </>
            ) : (
              // Case B: Payment Pending Verification
              <>
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-500/20 flex items-center justify-center text-amber-600 mx-auto mb-2">
                  <Loader2 className="w-8 h-8 stroke-[1.5] animate-spin text-amber-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">
                    Verification Pending
                  </h2>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                    We have received your payment.
                  </p>
                </div>

                <div className="p-4 bg-white/40 border border-white/30 rounded-2xl text-left space-y-3 font-sans text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 font-mono uppercase tracking-wider text-[10px]">
                      Status:
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 border border-amber-500/20 text-amber-700 font-mono text-[9px] font-bold">
                      Pending Review
                    </span>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 font-sans leading-relaxed font-semibold">
                  Our distributor will contact you back in some time.
                </p>

                {scoreReport && (
                  <button
                    id="view-scorecard-btn"
                    onClick={() => setDashboardStage('REPORT')}
                    className="w-full py-3.5 bg-white/40 border border-border hover:bg-white/60 text-neutral-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    View Scorecard Report
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white/70 border border-white/40 rounded-3xl p-8 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300 text-left">
            <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide font-clash">
              Complete Profile
            </h2>
            <p className="text-neutral-500 text-xs font-sans mt-2 leading-relaxed">
              Please enter your details to proceed with your onboarding and
              premium distribution services.
            </p>
            <form onSubmit={handlePhoneSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                  Mobile / Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={phoneInput}
                  onChange={(e) =>
                    setPhoneInput(e.target.value.replace(/[^\d+ ]/g, ''))
                  }
                  className="w-full px-4 py-3 bg-white/40 border border-border rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-primary font-mono text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  value={dobInput}
                  onChange={(e) => setDobInput(e.target.value)}
                  className="w-full px-4 py-3 bg-white/40 border border-border rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-primary font-mono text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                  Anniversary Date (Optional)
                </label>
                <input
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={anniversaryInput}
                  onChange={(e) => setAnniversaryInput(e.target.value)}
                  className="w-full px-4 py-3 bg-white/40 border border-border rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-primary font-mono text-sm"
                />
              </div>

              {modalError && (
                <p className="text-red-500 text-xs font-sans">{modalError}</p>
              )}

              <button
                type="submit"
                disabled={modalSubmitting}
                className="w-full py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer disabled:opacity-40"
              >
                {modalSubmitting ? 'Saving...' : 'Save & Continue'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Chatbot Widget */}
      <ChatbotWidget />

      {/* Footer Section */}
      <Footer />
    </main>
  );
}
