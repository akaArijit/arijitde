'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import SoftBoxBlurBg from "@/components/SoftBoxBlurBg";
import GradualBlur from "@/components/GradualBlur";
import { Coins, Calendar, TrendingUp, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function EMICalculator() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Calculator inputs state
  const [loanAmount, setLoanAmount] = useState(2000000); // 20 Lakhs standard
  const [interestRate, setInterestRate] = useState(8.5); // Home / Car loan rate
  const [years, setYears] = useState(15);

  // Calculated outputs state
  const [monthlyEMI, setMonthlyEMI] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  // Mount animation
  useEffect(() => {
    window.scrollTo(0, 0);
    setMounted(true);
    document.title = "EMI Calculator | FinAnalysis";
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Run calculations whenever inputs change
  useEffect(() => {
    const P = loanAmount;
    const r = interestRate / 12 / 100;
    const n = years * 12;

    // EMI Formula: EMI = [P * r * (1+r)^n] / [(1+r)^n - 1]
    let emi = 0;
    if (r === 0) {
      emi = P / n;
    } else {
      emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const paymentSum = emi * n;
    const interestSum = Math.max(0, paymentSum - P);

    setMonthlyEMI(Math.round(emi));
    setTotalInterest(Math.round(interestSum));
    setTotalPayment(Math.round(paymentSum));
  }, [loanAmount, interestRate, years]);

  // Format currency helper (Indian style)
  const formatCurrency = (val: number) => {
    if (!mounted) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // SVG Donut Calculations
  const interestPercent = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;
  const principalPercent = totalPayment > 0 ? (loanAmount / totalPayment) * 100 : 100;

  // Donut parameters
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.16
  const strokeDashoffset = circumference - (circumference * interestPercent) / 100;

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
          EMI Calculator
        </h1>
        <p
          className={`text-sm md:text-base text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed font-sans transition-all duration-[1200ms] ease-out ${
            isLoaded ? "opacity-100 blur-none scale-100" : "opacity-0 blur-md scale-95"
          } delay-[400ms]`}
        >
          Equated Monthly Installment (EMI) helps map monthly loan repayments. Analyze the principal vs interest breakout clearly.
        </p>
      </div>

      {/* Calculator Columns Layout */}
      <div
        className={`relative z-10 w-full max-w-5xl mx-auto px-6 pb-36 grid grid-cols-1 lg:grid-cols-12 gap-10 transition-all duration-[1200ms] ease-out ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        } delay-[500ms]`}
      >
        {/* Left Column: Sliders and Range Inputs */}
        <div className="lg:col-span-7 bg-white/35 border border-border rounded-3xl p-8 shadow-md backdrop-blur-2xl space-y-8 flex flex-col justify-center text-left">
          
          {/* Loan Amount */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-sans">
              <span className="text-muted-foreground flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                <Coins className="w-4 h-4 text-primary" />
                Loan Principal Amount
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-[#F2F0EF]/80 border border-border px-3 py-1 rounded-xl font-mono font-bold text-base text-foreground">
                  <span>₹</span>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Math.max(0, Number(e.target.value)))}
                    className="bg-transparent border-none outline-none text-foreground font-mono font-bold text-base text-right p-0 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{ width: `${Math.max(3, String(loanAmount).length) * 9 + 5}px` }}
                  />
                </div>
              </div>
            </div>
            <input
              type="range"
              min={100000}
              max={20000000}
              step={50000}
              value={Math.min(20000000, Math.max(100000, loanAmount))}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>₹1 Lakh</span>
              <span>₹1 Crore</span>
              <span>₹2 Crores</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-sans">
              <span className="text-muted-foreground flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                <TrendingUp className="w-4 h-4 text-primary" />
                Annual Interest Rate (p.a)
              </span>
              <div className="flex items-center gap-1 bg-[#F2F0EF]/80 border border-border px-3 py-1 rounded-xl font-mono font-bold text-base text-foreground">
                <input
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Math.max(0, Number(e.target.value)))}
                  className="bg-transparent border-none outline-none text-foreground font-mono font-bold text-base text-right p-0 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ width: `${Math.max(3, String(interestRate).length) * 9 + 5}px` }}
                />
                <span>%</span>
              </div>
            </div>
            <input
              type="range"
              min={5}
              max={20}
              step={0.1}
              value={Math.min(20, Math.max(5, interestRate))}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>5%</span>
              <span>12.5%</span>
              <span>20%</span>
            </div>
          </div>

          {/* Loan Tenure */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-sans">
              <span className="text-muted-foreground flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                <Calendar className="w-4 h-4 text-primary" />
                Loan Tenure (Years)
              </span>
              <div className="flex items-center gap-1 bg-[#F2F0EF]/80 border border-border px-3 py-1 rounded-xl font-mono font-bold text-base text-foreground">
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(Math.max(0, Number(e.target.value)))}
                  className="bg-transparent border-none outline-none text-foreground font-mono font-bold text-base text-right p-0 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ width: `${Math.max(2, String(years).length) * 9 + 5}px` }}
                />
                <span>{years === 1 ? 'Year' : 'Years'}</span>
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={Math.min(30, Math.max(1, years))}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>1 Yr</span>
              <span>15 Yrs</span>
              <span>30 Yrs</span>
            </div>
          </div>

          {/* Dotted divider */}
          <div className="border-t border-dashed border-border w-full" />

          {/* Metrics summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="bg-white/30 border border-border p-4 rounded-2xl flex flex-col text-left">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Monthly EMI Amount</span>
              <span className="text-xl font-bold text-foreground mt-1">{formatCurrency(monthlyEMI)}</span>
            </div>
            <div className="bg-white/30 border border-border p-4 rounded-2xl flex flex-col text-left">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest text-[#3A8293]">Total Interest Outgo</span>
              <span className="text-xl font-bold text-[#3A8293] mt-1">{formatCurrency(totalInterest)}</span>
            </div>
          </div>

        </div>

        {/* Right Column: SVG Donut Chart and Legend */}
        <div className="lg:col-span-5 bg-white/35 border border-border rounded-3xl p-8 shadow-md backdrop-blur-2xl flex flex-col justify-center items-center">
          
          {/* Donut container */}
          <div className="relative w-64 h-64 flex justify-center items-center">
            
            {/* SVG circle */}
            <svg width="100%" height="100%" viewBox="0 0 120 120" className="transform -rotate-90">
              {/* Backing Circle (Principal Amount) */}
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
              
              {/* Foreground Circle (Total Interest) */}
              {interestPercent > 0 && (
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke="#3A8293"
                  strokeWidth="10.2"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />
              )}
            </svg>

            {/* Inner Center Label */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Total Outgo</span>
              <span className="text-xl md:text-2xl font-bold text-foreground mt-1 select-text">{formatCurrency(totalPayment)}</span>
            </div>

          </div>

          {/* Donut Legend */}
          <div className="w-full mt-6 space-y-3 font-sans">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-zinc-400 border border-border shrink-0" />
                <span className="text-muted-foreground">Loan Principal</span>
              </div>
              <span className="text-foreground font-mono font-medium">
                {principalPercent.toFixed(1)}% ({formatCurrency(loanAmount)})
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-[#3A8293] shrink-0" />
                <span className="text-muted-foreground">Interest Outgo</span>
              </div>
              <span className="text-foreground font-mono font-bold">
                {interestPercent.toFixed(1)}% ({formatCurrency(totalInterest)})
              </span>
            </div>
          </div>

        </div>

      </div>

      <Footer />

      {isLoaded && (
        <GradualBlur preset="page-footer" height="2rem" style={{ zIndex: 30 }} />
      )}
    </main>
  );
}
