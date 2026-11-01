'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import SoftBoxBlurBg from '@/components/SoftBoxBlurBg';
import {
  Coins,
  Calendar,
  TrendingUp,
  ArrowLeft,
  Download,
  ShieldCheck,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GradualBlur from '@/components/GradualBlur';

export default function SWPCalculator() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mounted, setMounted] = useState(true); // Client component, always mounted
  const [calculationMode, setCalculationMode] = useState<'tenure' | 'corpus'>(
    'tenure',
  );

  // State for Tenure Mode (How long corpus lasts)
  const [corpusAmount, setCorpusAmount] = useState(5000000); // 50 Lakhs
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState(40000);
  const [expectedReturn, setExpectedReturn] = useState(10); // 10%
  const [tenureYears, setTenureYears] = useState(20);

  // State for Corpus Mode (What corpus is needed)
  const [desiredMonthlyIncome, setDesiredMonthlyIncome] = useState(50000);
  const [corpusExpectedReturn, setCorpusExpectedReturn] = useState(9); // 9%
  const [desiredTenureYears, setDesiredTenureYears] = useState(25);

  // Memoized calculation for "Tenure Mode"
  const tenureCalculation = useMemo(() => {
    const C = corpusAmount;
    const W = monthlyWithdrawal;
    const R = expectedReturn;
    const T = tenureYears;
    const r = R / 12 / 100;
    const totalMonths = T * 12;

    let balance = C;
    let totalWithdrawn = 0;
    let monthsElapsed = 0;
    let lastsForever = false;

    // Check if interest earned is greater than or equal to withdrawal (lasts forever)
    if (balance * r >= W && R > 0) {
      lastsForever = true;
      totalWithdrawn = W * totalMonths;
      // In this case, the balance actually grows. Let's run a projection:
      for (let m = 0; m < totalMonths; m++) {
        balance = balance + balance * r - W;
      }
      const interest = balance + totalWithdrawn - C;
      return {
        lastsForever: true,
        calculatedTenureMonths: totalMonths,
        totalWithdrawn,
        interestEarned: Math.max(0, interest),
        remainingBalance: Math.round(balance),
      };
    }

    lastsForever = false;
    let finalInterest = 0;

    for (let m = 0; m < totalMonths; m++) {
      const interestEarned = balance * r;
      if (balance + interestEarned < W) {
        // Last month: withdraw whatever is left
        totalWithdrawn += balance + interestEarned;
        finalInterest += interestEarned;
        balance = 0;
        break;
      }
      balance = balance + interestEarned - W;
      totalWithdrawn += W;
      finalInterest += interestEarned;
      monthsElapsed++;
    }

    return {
      lastsForever: false,
      calculatedTenureMonths: monthsElapsed,
      totalWithdrawn: Math.round(totalWithdrawn),
      interestEarned: Math.round(finalInterest),
      remainingBalance: Math.round(balance),
    };
  }, [
    corpusAmount,
    monthlyWithdrawal,
    expectedReturn,
    tenureYears,
  ]);

  // Memoized calculation for "Corpus Mode"
  const corpusCalculation = useMemo(() => {
    const W = desiredMonthlyIncome;
    const R = corpusExpectedReturn;
    const T = desiredTenureYears;
    const r = R / 12 / 100;
    const n = T * 12;

    let required = 0;
    if (r === 0) {
      required = W * n;
    } else {
      // Ordinary Annuity Present Value: PV = W * [ (1 - (1+r)^-n) / r ]
      required = W * ((1 - Math.pow(1 + r, -n)) / r);
    }

    const totalWithdrawn = W * n;
    const interestComponent = Math.max(0, totalWithdrawn - required);

    return {
      requiredCorpus: Math.round(required),
      totalWithdrawn: Math.round(totalWithdrawn),
      interestComponent: Math.round(interestComponent),
    };
  }, [
    desiredMonthlyIncome,
    corpusExpectedReturn,
    desiredTenureYears,
  ]);

  // Extract calculation results
  const {
    lastsForever: tenureLastsForever,
    calculatedTenureMonths,
    totalWithdrawn: tenureTotalWithdrawn,
    interestEarned: tenureInterestEarned,
    remainingBalance: tenureRemainingBalance,
  } = calculationMode === 'tenure' ? tenureCalculation : {
    lastsForever: false,
    calculatedTenureMonths: 0,
    totalWithdrawn: 0,
    interestEarned: 0,
    remainingBalance: 0,
  };

  const {
    requiredCorpus: calculatedRequiredCorpus,
    totalWithdrawn: corpusTotalWithdrawn,
    interestComponent: corpusInterestComponent,
  } = calculationMode === 'corpus' ? corpusCalculation : {
    requiredCorpus: 0,
    totalWithdrawn: 0,
    interestComponent: 0,
  };

  // Mount animation
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'SWP Calculator | FinAnalysis';
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Currency Formatter
  const formatCurrency = (val: number) => {
    if (!mounted) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // SVG representation calculations
  const tenureYearsFraction = Math.floor(calculatedTenureMonths / 12);
  const tenureMonthsFraction = calculatedTenureMonths % 12;

  // Donut values (Tenure Mode)
  const tenureTotalPotential = tenureTotalWithdrawn + tenureRemainingBalance;
  const tenureWithdrawnPercent =
    tenureTotalPotential > 0
      ? (tenureTotalWithdrawn / tenureTotalPotential) * 100
      : 0;
  const tenureBalancePercent =
    tenureTotalPotential > 0
      ? (tenureRemainingBalance / tenureTotalPotential) * 100
      : 100;

  // Donut values (Corpus Mode)
  const corpusInterestPercent =
    corpusTotalWithdrawn > 0
      ? (corpusInterestComponent / corpusTotalWithdrawn) * 100
      : 0;
  const corpusPrincipalPercent =
    corpusTotalWithdrawn > 0
      ? (calculatedRequiredCorpus / corpusTotalWithdrawn) * 100
      : 100;

  // Donut SVG parameters
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.16
  const strokeDashoffsetTenure =
    circumference - (circumference * tenureWithdrawnPercent) / 100;
  const strokeDashoffsetCorpus =
    circumference - (circumference * corpusInterestPercent) / 100;

  return (
    <main className="relative min-h-screen w-full bg-transparent text-foreground flex flex-col font-clash">
      {/* Background Gradient theme */}
      <div className="page-backdrop fixed inset-0 z-0 select-none pointer-events-none">
        <SoftBoxBlurBg />
      </div>

      <Navbar isLoaded={isLoaded} activePath="/swp-calculator" />

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-12 relative z-10 flex flex-col items-center">
        {/* Header Section */}
        <div className="w-full text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-md border border-white/30 px-4 py-1.5 rounded-full shadow-sm mb-4">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary font-mono tracking-wider">
              Secured by FinAnalysis
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-neutral-900 font-clash mb-3">
            SWP
            <span className="text-primary"> Calculator</span>
          </h1>
          <p className="text-neutral-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-sans">
            Plan your Systematic Withdrawal Plan. Calculate how long your corpus will
            last or what corpus you need for a desired monthly income.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="w-full max-w-xl mb-8">
          <div className="flex bg-white/50 backdrop-blur-md border border-white/30 rounded-full p-1 shadow-sm">
            <button
              onClick={() => setCalculationMode('tenure')}
              className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-full transition-all duration-200 ${
                calculationMode === 'tenure'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              How long will my corpus last?
            </button>
            <button
              onClick={() => setCalculationMode('corpus')}
              className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-full transition-all duration-200 ${
                calculationMode === 'corpus'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              What corpus do I need?
            </button>
          </div>
        </div>

        {/* Calculator Form */}
        <div className="w-full max-w-4xl mx-auto space-y-6">
          {calculationMode === 'tenure' ? (
            /* Tenure Mode Inputs */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono">
                  Initial Corpus Amount (₹)
                </label>
                <input
                  type="number"
                  min="10000"
                  max="100000000"
                  step="10000"
                  value={corpusAmount}
                  onChange={(e) => setCorpusAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/50 border border-neutral-200 rounded-xl text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-neutral-900 font-mono"
                  placeholder="e.g. 5000000"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono">
                  Monthly Withdrawal (₹)
                </label>
                <input
                  type="number"
                  min="1000"
                  max="1000000"
                  step="1000"
                  value={monthlyWithdrawal}
                  onChange={(e) => setMonthlyWithdrawal(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/50 border border-neutral-200 rounded-xl text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-neutral-900 font-mono"
                  placeholder="e.g. 40000"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono">
                  Expected Annual Return (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="25"
                  step="0.5"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/50 border border-neutral-200 rounded-xl text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-neutral-900 font-mono"
                  placeholder="e.g. 10"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono">
                  Max Tenure (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  step="1"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/50 border border-neutral-200 rounded-xl text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-neutral-900 font-mono"
                  placeholder="e.g. 20"
                />
              </div>
            </div>
          ) : (
            /* Corpus Mode Inputs */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono">
                  Desired Monthly Income (₹)
                </label>
                <input
                  type="number"
                  min="1000"
                  max="1000000"
                  step="1000"
                  value={desiredMonthlyIncome}
                  onChange={(e) => setDesiredMonthlyIncome(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/50 border border-neutral-200 rounded-xl text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-neutral-900 font-mono"
                  placeholder="e.g. 50000"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono">
                  Expected Annual Return (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="25"
                  step="0.5"
                  value={corpusExpectedReturn}
                  onChange={(e) => setCorpusExpectedReturn(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/50 border border-neutral-200 rounded-xl text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-neutral-900 font-mono"
                  placeholder="e.g. 9"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono">
                  Desired Tenure (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  step="1"
                  value={desiredTenureYears}
                  onChange={(e) => setDesiredTenureYears(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/50 border border-neutral-200 rounded-xl text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-neutral-900 font-mono"
                  placeholder="e.g. 25"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono">
                  {/* Empty spacer for grid alignment */}
                </label>
                <div className="h-11" />
              </div>
            </div>
          )}

          {/* Results */}
          <div className="mt-8">
            <div className="bg-white/50 backdrop-blur-md border border-white/30 rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6 text-center font-clash">
                {calculationMode === 'tenure'
                  ? 'How Long Will Your Corpus Last?'
                  : 'Required Corpus for Your Income'}
              </h2>

              {calculationMode === 'tenure' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {/* Result Card - Tenure */}
                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 md:p-6 text-center md:col-span-1 lg:col-span-2">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono mb-2">
                      Corpus Duration
                    </div>
                    {tenureLastsForever ? (
                      <div className="space-y-1">
                        <div className="text-4xl md:text-5xl font-extrabold text-emerald-600 font-clash">
                          Indefinite ♾️
                        </div>
                        <p className="text-sm text-emerald-700 font-medium">
                          Your corpus grows faster than withdrawals!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-4xl md:text-5xl font-extrabold text-neutral-900 font-clash">
                          {tenureYearsFraction} yr {tenureMonthsFraction} mo
                        </div>
                        <p className="text-sm text-neutral-500">
                          Your corpus will be depleted after this period
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Result Card - Total Withdrawn */}
                  <div className="bg-white border border-neutral-200 rounded-xl p-4 md:p-6 text-center">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono mb-2">
                      Total Withdrawn
                    </div>
                    <div className="text-2xl md:text-3xl font-extrabold text-primary font-clash">
                      {formatCurrency(tenureTotalWithdrawn)}
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">Over the full tenure</p>
                  </div>

                  {/* Result Card - Interest Earned */}
                  <div className="bg-white border border-neutral-200 rounded-xl p-4 md:p-6 text-center">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono mb-2">
                      Interest Earned
                    </div>
                    <div className="text-2xl md:text-3xl font-extrabold text-amber-600 font-clash">
                      {formatCurrency(tenureInterestEarned)}
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">Growth from returns</p>
                  </div>

                  {/* Result Card - Remaining Balance */}
                  <div className="bg-white border border-neutral-200 rounded-xl p-4 md:p-6 text-center">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono mb-2">
                      Final Balance
                    </div>
                    <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 font-clash">
                      {formatCurrency(tenureRemainingBalance)}
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">Remaining after tenure</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {/* Result Card - Required Corpus */}
                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 md:p-6 text-center md:col-span-1 lg:col-span-2">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono mb-2">
                      Required Initial Corpus
                    </div>
                    <div className="text-4xl md:text-5xl font-extrabold text-primary font-clash">
                      {formatCurrency(calculatedRequiredCorpus)}
                    </div>
                    <p className="text-sm text-primary/80 mt-1">
                      Invest this amount today
                    </p>
                  </div>

                  {/* Result Card - Total Withdrawn */}
                  <div className="bg-white border border-neutral-200 rounded-xl p-4 md:p-6 text-center">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono mb-2">
                      Total Income Over {desiredTenureYears} Years
                    </div>
                    <div className="text-2xl md:text-3xl font-extrabold text-primary font-clash">
                      {formatCurrency(corpusTotalWithdrawn)}
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">Total withdrawals</p>
                  </div>

                  {/* Result Card - Interest Component */}
                  <div className="bg-white border border-neutral-200 rounded-xl p-4 md:p-6 text-center">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono mb-2">
                      Interest Component
                    </div>
                    <div className="text-2xl md:text-3xl font-extrabold text-amber-600 font-clash">
                      {formatCurrency(corpusInterestComponent)}
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">Returns generated</p>
                  </div>
                </div>
              )}

              {/* Visual Donut Chart */}
              <div className="mt-8 md:mt-12 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
                {calculationMode === 'tenure' ? (
                  <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
                    <svg width="100%" height="100%" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        stroke="#E5E7EB"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        stroke="url(#tenure-gradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffsetTenure}
                        strokeLinecap="round"
                        className="transform -rotate-90 transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="tenure-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3A8293" />
                          <stop offset="100%" stopColor="#06B6D4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl md:text-3xl font-extrabold text-neutral-900 font-clash">
                        {tenureWithdrawnPercent.toFixed(0)}%
                      </span>
                      <span className="text-xs text-neutral-500">Utilized</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
                    <svg width="100%" height="100%" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        stroke="#E5E7EB"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        stroke="url(#corpus-gradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffsetCorpus}
                        strokeLinecap="round"
                        className="transform -rotate-90 transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="corpus-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3A8293" />
                          <stop offset="100%" stopColor="#06B6D4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl md:text-3xl font-extrabold text-neutral-900 font-clash">
                        {corpusInterestPercent.toFixed(0)}%
                      </span>
                      <span className="text-xs text-neutral-500">Interest</span>
                    </div>
                  </div>
                )}

                <div className="flex-1 max-w-xs md:max-w-md text-center md:text-left">
                  <h3 className="text-lg md:text-xl font-bold text-neutral-900 font-clash mb-2">
                    {calculationMode === 'tenure'
                      ? 'Corpus Utilization'
                      : 'Income Composition'}
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed font-sans">
                    {calculationMode === 'tenure'
                      ? tenureLastsForever
                        ? 'Your monthly withdrawals are fully covered by investment returns. The corpus never depletes and continues to grow over time.'
                        : `Over ${tenureYearsFraction} years and ${tenureMonthsFraction} months, you will withdraw ${formatCurrency(tenureTotalWithdrawn)}. The remaining balance of ${formatCurrency(tenureRemainingBalance)} represents ${tenureBalancePercent.toFixed(0)}% of your total potential.`
                      : `Out of the total ${formatCurrency(corpusTotalWithdrawn)} withdrawn over ${desiredTenureYears} years, ${formatCurrency(corpusInterestComponent)} (${corpusInterestPercent.toFixed(0)}%) comes from investment returns, while ${formatCurrency(calculatedRequiredCorpus)} (${corpusPrincipalPercent.toFixed(0)}%) is your initial principal.`
                    }
                  </p>
                </div>
              </div>

              {/* Key Insights */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/50 border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono">
                      Key Insight
                    </span>
                  </div>
                  <p className="text-sm text-neutral-700 font-sans">
                    {calculationMode === 'tenure'
                      ? tenureLastsForever
                        ? 'Your withdrawal rate is sustainable indefinitely. The corpus grows faster than you withdraw.'
                        : `Your corpus will last ${tenureYearsFraction} years ${tenureMonthsFraction} months. Consider reducing withdrawals or increasing returns to extend longevity.`
                      : `You need ${formatCurrency(calculatedRequiredCorpus)} invested today to generate ${formatCurrency(desiredMonthlyIncome)}/month for ${desiredTenureYears} years at ${corpusExpectedReturn}% return.`
                    }
                  </p>
                </div>
                <div className="bg-white/50 border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono">
                      Quick Action
                    </span>
                  </div>
                  <p className="text-sm text-neutral-700 font-sans">
                    {calculationMode === 'tenure'
                      ? 'Review your withdrawal strategy annually. Market returns vary and inflation impacts purchasing power.'
                      : 'Start investing early to benefit from compounding. Consider SIPs in diversified mutual funds for the corpus.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formula Explanation */}
        <details className="w-full max-w-4xl mx-auto mt-12">
          <summary className="cursor-pointer text-primary font-bold text-sm hover:underline font-clash flex items-center gap-2">
            <Coins className="w-4 h-4" />
            View Calculation Formula & Assumptions
          </summary>
          <div className="mt-4 p-4 bg-white/50 backdrop-blur-md border border-white/30 rounded-xl text-sm text-neutral-700 space-y-3 font-sans">
            <div>
              <strong className="text-neutral-900 font-clash">
                {calculationMode === 'tenure' ? 'Tenure Calculation' : 'Corpus Calculation'}
              </strong>
            </div>
            {calculationMode === 'tenure' ? (
              <div className="space-y-2 font-mono text-xs bg-neutral-50 rounded-lg p-3">
                <div>Monthly rate: r = Annual Rate / 12 / 100</div>
                <div>For each month: balance = balance + (balance × r) - withdrawal</div>
                <div>
                  If balance × r ≥ withdrawal: corpus lasts indefinitely ♾️
                </div>
                <div>
                  Else: simulate month-by-month until balance ≤ 0
                </div>
              </div>
            ) : (
              <div className="space-y-2 font-mono text-xs bg-neutral-50 rounded-lg p-3">
                <div>Monthly rate: r = Annual Rate / 12 / 100</div>
                <div>Months: n = Years × 12</div>
                <div>Required Corpus (PV): PV = Withdrawal × [(1 - (1+r)^-n) / r]</div>
                <div>Total Withdrawn: Withdrawal × n</div>
                <div>Interest Component: Total Withdrawn - PV</div>
              </div>
            )}
            <div className="text-xs text-neutral-500">
              <strong>Assumptions:</strong> Returns are constant (no market volatility),
              withdrawals happen at month-end, no taxes/fees considered.
              Real-world results will vary based on market conditions.
            </div>
          </div>
        </details>
      </div>

      <Footer />
    </main>
  );
}