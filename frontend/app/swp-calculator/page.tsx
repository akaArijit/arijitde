'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import SoftBoxBlurBg from "@/components/SoftBoxBlurBg";
import { Coins, Calendar, TrendingUp, ArrowLeft, Download, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GradualBlur from "@/components/GradualBlur";

export default function SWPCalculator() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [calculationMode, setCalculationMode] = useState<"tenure" | "corpus">("tenure");

  // State for Tenure Mode (How long corpus lasts)
  const [corpusAmount, setCorpusAmount] = useState(5000000); // 50 Lakhs
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState(40000);
  const [expectedReturn, setExpectedReturn] = useState(10); // 10%
  const [tenureYears, setTenureYears] = useState(20);

  // State for Corpus Mode (What corpus is needed)
  const [desiredMonthlyIncome, setDesiredMonthlyIncome] = useState(50000);
  const [corpusExpectedReturn, setCorpusExpectedReturn] = useState(9); // 9%
  const [desiredTenureYears, setDesiredTenureYears] = useState(25);

  // Outputs
  const [calculatedTenureMonths, setCalculatedTenureMonths] = useState(0);
  const [tenureLastsForever, setTenureLastsForever] = useState(false);
  const [tenureTotalWithdrawn, setTenureTotalWithdrawn] = useState(0);
  const [tenureInterestEarned, setTenureInterestEarned] = useState(0);
  const [tenureRemainingBalance, setTenureRemainingBalance] = useState(0);

  const [calculatedRequiredCorpus, setCalculatedRequiredCorpus] = useState(0);
  const [corpusTotalWithdrawn, setCorpusTotalWithdrawn] = useState(0);
  const [corpusInterestComponent, setCorpusInterestComponent] = useState(0);
  // Mount animation
  useEffect(() => {
    window.scrollTo(0, 0);
    setMounted(true);
    document.title = "SWP Calculator | FinAnalysis";
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Run calculation for "Tenure Mode"
  useEffect(() => {
    if (calculationMode !== "tenure") return;

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
        balance = balance + (balance * r) - W;
      }
      const interest = balance + totalWithdrawn - C;
      setTenureLastsForever(true);
      setCalculatedTenureMonths(totalMonths);
      setTenureTotalWithdrawn(totalWithdrawn);
      setTenureInterestEarned(Math.max(0, interest));
      setTenureRemainingBalance(Math.round(balance));
      return;
    }

    setTenureLastsForever(false);
    let finalInterest = 0;

    for (let m = 0; m < totalMonths; m++) {
      const interestEarned = balance * r;
      if (balance + interestEarned < W) {
        // Last month: withdraw whatever is left
        totalWithdrawn += (balance + interestEarned);
        finalInterest += interestEarned;
        balance = 0;
        break;
      }
      balance = balance + interestEarned - W;
      totalWithdrawn += W;
      finalInterest += interestEarned;
      monthsElapsed++;
    }

    setCalculatedTenureMonths(monthsElapsed);
    setTenureTotalWithdrawn(Math.round(totalWithdrawn));
    setTenureInterestEarned(Math.round(finalInterest));
    setTenureRemainingBalance(Math.round(balance));
  }, [corpusAmount, monthlyWithdrawal, expectedReturn, tenureYears, calculationMode]);

  // Run calculation for "Corpus Mode"
  useEffect(() => {
    if (calculationMode !== "corpus") return;

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

    setCalculatedRequiredCorpus(Math.round(required));
    setCorpusTotalWithdrawn(Math.round(totalWithdrawn));
    setCorpusInterestComponent(Math.round(interestComponent));
  }, [desiredMonthlyIncome, corpusExpectedReturn, desiredTenureYears, calculationMode]);

  // Currency Formatter
  const formatCurrency = (val: number) => {
    if (!mounted) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // SVG representation calculations
  const tenureYearsFraction = Math.floor(calculatedTenureMonths / 12);
  const tenureMonthsFraction = calculatedTenureMonths % 12;

  // Donut values (Tenure Mode)
  const tenureTotalPotential = tenureTotalWithdrawn + tenureRemainingBalance;
  const tenureWithdrawnPercent = tenureTotalPotential > 0 ? (tenureTotalWithdrawn / tenureTotalPotential) * 100 : 0;
  const tenureBalancePercent = tenureTotalPotential > 0 ? (tenureRemainingBalance / tenureTotalPotential) * 100 : 100;

  // Donut values (Corpus Mode)
  const corpusInterestPercent = corpusTotalWithdrawn > 0 ? (corpusInterestComponent / corpusTotalWithdrawn) * 100 : 0;
  const corpusPrincipalPercent = corpusTotalWithdrawn > 0 ? (calculatedRequiredCorpus / corpusTotalWithdrawn) * 100 : 100;

  // Donut SVG parameters
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.16
  const strokeDashoffsetTenure = circumference - (circumference * tenureWithdrawnPercent) / 100;
  const strokeDashoffsetCorpus = circumference - (circumference * corpusInterestPercent) / 100;

  return (
    <main className="relative min-h-screen w-full bg-transparent text-foreground flex flex-col font-clash">
      {/* Background Gradient theme */}
      <div className="page-backdrop fixed inset-0 z-0 select-none pointer-events-none">
        <SoftBoxBlurBg />
      </div>

      <Navbar isLoaded={isLoaded} activePath="/swp-calculator" />

      {/* Header Title Section */}
      <div className="relative z-10 flex flex-col justify-center items-center px-6 pt-44 pb-6 text-center max-w-5xl mx-auto">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              if (!sessionStorage.getItem("savedHomeScrollY")) {
                sessionStorage.setItem("savedHomeScrollY", "6299");
              }
              if (window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = "/";
              }
            }
          }}
          className="group flex items-center gap-2 px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-primary bg-white/40 border border-border hover:bg-white/60 rounded-xl transition duration-200 shadow-sm mb-4 cursor-pointer animate-in fade-in slide-in-from-top-2 duration-1000"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </button>
        <h1
          className={`text-4xl md:text-7xl font-normal tracking-tight mt-12 mb-4 leading-none text-primary font-clash transition-all duration-[1200ms] ease-out ${
            isLoaded ? "opacity-100 blur-none scale-100" : "opacity-0 blur-lg scale-95"
          } delay-[200ms]`}
        >
          SWP Calculator
        </h1>
        <p
          className={`text-sm md:text-base text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed font-sans transition-all duration-[1200ms] ease-out ${
            isLoaded ? "opacity-100 blur-none scale-100" : "opacity-0 blur-md scale-95"
          } delay-[400ms]`}
        >
          A Systematic Withdrawal Plan (SWP) lets you withdraw a fixed amount monthly from your mutual funds or investments. Project how long your retirement corpus will last or find out how much you need.
        </p>

        {/* Calculation Mode Toggle Tabs */}
        <div className="flex bg-white/30 border border-border/80 p-1.5 rounded-2xl w-full max-w-md mx-auto shadow-sm select-none">
          <button
            onClick={() => setCalculationMode("tenure")}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all duration-350 ${
              calculationMode === "tenure"
                ? "bg-primary text-primary-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            How long will corpus last
          </button>
          <button
            onClick={() => setCalculationMode("corpus")}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all duration-350 ${
              calculationMode === "corpus"
                ? "bg-primary text-primary-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            What corpus is needed
          </button>
        </div>
      </div>

      {/* Main content grid */}
      <div
        className={`relative z-10 w-full max-w-5xl mx-auto px-6 pb-36 grid grid-cols-1 lg:grid-cols-12 gap-10 transition-all duration-[1200ms] ease-out ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        } delay-[500ms]`}
      >
        {/* Left Column: Sliders and Inputs */}
        <div className="lg:col-span-7 bg-white/35 border border-border rounded-3xl p-8 shadow-md backdrop-blur-2xl space-y-8 flex flex-col justify-center text-left">
          
          {calculationMode === "tenure" ? (
            <>
              {/* Total Corpus Amount */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                    <Coins className="w-4 h-4 text-primary" />
                    Total Corpus Amount
                  </span>
                  <div className="flex items-center gap-1 bg-[#F2F0EF]/80 border border-border px-3 py-1 rounded-xl font-mono font-bold text-base text-foreground">
                    <span>₹</span>
                    <input
                      type="number"
                      value={corpusAmount}
                      onChange={(e) => setCorpusAmount(Math.max(0, Number(e.target.value)))}
                      className="bg-transparent border-none outline-none text-foreground font-mono font-bold text-base text-right p-0 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      style={{ width: `${Math.max(3, String(corpusAmount).length) * 9 + 5}px` }}
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={100000}
                  max={50000000}
                  step={100000}
                  value={Math.min(50000000, Math.max(100000, corpusAmount))}
                  onChange={(e) => setCorpusAmount(Number(e.target.value))}
                  className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>₹1 Lakh</span>
                  <span>₹2.5 Crore</span>
                  <span>₹5 Crore</span>
                </div>
              </div>

              {/* Monthly Withdrawal */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                    <Download className="w-4 h-4 text-primary" />
                    Desired Monthly Withdrawal
                  </span>
                  <div className="flex items-center gap-1 bg-[#F2F0EF]/80 border border-border px-3 py-1 rounded-xl font-mono font-bold text-base text-foreground">
                    <span>₹</span>
                    <input
                      type="number"
                      value={monthlyWithdrawal}
                      onChange={(e) => setMonthlyWithdrawal(Math.max(0, Number(e.target.value)))}
                      className="bg-transparent border-none outline-none text-foreground font-mono font-bold text-base text-right p-0 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      style={{ width: `${Math.max(3, String(monthlyWithdrawal).length) * 9 + 5}px` }}
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={500000}
                  step={5000}
                  value={Math.min(500000, Math.max(5000, monthlyWithdrawal))}
                  onChange={(e) => setMonthlyWithdrawal(Number(e.target.value))}
                  className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>₹5k</span>
                  <span>₹2.5 Lakh</span>
                  <span>₹5 Lakh</span>
                </div>
              </div>

              {/* Expected Return Rate */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Expected Return Rate (p.a)
                  </span>
                  <div className="flex items-center gap-1 bg-[#F2F0EF]/80 border border-border px-3 py-1 rounded-xl font-mono font-bold text-base text-foreground">
                    <input
                      type="number"
                      step="0.1"
                      value={expectedReturn}
                      onChange={(e) => setExpectedReturn(Math.max(0, Number(e.target.value)))}
                      className="bg-transparent border-none outline-none text-foreground font-mono font-bold text-base text-right p-0 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      style={{ width: `${Math.max(3, String(expectedReturn).length) * 9 + 5}px` }}
                    />
                    <span>%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={25}
                  step={0.5}
                  value={Math.min(25, Math.max(1, expectedReturn))}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>1%</span>
                  <span>13%</span>
                  <span>25%</span>
                </div>
              </div>

              {/* Pinned Plan Tenure */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                    <Calendar className="w-4 h-4 text-primary" />
                    Withdrawal Tenure (Years)
                  </span>
                  <div className="flex items-center gap-1 bg-[#F2F0EF]/80 border border-border px-3 py-1 rounded-xl font-mono font-bold text-base text-foreground">
                    <input
                      type="number"
                      value={tenureYears}
                      onChange={(e) => setTenureYears(Math.max(0, Number(e.target.value)))}
                      className="bg-transparent border-none outline-none text-foreground font-mono font-bold text-base text-right p-0 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      style={{ width: `${Math.max(2, String(tenureYears).length) * 9 + 5}px` }}
                    />
                    <span>{tenureYears === 1 ? 'Year' : 'Years'}</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={40}
                  step={1}
                  value={Math.min(40, Math.max(1, tenureYears))}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>1 Year</span>
                  <span>20 Years</span>
                  <span>40 Years</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Desired Monthly Income */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                    <Download className="w-4 h-4 text-primary" />
                    Desired Monthly Income (Payout)
                  </span>
                  <div className="flex items-center gap-1 bg-[#F2F0EF]/80 border border-border px-3 py-1 rounded-xl font-mono font-bold text-base text-foreground">
                    <span>₹</span>
                    <input
                      type="number"
                      value={desiredMonthlyIncome}
                      onChange={(e) => setDesiredMonthlyIncome(Math.max(0, Number(e.target.value)))}
                      className="bg-transparent border-none outline-none text-foreground font-mono font-bold text-base text-right p-0 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      style={{ width: `${Math.max(3, String(desiredMonthlyIncome).length) * 9 + 5}px` }}
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={500000}
                  step={5000}
                  value={Math.min(500000, Math.max(5000, desiredMonthlyIncome))}
                  onChange={(e) => setDesiredMonthlyIncome(Number(e.target.value))}
                  className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>₹5k</span>
                  <span>₹2.5 Lakh</span>
                  <span>₹5 Lakh</span>
                </div>
              </div>

              {/* Expected Return Rate */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Expected Return Rate (p.a)
                  </span>
                  <div className="flex items-center gap-1 bg-[#F2F0EF]/80 border border-border px-3 py-1 rounded-xl font-mono font-bold text-base text-foreground">
                    <input
                      type="number"
                      step="0.1"
                      value={corpusExpectedReturn}
                      onChange={(e) => setCorpusExpectedReturn(Math.max(0, Number(e.target.value)))}
                      className="bg-transparent border-none outline-none text-foreground font-mono font-bold text-base text-right p-0 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      style={{ width: `${Math.max(3, String(corpusExpectedReturn).length) * 9 + 5}px` }}
                    />
                    <span>%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={25}
                  step={0.5}
                  value={Math.min(25, Math.max(1, corpusExpectedReturn))}
                  onChange={(e) => setCorpusExpectedReturn(Number(e.target.value))}
                  className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>1%</span>
                  <span>13%</span>
                  <span>25%</span>
                </div>
              </div>

              {/* Time Period (Years) */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                    <Calendar className="w-4 h-4 text-primary" />
                    Duration of Payout (Years)
                  </span>
                  <div className="flex items-center gap-1 bg-[#F2F0EF]/80 border border-border px-3 py-1 rounded-xl font-mono font-bold text-base text-foreground">
                    <input
                      type="number"
                      value={desiredTenureYears}
                      onChange={(e) => setDesiredTenureYears(Math.max(0, Number(e.target.value)))}
                      className="bg-transparent border-none outline-none text-foreground font-mono font-bold text-base text-right p-0 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      style={{ width: `${Math.max(2, String(desiredTenureYears).length) * 9 + 5}px` }}
                    />
                    <span>{desiredTenureYears === 1 ? 'Year' : 'Years'}</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={45}
                  step={1}
                  value={Math.min(45, Math.max(1, desiredTenureYears))}
                  onChange={(e) => setDesiredTenureYears(Number(e.target.value))}
                  className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>1 Year</span>
                  <span>22 Years</span>
                  <span>45 Years</span>
                </div>
              </div>
            </>
          )}

          {/* Dash divider */}
          <div className="border-t border-dashed border-border w-full" />

          {/* Split output info cards */}
          {calculationMode === "tenure" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="bg-white/30 border border-border p-4 rounded-2xl flex flex-col text-left">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Total Payouts</span>
                <span className="text-xl font-bold text-foreground mt-1">{formatCurrency(tenureTotalWithdrawn)}</span>
              </div>
              <div className="bg-white/30 border border-border p-4 rounded-2xl flex flex-col text-left">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest text-primary/75">Est. Interest Earned</span>
                <span className="text-xl font-bold text-primary mt-1">{formatCurrency(tenureInterestEarned)}</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="bg-white/30 border border-border p-4 rounded-2xl flex flex-col text-left">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Total Payout Received</span>
                <span className="text-xl font-bold text-foreground mt-1">{formatCurrency(corpusTotalWithdrawn)}</span>
              </div>
              <div className="bg-white/30 border border-border p-4 rounded-2xl flex flex-col text-left">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest text-primary/75">Growth Interest Component</span>
                <span className="text-xl font-bold text-primary mt-1">{formatCurrency(corpusInterestComponent)}</span>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Dynamic circular SVG indicator and Results */}
        <div className="lg:col-span-5 bg-white/35 border border-border rounded-3xl p-8 shadow-md backdrop-blur-2xl flex flex-col justify-center items-center">
          
          {calculationMode === "tenure" ? (
            <>
              {/* Dynamic Center Panel */}
              <div className="relative w-64 h-64 flex justify-center items-center">
                <svg width="100%" height="100%" viewBox="0 0 120 120" className="transform -rotate-90">
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="rgba(147, 197, 253, 0.15)"
                    strokeWidth="10"
                  />
                  {/* Outer circle remaining balance background */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke={tenureLastsForever ? "#10B981" : "#d4d4d8"}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset="0"
                    className="transition-all duration-500 ease-out"
                  />
                  {/* Foreground circle: total withdrawals */}
                  {!tenureLastsForever && tenureWithdrawnPercent > 0 && (
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="transparent"
                      stroke="#3A8293"
                      strokeWidth="10.2"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffsetTenure}
                      strokeLinecap="round"
                      className="transition-all duration-500 ease-out"
                    />
                  )}
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center px-4">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Corpus Lifespan</span>
                  {tenureLastsForever ? (
                    <div className="flex flex-col items-center gap-1 mt-1">
                      <span className="text-xl md:text-2xl font-bold text-emerald-600 select-text">Infinite</span>
                      <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-600 border border-emerald-500/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">Forever lasts</span>
                    </div>
                  ) : (
                    <span className="text-xl md:text-2xl font-bold text-foreground mt-1 select-text">
                      {tenureYearsFraction > 0 && `${tenureYearsFraction} Yr${tenureYearsFraction > 1 ? 's' : ''}`}
                      {tenureMonthsFraction > 0 && ` ${tenureMonthsFraction} Mo${tenureMonthsFraction > 1 ? 's' : ''}`}
                      {tenureYearsFraction === 0 && tenureMonthsFraction === 0 && "Runs Out Immediately"}
                    </span>
                  )}
                </div>
              </div>

              {/* Detailed metrics output */}
              <div className="w-full mt-6 space-y-3 font-sans text-left">
                <div className="flex justify-between items-center text-xs border-b border-border/40 pb-2">
                  <span className="text-muted-foreground font-clash font-medium">Final Remaining Balance</span>
                  <span className="text-foreground font-mono font-bold">{formatCurrency(tenureRemainingBalance)}</span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#3A8293] shrink-0" />
                    <span className="text-muted-foreground">Total Withdrawn Payouts</span>
                  </div>
                  <span className="text-foreground font-mono font-medium">
                    {tenureWithdrawnPercent.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-zinc-400 shrink-0" />
                    <span className="text-muted-foreground">Corpus Value Remaining</span>
                  </div>
                  <span className="text-foreground font-mono font-medium">
                    {tenureBalancePercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Dynamic Center Panel (Corpus Mode) */}
              <div className="relative w-64 h-64 flex justify-center items-center">
                <svg width="100%" height="100%" viewBox="0 0 120 120" className="transform -rotate-90">
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="rgba(147, 197, 253, 0.15)"
                    strokeWidth="10"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="#d4d4d8"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset="0"
                    className="transition-all duration-500 ease-out"
                  />
                  {corpusInterestPercent > 0 && (
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="transparent"
                      stroke="#3A8293"
                      strokeWidth="10.2"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffsetCorpus}
                      strokeLinecap="round"
                      className="transition-all duration-500 ease-out"
                    />
                  )}
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center px-4">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Required Corpus</span>
                  <span className="text-xl md:text-2xl font-bold text-primary mt-1 select-text">
                    {formatCurrency(calculatedRequiredCorpus)}
                  </span>
                </div>
              </div>

              {/* Detailed metrics output */}
              <div className="w-full mt-6 space-y-3 font-sans text-left">
                <div className="flex justify-between items-center text-xs border-b border-border/40 pb-2">
                  <span className="text-muted-foreground font-clash font-medium">Target SWP Corpus Needed</span>
                  <span className="text-foreground font-mono font-bold">{formatCurrency(calculatedRequiredCorpus)}</span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-zinc-400 shrink-0" />
                    <span className="text-muted-foreground">Self-funded Capital (Principal)</span>
                  </div>
                  <span className="text-foreground font-mono font-medium">
                    {corpusPrincipalPercent.toFixed(1)}%
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#3A8293] shrink-0" />
                    <span className="text-muted-foreground">Compound Growth Component</span>
                  </div>
                  <span className="text-foreground font-mono font-medium">
                    {corpusInterestPercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* SWP Distribution Info Section */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-24 text-left">
        <div className="bg-white/20 backdrop-blur-3xl border border-border p-8 rounded-3xl flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/5 border border-primary/10 text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary font-clash">How to structure a retirement SWP</h3>
              <p className="text-xs text-muted-foreground font-sans">Playbook strategies for systematic passive withdrawals.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#64748B] font-sans leading-relaxed">
            <div className="space-y-2">
              <h4 className="font-bold text-primary font-clash">The 4% Safety Rule</h4>
              <p>For sustainable lifetime payouts, experts suggest a starting monthly withdrawal of 0.33% to 0.4% of your total initial corpus. This helps ensure that expected market growth continuously replenishes your capital base, making your fund sustain indefinitely.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-primary font-clash">Growth Over Payout</h4>
              <p>When expected returns (p.a.) exceed the withdrawal rate percentage, the corpus grows over time. This creates a legacy asset that you can pass down to subsequent generations while enjoying consistent monthly income.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-primary font-clash">Tax and Exit Load Efficiency</h4>
              <p>Structuring withdrawals at least 12 months after your initial investment ensures all payouts are classified as Long-Term Capital Gains (LTCG), which are taxed at lower preferential rates and escape mutual fund exit loads completely.</p>
            </div>
          </div>
        </div>
      </div>

      {isLoaded && (
        <GradualBlur preset="page-footer" height="2rem" style={{ zIndex: 30 }} />
      )}

      <Footer />
    </main>
  );
}
