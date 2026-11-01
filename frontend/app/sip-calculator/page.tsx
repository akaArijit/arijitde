'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import SoftBoxBlurBg from '@/components/SoftBoxBlurBg';
import GradualBlur from '@/components/GradualBlur';
import { Coins, Calendar, TrendingUp, ArrowLeft, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SIPCalculator() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mounted, setMounted] = useState(true); // Client component, always mounted

  // Calculator inputs state
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [years, setYears] = useState(10);

  // Memoized calculation
  const calculation = useMemo(() => {
    const P = monthlyInvestment;
    const i = expectedReturn / 12 / 100;
    const n = years * 12;

    // SIP Formula: M = P * [ ((1 + i)^n - 1) / i ] * (1 + i)
    let futureValue = 0;
    if (i === 0) {
      futureValue = P * n;
    } else {
      futureValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    }

    const totalInvested = P * n;
    const returns = Math.max(0, futureValue - totalInvested);

    const investedAmount = Math.round(totalInvested);
    const estReturns = Math.round(returns);
    const totalValue = Math.round(futureValue);

    return { investedAmount, estReturns, totalValue };
  }, [monthlyInvestment, expectedReturn, years]);

  // Mount animation
  useEffect(() => {
    window.scrollTo(0, 0);
    setMounted(true);
    document.title = 'SIP Calculator | FinAnalysis';
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Format currency helper (Indian style)
  const formatCurrency = (val: number) => {
    if (!mounted) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // SVG Donut Calculations
  const returnsPercent = calculation.totalValue > 0 ? (calculation.estReturns / calculation.totalValue) * 100 : 0;
  const investedPercent =
    calculation.totalValue > 0 ? (calculation.investedAmount / calculation.totalValue) * 100 : 100;

  // Donut parameters
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.16
  const strokeDashoffset =
    circumference - (circumference * returnsPercent) / 100;

  return (
    <main className="relative min-h-screen w-full bg-transparent text-foreground flex flex-col font-clash">
      {/* Fixed Background container with User's Gradient Theme */}
      <div className="page-backdrop fixed inset-0 z-0 select-none pointer-events-none">
        <SoftBoxBlurBg />
      </div>

      <Navbar isLoaded={isLoaded} activePath="/sip-calculator" />

      {/* Header Title Section */}
      <div className="relative z-10 flex flex-col justify-center items-center px-6 pt-44 pb-6 text-center max-w-5xl mx-auto">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') {
              if (!sessionStorage.getItem('savedHomeScrollY')) {
                sessionStorage.setItem('savedHomeScrollY', '6299');
              }
              if (window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = '/';
              }
            }
          }}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/50 border border-white/30 hover:bg-white/70 transition-colors text-neutral-700 hover:text-neutral-900 cursor-pointer"
          aria-label="Back to Home"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-md border border-white/30 px-4 py-1.5 rounded-full shadow-sm">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary font-mono tracking-wider">
              Secured by FinAnalysis
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-neutral-900 font-clash">
            SIP
            <span className="text-primary"> Calculator</span>
          </h1>
          <p className="text-neutral-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-sans">
            Systematic Investment Plan (SIP) Calculator - Project your wealth creation through
            disciplined monthly investments with compound interest.
          </p>
        </div>
      </div>

      {/* Calculator Form & Results */}
      <div className="relative z-10 flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-12 flex flex-col items-center">
        {/* Input Card */}
        <div className="w-full bg-white/50 backdrop-blur-md border border-white/30 rounded-2xl p-6 md:p-8 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono">
                Monthly Investment (₹)
              </label>
              <input
                type="number"
                min="500"
                max="1000000"
                step="500"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white/50 border border-neutral-200 rounded-xl text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-neutral-900 font-mono"
                placeholder="e.g. 5000"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono">
                Expected Annual Return (%)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                step="0.5"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white/50 border border-neutral-200 rounded-xl text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-neutral-900 font-mono"
                placeholder="e.g. 12"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono">
                Investment Period (Years)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                step="1"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white/50 border border-neutral-200 rounded-xl text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-neutral-900 font-mono"
                placeholder="e.g. 10"
              />
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="w-full bg-white/50 backdrop-blur-md border border-white/30 rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6 text-center font-clash">
            Your SIP Wealth Projection
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Result Card - Total Invested */}
            <div className="bg-white border border-neutral-200 rounded-xl p-4 md:p-6 text-center">
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono mb-2">
                Total Invested
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-primary font-clash">
                {formatCurrency(calculation.investedAmount)}
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                {monthlyInvestment.toLocaleString('en-IN')} × {years * 12} months
              </p>
            </div>

            {/* Result Card - Estimated Returns */}
            <div className="bg-white border border-neutral-200 rounded-xl p-4 md:p-6 text-center">
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono mb-2">
                Estimated Returns
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-amber-600 font-clash">
                {formatCurrency(calculation.estReturns)}
              </div>
              <p className="text-xs text-neutral-500 mt-1">Wealth created</p>
            </div>

            {/* Result Card - Total Value */}
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 md:p-6 text-center md:col-span-1 lg:col-span-2">
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono mb-2">
                Maturity Value
              </div>
              <div className="text-4xl md:text-5xl font-extrabold text-primary font-clash">
                {formatCurrency(calculation.totalValue)}
              </div>
              <p className="text-sm text-primary/80 mt-1">Total corpus at maturity</p>
            </div>
          </div>

          {/* Visual Donut Chart */}
          <div className="mt-8 md:mt-12 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
            <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={50}
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={50}
                  stroke="url(#sip-gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 50}
                  strokeDashoffset={2 * Math.PI * 50 - (2 * Math.PI * 50 * returnsPercent) / 100}
                  strokeLinecap="round"
                  className="transform -rotate-90 transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="sip-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3A8293" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl md:text-3xl font-extrabold text-neutral-900 font-clash">
                  {returnsPercent.toFixed(0)}%
                </span>
                <span className="text-xs text-neutral-500">Returns</span>
              </div>
            </div>

            <div className="flex-1 max-w-xs md:max-w-md text-center md:text-left">
              <h3 className="text-lg md:text-xl font-bold text-neutral-900 font-clash mb-2">
                Wealth Composition
              </h3>
              <p className="text-neutral-600 text-sm leading-relaxed font-sans">
                Of the projected {formatCurrency(calculation.totalValue)} corpus,
                {formatCurrency(calculation.investedAmount)} ({investedPercent.toFixed(0)}%) is your principal
                (monthly SIPs), while {formatCurrency(calculation.estReturns)} ({returnsPercent.toFixed(0)}%)
                represents compounded growth at {expectedReturn}% annualized.
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
                SIP harnesses the power of rupee cost averaging and compounding. The earlier you start,
                the more time your money has to compound. Even a 5-year head start can double your corpus.
              </p>
            </div>
            <div className="bg-white/50 border border-neutral-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono">
                  Quick Action
                </span>
              </div>
              <p className="text-sm text-neutral-700 font-sans">
                Step up your SIP annually by 10-15% to counter inflation. Use the Step-up SIP Calculator
                to model this. Automate via ECS/NACH for discipline.
              </p>
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
              <strong className="text-neutral-900 font-clash">SIP Formula (Month-Start)</strong>
            </div>
            <div className="space-y-2 font-mono text-xs bg-neutral-50 rounded-lg p-3">
              <div>Monthly rate: i = Annual Rate / 12 / 100</div>
              <div>Months: n = Years × 12</div>
              <div>Future Value: FV = P × [((1 + i)^n - 1) / i] × (1 + i)</div>
              <div>Total Invested: P × n</div>
              <div>Returns: FV - (P × n)</div>
            </div>
            <div className="text-xs text-neutral-500">
              <strong>Assumptions:</strong> Monthly investments at month-start, constant return rate,
              monthly compounding, no taxes/fees/expense ratio. Real SIP returns vary with market
              conditions and fund expense ratios.
            </div>
          </div>
        </details>
      </div>

      <Footer />
    </main>
  );
}

// Format currency helper (Indian style)
function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
}