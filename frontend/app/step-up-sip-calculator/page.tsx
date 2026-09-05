'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import SoftBoxBlurBg from "@/components/SoftBoxBlurBg";
import GradualBlur from "@/components/GradualBlur";
import { Coins, Calendar, TrendingUp, ArrowUpRight, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function StepUpSIPCalculator() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Calculator inputs state
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [years, setYears] = useState(10);
  const [stepUpPercent, setStepUpPercent] = useState(10); // annual step up percentage

  // Calculated outputs state
  const [investedAmount, setInvestedAmount] = useState(0);
  const [estReturns, setEstReturns] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  // Mount animation
  useEffect(() => {
    window.scrollTo(0, 0);
    setMounted(true);
    document.title = "Step-up SIP Calculator | FinAnalysis";
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Run calculations whenever inputs change
  useEffect(() => {
    let totalInvested = 0;
    let futureValue = 0;
    let currentMonthly = monthlyInvestment;
    const monthlyRate = expectedReturn / 12 / 100;
    const totalMonths = years * 12;

    for (let m = 1; m <= totalMonths; m++) {
      totalInvested += currentMonthly;
      futureValue = (futureValue + currentMonthly) * (1 + monthlyRate);

      // Step up at the end of each 12-month cycle (beginning of next year)
      if (m % 12 === 0 && m < totalMonths) {
        currentMonthly = currentMonthly * (1 + stepUpPercent / 100);
      }
    }

    setInvestedAmount(Math.round(totalInvested));
    setEstReturns(Math.round(Math.max(0, futureValue - totalInvested)));
    setTotalValue(Math.round(futureValue));
  }, [monthlyInvestment, expectedReturn, years, stepUpPercent]);

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
  const returnsPercent = totalValue > 0 ? (estReturns / totalValue) * 100 : 0;
  const investedPercent = totalValue > 0 ? (investedAmount / totalValue) * 100 : 100;

  // Donut parameters
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.16
  const strokeDashoffset = circumference - (circumference * returnsPercent) / 100;

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
          Step-up SIP Calculator
        </h1>
        <p
          className={`text-sm md:text-base text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed font-sans transition-all duration-[1200ms] ease-out ${
            isLoaded ? "opacity-100 blur-none scale-100" : "opacity-0 blur-md scale-95"
          } delay-[400ms]`}
        >
          An annual step-up SIP counteracts inflation and grows your capital exponentially faster by increasing monthly contributions over time.
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
          
          {/* Monthly Investment */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-sans">
              <span className="text-muted-foreground flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                <Coins className="w-4 h-4 text-primary" />
                Monthly Investment (Starting)
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-[#F2F0EF]/80 border border-border px-3 py-1 rounded-xl font-mono font-bold text-base text-foreground">
                  <span>₹</span>
                  <input
                    type="number"
                    value={monthlyInvestment}
                    onChange={(e) => setMonthlyInvestment(Math.max(0, Number(e.target.value)))}
                    className="bg-transparent border-none outline-none text-foreground font-mono font-bold text-base text-right p-0 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{ width: `${Math.max(3, String(monthlyInvestment).length) * 9 + 5}px` }}
                  />
                </div>
              </div>
            </div>
            <input
              type="range"
              min={500}
              max={100000}
              step={500}
              value={Math.min(100000, Math.max(500, monthlyInvestment))}
              onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>₹500</span>
              <span>₹50,000</span>
              <span>₹1,0,000</span>
            </div>
          </div>

          {/* Expected Return Rate */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-sans">
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
              max={30}
              step={0.5}
              value={Math.min(30, Math.max(1, expectedReturn))}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>1%</span>
              <span>15%</span>
              <span>30%</span>
            </div>
          </div>

          {/* Time Period */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-sans">
              <span className="text-muted-foreground flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                <Calendar className="w-4 h-4 text-primary" />
                Time Period (Years)
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
              max={40}
              step={1}
              value={Math.min(40, Math.max(1, years))}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>1 Yr</span>
              <span>20 Yrs</span>
              <span>40 Yrs</span>
            </div>
          </div>

          {/* Annual Step-up Percentage */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-sans">
              <span className="text-muted-foreground flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                <ArrowUpRight className="w-4 h-4 text-primary" />
                Annual Step-up Rate
              </span>
              <div className="flex items-center gap-1 bg-[#F2F0EF]/80 border border-border px-3 py-1 rounded-xl font-mono font-bold text-base text-foreground">
                <input
                  type="number"
                  value={stepUpPercent}
                  onChange={(e) => setStepUpPercent(Math.max(0, Number(e.target.value)))}
                  className="bg-transparent border-none outline-none text-foreground font-mono font-bold text-base text-right p-0 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ width: `${Math.max(2, String(stepUpPercent).length) * 9 + 5}px` }}
                />
                <span>%</span>
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              step={1}
              value={Math.min(50, Math.max(1, stepUpPercent))}
              onChange={(e) => setStepUpPercent(Number(e.target.value))}
              className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>1%</span>
              <span>25%</span>
              <span>50%</span>
            </div>
          </div>

          {/* Dotted divider */}
          <div className="border-t border-dashed border-border w-full" />

          {/* Metrics summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="bg-white/30 border border-border p-4 rounded-2xl flex flex-col text-left">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Total Invested Capital</span>
              <span className="text-xl font-bold text-foreground mt-1">{formatCurrency(investedAmount)}</span>
            </div>
            <div className="bg-white/30 border border-border p-4 rounded-2xl flex flex-col text-left">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest text-primary/75">Est. Wealth Returns</span>
              <span className="text-xl font-bold text-primary mt-1">{formatCurrency(estReturns)}</span>
            </div>
          </div>

        </div>

        {/* Right Column: SVG Donut Chart and Legend */}
        <div className="lg:col-span-5 bg-white/35 border border-border rounded-3xl p-8 shadow-md backdrop-blur-2xl flex flex-col justify-center items-center">
          
          {/* Donut container */}
          <div className="relative w-64 h-64 flex justify-center items-center">
            
            {/* SVG circle */}
            <svg width="100%" height="100%" viewBox="0 0 120 120" className="transform -rotate-90">
              {/* Backing Circle (Invested Amount) */}
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
              
              {/* Foreground Circle (Est. Returns) */}
              {returnsPercent > 0 && (
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
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Future Value</span>
              <span className="text-xl md:text-2xl font-bold text-foreground mt-1 select-text">{formatCurrency(totalValue)}</span>
            </div>

          </div>

          {/* Donut Legend */}
          <div className="w-full mt-6 space-y-3 font-sans">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-zinc-400 border border-border shrink-0" />
                <span className="text-muted-foreground">Invested Capital</span>
              </div>
              <span className="text-foreground font-mono font-medium">
                {investedPercent.toFixed(1)}% ({formatCurrency(investedAmount)})
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-[#3A8293] shrink-0" />
                <span className="text-muted-foreground">Est. Wealth Returns</span>
              </div>
              <span className="text-foreground font-mono font-bold">
                {returnsPercent.toFixed(1)}% ({formatCurrency(estReturns)})
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
