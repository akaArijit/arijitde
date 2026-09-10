'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  Users,
  User,
  PhoneCall,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  UserCheck,
  TrendingUp,
  Sparkles,
  Calendar,
  ShieldCheck,
  Compass,
  LogOut,
  FileText,
  ChevronRight,
  X,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  Loader2,
  FileSpreadsheet,
  Plus,
  Trash2,
  Save,
  Eye,
  HelpCircle,
  Bell,
  LayoutGrid,
  BarChart2,
} from 'lucide-react';
import { BenchmarkTab } from '@/components/admin/BenchmarkTab';

// Goal Mapping helper
const GOAL_LABELS: Record<string, { label: string; desc: string; icon: any }> =
  {
    WEALTH_CREATION: {
      label: 'Wealth Creation',
      desc: 'Long-term compounding to build a substantial corpus',
      icon: Sparkles,
    },
    RETIREMENT: {
      label: 'Retirement Planning',
      desc: 'Securing financial independence for your post-work years',
      icon: ShieldCheck,
    },
    HOUSE_PURCHASE: {
      label: 'House Purchase',
      desc: 'Saving for a dream home',
      icon: TrendingUp,
    },
    CHILD_EDUCATION: {
      label: 'Child Education',
      desc: "Building a corpus for children's education",
      icon: Calendar,
    },
    MARRIAGE: {
      label: 'Marriage',
      desc: 'Funding an upcoming marriage',
      icon: Sparkles,
    },
    PASSIVE_INCOME: {
      label: 'Passive Income',
      desc: 'Generate steady returns from investments',
      icon: TrendingUp,
    },
    TAX_SAVING: {
      label: 'Tax Saving',
      desc: 'Optimizing investments for tax efficiency',
      icon: ShieldCheck,
    },
    NOT_SURE_YET: {
      label: 'Not Sure Yet',
      desc: 'Exploring and learning about investment options',
      icon: Compass,
    },
    // Legacy
    SHORT_TERM: {
      label: 'Short-Term Goals',
      desc: 'Funding immediate capital needs (1-3 years)',
      icon: Calendar,
    },
    LONG_TERM: {
      label: 'Long-Term Goals',
      desc: "Buying a house, children's education, or other major plans",
      icon: TrendingUp,
    },
    EXPLORING: {
      label: 'Exploring Markets',
      desc: 'Learning options and testing investment strategies',
      icon: Compass,
    },
  };

const DetailField = ({ label, value }: { label: string; value: any }) => (
  <div className="border-b border-neutral-100 py-2.5 last:border-0">
    <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block">
      {label}
    </span>
    <span className="text-xs font-semibold text-neutral-800 break-all">
      {value || 'N/A'}
    </span>
  </div>
);

const CHART_COLORS = [
  '#09090b', // Zinc 950 (Main Accent)
  '#3b82f6', // Blue 500
  '#10b981', // Emerald 500
  '#f59e0b', // Amber 500
  '#6366f1', // Indigo 500
  '#8b5cf6', // Violet 500
  '#ec4899', // Pink 500
];

function formatDob(val: string | null | undefined): string {
  if (!val) return 'Not provided';
  const trimmed = val.trim();
  if (/^\d+$/.test(trimmed)) {
    const serial = parseInt(trimmed, 10);
    const msPerDay = 24 * 60 * 60 * 1000;
    const d = new Date((serial - 25569) * msPerDay);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }

  // If it matches DD/MM/YYYY already, return it
  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(trimmed)) {
    return trimmed.replace(/-/g, '/');
  }

  // Parse generic ISO or date format
  const dateObj = new Date(trimmed);
  if (!isNaN(dateObj.getTime())) {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return trimmed;
}

function formatExcelDate(val: string | null | undefined): string {
  if (!val) return 'N/A';
  const trimmed = val.trim();
  if (/^\d+$/.test(trimmed)) {
    const serial = parseInt(trimmed, 10);
    const msPerDay = 24 * 60 * 60 * 1000;
    const d = new Date((serial - 25569) * msPerDay);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }

  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(trimmed)) {
    return trimmed.replace(/-/g, '/');
  }

  const dateObj = new Date(trimmed);
  if (!isNaN(dateObj.getTime())) {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return trimmed;
}

export default function AdminDashboard() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Dashboard Stage & Data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClients: 0,
    totalLeads: 0,
    attendedLeads: 0,
    totalFolios: 0,
    totalExistingClients: 0,
    totalPortfolioValuations: 0,
    totalAUM: 0,
  });
  const [usersList, setUsersList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    | 'users'
    | 'existingClients'
    | 'consultations'
    | 'aum'
    | 'liveSessions'
    | 'queries'
    | 'benchmarking'
  >('users');

  // Support queries states
  const [supportQueries, setSupportQueries] = useState<any[]>([]);
  const [fetchingQueries, setFetchingQueries] = useState(false);
  const [resolvingQueryId, setResolvingQueryId] = useState<string | null>(null);

  // Live Portfolio Review Discussion Queue state variables
  const [advisorySessions, setAdvisorySessions] = useState<any[]>([]);
  const [loadingAdvisory, setLoadingAdvisory] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [confirmedSlotInput, setConfirmedSlotInput] = useState('');
  const [meetLinkInput, setMeetLinkInput] = useState('');
  const [portfolioNotesInput, setPortfolioNotesInput] = useState('');
  const [updatingSession, setUpdatingSession] = useState(false);

  // Folio state variables
  const [uploadingFolioFile, setUploadingFolioFile] = useState(false);

  // Existing Client state variables
  const [existingClientsList, setExistingClientsList] = useState<any[]>([]);
  const [existingClientsPagination, setExistingClientsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [existingClientsSearchQuery, setExistingClientsSearchQuery] =
    useState('');
  const [existingClientsPage, setExistingClientsPage] = useState(1);
  const [fetchingExistingClients, setFetchingExistingClients] = useState(false);
  const [selectedExistingClient, setSelectedExistingClient] =
    useState<any>(null);
  const [uploadingExistingClientFile, setUploadingExistingClientFile] =
    useState(false);
  const [deletingClient, setDeletingClient] = useState(false);
  // Portfolio Valuation state variables
  const [portfolioValuationsList, setPortfolioValuationsList] = useState<any[]>(
    [],
  );
  const [portfolioValuationsPagination, setPortfolioValuationsPagination] =
    useState({
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    });
  const [portfolioValuationsSearchQuery, setPortfolioValuationsSearchQuery] =
    useState('');
  const [portfolioValuationsPage, setPortfolioValuationsPage] = useState(1);
  const [fetchingPortfolioValuations, setFetchingPortfolioValuations] =
    useState(false);
  const [selectedPortfolioValuation, setSelectedPortfolioValuation] =
    useState<any>(null);
  const [uploadingPortfolioValuationFile, setUploadingPortfolioValuationFile] =
    useState(false);

  // AUM breakdown state variables
  const [aumData, setAumData] = useState<{ totalAUM: number; schemes: any[] }>({
    totalAUM: 0,
    schemes: [],
  });
  const [aumSearchQuery, setAumSearchQuery] = useState('');
  const [fetchingAumData, setFetchingAumData] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<
    'ALL' | 'GUEST' | 'CLIENT' | 'ADMIN'
  >('ALL');

  // Contact Messages State
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [fetchingContactMessages, setFetchingContactMessages] = useState(false);

  // Detail Drawer State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [advisorNotes, setAdvisorNotes] = useState('');
  const [activePlan, setActivePlan] = useState('PREMIUM');
  const [pan, setPan] = useState('');
  const [savingClientProfile, setSavingClientProfile] = useState(false);
  const [updatingUserRole, setUpdatingUserRole] = useState<string | null>(null);

  // Lock body scroll when drawers are open to prevent background scrolling (scroll chaining)
  useEffect(() => {
    if (selectedExistingClient || selectedUser) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedExistingClient, selectedUser]);

  // Lead status updating state
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [leadStatus, setLeadStatus] = useState<
    'NEW' | 'CONTACTED' | 'CONVERTED'
  >('NEW');
  const [leadNotes, setLeadNotes] = useState('');
  const [savingLeadStatus, setSavingLeadStatus] = useState(false);

  // Availability state variables
  const [availabilitySlots, setAvailabilitySlots] = useState<string[]>([]);
  const [newSlotDateTime, setNewSlotDateTime] = useState<string>('');
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [fetchingAvailability, setFetchingAvailability] = useState(false);

  const [screenshotModalUrl, setScreenshotModalUrl] = useState<string | null>(
    null,
  );

  // Notification center state variables
  const [lastCsvUploadDate, setLastCsvUploadDate] = useState<string | null>(
    null,
  );
  const [showCsvReminder, setShowCsvReminder] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] =
    useState(false);

  // Custom Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    danger?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    danger: false,
  });

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // 1. Auth Guard and token initialisation
  useEffect(() => {
    setMounted(true);
    document.title = 'Admin Workspace | FinAnalysis';
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!savedToken || !savedUser) {
      window.location.href = '/onboarding';
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      setToken(savedToken);
      setAdminUser(parsedUser);
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/onboarding';
    }
  }, []);

  // 1b. Check for CSV Upload reminder (14 days threshold)
  useEffect(() => {
    const checkCsvReminder = () => {
      const lastUpload = localStorage.getItem('lastClientCsvUploadDate');
      const lastSkip = localStorage.getItem('skippedReminderDate');
      setLastCsvUploadDate(lastUpload);

      if (lastUpload) {
        const uploadTime = new Date(lastUpload).getTime();
        const now = new Date().getTime();
        const diffDays = (now - uploadTime) / (1000 * 60 * 60 * 24);

        if (diffDays >= 14) {
          const cyclesSinceUploadForNow = Math.floor(diffDays / 14);

          let cyclesSinceUploadForSkip = -1;
          if (lastSkip) {
            const skipTime = new Date(lastSkip).getTime();
            const diffDaysForSkip =
              (skipTime - uploadTime) / (1000 * 60 * 60 * 24);
            cyclesSinceUploadForSkip = Math.floor(diffDaysForSkip / 14);
          }

          if (cyclesSinceUploadForNow > cyclesSinceUploadForSkip) {
            setShowCsvReminder(true);
          } else {
            setShowCsvReminder(false);
          }
        } else {
          setShowCsvReminder(false);
        }
      } else {
        // If there's no upload at all, trigger reminder to upload first client CSV
        setShowCsvReminder(true);
      }
    };

    checkCsvReminder();
    const interval = setInterval(checkCsvReminder, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSkipReminder = () => {
    localStorage.setItem('skippedReminderDate', new Date().toISOString());
    setShowCsvReminder(false);
  };

  // 2. Fetch Data when token is ready
  useEffect(() => {
    if (!token) return;
    fetchAdminData(true);
  }, [token]);

  const handleFolioFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFolioFile(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${backendUrl}/api/admin/folios/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to upload folio records');
      }

      alert(
        resData.message || 'Folio holdings imported and matched successfully!',
      );
      existingClientsPage === 1
        ? fetchExistingClients(1, existingClientsSearchQuery)
        : setExistingClientsPage(1);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to upload file');
    } finally {
      setUploadingFolioFile(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleClearFolios = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Folio Database',
      message:
        'Are you absolutely sure you want to delete all folio records? This action is irreversible and will permanently wipe the imported folio database.',
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`${backendUrl}/api/admin/folios/clear`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const resData = await res.json();
          if (!res.ok)
            throw new Error(resData.error || 'Failed to clear folio records');

          alert(resData.message || 'All folio records deleted.');
          existingClientsPage === 1
            ? fetchExistingClients(1, existingClientsSearchQuery)
            : setExistingClientsPage(1);
          await fetchAdminData();
        } catch (err: any) {
          alert(err.message || 'Failed to clear records');
        }
      },
    });
  };

  const formatAvgHolding = (days: number | null | undefined): string => {
    if (days === null || days === undefined || isNaN(days)) return 'N/A';
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;
    let months = Math.round(remainingDays / 30.417);
    let finalYears = years;
    if (months === 12) {
      finalYears += 1;
      months = 0;
    }
    return `${finalYears}.${months}`;
  };

  const handleViewFolios = (client: any) => {
    setSelectedExistingClient(client);
    setTimeout(() => {
      const el = document.getElementById('admin-folio-details-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  // 3b. Fetch Existing Clients when tab is existingClients or pagination/search changes
  const fetchExistingClients = async (page = 1, search = '') => {
    if (!token) return;
    try {
      setFetchingExistingClients(true);
      const headers = { Authorization: `Bearer ${token}` };
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: '10',
        search: search,
      });

      const res = await fetch(
        `${backendUrl}/api/admin/existing-clients?${queryParams.toString()}`,
        { headers },
      );
      if (!res.ok)
        throw new Error('Failed to retrieve existing client records');

      const resData = await res.json();
      setExistingClientsList(resData.data.clients);
      setExistingClientsPagination(resData.data.pagination);
    } catch (err: any) {
      console.error(err);
      alert(
        err.message ||
          'An unexpected error occurred while fetching existing clients',
      );
    } finally {
      setFetchingExistingClients(false);
    }
  };

  const handleDeleteExistingClient = async (id: string) => {
    if (!token) return;
    if (
      !window.confirm(
        'Are you sure you want to delete this existing client and all associated folios? This action is permanent.',
      )
    ) {
      return;
    }

    try {
      setDeletingClient(true);
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(
        `${backendUrl}/api/admin/existing-clients/${id}`,
        {
          method: 'DELETE',
          headers,
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete client');
      }

      const resData = await res.json();
      alert(resData.message || 'Client successfully deleted.');
      setSelectedExistingClient(null); // Close the drawer
      // Refresh the existing clients list
      fetchExistingClients(existingClientsPage, existingClientsSearchQuery);
    } catch (err: any) {
      console.error(err);
      alert(
        err.message ||
          'An unexpected error occurred while deleting the client.',
      );
    } finally {
      setDeletingClient(false);
    }
  };

  const handleDeleteAdvisorySession = async (id: string) => {
    if (!token) return;
    if (
      !window.confirm(
        'Are you sure you want to delete this session booking? This action is permanent.',
      )
    ) {
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${backendUrl}/api/leads/admin/sessions/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete session');
      }

      const resData = await res.json();
      alert(resData.message || 'Session successfully deleted.');
      fetchAdvisorySessions();
    } catch (err: any) {
      console.error(err);
      alert(
        err.message ||
          'An unexpected error occurred while deleting the session.',
      );
    }
  };

  const handleDeleteQuery = async (id: string) => {
    if (!token) return;
    if (
      !window.confirm(
        'Are you sure you want to delete this query? This action is permanent.',
      )
    ) {
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${backendUrl}/api/admin/queries/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete query');
      }

      const resData = await res.json();
      alert(resData.message || 'Query successfully deleted.');
      fetchAllQueries();
    } catch (err: any) {
      console.error(err);
      alert(
        err.message || 'An unexpected error occurred while deleting the query.',
      );
    }
  };

  useEffect(() => {
    if (activeTab === 'existingClients') {
      fetchExistingClients(existingClientsPage, existingClientsSearchQuery);
    }
  }, [activeTab, existingClientsPage]);

  useEffect(() => {
    if (activeTab !== 'existingClients') return;
    const delayDebounceFn = setTimeout(() => {
      setExistingClientsPage(1);
      fetchExistingClients(1, existingClientsSearchQuery);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [existingClientsSearchQuery]);

  const fetchAumDistribution = async () => {
    if (!token) return;
    try {
      setFetchingAumData(true);
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${backendUrl}/api/admin/aum-distribution`, {
        headers,
      });
      if (!res.ok) throw new Error('Failed to retrieve AUM distribution');
      const resData = await res.json();
      setAumData(resData.data);
    } catch (err: any) {
      console.error(err);
      alert(
        err.message ||
          'An unexpected error occurred while fetching AUM distribution',
      );
    } finally {
      setFetchingAumData(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'aum') {
      fetchAumDistribution();
    }
  }, [activeTab]);

  const fetchAllQueries = async () => {
    if (!token) return;
    try {
      setFetchingQueries(true);
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${backendUrl}/api/admin/queries`, { headers });
      if (!res.ok) throw new Error('Failed to retrieve client queries');
      const resData = await res.json();
      setSupportQueries(resData.data || []);
    } catch (err: any) {
      console.error(err);
      alert(
        err.message ||
          'An unexpected error occurred while fetching support queries',
      );
    } finally {
      setFetchingQueries(false);
    }
  };

  const handleResolveQuery = async (queryId: string) => {
    if (!token) return;
    try {
      setResolvingQueryId(queryId);
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const res = await fetch(`${backendUrl}/api/admin/queries/${queryId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'RESOLVED' }),
      });
      if (!res.ok) throw new Error('Failed to resolve query');
      await fetchAllQueries();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to resolve query');
    } finally {
      setResolvingQueryId(null);
    }
  };

  useEffect(() => {
    if (activeTab === 'queries') {
      fetchAllQueries();
    }
  }, [activeTab, token]);

  const handleExistingClientsFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingExistingClientFile(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(
        `${backendUrl}/api/admin/existing-clients/upload`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(
          resData.error || 'Failed to upload existing client records',
        );
      }

      alert(
        resData.message || 'Existing client database imported successfully!',
      );
      const nowStr = new Date().toISOString();
      localStorage.setItem('lastClientCsvUploadDate', nowStr);
      setLastCsvUploadDate(nowStr);
      setShowCsvReminder(false);
      existingClientsPage === 1
        ? fetchExistingClients(1, existingClientsSearchQuery)
        : setExistingClientsPage(1);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to upload file');
    } finally {
      setUploadingExistingClientFile(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleClearExistingClients = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Client Database',
      message:
        'Are you absolutely sure you want to delete all existing client records? This action is irreversible and will permanently wipe the imported client database.',
      danger: true,
      onConfirm: async () => {
        try {
          setFetchingExistingClients(true);
          const res = await fetch(
            `${backendUrl}/api/admin/existing-clients/clear`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const resData = await res.json();
          if (!res.ok)
            throw new Error(
              resData.error || 'Failed to clear existing client records',
            );

          alert(resData.message || 'All existing client records deleted.');
          setExistingClientsPage(1);
          setExistingClientsList([]);
          setExistingClientsPagination({
            page: 1,
            limit: 10,
            total: 0,
            pages: 0,
          });
          await fetchAdminData();
        } catch (err: any) {
          alert(err.message || 'Failed to clear records');
        } finally {
          setFetchingExistingClients(false);
        }
      },
    });
  };

  const handlePortfolioValuationsFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPortfolioValuationFile(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(
        `${backendUrl}/api/admin/portfolio-valuations/upload`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(
          resData.error || 'Failed to upload portfolio valuation records',
        );
      }

      alert(
        resData.message ||
          'Portfolio valuation database processed successfully!',
      );
      existingClientsPage === 1
        ? fetchExistingClients(1, existingClientsSearchQuery)
        : setExistingClientsPage(1);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to upload file');
    } finally {
      setUploadingPortfolioValuationFile(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleClearPortfolioValuations = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Portfolio Valuations',
      message:
        'Are you absolutely sure you want to delete all portfolio valuation records? This action is irreversible and will permanently wipe the imported valuation sheets.',
      danger: true,
      onConfirm: async () => {
        try {
          setFetchingPortfolioValuations(true);
          const res = await fetch(
            `${backendUrl}/api/admin/portfolio-valuations/clear`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const resData = await res.json();
          if (!res.ok)
            throw new Error(
              resData.error || 'Failed to clear portfolio valuation records',
            );

          alert(resData.message || 'All portfolio valuation records deleted.');
          setPortfolioValuationsPage(1);
          setPortfolioValuationsList([]);
          setPortfolioValuationsPagination({
            page: 1,
            limit: 10,
            total: 0,
            pages: 0,
          });
          await fetchAdminData();
        } catch (err: any) {
          alert(err.message || 'Failed to clear records');
        } finally {
          setFetchingPortfolioValuations(false);
        }
      },
    });
  };

  const fetchContactMessages = async () => {
    try {
      setFetchingContactMessages(true);
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${backendUrl}/api/admin/contact-messages`, {
        headers,
      });
      if (!res.ok) throw new Error('Failed to retrieve contact messages');
      const resData = await res.json();
      setContactMessages(resData.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setFetchingContactMessages(false);
    }
  };

  const fetchAvailabilitySlots = async () => {
    try {
      setFetchingAvailability(true);
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${backendUrl}/api/admin/availability`, {
        headers,
      });
      if (!res.ok) throw new Error('Failed to retrieve availability slots');
      const resData = await res.json();
      setAvailabilitySlots(resData.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setFetchingAvailability(false);
    }
  };

  const handleSaveAvailability = async (updatedSlots: string[]) => {
    try {
      setSavingAvailability(true);
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const res = await fetch(`${backendUrl}/api/admin/availability`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ slots: updatedSlots }),
      });
      if (!res.ok) throw new Error('Failed to save availability');
      const resData = await res.json();
      setAvailabilitySlots(resData.data || []);
      alert('Availability slots saved successfully!');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to save availability slots');
    } finally {
      setSavingAvailability(false);
    }
  };

  const fetchAdminData = async (showFullLoader = false) => {
    try {
      if (showFullLoader) {
        setLoading(true);
      }
      setError(null);
      const headers = { Authorization: `Bearer ${token}` };

      // Verify role is ADMIN
      const meRes = await fetch(`${backendUrl}/api/auth/me`, { headers });
      if (!meRes.ok) throw new Error('Failed to verify token');
      const meData = await meRes.json();

      if (meData.data?.role !== 'ADMIN') {
        setError(
          'Forbidden: You are not authorized to view the admin console.',
        );
        setLoading(false);
        return;
      }

      // Fetch Stats & Users
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${backendUrl}/api/admin/stats`, { headers }),
        fetch(`${backendUrl}/api/admin/users`, { headers }),
      ]);

      if (!statsRes.ok || !usersRes.ok) {
        throw new Error('Failed to retrieve system aggregates or user logs');
      }

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();

      setStats(statsData.data);
      setUsersList(usersData.data);

      // Fetch contact messages
      await fetchContactMessages();
      await fetchAvailabilitySlots();
      await fetchAdvisorySessions();
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          'An unexpected error occurred while fetching admin datasets',
      );
    } finally {
      setLoading(false);
      setIsLoaded(true);
    }
  };

  const fetchAdvisorySessions = async () => {
    try {
      setLoadingAdvisory(true);
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${backendUrl}/api/leads/admin/sessions`, {
        headers,
      });
      const data = await res.json();
      if (data.success) {
        setAdvisorySessions(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch portfolio review discussions:', err);
    } finally {
      setLoadingAdvisory(false);
    }
  };

  const handleConfirmSlot = async (sessionId: string) => {
    if (!confirmedSlotInput || !meetLinkInput) {
      alert('Please choose a confirmed slot and enter a Google Meet link.');
      return;
    }
    try {
      setUpdatingSession(true);
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };
      const res = await fetch(
        `${backendUrl}/api/leads/admin/sessions/${sessionId}/confirm`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            confirmedSlot: confirmedSlotInput,
            googleMeetLink: meetLinkInput,
          }),
        },
      );
      const data = await res.json();
      if (data.success) {
        alert('Session slot confirmed successfully!');
        setEditingSessionId(null);
        setConfirmedSlotInput('');
        setMeetLinkInput('');
        await fetchAdvisorySessions();
      } else {
        alert(data.error || 'Failed to confirm slot.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error confirming slot.');
    } finally {
      setUpdatingSession(false);
    }
  };

  const handleUpdatePortfolioNotes = async (sessionId: string) => {
    try {
      setUpdatingSession(true);
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };
      const res = await fetch(
        `${backendUrl}/api/leads/admin/sessions/${sessionId}/notes`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            notes: portfolioNotesInput,
          }),
        },
      );
      const data = await res.json();
      if (data.success) {
        alert('Distributor notes updated successfully!');
        setEditingSessionId(null);
        setPortfolioNotesInput('');
        await fetchAdvisorySessions();
      } else {
        alert(data.error || 'Failed to update notes.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error updating notes.');
    } finally {
      setUpdatingSession(false);
    }
  };

  const handleRefundSession = async (sessionId: string) => {
    if (
      !window.confirm(
        'Are you sure you want to trigger a full refund for this session? This action cannot be undone.',
      )
    ) {
      return;
    }
    try {
      setUpdatingSession(true);
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(
        `${backendUrl}/api/leads/admin/sessions/${sessionId}/refund`,
        {
          method: 'POST',
          headers,
        },
      );
      const data = await res.json();
      if (data.success) {
        alert('Session payment refunded successfully!');
        setEditingSessionId(null);
        await fetchAdvisorySessions();
      } else {
        alert(data.error || 'Failed to refund session.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error triggering refund.');
    } finally {
      setUpdatingSession(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/onboarding';
  };

  // Promote/Downgrade User Role
  const handleUpdateRole = async (
    userId: string,
    newRole: 'GUEST' | 'CLIENT' | 'ADMIN',
  ) => {
    try {
      setUpdatingUserRole(userId);
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const res = await fetch(`${backendUrl}/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update user role');
      }

      const resData = await res.json();

      // Update local states
      setUsersList((prev: any[]) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
      if (selectedUser?.id === userId) {
        setSelectedUser((prev: any) => ({ ...prev, role: newRole }));
      }

      // Refresh stats
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update user role');
    } finally {
      setUpdatingUserRole(null);
    }
  };

  // Update Client Profile Details
  const handleUpdateClientProfile = async (userId: string) => {
    const trimmedPan = pan.trim().toUpperCase();
    if (trimmedPan !== '') {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(trimmedPan)) {
        alert(
          'Invalid PAN format. Must be 10 characters (e.g. ABCDE1234F) or empty to clear.',
        );
        return;
      }
    }

    try {
      setSavingClientProfile(true);
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const res = await fetch(
        `${backendUrl}/api/admin/users/${userId}/client-profile`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ advisorNotes, activePlan, pan: trimmedPan }),
        },
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update client profile');
      }

      const resData = await res.json();

      // Update local states
      const updatedPan = trimmedPan === '' ? null : trimmedPan;
      setUsersList((prev: any[]) =>
        prev.map((u) =>
          u.id === userId ? { ...u, pan: updatedPan, client: resData.data } : u,
        ),
      );
      if (selectedUser?.id === userId) {
        setSelectedUser((prev: any) => ({
          ...prev,
          pan: updatedPan,
          client: resData.data,
        }));
      }

      alert('Client activation details updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update client profile');
    } finally {
      setSavingClientProfile(false);
    }
  };

  // Update Lead Status
  const handleUpdateLeadStatus = async () => {
    if (!selectedLeadId || !selectedUser) return;
    try {
      setSavingLeadStatus(true);
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const res = await fetch(
        `${backendUrl}/api/leads/${selectedLeadId}/status`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({ status: leadStatus, notes: leadNotes }),
        },
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update lead status');
      }

      const resData = await res.json();

      // Update lead in local state
      setUsersList((prev: any[]) =>
        prev.map((u) => {
          if (u.id === selectedUser.id) {
            const updatedLeads = u.leads.map((l: any) =>
              l.id === selectedLeadId ? resData.data : l,
            );
            return { ...u, leads: updatedLeads };
          }
          return u;
        }),
      );

      setSelectedUser((prev: any) => {
        const updatedLeads = prev.leads.map((l: any) =>
          l.id === selectedLeadId ? resData.data : l,
        );
        return { ...prev, leads: updatedLeads };
      });

      setSelectedLeadId(null);
      setLeadNotes('');
      alert('Consultation lead updated successfully!');
      fetchAdminData(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update lead status');
    } finally {
      setSavingLeadStatus(false);
    }
  };

  // Filtered Users List
  const filteredUsers = usersList.filter((user) => {
    const matchesSearch =
      (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (user.phone || '').includes(searchQuery) ||
      (user.pan?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Compile list of all leads across all users
  const allLeadsList = usersList
    .flatMap((user) =>
      (user.leads || []).map((lead: any) => ({ ...lead, user })),
    )
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  // Filter advisory sessions by user role
  const clientAdvisorySessions = advisorySessions.filter(
    (s) => s.user?.role === 'CLIENT',
  );
  const visitorAdvisorySessions = advisorySessions.filter(
    (s) => s.user?.role !== 'CLIENT',
  );

  // Filtered AUM Schemes
  const filteredSchemes = (aumData?.schemes || []).filter((scheme: any) =>
    (scheme.schemeName || '')
      .toLowerCase()
      .includes(aumSearchQuery.toLowerCase()),
  );

  // Grouped data for the AUM allocation Pie Chart (top 5 + others)
  const pieChartData = (() => {
    const schemes = aumData?.schemes || [];
    if (schemes.length === 0) return [];
    const sorted = [...schemes].sort((a, b) => b.amount - a.amount);
    if (sorted.length <= 6) {
      return sorted.map((s) => ({
        name: s.schemeName || 'Unknown Scheme',
        value: s.amount || 0,
        percentage: s.percentage || 0,
      }));
    }
    const top5 = sorted.slice(0, 5);
    const othersAmount = sorted
      .slice(5)
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalAmount = sorted.reduce(
      (acc, curr) => acc + (curr.amount || 0),
      0,
    );
    const othersPercentage =
      totalAmount > 0 ? (othersAmount / totalAmount) * 100 : 0;
    return [
      ...top5.map((s) => ({
        name: s.schemeName || 'Unknown Scheme',
        value: s.amount || 0,
        percentage: s.percentage || 0,
      })),
      {
        name: 'Others',
        value: othersAmount,
        percentage: othersPercentage,
      },
    ];
  })();

  // Initialize Client edit profile inputs
  const selectUserForDetails = (user: any) => {
    setSelectedUser(user);
    setAdvisorNotes(user.client?.advisorNotes || '');
    setActivePlan(user.client?.activePlan || 'PREMIUM');
    setPan(user.pan || '');
    setSelectedLeadId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-neutral-900 flex flex-col items-center justify-center relative overflow-hidden font-sans">
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-12 h-12 text-neutral-900 animate-spin" />
          <h2 className="text-xl font-bold tracking-wider font-clash">
            Loading Admin Dashboard...
          </h2>
          <p className="text-sm text-neutral-500 font-mono">
            Fetching latest ledger states
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white text-neutral-900 flex flex-col items-center justify-center relative overflow-hidden font-sans">
        <div className="relative z-10 w-full max-w-md bg-white border border-destructive/20 rounded-3xl p-8 text-center shadow-xl">
          <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900 font-clash mb-2">
            Access Denied
          </h2>
          <p className="text-sm text-neutral-500 mb-8 leading-relaxed font-sans">
            {error}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => (window.location.href = '/')}
              className="flex-1 py-3 text-sm font-semibold border border-neutral-200 bg-white rounded-xl hover:bg-neutral-50 transition duration-200 text-neutral-900"
            >
              Go Home
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-3 text-sm font-bold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition duration-200"
            >
              Log In Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans flex flex-col relative">
      {/* Header Panel */}
      <header className="w-full border-b border-neutral-200 bg-white px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 bg-white rounded-xl hover:bg-neutral-100 transition-all duration-200 text-xs font-semibold cursor-pointer text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </a>
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/"
              className="text-xl font-bold tracking-wider text-neutral-900 font-chillax select-none hover:opacity-90"
            >
              FinAnalysis
            </a>
            <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest bg-neutral-900 text-white rounded-md">
              Console
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">
              Authenticated Admin
            </span>
            <span className="text-xs font-semibold text-neutral-900">
              {adminUser?.email}
            </span>
          </div>

          {/* Notification Bell with Dropdown */}
          <div className="relative">
            <button
              onClick={() =>
                setShowNotificationsDropdown(!showNotificationsDropdown)
              }
              className="p-2 border border-neutral-200 bg-white rounded-xl hover:bg-neutral-100 transition-all duration-200 cursor-pointer relative text-neutral-600 hover:text-neutral-900"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {showCsvReminder && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
              )}
            </button>

            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-neutral-200 rounded-2xl shadow-xl z-50 p-4 animate-in fade-in duration-200 text-left">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2 mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 font-clash">
                    Notifications
                  </h4>
                  <span className="text-[10px] text-neutral-500 font-mono bg-neutral-100 px-2 py-0.5 rounded-full font-bold">
                    {showCsvReminder ? '1 New' : '0 New'}
                  </span>
                </div>

                {showCsvReminder ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-red-50/50 border border-red-200/50 rounded-xl">
                      <div className="flex gap-2">
                        <div className="p-1 bg-red-100 text-red-600 rounded-lg h-fit">
                          <Bell className="w-3.5 h-3.5 animate-bounce" />
                        </div>
                        <div className="flex-1">
                          <h5 className="text-xs font-bold text-neutral-900">
                            CSV Reupload Reminder
                          </h5>
                          <p className="text-[11px] text-neutral-600 mt-1 font-medium leading-relaxed">
                            It has been more than 14 days since the last client
                            database import. Please upload the latest client CSV
                            to keep the score comparisons updated.
                          </p>
                          {lastCsvUploadDate && (
                            <span className="text-[9px] text-neutral-400 font-mono mt-1 block">
                              Last Upload:{' '}
                              {new Date(lastCsvUploadDate).toLocaleDateString(
                                'en-IN',
                                { dateStyle: 'medium' },
                              )}
                            </span>
                          )}
                          <div className="flex gap-2 mt-2.5">
                            <button
                              onClick={() => {
                                setActiveTab('existingClients');
                                setShowNotificationsDropdown(false);
                              }}
                              className="px-2.5 py-1 text-[10px] font-bold bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition duration-200 cursor-pointer"
                            >
                              Upload Now
                            </button>
                            <button
                              onClick={handleSkipReminder}
                              className="px-2.5 py-1 text-[10px] font-bold border border-neutral-200 hover:bg-neutral-50 text-neutral-600 rounded-lg transition duration-200 cursor-pointer"
                            >
                              Skip
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-neutral-400 font-medium">
                    No new notifications
                  </div>
                )}
              </div>
            )}
          </div>

          <a
            href="/dashboard/client"
            className="flex items-center gap-2 px-4 py-2 border border-primary/20 bg-primary/5 rounded-xl hover:bg-primary/10 transition-all duration-200 text-xs font-semibold cursor-pointer text-primary"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            My Client View
          </a>

          <button
            onClick={() => {
              setConfirmModal({
                isOpen: true,
                title: 'Admin Logout Warning',
                message:
                  'Are you sure you want to log out of the administrator panel? You will lose access to user lists, payment approvals, and database imports until you sign in again.',
                danger: true,
                onConfirm: handleLogout,
              });
            }}
            className="flex items-center gap-2 px-4 py-2 border border-neutral-200 bg-white rounded-xl hover:bg-neutral-100 transition-all duration-200 text-xs font-semibold cursor-pointer text-neutral-900"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 flex flex-col gap-8">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight font-clash text-neutral-900">
              System Dashboard
            </h1>
            <p className="text-[11px] md:text-xs text-neutral-500 font-mono mt-1">
              Real-time telemetry and user record verification
            </p>
          </div>
          <button
            onClick={() => fetchAdminData(false)}
            className="p-2 md:p-2.5 border border-neutral-200 bg-white hover:bg-neutral-50 transition duration-200 cursor-pointer text-neutral-500 hover:text-neutral-900 rounded-xl"
            title="Refresh logs"
          >
            <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 text-left">
          {/* Card 4: Consultations */}
          <div
            onClick={() => setActiveTab('consultations')}
            className={`border rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition duration-300 cursor-pointer ${
              activeTab === 'consultations'
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white border-neutral-200 text-neutral-900'
            }`}
          >
            <div className="flex items-start sm:items-center justify-between gap-2 mb-3">
              <span
                className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider font-clash leading-tight ${activeTab === 'consultations' ? 'text-neutral-300' : 'text-neutral-500'}`}
              >
                Consultations
              </span>
              <div
                className={`p-1.5 sm:p-2 rounded-xl shrink-0 ${activeTab === 'consultations' ? 'bg-neutral-800' : 'bg-neutral-100'}`}
              >
                <PhoneCall
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'consultations' ? 'text-white' : 'text-slate-900'}`}
                />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight font-clash">
              {stats.attendedLeads}/{stats.totalLeads}
            </h3>
            <p
              className={`text-[10px] font-mono mt-1 ${activeTab === 'consultations' ? 'text-neutral-400' : 'text-neutral-500'}`}
            >
              Attended / Total Booked
            </p>
          </div>

          {/* Card 6: Existing Clients */}
          <div
            onClick={() => setActiveTab('existingClients')}
            className={`border rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition duration-300 cursor-pointer ${
              activeTab === 'existingClients'
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white border-neutral-200 text-neutral-900'
            }`}
          >
            <div className="flex items-start sm:items-center justify-between gap-2 mb-3">
              <span
                className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider font-clash leading-tight ${activeTab === 'existingClients' ? 'text-neutral-300' : 'text-neutral-500'}`}
              >
                Existing Clients
              </span>
              <div
                className={`p-1.5 sm:p-2 rounded-xl shrink-0 ${activeTab === 'existingClients' ? 'bg-neutral-800' : 'bg-neutral-100'}`}
              >
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight font-clash">
              {stats.totalExistingClients || 0}
            </h3>
            <p
              className={`text-[10px] font-mono mt-1 ${activeTab === 'existingClients' ? 'text-neutral-400' : 'text-neutral-500'}`}
            >
              Imported client profiles
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-neutral-200 gap-6 overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 text-sm font-bold font-clash tracking-wide border-b-2 cursor-pointer transition duration-200 whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Visitors Registry ({filteredUsers.length})
          </button>

          <button
            onClick={() => setActiveTab('consultations')}
            className={`py-3 text-sm font-bold font-clash tracking-wide border-b-2 cursor-pointer transition duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'consultations'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Visitors Session Queue
            {visitorAdvisorySessions.filter((s) => s.status === 'PENDING')
              .length > 0 && (
              <span className="px-2 py-0.5 text-[10px] bg-primary text-white rounded-full font-bold animate-pulse">
                {
                  visitorAdvisorySessions.filter((s) => s.status === 'PENDING')
                    .length
                }
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('existingClients')}
            className={`py-3 text-sm font-bold font-clash tracking-wide border-b-2 cursor-pointer transition duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'existingClients'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Existing Clients
            {stats.totalExistingClients > 0 && (
              <span className="px-2 py-0.5 text-[10px] bg-neutral-900 text-white rounded-full font-bold">
                {stats.totalExistingClients}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('liveSessions')}
            className={`py-3 text-sm font-bold font-clash tracking-wide border-b-2 cursor-pointer transition duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'liveSessions'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Existing Clients Session Queue
            {clientAdvisorySessions.filter((s) => s.status === 'PENDING')
              .length > 0 && (
              <span className="px-2 py-0.5 text-[10px] bg-primary text-white rounded-full font-bold animate-pulse">
                {
                  clientAdvisorySessions.filter((s) => s.status === 'PENDING')
                    .length
                }
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('aum')}
            className={`py-3 text-sm font-bold font-clash tracking-wide border-b-2 cursor-pointer transition duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'aum'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            AUM Breakdown
          </button>

          <button
            onClick={() => setActiveTab('queries')}
            className={`py-3 text-sm font-bold font-clash tracking-wide border-b-2 cursor-pointer transition duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'queries'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Queries
            {supportQueries.filter((q) => q.status === 'PENDING').length >
              0 && (
              <span className="px-2 py-0.5 text-[10px] bg-amber-500 text-white rounded-full font-bold">
                {supportQueries.filter((q) => q.status === 'PENDING').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('benchmarking')}
            className={`py-3 text-sm font-bold font-clash tracking-wide border-b-2 cursor-pointer transition duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'benchmarking'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Benchmarking
          </button>
        </div>

        {/* Tab Viewport */}
        <div className="flex-1 w-full min-h-[400px]">
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Search & Role Filter Header */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search users by name, email or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-10 py-3 text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 transition duration-200 text-neutral-900 placeholder-neutral-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Selector */}
                <div className="flex items-center gap-2 border border-neutral-200 rounded-xl px-3 bg-white">
                  <Filter className="w-3.5 h-3.5 text-neutral-400" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as any)}
                    className="text-xs font-bold font-clash uppercase border-none focus:outline-none bg-transparent py-2.5 cursor-pointer pr-4 text-neutral-900"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="GUEST">Guests</option>
                    <option value="CLIENT">Clients</option>
                    <option value="ADMIN">Admins</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="border border-neutral-200 bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs font-sans text-neutral-900">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50 uppercase tracking-widest text-[10px] font-bold text-neutral-500 select-none">
                        <th className="px-6 py-4">Register Date</th>
                        <th className="px-6 py-4">User Details</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Activity Summary</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-12 text-center text-sm text-neutral-500 font-mono"
                          >
                            No matching user accounts found in registry
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr
                            key={user.id}
                            className="hover:bg-neutral-50 transition duration-150 group"
                          >
                            <td className="px-6 py-5 whitespace-nowrap font-mono text-neutral-500">
                              {new Date(user.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                },
                              )}
                            </td>
                            <td className="px-6 py-5">
                              <div className="font-semibold text-neutral-900 text-sm group-hover:text-neutral-700 transition-colors duration-150">
                                {user.name || 'Anonymous User'}
                              </div>
                              <div className="text-neutral-500 font-mono text-[11px] mt-0.5">
                                {user.email}
                              </div>
                              {user.phone && (
                                <div className="text-neutral-500 font-mono text-[11px] mt-0.5">
                                  {user.phone}
                                </div>
                              )}
                              {user.pan && (
                                <div className="text-neutral-500 font-mono text-[10px] mt-0.5 bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded w-max">
                                  PAN: {user.pan}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                                  user.role === 'ADMIN'
                                    ? 'bg-neutral-900 text-white'
                                    : user.role === 'CLIENT'
                                      ? 'bg-amber-500/10 text-amber-700 border border-amber-500/25'
                                      : 'bg-neutral-100 text-neutral-600'
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex flex-wrap gap-2 text-[10px] font-mono text-neutral-500">
                                <span className="px-1.5 py-0.5 bg-neutral-50 border border-neutral-200 rounded">
                                  Assessments: {user.assessments?.length || 0}
                                </span>
                                <span className="px-1.5 py-0.5 bg-neutral-50 border border-neutral-200 rounded">
                                  Portfolios: {user.portfolios?.length || 0}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-right whitespace-nowrap">
                              <button
                                onClick={() => selectUserForDetails(user)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 bg-white hover:bg-neutral-900 hover:text-white rounded-lg transition duration-200 text-xs font-semibold cursor-pointer text-neutral-900"
                              >
                                View Details
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Contact Messages Section */}
              <div className="mt-8 flex flex-col gap-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight font-clash text-neutral-900">
                    Contact Form Submissions
                  </h2>
                  <p className="text-[11px] md:text-xs text-neutral-500 font-mono mt-1">
                    Queries submitted by public users on the homepage
                  </p>
                </div>

                <div className="border border-neutral-200 bg-white rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-xs font-sans text-neutral-900">
                      <thead>
                        <tr className="border-b border-neutral-200 bg-neutral-50 uppercase tracking-widest text-[10px] font-bold text-neutral-500 select-none">
                          <th className="px-6 py-4 w-[200px]">Submitted At</th>
                          <th className="px-6 py-4 w-[200px]">Name</th>
                          <th className="px-6 py-4 w-[250px]">Email</th>
                          <th className="px-6 py-4">Message</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {fetchingContactMessages ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-6 py-10 text-center text-neutral-400 font-mono"
                            >
                              Loading contact messages...
                            </td>
                          </tr>
                        ) : contactMessages.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-6 py-10 text-center text-neutral-400 font-mono"
                            >
                              No contact messages found.
                            </td>
                          </tr>
                        ) : (
                          contactMessages.map((msg: any) => (
                            <tr
                              key={msg.id}
                              className="hover:bg-neutral-50 transition-colors duration-150"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-neutral-500 font-mono">
                                {new Date(msg.createdAt).toLocaleString(
                                  'en-IN',
                                  {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                  },
                                )}
                              </td>
                              <td className="px-6 py-4 font-semibold text-neutral-800 font-clash whitespace-nowrap">
                                {msg.name}
                              </td>
                              <td className="px-6 py-4 font-mono text-neutral-600 whitespace-nowrap">
                                <a
                                  href={`mailto:${msg.email}`}
                                  className="text-neutral-600 hover:text-neutral-900 hover:underline"
                                >
                                  {msg.email}
                                </a>
                              </td>
                              <td className="px-6 py-4 text-neutral-700 break-words max-w-md">
                                {msg.message}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'consultations' && (
            <div className="space-y-4">
              {/* Visitor Live Portfolio Review Sessions */}
              <div>
                <h2 className="text-sm font-bold font-clash text-neutral-500 uppercase tracking-wider mb-4 text-left flex items-center gap-2">
                  <span>
                    Visitor Live Portfolio Review Bookings (
                    {visitorAdvisorySessions.length})
                  </span>
                </h2>

                {loadingAdvisory ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-neutral-200 rounded-2xl">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <p className="text-neutral-500 text-xs font-mono">
                      Fetching visitor sessions telemetry...
                    </p>
                  </div>
                ) : visitorAdvisorySessions.length === 0 ? (
                  <div className="border border-dashed border-neutral-200 rounded-2xl p-12 text-center text-sm text-neutral-500 bg-neutral-50 font-mono">
                    <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    No live portfolio review bookings from new visitors.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {visitorAdvisorySessions.map((session: any) => {
                      const isEditing = editingSessionId === session.id;
                      const defaultMeetLink =
                        session.googleMeetLink ||
                        `https://meet.google.com/abc-defg-hij`;

                      return (
                        <div
                          key={session.id}
                          className="border border-neutral-200 bg-white rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-sm hover:shadow-md transition duration-300 text-neutral-900"
                        >
                          {/* Session Title Bar */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-100 pb-4 w-full">
                            <div>
                              <div className="flex items-center gap-2.5">
                                <h3 className="font-bold text-neutral-950 text-base">
                                  {session.user?.name || 'Visitor'}
                                </h3>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-wider ${
                                    session.status === 'CONFIRMED'
                                      ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                                      : session.status === 'COMPLETED'
                                        ? 'bg-blue-500/10 text-blue-700 border border-blue-500/20'
                                        : session.status === 'REFUNDED'
                                          ? 'bg-red-500/10 text-red-700 border border-red-500/20'
                                          : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                                  }`}
                                >
                                  {session.status}
                                </span>
                              </div>
                              <p className="text-xs text-neutral-500 font-mono mt-0.5">
                                Email: {session.user?.email || 'N/A'} | Phone:{' '}
                                {session.user?.phone || 'N/A'}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                handleDeleteAdvisorySession(session.id)
                              }
                              className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-100 hover:border-rose-200 transition rounded-xl cursor-pointer"
                              title="Delete Session"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Session Preference and Confirmation Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            <div className="space-y-4 col-span-1">
                              {/* Preferred slots proposed by user */}
                              <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-5 space-y-3">
                                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">
                                  Visitor's Proposed Slots
                                </span>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between bg-white border border-neutral-100 p-2.5 rounded-xl text-xs font-mono">
                                    <span className="text-neutral-500">
                                      Option 1:
                                    </span>
                                    <span className="text-neutral-900 font-bold">
                                      {new Date(
                                        session.preferredSlot1,
                                      ).getTime() > 0
                                        ? new Date(
                                            session.preferredSlot1,
                                          ).toLocaleString()
                                        : 'Not submitted'}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between bg-white border border-neutral-100 p-2.5 rounded-xl text-xs font-mono">
                                    <span className="text-neutral-500">
                                      Option 2:
                                    </span>
                                    <span className="text-neutral-900 font-bold">
                                      {new Date(
                                        session.preferredSlot2,
                                      ).getTime() > 0
                                        ? new Date(
                                            session.preferredSlot2,
                                          ).toLocaleString()
                                        : 'Not submitted'}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between bg-white border border-neutral-100 p-2.5 rounded-xl text-xs font-mono">
                                    <span className="text-neutral-500">
                                      Option 3:
                                    </span>
                                    <span className="text-neutral-900 font-bold">
                                      {new Date(
                                        session.preferredSlot3,
                                      ).getTime() > 0
                                        ? new Date(
                                            session.preferredSlot3,
                                          ).toLocaleString()
                                        : 'Not submitted'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Active Confirmed slot details */}
                              {session.confirmedSlot && (
                                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 space-y-2">
                                  <span className="text-[10px] font-mono text-emerald-600 uppercase tracking-widest block font-bold">
                                    Confirmed Meeting Schedule
                                  </span>
                                  <div className="text-xs font-semibold text-emerald-950 font-mono">
                                    ⏰{' '}
                                    {new Date(
                                      session.confirmedSlot,
                                    ).toLocaleString()}
                                  </div>
                                  {session.googleMeetLink && (
                                    <a
                                      href={session.googleMeetLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs font-mono text-emerald-600 underline hover:text-emerald-700 block"
                                    >
                                      🔗 {session.googleMeetLink}
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Meeting confirmations inputs / editing form */}
                            <div className="space-y-4 col-span-1">
                              {session.status !== 'REFUNDED' &&
                                session.status !== 'COMPLETED' && (
                                  <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-5 space-y-4">
                                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block font-bold">
                                      {session.status === 'CONFIRMED'
                                        ? 'Reschedule / Confirm Slot'
                                        : 'Confirm Slot Booking'}
                                    </span>

                                    <div className="space-y-3">
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-semibold text-neutral-500">
                                          Select Date & Time *
                                        </label>
                                        <select
                                          value={
                                            editingSessionId === session.id
                                              ? confirmedSlotInput
                                              : ''
                                          }
                                          onChange={(e) => {
                                            setEditingSessionId(session.id);
                                            setConfirmedSlotInput(
                                              e.target.value,
                                            );
                                            if (!meetLinkInput)
                                              setMeetLinkInput(defaultMeetLink);
                                            setPortfolioNotesInput(
                                              session.notes || '',
                                            );
                                          }}
                                          className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-primary font-mono"
                                        >
                                          <option value="">
                                            -- Choose Slot --
                                          </option>
                                          {new Date(
                                            session.preferredSlot1,
                                          ).getTime() > 0 && (
                                            <option
                                              value={new Date(
                                                session.preferredSlot1,
                                              ).toISOString()}
                                            >
                                              Option 1 (
                                              {new Date(
                                                session.preferredSlot1,
                                              ).toLocaleString()}
                                              )
                                            </option>
                                          )}
                                          {new Date(
                                            session.preferredSlot2,
                                          ).getTime() > 0 && (
                                            <option
                                              value={new Date(
                                                session.preferredSlot2,
                                              ).toISOString()}
                                            >
                                              Option 2 (
                                              {new Date(
                                                session.preferredSlot2,
                                              ).toLocaleString()}
                                              )
                                            </option>
                                          )}
                                          {new Date(
                                            session.preferredSlot3,
                                          ).getTime() > 0 && (
                                            <option
                                              value={new Date(
                                                session.preferredSlot3,
                                              ).toISOString()}
                                            >
                                              Option 3 (
                                              {new Date(
                                                session.preferredSlot3,
                                              ).toLocaleString()}
                                              )
                                            </option>
                                          )}
                                          <option
                                            value={new Date().toISOString()}
                                          >
                                            Custom (Right Now)
                                          </option>
                                        </select>
                                      </div>

                                      <div className="space-y-1">
                                        <label className="text-[10px] font-semibold text-neutral-500">
                                          Google Meet Link *
                                        </label>
                                        <input
                                          type="url"
                                          placeholder="https://meet.google.com/..."
                                          value={
                                            editingSessionId === session.id
                                              ? meetLinkInput
                                              : session.googleMeetLink || ''
                                          }
                                          onChange={(e) => {
                                            setEditingSessionId(session.id);
                                            setMeetLinkInput(e.target.value);
                                          }}
                                          className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-950 font-mono focus:outline-none focus:border-primary"
                                        />
                                      </div>

                                      <button
                                        onClick={() =>
                                          handleConfirmSlot(session.id)
                                        }
                                        disabled={
                                          updatingSession ||
                                          editingSessionId !== session.id ||
                                          !confirmedSlotInput ||
                                          !meetLinkInput
                                        }
                                        className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition duration-200 disabled:opacity-40 cursor-pointer"
                                      >
                                        {updatingSession
                                          ? 'Processing...'
                                          : 'Confirm Schedule & Send Email'}
                                      </button>
                                    </div>
                                  </div>
                                )}

                              {/* Portfolio Notes Editor Card */}
                              <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-5 space-y-3">
                                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block font-bold">
                                  Portfolio Distribution Notes
                                </span>
                                <textarea
                                  rows={3}
                                  placeholder="Write portfolio audits, rebalancing advice, or general consulting notes..."
                                  value={
                                    editingSessionId === session.id
                                      ? portfolioNotesInput
                                      : session.notes || ''
                                  }
                                  onChange={(e) => {
                                    setEditingSessionId(session.id);
                                    setPortfolioNotesInput(e.target.value);
                                  }}
                                  className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:border-primary font-sans leading-relaxed"
                                />
                                <button
                                  onClick={() =>
                                    handleUpdatePortfolioNotes(session.id)
                                  }
                                  disabled={
                                    updatingSession ||
                                    editingSessionId !== session.id ||
                                    !portfolioNotesInput.trim()
                                  }
                                  className="w-full py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl transition duration-200 disabled:opacity-40 cursor-pointer"
                                >
                                  Save Distributor Notes
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'liveSessions' && (
            <div className="space-y-4 text-left">
              <h2 className="text-sm font-bold font-clash text-neutral-500 uppercase tracking-wider mb-2">
                Live Portfolio Review Discussions Queue (
                {clientAdvisorySessions.length})
              </h2>

              {loadingAdvisory ? (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-neutral-200 rounded-2xl">
                  <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                  <p className="text-neutral-500 text-xs font-mono">
                    Fetching premium sessions telemetry...
                  </p>
                </div>
              ) : clientAdvisorySessions.length === 0 ? (
                <div className="border border-dashed border-neutral-200 rounded-2xl p-12 text-center text-sm text-neutral-500 bg-neutral-50 font-mono">
                  <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  No live portfolio review discussions for existing clients.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {clientAdvisorySessions.map((session: any) => {
                    const isEditing = editingSessionId === session.id;
                    const defaultMeetLink =
                      session.googleMeetLink ||
                      `https://meet.google.com/abc-defg-hij`;

                    return (
                      <div
                        key={session.id}
                        className="border border-neutral-200 bg-white rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-sm hover:shadow-md transition duration-300 text-neutral-900"
                      >
                        {/* Session Title Bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-100 pb-4 w-full">
                          <div>
                            <div className="flex items-center gap-2.5">
                              <h3 className="font-bold text-neutral-950 text-base">
                                {session.user?.name || 'Premium Client'}
                              </h3>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-wider ${
                                  session.status === 'CONFIRMED'
                                    ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                                    : session.status === 'COMPLETED'
                                      ? 'bg-blue-500/10 text-blue-700 border border-blue-500/20'
                                      : session.status === 'REFUNDED'
                                        ? 'bg-red-500/10 text-red-700 border border-red-500/20'
                                        : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                                }`}
                              >
                                {session.status}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-500 font-mono mt-0.5">
                              Email: {session.user?.email || 'N/A'} | Phone:{' '}
                              {session.user?.phone || 'N/A'}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleDeleteAdvisorySession(session.id)
                            }
                            className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-100 hover:border-rose-200 transition rounded-xl cursor-pointer"
                            title="Delete Session"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Session Preference and Confirmation Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                          <div className="space-y-4 col-span-1">
                            {/* Preferred slots proposed by user */}
                            <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-5 space-y-3">
                              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">
                                Client's Proposed Slots
                              </span>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between bg-white border border-neutral-100 p-2.5 rounded-xl text-xs font-mono">
                                  <span className="text-neutral-500">
                                    Option 1:
                                  </span>
                                  <span className="text-neutral-900 font-bold">
                                    {new Date(
                                      session.preferredSlot1,
                                    ).getTime() > 0
                                      ? new Date(
                                          session.preferredSlot1,
                                        ).toLocaleString()
                                      : 'Not submitted'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between bg-white border border-neutral-100 p-2.5 rounded-xl text-xs font-mono">
                                  <span className="text-neutral-500">
                                    Option 2:
                                  </span>
                                  <span className="text-neutral-900 font-bold">
                                    {new Date(
                                      session.preferredSlot2,
                                    ).getTime() > 0
                                      ? new Date(
                                          session.preferredSlot2,
                                        ).toLocaleString()
                                      : 'Not submitted'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between bg-white border border-neutral-100 p-2.5 rounded-xl text-xs font-mono">
                                  <span className="text-neutral-500">
                                    Option 3:
                                  </span>
                                  <span className="text-neutral-900 font-bold">
                                    {new Date(
                                      session.preferredSlot3,
                                    ).getTime() > 0
                                      ? new Date(
                                          session.preferredSlot3,
                                        ).toLocaleString()
                                      : 'Not submitted'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Active Confirmed slot details */}
                            {session.confirmedSlot && (
                              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 space-y-2">
                                <span className="text-[10px] font-mono text-emerald-600 uppercase tracking-widest block font-bold">
                                  Confirmed Meeting Schedule
                                </span>
                                <div className="text-xs font-semibold text-emerald-950 font-mono">
                                  ⏰{' '}
                                  {new Date(
                                    session.confirmedSlot,
                                  ).toLocaleString()}
                                </div>
                                {session.googleMeetLink && (
                                  <a
                                    href={session.googleMeetLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-mono text-emerald-600 underline hover:text-emerald-700 block"
                                  >
                                    🔗 {session.googleMeetLink}
                                  </a>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Meeting confirmations inputs / editing form */}
                          <div className="space-y-4 col-span-1">
                            {session.status !== 'REFUNDED' &&
                              session.status !== 'COMPLETED' && (
                                <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-5 space-y-4">
                                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block font-bold">
                                    {session.status === 'CONFIRMED'
                                      ? 'Reschedule / Confirm Slot'
                                      : 'Confirm Slot Booking'}
                                  </span>

                                  <div className="space-y-3">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-semibold text-neutral-500">
                                        Select Date & Time *
                                      </label>
                                      <select
                                        value={
                                          editingSessionId === session.id
                                            ? confirmedSlotInput
                                            : ''
                                        }
                                        onChange={(e) => {
                                          setEditingSessionId(session.id);
                                          setConfirmedSlotInput(e.target.value);
                                          if (!meetLinkInput)
                                            setMeetLinkInput(defaultMeetLink);
                                          setPortfolioNotesInput(
                                            session.notes || '',
                                          );
                                        }}
                                        className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-primary font-mono"
                                      >
                                        <option value="">
                                          -- Choose Slot --
                                        </option>
                                        {new Date(
                                          session.preferredSlot1,
                                        ).getTime() > 0 && (
                                          <option
                                            value={new Date(
                                              session.preferredSlot1,
                                            ).toISOString()}
                                          >
                                            Option 1 (
                                            {new Date(
                                              session.preferredSlot1,
                                            ).toLocaleString()}
                                            )
                                          </option>
                                        )}
                                        {new Date(
                                          session.preferredSlot2,
                                        ).getTime() > 0 && (
                                          <option
                                            value={new Date(
                                              session.preferredSlot2,
                                            ).toISOString()}
                                          >
                                            Option 2 (
                                            {new Date(
                                              session.preferredSlot2,
                                            ).toLocaleString()}
                                            )
                                          </option>
                                        )}
                                        {new Date(
                                          session.preferredSlot3,
                                        ).getTime() > 0 && (
                                          <option
                                            value={new Date(
                                              session.preferredSlot3,
                                            ).toISOString()}
                                          >
                                            Option 3 (
                                            {new Date(
                                              session.preferredSlot3,
                                            ).toLocaleString()}
                                            )
                                          </option>
                                        )}
                                        <option
                                          value={new Date().toISOString()}
                                        >
                                          Custom (Right Now)
                                        </option>
                                      </select>
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-[10px] font-semibold text-neutral-500">
                                        Google Meet Link *
                                      </label>
                                      <input
                                        type="url"
                                        placeholder="https://meet.google.com/..."
                                        value={
                                          editingSessionId === session.id
                                            ? meetLinkInput
                                            : session.googleMeetLink || ''
                                        }
                                        onChange={(e) => {
                                          setEditingSessionId(session.id);
                                          setMeetLinkInput(e.target.value);
                                        }}
                                        className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-950 font-mono focus:outline-none focus:border-primary"
                                      />
                                    </div>

                                    <button
                                      onClick={() =>
                                        handleConfirmSlot(session.id)
                                      }
                                      disabled={
                                        updatingSession ||
                                        editingSessionId !== session.id ||
                                        !confirmedSlotInput ||
                                        !meetLinkInput
                                      }
                                      className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition duration-200 disabled:opacity-40 cursor-pointer"
                                    >
                                      {updatingSession
                                        ? 'Processing...'
                                        : 'Confirm Schedule & Send Email'}
                                    </button>
                                  </div>
                                </div>
                              )}

                            {/* Portfolio Notes Editor Card */}
                            <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-5 space-y-3">
                              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block font-bold">
                                Portfolio Distribution Notes
                              </span>
                              <textarea
                                rows={3}
                                placeholder="Write portfolio audits, rebalancing advice, or general consulting notes..."
                                value={
                                  editingSessionId === session.id
                                    ? portfolioNotesInput
                                    : session.notes || ''
                                }
                                onChange={(e) => {
                                  setEditingSessionId(session.id);
                                  setPortfolioNotesInput(e.target.value);
                                }}
                                className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:border-primary font-sans leading-relaxed"
                              />
                              <button
                                onClick={() =>
                                  handleUpdatePortfolioNotes(session.id)
                                }
                                disabled={
                                  updatingSession ||
                                  editingSessionId !== session.id ||
                                  !portfolioNotesInput.trim()
                                }
                                className="w-full py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl transition duration-200 disabled:opacity-40 cursor-pointer"
                              >
                                Save Distributor Notes
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'existingClients' && (
            <div className="space-y-6">
              {/* Top Action Bar with Upload Zones */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {/* Upload Zone 1: Client Info */}
                <div className="border border-dashed border-neutral-300 bg-white hover:border-neutral-900 transition-colors duration-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative min-h-[140px]">
                  {uploadingExistingClientFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-neutral-900 animate-spin" />
                      <span className="text-sm font-bold font-clash text-neutral-900">
                        Uploading & Parsing Existing Clients File...
                      </span>
                      <span className="text-xs text-neutral-500 font-mono">
                        Extracting all columns to database
                      </span>
                    </div>
                  ) : (
                    <label
                      htmlFor="existing-client-csv-upload"
                      className="cursor-pointer flex flex-col items-center gap-3 w-full h-full select-none"
                    >
                      <div className="p-3 bg-neutral-100 rounded-2xl text-neutral-900">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-sm font-bold font-clash text-neutral-900 block">
                          Click to Upload Existing Clients CSV / Excel
                        </span>
                        <span className="text-[11px] text-neutral-500 font-mono mt-1 block">
                          Supports target existing client database schemas
                        </span>
                      </div>
                      <input
                        type="file"
                        id="existing-client-csv-upload"
                        accept=".csv,.xlsx"
                        className="hidden"
                        onChange={handleExistingClientsFileUpload}
                      />
                    </label>
                  )}
                </div>

                {/* Upload Zone 2: Portfolio Valuations */}
                <div className="border border-dashed border-neutral-300 bg-white hover:border-neutral-900 transition-colors duration-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative min-h-[140px]">
                  {uploadingPortfolioValuationFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-neutral-900 animate-spin" />
                      <span className="text-sm font-bold font-clash text-neutral-900">
                        Uploading & Parsing Portfolio Valuations File...
                      </span>
                      <span className="text-xs text-neutral-500 font-mono">
                        Matching and updating database records
                      </span>
                    </div>
                  ) : (
                    <label
                      htmlFor="portfolio-valuation-csv-upload"
                      className="cursor-pointer flex flex-col items-center gap-3 w-full h-full select-none"
                    >
                      <div className="p-3 bg-neutral-100 rounded-2xl text-neutral-900">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-sm font-bold font-clash text-neutral-900 block">
                          Click to Upload Portfolio Valuations CSV / Excel
                        </span>
                        <span className="text-[11px] text-neutral-500 font-mono mt-1 block">
                          Matches by PAN & Name to update valuation columns
                        </span>
                      </div>
                      <input
                        type="file"
                        id="portfolio-valuation-csv-upload"
                        accept=".csv,.xlsx"
                        className="hidden"
                        onChange={handlePortfolioValuationsFileUpload}
                      />
                    </label>
                  )}
                </div>

                {/* Upload Zone 3: Folio Holdings */}
                <div className="border border-dashed border-neutral-300 bg-white hover:border-neutral-900 transition-colors duration-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative min-h-[140px]">
                  {uploadingFolioFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-neutral-900 animate-spin" />
                      <span className="text-sm font-bold font-clash text-neutral-900">
                        Uploading & Parsing Folios File...
                      </span>
                      <span className="text-xs text-neutral-500 font-mono">
                        Matching and updating database records
                      </span>
                    </div>
                  ) : (
                    <label
                      htmlFor="existing-client-folio-upload"
                      className="cursor-pointer flex flex-col items-center gap-3 w-full h-full select-none"
                    >
                      <div className="p-3 bg-neutral-100 rounded-2xl text-neutral-900">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-sm font-bold font-clash text-neutral-900 block">
                          Click to Upload Folio Holdings CSV / Excel
                        </span>
                        <span className="text-[11px] text-neutral-500 font-mono mt-1 block">
                          Matches by PAN & Name to update mutual fund folios
                        </span>
                      </div>
                      <input
                        type="file"
                        id="existing-client-folio-upload"
                        accept=".csv,.xlsx"
                        className="hidden"
                        onChange={handleFolioFileUpload}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Search & Listing */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                  <div className="flex-1 relative w-full">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search existing clients by name, PAN, email, mobile, city or app/iwell code..."
                      value={existingClientsSearchQuery}
                      onChange={(e) =>
                        setExistingClientsSearchQuery(e.target.value)
                      }
                      className="w-full pl-11 pr-10 py-3 text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 transition duration-200 text-neutral-900 placeholder-neutral-400"
                    />
                    {existingClientsSearchQuery && (
                      <button
                        onClick={() => setExistingClientsSearchQuery('')}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition cursor-pointer"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Existing Clients Table */}
                <div className="border border-neutral-200 bg-white rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-xs font-sans text-neutral-900">
                      <thead>
                        <tr className="border-b border-neutral-200 bg-neutral-50 uppercase tracking-widest text-[10px] font-bold text-neutral-500 select-none">
                          <th className="px-6 py-4">Name</th>
                          <th className="px-6 py-4">Folio</th>
                          <th className="px-6 py-4 text-right">AUM</th>
                          <th className="px-6 py-4 text-right">
                            Absolute Return
                          </th>
                          <th className="px-6 py-4 text-right">
                            <div className="leading-tight">Avg Holding</div>
                            <div className="text-[9px] text-neutral-400 font-normal lowercase tracking-normal font-sans font-medium">
                              (in years)
                            </div>
                          </th>
                          <th className="px-6 py-4 text-right">CAGR (%)</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {fetchingExistingClients ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-6 py-12 text-center text-sm text-neutral-500 font-mono"
                            >
                              <Loader2 className="w-6 h-6 text-neutral-900 animate-spin mx-auto mb-2" />
                              Loading existing client records...
                            </td>
                          </tr>
                        ) : existingClientsList.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-6 py-12 text-center text-sm text-neutral-500 font-mono"
                            >
                              No client records found in database
                            </td>
                          </tr>
                        ) : (
                          existingClientsList.map((client) => (
                            <tr
                              key={client.id}
                              className="hover:bg-neutral-50 transition duration-150 group"
                            >
                              <td className="px-6 py-4 font-sans">
                                <div className="font-semibold text-neutral-900 text-sm group-hover:text-neutral-700 transition-colors duration-150">
                                  {client.title ? `${client.title} ` : ''}
                                  {client.name || 'N/A'}
                                </div>
                                <div className="flex flex-wrap gap-2 items-center mt-0.5">
                                  {client.pan && (
                                    <span className="text-[10px] text-neutral-500 font-mono uppercase bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                                      PAN: {client.pan}
                                    </span>
                                  )}
                                  {client.mobile && (
                                    <span className="text-[10px] text-neutral-500 font-mono bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                                      Phone: {client.mobile}
                                    </span>
                                  )}
                                  {client.email && (
                                    <span className="text-[10px] text-neutral-500 font-mono bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                                      Email: {client.email}
                                    </span>
                                  )}
                                  {client.username && (
                                    <span className="text-neutral-400 font-mono text-[9px]">
                                      @{client.username}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 font-mono text-neutral-700 max-w-[180px] min-w-[140px]">
                                {client.folios && client.folios.length > 0 ? (
                                  client.folios.length > 1 ? (
                                    <div className="flex items-center gap-1.5 w-full min-w-0">
                                      <select
                                        className="flex-1 min-w-0 text-xs font-mono bg-neutral-50 border border-neutral-200 text-neutral-800 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-neutral-400 cursor-pointer truncate"
                                        defaultValue={
                                          client.folios[0].folioNumber || ''
                                        }
                                        title={`${client.folios.length} Folios`}
                                        onChange={() =>
                                          handleViewFolios(client)
                                        }
                                      >
                                        {client.folios.map((folio: any) => (
                                          <option
                                            key={folio.id}
                                            value={folio.folioNumber}
                                            title={`${folio.folioNumber} - ${folio.schemeName || 'Unknown Scheme'}`}
                                          >
                                            {folio.folioNumber}{' '}
                                            {folio.schemeName
                                              ? `(${folio.schemeName})`
                                              : ''}
                                          </option>
                                        ))}
                                      </select>
                                      <button
                                        type="button"
                                        onClick={() => handleViewFolios(client)}
                                        className="p-1 text-neutral-500 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded transition cursor-pointer flex items-center justify-center shrink-0"
                                        title="View selected folio details"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleViewFolios(client)}
                                      className="font-mono text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-900 hover:text-white px-2 py-0.5 rounded border border-neutral-200 transition duration-150 cursor-pointer"
                                      title="Click to view details"
                                    >
                                      {client.folios[0].folioNumber || 'N/A'}
                                    </button>
                                  )
                                ) : (
                                  'N/A'
                                )}
                              </td>
                              <td className="px-6 py-4 font-mono text-neutral-900 font-bold text-right">
                                {client.currentValue !== null &&
                                client.currentValue !== undefined
                                  ? `₹${client.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                                  : client.aum !== null &&
                                      client.aum !== undefined
                                    ? `₹${client.aum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                                    : 'N/A'}
                              </td>
                              <td className="px-6 py-4 font-mono text-neutral-700 text-right">
                                {client.absoluteReturn !== null &&
                                client.absoluteReturn !== undefined
                                  ? `${client.absoluteReturn.toFixed(2)}%`
                                  : 'N/A'}
                              </td>
                              <td className="px-6 py-4 font-mono text-neutral-700 text-right">
                                {formatAvgHolding(client.averageHoldingDays)}
                              </td>
                              <td className="px-6 py-4 font-mono text-neutral-900 font-bold text-right">
                                {client.cagr !== null &&
                                client.cagr !== undefined
                                  ? `${client.cagr.toFixed(2)}%`
                                  : 'N/A'}
                              </td>
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                <button
                                  onClick={() =>
                                    setSelectedExistingClient(client)
                                  }
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 bg-white hover:bg-neutral-900 hover:text-white rounded-lg transition duration-200 text-xs font-semibold cursor-pointer text-neutral-900"
                                >
                                  Audit Details
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controller */}
                  {existingClientsPagination.pages > 1 && (
                    <div className="border-t border-neutral-200 px-6 py-4 flex items-center justify-between bg-neutral-50">
                      <span className="text-[11px] font-mono text-neutral-500">
                        Showing page {existingClientsPagination.page} of{' '}
                        {existingClientsPagination.pages} (
                        {existingClientsPagination.total} total records)
                      </span>
                      <div className="flex gap-2">
                        <button
                          disabled={
                            existingClientsPagination.page <= 1 ||
                            fetchingExistingClients
                          }
                          onClick={() =>
                            setExistingClientsPage((prev) => prev - 1)
                          }
                          className="px-3 py-1.5 border border-neutral-200 bg-white rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 cursor-pointer select-none"
                        >
                          Previous
                        </button>
                        <button
                          disabled={
                            existingClientsPagination.page >=
                              existingClientsPagination.pages ||
                            fetchingExistingClients
                          }
                          onClick={() =>
                            setExistingClientsPage((prev) => prev + 1)
                          }
                          className="px-3 py-1.5 border border-neutral-200 bg-white rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 cursor-pointer select-none"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'aum' && (
            <div className="space-y-6">
              {/* Top Cards row: Total AUM & Pie Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Total AUM Card */}
                <div className="lg:col-span-6 bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-center relative overflow-hidden min-h-[220px]">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-neutral-100 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
                  <div className="relative z-10">
                    <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-neutral-400 block mb-2">
                      Total Assets Under Management (AUM)
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight font-clash text-neutral-900 leading-none">
                      ₹
                      {aumData.totalAUM
                        ? aumData.totalAUM.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                          })
                        : '0.00'}
                    </h2>
                    <p className="text-xs text-neutral-500 font-sans mt-2">
                      Aggregated sum of all investments across imported mutual
                      fund portfolios.
                    </p>
                  </div>
                </div>

                {/* Pie Chart Card */}
                <div className="lg:col-span-6 bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden min-h-[220px]">
                  <div className="relative z-10 w-full h-full flex flex-col">
                    <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-neutral-400 block mb-4">
                      AUM Allocation Breakdown
                    </span>

                    {fetchingAumData ? (
                      <div className="flex-1 flex items-center justify-center text-xs text-neutral-400 font-mono">
                        <span>Loading chart...</span>
                      </div>
                    ) : filteredSchemes.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-xs text-neutral-400 font-mono py-8">
                        <span>No scheme data available to display chart.</span>
                      </div>
                    ) : !mounted ? (
                      <div className="flex-1 flex items-center justify-center text-xs text-neutral-400 font-mono py-8">
                        <span>Initializing chart...</span>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Left: Recharts Pie Chart */}
                        <div className="w-full sm:w-[180px] h-[130px] relative shrink-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={55}
                                paddingAngle={3}
                                dataKey="value"
                              >
                                {pieChartData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      CHART_COLORS[index % CHART_COLORS.length]
                                    }
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value: any) => [
                                  `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
                                  'Amount',
                                ]}
                                contentStyle={{
                                  background: '#ffffff',
                                  border: '1px solid #e5e5e5',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontFamily: 'monospace',
                                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Right: Legend of top items */}
                        <div className="flex-1 w-full space-y-1.5 max-h-[130px] overflow-y-auto pr-1">
                          {pieChartData.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between text-[11px] font-mono"
                            >
                              <div className="flex items-center gap-1.5 truncate pr-2">
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{
                                    backgroundColor:
                                      CHART_COLORS[index % CHART_COLORS.length],
                                  }}
                                />
                                <span
                                  className="text-neutral-700 truncate font-sans font-medium"
                                  title={item.name}
                                >
                                  {item.name}
                                </span>
                              </div>
                              <span className="text-neutral-900 font-bold shrink-0">
                                {item.percentage.toFixed(1)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Search and List */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                  <div className="flex-1 relative w-full">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search schemes by asset name..."
                      value={aumSearchQuery}
                      onChange={(e) => setAumSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-10 py-3 text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 transition duration-200 text-neutral-900 placeholder-neutral-400"
                    />
                    {aumSearchQuery && (
                      <button
                        onClick={() => setAumSearchQuery('')}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition cursor-pointer"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                  {fetchingAumData ? (
                    <div className="px-6 py-16 text-center text-sm text-neutral-500 font-mono flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-6 h-6 text-neutral-900 animate-spin" />
                      <span>Fetching AUM distribution breakdown...</span>
                    </div>
                  ) : filteredSchemes.length === 0 ? (
                    <div className="px-6 py-16 text-center text-sm text-neutral-500 font-mono">
                      {aumSearchQuery
                        ? 'No schemes matching search criteria'
                        : 'No scheme data available. Upload Folio CSV to populate.'}
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-100">
                      {filteredSchemes.map((scheme: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-5 flex items-center justify-between hover:bg-neutral-50/50 transition duration-150"
                        >
                          <div className="flex-1 min-w-0 pr-4">
                            <h4 className="text-sm font-bold text-neutral-900 truncate leading-snug font-sans">
                              {scheme.schemeName}
                            </h4>
                            <p className="text-xs text-neutral-500 font-mono mt-1">
                              Amount Invested:{' '}
                              <span className="font-semibold text-neutral-800">
                                ₹
                                {scheme.amount.toLocaleString('en-IN', {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right hidden sm:block">
                              <div className="w-24 bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-neutral-900 h-full rounded-full"
                                  style={{
                                    width: `${Math.min(100, scheme.percentage)}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                            <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-bold font-mono text-neutral-900 bg-neutral-100 rounded-lg min-w-[70px]">
                              {scheme.percentage.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'queries' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-bold tracking-tight font-clash text-neutral-900">
                  Client Support Queries
                </h2>
                <p className="text-[11px] md:text-xs text-neutral-500 font-mono mt-1">
                  Manage and resolve inquiries submitted by premium clients
                </p>
              </div>

              <div className="border border-neutral-200 bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs font-sans text-neutral-900">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50 uppercase tracking-widest text-[10px] font-bold text-neutral-500 select-none">
                        <th className="px-6 py-4 w-[160px]">Submitted At</th>
                        <th className="px-6 py-4 w-[200px]">Client</th>
                        <th className="px-6 py-4 w-[220px]">Subject</th>
                        <th className="px-6 py-4">Message</th>
                        <th className="px-6 py-4 w-[120px]">Status</th>
                        <th className="px-6 py-4 w-[140px] text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {fetchingQueries ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-16 text-center text-neutral-400 font-mono"
                          >
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Loader2 className="w-5 h-5 text-neutral-900 animate-spin" />
                              <span>Loading support queries...</span>
                            </div>
                          </td>
                        </tr>
                      ) : supportQueries.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-16 text-center text-neutral-400 font-mono"
                          >
                            No support queries found.
                          </td>
                        </tr>
                      ) : (
                        supportQueries.map((query) => (
                          <tr
                            key={query.id}
                            className="hover:bg-neutral-50/50 transition-colors duration-150 items-start"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-neutral-500 font-mono align-top">
                              {new Date(query.createdAt).toLocaleString(
                                'en-IN',
                                {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                },
                              )}
                            </td>
                            <td className="px-6 py-4 align-top">
                              <div className="font-semibold text-neutral-900 leading-snug">
                                {query.user?.name || 'Premium Client'}
                              </div>
                              <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                                {query.user?.email}
                              </div>
                              {query.user?.phone && (
                                <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                                  {query.user.phone}
                                </div>
                              )}
                            </td>
                            <td
                              className="px-6 py-4 font-bold text-neutral-800 align-top max-w-[220px] truncate"
                              title={query.subject}
                            >
                              {query.subject}
                            </td>
                            <td className="px-6 py-4 text-neutral-600 align-top whitespace-pre-line leading-relaxed font-sans max-w-[400px]">
                              {query.message}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap align-top">
                              <span
                                className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-wider bg-amber-500/10 text-amber-700 border border-amber-500/20"
                                style={
                                  query.status === 'RESOLVED'
                                    ? {
                                        backgroundColor: 'rgba(16,185,129,0.1)',
                                        color: '#047857',
                                        borderColor: 'rgba(16,185,129,0.2)',
                                      }
                                    : {}
                                }
                              >
                                {query.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap align-top text-right flex items-center justify-end gap-2">
                              {query.status === 'PENDING' && (
                                <button
                                  onClick={() => handleResolveQuery(query.id)}
                                  disabled={resolvingQueryId === query.id}
                                  className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-[10px] rounded-lg transition duration-200 disabled:opacity-50 cursor-pointer select-none"
                                >
                                  {resolvingQueryId === query.id
                                    ? 'Resolving...'
                                    : 'Resolve'}
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteQuery(query.id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-100 hover:border-rose-200 transition rounded-lg cursor-pointer"
                                title="Delete Query"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'benchmarking' && (
            <BenchmarkTab />
          )}
        </div>
      </main>

      {/* User Details Slide Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay dim background */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm cursor-pointer"
            onClick={() => setSelectedUser(null)}
          />

          {/* Drawer container */}
          <div className="relative z-10 w-full max-w-2xl bg-white border-l border-neutral-200 h-screen max-h-screen shadow-2xl flex flex-col p-6 md:p-8 animate-in slide-in-from-right duration-350 ease-out text-neutral-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-6 shrink-0">
              <div>
                <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">
                  Audit Details
                </span>
                <h2 className="text-xl font-semibold font-clash text-neutral-900 mt-0.5">
                  {selectedUser.name || 'Anonymous User'}
                </h2>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 border border-neutral-200 hover:bg-neutral-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-4 h-4 text-neutral-500" />
              </button>
            </div>

            {/* Profile Overview */}
            <div
              data-lenis-prevent
              className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-200 overscroll-contain touch-pan-y"
            >
              {/* Account Meta Section */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-3 font-sans">
                <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
                  Account Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono text-neutral-900">
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">
                      Email Address
                    </span>
                    <span className="text-neutral-900 select-all">
                      {selectedUser.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">
                      Phone Number
                    </span>
                    <span className="text-neutral-900">
                      {selectedUser.phone || 'Not provided'}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">
                      Date of Birth
                    </span>
                    <span className="text-neutral-900">
                      {selectedUser.dob
                        ? new Date(selectedUser.dob).toLocaleDateString(
                            undefined,
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            },
                          )
                        : 'Not provided'}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">
                      Anniversary Date
                    </span>
                    <span className="text-neutral-900">
                      {selectedUser.anniversary
                        ? new Date(selectedUser.anniversary).toLocaleDateString(
                            undefined,
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            },
                          )
                        : 'Not provided'}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">
                      PAN Number
                    </span>
                    <span className="text-neutral-900 font-mono">
                      {selectedUser.pan || 'Not provided'}
                    </span>
                  </div>
                </div>

                {/* Role Switcher */}
                <div className="border-t border-neutral-200 pt-4 mt-2 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-neutral-900 font-clash block">
                      User Access Role
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      Adjust system permissions
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {updatingUserRole === selectedUser.id && (
                      <Loader2 className="w-4 h-4 text-neutral-900 animate-spin" />
                    )}
                    <select
                      value={selectedUser.role}
                      onChange={(e) =>
                        handleUpdateRole(selectedUser.id, e.target.value as any)
                      }
                      disabled={updatingUserRole === selectedUser.id}
                      className="text-xs font-bold font-clash uppercase border border-neutral-200 rounded-xl px-3 py-2 bg-white text-neutral-900 cursor-pointer"
                    >
                      <option value="GUEST">Guest</option>
                      <option value="CLIENT">Client</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Client Activation Profile Section */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-4 font-sans">
                <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                  <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900">
                    Client Profile Activation
                  </h3>
                  {selectedUser.client ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                      Activated Profile
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-500 text-[10px] font-bold uppercase tracking-wider border border-neutral-200">
                      Inactive Profile
                    </span>
                  )}
                </div>

                {selectedUser.client && (
                  <div className="text-xs font-mono text-neutral-500">
                    Activated On:{' '}
                    {new Date(selectedUser.client.activatedAt).toLocaleString()}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-900 uppercase block mb-1">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="Enter 10-digit PAN (e.g. ABCDE1234F)"
                      value={pan}
                      onChange={(e) => setPan(e.target.value.toUpperCase())}
                      className="w-full text-xs font-mono border border-neutral-200 rounded-xl px-3 py-2.5 bg-white text-neutral-900 focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={() => handleUpdateClientProfile(selectedUser.id)}
                    disabled={savingClientProfile}
                    className="w-full py-2.5 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition duration-200 cursor-pointer disabled:opacity-50"
                  >
                    {savingClientProfile
                      ? 'Saving Details...'
                      : 'Save Client Configuration'}
                  </button>
                </div>
              </div>

              {/* Onboarding Questionnaire Assessment details */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-4 font-sans text-neutral-900">
                <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
                  Onboarding Assessment
                </h3>

                {!selectedUser.assessments ||
                selectedUser.assessments.length === 0 ? (
                  <p className="text-xs text-neutral-500 font-mono text-center py-4">
                    User has not completed the onboarding assessment
                    questionnaire yet.
                  </p>
                ) : (
                  selectedUser.assessments.map((a: any) => {
                    const goalMeta = GOAL_LABELS[a.goal] || {
                      label: a.goal,
                      desc: 'Exploring general models',
                      icon: Compass,
                    };
                    const GoalIcon = goalMeta.icon;
                    return (
                      <div key={a.id} className="space-y-4">
                        <div className="flex gap-4 items-start">
                          <div className="p-3 bg-neutral-100 rounded-xl text-neutral-900">
                            <GoalIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-xs text-neutral-500 font-mono">
                              Selected Distribution Goal
                            </div>
                            <h4 className="text-sm font-bold font-clash text-neutral-900 mt-0.5">
                              {goalMeta.label}
                            </h4>
                            <p className="text-xs text-neutral-500 mt-1 font-sans">
                              {goalMeta.desc}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-neutral-200 pt-3 text-xs font-mono">
                          <div>
                            <span className="text-neutral-500 text-[10px] block uppercase">
                              User Declared Age
                            </span>
                            <span className="text-neutral-900 font-bold">
                              {a.ageRange || `${a.age} Years Old`}
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-500 text-[10px] block uppercase">
                              Assessed Date
                            </span>
                            <span className="text-neutral-900">
                              {new Date(a.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {a.lifeStage && (
                            <div>
                              <span className="text-neutral-500 text-[10px] block uppercase">
                                Life Stage
                              </span>
                              <span className="text-neutral-900 font-bold">
                                {a.lifeStage.replace(/_/g, ' ')}
                              </span>
                            </div>
                          )}
                          {a.investmentTenure && (
                            <div>
                              <span className="text-neutral-500 text-[10px] block uppercase">
                                Investment Horizon
                              </span>
                              <span className="text-neutral-900 font-bold">
                                {a.investmentTenure.replace(/_/g, ' ')}
                              </span>
                            </div>
                          )}
                          {a.isCompletePortfolio !== null &&
                            a.isCompletePortfolio !== undefined && (
                              <div>
                                <span className="text-neutral-500 text-[10px] block uppercase">
                                  Complete Portfolio
                                </span>
                                <span className="text-neutral-900 font-bold">
                                  {a.isCompletePortfolio ? 'Yes' : 'Partial'}
                                </span>
                              </div>
                            )}
                          {a.investmentStyle && (
                            <div>
                              <span className="text-neutral-500 text-[10px] block uppercase">
                                Investment Style
                              </span>
                              <span className="text-neutral-900 font-bold">
                                {a.investmentStyle.replace(/_/g, ' ')}
                              </span>
                            </div>
                          )}
                          {a.expectedReturn && (
                            <div>
                              <span className="text-neutral-500 text-[10px] block uppercase">
                                Expected Return
                              </span>
                              <span className="text-neutral-900 font-bold">
                                {a.expectedReturn.replace(/_/g, ' ')}
                              </span>
                            </div>
                          )}
                          {a.riskBehavior && (
                            <div className="col-span-2">
                              <span className="text-neutral-500 text-[10px] block uppercase">
                                Risk Behavior
                              </span>
                              <span className="text-neutral-900 font-bold">
                                {a.riskBehavior.replace(/_/g, ' ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Uploaded Portfolios & Scores */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-4 font-sans text-neutral-900">
                <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
                  Mutual Fund Portfolios ({selectedUser.portfolios?.length || 0}
                  )
                </h3>

                {!selectedUser.portfolios ||
                selectedUser.portfolios.length === 0 ? (
                  <p className="text-xs text-neutral-500 font-mono text-center py-4">
                    No portfolios uploaded by this user yet.
                  </p>
                ) : (
                  selectedUser.portfolios.map((p: any) => (
                    <div
                      key={p.id}
                      className="space-y-4 border-b border-neutral-200 pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <span className="text-[10px] text-neutral-500 uppercase font-mono">
                            Upload Type:{' '}
                          </span>
                          <span className="font-bold font-mono">
                            {p.uploadType}
                          </span>
                        </div>
                        <div className="font-mono text-neutral-500 text-[10.5px]">
                          {new Date(p.createdAt).toLocaleString()}
                        </div>
                      </div>

                      {/* Display Portfolio Scores */}
                      {p.score ? (
                        <div className="border border-neutral-200 bg-white rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-neutral-500 block uppercase font-mono">
                                Compounding Score
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                                  p.score.tag === 'ALIGNED'
                                    ? 'bg-emerald-500/10 text-emerald-700'
                                    : p.score.tag === 'MODERATE'
                                      ? 'bg-amber-500/10 text-amber-700'
                                      : 'bg-destructive/10 text-destructive'
                                }`}
                              >
                                {p.score.tag}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-bold font-clash tracking-tight text-neutral-900">
                                {p.score.total}
                                <span className="text-xs text-neutral-500">
                                  /100
                                </span>
                              </span>
                            </div>
                          </div>

                          {/* Individual ratings breakdown */}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-2 text-[10px] font-mono border-t border-neutral-200">
                            <div>
                              <div className="flex justify-between text-neutral-500 mb-1">
                                <span>Goal Alignment</span>
                                <span className="font-bold text-neutral-900">
                                  {p.score.goalAlignment}%
                                </span>
                              </div>
                              <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden">
                                <div
                                  className="bg-neutral-900 h-full rounded-full"
                                  style={{ width: `${p.score.goalAlignment}%` }}
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-neutral-500 mb-1">
                                <span>Asset Allocation</span>
                                <span className="font-bold text-neutral-900">
                                  {p.score.assetAlloc}%
                                </span>
                              </div>
                              <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden">
                                <div
                                  className="bg-neutral-900 h-full rounded-full"
                                  style={{ width: `${p.score.assetAlloc}%` }}
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-neutral-500 mb-1">
                                <span>Diversification</span>
                                <span className="font-bold text-neutral-900">
                                  {p.score.diversification}%
                                </span>
                              </div>
                              <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden">
                                <div
                                  className="bg-neutral-900 h-full rounded-full"
                                  style={{
                                    width: `${p.score.diversification}%`,
                                  }}
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-neutral-500 mb-1">
                                <span>Discipline</span>
                                <span className="font-bold text-neutral-900">
                                  {p.score.discipline}%
                                </span>
                              </div>
                              <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden">
                                <div
                                  className="bg-neutral-900 h-full rounded-full"
                                  style={{ width: `${p.score.discipline}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Score Insights */}
                          {p.score.insights &&
                            (() => {
                              const list = Array.isArray(p.score.insights)
                                ? p.score.insights
                                : (p.score.insights as any)?.textInsights || [];
                              if (list.length === 0) return null;
                              return (
                                <div className="border-t border-neutral-200 pt-2 text-xs font-sans text-neutral-500 space-y-1">
                                  <span className="text-[10px] text-neutral-900 uppercase font-bold tracking-wide font-clash block mb-1">
                                    Distribution Insights
                                  </span>
                                  {list.map((insight: string, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex items-start gap-1.5"
                                    >
                                      <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-neutral-900 flex-shrink-0" />
                                      <span>{insight}</span>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                        </div>
                      ) : (
                        <p className="text-[11px] text-neutral-500 font-mono">
                          Scoring report not yet calculated.
                        </p>
                      )}

                      {/* holdings table breakdown */}
                      {p.rows && p.rows.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-neutral-900 uppercase font-bold tracking-wide font-clash block">
                            Portfolio Holdings ({p.rows.length})
                          </span>
                          <div className="border border-neutral-200 bg-white rounded-xl overflow-hidden text-[10px] font-mono">
                            <table className="w-full text-left text-neutral-900">
                              <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold">
                                  <th className="px-3 py-2">Fund Name</th>
                                  <th className="px-3 py-2">Type</th>
                                  <th className="px-3 py-2 text-right">
                                    Invested
                                  </th>
                                  <th className="px-3 py-2 text-right">
                                    Current Value
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-neutral-200">
                                {p.rows.map((row: any) => (
                                  <tr
                                    key={row.id}
                                    className="hover:bg-neutral-50"
                                  >
                                    <td
                                      className="px-3 py-2 text-neutral-900 font-semibold truncate max-w-[150px]"
                                      title={row.fundName}
                                    >
                                      {row.fundName}
                                    </td>
                                    <td className="px-3 py-2 text-neutral-500">
                                      {row.type}
                                    </td>
                                    <td className="px-3 py-2 text-right text-neutral-900">
                                      ₹
                                      {row.invested.toLocaleString('en-IN', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </td>
                                    <td className="px-3 py-2 text-right text-neutral-900 font-semibold">
                                      ₹
                                      {row.currentValue.toLocaleString(
                                        'en-IN',
                                        {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        },
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Consultation Booking Leads */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-4 font-sans text-neutral-900">
                <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
                  Distribution Leads ({selectedUser.leads?.length || 0})
                </h3>

                {!selectedUser.leads || selectedUser.leads.length === 0 ? (
                  <p className="text-xs text-neutral-500 font-mono text-center py-4">
                    No consultation calls booked by this user.
                  </p>
                ) : (
                  selectedUser.leads.map((l: any) => (
                    <div
                      key={l.id}
                      className={`border rounded-xl p-4 space-y-3 shadow-sm ${
                        selectedLeadId === l.id
                          ? 'bg-white border-neutral-300 ring-1 ring-neutral-900'
                          : 'bg-white border-neutral-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-mono text-neutral-500 uppercase">
                            Contact Info
                          </span>
                          <h4 className="text-xs font-bold text-neutral-900 font-mono">
                            {l.phone}
                          </h4>
                          <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">
                            Name on Lead: {l.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider ${
                              l.status === 'CONVERTED'
                                ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                                : l.status === 'CONTACTED'
                                  ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                                  : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                            }`}
                          >
                            {l.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-[10px] font-mono border-t border-neutral-200 pt-2 text-neutral-500">
                        <div>
                          <span>Preferred Time Slot</span>
                          <span className="block text-neutral-900 font-bold mt-0.5">
                            {l.slot
                              ? new Date(l.slot).toLocaleString()
                              : 'As soon as possible'}
                          </span>
                        </div>
                        <div>
                          <span>Booked On</span>
                          <span className="block text-neutral-900 mt-0.5">
                            {new Date(l.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {l.notes && (
                        <div className="text-[11px] font-mono bg-neutral-50 p-2.5 rounded-lg border border-neutral-200 text-neutral-600">
                          <span className="text-[9px] text-neutral-900 uppercase font-bold font-clash block mb-1">
                            Distributor Notes
                          </span>
                          {l.notes}
                        </div>
                      )}

                      {/* Lead Action Form Toggle */}
                      {selectedLeadId === l.id ? (
                        <div className="border-t border-neutral-200 pt-3 mt-2 space-y-3 font-sans">
                          <div>
                            <label className="text-[10px] font-bold text-neutral-900 uppercase block mb-1">
                              Update Status
                            </label>
                            <select
                              value={leadStatus}
                              onChange={(e: any) =>
                                setLeadStatus(e.target.value)
                              }
                              className="w-full text-xs font-mono border border-neutral-200 rounded-lg px-2.5 py-2 bg-white text-neutral-900 focus:outline-none"
                            >
                              <option value="NEW">
                                NEW - Awaiting Contact
                              </option>
                              <option value="CONTACTED">
                                CONTACTED - Call Completed
                              </option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-neutral-900 uppercase block mb-1">
                              Add Lead Notes
                            </label>
                            <textarea
                              rows={2}
                              placeholder="Describe conversation results, client needs or schedule details..."
                              value={leadNotes}
                              onChange={(e) => setLeadNotes(e.target.value)}
                              className="w-full text-xs border border-neutral-200 rounded-lg px-2.5 py-1.5 bg-white text-neutral-900 focus:outline-none"
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedLeadId(null)}
                              className="flex-1 py-2 text-xs font-bold border border-neutral-200 rounded-lg hover:bg-neutral-50 transition duration-200 cursor-pointer text-neutral-900"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleUpdateLeadStatus}
                              disabled={savingLeadStatus}
                              className="flex-1 py-2 bg-neutral-900 text-white text-xs font-bold rounded-lg hover:bg-neutral-800 transition duration-200 cursor-pointer disabled:opacity-50"
                            >
                              {savingLeadStatus ? 'Saving...' : 'Update Lead'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedLeadId(l.id);
                            setLeadStatus(l.status);
                            setLeadNotes(l.notes || '');
                          }}
                          className="w-full mt-2 py-1.5 border border-neutral-200 text-[10px] font-bold tracking-wider uppercase bg-white hover:bg-neutral-50 rounded-lg transition duration-200 cursor-pointer text-center text-neutral-900"
                        >
                          Modify Consultation Status
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Existing Client Details Slide Drawer */}
      {selectedExistingClient && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay dim background */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm cursor-pointer"
            onClick={() => setSelectedExistingClient(null)}
          />

          {/* Drawer container */}
          <div className="relative z-10 w-full max-w-4xl bg-white border-l border-neutral-200 h-screen max-h-screen shadow-2xl overflow-hidden flex flex-col p-6 md:p-8 animate-in slide-in-from-right duration-350 ease-out text-neutral-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-6 shrink-0">
              <div>
                <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">
                  Existing Client Audit Ledger
                </span>
                <h2 className="text-xl font-semibold font-clash text-neutral-900 mt-0.5">
                  {selectedExistingClient.title
                    ? `${selectedExistingClient.title} `
                    : ''}
                  {selectedExistingClient.name || 'Client Details'}
                </h2>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">
                  PAN: {selectedExistingClient.pan || 'N/A'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleDeleteExistingClient(selectedExistingClient.id)
                  }
                  disabled={deletingClient}
                  className="px-3 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Client</span>
                </button>
                <button
                  onClick={() => setSelectedExistingClient(null)}
                  className="p-2 border border-neutral-200 hover:bg-neutral-100 rounded-xl transition cursor-pointer"
                >
                  <X className="w-4 h-4 text-neutral-500" />
                </button>
              </div>
            </div>

            {/* Scrollable details view */}
            <div
              data-lenis-prevent
              className="space-y-8 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-200 overscroll-contain touch-pan-y pb-10"
            >
              {/* Section 4.6: Folio Holdings / Scheme Details */}
              <div
                id="admin-folio-details-section"
                className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-4"
              >
                <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                  <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900">
                    Folio Holdings / Scheme Details (
                    {selectedExistingClient.folios?.length || 0})
                  </h3>
                </div>

                {!selectedExistingClient.folios ||
                selectedExistingClient.folios.length === 0 ? (
                  <p className="text-xs text-neutral-500 font-mono py-2">
                    No associated mutual fund folios found for this client.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {selectedExistingClient.folios.map(
                      (folio: any, index: number) => (
                        <div
                          key={folio.id || index}
                          className="bg-white border border-neutral-200 rounded-xl p-4 space-y-3"
                        >
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-neutral-100 pb-2">
                            <div>
                              <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block">
                                Scheme Name
                              </span>
                              <span className="text-xs font-bold text-neutral-800">
                                {folio.schemeName || 'N/A'}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block md:text-right">
                                Folio Number
                              </span>
                              <span className="text-xs font-mono font-semibold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200 inline-block">
                                {folio.folioNumber || 'N/A'}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                            <div>
                              <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block">
                                Balance Units
                              </span>
                              <span className="text-xs font-mono font-semibold text-neutral-800">
                                {folio.units !== null &&
                                folio.units !== undefined
                                  ? folio.units.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 4,
                                    })
                                  : 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block">
                                AUM Value
                              </span>
                              <span className="text-xs font-mono font-bold text-neutral-900">
                                {folio.aum !== null && folio.aum !== undefined
                                  ? `₹${folio.aum.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                                  : 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block">
                                Tax Status
                              </span>
                              <span className="text-xs font-semibold text-neutral-800">
                                {folio.taxStatus || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block">
                                Freeze Date
                              </span>
                              <span className="text-xs font-semibold text-neutral-800">
                                {folio.freezeDate || 'N/A'}
                              </span>
                            </div>
                          </div>

                          {/* Collapsible/Details for bank details & nominees within folio */}
                          <div className="mt-2 pt-2 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {folio.bankName && (
                              <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                                <span className="text-[9px] text-neutral-400 font-mono uppercase tracking-wider block mb-1">
                                  Folio Bank Details
                                </span>
                                <div className="font-semibold text-neutral-700">
                                  {folio.bankName}
                                </div>
                                <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                                  A/C: {folio.accountNumber || 'N/A'} | IFSC:{' '}
                                  {folio.ifscCode || 'N/A'} (
                                  {folio.accountType || 'N/A'})
                                </div>
                              </div>
                            )}
                            {folio.nomineeOpted && (
                              <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                                <span className="text-[9px] text-neutral-400 font-mono uppercase tracking-wider block mb-1">
                                  Nominees (From Folio)
                                </span>
                                <div className="font-semibold text-neutral-700">
                                  Status: {folio.nomineeOpted}
                                </div>
                                {folio.nominee1Name && (
                                  <div className="text-[10px] text-neutral-500 mt-0.5 font-sans">
                                    1. {folio.nominee1Name} (
                                    {folio.nominee1Relation || 'N/A'} -{' '}
                                    {folio.nominee1Percentage || '0'}%)
                                  </div>
                                )}
                                {folio.nominee2Name && (
                                  <div className="text-[10px] text-neutral-500 mt-0.5 font-sans">
                                    2. {folio.nominee2Name} (
                                    {folio.nominee2Relation || 'N/A'} -{' '}
                                    {folio.nominee2Percentage || '0'}%)
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>

              {/* Section 1: Personal & Profile Details */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
                  Personal & Profile Details
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <DetailField
                    label="Title"
                    value={selectedExistingClient.title}
                  />
                  <DetailField
                    label="Name"
                    value={selectedExistingClient.name}
                  />
                  <DetailField label="PAN" value={selectedExistingClient.pan} />
                  <DetailField
                    label="Aadhaar"
                    value={selectedExistingClient.aadhaar}
                  />
                  <DetailField
                    label="Date of Birth"
                    value={formatDob(selectedExistingClient.dob)}
                  />
                  <DetailField
                    label="Birthday Wish"
                    value={selectedExistingClient.birthdayWish}
                  />
                  <DetailField
                    label="Anniversary"
                    value={selectedExistingClient.anniversary}
                  />
                  <DetailField
                    label="Profession"
                    value={selectedExistingClient.profession}
                  />
                  <DetailField
                    label="Bank Details"
                    value={(() => {
                      const bankVal = selectedExistingClient.bankDetails;
                      const ifsc = selectedExistingClient.folios?.find(
                        (f: any) => f.ifscCode,
                      )?.ifscCode;
                      if (!bankVal) return ifsc ? `IFSC: ${ifsc}` : 'N/A';
                      return ifsc ? `${bankVal} | IFSC: ${ifsc}` : bankVal;
                    })()}
                  />
                </div>
              </div>

              {/* Section 2: Contact & Address Details */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
                  Contact & Address Details
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <DetailField
                    label="Email Address"
                    value={selectedExistingClient.email}
                  />
                  <DetailField
                    label="Secondary Email"
                    value={selectedExistingClient.secondaryEmail}
                  />
                  <DetailField
                    label="Mobile Number"
                    value={selectedExistingClient.mobile}
                  />
                  <DetailField
                    label="Landline"
                    value={selectedExistingClient.landline}
                  />
                  <DetailField
                    label="Address 1"
                    value={selectedExistingClient.address1}
                  />
                  <DetailField
                    label="Address 2"
                    value={selectedExistingClient.address2}
                  />
                  <DetailField
                    label="Address 3"
                    value={selectedExistingClient.address3}
                  />
                  <DetailField
                    label="City"
                    value={selectedExistingClient.city}
                  />
                  <DetailField
                    label="State"
                    value={selectedExistingClient.state}
                  />
                  <DetailField
                    label="Country"
                    value={selectedExistingClient.country}
                  />
                  <DetailField
                    label="PIN Code"
                    value={selectedExistingClient.pinCode}
                  />
                </div>
              </div>

              {/* Section 4.5: Portfolio Valuation Details */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
                  Portfolio Valuation Details (Fresh from CSV)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <DetailField
                    label="Balance Units"
                    value={
                      selectedExistingClient.balanceUnits !== null &&
                      selectedExistingClient.balanceUnits !== undefined
                        ? selectedExistingClient.balanceUnits.toLocaleString(
                            'en-IN',
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 4,
                            },
                          )
                        : 'N/A'
                    }
                  />
                  <DetailField
                    label="Invested Amount"
                    value={
                      selectedExistingClient.purchaseValue !== null &&
                      selectedExistingClient.purchaseValue !== undefined
                        ? `₹${selectedExistingClient.purchaseValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                        : 'N/A'
                    }
                  />
                  <DetailField
                    label="Current Value (AUM)"
                    value={
                      selectedExistingClient.currentValue !== null &&
                      selectedExistingClient.currentValue !== undefined
                        ? `₹${selectedExistingClient.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                        : 'N/A'
                    }
                  />
                  <DetailField
                    label="One-Day Change"
                    value={
                      selectedExistingClient.oneDayChange !== null &&
                      selectedExistingClient.oneDayChange !== undefined
                        ? `₹${selectedExistingClient.oneDayChange.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                        : 'N/A'
                    }
                  />
                  <DetailField
                    label="Dividend"
                    value={
                      selectedExistingClient.dividend !== null &&
                      selectedExistingClient.dividend !== undefined
                        ? `₹${selectedExistingClient.dividend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                        : 'N/A'
                    }
                  />
                  <DetailField
                    label="Average Holding"
                    value={formatAvgHolding(
                      selectedExistingClient.averageHoldingDays,
                    )}
                  />
                  <DetailField
                    label="Gain"
                    value={
                      selectedExistingClient.gain !== null &&
                      selectedExistingClient.gain !== undefined
                        ? `₹${selectedExistingClient.gain.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                        : 'N/A'
                    }
                  />
                  <DetailField
                    label="Absolute Return"
                    value={
                      selectedExistingClient.absoluteReturn !== null &&
                      selectedExistingClient.absoluteReturn !== undefined
                        ? `${selectedExistingClient.absoluteReturn.toFixed(2)}%`
                        : 'N/A'
                    }
                  />
                  <DetailField
                    label="CAGR (%)"
                    value={
                      selectedExistingClient.cagr !== null &&
                      selectedExistingClient.cagr !== undefined
                        ? `${selectedExistingClient.cagr.toFixed(2)}%`
                        : 'N/A'
                    }
                  />
                  <DetailField
                    label="XIRR (%)"
                    value={
                      selectedExistingClient.xirr !== null &&
                      selectedExistingClient.xirr !== undefined
                        ? `${selectedExistingClient.xirr.toFixed(2)}%`
                        : 'N/A'
                    }
                  />
                </div>
              </div>

              {/* Section 4: Distribution & Target Allocation */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
                  Distribution & Target Allocation
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <DetailField
                    label="Current AUM"
                    value={
                      selectedExistingClient.aum !== null &&
                      selectedExistingClient.aum !== undefined
                        ? `₹${selectedExistingClient.aum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                        : 'N/A'
                    }
                  />
                  <DetailField
                    label="Target SIP Amount"
                    value={
                      selectedExistingClient.targetSipAmount !== null &&
                      selectedExistingClient.targetSipAmount !== undefined
                        ? `₹${selectedExistingClient.targetSipAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                        : 'N/A'
                    }
                  />
                  <DetailField
                    label="Target ELSS Amount"
                    value={
                      selectedExistingClient.targetElssAmount !== null &&
                      selectedExistingClient.targetElssAmount !== undefined
                        ? `₹${selectedExistingClient.targetElssAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                        : 'N/A'
                    }
                  />
                  <DetailField
                    label="First Investment Date"
                    value={formatExcelDate(
                      selectedExistingClient.firstInvestmentDate,
                    )}
                  />
                  <DetailField
                    label="Review Frequency"
                    value={selectedExistingClient.reviewFrequency}
                  />
                  <DetailField
                    label="Last Review Date"
                    value={selectedExistingClient.lastReviewDate}
                  />
                </div>
              </div>

              {/* Section 3: Overseas Contact Details */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
                  Overseas Contact Details
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <DetailField
                    label="Overseas Address 1"
                    value={selectedExistingClient.overseasAddress1}
                  />
                  <DetailField
                    label="Overseas Address 2"
                    value={selectedExistingClient.overseasAddress2}
                  />
                  <DetailField
                    label="Overseas Address 3"
                    value={selectedExistingClient.overseasAddress3}
                  />
                  <DetailField
                    label="Overseas City"
                    value={selectedExistingClient.overseasCity}
                  />
                  <DetailField
                    label="Overseas State"
                    value={selectedExistingClient.overseasState}
                  />
                  <DetailField
                    label="Overseas Country"
                    value={selectedExistingClient.overseasCountry}
                  />
                  <DetailField
                    label="Overseas PIN"
                    value={selectedExistingClient.overseasPin}
                  />
                  <DetailField
                    label="Overseas Phone"
                    value={selectedExistingClient.overseasPhone}
                  />
                  <DetailField
                    label="Overseas Mobile"
                    value={selectedExistingClient.overseasMobile}
                  />
                </div>
              </div>

              {/* Section 8: Bank Details, Remarks & Nominees */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold font-clash uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2">
                  Bank Details, Remarks & Nominees
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="col-span-3">
                    <DetailField
                      label="Bank Details"
                      value={selectedExistingClient.bankDetails}
                    />
                    <DetailField
                      label="Remarks"
                      value={selectedExistingClient.remarks}
                    />
                  </div>

                  <DetailField
                    label="Nominee 1 Name"
                    value={selectedExistingClient.nominee1Name}
                  />
                  <DetailField
                    label="Nominee 1 Relation"
                    value={selectedExistingClient.nominee1Relation}
                  />
                  <DetailField
                    label="Nominee 1 DOB"
                    value={selectedExistingClient.nominee1Dob}
                  />
                  <DetailField
                    label="Nominee 1 %"
                    value={selectedExistingClient.nominee1Percentage}
                  />

                  <DetailField
                    label="Nominee 2 Name"
                    value={selectedExistingClient.nominee2Name}
                  />
                  <DetailField
                    label="Nominee 2 Relation"
                    value={selectedExistingClient.nominee2Relation}
                  />
                  <DetailField
                    label="Nominee 2 DOB"
                    value={selectedExistingClient.nominee2Dob}
                  />
                  <DetailField
                    label="Nominee 2 %"
                    value={selectedExistingClient.nominee2Percentage}
                  />

                  <DetailField
                    label="Nominee 3 Name"
                    value={selectedExistingClient.nominee3Name}
                  />
                  <DetailField
                    label="Nominee 3 Relation"
                    value={selectedExistingClient.nominee3Relation}
                  />
                  <DetailField
                    label="Nominee 3 DOB"
                    value={selectedExistingClient.nominee3Dob}
                  />
                  <DetailField
                    label="Nominee 3 %"
                    value={selectedExistingClient.nominee3Percentage}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Zoom Modal Overlay */}
      {screenshotModalUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-zoom-out"
            onClick={() => setScreenshotModalUrl(null)}
          />
          <div className="relative z-10 w-full max-w-3xl bg-white border border-neutral-200 rounded-2xl p-4 shadow-2xl flex flex-col items-center text-neutral-900">
            <button
              onClick={() => setScreenshotModalUrl(null)}
              className="absolute top-4 right-4 p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-full border border-neutral-200 cursor-pointer transition"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-full max-h-[80vh] overflow-auto flex items-center justify-center p-2 mt-6">
              <img
                src={screenshotModalUrl}
                alt="Enlarged transaction proof"
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md border border-neutral-200 bg-neutral-50"
              />
            </div>
            <div className="text-[10px] text-neutral-500 font-mono mt-4 text-center">
              Click outside the modal or click the close icon to dismiss.
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
            onClick={() =>
              setConfirmModal((prev) => ({ ...prev, isOpen: false }))
            }
          />
          <div className="relative z-[70] bg-white border border-neutral-200 rounded-[2rem] p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${confirmModal.danger ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}
            >
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-neutral-900 mb-2 font-clash">
              {confirmModal.title}
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed font-sans mb-6">
              {confirmModal.message}
            </p>

            <div className="flex gap-4 w-full">
              <button
                type="button"
                onClick={() =>
                  setConfirmModal((prev) => ({ ...prev, isOpen: false }))
                }
                className="flex-1 py-3 text-xs font-semibold border border-neutral-200 bg-white hover:bg-neutral-50 rounded-xl transition duration-200 text-neutral-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                }}
                className={`flex-1 py-3 text-xs font-bold text-white rounded-xl transition duration-200 cursor-pointer ${confirmModal.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-neutral-900 hover:bg-neutral-800'}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating CSV Upload Reminder Toast */}
      {showCsvReminder && (
        <div className="fixed bottom-6 right-6 w-96 bg-white border border-neutral-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-4 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="flex gap-3">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-xl h-fit">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 text-left">
              <div className="flex justify-between items-start">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 font-clash">
                  CSV Reupload Reminder
                </h4>
                <button
                  onClick={() => setShowCsvReminder(false)}
                  className="text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-neutral-600 mt-1.5 font-medium leading-relaxed">
                It has been 14+ days since the last existing clients CSV upload.
                Please upload the new CSV to ensure telemetry scoring remains
                accurate.
              </p>
              {lastCsvUploadDate && (
                <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                  Last upload:{' '}
                  {new Date(lastCsvUploadDate).toLocaleDateString('en-IN', {
                    dateStyle: 'medium',
                  })}
                </span>
              )}
              <div className="flex gap-2.5 mt-3">
                <button
                  onClick={() => {
                    setActiveTab('existingClients');
                    const element = document.getElementById(
                      'existing-client-csv-upload',
                    );
                    if (element) {
                      element.click();
                    }
                  }}
                  className="px-3 py-1.5 text-[11px] font-bold bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition duration-200 cursor-pointer shadow-sm"
                >
                  Upload Now
                </button>
                <button
                  onClick={handleSkipReminder}
                  className="px-3 py-1.5 text-[11px] font-bold border border-neutral-200 hover:bg-neutral-50 text-neutral-600 rounded-lg transition duration-200 cursor-pointer"
                >
                  Skip Reminder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
