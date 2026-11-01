'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import SoftBoxBlurBg from '@/components/SoftBoxBlurBg';
import GradualBlur from '@/components/GradualBlur';
import { Coins, Calendar, TrendingUp, ArrowLeft, ShieldCheck, Download } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RDCalculator() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mounted, setMounted] = useState(true); // Client component, always mounted

  // Calculator inputs state
  const [monthlyDeposit, setMonthlyDeposit] = useState(5000);
  const [interestRate, setInterestRate] = useState(7.0); // typical RD rate
  const [years, setYears] = useState(5);

  // Memoized calculation
  const calculation = useMemo(() => {
    const totalMonths = years * 12;
    let maturityValue = 0;
    const totalInvested = monthlyDeposit * totalMonths;

    // RD compounding quarterly model:
    // Interest is computed on installments for the period they remained in the bank.
    for (let k = 1; k <= totalMonths; k++) {
      const monthsRemaining = totalMonths - k + 1;
      const quartersRemaining = monthsRemaining / 3;
      const installmentMaturity =
        monthlyDeposit * Math.pow(1 + interestRate / 400, quartersRemaining);
      maturityValue += installmentMaturity;
    }

    const investedAmount = Math.round(totalInvested);
    const estReturns = Math.round(Math.max(0, maturityValue - totalInvested));
    const totalValue = Math.round(maturityValue);

    return { investedAmount, estReturns, totalValue };
  }, [monthlyDeposit, interestRate, years]);

  // Mount animation
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Recurring Deposit (RD) Calculator | FinAnalysis';
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

      <Navbar isLoaded={isLoaded} activePath="/rd-calculator" />

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
            RD
            <span className="text-primary"> Calculator</span>
          </h1>
          <p className="text-neutral-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-sans">
            Calculate your Recurring Deposit maturity amount. Enter your monthly deposit, interest rate,
            and tenure to see estimated returns with quarterly compounding.
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
                Monthly Deposit (₹)
              </label>
              <input
                type="number"
                min="100"
                max="1000000"
                step="100"
                value={monthlyDeposit}
                onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white/50 border border-neutral-200 rounded-xl text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-neutral-900 font-mono"
                placeholder="e.g. 5000"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono">
                Interest Rate (% p.a.)
              </label>
              <input
                type="number"
                min="0.1"
                max="15"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white/50 border border-neutral-200 rounded-xl text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-neutral-900 font-mono"
                placeholder="e.g. 7.0"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono">
                Tenure (Years)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                step="1"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white/50 border border-neutral-200 rounded-xl text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-neutral-900 font-mono"
                placeholder="e.g. 5"
              />
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="w-full bg-white/50 backdrop-blur-md border border-white/30 rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6 text-center font-clash">
            Your RD Maturity Summary
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
                {monthlyDeposit.toLocaleString('en-IN')} × {years * 12} months
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
              <p className="text-xs text-neutral-500 mt-1">Interest earned</p>
            </div>

            {/* Result Card - Maturity Value */}
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 md:p-6 text-center md:col-span-1 lg:col-span-2">
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono mb-2">
                Maturity Value
              </div>
              <div className="text-4xl md:text-5xl font-extrabold text-primary font-clash">
                {formatCurrency(calculation.totalValue)}
              </div>
              <p className="text-sm text-primary/80 mt-1">Total value at maturity</p>
            </div>
          </div>

          {/* Visual Donut Chart */}
          <div className="mt-8 md:mt-12 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
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
                  stroke="url(#rd-gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transform -rotate-90 transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="rd-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
                Returns Breakdown
              </h3>
              <p className="text-neutral-600 text-sm leading-relaxed font-sans">
                Out of the total {formatCurrency(calculation.totalValue)} at maturity,
                {formatCurrency(calculation.investedAmount)} ({investedPercent.toFixed(0)}%) is your principal
                investment, while {formatCurrency(calculation.estReturns)} ({returnsPercent.toFixed(0)}%) comes from
                quarterly compounded interest at {interestRate}% p.a.
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
                RD interest is compounded quarterly. Higher monthly deposits and longer tenures benefit
                significantly from compounding. Consider increasing your monthly deposit for
                exponentially higher returns.
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
                Compare RD rates across banks. Even a 0.5% difference in interest rate can significantly
                impact your maturity value over long tenures.
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
              <strong className="text-neutral-900 font-clash">Formula (Quarterly Compounding)</strong>
            </div>
            <div className="space-y-2 font-mono text-xs bg-neutral-50 rounded-lg p-3">
              <div>For each month k = 1 to n (n = years × 12):</div>
              <div>  Months remaining = n - k + 1</div>
              <div>  Quarters remaining = Months remaining / 3</div>
              <div>  Installment value = Monthly Deposit × (1 + Rate/400)^Quarters</div>
              <div>  Maturity Value = Sum of all installment values</div>
            </div>
            <div className="text-xs text-neutral-500">
              <strong>Assumptions:</strong> Interest rate is constant, deposits made at month-start,
              interest compounded quarterly, no taxes/fees considered. Actual bank RD rates
              and compounding frequency may vary.
            </div>
          </div>
        </details>
      </div>

      <Footer />
    </main>
  );
}