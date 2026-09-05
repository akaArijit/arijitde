'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import SoftBoxBlurBg from "@/components/SoftBoxBlurBg";
import GradualBlur from "@/components/GradualBlur";
import { Coins, Calendar, TrendingUp, ReceiptIndianRupee, Sparkles, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LoanCalculator() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Calculator inputs state
  const [loanAmount, setLoanAmount] = useState(5000000); // 50 Lakhs standard for prepayment simulation
  const [interestRate, setInterestRate] = useState(8.5); // Home loan rate
  const [years, setYears] = useState(20);
  const [monthlyPrepayment, setMonthlyPrepayment] = useState(10000); // extra payment per month

  // Calculated outputs state
  const [standardEMI, setStandardEMI] = useState(0);
  const [monthsSaved, setMonthsSaved] = useState(0);
  const [interestSaved, setInterestSaved] = useState(0);
  const [newTenureMonths, setNewTenureMonths] = useState(0);
  const [totalInterestPaid, setTotalInterestPaid] = useState(0);
  // Mount animation
  useEffect(() => {
    window.scrollTo(0, 0);
    setMounted(true);
    document.title = "Loan Prepayment Calculator | FinAnalysis";
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Run calculations whenever inputs change
  useEffect(() => {
    const P = loanAmount;
    const r = interestRate / 12 / 100;
    const originalMonths = years * 12;

    // Standard EMI Formula
    let emi = 0;
    if (r > 0) {
      emi = (P * r * Math.pow(1 + r, originalMonths)) / (Math.pow(1 + r, originalMonths) - 1);
    } else {
      emi = P / originalMonths;
    }

    // Case 1: Standard Amortization (No prepayments)
    let standardTotalInterest = 0;
    let standardBalance = P;
    for (let m = 1; m <= originalMonths; m++) {
      const interestThisMonth = standardBalance * r;
      standardTotalInterest += interestThisMonth;
      const principalThisMonth = Math.min(standardBalance, emi - interestThisMonth);
      standardBalance -= principalThisMonth;
      if (standardBalance <= 0) break;
    }

    // Case 2: Amortization with monthly prepayment
    let prepaymentTotalInterest = 0;
    let prepaymentBalance = P;
    let monthsElapsed = 0;
    while (prepaymentBalance > 0 && monthsElapsed < 600) { // cap at 50 yrs to prevent inf loops
      monthsElapsed++;
      const interestThisMonth = prepaymentBalance * r;
      prepaymentTotalInterest += interestThisMonth;

      const standardPrincipal = emi - interestThisMonth;
      const totalReduction = Math.min(prepaymentBalance, standardPrincipal + monthlyPrepayment);
      prepaymentBalance -= totalReduction;
    }

    setStandardEMI(Math.round(emi));
    setMonthsSaved(Math.max(0, originalMonths - monthsElapsed));
    setInterestSaved(Math.round(Math.max(0, standardTotalInterest - prepaymentTotalInterest)));
    setNewTenureMonths(monthsElapsed);
    setTotalInterestPaid(Math.round(prepaymentTotalInterest));
  }, [loanAmount, interestRate, years, monthlyPrepayment]);

  // Format currency helper (Indian style)
  const formatCurrency = (val: number) => {
    if (!mounted) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // SVG Donut Calculations (Interest Saved vs Interest Paid in Prepayment Case)
  const totalStandardInterest = totalInterestPaid + interestSaved;
  const savedPercent = totalStandardInterest > 0 ? (interestSaved / totalStandardInterest) * 100 : 0;
  const paidPercent = totalStandardInterest > 0 ? (totalInterestPaid / totalStandardInterest) * 100 : 100;

  // Donut parameters
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.16
  const strokeDashoffset = circumference - (circumference * savedPercent) / 100;

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
          Loan Prepayment Calculator
        </h1>
        <p
          className={`text-sm md:text-base text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed font-sans transition-all duration-[1200ms] ease-out ${
            isLoaded ? "opacity-100 blur-none scale-100" : "opacity-0 blur-md scale-95"
          } delay-[400ms]`}
        >
          See how making extra monthly prepayments reduces your loan tenure, shrinks principal fast, and saves massive interest outgo.
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
          
          {/* Loan Principal */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-sans">
              <span className="text-muted-foreground flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                <Coins className="w-4 h-4 text-primary" />
                Total Loan Amount
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
              max={50000000}
              step={100000}
              value={Math.min(50000000, Math.max(100000, loanAmount))}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>₹1 Lakh</span>
              <span>₹2.5 Crores</span>
              <span>₹5 Crores</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-sans">
              <span className="text-muted-foreground flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                <TrendingUp className="w-4 h-4 text-primary" />
                Interest Rate (p.a)
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

          {/* Original Tenure */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-sans">
              <span className="text-muted-foreground flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                <Calendar className="w-4 h-4 text-primary" />
                Original Tenure (Years)
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

          {/* Monthly Prepayment */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-sans">
              <span className="text-[#3A8293] flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                <Sparkles className="w-4 h-4" />
                Monthly Extra Prepayment
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-[#F2F0EF]/80 border border-border px-3 py-1 rounded-xl font-mono font-bold text-base text-foreground">
                  <span>₹</span>
                  <input
                    type="number"
                    value={monthlyPrepayment}
                    onChange={(e) => setMonthlyPrepayment(Math.max(0, Number(e.target.value)))}
                    className="bg-transparent border-none outline-none text-foreground font-mono font-bold text-base text-right p-0 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{ width: `${Math.max(3, String(monthlyPrepayment).length) * 9 + 5}px` }}
                  />
                </div>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={100000}
              step={1000}
              value={Math.min(100000, Math.max(0, monthlyPrepayment))}
              onChange={(e) => setMonthlyPrepayment(Number(e.target.value))}
              className="w-full accent-[#3A8293] h-1 bg-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>₹0</span>
              <span>₹50K</span>
              <span>₹1 Lakh</span>
            </div>
          </div>

          {/* Dotted divider */}
          <div className="border-t border-dashed border-border w-full" />

          {/* Prepayment summary alert card */}
          <div className="bg-[#3A8293]/5 border border-[#3A8293]/15 p-4 rounded-2xl flex items-start gap-3">
            <ReceiptIndianRupee className="w-5 h-5 text-[#3A8293] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-[#3A8293] font-clash uppercase block mb-1">Prepayment Savings Summary</span>
              <p className="text-muted-foreground leading-relaxed">
                By prepaying <span className="text-foreground font-semibold font-sans">{formatCurrency(monthlyPrepayment)}</span> extra monthly, your loan tenure drops from <span className="text-foreground font-semibold font-sans">{years} years</span> to <span className="text-foreground font-semibold font-sans">{(newTenureMonths / 12).toFixed(1)} years</span>—saving you <span className="text-primary font-bold font-sans">{formatCurrency(interestSaved)}</span> in total interest outgo!
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: SVG Donut Chart and Legend */}
        <div className="lg:col-span-5 bg-white/35 border border-border rounded-3xl p-8 shadow-md backdrop-blur-2xl flex flex-col justify-center items-center">
          
          {/* Donut container */}
          <div className="relative w-64 h-64 flex justify-center items-center">
            
            {/* SVG circle */}
            <svg width="100%" height="100%" viewBox="0 0 120 120" className="transform -rotate-90">
              {/* Backing Circle (Paid Interest) */}
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
              
              {/* Foreground Circle (Saved Interest) */}
              {savedPercent > 0 && (
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
            <div className="absolute flex flex-col items-center justify-center text-center px-4">
              <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest leading-none">Interest Saved</span>
              <span className="text-xl md:text-2xl font-bold text-primary mt-1 select-text">{formatCurrency(interestSaved)}</span>
              <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mt-1 block">{(monthsSaved / 12).toFixed(1)} Yrs Saved</span>
            </div>

          </div>

          {/* Donut Legend */}
          <div className="w-full mt-6 space-y-3 font-sans">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-zinc-400 border border-border shrink-0" />
                <span className="text-muted-foreground">Standard Monthly EMI</span>
              </div>
              <span className="text-foreground font-mono font-medium">
                {formatCurrency(standardEMI)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-[#3A8293] shrink-0" />
                <span className="text-muted-foreground">Prepaid Interest Paid</span>
              </div>
              <span className="text-foreground font-mono font-bold">
                {paidPercent.toFixed(1)}% ({formatCurrency(totalInterestPaid)})
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-[#3A8293]/40 shrink-0" />
                <span className="text-muted-foreground">Prepayment Interest Saved</span>
              </div>
              <span className="text-primary font-mono font-bold">
                {savedPercent.toFixed(1)}% ({formatCurrency(interestSaved)})
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
