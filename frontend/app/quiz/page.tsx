'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Share2,
  Download,
  ChevronRight,
  Info,
  Sparkles,
  AlertCircle,
  ShieldAlert,
  Award,
  FileText,
  TrendingUp,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import SoftBoxBlurBg from '@/components/SoftBoxBlurBg';
import GradualBlur from '@/components/GradualBlur';

// ──── Types ────
type Archetype = 'Tiger' | 'Elephant' | 'Deer' | 'Fox' | 'Lion';

interface QuestionOption {
  text: string;
  weights: Partial<Record<Archetype, number>>;
}

interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
}

// Helper to draw rounded rectangle in HTML5 Canvas
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | { tl: number; tr: number; br: number; bl: number },
) {
  let r: { tl: number; tr: number; br: number; bl: number };
  if (typeof radius === 'number') {
    r = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    r = radius;
  }
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + width - r.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r.tr);
  ctx.lineTo(x + width, y + height - r.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r.br, y + height);
  ctx.lineTo(x + r.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.quadraticCurveTo(x, y, x + r.tl, y);
}

// ──── Questions Configuration ────
const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "You're at a restaurant and the menu has 40 options. What do you usually do?",
    options: [
      {
        text: 'Quickly pick something familiar and close the menu',
        weights: { Elephant: 2, Deer: 1 },
      },
      {
        text: 'Scan everything and pick the most interesting thing',
        weights: { Fox: 2, Tiger: 1 },
      },
      {
        text: "Ask the waiter what's best and decide from that",
        weights: { Deer: 2 },
      },
      {
        text: 'Already knew what you wanted before you sat down',
        weights: { Lion: 3 },
      },
    ],
  },
  {
    id: 2,
    text: "You've been planning a trip for 3 months. Two days before, a better destination comes up at the same budget. What do you do?",
    options: [
      {
        text: "Stick to the original plan — you've already committed",
        weights: { Elephant: 3 },
      },
      { text: 'Switch immediately — better is better', weights: { Tiger: 3 } },
      {
        text: 'Get anxious and probably delay the decision',
        weights: { Deer: 3 },
      },
      {
        text: "Quickly compare both and switch only if it's clearly worth it",
        weights: { Fox: 2, Lion: 1 },
      },
    ],
  },
  {
    id: 3,
    text: "Your phone battery is at 12%. You're not near a charger. What do you do?",
    options: [
      { text: "Keep using it normally — it'll last", weights: { Tiger: 2 } },
      {
        text: 'Immediately switch to battery saver and ration usage',
        weights: { Elephant: 3 },
      },
      {
        text: "Start panicking and borrow someone's charger urgently",
        weights: { Deer: 3 },
      },
      {
        text: 'Mentally calculate how long you need it and manage accordingly',
        weights: { Lion: 2, Fox: 1 },
      },
    ],
  },
  {
    id: 4,
    text: "A friend tells you about a business opportunity that could double your money in 6 months but has some risk. What's your first reaction?",
    options: [
      { text: 'Excited — tell me more', weights: { Tiger: 3 } },
      { text: "Skeptical — what's the catch?", weights: { Lion: 2, Fox: 1 } },
      { text: 'Not interested — sounds risky', weights: { Deer: 3 } },
      {
        text: 'Curious but want to research before deciding',
        weights: { Fox: 2, Elephant: 1 },
      },
    ],
  },
  {
    id: 5,
    text: "How do you feel when you're watching a cricket match and your team is losing badly in the first half?",
    options: [
      { text: 'Frustrated — I might switch off', weights: { Tiger: 2 } },
      {
        text: "Calm — there's still time to turn it around",
        weights: { Elephant: 3 },
      },
      {
        text: 'Worried — I start preparing mentally for a loss',
        weights: { Deer: 3 },
      },
      {
        text: 'Analyzing what went wrong and what needs to change',
        weights: { Lion: 2, Fox: 1 },
      },
    ],
  },
  {
    id: 6,
    text: "You've started a new diet or fitness routine. After 2 weeks, you see no visible results. What happens?",
    options: [
      { text: "Give it up — it's clearly not working", weights: { Tiger: 3 } },
      { text: 'Stay consistent — results take time', weights: { Elephant: 3 } },
      {
        text: 'You never really started consistently in the first place',
        weights: { Deer: 3 },
      },
      {
        text: "Research if you're doing it right and adjust",
        weights: { Fox: 2, Lion: 1 },
      },
    ],
  },
  {
    id: 7,
    text: "Imagine you have ₹10,000 saved. A sale is happening today only — 40% off on something you've wanted for a year. But this money was meant for something else next month. What do you do?",
    options: [
      {
        text: "Buy it — opportunity like this won't come again",
        weights: { Tiger: 3, Fox: 2 },
      },
      { text: 'Skip it — the plan was already set', weights: { Elephant: 3 } },
      {
        text: 'Feel torn, delay the decision, and probably miss both',
        weights: { Deer: 3 },
      },
      {
        text: 'Buy it only if the original plan can be adjusted',
        weights: { Lion: 2 },
      },
    ],
  },
  {
    id: 8,
    text: "You're playing a board game and you're winning comfortably. Someone offers a high-risk power move that could either make you win bigger or collapse your lead. Do you take it?",
    options: [
      { text: 'Absolutely — go big or go home', weights: { Tiger: 3 } },
      { text: 'No — protect the lead', weights: { Elephant: 3 } },
      {
        text: 'Hesitate and probably let the moment pass',
        weights: { Deer: 3 },
      },
      {
        text: 'Take it only if the odds make mathematical sense',
        weights: { Fox: 2, Lion: 2 },
      },
    ],
  },
  {
    id: 9,
    text: "You invested in something 8 months ago and it hasn't moved much. What's going through your mind?",
    options: [
      {
        text: 'Getting impatient — should have picked something else',
        weights: { Tiger: 3 },
      },
      { text: 'Not worried — good things take time', weights: { Elephant: 3 } },
      {
        text: 'Regretting the decision and thinking about pulling out',
        weights: { Deer: 3 },
      },
      {
        text: 'Reviewing if the original thesis still holds',
        weights: { Fox: 2, Lion: 2 },
      },
    ],
  },
  {
    id: 10,
    text: 'A colleague got a big raise. How does that make you feel?',
    options: [
      {
        text: 'Motivated — I want that too, and faster',
        weights: { Tiger: 2 },
      },
      {
        text: 'Happy for them, focused on my own path',
        weights: { Elephant: 3 },
      },
      { text: 'Slightly anxious — am I falling behind?', weights: { Deer: 3 } },
      {
        text: 'Curious about what they did differently',
        weights: { Fox: 2, Lion: 1 },
      },
    ],
  },
  {
    id: 11,
    text: "You're choosing between two job offers. Job A pays more but is unstable. Job B pays less but is very secure. Which do you pick?",
    options: [
      { text: 'Job A — higher risk, higher reward', weights: { Tiger: 3 } },
      {
        text: 'Job B — stability matters more',
        weights: { Elephant: 3, Deer: 1 },
      },
      {
        text: 'Neither — keep looking until something better comes',
        weights: { Deer: 2 },
      },
      {
        text: 'Job A, but only after negotiating a safety net',
        weights: { Lion: 3 },
      },
    ],
  },
  {
    id: 12,
    text: "You're watching your favorite show and 3 episodes in, it gets slow. What do you do?",
    options: [
      { text: 'Skip ahead or switch to something else', weights: { Tiger: 3 } },
      {
        text: 'Keep watching — slow builds are usually worth it',
        weights: { Elephant: 3 },
      },
      { text: 'Stop watching and never come back to it', weights: { Deer: 2 } },
      {
        text: 'Check reviews to see if it gets better before deciding',
        weights: { Fox: 2, Lion: 1 },
      },
    ],
  },
  {
    id: 13,
    text: "You get an unexpected ₹20,000 bonus. What's the most natural thing you'd do with it?",
    options: [
      {
        text: 'Put it into something that could grow fast',
        weights: { Tiger: 3 },
      },
      {
        text: 'Add it to existing savings or investments quietly',
        weights: { Elephant: 3 },
      },
      {
        text: "Keep it in your account — you'll figure it out later",
        weights: { Deer: 3 },
      },
      { text: 'Split it — part safe, part experimental', weights: { Fox: 3 } },
    ],
  },
  {
    id: 14,
    text: 'How do you react when the stock market falls 10% in a week and everyone around you is panicking?',
    options: [
      { text: 'See it as a buying opportunity', weights: { Tiger: 3 } },
      {
        text: 'Stay calm — this has happened before and recovered',
        weights: { Elephant: 3 },
      },
      {
        text: 'Feel anxious and consider moving money to safety',
        weights: { Deer: 3 },
      },
      {
        text: "Analyze sectors — some fell for a reason, some didn't",
        weights: { Fox: 2, Lion: 2 },
      },
    ],
  },
  {
    id: 15,
    text: "You've been saving for something big for 2 years. You're 70% there. A trusted person says there's a smarter way to get there faster. Do you listen?",
    options: [
      {
        text: 'Yes, immediately — faster is always better',
        weights: { Tiger: 2 },
      },
      {
        text: 'Politely listen but stick to your plan',
        weights: { Elephant: 3 },
      },
      { text: 'Feel confused and unsure what to do', weights: { Deer: 3 } },
      {
        text: 'Evaluate their suggestion seriously before deciding',
        weights: { Lion: 3, Fox: 1 },
      },
    ],
  },
];

// ──── Results Content Configuration ────
interface ArchetypeDetails {
  emoji: string;
  headline: string;
  description: string;
  traits: string[];
  strength: string;
  risk: string;
  insight: string;
  cta: string;
  shareText: string;
}

const RESULT_DETAILS: Record<Archetype, ArchetypeDetails> = {
  Tiger: {
    emoji: '🐅',
    headline: "You don't wait for opportunities. You create them.",
    description:
      "You move fast, think big, and aren't afraid of market turbulence. While others hesitate, you act. Growth isn't just a goal for you — it's a standard.",
    traits: [
      'High risk tolerance',
      'Action-oriented decision making',
      'Strong growth ambition',
    ],
    strength:
      'You can generate significant wealth when markets are in your favor.',
    risk: 'Impatience during downturns can lead to premature exits right before recovery.',
    insight:
      'Your personality is built for equity-heavy portfolios and long-horizon growth funds. But without structure, aggression becomes a liability. A disciplined allocation plan will channel your instincts into real, compounding wealth.',
    cta: "Now that you know you're a Tiger — let's find out if your portfolio is keeping up with you. Upload your portfolio and get a personalized score.",
    shareText:
      "I just took the FinAnalysis Investor Personality Test and I'm a 🐅 Tiger Investor! Find out your type →",
  },
  Elephant: {
    emoji: '🐘',
    headline: 'Slow. Steady. Unstoppable.',
    description:
      "You understand that real wealth isn't built overnight. You stay the course when others panic, and that consistency is your superpower. Markets go up and down — you just keep walking.",
    traits: [
      'Long-term discipline',
      'Emotional stability',
      'Consistent execution',
    ],
    strength:
      "You're built for compounding. Time in the market, not timing the market — that's your edge.",
    risk: 'Being too conservative can mean missing high-growth phases that significantly accelerate wealth creation.',
    insight:
      "Balanced and hybrid funds are your natural home. But consider allocating a small portion — 15 to 20% — to growth-oriented equity to ensure your portfolio doesn't fall behind inflation over the long run.",
    cta: "You've got the mindset. Now let's see if your portfolio has the structure to match it. Upload your portfolio for a full analysis.",
    shareText:
      "I just took the FinAnalysis Investor Personality Test and I'm a 🐘 Elephant Investor! Find out your type →",
  },
  Deer: {
    emoji: '🦌',
    headline: "You see the opportunity. You just haven't stepped in yet.",
    description:
      "Caution is not a weakness — it's wisdom, as long as it doesn't become paralysis. You care deeply about protecting what you have, and that's a valuable instinct. The key is learning when to move.",
    traits: [
      'High loss aversion',
      'Preference for safety',
      'Deliberate decision-making',
    ],
    strength: 'You rarely make impulsive decisions that destroy capital.',
    risk: 'Staying on the sidelines too long means inflation quietly erodes your savings while others build wealth.',
    insight:
      'Debt funds, liquid funds, and conservative hybrid funds are your starting point. Structured SIPs — small, automatic, no-decision-required — are designed exactly for your personality. Start small, stay consistent, and let the system do the work.',
    cta: "The first step is understanding where you stand today. Upload your portfolio — or start fresh — and we'll show you a safe, structured path forward.",
    shareText:
      "I just took the FinAnalysis Investor Personality Test and I'm a 🦌 Deer Investor! Find out your type →",
  },
  Fox: {
    emoji: '🦊',
    headline: 'You spot what others miss.',
    description:
      "You're always watching. Always adapting. Where others see chaos, you see patterns and possibilities. Your tactical mind gives you an edge — but only when paired with patience.",
    traits: [
      'Opportunistic thinking',
      'Tactical adaptability',
      'High curiosity',
    ],
    strength:
      'You can identify and act on opportunities faster than most investors.',
    risk: 'Constantly switching strategies means you often exit positions before they deliver their full return.',
    insight:
      'Dynamic asset allocation funds and sector rotation strategies suit your style. But build a core stable portfolio first — 60% disciplined, 40% tactical — so your instincts enhance your wealth instead of disrupting it.',
    cta: "Let's see if your portfolio reflects your tactical edge — or if it's working against you. Upload it now for a full breakdown.",
    shareText:
      "I just took the FinAnalysis Investor Personality Test and I'm a 🦊 Fox Investor! Find out your type →",
  },
  Lion: {
    emoji: '🦁',
    headline: 'You lead. Even in your finances.',
    description:
      "You make decisions with conviction and don't second-guess yourself. You have a vision for where you want to go and a mindset to get there. Confidence is your greatest asset — and your greatest test.",
    traits: [
      'Goal-driven discipline',
      'High conviction decision-making',
      'Leadership mindset',
    ],
    strength:
      'You set clear financial goals and pursue them with focus that most investors never develop.',
    risk: 'Overconfidence can lead to under-researched decisions and blind spots in your portfolio.',
    insight:
      'Direct equity, flexi-cap funds, and goal-based portfolio structures are built for your personality. But build in a review mechanism — your conviction needs to be tested against data regularly to stay sharp.',
    cta: "A Lion without a strategy is just ambition. Let's build yours. Upload your portfolio and see exactly where you stand.",
    shareText:
      "I just took the FinAnalysis Investor Personality Test and I'm a 🦁 Lion Investor! Find out your type →",
  },
};

// ──── Archetype Styles & HSL Colors ────
interface ArchetypeTheme {
  bgGrad: string;
  textColor: string;
  accentBg: string;
  borderColor: string;
  pillBg: string;
  accentHex: string;
  badgeBg: string;
  glowColor: string;
}

const ARCHETYPE_THEMES: Record<Archetype, ArchetypeTheme> = {
  Tiger: {
    bgGrad:
      'bg-gradient-to-br from-amber-50 to-orange-100/60 dark:from-neutral-900 dark:to-orange-950/20',
    textColor: 'text-orange-600 dark:text-orange-400',
    accentBg:
      'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
    borderColor: 'border-orange-200 dark:border-orange-900/50',
    pillBg: 'bg-orange-600 hover:bg-orange-700 text-white',
    accentHex: '#EA580C',
    badgeBg: 'bg-orange-500/10 border-orange-500/20 text-orange-600',
    glowColor: 'rgba(249, 115, 22, 0.15)',
  },
  Elephant: {
    bgGrad:
      'bg-gradient-to-br from-slate-50 to-blue-100/60 dark:from-neutral-900 dark:to-blue-950/20',
    textColor: 'text-slate-600 dark:text-slate-400',
    accentBg:
      'bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400',
    borderColor: 'border-slate-200 dark:border-slate-800',
    pillBg: 'bg-slate-600 hover:bg-slate-700 text-white',
    accentHex: '#475569',
    badgeBg: 'bg-slate-500/10 border-slate-500/20 text-slate-600',
    glowColor: 'rgba(71, 85, 105, 0.15)',
  },
  Deer: {
    bgGrad:
      'bg-gradient-to-br from-emerald-50 to-teal-100/60 dark:from-neutral-900 dark:to-emerald-950/20',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    accentBg:
      'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-900/50',
    pillBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    accentHex: '#059669',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600',
    glowColor: 'rgba(5, 150, 105, 0.15)',
  },
  Fox: {
    bgGrad:
      'bg-gradient-to-br from-indigo-50 to-purple-100/60 dark:from-neutral-900 dark:to-indigo-950/20',
    textColor: 'text-indigo-600 dark:text-indigo-400',
    accentBg:
      'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
    borderColor: 'border-indigo-200 dark:border-indigo-900/50',
    pillBg: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    accentHex: '#4F46E5',
    badgeBg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600',
    glowColor: 'rgba(79, 70, 229, 0.15)',
  },
  Lion: {
    bgGrad:
      'bg-gradient-to-br from-yellow-50 to-amber-100/60 dark:from-neutral-900 dark:to-amber-950/20',
    textColor: 'text-yellow-600 dark:text-yellow-500',
    accentBg:
      'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-500',
    borderColor: 'border-yellow-200 dark:border-yellow-900/50',
    pillBg: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    accentHex: '#CA8A04',
    badgeBg: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600',
    glowColor: 'rgba(202, 138, 4, 0.15)',
  },
};

export default function Quiz() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [step, setStep] = useState(0); // 0 = Intro, 1..15 = Qs, 16 = Result
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [hasCachedResult, setHasCachedResult] = useState(false);
  // Mount animation
  useEffect(() => {
    document.title = 'Investor Personality Test | FinAnalysis';
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    // Check if result is cached in localStorage
    if (localStorage.getItem('investorQuizResult')) {
      setHasCachedResult(true);
    }

    return () => clearTimeout(timer);
  }, []);

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));

    // Smooth transition between questions
    setTimeout(() => {
      if (questionId < 15) {
        setStep((prev) => prev + 1);
      } else {
        setStep(16);
      }
    }, 250);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    } else {
      setStep(0);
    }
  };

  const loadCachedResult = () => {
    const cached = localStorage.getItem('investorQuizResult');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.answers) {
          setAnswers(parsed.answers);
          setStep(16);
        }
      } catch (err) {
        console.error('Failed to parse cached quiz results', err);
      }
    }
  };

  const startNewQuiz = () => {
    setAnswers({});
    setStep(1);
  };

  // ──── Scoring Logic (Part 3 & 4) ────
  const getResults = () => {
    const scores: Record<Archetype, number> = {
      Tiger: 0,
      Elephant: 0,
      Deer: 0,
      Fox: 0,
      Lion: 0,
    };

    QUESTIONS.forEach((q) => {
      const selectedOptionIdx = answers[q.id];
      if (selectedOptionIdx !== undefined) {
        const option = q.options[selectedOptionIdx];
        Object.entries(option.weights).forEach(([arch, weight]) => {
          scores[arch as Archetype] += weight || 0;
        });
      }
    });

    const maxScores: Record<Archetype, number> = {
      Tiger: 39,
      Elephant: 42,
      Deer: 42,
      Fox: 28,
      Lion: 27,
    };

    const normalized: Record<Archetype, number> = {
      Tiger: 0,
      Elephant: 0,
      Deer: 0,
      Fox: 0,
      Lion: 0,
    };

    Object.keys(scores).forEach((key) => {
      const arch = key as Archetype;
      normalized[arch] = (scores[arch] / maxScores[arch]) * 100;
    });

    // Winner = highest normalized score
    const sorted = Object.entries(normalized).sort((a, b) => b[1] - a[1]) as [
      Archetype,
      number,
    ][];

    const archetype = sorted[0][0];
    const winnerNormalized = sorted[0][1];
    const secondHighest = sorted[1] ? sorted[1][1] : 0;

    // Part 4: Gap-based confidence score adjustment
    const confidenceScoreVal = (normScore: number, secHighest: number) => {
      const gap = normScore - secHighest;
      if (gap >= 20) return Math.min(normScore + 10, 99); // Clear winner
      if (gap >= 10) return normScore; // Solid result
      if (gap >= 5) return Math.max(normScore - 5, 60); // Slight lean
      return Math.max(normScore - 10, 55); // Mixed profile
    };

    const confidence = Math.round(
      confidenceScoreVal(winnerNormalized, secondHighest),
    );
    const ranked = sorted.slice(0, 3).map((e) => e[0]);

    // Save to cache
    localStorage.setItem(
      'investorQuizResult',
      JSON.stringify({
        archetype,
        confidence,
        ranked,
        answers,
        timestamp: Date.now(),
      }),
    );

    return { archetype, confidence, ranked, scores, normalized };
  };

  const currentResult = step === 16 ? getResults() : null;
  const currentDetails = currentResult
    ? RESULT_DETAILS[currentResult.archetype]
    : null;
  const currentTheme = currentResult
    ? ARCHETYPE_THEMES[currentResult.archetype]
    : null;

  // ──── Share Native API / Copy clipboard ────
  const handleShare = () => {
    if (!currentResult || !currentDetails) return;
    const shareUrl =
      typeof window !== 'undefined'
        ? window.location.origin + '/quiz'
        : 'https://finanalysis.in/quiz';

    if (navigator.share) {
      navigator
        .share({
          title: 'My Investor Personality — FinAnalysis',
          text: currentDetails.shareText,
          url: shareUrl,
        })
        .catch((err) => console.log('Error sharing:', err));
    } else {
      navigator.clipboard
        .writeText(`${currentDetails.shareText} ${shareUrl}`)
        .then(() => {
          setShareFeedback('Result link copied to clipboard!');
          setTimeout(() => setShareFeedback(null), 3000);
        })
        .catch(() => {
          setShareFeedback('Failed to copy link.');
          setTimeout(() => setShareFeedback(null), 3000);
        });
    }
  };

  // ──── PNG Image Exporter (HTML5 Canvas) ────
  const handleExportPNG = () => {
    if (!currentResult || !currentDetails || !currentTheme) return;
    const { archetype, confidence } = currentResult;

    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // 1. Draw Background Base
    ctx.fillStyle = '#FAF6F0';
    ctx.fillRect(0, 0, 480, 720);

    // 2. Draw Soft Corner Gradients (Archetype accents)
    const radGrad = ctx.createRadialGradient(240, 360, 50, 240, 360, 400);
    radGrad.addColorStop(0, hexToRgba(currentTheme.accentHex, 0.35));
    radGrad.addColorStop(0.6, hexToRgba(currentTheme.accentHex, 0.1));
    radGrad.addColorStop(1, 'rgba(250, 246, 240, 0)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, 480, 720);

    // 3. Draw Inner Card container (ID card outline)
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    roundRect(ctx, 40, 40, 400, 640, 28);
    ctx.fill();
    ctx.restore();

    // 4. Draw Inner Card border outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    roundRect(ctx, 40, 40, 400, 640, 28);
    ctx.stroke();

    // 5. Draw Header Branding (Clean centered layout)
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('FINANALYSIS', 240, 80);

    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('INVESTOR PERSONALITY DIAGNOSTIC', 240, 110);

    // Subtle Divider Line
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(80, 135);
    ctx.lineTo(400, 135);
    ctx.stroke();

    // 6. Draw Emoji (System native font)
    ctx.font = '110px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentDetails.emoji, 240, 200);

    // 7. Draw Archetype Title & Subtitle (Centered)
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${archetype.toUpperCase()} INVESTOR`, 240, 285);

    ctx.fillStyle = '#64748B';
    ctx.font = '600 10px sans-serif';
    ctx.fillText('INVESTOR ARCHETYPE', 240, 315);

    // 8. Draw Confidence Badge
    const confidenceText = `CONFIDENCE: ${confidence}%`;
    ctx.font = 'bold 11px sans-serif';
    const textWidth = ctx.measureText(confidenceText).width;
    const pillWidth = textWidth + 24;

    ctx.fillStyle = currentTheme.accentHex;
    ctx.beginPath();
    roundRect(ctx, 240 - pillWidth / 2, 340, pillWidth, 26, 13);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(confidenceText, 240, 353);

    // 9. Draw Headline
    ctx.fillStyle = '#475569';
    ctx.font = 'italic 16px sans-serif';
    ctx.fillText(`"${currentDetails.headline}"`, 240, 400);

    // Divider Line above traits
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(80, 425);
    ctx.lineTo(400, 425);
    ctx.stroke();

    // 10. Draw Traits List (Stacked Vertically to avoid horizontal boundaries overlap)
    ctx.font = '600 11px sans-serif';
    const traitHeights = 26;
    const traitGap = 9;

    let currentY = 445;
    currentDetails.traits.forEach((trait) => {
      const w = ctx.measureText(trait).width + 24;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      roundRect(ctx, 240 - w / 2, currentY, w, traitHeights, 13);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#334155';
      ctx.font = '600 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(trait, 240, currentY + traitHeights / 2);
      currentY += traitHeights + traitGap;
    });

    // Divider Line above barcode
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(80, 552);
    ctx.lineTo(400, 552);
    ctx.stroke();

    // 11. Draw Barcode at the bottom
    ctx.fillStyle = '#000000';
    let barX = 240 - 59; // Center barcode (actual width is ~118px)
    const barY = 565;
    const barHeight = 25;
    const barcodePattern = [
      2, 1, 3, 1, 1, 2, 4, 1, 1, 3, 2, 2, 1, 1, 3, 1, 2, 1, 4, 1, 2, 2, 1, 3, 1,
      1, 2,
    ];
    barcodePattern.forEach((w, index) => {
      if (index % 2 === 0) {
        ctx.fillRect(barX, barY, w * 1.5, barHeight);
      }
      barX += w * 1.5 + (index % 3 === 0 ? 1 : 2);
    });

    // Serial number label under barcode
    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(
      `FA-${archetype.substring(0, 3).toUpperCase()}-${confidence}-${Math.floor(1000 + Math.random() * 9000)}`,
      240,
      595,
    );

    // 12. Draw Footer Label
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('TAKE THE QUIZ AT FINANALYSIS.IN', 240, 610);

    // 13. Save File download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `finanalysis-${archetype.toLowerCase()}-investor.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <main className="relative min-h-screen w-full bg-transparent text-foreground flex flex-col font-clash overflow-x-hidden">
      {/* Dynamic Glow and Background */}
      <div
        className="page-backdrop fixed inset-0 z-0 select-none pointer-events-none transition-all duration-[1000ms] ease-out"
        style={{
          backgroundImage: currentTheme
            ? `radial-gradient(circle at 50% calc(100% - var(--backdrop-bleed)), ${currentTheme.glowColor} 0%, rgba(186,230,253,0.15) 45%, rgba(242,240,239,0) 85%)`
            : 'none',
        }}
      >
        <SoftBoxBlurBg />
      </div>

      <Navbar isLoaded={isLoaded} activePath="/quiz" />

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 pt-32 pb-20 w-full max-w-5xl mx-auto">
        {/* Back navigation inside quiz */}
        {step > 0 && step < 16 && (
          <button
            onClick={handleBack}
            className="self-start flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary mb-6 transition-colors duration-200 bg-white/30 border border-white/30 backdrop-blur-xl rounded-xl px-4 py-2 hover:bg-white/50 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        )}

        {/* ──── STEP 0: INTRO SCREEN ──── */}
        {step === 0 && (
          <div
            className={`w-full text-center flex flex-col items-center justify-center transition-all duration-[1000ms] ease-out ${
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-foreground mb-4 font-instrument-serif max-w-3xl">
              Discover Your Investor Personality
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mb-12 font-sans leading-relaxed">
              Answer 15 quick situational questions to uncover your risk
              tolerance, key behavioral traits, strengths, and customized
              investment insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
              <button
                onClick={startNewQuiz}
                className="px-8 py-4 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-2xl transition duration-200 shadow-md uppercase tracking-wider flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Start Personality Test</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {hasCachedResult && (
                <button
                  onClick={loadCachedResult}
                  className="px-8 py-4 bg-white/45 border border-border hover:bg-white/70 text-primary font-bold text-xs rounded-2xl transition duration-200 shadow-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>View Last Result</span>
                </button>
              )}
            </div>

            {/* Benefit Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mt-20 text-left w-full">
              {[
                {
                  title: 'Zero Math',
                  desc: 'No complex spreadsheets. Just simple choices on how you live and think.',
                },
                {
                  title: '3-Min Diagnostic',
                  desc: '15 simple scenarios. Immediate evaluation on archetype profiles.',
                },
                {
                  title: 'Actionable Insights',
                  desc: 'Get structural suggestions on portfolio allocation for your profile.',
                },
              ].map((b, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-white/20 border border-white/25 rounded-2xl backdrop-blur-md"
                >
                  <span className="text-xs font-mono font-bold text-primary bg-white/40 border border-border/50 w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-3">
                    0{idx + 1}
                  </span>
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wide mb-1 font-clash">
                    {b.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground font-sans leading-normal">
                    {b.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ──── STEPS 1..15: QUESTIONS ──── */}
        {step >= 1 &&
          step <= 15 &&
          (() => {
            const q = QUESTIONS[step - 1];
            const progress = (step / 15) * 100;
            return (
              <div className="w-full max-w-2xl bg-white/30 border border-white/20 rounded-3xl p-6 md:p-10 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300 text-left">
                {/* Progress bar header */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-semibold">
                    Question {step} of 15
                  </span>
                  <span className="text-[10px] font-mono text-primary font-bold">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <div className="w-full h-1.5 bg-neutral-200/50 rounded-full mb-10 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-350 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Question Text */}
                <h2 className="text-xl md:text-2xl font-bold text-neutral-900 font-clash leading-snug">
                  {q.text}
                </h2>

                {/* Options list */}
                <div className="grid grid-cols-1 gap-4 mt-10">
                  {q.options.map((opt, optIdx) => {
                    const label = ['A', 'B', 'C', 'D'][optIdx];
                    const isSelected = answers[q.id] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`w-full text-left p-5 border rounded-2xl transition-all duration-200 hover:scale-[1.012] shadow-sm cursor-pointer group flex items-center gap-4 ${
                          isSelected
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'bg-white/35 border-white/20 hover:bg-white/60 hover:border-primary/40 text-neutral-800'
                        }`}
                      >
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-colors duration-200 border ${
                            isSelected
                              ? 'bg-white text-primary border-white'
                              : 'bg-white/50 border-border text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary'
                          }`}
                        >
                          {label}
                        </span>
                        <span className="font-sans text-sm md:text-base font-semibold leading-relaxed">
                          {opt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

        {/* ──── STEP 16: RESULT SCREEN ──── */}
        {step === 16 && currentResult && currentDetails && currentTheme && (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* The Floating share notification */}
            {shareFeedback && (
              <div className="fixed top-24 z-50 px-6 py-3 bg-neutral-900 text-white rounded-full text-xs font-mono tracking-wide shadow-lg animate-in slide-in-from-top-4 duration-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                {shareFeedback}
              </div>
            )}

            {/* Intro label */}
            <span className="text-[10px] font-mono text-primary border border-primary/25 bg-primary/5 px-4 py-1.5 rounded-full uppercase tracking-widest font-bold mb-4">
              Your Personality Archetype
            </span>

            {/* Headline */}
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-950 font-clash leading-tight max-w-3xl text-center mb-8">
              {currentDetails.emoji} {currentResult.archetype} Investor
            </h1>

            {/* Main Double Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-stretch">
              {/* Left Column: Glass Profile Card */}
              <div className="lg:col-span-7 flex flex-col p-6 md:p-8 bg-white/30 border border-white/20 rounded-3xl shadow-xl backdrop-blur-xl justify-between relative text-left overflow-hidden">
                <div
                  className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-60 pointer-events-none ${currentTheme.textColor}`}
                  style={{ background: currentTheme.glowColor }}
                />

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-4 mb-6">
                    <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Profile Card
                    </span>
                    <div
                      className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 select-none ${currentTheme.badgeBg}`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Confidence Score: {currentResult.confidence}%
                    </div>
                  </div>

                  {/* Character Headline quote */}
                  <p
                    className={`text-xl md:text-2xl font-bold font-clash leading-snug italic mb-4 ${currentTheme.textColor}`}
                  >
                    "{currentDetails.headline}"
                  </p>

                  <p className="text-[#475569] text-sm md:text-base leading-relaxed font-sans font-medium mb-8">
                    {currentDetails.description}
                  </p>

                  {/* Character Traits badges */}
                  <div className="space-y-2.5">
                    <span className="block font-mono text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                      Key Behavioral Attributes
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {currentDetails.traits.map((t, i) => (
                        <span
                          key={i}
                          className="px-3.5 py-1.5 bg-white/60 border border-black/5 text-[#334155] rounded-xl text-xs font-semibold shadow-sm font-sans"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Export & Share CTAs */}
                <div className="flex flex-wrap gap-3.5 pt-10 mt-6 border-t border-black/5">
                  <button
                    onClick={handleExportPNG}
                    className={`flex-1 min-w-[160px] py-4 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition duration-200 cursor-pointer shadow-md ${currentTheme.pillBg}`}
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>Download PNG Card</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex-1 min-w-[160px] py-4 px-6 bg-white/45 hover:bg-white/70 border border-border text-neutral-800 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition duration-200 cursor-pointer shadow-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share Profile</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Diagnostic breakdown */}
              <div className="lg:col-span-5 flex flex-col gap-6 text-left">
                {/* Strength block */}
                <div className="p-6 bg-white/30 border border-white/20 rounded-3xl shadow-md backdrop-blur-xl">
                  <div className="flex gap-3.5 items-start">
                    <div
                      className={`p-2.5 rounded-xl border flex items-center justify-center ${currentTheme.badgeBg}`}
                    >
                      <TrendingUp className="w-4.5 h-4.5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-widest font-clash">
                        Biggest Strength
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                        {currentDetails.strength}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Risk block */}
                <div className="p-6 bg-white/30 border border-white/20 rounded-3xl shadow-md backdrop-blur-xl">
                  <div className="flex gap-3.5 items-start">
                    <div className="p-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-600 flex items-center justify-center">
                      <ShieldAlert className="w-4.5 h-4.5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-widest font-clash">
                        Biggest Risk
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                        {currentDetails.risk}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Portfolio Insights */}
                <div className="p-6 bg-white/30 border border-white/20 rounded-3xl shadow-md backdrop-blur-xl flex-1 flex flex-col justify-between">
                  <div className="flex gap-3.5 items-start mb-6">
                    <div className="p-2.5 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 flex items-center justify-center">
                      <Info className="w-4.5 h-4.5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-widest font-clash">
                        Personalized Portfolio Insight
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans font-medium">
                        {currentDetails.insight}
                      </p>
                    </div>
                  </div>

                  {/* Profile distribution stats */}
                  <div className="space-y-2 border-t border-black/5 pt-4">
                    <span className="block font-mono text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                      Profile Composition Match
                    </span>
                    <div className="grid grid-cols-5 gap-2 text-center">
                      {Object.entries(currentResult.normalized).map(
                        ([arch, score]) => (
                          <div
                            key={arch}
                            className="flex flex-col items-center"
                          >
                            <span className="text-xs select-none" title={arch}>
                              {RESULT_DETAILS[arch as Archetype].emoji}
                            </span>
                            <span className="text-[10px] font-mono font-bold mt-1 text-slate-600">
                              {Math.round(score)}%
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA Block */}
            <div className="w-full max-w-5xl mt-10 p-6 md:p-8 bg-neutral-900 text-white rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-2.5 relative z-10 flex-1">
                <span className="text-[9px] font-mono text-amber-400 border border-amber-400/25 bg-amber-400/5 px-2.5 py-1 rounded-full uppercase tracking-widest font-bold">
                  Next Step recommendation
                </span>
                <h3 className="text-xl md:text-2xl font-bold font-clash">
                  Does your actual portfolio match your personality?
                </h3>
                <p className="text-neutral-400 text-xs md:text-sm leading-relaxed font-sans max-w-xl">
                  {currentDetails.cta}
                </p>
              </div>

              <div className="shrink-0 w-full md:w-auto relative z-10 flex flex-col sm:flex-row gap-3">
                <a
                  href="/onboarding"
                  className="w-full md:w-auto text-center inline-flex items-center justify-center px-6 py-4 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs rounded-xl transition duration-200 uppercase tracking-wider shadow-md cursor-pointer"
                >
                  Upload Portfolio
                </a>

                <button
                  onClick={startNewQuiz}
                  className="w-full md:w-auto text-center inline-flex items-center justify-center px-6 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 font-bold text-xs rounded-xl transition duration-200 uppercase tracking-wider cursor-pointer"
                >
                  Retake Test
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
