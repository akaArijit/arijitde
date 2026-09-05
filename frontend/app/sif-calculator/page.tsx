'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import SoftBoxBlurBg from "@/components/SoftBoxBlurBg";
import GradualBlur from "@/components/GradualBlur";
import { Coins, Calendar, TrendingUp, ShieldCheck, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SIFCalculator() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Calculator inputs state
  const [principal, setPrincipal] = useState(1000000); // 10 Lakhs standard for SIF
  const [annualTopUp, setAnnualTopUp] = useState(100000);
  const [hurdleRate, setHurdleRate] = useState(12); // target hurdle rate
  const [years, setYears] = useState(7);

  // Calculated outputs state
  const [investedAmount, setInvestedAmount] = useState(0);
  const [estReturns, setEstReturns] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  // Mount animation
  useEffect(() => {
    window.scrollTo(0, 0);
    setMounted(true);
    document.title = "SIF Calculator | FinAnalysis";
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Run calculations whenever inputs change
  useEffect(() => {
    let totalInvested = principal;
    let futureValue = principal;
    const h = hurdleRate / 100;

    for (let y = 1; y <= years; y++) {
      // compound previous value
      futureValue = futureValue * (1 + h);
      
      // top-up at start of next year
      if (y < years) {
        futureValue += annualTopUp;
        totalInvested += annualTopUp;
      }
    }

    setInvestedAmount(Math.round(totalInvested));
    setEstReturns(Math.round(Math.max(0, futureValue - totalInvested)));
    setTotalValue(Math.round(futureValue));
  }, [principal, annualTopUp, hurdleRate, years]);

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
          SIF Calculator
        </h1>
        <p
          className={`text-sm md:text-base text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed font-sans transition-all duration-[1200ms] ease-out ${
            isLoaded ? "opacity-100 blur-none scale-100" : "opacity-0 blur-md scale-95"
          } delay-[400ms]`}
        >
          Specialized Investment Funds (SIF) utilize a target hurdle rate and custom top-ups. Model SIF returns with built-in lock-in summaries.
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
          
          {/* SIF Initial Principal */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-sans">
              <span className="text-muted-foreground flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                <Coins className="w-4 h-4 text-primary" />
                Initial SIF Principal
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-[#F2F0EF]/80 border border-border px-3 py-1 rounded-xl font-mono font-bold text-base text-foreground">
                  <span>₹</span>
                  <input
                    type="number"
                    value={principal}
                    onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                    className="bg-transparent border-none outline-none text-foreground font-mono font-bold text-base text-right p-0 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{ width: `${Math.max(3, String(principal).length) * 9 + 5}px` }}
                  />
                </div>
              </div>
            </div>
            <input
              type="range"
              min={100000}
              max={50000000}
              step={100000}
              value={Math.min(50000000, Math.max(100000, principal))}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>₹1 Lakh</span>
              <span>₹2.5 Cr</span>
              <span>₹5 Cr</span>
            </div>
          </div>

          {/* SIF Annual Top-up */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-sans">
              <span className="text-muted-foreground flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                <Coins className="w-4 h-4 text-primary" />
                Annual Top-up Contribution
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-[#F2F0EF]/80 border border-border px-3 py-1 rounded-xl font-mono font-bold text-base text-foreground">
                  <span>₹</span>
                  <input
                    type="number"
                    value={annualTopUp}
                    onChange={(e) => setAnnualTopUp(Math.max(0, Number(e.target.value)))}
                    className="bg-transparent border-none outline-none text-foreground font-mono font-bold text-base text-right p-0 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{ width: `${Math.max(3, String(annualTopUp).length) * 9 + 5}px` }}
                  />
                </div>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={10000000}
              step={20000}
              value={Math.min(10000000, Math.max(0, annualTopUp))}
              onChange={(e) => setAnnualTopUp(Number(e.target.value))}
              className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>₹0</span>
              <span>₹50 Lakhs</span>
              <span>₹1 Cr</span>
            </div>
          </div>

          {/* SIF Hurdle Compounding Rate */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-sans">
              <span className="text-muted-foreground flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                <TrendingUp className="w-4 h-4 text-primary" />
                Target Hurdle Compounding Rate (p.a)
              </span>
              <div className="flex items-center gap-1 bg-[#F2F0EF]/80 border border-border px-3 py-1 rounded-xl font-mono font-bold text-base text-foreground">
                <input
                  type="number"
                  step="0.1"
                  value={hurdleRate}
                  onChange={(e) => setHurdleRate(Math.max(0, Number(e.target.value)))}
                  className="bg-transparent border-none outline-none text-foreground font-mono font-bold text-base text-right p-0 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ width: `${Math.max(3, String(hurdleRate).length) * 9 + 5}px` }}
                />
                <span>%</span>
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={0.5}
              value={Math.min(30, Math.max(1, hurdleRate))}
              onChange={(e) => setHurdleRate(Number(e.target.value))}
              className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>1%</span>
              <span>15%</span>
              <span>30%</span>
            </div>
          </div>

          {/* SIF Duration */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-sans">
              <span className="text-muted-foreground flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                <Calendar className="w-4 h-4 text-primary" />
                Tenure Period (Years)
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

          {/* SIF distribution note */}
          <div className="bg-[#3A8293]/5 border border-[#3A8293]/10 p-4 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#3A8293] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-[#3A8293] font-clash uppercase block mb-1">SIF Regulatory Compliance</span>
              <p className="text-muted-foreground leading-relaxed">
                Specialized Investment Funds are structurally regulated with a standard 3-year lock-in. Ensure your liquidity requirements align with target fund profiles.
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
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Future SIF Value</span>
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
                <span className="text-muted-foreground">Est. Hurdle Appreciation</span>
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
