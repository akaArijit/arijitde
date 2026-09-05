'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import { KnobSlider } from "@/components/ui/knob-slider";
import CalculatorsCarousel from "@/components/CalculatorsCarousel";
import SoftBoxBlurBg from "@/components/SoftBoxBlurBg";
import LightTunnel from "@/components/LightTunnel";
import GradualBlur from "@/components/GradualBlur";
import ScrollRevealSection from "@/components/ScrollRevealSection";
import ScrollBlurReveal from "@/components/ScrollBlurReveal";
import SvgScrollWipe from "@/components/SvgScrollWipe";
import ScrollTextReveal from "@/components/ScrollTextReveal";
import ServicesConstellation from "@/components/ServicesConstellation";
import { GoArrowDownRight } from "react-icons/go";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatbotWidget from "@/components/ChatbotWidget";
import AIOrbFace from "@/components/smoothui/ai-orb-face";
import BookCallModal from "@/components/BookCallModal";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { 
  Target, 
  PieChart, 
  ShieldCheck, 
  TrendingUp, 
  Coins, 
  Zap, 
  Clock, 
  Flame, 
  Briefcase, 
  Landmark, 
  PiggyBank, 
  CreditCard, 
  Scale, 
  Activity,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Bot,
  Percent,
  Layers,
  BarChart3,
  Compass,
  FileCheck2,
  BrainCircuit,
  Quote,
  RotateCw
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const archetypesMap: Record<string, {
  name: string;
  emoji: string;
  category: string;
  score: number;
  badge: string;
  needleAngle: number;
  color: string;
  gradient: string;
  breakdown: { label: string; pct: string; active?: boolean }[];
  description: string;
}> = {
  tiger: {
    name: "Aggressive Tiger",
    emoji: "🐅",
    category: "High Conviction Growth",
    score: 65,
    badge: "Optimal Fit",
    needleAngle: 27,
    color: "#F59E0B",
    gradient: "from-amber-500 to-orange-500",
    breakdown: [
      { label: "🐘 Elephant", pct: "20%" },
      { label: "🐅 Tiger", pct: "65%", active: true },
      { label: "🦊 Fox", pct: "15%" }
    ],
    description: "Prioritizes high-compounding alpha via disciplined systematic equity, multi-cap funds, and SIF portfolios."
  },
  elephant: {
    name: "Conservative Elephant",
    emoji: "🐘",
    category: "Capital Preservation",
    score: 25,
    badge: "High Security",
    needleAngle: -45,
    color: "#10B981",
    gradient: "from-emerald-500 to-teal-600",
    breakdown: [
      { label: "🐘 Elephant", pct: "70%", active: true },
      { label: "🦌 Deer", pct: "20%" },
      { label: "🐅 Tiger", pct: "10%" }
    ],
    description: "Prioritizes capital stability and predictable yields through AAA corporate bonds, target-maturity debt, and sovereign instruments."
  },
  deer: {
    name: "Balanced Deer",
    emoji: "🦌",
    category: "Steady Dynamic Allocation",
    score: 45,
    badge: "Balanced Growth",
    needleAngle: -10,
    color: "#0284C7",
    gradient: "from-sky-500 to-blue-600",
    breakdown: [
      { label: "🐘 Elephant", pct: "35%" },
      { label: "🦌 Deer", pct: "50%", active: true },
      { label: "🦊 Fox", pct: "15%" }
    ],
    description: "Balances steady equity compounding with defensive debt hedges and multi-asset dynamic allocation strategies."
  },
  fox: {
    name: "Strategic Fox",
    emoji: "🦊",
    category: "Tactical Opportunist",
    score: 78,
    badge: "Tactical Alpha",
    needleAngle: 50,
    color: "#EA580C",
    gradient: "from-orange-500 to-amber-600",
    breakdown: [
      { label: "🦊 Fox", pct: "60%", active: true },
      { label: "🐅 Tiger", pct: "30%" },
      { label: "🐘 Elephant", pct: "10%" }
    ],
    description: "Capitalizes on sector rotation, macroeconomic tailwinds, and dynamic momentum portfolio shifts."
  },
  lion: {
    name: "Visionary Lion",
    emoji: "🦁",
    category: "Frontier Equity Leader",
    score: 90,
    badge: "Maximum Expansion",
    needleAngle: 72,
    color: "#DC2626",
    gradient: "from-rose-500 to-red-600",
    breakdown: [
      { label: "🦁 Lion", pct: "75%", active: true },
      { label: "🐅 Tiger", pct: "20%" },
      { label: "🦊 Fox", pct: "5%" }
    ],
    description: "Engineered for maximum long-horizon growth utilizing specialized PMS strategies, small-cap innovators, and alternative asset vehicles."
  }
};

const servicesData = [
  {
    title: "Mutual Funds & SIP Planning",
    description: "Build robust, long-term wealth using systematically structured mutual fund portfolios, tailored to balance growth targets with proper risk management."
  },
  {
    title: "Specialised Investment Funds (SIF)",
    description: "Gain access to bespoke, high-growth investment vehicles engineered for sophisticated investors seeking alternative asset class diversification."
  },
  {
    title: "Portfolio Management Services (PMS)",
    description: "Leverage personalized wealth management models with active monitoring, strategic allocation adjustments, and direct equity integration."
  },
  {
    title: "Life Insurance & LIC Products",
    description: "Secure your family's future and safeguard your capital with top-tier life protection policies, endowment options, and customizable term riders."
  },
  {
    title: "Mediclaim & Health Insurance",
    description: "Guard against sudden medical emergencies and rising healthcare inflation with comprehensive personal, family, and corporate health covers."
  },
  {
    title: "Vehicle & Householder Insurance",
    description: "Protect your physical assets, including automobiles and residential property, from accidental damage, theft, and third-party liabilities."
  },
  {
    title: "Fixed Deposits",
    description: "Secure fixed interest rates and guaranteed capital preservation through high-yield fixed deposit options backed by leading banking institutions."
  },
  {
    title: "PNB Housing Finance",
    description: "Unlock structural leverage and long-term homeownership support through customized home loans, construction finance, and refinancing services."
  }
];

const faqData = [
  {
    question: "Is the portfolio health report really free?",
    answer: "Yes. Your portfolio health report is completely free."
  },
  {
    question: "How is my portfolio score calculated?",
    answer: "Your score is calculated out of 100 across five dimensions: Goal Alignment, Asset Allocation, Diversification, Investment Discipline, and Portfolio Efficiency. Each dimension is evaluated against your age, financial goal, and investment behavior — not generic benchmarks."
  },
  {
    question: "Do I need to be a client to use the platform?",
    answer: "No. Anyone can sign up, take the Investor Personality Assessment, and upload their portfolio for analysis"
  },
  {
    question: "Can I analyze a portfolio that wasn't built through your distribution?",
    answer: "Absolutely. The platform analyzes any mutual fund portfolio regardless of where it was built — Groww, Zerodha, Paytm Money, or anywhere else."
  },
  {
    question: "What format do I need to upload my portfolio in?",
    answer: "We use a fixed Excel template with six fields: Fund Name, Investment Type, Start Date, Monthly SIP Amount, Total Invested, and Current Value."
  },
  {
    question: "Is my data safe?",
    answer: "Yes. Your portfolio data is stored on secure, encrypted servers with strict access controls. Your information is never sold, shared, or visible to other users. Only you and our team can access your data."
  },
  {
    question: "What is the Investor Personality Assessment?",
    answer: "It's a 15-question behavioral assessment that identifies your natural investing style — not your financial knowledge. Based on your responses, you are classified into one of five investor archetypes: Tiger, Elephant, Deer, Fox, or Lion. It takes under 3 minutes and is completely free."
  },
  {
    question: "Does this platform give stock tips or guaranteed returns?",
    answer: "No. We do not provide stock recommendations, trading tips, or return guarantees of any kind. Our platform provides portfolio health report, goal-based planning, and structured distribution — all regulated under SEBI and AMFI guidelines."
  },
  {
    question: "What do I get after my portfolio health report?",
    answer: "You receive a Portfolio Score out of 100, three key insights specific to your portfolio, and the option to discuss your results with Arijit De directly through a one-on-one portfolio review discussion."
  },
  {
    question: "How do I schedule a consultation?",
    answer: "After your analysis, you can book a call directly through the platform by selecting your preferred time slot. Calls are available daily between 8:00 PM and 1:00 AM. You can also request a callback and we'll reach out to confirm."
  },
  {
    question: "Who is behind this platform?",
    answer: "FinAnalysis is built and operated by Arijit De — SEBI-certified Mutual Fund Distributor (ARN-273396) and SIF Distributor — backed by 35 years of AMFI-registered Mutual Fund distribution experience from his father, Arindam De. This is not a faceless app. There is a real, certified distributor behind every analysis."
  },
  {
    question: "I already have a AMFI-registered Mutual Fund Distributor. Can I still use this?",
    answer: "Yes. A second opinion never hurts. Our platform gives you an independent, data-backed view of your portfolio health regardless of who manages it."
  },
  {
    question: "What if I disagree with my portfolio score?",
    answer: "Your score is based on rule-based financial parameters and is reviewed by a certified distributor before being released to you. If you feel something is inaccurate, book a call and we'll walk through it together."
  },
  {
    question: "Is this platform only for mutual fund investors?",
    answer: "Currently, the portfolio health report engine is built for mutual fund portfolios. However, Arindam De's distribution services cover the full spectrum — Insurance, PMS, Fixed Deposits, PNB Housing Finance, and more. Reach out directly for anything beyond mutual funds."
  }
]

const servicesList = [
  {
    title: "Mutual Funds & SIP",
    desc: "Systematically managed for long-term compound growth.",
    tag: "Wealth Creation"
  },
  {
    title: "Fixed Deposits",
    desc: "Secure, high-yield options for guaranteed stable returns.",
    tag: "Capital Protection"
  },
  {
    title: "Specialized Investment Funds (SIF)",
    desc: "Sophisticated compounding returns using hurdle rates and strategic top-ups.",
    tag: "High Yield"
  },
  {
    title: "Portfolio Management (PMS)",
    desc: "Tailored active strategies for customized asset allocation.",
    tag: "Premium Advisory"
  },
  {
    title: "Insurance Solutions",
    desc: "Robust Life Insurance (LIC), Mediclaim health, and property protection.",
    tag: "Risk Mitigation"
  },
  {
    title: "Housing Finance & Loans",
    desc: "Structured leverage options through PNB Housing Finance home loans.",
    tag: "Leverage Options"
  }
];

export default function Home() {
  const [count, setCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [showPreloader, setShowPreloader] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scrollVideoContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollVideoRef = useRef<HTMLVideoElement | null>(null);

  const scrollToFaq = () => {
    const faqElement = document.getElementById("faq");
    if (faqElement) {
      faqElement.scrollIntoView({ behavior: "smooth" });
    }
  };



  // Daily Rewards Section States
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState("/onboarding");
  const [dailyQuote, setDailyQuote] = useState({ text: "", author: "" });

  // Contact Form States
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [submittedName, setSubmittedName] = useState("");



  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setContactError("Please fill out all fields.");
      return;
    }
    try {
      setContactSubmitting(true);
      setContactError(null);
      setContactSuccess(false);

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          message: contactMessage,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit contact message. Please try again.");
      }

      setSubmittedName(contactName);
      setContactSuccess(true);
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setContactError(msg);
    } finally {
      setContactSubmitting(false);
    }
  };

  const handleCardFlip = async () => {
    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);

    // If flipping to the back side:
    if (nextFlipped) {
      const token = localStorage.getItem("token");
      const loggedInNow = !!token;
      setIsLoggedIn(loggedInNow);
    }
  };

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === "ADMIN") {
          setDashboardUrl("/dashboard/admin");
        } else if (user.role === "CLIENT") {
          setDashboardUrl("/dashboard/client");
        } else {
          setDashboardUrl("/dashboard/user");
        }
      } catch (e) {
        setDashboardUrl("/dashboard/user");
      }
    }

    // Select daily quote based on calendar day
    const quotesList = [
      { text: "Do not save what is left after spending, but spend what is left after saving.", author: "Warren Buffett" },
      { text: "The individual investor should act consistently as an investor and not as a speculator.", author: "Benjamin Graham" },
      { text: "In investing, what is comfortable is rarely profitable.", author: "Robert Arnott" },
      { text: "The four most dangerous words in investing are: 'This time it's different.'", author: "John Templeton" },
      { text: "The most powerful force in the universe is compound interest.", author: "Albert Einstein" },
      { text: "Beware of little expenses; a small leak will sink a great ship.", author: "Benjamin Franklin" },
      { text: "Know what you own, and know why you own it.", author: "Peter Lynch" }
    ];
    const day = new Date().getDate();
    setDailyQuote(quotesList[day % quotesList.length] || quotesList[0]);


  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("book") === "true") {
        setIsBookingModalOpen(true);
        // Clean up the URL search params so reloading doesn't re-open it
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Cookie Acceptance State
  const [showCookieBox, setShowCookieBox] = useState(false);
  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      const timer = setTimeout(() => {
        setShowCookieBox(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const animationRef = useRef<number | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [expandedOption, setExpandedOption] = useState<string>("why-us");
  const [serviceCategory, setServiceCategory] = useState<"investments" | "insurance">("investments");
  const [selectedArchetype, setSelectedArchetype] = useState<string>("tiger");
  const [riskScore, setRiskScore] = useState<number>(65);
  const lastArchetypeRef = useRef("tiger");

  const handleSelectArchetype = useCallback((id: string) => {
    setSelectedArchetype(id);
    lastArchetypeRef.current = id;
    const targetScore = archetypesMap[id]?.score ?? 65;
    setRiskScore(targetScore);
  }, []);

  const handleKnobChange = useCallback((newScore: number) => {
    setRiskScore(newScore);

    let matched = "tiger";
    if (newScore <= 35) matched = "elephant";
    else if (newScore <= 55) matched = "deer";
    else if (newScore <= 72) matched = "tiger";
    else if (newScore <= 84) matched = "fox";
    else matched = "lion";

    if (lastArchetypeRef.current !== matched) {
      lastArchetypeRef.current = matched;
      setSelectedArchetype(matched);
    }
  }, []);
  const [activeHoverLevel1, setActiveHoverLevel1] = useState<string | null>(null);
  const [activeHoverLevel2, setActiveHoverLevel2] = useState<string | null>(null);
  const [mobileActiveLevel1, setMobileActiveLevel1] = useState<string | null>(null);
  const [mobileActiveLevel2, setMobileActiveLevel2] = useState<string | null>(null);
  // Services scroll sync tracking
  const [activeService, setActiveService] = useState(0);
  const serviceRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      const triggerPoint = window.innerHeight * 0.55; // trigger slightly below mid viewport
      let currentActive = 0;

      serviceRefs.current.forEach((ref, idx) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        if (rect.top <= triggerPoint) {
          currentActive = idx;
        }
      });

      // Auto-activate last items if user reaches the bottom of the page
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      if (windowHeight + scrollPosition >= documentHeight - 80) {
        currentActive = servicesData.length - 1;
      }

      setActiveService(currentActive);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Clock state removed, handled in component

  // Footer visibility tracking to hide chatbot smoothly
  const footerRef = useRef<HTMLDivElement>(null);
  const [isFooterIntersecting, setIsFooterIntersecting] = useState(false);

  // FAQ accordion active state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "0px 0px 100px 0px",
      }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const envelopeRef = useRef<HTMLDivElement>(null);
  const helloSectionRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    let animationFrameId: number;
    let targetTime = 0;

    const handleScrollVideo = () => {
      const video = scrollVideoRef.current;
      const container = scrollVideoContainerRef.current;
      if (!video || !container) {
        animationFrameId = requestAnimationFrame(handleScrollVideo);
        return;
      }

      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Only perform calculations when container is visible in viewport
      if (rect.bottom < 0 || rect.top > viewportHeight) {
        animationFrameId = requestAnimationFrame(handleScrollVideo);
        return;
      }

      const duration = video.duration;
      if (!isNaN(duration) && duration > 0) {
        const scrollRange = rect.height - viewportHeight;
        const relativeScroll = -rect.top;

        let progress = relativeScroll / scrollRange;
        progress = Math.max(0, Math.min(1, progress));

        targetTime = progress * duration;

        // Smooth LERP interpolation (0.15 factor for responsiveness vs smoothness)
        const diff = targetTime - video.currentTime;
        if (Math.abs(diff) > 0.005) {
          video.currentTime += diff * 0.15;
        } else {
          video.currentTime = targetTime;
        }

      }

      animationFrameId = requestAnimationFrame(handleScrollVideo);
    };

    animationFrameId = requestAnimationFrame(handleScrollVideo);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const triggerEnd = () => {
    setIsLoaded(true); // Slides preloader up
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setCount(100);
    setTimeout(() => {
      setShowPreloader(false); // Unmounts preloader
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        ScrollTrigger.refresh();
      });
    }, 1000); // Match slide duration
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!sessionStorage.getItem("hasSeenPreloader")) {
      sessionStorage.setItem("hasSeenPreloader", "true");
      setShowPreloader(true);
      setIsLoaded(false);

      const startTime = Date.now();
      const duration = 5000; // 5 seconds preloader duration

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, Math.floor((elapsed / duration) * 100));

        setCount(progress);

        if (elapsed < duration) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          triggerEnd();
        }
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-transparent text-foreground font-clash">
      {/* Fixed Background container with User's Gradient Theme */}
      <div className="page-backdrop fixed inset-0 z-0 select-none pointer-events-none">
        <SoftBoxBlurBg />
      </div>

      <Navbar isLoaded={isLoaded} onBookCallClick={() => setIsBookingModalOpen(true)} />

      <SvgScrollWipe
        screen1={
          <div className="relative w-full min-h-[90vh] md:min-h-screen flex items-center justify-center -mt-16 md:-mt-24 px-4 overflow-hidden">
            {/* LightTunnel component strictly attached to the hero section so it stays ONLY in the hero */}
            <div 
              className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0"
              style={{
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 60%, rgba(0,0,0,0.8) 80%, rgba(0,0,0,0) 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 60%, rgba(0,0,0,0.8) 80%, rgba(0,0,0,0) 100%)',
              }}
            >
              <LightTunnel
                cableColor="#3b82f6"
                pulseColor="#1d4ed8"
                tunnelColor="#4338ca"
                tunnelOpacity={0.05}
                speed={0.1}
                flowDirection="outward"
                pulseSpeed={2}
                pulseLength={0.28}
                pulseBlend={1}
                pulseWidth={1}
                cableCount={20}
                thickness={0.42}
                rimWidth={0.22}
                waviness={0.3}
                sway={0.5}
                size={1.0}
                centerX={0.0}
                centerY={0.0}
                glow={1.6}
                fadeNear={0.5}
                fadeFar={2}
                brightness={1.3}
                colorVariance={true}
                grain={true}
                grainIntensity={0.05}
                opacity={1.0}
                mouseInteraction={true}
                mouseStrength={0.1}
                lightMode={true}
              />
            </div>

            <ScrollBlurReveal 
              delay={700}
              duration={1.8}
              className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto space-y-6 pt-24 md:pt-20"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/40 bg-white/30 backdrop-blur-md text-xs font-semibold text-primary select-none shadow-sm">
                <span>35+ Years of Certified Amfi-Registered Mutual Fund Distribution</span>
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-primary font-chillax leading-tight tracking-tight uppercase">
                Built on the legacy<br />
                <span className="text-primary">of Mr. Arindam De</span>
              </h1>
              <p className="text-slate-800 text-xs sm:text-sm md:text-sm max-w-xl mx-auto font-sans leading-relaxed font-medium">
                Combining 35+ years of generation-spanning trust with systematic portfolio optimization and machine learning diagnostics to accelerate your growth.
              </p>
              <div className="pt-2">
                <a
                  href="/onboarding"
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-2xl transition duration-200 shadow-xl uppercase tracking-wider group cursor-pointer"
                >
                  <span className="font-bold text-xs">Get My Free Portfolio Report</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200 stroke-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </ScrollBlurReveal>
          </div>
        }
        screen2={
          <ScrollBlurReveal className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center gap-8 md:gap-12 px-4 sm:px-6 text-center">
            {/* Section Badge & Header */}
            <div className="flex flex-col items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/10 bg-white/50 backdrop-blur-md text-xs font-semibold text-primary select-none shadow-sm">
                <span>✦ HERITAGE & EXPERTISE</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary font-chillax tracking-tight">
                The Certified Human Touch Behind Data Precision
              </h2>
            </div>

            {/* Interactive Segmented Pill Tabs */}
            <div className="inline-flex p-1.5 rounded-full border border-white/60 bg-white/40 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] gap-1.5 max-w-full overflow-x-auto">
              {[
                { id: "why-us", label: "01 • Why We Exist" },
                { id: "services", label: "02 • What We Provide" },
                { id: "about", label: "03 • About & Legacy" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setExpandedOption(tab.id)}
                  className={`px-5 sm:px-7 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer select-none whitespace-nowrap ${
                    expandedOption === tab.id
                      ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                      : "text-muted-foreground hover:text-primary hover:bg-white/60"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Main Bento Stage Grid */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 text-left items-stretch mt-2">
              {/* Left Column: Founder Glassmorphic Card (5 cols on lg) */}
              <div className="lg:col-span-5 rounded-[32px] border border-white/60 bg-white/40 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-6 sm:p-8 flex flex-col justify-between items-center text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex flex-col items-center w-full">
                  {/* Portrait with Crisp Framing & Soft Ambient Depth */}
                  <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-[28px] border-2 border-white/90 shadow-[0_12px_30px_rgba(0,0,0,0.08)] overflow-hidden bg-card mb-4">
                    <img
                      src="/20260702_171545.webp"
                      alt="Arijit De"
                      className="w-full h-full object-cover object-[center_47%] select-none pointer-events-none"
                    />
                  </div>

                  {/* ARN Registration Badge Placed Under the Image */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/70 border border-border/60 shadow-xs mb-3 select-none backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-mono font-bold text-primary tracking-wider uppercase">
                      ARN-273396
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">• VERIFIED</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-primary font-chillax">
                    Arijit De
                  </h3>
                  <p className="text-xs font-semibold text-primary/70 mt-1 uppercase tracking-wider font-mono">
                    SEBI-Certified MFD & SIF Distributor
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground font-sans mt-2.5 leading-relaxed max-w-xs">
                    Carrying forward 35+ years of family distribution legacy started by <strong>Mr. Arindam De</strong> in 1989 with modern computational portfolio intelligence.
                  </p>
                </div>

                {/* Stats & Credential Pills */}
                <div className="w-full grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-border/50">
                  <div className="flex flex-col items-center p-2 rounded-xl bg-white/50 border border-white/60">
                    <span className="text-xs sm:text-sm font-bold text-primary font-chillax">35+ Yrs</span>
                    <span className="text-[9px] text-muted-foreground font-mono uppercase">Heritage</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-white/50 border border-white/60">
                    <span className="text-xs sm:text-sm font-bold text-primary font-chillax">AMFI</span>
                    <span className="text-[9px] text-muted-foreground font-mono uppercase">Registered</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-white/50 border border-white/60">
                    <span className="text-xs sm:text-sm font-bold text-primary font-chillax">1-on-1</span>
                    <span className="text-[9px] text-muted-foreground font-mono uppercase">Guidance</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full mt-5 py-3 px-5 rounded-2xl bg-primary/5 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
                >
                  Book 1-on-1 Discussion ↗
                </button>
              </div>

              {/* Right Column: Dynamic Stage Content (7 cols on lg) */}
              <div className="lg:col-span-7 flex flex-col justify-between gap-4">
                {/* 03. About Us Panel */}
                {expandedOption === "about" && (
                  <div className="h-full flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300">
                    <div className="p-6 sm:p-8 rounded-[32px] border border-white/60 bg-white/40 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col justify-between h-full relative overflow-hidden">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                            Heritage & Roots
                          </span>
                        </div>
                        <h4 className="text-xl sm:text-2xl font-bold text-primary font-chillax mb-3">
                          Generation-Spanning Trust Meets Modern Data Science
                        </h4>
                        <p className="text-xs sm:text-sm text-foreground/80 font-sans leading-relaxed font-medium mb-3">
                          FinAnalysis blends over 35 years of trusted AMFI-registered Mutual Fund distribution with modern technology and algorithmic portfolio modeling. Founded on a legacy started by <strong className="text-primary font-extrabold">Arindam De</strong> in 1989, we have navigated through multiple market cycles, recessions, and structural reforms to safeguard client wealth.
                        </p>
                        <p className="text-xs sm:text-sm text-foreground/80 font-sans leading-relaxed font-medium">
                          Today, <strong className="text-primary font-extrabold">Arijit De</strong> incorporates computer science diagnostics, factor weighting, and structured asset allocation, delivering a rigorous, data-backed approach to wealth management that prior generations never had access to.
                        </p>
                      </div>

                      {/* Animated Handshake GIF in the center space */}
                      <div className="my-3 flex items-center justify-center py-2">
                        <img
                          src="/hand-drawn-animation-simple-hand-drawn-handshake.gif"
                          alt="Trust and Legacy Handshake"
                          className="h-28 sm:h-32 object-contain select-none pointer-events-none mix-blend-multiply opacity-90"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-border/50">
                        <div className="p-4 rounded-2xl bg-white/40 border border-white/60">
                          <h5 className="text-xs font-bold text-primary uppercase tracking-wider font-mono">1989 Foundations</h5>
                          <p className="text-xs text-muted-foreground font-sans mt-1">Decade-spanning trust built through personal client stewardship.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/40 border border-white/60">
                          <h5 className="text-xs font-bold text-primary uppercase tracking-wider font-mono">Modern Analytics</h5>
                          <p className="text-xs text-muted-foreground font-sans mt-1">Rule-based portfolio scoring across 5 distinct risk & growth dimensions.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 01. What We Provide Panel (Segmented Button Tabs with Downward Tree) */}
                {expandedOption === "services" && (
                  <div className="h-full flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300">
                    <div className="p-5 sm:p-7 rounded-[32px] border border-white/60 bg-white/40 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col justify-between h-full relative overflow-hidden">
                      <div className="w-full flex flex-col">
                        {/* Top Segmented Button Bar inside the Card */}
                        <div className="w-full flex items-center justify-between p-1.5 rounded-full border border-white/70 bg-white/60 backdrop-blur-xl shadow-xs">
                          <button
                            onClick={() => setServiceCategory("investments")}
                            className={`flex-1 py-2.5 px-4 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer select-none text-center ${
                              serviceCategory === "investments"
                                ? "bg-primary text-primary-foreground shadow-md scale-[1.01]"
                                : "text-muted-foreground hover:text-primary hover:bg-white/60"
                            }`}
                          >
                            Investments
                          </button>
                          <button
                            onClick={() => setServiceCategory("insurance")}
                            className={`flex-1 py-2.5 px-4 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer select-none text-center ${
                              serviceCategory === "insurance"
                                ? "bg-primary text-primary-foreground shadow-md scale-[1.01]"
                                : "text-muted-foreground hover:text-primary hover:bg-white/60"
                            }`}
                          >
                            Life Insurance
                          </button>
                        </div>

                        {/* Dynamic Stage Content based on Selected Category */}
                        {serviceCategory === "investments" ? (
                          <div className="flex flex-col w-full animate-in fade-in duration-300 mt-1">
                            {/* Downward Connector Line / Arrow Aligned to Investments Tab (Left Half Center) */}
                            <div className="w-full grid grid-cols-2">
                              <div className="flex flex-col items-center justify-center">
                                <div className="w-0.5 h-4 bg-gradient-to-b from-primary/60 to-primary/20" />
                                <div className="w-1.5 h-1.5 border-b-2 border-r-2 border-primary/60 transform rotate-45 -mt-1" />
                              </div>
                              <div />
                            </div>

                            {/* Level 2 Sub-Branches (Fixed Deposits & Mutual Funds) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full items-stretch mt-1">
                              {/* Branch 1: Fixed Deposits */}
                              <div className="flex flex-col items-center justify-between w-full h-full gap-2">
                                <div className="p-4 sm:p-5 w-full flex-1 rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-white/75 to-white/40 backdrop-blur-xl shadow-xs text-left flex flex-col justify-center">
                                  <span className="text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 w-fit">
                                    CAPITAL PROTECTION
                                  </span>
                                  <h5 className="text-base font-bold text-primary font-chillax mt-2 mb-1">
                                    Fixed Deposits
                                  </h5>
                                  <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                                    Secure, stable high-yield options designed for capital preservation and guaranteed returns.
                                  </p>
                                </div>

                                {/* Connector to Company Deposit */}
                                <div className="flex flex-col items-center my-0.5">
                                  <div className="w-0.5 h-4 bg-gradient-to-b from-amber-500/50 to-amber-500/20" />
                                  <div className="w-1.5 h-1.5 border-b-2 border-r-2 border-amber-500/50 transform rotate-45 -mt-1" />
                                </div>

                                {/* Level 3: Company Deposit */}
                                <div 
                                  onClick={scrollToFaq}
                                  className="p-4 sm:p-5 w-full flex-1 rounded-2xl border border-amber-500/25 bg-white/85 backdrop-blur-md shadow-xs text-left cursor-pointer hover:bg-white hover:border-amber-500/50 hover:shadow-sm transition-all flex flex-col justify-center"
                                >
                                  <span className="text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-800 w-fit">
                                    FIXED RETURN
                                  </span>
                                  <h6 className="text-sm sm:text-base font-bold text-primary font-chillax mt-1.5 mb-1">
                                    Company Deposit
                                  </h6>
                                  <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                                    Corporate deposits with CRISIL AAA verified ratings, reliable payouts, and safety.
                                  </p>
                                </div>
                              </div>

                              {/* Branch 2: Mutual Funds */}
                              <div className="flex flex-col items-center justify-between w-full h-full gap-2">
                                <div className="p-4 sm:p-5 w-full rounded-2xl border border-blue-500/25 bg-gradient-to-br from-blue-500/10 via-white/75 to-white/40 backdrop-blur-xl shadow-xs text-left">
                                  <span className="text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-800 w-fit">
                                    ACTIVE GROWTH
                                  </span>
                                  <h5 className="text-base font-bold text-primary font-chillax mt-2 mb-1">
                                    Mutual Funds
                                  </h5>
                                  <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                                    Market-linked wealth acceleration with algorithmic diversification and factor scoring.
                                  </p>
                                </div>

                                {/* Connector to Level 3 Products */}
                                <div className="flex flex-col items-center my-0.5">
                                  <div className="w-0.5 h-4 bg-gradient-to-b from-blue-500/50 to-blue-500/20" />
                                  <div className="w-1.5 h-1.5 border-b-2 border-r-2 border-blue-500/50 transform rotate-45 -mt-1" />
                                </div>

                                {/* Level 3: 2x2 Grid of Growth Products (SIP, Lumpsum, SIF, PMS) */}
                                <div className="grid grid-cols-2 gap-2 w-full flex-1">
                                  {[
                                    { title: "SIP", desc: "Systematic monthly compounding." },
                                    { title: "Lumpsum", desc: "Tactical one-time deployment." },
                                    { title: "SIF", desc: "Specialized alternative funds." },
                                    { title: "PMS", desc: "Direct active asset allocation." }
                                  ].map((item, i) => (
                                    <div 
                                      key={i} 
                                      onClick={scrollToFaq}
                                      className="p-3 rounded-2xl border border-blue-500/20 bg-white/85 backdrop-blur-md shadow-xs text-left cursor-pointer hover:bg-white hover:border-blue-500/50 hover:shadow-sm transition-all flex flex-col justify-between"
                                    >
                                      <div>
                                        <span className="text-[7px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-700 w-fit inline-block">
                                          GROWTH
                                        </span>
                                        <h6 className="text-xs font-bold text-primary font-chillax mt-1 mb-0.5">
                                          {item.title}
                                        </h6>
                                      </div>
                                      <p className="text-[10px] text-muted-foreground font-sans leading-tight">
                                        {item.desc}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Life Insurance Panel */
                          <div className="flex flex-col w-full animate-in fade-in duration-300 mt-1">
                            {/* Downward Connector Line / Arrow Aligned to Life Insurance Tab (Right Half Center) */}
                            <div className="w-full grid grid-cols-2">
                              <div />
                              <div className="flex flex-col items-center justify-center">
                                <div className="w-0.5 h-4 bg-gradient-to-b from-primary/60 to-primary/20" />
                                <div className="w-1.5 h-1.5 border-b-2 border-r-2 border-primary/60 transform rotate-45 -mt-1" />
                              </div>
                            </div>

                            <div className="w-full p-5 sm:p-6 rounded-[24px] border border-white/70 bg-gradient-to-br from-white/75 via-white/55 to-white/35 backdrop-blur-xl shadow-xs text-left flex flex-col gap-4 mt-1">
                              <div>
                                <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                                  RISK MITIGATION & PROTECTION
                                </span>
                                <h4 className="text-xl sm:text-2xl font-bold text-primary font-chillax mt-2 mb-1">
                                  Life Insurance & Capital Shield
                                </h4>
                                <p className="text-xs sm:text-sm text-muted-foreground font-sans leading-relaxed">
                                  Shielding your family&apos;s future, safeguarding physical assets, and providing health emergency liquidity across generations.
                                </p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border/50">
                                <div className="p-3.5 rounded-2xl bg-white/75 border border-white/80">
                                  <span className="text-[9px] font-mono font-bold uppercase text-primary font-mono block mb-1">LIC Life Insurance</span>
                                  <p className="text-xs text-muted-foreground font-sans">Guaranteed term protection & endowment plans.</p>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-white/75 border border-white/80">
                                  <span className="text-[9px] font-mono font-bold uppercase text-primary font-mono block mb-1">Mediclaim Health</span>
                                  <p className="text-xs text-muted-foreground font-sans">Complete medical inflation & hospitalization cover.</p>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-white/75 border border-white/80">
                                  <span className="text-[9px] font-mono font-bold uppercase text-primary font-mono block mb-1">PNB Housing</span>
                                  <p className="text-xs text-muted-foreground font-sans">Structured home construction & loan solutions.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bottom Institutional Assurance Strip */}
                      <div className="w-full mt-5 pt-3.5 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-xs text-muted-foreground font-sans font-medium">
                            Personalized allocation based on SEBI-certified risk profiling & factor scoring.
                          </span>
                        </div>
                        <button
                          onClick={() => setIsBookingModalOpen(true)}
                          className="text-xs font-bold text-primary hover:text-primary/80 font-mono uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          Book 1-on-1 Discussion ↗
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 01. Why We Exist Panel */}
                {expandedOption === "why-us" && (
                  <div className="h-full flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300">
                    <div className="p-6 sm:p-8 rounded-[32px] border border-white/60 bg-white/40 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col justify-between h-full relative overflow-hidden">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                          Our Philosophy
                        </span>
                        <h4 className="text-xl sm:text-2xl font-bold text-primary font-chillax mt-3 mb-2">
                          Why Relationship-Driven Distribution Matters
                        </h4>
                        <p className="text-xs sm:text-sm text-foreground/80 font-sans leading-relaxed font-medium mb-2.5">
                          In an era dominated by cold robo-distribution apps and generic automated suggestions, your hard-earned wealth deserves personalized, <strong className="text-primary font-extrabold">relationship-driven human stewardship</strong>.
                        </p>
                        <p className="text-xs sm:text-sm text-foreground/80 font-sans leading-relaxed font-medium">
                          We bridge the gap between human empathy and data precision. By standing by our clients through decades of market turbulence, recessions, and regulatory shifts, we prioritize multi-generational trust and structured planning over short-term transactions.
                        </p>
                      </div>

                      {/* Animated Cryptocurrency & Analytics Lottie in center space */}
                      <div className="my-2 flex items-center justify-center py-1">
                        <div className="w-52 h-36 sm:w-64 sm:h-44 flex items-center justify-center">
                          <DotLottieReact
                            src="/beam-cryptocurrency-analytics-and-trading-on-laptop-screen.json"
                            loop
                            autoplay
                            className="w-full h-full object-contain pointer-events-none select-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border/50">
                        <div className="p-3.5 rounded-2xl bg-white/40 border border-white/60">
                          <span className="text-xs font-bold text-primary font-mono block">Zero Bots</span>
                          <span className="text-[11px] text-muted-foreground font-sans mt-0.5 block">Direct certified human advisory.</span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-white/40 border border-white/60">
                          <span className="text-xs font-bold text-primary font-mono block">Decades Long</span>
                          <span className="text-[11px] text-muted-foreground font-sans mt-0.5 block">Stewardship across full market cycles.</span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-white/40 border border-white/60">
                          <span className="text-xs font-bold text-primary font-mono block">SEBI Regulated</span>
                          <span className="text-[11px] text-muted-foreground font-sans mt-0.5 block">100% compliant ARN distribution.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollBlurReveal>
        }
      />

      <ScrollTextReveal />

      {/* Interactive Chatbot Promo Section */}
      <div className="w-full relative z-10 pt-4 pb-16 px-6 overflow-hidden">
        {/* Ambient backing glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.06)_0%,transparent_70%)] pointer-events-none select-none" />

        <ScrollBlurReveal className="w-full max-w-5xl mx-auto">
          <div className="w-full p-8 md:p-12 bg-white/45 backdrop-blur-2xl border border-white/70 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] flex flex-col md:flex-row justify-between items-start md:items-center gap-10 relative z-10">
            <div className="space-y-4 max-w-xl text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/15 bg-primary/5 text-xs font-semibold text-primary font-mono select-none">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>INSTANT INTELLIGENCE</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary font-chillax leading-snug">
                Meet Virtual Arijit : Real-Time Insights, Zero Waiting.
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed font-sans font-medium">
                Have questions regarding portfolio diagnostics, asset rebalancing, expense ratio optimization, or structured distribution? Ask Virtual Arijit for immediate institutional guidance.
              </p>
            </div>

            <div className="w-full md:w-auto shrink-0 flex flex-col items-center justify-center p-6 bg-white/60 backdrop-blur-2xl border border-white/80 rounded-2xl md:min-w-[280px] shadow-sm text-center relative">
              <div className="mb-3 relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#3A8293]/15 blur-xl pointer-events-none" />
                <AIOrbFace
                  size={76}
                  state="idle"
                  gaze={true}
                  aria-label="Virtual Arijit Assistant Preview"
                />
              </div>
              <span className="text-base font-bold text-primary font-chillax">Try Virtual Arijit Now</span>

              <button
                onClick={() => setIsChatOpen(true)}
                className="w-full mt-4 py-3.5 px-6 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-md uppercase tracking-wider"
              >
                <Bot className="w-4 h-4" />
                <span>Launch Assistant</span>
              </button>
            </div>
          </div>
        </ScrollBlurReveal>
      </div>

      {/* Investor Archetype Diagnostic Quiz Section */}
      <div className="w-full relative z-10 py-16 px-6">
        <ScrollBlurReveal className="w-full max-w-5xl mx-auto">
          <div className="relative overflow-hidden p-8 md:p-12 bg-white/45 backdrop-blur-2xl border border-white/70 rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] flex flex-col lg:flex-row gap-12 text-left items-stretch">
            {/* Background decorative glows */}
            <div className="absolute -left-12 -top-12 w-64 h-64 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

            {/* Left Column: Details */}
            <div className="flex-1 flex flex-col justify-between space-y-6 relative z-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/10 bg-white/60 text-xs font-semibold text-primary font-mono select-none shadow-xs">
                  <Compass className="w-3.5 h-3.5 text-primary" />
                  <span>BEHAVIORAL RISK PROFILING</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-primary font-chillax leading-tight">
                  Know What Kind of Investor You Are
                </h2>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed font-sans font-medium max-w-md">
                  Are you a Conservative Protector, a Strategic Compounder, or an Aggressive Visionary? Take our 2-minute diagnostic to analyze your risk preference and uncover the asset allocation engineered for your lifecycle.
                </p>

                {/* Interactive Animal Archetype Selector Badges */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-mono font-bold text-primary/70 uppercase tracking-wider block">
                    Interactive Archetypes Preview:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "tiger", label: "🐅 Tiger", desc: "Aggressive Growth" },
                      { id: "elephant", label: "🐘 Elephant", desc: "Capital Preservation" },
                      { id: "deer", label: "🦌 Deer", desc: "Balanced" },
                      { id: "fox", label: "🦊 Fox", desc: "Tactical" },
                      { id: "lion", label: "🦁 Lion", desc: "Frontier Alpha" }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectArchetype(item.id)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer select-none flex items-center gap-1.5 ${
                          selectedArchetype === item.id
                            ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                            : "bg-white/60 text-foreground/80 border-white/80 hover:bg-white hover:border-primary/30"
                        }`}
                      >
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="/quiz"
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-2xl transition duration-200 shadow-md uppercase tracking-wider group cursor-pointer"
                >
                  <span className="font-mono font-bold">Start Full Diagnostic Quiz</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                </a>
              </div>
            </div>

            {/* Right Column: Live Interactive Archetype Preview Card */}
            {(() => {
              const current = archetypesMap[selectedArchetype] || archetypesMap.tiger;
              return (
                <div className="flex-1 flex items-center justify-center relative">
                  <div className="w-full max-w-[380px] h-[370px] p-6 bg-gradient-to-br from-white/95 via-white/85 to-white/70 backdrop-blur-2xl rounded-3xl border border-white shadow-[0_20px_45px_rgba(0,0,0,0.06)] flex flex-col justify-between relative group overflow-hidden transition-all duration-300">
                    {/* Dynamic Ambient Background Glow */}
                    <div
                      className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-25 transition-all duration-700 pointer-events-none"
                      style={{ backgroundColor: current.color }}
                    />
                    <div
                      className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full blur-2xl opacity-15 transition-all duration-700 pointer-events-none"
                      style={{ backgroundColor: current.color }}
                    />

                    {/* Clean Fixed Header: Archetype Identity & Category */}
                    <div className="flex justify-between items-center border-b border-border/40 pb-2.5 min-h-[46px] relative z-10">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className="text-xl shrink-0">{current.emoji}</span>
                        <div className="min-w-0">
                          <h4 className="text-sm sm:text-base font-bold text-primary font-chillax leading-tight whitespace-nowrap truncate">
                            {current.name}
                          </h4>
                          <span className="text-[10px] font-mono text-muted-foreground block font-medium whitespace-nowrap truncate">
                            {current.badge}
                          </span>
                        </div>
                      </div>
                      <span
                        className="shrink-0 text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border shadow-2xs whitespace-nowrap"
                        style={{
                          backgroundColor: `${current.color}15`,
                          color: current.color,
                          borderColor: `${current.color}35`
                        }}
                      >
                        {current.category}
                      </span>
                    </div>

                    {/* Center: Larger, Highly-Visualized Futuristic Knob */}
                    <div className="flex-1 flex flex-col items-center justify-center relative z-10 py-1">
                      <KnobSlider
                        value={riskScore}
                        onChange={handleKnobChange}
                        min={0}
                        max={100}
                        size={240}
                        color={current.color}
                        label="RISK INDEX"
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </ScrollBlurReveal>
      </div>

      {/* Portfolio Health Report Section */}
      <div className="w-full relative z-10 py-16 px-6">
        <ScrollBlurReveal className="w-full max-w-5xl mx-auto">
          <div className="relative overflow-hidden p-8 md:p-12 bg-white/45 backdrop-blur-2xl border border-white/70 rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] flex flex-col lg:flex-row gap-12 text-left items-stretch">
            {/* Background decorative glows */}
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

            {/* Left Column: Details & 5 Pillars */}
            <div className="flex-1 flex flex-col justify-between space-y-6 relative z-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/10 bg-white/60 text-xs font-semibold text-primary font-mono select-none shadow-xs">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  <span>INSTITUTIONAL DIAGNOSTICS</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-primary font-chillax leading-tight">
                  Analyze Your Portfolio in Real-Time
                </h2>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed font-sans font-medium max-w-md">
                  Get a comprehensive overview of your investment health. We measure your portfolio across 5 core regulatory and performance dimensions to systematically eliminate leakages and optimize returns.
                </p>
              </div>

              {/* 5 Pillar Bento Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: Target, name: "Goal Alignment", desc: "Matching assets to lifespan horizon" },
                  { icon: PieChart, name: "Asset Allocation", desc: "Optimal equity, debt & gold balance" },
                  { icon: ShieldCheck, name: "Diversification", desc: "Multi-cap risk dispersion index" },
                  { icon: TrendingUp, name: "SIP Discipline", desc: "Compounding consistency tracker" },
                  { icon: Coins, name: "Fee Efficiency", desc: "Minimizing expense ratios" }
                ].map((pillar, idx) => {
                  const Icon = pillar.icon;
                  return (
                    <div 
                      key={idx} 
                      className={`flex gap-3 items-center p-3 rounded-2xl bg-white/60 border border-white/80 shadow-xs hover:bg-white hover:border-primary/20 transition-all duration-200 ${
                        idx === 4 ? "sm:col-span-2" : ""
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 text-primary">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-primary font-chillax">{pillar.name}</h4>
                        <p className="text-[10px] text-muted-foreground font-sans">{pillar.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <a
                  href="/onboarding"
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-primary hover:bg-primary/95 text-primary-foreground font-mono font-bold text-xs rounded-2xl transition duration-200 shadow-md uppercase tracking-wider group"
                >
                  <span>Evaluate My Portfolio</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                </a>
              </div>
            </div>

            {/* Right Column: Institutional Scorecard Dashboard Mockup */}
            <div className="flex-1 min-h-[320px] flex items-center justify-center relative">
              <div className="w-full h-full min-h-[320px] p-6 bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/90 flex flex-col justify-between gap-5 shadow-[0_20px_40px_rgba(0,0,0,0.06)] relative group overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-border/40 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-primary font-chillax tracking-wide uppercase">
                      DIAGNOSTIC PROTOCOL
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase px-2 py-0.5 rounded-md bg-white/60 border border-border/40">
                    LIVE DEMO
                  </span>
                </div>

                {/* Score Ring & Performance Metrics */}
                <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-1">
                  {/* Radial Progress Circle */}
                  <div className="relative w-32 h-32 flex items-center justify-center select-none shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="rgba(0, 0, 0, 0.05)" strokeWidth="8" fill="transparent" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#10B981"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 * (1 - 0.78)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold font-chillax text-primary leading-none">78</span>
                      <span className="text-[9px] font-mono text-muted-foreground uppercase mt-1">Health Score</span>
                    </div>
                  </div>

                  {/* Diagnostic Metric Progress Bars */}
                  <div className="flex-1 w-full space-y-2.5">
                    {[
                      { name: "Goal Match Horizon", score: 85, color: "bg-emerald-500" },
                      { name: "Asset Diversification", score: 74, color: "bg-sky-500" },
                      { name: "Expense Fee Efficiency", score: 92, color: "bg-emerald-500" },
                      { name: "SIP Compounding Index", score: 88, color: "bg-amber-500" }
                    ].map((metric, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-primary">
                          <span className="font-sans text-[11px]">{metric.name}</span>
                          <span className="font-mono text-[10px] font-bold">{metric.score}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${metric.color} rounded-full transition-all duration-1000`}
                            style={{ width: `${metric.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Live Diagnostic Insight */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 flex items-center gap-2.5 text-left">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <p className="text-[11px] text-foreground/80 font-sans leading-tight">
                    <strong className="text-emerald-700 font-semibold">Portfolio Status:</strong> Well-calibrated. Fee drag is in the bottom 8th percentile of peers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollBlurReveal>
      </div>

      {/* Calculators Hub Section (Compact Glassmorphic Carousel) */}
      <div id="calculators" className="w-full relative z-10 py-12 px-6 bg-transparent">
        <ScrollBlurReveal className="w-full max-w-5xl mx-auto">
          <CalculatorsCarousel />
        </ScrollBlurReveal>
      </div>

      {/* Daily Rewards Quotes Section */}
      <div id="daily-rewards" className="w-full relative z-10 py-16 px-6 bg-transparent">
        <ScrollBlurReveal className="w-full max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/10 bg-white/60 text-xs font-semibold text-primary font-mono select-none shadow-xs mb-3">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>TIMELESS PERSPECTIVE</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-primary font-chillax leading-tight">
              Daily Market Wisdom
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed font-sans mt-2 max-w-xl mx-auto font-medium">
              Curated timeless investment principles to keep you grounded across market cycles.
            </p>
          </div>

          {/* Flippable Card Container */}
          <div
            className="w-full max-w-xl mx-auto h-[340px] [perspective:1200px] cursor-pointer group select-none"
            onClick={handleCardFlip}
          >
            <div
              className="relative w-full h-full duration-700 transition-transform"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* Front Side of Card */}
              <div
                className="absolute inset-0 w-full h-full p-7 sm:p-9 rounded-[32px] bg-white/50 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.08)] flex flex-col justify-between items-center text-center overflow-hidden transition-all duration-300"
                style={{ backfaceVisibility: 'hidden' }}
              >
                {/* Decorative background glows */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

                {/* Top Status Row */}
                <div className="w-full flex justify-between items-center pb-2 relative z-10 border-b border-border/30">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/5 text-primary text-[10px] font-mono font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>DAILY THOUGHT</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">
                    REFRESHES EVERY 24H
                  </span>
                </div>

                {/* Quote Core */}
                <div className="my-auto py-3 relative z-10 max-w-md">
                  <Quote className="w-6 h-6 text-primary/20 mx-auto mb-2" />
                  <p className="text-lg sm:text-xl md:text-2xl font-bold font-chillax leading-relaxed text-primary">
                    “{dailyQuote.text}”
                  </p>
                  <div className="inline-block mt-3 px-3 py-1 rounded-full bg-white/70 border border-white/80 shadow-2xs">
                    <span className="text-xs text-primary font-mono font-bold tracking-wider">
                      — {dailyQuote.author}
                    </span>
                  </div>
                </div>

                {/* Bottom Interactive Flip Cue */}
                <div className="w-full flex items-center justify-center gap-1.5 pt-2 text-[11px] font-mono font-bold text-muted-foreground group-hover:text-primary transition-colors relative z-10">
                  <RotateCw className="w-3.5 h-3.5 transform group-hover:rotate-180 transition-transform duration-500" />
                  <span>Click card to view advisor note</span>
                </div>
              </div>

              {/* Back Side of Card */}
              <div
                className="absolute inset-0 w-full h-full p-7 sm:p-9 rounded-[32px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex flex-col justify-between items-center text-center overflow-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                {/* Decorative glows */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />

                {/* Top Status */}
                <div className="w-full flex justify-between items-center pb-2 relative z-10 border-b border-border/30">
                  <span className="text-[10px] font-mono text-primary tracking-widest uppercase font-bold px-2.5 py-0.5 rounded-full bg-primary/5">
                    Advisor Note
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">
                    ARN-273396 • AMFI REGISTERED
                  </span>
                </div>

                {/* Advisor Info */}
                <div className="w-full my-auto space-y-3 relative z-10 max-w-sm">
                  <div className="flex flex-col items-center justify-center space-y-1.5">
                    <div className="w-14 h-14 rounded-full border-2 border-white shadow-md overflow-hidden shrink-0 bg-card">
                      <img
                        src="/20260702_171545.webp"
                        alt="Arijit De"
                        className="w-full h-full object-cover object-[center_42%]"
                      />
                    </div>
                    <h3 className="text-base font-bold font-chillax text-primary">Arijit De</h3>
                    <p className="text-[11px] text-muted-foreground font-mono font-semibold">Certified MFD & Portfolio Distributor</p>
                    <p className="text-xs text-foreground/80 leading-relaxed font-sans font-medium">
                      “True financial freedom is built through patience and structured asset allocation, not chasing speculative cycles.”
                    </p>
                  </div>
                </div>

                {/* Bottom Flip Cue */}
                <div className="w-full flex items-center justify-center gap-1.5 pt-2 text-[11px] font-mono font-bold text-muted-foreground group-hover:text-primary transition-colors relative z-10">
                  <RotateCw className="w-3.5 h-3.5 transform group-hover:rotate-180 transition-transform duration-500" />
                  <span>Click card to flip back</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollBlurReveal>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="w-full bg-transparent relative z-10 py-32">
        <div className="w-full max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start relative">

          {/* Left Column: Title & FAQ List */}
          <div className="lg:col-span-7 flex flex-col gap-12 text-left w-full">
            <ScrollBlurReveal className="flex flex-col gap-4">
              <span className="text-[10px] md:text-sm uppercase text-muted-foreground font-clash font-bold tracking-wider">
                Common Inquiries
              </span>
              <h2 className="text-4xl md:text-[5rem] leading-[1.05] text-primary tracking-tight font-normal">
                <span className="font-clash">Frequently</span>{" "}
                <span className="font-clash font-medium tracking-tight">asked</span>
                <span className="block font-clash font-medium tracking-tight">questions</span>
              </h2>
            </ScrollBlurReveal>

            {/* Interactive Accordion List */}
            <ScrollBlurReveal className="w-full">
              <div className="flex flex-col w-full border-t border-border mt-6">
              {faqData.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border-b border-border py-6 flex flex-col text-left transition-colors duration-300"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="flex justify-between items-center w-full gap-4 text-left focus:outline-none group py-1"
                    >
                      <h3 className={`text-base md:text-lg font-medium tracking-wide transition-colors duration-300 font-clash ${isOpen ? "text-primary font-semibold" : "text-foreground group-hover:text-primary"
                        }`}>
                        {faq.question}
                      </h3>

                      {/* Expand/Collapse Chevron Indicator */}
                      <span className={`text-xl md:text-2xl transition-transform duration-500 text-muted-foreground ${isOpen ? "text-primary rotate-180" : "group-hover:text-primary"
                        }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </button>

                    {/* Accordion description container */}
                    <div className={`grid transition-all duration-[400ms] ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"
                      }`}>
                      <div className="overflow-hidden">
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-sans pr-4 pb-4 pt-1">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            </ScrollBlurReveal>
          </div>

          {/* Right Column: Sticky Call Booking Widget */}
          <div className="lg:col-span-5 w-full lg:sticky lg:top-32 flex justify-center lg:justify-end mt-12 lg:mt-0">
            <ScrollBlurReveal className="w-full max-w-sm">
              <div className="w-full rounded-[2.5rem] p-8 md:p-10 bg-white/30 backdrop-blur-2xl border border-border shadow-[0_20px_50px_rgba(147,197,253,0.12)] relative overflow-hidden flex flex-col text-left text-foreground group hover:scale-[1.02] transition-transform duration-500">
                {/* Local Box Background (Book Call Image) inside the card */}
                <div className="absolute inset-0 z-0 select-none pointer-events-none opacity-90">
                  <img
                    src="/assets/bookcall.jpeg"
                    alt="Book Call Background"
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle overlay to ensure text contrast */}
                  <div className="absolute inset-0 bg-white/10" />
                </div>

                {/* Call-to-action Heading */}
                <h3 className="text-3xl md:text-4xl font-semibold leading-tight mb-8 font-clash relative z-10 text-primary">
                  Book a 15-min<br />intro call
                </h3>

                {/* Booking Link */}
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full block py-4 px-6 rounded-2xl bg-primary text-primary-foreground font-semibold text-center hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-md cursor-pointer relative z-10 font-clash"
                >
                  Book a call
                </button>

                {/* Divider Line */}
                <div className="w-full h-[1px] bg-border my-8 relative z-10" />

                {/* Footer section with email and arrow button */}
                <div className="flex justify-between items-center relative z-10 w-full">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Prefer to email?</span>
                    <a
                      href="mailto:arijit1504@gmail.com"
                      className="text-sm font-semibold hover:underline text-primary font-mono"
                    >
                      arijit1504@gmail.com
                    </a>
                  </div>

                  <a
                    href="mailto:arijit1504@gmail.com"
                    className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-110 hover:bg-primary/90 active:scale-95 transition-all duration-300 shadow-md cursor-pointer flex-shrink-0"
                    aria-label="Send email"
                  >
                    <svg className="w-5 h-5 transform stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </a>
                </div>
              </div>
            </ScrollBlurReveal>
          </div>

        </div>
      </div>

      {/* Hello Text Section */}
      <div ref={helloSectionRef} className="w-full relative z-10 bg-transparent select-none">
        <div className="w-full flex flex-col items-center justify-center px-6 py-2">
          <ScrollBlurReveal className="w-full max-w-5xl mx-auto text-center flex flex-col items-center justify-center">
            <div ref={envelopeRef} className="w-32 h-32 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 relative z-0 flex items-center justify-center">
              <DotLottieReact
                src="/looney-10.json"
                loop
                autoplay
                className="w-full h-full object-contain pointer-events-none select-none"
              />
            </div>
          </ScrollBlurReveal>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="w-full bg-transparent relative z-10 pt-10 pb-24 overflow-hidden">
        <ScrollBlurReveal className="w-full max-w-xl mx-auto px-6">
          <div className="relative text-left">
            <div className="text-center space-y-3 mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/10 bg-white/60 text-xs font-semibold text-primary font-mono select-none shadow-xs">
                <span>✦ DIRECT CONSULTATION</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-primary font-chillax leading-tight">
                Connect With Us
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed font-sans max-w-sm mx-auto font-medium">
                Drop us a message and we will get back to you shortly to analyze your portfolio.
              </p>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4 text-left">
              {contactError && (
                <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-600 text-xs font-sans flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{contactError}</span>
                </div>
              )}

              {contactSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-600 text-xs font-sans flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Message sent successfully! Scroll down to see confirmation.</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block font-bold">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Your Name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-white/40 border border-border rounded-xl p-3 text-xs text-foreground placeholder-slate-400 focus:outline-none focus:border-primary font-sans transition duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block font-bold">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. youremail@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-white/40 border border-border rounded-xl p-3 text-xs text-foreground placeholder-slate-400 focus:outline-none focus:border-primary font-sans transition duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block font-bold">Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your current investment targets or details..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full bg-white/40 border border-border rounded-xl p-3 text-xs text-foreground placeholder-slate-400 focus:outline-none focus:border-primary font-sans transition duration-200 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={contactSubmitting}
                className="w-full mt-2 py-3.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-sm uppercase tracking-wider disabled:opacity-50"
              >
                {contactSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Sending Message...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
              {contactSuccess && (
                <div className="text-center mt-3 text-emerald-600 text-xs font-semibold flex items-center justify-center gap-1.5 animate-in fade-in duration-300">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Message sent successfully!</span>
                </div>
              )}
            </form>
          </div>
        </ScrollBlurReveal>
      </div>

      <Footer footerRef={footerRef} onBookCallClick={() => setIsBookingModalOpen(true)} />

      <BookCallModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />

      {/* Preloader Overlay Screen (Slides down smoothly) */}
      {showPreloader && (
        <div
          id="preloader-screen"
          className={`fixed inset-0 z-50 flex flex-col justify-between bg-[#F2F0EF] p-12 md:p-20 transition-transform duration-[1000ms] ease-[cubic-bezier(0.85,0,0.15,1)] ${isLoaded ? "translate-y-full" : "translate-y-0"
            }`}
        >
          {/* Top Row: Brand Info */}
          <div className="flex justify-between items-start w-full">
            <div className="flex items-center gap-4">
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-primary tracking-wide">Arijit De ©2026</span>
              </div>
            </div>
          </div>

          {/* Middle Row: GIF player */}
          <div className="flex-1 flex items-center justify-center w-full max-w-[280px] mx-auto my-4">
            <img
              src="/assets/video.gif"
              alt="Preloader animation"
              className="w-full h-auto rounded-xl"
            />
          </div>

          {/* Bottom Row: Counter on the Right */}
          <div className="flex justify-end items-end w-full">
            {/* Display Counter */}
            <div className="text-right">
              <span className="text-8xl md:text-[10rem] font-bold text-primary tracking-tight font-clash select-none leading-none">
                {count}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chatbot Widget */}
      <ChatbotWidget
        isFooterIntersecting={isFooterIntersecting}
        isOpen={isChatOpen}
        onOpenChange={setIsChatOpen}
      />

      {/* Cookie Acceptance Banner */}
      {showCookieBox && isLoaded && (
        <div className="fixed bottom-6 left-6 z-50 w-[calc(100vw-3rem)] max-w-xs p-5 rounded-3xl bg-white/35 backdrop-blur-2xl border border-border shadow-xl text-left flex flex-col gap-4 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/5 border border-primary/10 text-primary">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-3-4c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm6 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1-5.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-primary font-clash">Cookie Preferences</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 font-sans">
                We use cookies to analyze traffic, remember preferences, and optimize your portfolio health report. Read our <a href="/cookies" className="underline hover:text-primary transition duration-200">Cookies Policy</a>.
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => {
                localStorage.setItem("cookieConsent", "accepted");
                setShowCookieBox(false);
              }}
              className="flex-1 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-[9px] rounded-lg uppercase tracking-wider transition-all duration-200"
            >
              Accept
            </button>
            <button
              onClick={() => {
                localStorage.setItem("cookieConsent", "declined");
                setShowCookieBox(false);
              }}
              className="flex-1 py-2 bg-transparent border border-border hover:bg-black/5 text-slate-500 hover:text-primary font-bold text-[9px] rounded-lg uppercase tracking-wider transition-all duration-200"
            >
              Decline
            </button>
          </div>
        </div>
      )}

    </main>
  );
}

