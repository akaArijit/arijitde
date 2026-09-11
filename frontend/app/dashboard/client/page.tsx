'use client';

import { useEffect, useState } from 'react';
import {
  LogOut,
  LayoutGrid,
  Award,
  ShieldCheck,
  Wallet,
  Sparkles,
  Gift,
  Percent,
  Calendar,
  Loader2,
  ChevronRight,
  CheckCircle2,
  FileSpreadsheet,
  Plus,
  Trash2,
  ArrowLeft,
  Download,
  RefreshCw,
  Clock,
  HelpCircle,
  FileText,
  User,
  ArrowRight,
  Home,
  Briefcase,
  TrendingUp,
  Star,
  Shield,
  TrendingDown,
  Minus,
  Info,
  Search,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  X,
  Radio,
} from 'lucide-react';
import SoftBoxBlurBg from '@/components/SoftBoxBlurBg';
import GradualBlur from '@/components/GradualBlur';
import ChatbotWidget from '@/components/ChatbotWidget';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import Footer from '@/components/Footer';
import { BenchmarkTab } from '@/components/dashboard/BenchmarkTab';
import {
  AdminBenchmarkResponse,
  AdminBenchmarkMeta,
  Timeframe,
  BenchmarkTimePoint,
  BenchmarkMetrics,
} from '@finanalysis/shared';

const SLEEK_COLORS = [
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#EF4444', // Red
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 border border-border rounded-xl p-3 shadow-xl backdrop-blur-md text-[11px] font-sans text-left space-y-1">
        <span className="font-semibold text-neutral-900 block truncate max-w-[200px]">
          {data.name}
        </span>
        <span className="text-neutral-500 font-mono text-[10px]">
          Value:{' '}
          <strong className="text-neutral-900 font-medium">
            ₹{data.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </strong>
        </span>
      </div>
    );
  }
  return null;
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
    icon: Sparkles,
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
    icon: Sparkles,
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
    icon: CompassIcon,
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

function CompassIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

const quotesList = [
  {
    text: 'Do not save what is left after spending, but spend what is left after saving.',
    author: 'Warren Buffett',
  },
  {
    text: 'The individual investor should act consistently as an investor and not as a speculator.',
    author: 'Benjamin Graham',
  },
  {
    text: 'In investing, what is comfortable is rarely profitable.',
    author: 'Robert Arnott',
  },
  {
    text: "The four most dangerous words in investing are: 'This time it's different.'",
    author: 'John Templeton',
  },
  {
    text: 'The most powerful force in the universe is compound interest.',
    author: 'Albert Einstein',
  },
  {
    text: 'Beware of little expenses; a small leak will sink a great ship.',
    author: 'Benjamin Franklin',
  },
  {
    text: 'Know what you own, and know why you own it.',
    author: 'Peter Lynch',
  },
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
  insights: any;
}

const PLAN_LABELS: Record<string, string> = {
  FREE: 'Free Tier',
  PREMIUM: 'Premium Pro Plan',
  MAX: 'Max Portfolio Plan',
};

const getSchemeCategory = (name: string): string => {
  const n = name.toLowerCase();
  if (
    n.includes('bluechip') ||
    n.includes('large cap') ||
    n.includes('large-cap') ||
    n.includes('index')
  )
    return 'Large Cap';
  if (n.includes('mid cap') || n.includes('midcap') || n.includes('mid-cap'))
    return 'Mid Cap';
  if (
    n.includes('small cap') ||
    n.includes('smallcap') ||
    n.includes('small-cap')
  )
    return 'Small Cap';
  if (
    n.includes('flexi cap') ||
    n.includes('flexicap') ||
    n.includes('flexi-cap') ||
    n.includes('multicap') ||
    n.includes('multi cap')
  )
    return 'Flexi Cap';
  if (n.includes('elss') || n.includes('tax saver') || n.includes('tax-saver'))
    return 'ELSS (Tax Saver)';
  if (
    n.includes('debt') ||
    n.includes('bond') ||
    n.includes('liquid') ||
    n.includes('treasury') ||
    n.includes('money market') ||
    n.includes('gilt')
  )
    return 'Debt';
  if (
    n.includes('hybrid') ||
    n.includes('balanced') ||
    n.includes('arbitrage') ||
    n.includes('asset allocator')
  )
    return 'Hybrid';
  return 'Equity - Other';
};

const TOP_50_SCHEMES = [
  {
    code: '120849',
    name: 'Quant Small Cap Fund Direct Growth',
    category: 'Small Cap',
  },
  {
    code: '120150',
    name: 'HDFC Mid-Cap Opportunities Fund Direct Growth',
    category: 'Mid Cap',
  },
  {
    code: '122639',
    name: 'Parag Parikh Flexi Cap Fund Direct Growth',
    category: 'Flexi Cap',
  },
  {
    code: '118834',
    name: 'Mirae Asset Large Cap Fund Direct Growth',
    category: 'Large Cap',
  },
  {
    code: '120586',
    name: 'ICICI Prudential Bluechip Fund Direct Growth',
    category: 'Large Cap',
  },
  {
    code: '120547',
    name: 'Axis Small Cap Fund Direct Growth',
    category: 'Small Cap',
  },
  {
    code: '119775',
    name: 'SBI Bluechip Fund Direct Growth',
    category: 'Large Cap',
  },
  {
    code: '120716',
    name: 'Nippon India Small Cap Fund Direct Growth',
    category: 'Small Cap',
  },
  {
    code: '120823',
    name: 'Quant Active Fund Direct Growth',
    category: 'Flexi Cap',
  },
  {
    code: '120841',
    name: 'Quant Infrastructure Fund Direct Growth',
    category: 'Equity - Other',
  },
  {
    code: '119077',
    name: 'HDFC Top 100 Fund Direct Growth',
    category: 'Large Cap',
  },
  {
    code: '119062',
    name: 'HDFC Small Cap Fund Direct Growth',
    category: 'Small Cap',
  },
  {
    code: '148866',
    name: 'Parag Parikh Conservative Hybrid Fund Direct Growth',
    category: 'Hybrid',
  },
  {
    code: '119778',
    name: 'SBI Contra Fund Direct Growth',
    category: 'Equity - Other',
  },
  {
    code: '120593',
    name: 'ICICI Prudential Asset Allocator Fund Direct Growth',
    category: 'Hybrid',
  },
  {
    code: '120530',
    name: 'Axis Midcap Fund Direct Growth',
    category: 'Mid Cap',
  },
  {
    code: '135796',
    name: 'Tata Digital India Fund Direct Growth',
    category: 'Equity - Other',
  },
  {
    code: '127039',
    name: 'Motilal Oswal Midcap Fund Direct Growth',
    category: 'Mid Cap',
  },
  {
    code: '145347',
    name: 'Motilal Oswal Nasdaq 100 FOF Direct Growth',
    category: 'Equity - Other',
  },
  {
    code: '125497',
    name: 'SBI Small Cap Fund Direct Growth',
    category: 'Small Cap',
  },
  {
    code: '120165',
    name: 'Kotak Emerging Equity Fund Direct Growth',
    category: 'Mid Cap',
  },
  {
    code: '119565',
    name: 'DSP Small Cap Fund Direct Growth',
    category: 'Small Cap',
  },
  {
    code: '120828',
    name: 'Quant ELSS Tax Saver Fund Direct Growth',
    category: 'ELSS (Tax Saver)',
  },
  {
    code: '135781',
    name: 'Mirae Asset ELSS Tax Saver Fund Direct Growth',
    category: 'ELSS (Tax Saver)',
  },
  {
    code: '145001',
    name: 'Canara Robeco Small Cap Fund Direct Growth',
    category: 'Small Cap',
  },
  {
    code: '119067',
    name: 'HDFC Flexi Cap Fund Direct Growth',
    category: 'Flexi Cap',
  },
  {
    code: '142544',
    name: 'Parag Parikh Liquid Fund Direct Growth',
    category: 'Debt',
  },
  {
    code: '118556',
    name: 'ICICI Prudential Liquid Fund Direct Growth',
    category: 'Debt',
  },
  { code: '119782', name: 'SBI Liquid Fund Direct Growth', category: 'Debt' },
  { code: '119280', name: 'Axis Liquid Fund Direct Growth', category: 'Debt' },
  { code: '119098', name: 'HDFC Liquid Fund Direct Growth', category: 'Debt' },
  { code: '120842', name: 'Quant Liquid Fund Direct Growth', category: 'Debt' },
  {
    code: '118683',
    name: 'Nippon India Liquid Fund Direct Growth',
    category: 'Debt',
  },
  {
    code: '145952',
    name: 'Parag Parikh Arbitrage Fund Direct Growth',
    category: 'Hybrid',
  },
  {
    code: '120597',
    name: 'ICICI Prudential Equity & Debt Fund Direct Growth',
    category: 'Hybrid',
  },
  {
    code: '119792',
    name: 'SBI Equity Hybrid Fund Direct Growth',
    category: 'Hybrid',
  },
  {
    code: '119053',
    name: 'HDFC Balanced Advantage Fund Direct Growth',
    category: 'Hybrid',
  },
  {
    code: '120592',
    name: 'ICICI Prudential Balanced Advantage Fund Direct Growth',
    category: 'Hybrid',
  },
  {
    code: '144709',
    name: 'Nippon India Balanced Advantage Fund Direct Growth',
    category: 'Hybrid',
  },
  {
    code: '120840',
    name: 'Quant Multi Asset Fund Direct Growth',
    category: 'Hybrid',
  },
  {
    code: '120821',
    name: 'Quant Absolute Fund Direct Growth',
    category: 'Hybrid',
  },
  {
    code: '119096',
    name: 'HDFC Hybrid Debt Fund Direct Growth',
    category: 'Hybrid',
  },
  {
    code: '125197',
    name: 'SBI Magnum Midcap Fund Direct Growth',
    category: 'Mid Cap',
  },
  {
    code: '119560',
    name: 'DSP Natural Resources Fund Direct Growth',
    category: 'Equity - Other',
  },
  {
    code: '120516',
    name: 'Axis Bluechip Fund Direct Growth',
    category: 'Large Cap',
  },
  {
    code: '120598',
    name: 'ICICI Prudential Nifty 50 Index Fund Direct Growth',
    category: 'Large Cap',
  },
  {
    code: '119082',
    name: 'HDFC Index Fund Nifty 50 Plan Direct Growth',
    category: 'Large Cap',
  },
  {
    code: '120713',
    name: 'UTI Nifty 50 Index Fund Direct Growth',
    category: 'Large Cap',
  },
  {
    code: '149206',
    name: 'Navi Nifty 50 Index Fund Direct Growth',
    category: 'Large Cap',
  },
  {
    code: '122909',
    name: 'Bandhan Sterling Value Fund Direct Growth',
    category: 'Equity - Other',
  },
];

export default function ClientDashboard() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [userData, setUserData] = useState<{
    id: string;
    name?: string;
    email?: string;
    role?: string;
    phone?: string;
    pan?: string;
    client?: {
      activePlan: string | null;
      advisorNotes: string | null;
      activatedAt: string;
    } | null;
  } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // States
  const [error, setError] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // PAN login states
  const [panInput, setPanInput] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [showClientPassword, setShowClientPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authenticating, setAuthenticating] = useState(false);

  // Forgot password flow states
  const [forgotFlow, setForgotFlow] = useState<
    'LOGIN' | 'SEND_OTP' | 'VERIFY_RESET'
  >('LOGIN');
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  // Quiz States (if needed to update lifecycle)
  const [showQuiz, setShowQuiz] = useState(false);
  const [shouldAnalyzeAfterQuiz, setShouldAnalyzeAfterQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(1);
  const [quizAgeRange, setQuizAgeRange] = useState<string>('25-35');
  const [quizAge, setQuizAge] = useState<number>(30);
  const [quizLifeStage, setQuizLifeStage] = useState<string>('');
  const [quizGoal, setQuizGoal] = useState<string>('WEALTH_CREATION');
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

  // Database contexts
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(
    null,
  );
  const [activePortfolioId, setActivePortfolioId] = useState<string | null>(
    null,
  );
  const [activePortfolio, setActivePortfolio] = useState<any | null>(null);
  const [scoreReport, setScoreReport] = useState<ScoreData | null>(null);
  const [existingClientData, setExistingClientData] = useState<any | null>(
    null,
  );
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);

  // Client specifics
  const [clientBookings, setClientBookings] = useState<string[]>([]);
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);
  const [showAnalysisCompleted, setShowAnalysisCompleted] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  // Booking / Scheduling States
  const [payments, setPayments] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [slot1, setSlot1] = useState('');
  const [slot2, setSlot2] = useState('');
  const [slot3, setSlot3] = useState('');
  const [mustSchedule, setMustSchedule] = useState(false);

  // Uploader tabs
  const [analyzeTab, setAnalyzeTab] = useState<'FILE' | 'MANUAL'>('FILE');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [manualRows, setManualRows] = useState<PortfolioRow[]>([
    {
      fundName: '',
      type: 'SIP',
      startDate: '',
      sipAmount: 0,
      invested: 0,
      currentValue: 0,
    },
  ]);

  // Support Query States
  const [supportQueries, setSupportQueries] = useState<any[]>([]);
  const [fetchingQueries, setFetchingQueries] = useState(false);
  const [querySubject, setQuerySubject] = useState('');
  const [queryMessage, setQueryMessage] = useState('');
  const [submittingQuery, setSubmittingQuery] = useState(false);
  const [querySuccess, setQuerySuccess] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  const [currentTime, setCurrentTime] = useState('');

  // Benchmarking States
  const [benchmarkReport, setBenchmarkReport] = useState<AdminBenchmarkResponse | null>(null);
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);
  const [benchmarkError, setBenchmarkError] = useState<string | null>(null);
  const [benchmarkTimeframe, setBenchmarkTimeframe] = useState<Timeframe>('1Y');
  const [userPortfolios, setUserPortfolios] = useState<any[]>([]);

  // Computed values for portfolio totals and breakdowns (either certified client data or active portfolio fallback)
  const hasExistingClientData = !!(
    existingClientData &&
    (existingClientData.aum || existingClientData.currentValue || 0) > 0
  );
  const hasActivePortfolioData = !!(
    activePortfolio &&
    activePortfolio.rows &&
    activePortfolio.rows.length > 0
  );

  const currentVal = (() => {
    // 1. Use client-level aum/currentValue if available
    if (hasExistingClientData) {
      return existingClientData.aum || existingClientData.currentValue || 0;
    }
    // 2. Sum aum from all associated folios
    if (
      existingClientData &&
      existingClientData.folios &&
      existingClientData.folios.length > 0
    ) {
      const folioTotal = existingClientData.folios.reduce(
        (sum: number, f: any) => sum + (f.aum || 0),
        0,
      );
      if (folioTotal > 0) return folioTotal;
    }
    // 3. Fall back to active portfolio rows
    if (hasActivePortfolioData) {
      return activePortfolio.rows.reduce(
        (sum: number, r: any) => sum + (r.currentValue || 0),
        0,
      );
    }
    return 0;
  })();

  const investedVal = (() => {
    // 1. Use client-level purchaseValue if available
    if (existingClientData && (existingClientData.purchaseValue || 0) > 0) {
      return existingClientData.purchaseValue;
    }
    // 2. Sum purchaseValue from all associated folios
    if (
      existingClientData &&
      existingClientData.folios &&
      existingClientData.folios.length > 0
    ) {
      const folioTotal = existingClientData.folios.reduce(
        (sum: number, f: any) => sum + (f.purchaseValue || 0),
        0,
      );
      if (folioTotal > 0) return folioTotal;
    }
    // 3. Fall back to active portfolio rows
    if (hasActivePortfolioData) {
      return activePortfolio.rows.reduce(
        (sum: number, r: any) => sum + (r.invested || 0),
        0,
      );
    }
    return 0;
  })();

  const unifiedFolios = (() => {
    if (
      existingClientData &&
      existingClientData.folios &&
      existingClientData.folios.length > 0
    ) {
      return existingClientData.folios;
    }
    if (hasActivePortfolioData) {
      return activePortfolio.rows.map((r: any) => ({
        schemeName: r.fundName || 'Unknown Scheme',
        purchaseValue: r.invested || 0,
        aum: r.currentValue || 0,
        units: 0,
      }));
    }
    return [];
  })();

  // View full scorecard inline toggle
  const [viewFullReport, setViewFullReport] = useState(false);

  const [rememberMe, setRememberMe] = useState(true);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const setAuthSession = (token: string, user: any, remember: boolean) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    const expiry = remember ? `max-age=${30 * 24 * 60 * 60}` : ''; // 30 days or session cookie
    document.cookie = `token=${token}; path=/; ${expiry}; SameSite=Lax; Secure`;
    document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; ${expiry}; SameSite=Lax; Secure`;
  };

  // Clock Synchronizer and Booking Slot Initializer
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setCurrentTime(date.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Default slot: 24h from now formatted to YYYY-MM-DDTHH:mm
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const hours = String(tomorrow.getHours()).padStart(2, '0');
    const minutes = String(tomorrow.getMinutes()).padStart(2, '0');
    setSelectedSlot(`${year}-${month}-${day}T${hours}:${minutes}`);

    return () => clearInterval(interval);
  }, []);
  // Auth Guard & Setup
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!savedToken || !savedUser) {
      setIsLoaded(true);
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.role !== 'CLIENT' && parsedUser.role !== 'ADMIN') {
        window.location.href = '/dashboard/user';
        return;
      }
      setToken(savedToken);
      setUserData(parsedUser);
      setIsLoaded(true);

      // Load client states
      const savedBookings = localStorage.getItem('clientBookings');
      if (savedBookings) {
        setClientBookings(JSON.parse(savedBookings));
      }

      const bookingSuccessFlag = localStorage.getItem('showBookingSuccess');
      if (bookingSuccessFlag === 'true') {
        setShowBookingSuccess(true);
        localStorage.removeItem('showBookingSuccess');
      }
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoaded(true);
    }
  }, []);

  // Data Fetching
  useEffect(() => {
    if (token) {
      fetchClientData();
    }
  }, [token]);

  const fetchMyQueries = async () => {
    if (!token) return;
    try {
      setFetchingQueries(true);
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${backendUrl}/api/support/my-queries`, {
        headers,
      });
      if (!res.ok) throw new Error('Failed to retrieve past queries');
      const resData = await res.json();
      setSupportQueries(resData.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setFetchingQueries(false);
    }
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!querySubject.trim() || !queryMessage.trim()) {
      setQueryError('Please fill out all fields.');
      return;
    }

    try {
      setSubmittingQuery(true);
      setQueryError(null);
      setQuerySuccess(false);

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const res = await fetch(`${backendUrl}/api/support/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          subject: querySubject,
          message: queryMessage,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to submit query');
      }

      setQuerySuccess(true);
      setQuerySubject('');
      setQueryMessage('');
      await fetchMyQueries();
    } catch (err: any) {
      setQueryError(
        err.message || 'An error occurred while submitting your query',
      );
    } finally {
      setSubmittingQuery(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMyQueries();
    }
  }, [token]);

  const fetchClientData = async () => {
    try {
      setApiLoading(true);
      setStatusMsg('Loading premium client workspace...');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Me check
      const meRes = await fetch(`${backendUrl}/api/auth/me`, { headers });
      if (meRes.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/onboarding';
        return;
      }
      const meData = await meRes.json();
      if (
        meRes.ok &&
        (meData.data?.role === 'CLIENT' || meData.data?.role === 'ADMIN')
      ) {
        const uObj = meData.data;
        setUserData(uObj);
        localStorage.setItem('user', JSON.stringify(uObj));
      }

      // 2. Fetch assessments
      const assessRes = await fetch(`${backendUrl}/api/assess`, { headers });
      const assessData = await assessRes.json();
      const userAssessments = assessData.success ? assessData.data : [];

      if (userAssessments.length > 0) {
        const latestAssessment = userAssessments[0];
        setActiveAssessmentId(latestAssessment.id);
        setQuizAge(latestAssessment.age);
        setQuizGoal(latestAssessment.goal);
        if (latestAssessment.ageRange)
          setQuizAgeRange(latestAssessment.ageRange);
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
      }

      // 3. Fetch portfolios
      const portRes = await fetch(`${backendUrl}/api/portfolio`, { headers });
      const portData = await portRes.json();
      const userPortfolios = portData.success ? portData.data : [];

      // Set user portfolios for benchmarking dropdown
      setUserPortfolios(userPortfolios.map((p: any) => ({
        id: p.id,
        createdAt: p.createdAt,
        rowCount: p.rows?.length || 0,
        totalInvested: p.rows?.reduce((s: number, r: any) => s + r.invested, 0) || 0,
        totalCurrentValue: p.rows?.reduce((s: number, r: any) => s + r.currentValue, 0) || 0,
        assessment: p.assessment,
      })));

      if (userPortfolios.length > 0) {
        const latestPortfolio = userPortfolios[0];
        setActivePortfolioId(latestPortfolio.id);
        setActivePortfolio(latestPortfolio);
        if (latestPortfolio.score) {
          setScoreReport(latestPortfolio.score);
        } else {
          // Score it inline
          await calculatePortfolioScore(latestPortfolio.id);
        }
      }

      // 4. Fetch official matching ExistingClient and Folios data
      try {
        const ecRes = await fetch(`${backendUrl}/api/portfolio/client-data`, {
          headers,
        });
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
  };

  const calculatePortfolioScore = async (portfolioId: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/score/${portfolioId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setScoreReport(data.data);
      } else {
        setError(data.error || 'Failed to analyze score.');
      }
    } catch (err) {
      setError('Network error running score calculation.');
    }
  };

  const handleFetchBenchmark = async (params: { portfolioId?: string; clientId?: string; timeframe: Timeframe }) => {
    setBenchmarkLoading(true);
    setBenchmarkError(null);
    try {
      const query = new URLSearchParams();
      if (params.portfolioId) query.set('portfolioId', params.portfolioId);
      query.set('timeframe', params.timeframe);
      const res = await fetch(`${backendUrl}/api/portfolio/benchmark?${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBenchmarkReport(data.data);
      } else {
        throw new Error(data.error || 'Failed to load benchmark');
      }
    } catch (err: any) {
      setBenchmarkError(err.message);
    } finally {
      setBenchmarkLoading(false);
    }
  };

  const handleBookMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot1 || !slot2 || !slot3) {
      setError('Please select all 3 preferred time slots.');
      return;
    }

    const livePayment = payments.find(
      (p: any) => p.productType === 'LIVE_SESSION' && p.status === 'APPROVED',
    );

    if (!livePayment) {
      setError('No approved Live Portfolio Review Discussion payment found.');
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
          paymentId: livePayment.id,
          slot1,
          slot2,
          slot3,
        }),
      });
      const resData = await res.json();

      if (resData.success) {
        setShowBookingSuccess(true);
        setMustSchedule(false);
        await fetchClientData();
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

  // 1-Click Booking
  const handleClientBookCall = async () => {
    setError(null);
    setApiLoading(true);
    setStatusMsg('Registering premium portfolio review discussion booking...');

    try {
      const res = await fetch(`${backendUrl}/api/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: userData?.name || 'Client',
          phone: userData?.phone || '0000000000',
          slot: selectedSlot
            ? new Date(selectedSlot).toISOString()
            : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
      const data = await res.json();

      if (data.success) {
        const selectedSlotDate = selectedSlot
          ? new Date(selectedSlot)
          : new Date(Date.now() + 24 * 60 * 60 * 1000);
        const formattedSlot = selectedSlotDate.toLocaleString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        const newBooking = `1-on-1 Strategy Session - Confirmed for ${formattedSlot} (Free)`;
        const updatedBookings = [newBooking, ...clientBookings];
        setClientBookings(updatedBookings);
        localStorage.setItem('clientBookings', JSON.stringify(updatedBookings));

        setShowBookingSuccess(true);
      } else {
        setError(data.error || 'Failed to book call.');
      }
    } catch (err) {
      setError('Network error booking call.');
    } finally {
      setApiLoading(false);
    }
  };

  const handleAnalyzeCertifiedPortfolio = async (assessmentIdParam?: any) => {
    const targetAssessmentId =
      typeof assessmentIdParam === 'string'
        ? assessmentIdParam
        : activeAssessmentId;

    if (!targetAssessmentId) {
      setError(null);
      setShouldAnalyzeAfterQuiz(true);
      setQuizStep(1);
      setShowQuiz(true);
      return;
    }

    if (
      !existingClientData ||
      !existingClientData.folios ||
      existingClientData.folios.length === 0
    ) {
      setError('No certified holdings found to analyze.');
      return;
    }

    setError(null);
    setApiLoading(true);
    setStatusMsg('Analyzing certified portfolio...');

    try {
      const rows = existingClientData.folios
        .filter(
          (f: any) =>
            f.purchaseValue !== null &&
            f.purchaseValue !== undefined &&
            f.purchaseValue > 0 &&
            f.aum !== null &&
            f.aum !== undefined &&
            f.aum > 0,
        )
        .map((f: any) => ({
          fundName: f.schemeName || 'Unknown Fund',
          type: 'LUMPSUM', // Defaulting to LUMPSUM for holdings
          startDate: new Date().toISOString(),
          sipAmount: 0,
          invested: f.purchaseValue,
          currentValue: f.aum,
        }));

      const res = await fetch(`${backendUrl}/api/portfolio/manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assessmentId: targetAssessmentId,
          rows,
        }),
      });
      const data = await res.json();

      if (data.success) {
        const pId = data.data.portfolioId;
        setActivePortfolioId(pId);
        setStatusMsg('Calculating financial health scores...');
        await calculatePortfolioScore(pId);
        await fetchClientData();
        setShowAnalysisCompleted(true);
      } else {
        setError(data.error || 'Failed to analyze certified portfolio');
      }
    } catch (err) {
      setError('Network error while submitting details.');
    } finally {
      setApiLoading(false);
    }
  };

  // Upload portfolio file submit
  const handleFileUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile) {
      setError('Please select a file to upload.');
      return;
    }
    if (!activeAssessmentId) {
      setError(
        'Assessment profile missing. Please complete lifecycle details first.',
      );
      return;
    }

    setError(null);
    setApiLoading(true);
    setStatusMsg('Uploading investment telemetry file...');

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('assessmentId', activeAssessmentId);

      const res = await fetch(`${backendUrl}/api/portfolio/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        const pId = data.data.portfolioId;
        setActivePortfolioId(pId);
        setStatusMsg('Analyzing asset allocation and scoring...');
        await calculatePortfolioScore(pId);
        await fetchClientData();
        setUploadedFile(null);
        setShowAnalysisCompleted(true);
      } else {
        setError(data.error || 'Failed to process Excel upload.');
      }
    } catch (err) {
      setError('Network error while uploading file.');
    } finally {
      setApiLoading(false);
    }
  };

  // Manual Portfolio submit
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssessmentId) {
      setError('Assessment profile missing.');
      return;
    }

    for (let i = 0; i < manualRows.length; i++) {
      const row = manualRows[i]!;
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
        setError(
          `Row ${i + 1}: Invested and Current Value must be positive numbers`,
        );
        return;
      }
    }

    setError(null);
    setApiLoading(true);
    setStatusMsg('Saving manual investment details...');

    try {
      const formattedRows = manualRows.map((r) => ({
        ...r,
        startDate: new Date(r.startDate).toISOString(),
      }));

      const res = await fetch(`${backendUrl}/api/portfolio/manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assessmentId: activeAssessmentId,
          rows: formattedRows,
        }),
      });
      const data = await res.json();

      if (data.success) {
        const pId = data.data.portfolioId;
        setActivePortfolioId(pId);
        setStatusMsg('Calculating financial health scores...');
        await calculatePortfolioScore(pId);
        await fetchClientData();
        // Reset manual grid
        setManualRows([
          {
            fundName: '',
            type: 'SIP',
            startDate: '',
            sipAmount: 0,
            invested: 0,
            currentValue: 0,
          },
        ]);
        setShowAnalysisCompleted(true);
      } else {
        setError(data.error || 'Failed to submit manual portfolio');
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
    setManualRows([
      ...manualRows,
      {
        fundName: '',
        type: 'SIP',
        startDate: '',
        sipAmount: 0,
        invested: 0,
        currentValue: 0,
      },
    ]);
  };

  const handleRemoveManualRow = (index: number) => {
    if (manualRows.length === 1) return;
    setManualRows(manualRows.filter((_, i) => i !== index));
  };

  const downloadCsvTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Fund Name,Investment Type,Start Date,Monthly SIP Amount,Total Invested,Current Value\n' +
      'HDFC Top 100 Fund,SIP,15/01/2022,5000,240000,295000\n' +
      'Parag Parikh Flexi Cap Fund,SIP,10/06/2021,10000,500000,680000\n' +
      'SBI Bluechip Fund,Lumpsum,20/03/2020,0,100000,165000\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'portfolio_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Re-assess profile logic
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
    setStatusMsg('Updating your lifecycle diagnostics target...');

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
        const newAssessmentId = resData.data.assessmentId;
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
        setError(resData.error || 'Failed to submit assessment target');
      }
    } catch (err) {
      setError('Could not submit assessment. Verify network connection.');
    } finally {
      setApiLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/onboarding';
  };

  const handlePanLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const trimmedPan = panInput.trim().toUpperCase();

    if (!trimmedPan) {
      setLoginError('Please enter your PAN number.');
      return;
    }

    if (trimmedPan.length !== 10) {
      setLoginError('PAN number must be exactly 10 characters long.');
      return;
    }

    if (!clientPassword) {
      setLoginError('Please enter your account password.');
      return;
    }

    setAuthenticating(true);
    try {
      const res = await fetch(`${backendUrl}/api/auth/pan/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pan: trimmedPan, password: clientPassword }),
      });
      const data = await res.json();

      if (data.success) {
        const fetchedToken = data.data.token;
        const fetchedUser = data.data.user;

        setAuthSession(fetchedToken, fetchedUser, rememberMe);

        setToken(fetchedToken);
        setUserData(fetchedUser);

        // Load client states
        const savedBookings = localStorage.getItem('clientBookings');
        if (savedBookings) {
          setClientBookings(JSON.parse(savedBookings));
        }
      } else {
        setLoginError(data.error || 'Authentication failed.');
      }
    } catch (err) {
      setLoginError('Network connection error. Please try again.');
    } finally {
      setAuthenticating(false);
    }
  };

  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setResetSuccessMsg(null);
    const trimmedEmail = resetEmail.trim().toLowerCase();

    if (!trimmedEmail) {
      setLoginError('Please enter your registered email address.');
      return;
    }

    setAuthenticating(true);
    try {
      const res = await fetch(
        `${backendUrl}/api/auth/password/reset/send-otp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmedEmail }),
        },
      );
      const data = await res.json();

      if (data.success) {
        setResetSuccessMsg(
          `Verification code sent successfully to ${trimmedEmail}`,
        );
        setForgotFlow('VERIFY_RESET');
      } else {
        setLoginError(data.error || 'Failed to send reset code.');
      }
    } catch (err) {
      setLoginError('Network connection error. Please try again.');
    } finally {
      setAuthenticating(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setResetSuccessMsg(null);
    const trimmedEmail = resetEmail.trim().toLowerCase();
    const trimmedOtp = resetOtp.trim();
    const trimmedPass = newPassword.trim();

    if (!trimmedOtp || trimmedOtp.length !== 6) {
      setLoginError('Please enter a valid 6-digit OTP code.');
      return;
    }

    if (
      !trimmedPass ||
      trimmedPass.length < 8 ||
      !/[A-Z]/.test(trimmedPass) ||
      !/[0-9]/.test(trimmedPass)
    ) {
      setLoginError(
        'Password must be at least 8 characters long and contain at least one uppercase letter and one number.',
      );
      return;
    }

    setAuthenticating(true);
    try {
      const res = await fetch(`${backendUrl}/api/auth/password/reset/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          otp: trimmedOtp,
          password: trimmedPass,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setResetSuccessMsg(
          'Password reset successfully! Please log in using your new credentials.',
        );
        setForgotFlow('LOGIN');
        // Clear forms
        setResetEmail('');
        setResetOtp('');
        setNewPassword('');
        setPanInput('');
        setClientPassword('');
      } else {
        setLoginError(data.error || 'Failed to reset password.');
      }
    } catch (err) {
      setLoginError('Network connection error. Please try again.');
    } finally {
      setAuthenticating(false);
    }
  };

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

  if (!isLoaded) {
    return (
      <div className="w-full min-h-screen bg-[#F2F0EF] flex flex-col items-center justify-center text-center p-12">
        <div className="flex items-center gap-1.5 mb-6">
          <div
            className="w-3.5 h-3.5 rounded-full bg-amber-600 animate-bounce"
            style={{ animationDelay: '0s', animationDuration: '0.8s' }}
          />
          <div
            className="w-3.5 h-3.5 rounded-full bg-amber-600 animate-bounce"
            style={{ animationDelay: '0.15s', animationDuration: '0.8s' }}
          />
          <div
            className="w-3.5 h-3.5 rounded-full bg-amber-600 animate-bounce"
            style={{ animationDelay: '0.3s', animationDuration: '0.8s' }}
          />
        </div>
        <h3 className="text-lg font-medium text-neutral-950 font-clash">
          Loading Client Portal...
        </h3>
        <p className="text-neutral-500 text-xs font-sans mt-2">
          Retrieving SEBI-compliant telemetry data
        </p>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen bg-transparent text-neutral-900 flex flex-col relative font-clash select-none overflow-x-hidden">
      {/* Background with Ambient Radial Glows */}
      <div className="page-backdrop fixed inset-0 z-0 select-none pointer-events-none">
        <SoftBoxBlurBg />
      </div>

      {/* Header */}
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
            <LayoutGrid className="w-5 h-5 text-primary" />
            <span className="font-chillax font-bold tracking-wider text-sm uppercase">
              Premium Client Workspace
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
              {userData.role === 'ADMIN' && (
                <a
                  href="/dashboard/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold transition duration-200 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </a>
              )}
              <button
                onClick={() => setShowLogoutWarning(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:border-red-500/30 bg-white/40 hover:bg-red-500/10 text-neutral-600 hover:text-red-600 text-xs font-semibold transition duration-200 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-5xl px-4 md:px-8 py-12 flex flex-col gap-8 relative z-10 mx-auto">
        {/* Global Error Banner */}
        {error && (
          <div className="w-full max-w-md mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl text-xs flex gap-3 items-start text-left font-sans animate-in fade-in slide-in-from-top-4">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Notification</span>
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

        {/* Global inline loaders */}
        {apiLoading && statusMsg && (
          <div className="fixed top-20 right-6 z-50 p-4 bg-white/80 border border-border rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-3 text-xs text-neutral-700 animate-in slide-in-from-right duration-300">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <span className="font-medium">{statusMsg}</span>
          </div>
        )}

        {/* Quiz reassessment modal */}
        {!token || !userData ? (
          <div
            data-lenis-prevent
            className="w-full max-w-md mx-auto bg-white/40 border border-white/30 rounded-3xl p-8 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300 max-h-[85vh] overflow-y-auto custom-scrollbar"
          >
            <div className="space-y-6 text-center">
              <div className="space-y-2">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <ShieldCheck className="w-6 h-6 animate-pulse" />
                </div>
                <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide font-clash">
                  {forgotFlow === 'LOGIN' && 'Premium Client Access'}
                  {forgotFlow === 'SEND_OTP' && 'Reset Account Password'}
                  {forgotFlow === 'VERIFY_RESET' && 'Verify Reset Code'}
                </h2>
                <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                  {forgotFlow === 'LOGIN' &&
                    'Enter your registered 10-character PAN number and password to log in.'}
                  {forgotFlow === 'SEND_OTP' &&
                    'Enter your registered email address to receive a 6-digit verification code.'}
                  {forgotFlow === 'VERIFY_RESET' &&
                    'Enter the verification code sent to your email and your new password.'}
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-red-500/10 border border-red-500/15 text-red-600 rounded-xl text-xs text-left font-sans flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                  <span className="font-bold shrink-0 mt-0.5">⚠️</span>
                  <span>{loginError}</span>
                </div>
              )}

              {resetSuccessMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/15 text-emerald-600 rounded-xl text-xs text-left font-sans flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                  <span className="font-bold shrink-0 mt-0.5">✓</span>
                  <span>{resetSuccessMsg}</span>
                </div>
              )}

              {forgotFlow === 'LOGIN' && (
                <form
                  onSubmit={handlePanLogin}
                  className="space-y-4 text-left animate-in fade-in duration-300"
                >
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-900 uppercase block tracking-wider font-mono">
                      PAN Card Number
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={panInput}
                      onChange={(e) =>
                        setPanInput(e.target.value.toUpperCase())
                      }
                      placeholder="E.g. ABCDE1234F"
                      disabled={authenticating}
                      className="w-full px-4 py-3 bg-white/60 border border-border rounded-xl focus:outline-none focus:border-primary font-mono text-sm tracking-widest text-neutral-900 placeholder:text-neutral-400 placeholder:tracking-normal uppercase"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-neutral-900 uppercase block tracking-wider font-mono">
                        Account Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotFlow('SEND_OTP');
                          setLoginError(null);
                          setResetSuccessMsg(null);
                        }}
                        className="text-[10px] text-primary hover:underline font-semibold font-sans cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showClientPassword ? 'text' : 'password'}
                        value={clientPassword}
                        onChange={(e) => setClientPassword(e.target.value)}
                        placeholder="Enter account password"
                        disabled={authenticating}
                        className="w-full pl-4 pr-10 py-3 bg-white/60 border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-neutral-900 placeholder:text-neutral-400 font-sans"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowClientPassword(!showClientPassword)
                        }
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 transition-colors p-1 cursor-pointer"
                      >
                        {showClientPassword ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4 text-neutral-500"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4 text-neutral-500"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      id="dashboardRememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                    />
                    <label
                      htmlFor="dashboardRememberMe"
                      className="text-xs text-muted-foreground select-none cursor-pointer font-sans"
                    >
                      Remember me on this device
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={authenticating}
                    className="w-full py-3.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    {authenticating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Authenticating Client...</span>
                      </>
                    ) : (
                      <>
                        <span>Secure Log In</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {forgotFlow === 'SEND_OTP' && (
                <form
                  onSubmit={handleSendResetOtp}
                  className="space-y-4 text-left animate-in fade-in duration-300"
                >
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-900 uppercase block tracking-wider font-mono">
                      Registered Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      disabled={authenticating}
                      className="w-full px-4 py-3 bg-white/60 border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-neutral-900 placeholder:text-neutral-400 font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authenticating}
                    className="w-full py-3.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    {authenticating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending OTP Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Verification OTP</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotFlow('LOGIN');
                        setLoginError(null);
                        setResetSuccessMsg(null);
                      }}
                      className="text-xs text-neutral-600 hover:text-neutral-900 font-semibold cursor-pointer"
                    >
                      &larr; Back to Login
                    </button>
                  </div>
                </form>
              )}

              {forgotFlow === 'VERIFY_RESET' && (
                <form
                  onSubmit={handleConfirmReset}
                  className="space-y-4 text-left animate-in fade-in duration-300"
                >
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-900 uppercase block tracking-wider font-mono">
                      6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value)}
                      placeholder="Enter verification code"
                      disabled={authenticating}
                      className="w-full px-4 py-3 bg-white/60 border border-border rounded-xl focus:outline-none focus:border-primary text-center font-mono text-sm tracking-widest text-neutral-900 placeholder:text-neutral-400 placeholder:tracking-normal"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-900 uppercase block tracking-wider font-mono">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 8 chars, 1 uppercase, 1 number"
                        disabled={authenticating}
                        className="w-full pl-4 pr-10 py-3 bg-white/60 border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-neutral-900 placeholder:text-neutral-400 font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 transition-colors p-1 cursor-pointer"
                      >
                        {showNewPassword ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4 text-neutral-500"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4 text-neutral-500"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authenticating}
                    className="w-full py-3.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    {authenticating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Resetting Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Reset & Save Password</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotFlow('LOGIN');
                        setLoginError(null);
                        setResetSuccessMsg(null);
                      }}
                      className="text-xs text-neutral-600 hover:text-neutral-900 font-semibold cursor-pointer"
                    >
                      &larr; Cancel and Login
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : showQuiz ? (
          <div
            data-lenis-prevent
            className="w-full max-w-md mx-auto bg-white/30 border border-white/30 rounded-3xl p-8 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300 max-h-[85vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 mb-6 uppercase tracking-widest">
              <span>Client Targets Quiz</span>
              <span>Step {quizStep} of 5</span>
            </div>

            {/* Step 1: Life Stage */}
            {quizStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2 text-left">
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
                        className={`w-full py-3.5 px-4 rounded-xl border text-xs font-medium transition duration-150 cursor-pointer text-center ${isSelected ? 'bg-primary/10 border-primary text-neutral-900' : 'bg-white/40 border-white/20 text-neutral-600 hover:text-neutral-900'}`}
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
                  className="w-full py-3.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  Continue <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Step 2: Investment Goal */}
            {quizStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2 text-left">
                  <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">
                    What is the primary reason you&apos;re investing?
                  </h2>
                  <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                    Goal alignment score.
                  </p>
                </div>
                <div
                  data-lenis-prevent
                  className="grid grid-cols-1 gap-2 text-left max-h-[300px] overflow-y-auto pr-1 custom-scrollbar"
                >
                  {GOAL_OPTIONS.map((goal) => {
                    const isSelected = quizGoal === goal.value;
                    const IconComponent = goal.icon;
                    return (
                      <button
                        key={goal.value}
                        onClick={() => {
                          setQuizGoal(goal.value);
                          setShowNotSureMessage(goal.value === 'NOT_SURE_YET');
                        }}
                        className={`w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 cursor-pointer ${isSelected ? 'bg-primary/10 border-primary' : 'bg-white/40 border-white/20'}`}
                      >
                        <div className="p-1.5 rounded-lg bg-white border border-border text-neutral-500">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold block">
                            {goal.label}
                          </span>
                          <span className="text-[9px] text-neutral-500 block leading-tight mt-0.5">
                            {goal.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
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
                <div className="flex gap-2">
                  <button
                    onClick={() => setQuizStep(1)}
                    className="flex-1 py-3 bg-white/40 border border-border text-neutral-600 text-xs font-semibold rounded-xl hover:bg-white/60 transition cursor-pointer"
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
                    className="flex-1 py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Continue <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Investment Tenure */}
            {quizStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-2 text-left">
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
                        className={`w-full py-3.5 px-4 rounded-xl border text-xs font-medium transition duration-150 cursor-pointer text-center ${isSelected ? 'bg-primary/10 border-primary text-neutral-900' : 'bg-white/40 border-white/20 text-neutral-600 hover:text-neutral-900'}`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setQuizStep(2)}
                    className="flex-1 py-3 bg-white/40 border border-border text-neutral-600 text-xs font-semibold rounded-xl hover:bg-white/60 transition cursor-pointer"
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
                    className="flex-1 py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Continue <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Monthly Investment */}
            {quizStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-2 text-left">
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
                        className={`w-full py-3.5 px-4 rounded-xl border text-xs font-medium transition duration-150 cursor-pointer text-center ${isSelected ? 'bg-primary/10 border-primary text-neutral-900' : 'bg-white/40 border-white/20 text-neutral-600 hover:text-neutral-900'}`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setQuizStep(3)}
                    className="flex-1 py-3 bg-white/40 border border-border text-neutral-600 text-xs font-semibold rounded-xl hover:bg-white/60 transition cursor-pointer"
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
                    className="flex-1 py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Continue <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Emergency Fund */}
            {quizStep === 5 && (
              <div className="space-y-6">
                <div className="space-y-2 text-left">
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
                        className={`w-full py-3.5 px-4 rounded-xl border text-xs font-medium transition duration-150 cursor-pointer text-center ${isSelected ? 'bg-primary/10 border-primary text-neutral-900' : 'bg-white/40 border-white/20 text-neutral-600 hover:text-neutral-900'}`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 mt-8">
                  <button
                    onClick={() => setQuizStep(4)}
                    className="flex-1 py-3 bg-white/40 border border-border text-neutral-600 text-xs font-semibold rounded-xl hover:bg-white/60 transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleQuizSubmit}
                    disabled={apiLoading || !quizEmergencyFund}
                    className="flex-1 py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 transition cursor-pointer disabled:opacity-40"
                  >
                    {apiLoading ? 'Submitting...' : 'Finish & Update'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Client Workspace */
          <div className="w-full select-text text-left space-y-8">
            {/* Member profile details */}
            <div className="bg-gradient-to-br from-white/50 via-white/35 to-amber-500/5 backdrop-blur-2xl border border-amber-500/20 shadow-[0_20px_50px_rgba(245,158,11,0.08)] rounded-3xl p-6 space-y-4 relative overflow-hidden animate-in fade-in duration-300">
              {/* Decorative glowing background gradients */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-1 relative z-10">
                <h2 className="text-xl font-semibold text-neutral-900 tracking-wide font-clash">
                  Welcome, {userData?.name || 'Client'}
                </h2>
                <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                  SEBI-compliant investment cockpit. Add data & re-analyze
                  infinite times.
                </p>
              </div>

              <div className="border-t border-amber-500/10 pt-3 space-y-2 text-xs font-sans text-neutral-600 relative z-10">
                {userData?.pan && (
                  <div className="flex justify-between font-mono items-center">
                    <span className="text-[9px] font-mono text-amber-700 tracking-widest uppercase font-bold">
                      PAN Number:
                    </span>
                    <span className="font-semibold text-neutral-800">
                      {userData.pan}
                    </span>
                  </div>
                )}
                {existingClientData?.createdAt && (
                  <div className="flex justify-between font-mono items-center">
                    <span className="text-[9px] font-mono text-amber-700 tracking-widest uppercase font-bold">
                      Last Updated:
                    </span>
                    <span className="font-semibold text-neutral-800">
                      {new Date(
                        existingClientData.createdAt,
                      ).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-mono items-start">
                  <span className="text-[9px] font-mono text-amber-700 tracking-widest uppercase font-bold mt-1">
                    Total AUM:
                  </span>
                  <div className="text-right">
                    {(() => {
                      const totalGain = currentVal - investedVal;
                      const totalGainPercent =
                        investedVal > 0 ? (totalGain / investedVal) * 100 : 0;
                      const isProfit = totalGain >= 0;

                      return (
                        <>
                          <span className="text-lg font-bold text-neutral-900 font-mono block">
                            ₹
                            {currentVal.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                          <span
                            className={`text-xs font-bold font-mono ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}
                          >
                            ({isProfit ? '+' : ''}
                            {totalGainPercent.toFixed(2)}%)
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Official Portfolio Valuation (Admin Certified or Active Portfolio) */}
            {(hasExistingClientData || hasActivePortfolioData) && (
              <div className="bg-gradient-to-br from-white/50 via-white/35 to-amber-500/5 backdrop-blur-2xl border border-amber-500/20 shadow-[0_20px_50px_rgba(245,158,11,0.08)] rounded-3xl p-6 space-y-6 animate-in fade-in duration-300 relative overflow-hidden">
                {/* Decorative glowing background gradients */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-amber-500/10 pb-4 gap-3 relative z-10">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      {(existingClientData?.pan || userData?.pan) && (
                        <span className="text-[10px] font-mono text-neutral-400">
                          PAN Match: {existingClientData?.pan || userData?.pan}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 font-clash mt-1">
                      Official Assets Under Management (AUM)
                    </h3>
                    <p className="text-neutral-500 text-xs font-sans">
                      Certified valuation metrics synchronized from official
                      distributor records.
                    </p>
                  </div>
                  <button
                    onClick={handleAnalyzeCertifiedPortfolio}
                    disabled={apiLoading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#3A8293] hover:bg-[#3A8293]/90 text-white font-bold text-xs rounded-xl shadow-md transition duration-200 cursor-pointer disabled:opacity-50 select-none font-sans shrink-0 min-w-[140px] justify-center"
                  >
                    {apiLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    )}
                    <span>
                      {apiLoading ? 'Analyzing...' : 'Analyze Portfolio'}
                    </span>
                  </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                  <div className="p-5 sm:p-6 bg-white/60 border border-white/30 rounded-2xl shadow-sm space-y-1.5">
                    <span className="text-[10px] text-neutral-500 block uppercase font-mono tracking-wider">
                      AUM (Current Value)
                    </span>
                    <div className="text-lg sm:text-xl font-bold font-mono text-neutral-900 whitespace-nowrap overflow-hidden text-ellipsis">
                      ₹
                      {currentVal.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 bg-white/60 border border-white/30 rounded-2xl shadow-sm space-y-1.5">
                    <span className="text-[10px] text-neutral-500 block uppercase font-mono tracking-wider">
                      Total Invested
                    </span>
                    <div className="text-lg sm:text-xl font-bold font-mono text-neutral-900 whitespace-nowrap overflow-hidden text-ellipsis">
                      ₹
                      {investedVal.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 bg-white/60 border border-white/30 rounded-2xl shadow-sm space-y-1.5">
                    <span className="text-[10px] text-neutral-500 block uppercase font-mono tracking-wider">
                      Total Return
                    </span>
                    {(() => {
                      const totalGain = currentVal - investedVal;
                      const totalGainPercent =
                        investedVal > 0 ? (totalGain / investedVal) * 100 : 0;
                      const isProfit = totalGain >= 0;

                      return (
                        <div
                          className={`text-lg sm:text-xl font-bold font-mono ${isProfit ? 'text-emerald-600' : 'text-rose-600'} whitespace-nowrap`}
                        >
                          {isProfit ? '+' : ''}₹
                          {totalGain.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                          <span className="text-[10px] font-mono font-semibold block mt-0.5">
                            ({isProfit ? '+' : ''}
                            {totalGainPercent.toFixed(2)}%)
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Scheme Holdings */}
                {unifiedFolios && unifiedFolios.length > 0 && (
                  <div className="space-y-4 pt-2 relative z-10">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5 font-mono">
                      <Wallet className="w-4 h-4 text-primary" />
                      Mutual Fund Scheme Holdings ({unifiedFolios.length})
                    </h4>

                    {(() => {
                      const groupedMap: Record<
                        string,
                        {
                          schemeName: string;
                          invested: number;
                          current: number;
                          units: number;
                        }
                      > = {};
                      const categoryMap: Record<
                        string,
                        { name: string; value: number }
                      > = {};

                      unifiedFolios.forEach((f: any) => {
                        const name = f.schemeName || 'Unknown Scheme';
                        if (!groupedMap[name]) {
                          groupedMap[name] = {
                            schemeName: name,
                            invested: 0,
                            current: 0,
                            units: 0,
                          };
                        }
                        groupedMap[name].invested += f.purchaseValue || 0;
                        groupedMap[name].current += f.aum || 0;
                        groupedMap[name].units += f.units || 0;

                        const category = getSchemeCategory(name);
                        if (!categoryMap[category]) {
                          categoryMap[category] = { name: category, value: 0 };
                        }
                        categoryMap[category].value += f.aum || 0;
                      });

                      const groupedList = Object.values(groupedMap);
                      const pieData = groupedList.map((scheme: any) => ({
                        name: scheme.schemeName,
                        value: scheme.current,
                      }));
                      const categoryPieData = Object.values(categoryMap);

                      const totalAum = pieData.reduce(
                        (acc, curr) => acc + curr.value,
                        0,
                      );

                      return (
                        <div className="flex flex-col gap-6 w-full">
                          {/* Grid wrapper for both charts side by side */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            {/* Chart 1: Scheme Allocation */}
                            <div className="bg-white/40 border border-border/30 rounded-2xl p-5 flex flex-col justify-between items-center shadow-sm relative min-h-[300px] overflow-hidden w-full">
                              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block font-bold mb-3 self-start">
                                Asset Allocation (By Scheme)
                              </span>
                              {totalAum > 0 ? (
                                <div className="w-full flex-1 flex flex-col justify-center items-center">
                                  <div className="w-full h-[200px] relative">
                                    <ResponsiveContainer
                                      width="100%"
                                      height="100%"
                                    >
                                      <PieChart>
                                        <Pie
                                          data={pieData}
                                          cx="50%"
                                          cy="50%"
                                          innerRadius={45}
                                          outerRadius={65}
                                          paddingAngle={3}
                                          dataKey="value"
                                        >
                                          {pieData.map((entry, index) => (
                                            <Cell
                                              key={`cell-${index}`}
                                              fill={
                                                SLEEK_COLORS[
                                                  index % SLEEK_COLORS.length
                                                ]
                                              }
                                            />
                                          ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend
                                          layout="horizontal"
                                          verticalAlign="bottom"
                                          align="center"
                                          iconType="circle"
                                          content={({ payload }) => (
                                            <div
                                              data-lenis-prevent
                                              className="flex flex-wrap gap-x-2.5 gap-y-1 justify-center mt-2 max-h-[60px] overflow-y-auto w-full px-1"
                                            >
                                              {payload?.map(
                                                (entry: any, idx: number) => {
                                                  const percentage =
                                                    totalAum > 0
                                                      ? ((pieData[idx]?.value ||
                                                          0) /
                                                          totalAum) *
                                                        100
                                                      : 0;
                                                  return (
                                                    <div
                                                      key={idx}
                                                      className="flex items-center gap-1 text-[9px] text-neutral-600 font-sans font-medium font-bold"
                                                    >
                                                      <span
                                                        className="w-1.5 h-1.5 rounded-full shrink-0"
                                                        style={{
                                                          backgroundColor:
                                                            entry.color,
                                                        }}
                                                      />
                                                      <span
                                                        className="truncate max-w-[90px]"
                                                        title={entry.value}
                                                      >
                                                        {entry.value}
                                                      </span>
                                                      <span className="text-neutral-400 font-mono font-medium">
                                                        ({percentage.toFixed(0)}
                                                        %)
                                                      </span>
                                                    </div>
                                                  );
                                                },
                                              )}
                                            </div>
                                          )}
                                        />
                                      </PieChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-neutral-400 text-xs font-sans py-12">
                                  No asset allocation valuation found.
                                </div>
                              )}
                            </div>

                            {/* Chart 2: Category Allocation */}
                            <div className="bg-white/40 border border-border/30 rounded-2xl p-5 flex flex-col justify-between items-center shadow-sm relative min-h-[300px] overflow-hidden w-full">
                              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block font-bold mb-3 self-start">
                                Category Allocation (By Segment)
                              </span>
                              {totalAum > 0 ? (
                                <div className="w-full flex-1 flex flex-col justify-center items-center">
                                  <div className="w-full h-[200px] relative">
                                    <ResponsiveContainer
                                      width="100%"
                                      height="100%"
                                    >
                                      <PieChart>
                                        <Pie
                                          data={categoryPieData}
                                          cx="50%"
                                          cy="50%"
                                          innerRadius={45}
                                          outerRadius={65}
                                          paddingAngle={3}
                                          dataKey="value"
                                        >
                                          {categoryPieData.map(
                                            (entry, index) => (
                                              <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                  SLEEK_COLORS[
                                                    (index + 3) %
                                                      SLEEK_COLORS.length
                                                  ]
                                                }
                                              />
                                            ),
                                          )}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend
                                          layout="horizontal"
                                          verticalAlign="bottom"
                                          align="center"
                                          iconType="circle"
                                          content={({ payload }) => (
                                            <div
                                              data-lenis-prevent
                                              className="flex flex-wrap gap-x-2.5 gap-y-1 justify-center mt-2 max-h-[60px] overflow-y-auto w-full px-1"
                                            >
                                              {payload?.map(
                                                (entry: any, idx: number) => {
                                                  const percentage =
                                                    totalAum > 0
                                                      ? ((categoryPieData[idx]
                                                          ?.value || 0) /
                                                          totalAum) *
                                                        100
                                                      : 0;
                                                  return (
                                                    <div
                                                      key={idx}
                                                      className="flex items-center gap-1 text-[9px] text-neutral-600 font-sans font-medium font-bold"
                                                    >
                                                      <span
                                                        className="w-1.5 h-1.5 rounded-full shrink-0"
                                                        style={{
                                                          backgroundColor:
                                                            entry.color,
                                                        }}
                                                      />
                                                      <span
                                                        className="truncate max-w-[90px]"
                                                        title={entry.value}
                                                      >
                                                        {entry.value}
                                                      </span>
                                                      <span className="text-neutral-400 font-mono font-medium">
                                                        ({percentage.toFixed(0)}
                                                        %)
                                                      </span>
                                                    </div>
                                                  );
                                                },
                                              )}
                                            </div>
                                          )}
                                        />
                                      </PieChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-neutral-400 text-xs font-sans py-12">
                                  No category allocation valuation found.
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Table List (rendered on bottom, full-width) */}
                          <div className="border border-border/30 bg-white/40 rounded-2xl overflow-hidden font-sans text-xs flex flex-col w-full">
                            <div className="overflow-x-auto w-full">
                              <table className="w-full text-left text-neutral-900">
                                <thead>
                                  <tr className="bg-white/60 border-b border-border/20 text-neutral-500 font-bold font-mono text-[9px] uppercase tracking-wider">
                                    <th className="px-4 py-3">
                                      Scheme / Fund Name
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                      Invested
                                    </th>
                                    <th className="px-4 py-3 text-right font-sans">
                                      Current Value
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border/10">
                                  {groupedList.map((scheme: any) => {
                                    const profitLossPercent =
                                      scheme.invested > 0
                                        ? ((scheme.current - scheme.invested) /
                                            scheme.invested) *
                                          100
                                        : 0;
                                    const isProfit =
                                      scheme.current - scheme.invested >= 0;

                                    return (
                                      <tr
                                        key={scheme.schemeName}
                                        className="hover:bg-white/20 transition duration-150"
                                      >
                                        <td className="px-4 py-3.5">
                                          <div className="font-semibold text-neutral-900 leading-snug">
                                            {scheme.schemeName}
                                          </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-right font-mono text-neutral-600">
                                          {scheme.invested > 0
                                            ? `₹${scheme.invested.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                            : '—'}
                                        </td>
                                        <td className="px-4 py-3.5 text-right font-mono">
                                          <span className="font-semibold text-neutral-900 mr-2">
                                            ₹
                                            {scheme.current.toLocaleString(
                                              'en-IN',
                                              {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                              },
                                            )}
                                          </span>
                                          {scheme.invested > 0 ? (
                                            <span
                                              className={`text-[10px] font-mono font-bold ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}
                                            >
                                              ({isProfit ? '+' : ''}
                                              {profitLossPercent.toFixed(2)}%)
                                            </span>
                                          ) : (
                                            <span className="text-[10px] font-mono font-medium text-neutral-400">
                                              (—)
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* 1-Click Booking Widget */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-6 space-y-4 max-w-none animate-in fade-in duration-300">
              <div className="flex justify-between items-center border-b border-border/20 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  Book Portfolio Review
                </h3>
                <span className="text-[9px] font-mono text-neutral-400">
                  1-CLICK
                </span>
              </div>

              <p className="text-[11px] text-neutral-500 font-sans leading-relaxed">
                Book a priority 1-on-1 strategy session with our distribution
                representatives. Free of charge for active clients.
              </p>

              <div className="space-y-1">
                <label
                  htmlFor="booking-time-slot"
                  className="text-[10px] uppercase font-bold text-neutral-500 block font-mono"
                >
                  Select Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="booking-time-slot"
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full p-2.5 text-xs border border-border/40 rounded-xl bg-white/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-neutral-900 font-sans cursor-pointer"
                />
              </div>

              <div className="p-3 bg-neutral-900/5 rounded-2xl flex justify-between items-center text-xs">
                <span className="text-neutral-500 font-semibold">
                  Total Price
                </span>
                <span className="text-emerald-600 font-bold text-sm">Free</span>
              </div>

              <button
                onClick={handleClientBookCall}
                disabled={apiLoading}
                className="w-full py-3 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer shadow-lg disabled:opacity-40"
              >
                {apiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Booking...</span>
                  </>
                ) : (
                  <>
                    <span>Book Call Instantly</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {clientBookings.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/20">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
                    Active Bookings
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {clientBookings.map((b, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-emerald-50 border border-emerald-500/10 text-emerald-800 text-[10px] rounded-xl flex items-start gap-2 leading-relaxed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 mt-0.5" />
                        <span className="font-sans">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Portfolio Diagnostics Board */}
            {scoreReport && (
              <div className="bg-white/50 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-6 space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/20 pb-4 gap-3">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-neutral-900 font-clash">
                      Unlimited Portfolio Diagnostics
                    </h3>
                    <p className="text-neutral-500 text-xs font-sans">
                      Analyze asset diversification and scoring telemetry as
                      many times as you like.
                    </p>
                  </div>
                  {scoreReport && (
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-xl border text-xs font-bold font-mono ${getScoreColor(scoreReport.total)}`}
                      >
                        Score: {scoreReport.total}/100
                      </span>
                      <button
                        onClick={() => setViewFullReport(!viewFullReport)}
                        className="px-3 py-1.5 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-xs rounded-xl transition cursor-pointer font-sans"
                      >
                        {viewFullReport ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Score Report breakdown details view (if toggled) */}
                {scoreReport && viewFullReport && (
                  <div className="space-y-6 p-5 bg-white/40 border border-white/20 rounded-2xl animate-in fade-in duration-300 font-sans text-xs">
                    <div className="text-center max-w-sm mx-auto space-y-3">
                      {/* Large Score Display */}
                      <div className="flex flex-col items-center justify-center space-y-0.5">
                        <div className="text-5xl font-bold font-mono tracking-tight text-neutral-900 flex items-baseline gap-0.5">
                          <span>{scoreReport.total}</span>
                          <span className="text-neutral-400 text-sm font-sans font-semibold">
                            /100
                          </span>
                        </div>
                        <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-widest block font-semibold">
                          Overall Score
                        </span>
                      </div>

                      <div className="pt-3 border-t border-border/20 space-y-1">
                        <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                          Diagnostics Level
                        </span>
                        <div className="text-lg font-bold text-neutral-900">
                          {getTagLabel(scoreReport.tag)}
                        </div>
                        <p className="text-[10px] text-neutral-500 leading-normal">
                          {getTagDesc(scoreReport.tag)}
                        </p>
                      </div>
                    </div>

                    {/* Gauges */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="p-3 bg-white/50 border border-white/30 rounded-xl space-y-1">
                        <span className="text-[9px] text-neutral-500 block uppercase tracking-wider">
                          Goal Alignment
                        </span>
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-sm font-semibold text-neutral-900">
                            {scoreReport.goalAlignment}/20
                          </span>
                          <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{
                                width: `${(scoreReport.goalAlignment / 20) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-white/50 border border-white/30 rounded-xl space-y-1">
                        <span className="text-[9px] text-neutral-500 block uppercase tracking-wider">
                          Asset Allocation
                        </span>
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-sm font-semibold text-neutral-900">
                            {scoreReport.assetAlloc}/20
                          </span>
                          <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: `${(scoreReport.assetAlloc / 20) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-white/50 border border-white/30 rounded-xl space-y-1">
                        <span className="text-[9px] text-neutral-500 block uppercase tracking-wider">
                          Diversification
                        </span>
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-sm font-semibold text-neutral-900">
                            {scoreReport.diversification}/20
                          </span>
                          <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{
                                width: `${(scoreReport.diversification / 20) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-white/50 border border-white/30 rounded-xl space-y-1">
                        <span className="text-[9px] text-neutral-500 block uppercase tracking-wider">
                          Discipline
                        </span>
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-sm font-semibold text-neutral-900">
                            {scoreReport.discipline}/20
                          </span>
                          <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-pink-500 rounded-full"
                              style={{
                                width: `${(scoreReport.discipline / 20) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Fund Comparison / Gap Analysis Telemetry */}
                    {(() => {
                      const comparison = !Array.isArray(scoreReport.insights)
                        ? scoreReport.insights?.comparison
                        : null;

                      if (!comparison) return null;

                      return (
                        <div className="space-y-4 pt-4 border-t border-border/20 text-left animate-in fade-in duration-300">
                          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block font-bold text-neutral-800">
                            Growth Gap & Achievable Performance
                          </span>

                          {/* Detail Table */}
                          <div className="border border-border/30 bg-white/40 rounded-2xl overflow-hidden font-sans text-[11px] mt-4">
                            {comparison.funds.length === 0 ? (
                              <div className="p-8 text-center space-y-2 bg-emerald-50/20">
                                <div className="text-2xl text-emerald-600 font-bold">
                                  🏆
                                </div>
                                <span className="font-semibold block text-neutral-900 text-xs">
                                  Optimal Performance Achieved!
                                </span>
                                <p className="text-[10px] text-neutral-500 max-w-sm mx-auto leading-relaxed">
                                  Your current selection of mutual funds is
                                  fully outperforming or matching the historical
                                  1-year returns of top-tier active category
                                  leaders. You have no growth gap!
                                </p>
                              </div>
                            ) : (
                              <div className="overflow-x-auto w-full">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="bg-neutral-50 border-b border-border/20 text-neutral-500 font-mono text-[9px] uppercase tracking-wider">
                                      <th className="py-2.5 px-4 font-semibold">
                                        Fund Name
                                      </th>
                                      <th className="py-2.5 px-4 font-semibold text-center">
                                        Tenure Return
                                      </th>
                                      <th className="py-2.5 px-4 font-semibold text-right">
                                        Benchmark Option
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-border/10 text-neutral-700">
                                    {comparison.funds.map(
                                      (f: any, idx: number) => {
                                        const detectCategory = (
                                          name: string,
                                        ): string => {
                                          const n = name.toLowerCase();
                                          if (
                                            n.includes('liquid') ||
                                            n.includes('overnight') ||
                                            n.includes('money market')
                                          )
                                            return 'liquid';
                                          if (
                                            n.includes('small cap') ||
                                            n.includes('smallcap') ||
                                            n.includes('small-cap')
                                          )
                                            return 'small_cap';
                                          if (
                                            n.includes('mid cap') ||
                                            n.includes('midcap') ||
                                            n.includes('mid-cap')
                                          )
                                            return 'mid_cap';
                                          if (
                                            n.includes('large cap') ||
                                            n.includes('largecap') ||
                                            n.includes('large-cap') ||
                                            n.includes('bluechip') ||
                                            n.includes('blue chip') ||
                                            n.includes('top 100') ||
                                            n.includes('top 200')
                                          )
                                            return 'large_cap';
                                          if (
                                            n.includes('flexi cap') ||
                                            n.includes('flexicap') ||
                                            n.includes('flexi-cap') ||
                                            n.includes('multicap') ||
                                            n.includes('multi cap') ||
                                            n.includes('multi-cap')
                                          )
                                            return 'flexi_cap';
                                          if (
                                            n.includes('elss') ||
                                            n.includes('tax') ||
                                            n.includes('tax saver') ||
                                            n.includes('tax saving')
                                          )
                                            return 'elss';
                                          if (
                                            n.includes('balanced') ||
                                            n.includes('hybrid') ||
                                            n.includes('aggressive') ||
                                            n.includes('conservative') ||
                                            n.includes('dynamic asset') ||
                                            n.includes('equity saving')
                                          )
                                            return 'balanced';
                                          if (
                                            n.includes('debt') ||
                                            n.includes('bond') ||
                                            n.includes('gilt') ||
                                            n.includes('corporate') ||
                                            n.includes('short duration') ||
                                            n.includes('medium duration') ||
                                            n.includes('long duration') ||
                                            n.includes('credit risk') ||
                                            n.includes('banking & psu') ||
                                            n.includes('fixed maturity') ||
                                            n.includes('ultra short') ||
                                            n.includes('low duration') ||
                                            n.includes('floater')
                                          )
                                            return 'debt';
                                          if (
                                            n.includes('index') ||
                                            n.includes('nifty') ||
                                            n.includes('sensex') ||
                                            n.includes('etf')
                                          )
                                            return 'index';
                                          return 'flexi_cap';
                                        };

                                        const CATEGORY_TOP_FUNDS: Record<
                                          string,
                                          string
                                        > = {
                                          large_cap: 'HDFC Top 100 Fund Growth',
                                          mid_cap:
                                            'Motilal Oswal Midcap Fund Growth',
                                          small_cap:
                                            'Nippon India Small Cap Fund Growth',
                                          flexi_cap:
                                            'Parag Parikh Flexi Cap Fund Growth',
                                          multi_cap:
                                            'Parag Parikh Flexi Cap Fund Growth',
                                          elss: 'SBI Long Term Equity Fund Growth (ELSS)',
                                          balanced:
                                            'ICICI Prudential Equity & Debt Fund Growth',
                                          debt: 'HDFC Medium Term Debt Fund Growth',
                                          index:
                                            'UTI Nifty 50 Index Fund Growth',
                                          liquid: 'SBI Liquid Fund Growth',
                                          default:
                                            'Parag Parikh Flexi Cap Fund Growth',
                                        };

                                        const matchingRow =
                                          activePortfolio?.rows?.find(
                                            (row: any) =>
                                              f.fundName
                                                ? row.fundName === f.fundName
                                                : detectCategory(
                                                    row.fundName,
                                                  ) === f.category,
                                          );
                                        const matchingFolio =
                                          unifiedFolios?.find((fol: any) =>
                                            f.fundName
                                              ? fol.schemeName === f.fundName
                                              : detectCategory(
                                                  fol.schemeName,
                                                ) === f.category,
                                          );

                                        const investedAmt =
                                          matchingRow?.invested ||
                                          matchingFolio?.purchaseValue ||
                                          f.invested ||
                                          0;
                                        const currentValAmt =
                                          matchingRow?.currentValue ||
                                          matchingFolio?.aum ||
                                          0;

                                        const tenureReturn =
                                          matchingRow || matchingFolio
                                            ? investedAmt > 0
                                              ? ((currentValAmt - investedAmt) /
                                                  investedAmt) *
                                                100
                                              : 0
                                            : typeof f.tenureReturn === 'number'
                                              ? f.tenureReturn
                                              : f.currentReturn;
                                        const isProfit = tenureReturn >= 0;

                                        const actualFundName =
                                          matchingRow?.fundName ||
                                          matchingFolio?.schemeName ||
                                          f.fundName ||
                                          f.category
                                            .replace('_', ' ')
                                            .replace(/\b\w/g, (c: string) =>
                                              c.toUpperCase(),
                                            ) + ' Fund';
                                        const bestFundName =
                                          f.bestFundName ||
                                          CATEGORY_TOP_FUNDS[f.category] ||
                                          CATEGORY_TOP_FUNDS['default'];

                                        return (
                                          <tr
                                            key={idx}
                                            className="hover:bg-white/10 transition-colors"
                                          >
                                            <td className="py-3.5 px-4 font-semibold text-neutral-900 leading-snug">
                                              {actualFundName}
                                            </td>
                                            <td className="py-3.5 px-4 text-center font-mono font-bold">
                                              <span
                                                className={
                                                  isProfit
                                                    ? 'text-emerald-600'
                                                    : 'text-rose-600'
                                                }
                                              >
                                                {isProfit ? '+' : ''}
                                                {tenureReturn.toFixed(2)}%
                                              </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                              <div className="text-xs text-emerald-600 font-mono font-bold">
                                                {f.bestReturn.toFixed(1)}%
                                                Return
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      },
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Portfolio Benchmarking */}
            {(userPortfolios.length > 0 || (existingClientData && (existingClientData.aum || existingClientData.currentValue || 0) > 0)) && (
              <div className="bg-white/50 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-6 space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/20 pb-4 gap-3">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-neutral-900 font-clash">
                      Portfolio Benchmarking
                    </h3>
                    <p className="text-neutral-500 text-xs font-sans">
                      Compare your portfolio against Nifty TRI indices and category averages with risk-adjusted metrics.
                    </p>
                  </div>
                </div>
                <BenchmarkTab
                  userPortfolios={userPortfolios}
                  clientData={existingClientData && (existingClientData.aum || existingClientData.currentValue || 0) > 0 ? {
                    id: existingClientData.id,
                    name: existingClientData.name,
                    pan: existingClientData.pan,
                    email: existingClientData.email,
                    mobile: existingClientData.mobile,
                    aum: existingClientData.aum || existingClientData.currentValue || 0,
                  } : null}
                  report={benchmarkReport}
                  loading={benchmarkLoading}
                  error={benchmarkError}
                  timeframe={benchmarkTimeframe}
                  onFetchBenchmark={handleFetchBenchmark}
                  onTimeframeChange={setBenchmarkTimeframe}
                />
              </div>
            )}

            {/* Current Investments / Holdings Card */}
            {activePortfolio &&
              activePortfolio.rows &&
              activePortfolio.rows.length > 0 &&
              !hasActivePortfolioData && (
                <div className="bg-white/50 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-6 space-y-4 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center border-b border-border/20 pb-2">
                    <h3 className="text-sm font-bold font-clash text-neutral-800 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-primary" />
                      Current Investment Holdings ({activePortfolio.rows.length}
                      )
                    </h3>
                    <span className="text-[10px] font-mono text-neutral-400">
                      Uploaded via {activePortfolio.uploadType}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-500 font-sans leading-relaxed">
                    Below are the current holdings you submitted during your
                    portfolio assessment.
                  </p>

                  <div className="border border-border/30 bg-white/40 rounded-2xl overflow-hidden font-sans text-xs">
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left text-neutral-900">
                        <thead>
                          <tr className="bg-white/60 border-b border-border/20 text-neutral-500 font-bold font-mono text-[9px] uppercase tracking-wider">
                            <th className="px-4 py-3">Fund Name</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3 text-right">Invested</th>
                            <th className="px-4 py-3 text-right">
                              Current Value
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/10 font-sans">
                          {activePortfolio.rows.map((row: any) => (
                            <tr
                              key={row.id}
                              className="hover:bg-white/20 transition duration-150"
                            >
                              <td
                                className="px-4 py-3 font-semibold text-neutral-900 truncate max-w-[200px]"
                                title={row.fundName}
                              >
                                {row.fundName}
                              </td>
                              <td className="px-4 py-3 text-neutral-500 font-mono text-[10px]">
                                {row.type}
                              </td>
                              <td className="px-4 py-3 text-right text-neutral-900 font-mono">
                                ₹
                                {row.invested.toLocaleString('en-IN', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                              <td className="px-4 py-3 text-right text-neutral-900 font-semibold font-mono">
                                ₹
                                {row.currentValue.toLocaleString('en-IN', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            {/* Support Workspace */}
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Header info */}
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900 font-clash">
                  Support Workspace
                </h2>
                <p className="text-xs text-neutral-500 font-mono mt-1">
                  Raise support tickets directly with AMFI-Registered Wealth
                  managers
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Form to submit query */}
                <div className="lg:col-span-5 bg-white/35 backdrop-blur-xl border border-border rounded-3xl p-6 md:p-8 shadow-md space-y-6 text-left">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-border/50">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    <span className="font-chillax font-bold tracking-wider text-xs uppercase text-neutral-500">
                      Raise New Query
                    </span>
                  </div>

                  <form onSubmit={handleQuerySubmit} className="space-y-4">
                    {queryError && (
                      <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-[11px] font-sans">
                        {queryError}
                      </div>
                    )}

                    {querySuccess && (
                      <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-[11px] font-sans">
                        Your query has been submitted successfully! We will get
                        back to you shortly.
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">
                        Subject / Topic
                      </label>
                      <input
                        type="text"
                        required
                        value={querySubject}
                        onChange={(e) => setQuerySubject(e.target.value)}
                        placeholder="e.g. Portfolio rebalancing concern"
                        className="w-full bg-white/40 border border-border rounded-xl p-3 text-xs text-foreground placeholder-slate-400 focus:outline-none focus:border-primary font-sans transition duration-200"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">
                        Detail Description
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={queryMessage}
                        onChange={(e) => setQueryMessage(e.target.value)}
                        placeholder="Please provide the details of your inquiry..."
                        className="w-full bg-white/40 border border-border rounded-xl p-3 text-xs text-foreground placeholder-slate-400 focus:outline-none focus:border-primary font-sans transition duration-200 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingQuery}
                      className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 select-none"
                    >
                      {submittingQuery ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Submitting query...</span>
                        </>
                      ) : (
                        <span>Submit Query</span>
                      )}
                    </button>
                  </form>
                </div>

                {/* Right Column: Past queries list */}
                <div className="lg:col-span-7 bg-white/35 backdrop-blur-xl border border-border rounded-3xl p-6 md:p-8 shadow-md space-y-6 text-left">
                  <div className="flex items-center justify-between pb-3 border-b border-border/50">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="font-chillax font-bold tracking-wider text-xs uppercase text-neutral-500">
                        Query History
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 font-bold bg-neutral-100 px-2 py-0.5 rounded-full">
                      {supportQueries.length} Total
                    </span>
                  </div>

                  {fetchingQueries ? (
                    <div className="py-16 text-center text-xs text-neutral-500 font-mono flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-5 h-5 text-neutral-950 animate-spin" />
                      <span>Loading queries...</span>
                    </div>
                  ) : supportQueries.length === 0 ? (
                    <div className="py-16 text-center text-xs text-neutral-500 font-mono">
                      No support queries raised yet. Fill out the form on the
                      left to start.
                    </div>
                  ) : (
                    <div
                      data-lenis-prevent
                      className="space-y-4 max-h-[420px] overflow-y-auto pr-1"
                    >
                      {supportQueries.map((query) => (
                        <div
                          key={query.id}
                          className="border border-neutral-100 bg-white/50 rounded-2xl p-4 space-y-3 shadow-sm hover:shadow transition duration-200"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h4 className="font-bold text-neutral-900 text-sm leading-snug">
                                {query.subject}
                              </h4>
                              <span className="text-[9px] font-mono text-neutral-400 block mt-1">
                                Submitted on{' '}
                                {new Date(query.createdAt).toLocaleString(
                                  'en-IN',
                                )}
                              </span>
                            </div>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-wider ${
                                query.status === 'RESOLVED'
                                  ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                              }`}
                            >
                              {query.status}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 leading-relaxed font-sans whitespace-pre-line bg-neutral-50/50 p-3 rounded-xl border border-neutral-100/50">
                            {query.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Daily Wisdom card */}
            <div className="w-full p-8 rounded-3xl bg-gradient-to-br from-amber-100/40 via-white/30 to-amber-500/10 backdrop-blur-2xl border border-amber-500/30 shadow-[0_20px_50px_rgba(245,158,11,0.12)] flex flex-col justify-between items-center text-center overflow-hidden relative min-h-[220px] animate-in fade-in duration-300">
              {/* Decorative glowing background gradients */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

              {/* Floating typographic quotes */}
              <span className="absolute left-6 top-12 text-7xl font-serif text-amber-500/10 leading-none pointer-events-none select-none">
                “
              </span>
              <span className="absolute right-6 bottom-12 text-7xl font-serif text-amber-500/10 leading-none pointer-events-none select-none">
                ”
              </span>

              <div className="w-full flex justify-between items-center border-b border-amber-500/10 pb-2 relative z-10">
                <span className="text-[9px] font-mono text-amber-700 tracking-widest uppercase font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600 animate-pulse" />
                  Daily Wisdom
                </span>
                <span className="text-[9px] font-mono text-amber-600/60 uppercase font-bold">
                  ACTIVE FOR 24H
                </span>
              </div>

              <div className="my-auto py-6 relative z-10">
                <p className="text-base md:text-lg font-medium italic leading-relaxed text-neutral-900 font-clash">
                  "{quotesList[new Date().getDate() % quotesList.length]?.text}"
                </p>
                <span className="block text-right text-[10px] text-amber-700 font-mono mt-2 mr-4 font-bold tracking-wider">
                  —{' '}
                  {quotesList[new Date().getDate() % quotesList.length]?.author}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booking Success Modal Overlay */}
      {showBookingSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white/90 border border-white/40 rounded-3xl p-8 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-500/20 flex items-center justify-center text-emerald-600 mx-auto">
              <ShieldCheck className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide font-clash">
                Call Booked Successfully!
              </h2>
              <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                Your 1-on-1 premium portfolio review discussion is scheduled.
                Our AMFI-registered distributor will contact you within 24 hours
                at{' '}
                <strong className="text-neutral-800 font-mono font-medium">
                  {userData?.phone || 'your registered number'}
                </strong>
                .
              </p>
            </div>
            <button
              onClick={() => setShowBookingSuccess(false)}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold text-xs rounded-xl hover:bg-primary/95 transition cursor-pointer font-sans"
            >
              Back to Client Portal
            </button>
          </div>
        </div>
      )}

      {/* Analysis Completed Modal Overlay */}
      {showAnalysisCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white/90 border border-white/40 rounded-3xl p-8 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-500/20 flex items-center justify-center text-emerald-600 mx-auto">
              <CheckCircle2 className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide font-clash font-bold">
                Analysis Completed!
              </h2>
              <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                Your portfolio has been analyzed successfully. We have computed
                your XIRR, asset allocation, and overall portfolio score.
              </p>
            </div>
            <button
              onClick={() => setShowAnalysisCompleted(false)}
              className="w-full py-3 bg-[#3A8293] hover:bg-[#3A8293]/90 text-white font-semibold text-xs rounded-xl transition cursor-pointer font-sans font-bold"
            >
              View Portfolio Report
            </button>
          </div>
        </div>
      )}

      {/* Logout Warning Modal Overlay */}
      {showLogoutWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-neutral-900/10"
            onClick={() => setShowLogoutWarning(false)}
          />
          <div className="relative z-[70] bg-white/95 border border-white/40 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl backdrop-blur-xl flex flex-col items-center text-center overflow-hidden animate-in fade-in zoom-in-95 duration-200 space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-neutral-900 tracking-wide font-clash">
                Sign Out Warning
              </h2>
              <p className="text-neutral-500 text-xs font-sans leading-relaxed">
                Are you sure you want to sign out? You will need to log in again
                to access your premium client workspace, live AUM details, and
                portfolio telemetry reports.
              </p>
            </div>
            <div className="flex gap-4 w-full">
              <button
                type="button"
                onClick={() => setShowLogoutWarning(false)}
                className="flex-1 py-3 text-xs font-semibold border border-neutral-200 bg-white hover:bg-neutral-50 rounded-xl transition duration-200 text-neutral-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutWarning(false);
                  handleSignOut();
                }}
                className="flex-1 py-3 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition duration-200 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chatbot Widget */}
      <ChatbotWidget />

      {/* Footer */}
      <Footer />
    </main>
  );
}
