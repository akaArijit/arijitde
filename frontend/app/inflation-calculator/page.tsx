'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import SoftBoxBlurBg from "@/components/SoftBoxBlurBg";
import { Coins, Calendar, TrendingUp, ArrowLeft, ShieldAlert, Award } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GradualBlur from "@/components/GradualBlur";

export default function InflationCalculator() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Inputs
  const [currentCost, setCurrentCost] = useState(1000000); // 10 Lakhs
  const [yearsToGoal, setYearsToGoal] = useState(10);
  const [inflationRate, setInflationRate] = useState(6); // 6%
  const [expectedReturns, setExpectedReturns] = useState(12); // 12% for SIP calculation

  // Outputs
  const [futureCost, setFutureCost] = useState(0);
  const [inflationImpact, setInflationImpact] = useState(0);
  const [requiredMonthlySip, setRequiredMonthlySip] = useState(0);
  // Mount animation
  useEffect(() => {
    window.scrollTo(0, 0);
    setMounted(true);
    document.title = "Inflation Calculator | FinAnalysis";
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Calculate Inflation & Required SIP
  useEffect(() => {
    const PV = currentCost;
    const N = yearsToGoal;
    const I = inflationRate;
    const R = expectedReturns;

    // FV = PV * (1 + I/100)^N
    const fv = PV * Math.pow(1 + I / 100, N);
    const impact = Math.max(0, fv - PV);

    // Required SIP formula to accumulate FV:
    // M = P * [ ((1 + r)^n - 1) / r ] * (1 + r)
    // => P = M / ( [ ((1 + r)^n - 1) / r ] * (1 + r) )
    const r = R / 12 / 100;
    const n = N * 12;

    let sip = 0;
    if (r === 0) {
      sip = fv / n;
    } else {
      const compoundFactor = ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
      sip = fv / compoundFactor;
    }

    setFutureCost(Math.round(fv));
    setInflationImpact(Math.round(impact));
    setRequiredMonthlySip(Math.round(sip));
  }, [currentCost, yearsToGoal, inflationRate, expectedReturns]);

  // Currency Formatter
  const formatCurrency = (val: number) => {
    if (!mounted) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Percentage visual calculations
  const totalValue = futureCost;
  const currentCostPercent = totalValue > 0 ? (currentCost / totalValue) * 100 : 100;
  const inflationGapPercent = totalValue > 0 ? (inflationImpact / totalValue) * 100 : 0;

  // Donut SVG parameters
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.16
  const strokeDashoffset = circumference - (circumference * inflationGapPercent) / 100;

  return (
    <main className="relative min-h-screen w-full bg-transparent text-foreground flex flex-col font-clash">
      {/* Background Gradient theme */}
      <div className="page-backdrop fixed inset-0 z-0 select-none pointer-events-none">
        <SoftBoxBlurBg />
      </div>

      <Navbar isLoaded={isLoaded} activePath="/inflation-calculator" />

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
          Inflation Calculator
        </h1>
        <p
          className={`text-sm md:text-base text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed font-sans transition-all duration-[1200ms] ease-out ${
            isLoaded ? "opacity-100 blur-none scale-100" : "opacity-0 blur-md scale-95"
          } delay-[400ms]`}
        >
          Inflation eats away your purchasing power silently. Calculate how much your financial targets will actually cost in the future and understand why static savings are not enough.
        </p>
      </div>

      {/* Main content grid */}
      <div
        className={`relative z-10 w-full max-w-5xl mx-auto px-6 pb-36 grid grid-cols-1 lg:grid-cols-12 gap-10 transition-all duration-[1200ms] ease-out ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        } delay-[500ms]`}
      >
        {/* Left Column: Sliders and Inputs */}
        <div className="lg:col-span-7 bg-white/35 border border-border rounded-3xl p-8 shadow-md backdrop-blur-2xl space-y-8 flex flex-col justify-center text-left">
          
          {/* Current Cost of Goal */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                <Coins className="w-4 h-4 text-primary" />
                Current Cost of Goal
              </span>
              <div className="flex items-center gap-1 bg-[#F2F0EF]/80 border border-border px-3 py-1 rounded-xl font-mono font-bold text-base text-foreground">
                <span>₹</span>
                <input
                  type="number"
                  value={currentCost}
                  onChange={(e) => setCurrentCost(Math.max(0, Number(e.target.value)))}
                  className="bg-transparent border-none outline-none text-foreground font-mono font-bold text-base text-right p-0 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ width: `${Math.max(3, String(currentCost).length) * 9 + 5}px` }}
                />
              </div>
            </div>
            <input
              type="range"
              min={50000}
              max={25000000}
              step={50000}
              value={Math.min(25000000, Math.max(50000, currentCost))}
              onChange={(e) => setCurrentCost(Number(e.target.value))}
              className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>₹50,000</span>
              <span>₹1.25 Crore</span>
              <span>₹2.5 Crore</span>
            </div>
          </div>

          {/* Years to Goal */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                <Calendar className="w-4 h-4 text-primary" />
                Years to Goal
              </span>
              <div className="flex items-center gap-1 bg-[#F2F0EF]/80 border border-border px-3 py-1 rounded-xl font-mono font-bold text-base text-foreground">
                <input
                  type="number"
                  value={yearsToGoal}
                  onChange={(e) => setYearsToGoal(Math.max(0, Number(e.target.value)))}
                  className="bg-transparent border-none outline-none text-foreground font-mono font-bold text-base text-right p-0 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ width: `${Math.max(2, String(yearsToGoal).length) * 9 + 5}px` }}
                />
                <span>{yearsToGoal === 1 ? 'Year' : 'Years'}</span>
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={40}
              step={1}
              value={Math.min(40, Math.max(1, yearsToGoal))}
              onChange={(e) => setYearsToGoal(Number(e.target.value))}
              className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>1 Year</span>
              <span>20 Years</span>
              <span>40 Years</span>
            </div>
          </div>

          {/* Expected Inflation Rate */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                <ShieldAlert className="w-4 h-4 text-primary" />
                Expected Inflation Rate (p.a)
              </span>
              <div className="flex items-center gap-1 bg-[#F2F0EF]/80 border border-border px-3 py-1 rounded-xl font-mono font-bold text-base text-foreground">
                <input
                  type="number"
                  step="0.1"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Math.max(0, Number(e.target.value)))}
                  className="bg-transparent border-none outline-none text-foreground font-mono font-bold text-base text-right p-0 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ width: `${Math.max(3, String(inflationRate).length) * 9 + 5}px` }}
                />
                <span>%</span>
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={15}
              step={0.5}
              value={Math.min(15, Math.max(1, inflationRate))}
              onChange={(e) => setInflationRate(Number(e.target.value))}
              className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>1%</span>
              <span>8%</span>
              <span>15%</span>
            </div>
          </div>

          {/* Expected Investment returns rate for matching SIP */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5 font-clash uppercase font-semibold text-[11px] tracking-wider">
                <TrendingUp className="w-4 h-4 text-primary" />
                Expected SIP Returns (p.a)
              </span>
              <div className="flex items-center gap-1 bg-[#F2F0EF]/80 border border-border px-3 py-1 rounded-xl font-mono font-bold text-base text-foreground">
                <input
                  type="number"
                  step="0.1"
                  value={expectedReturns}
                  onChange={(e) => setExpectedReturns(Math.max(0, Number(e.target.value)))}
                  className="bg-transparent border-none outline-none text-foreground font-mono font-bold text-base text-right p-0 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ width: `${Math.max(3, String(expectedReturns).length) * 9 + 5}px` }}
                />
                <span>%</span>
              </div>
            </div>
            <input
              type="range"
              min={4}
              max={20}
              step={0.5}
              value={Math.min(20, Math.max(4, expectedReturns))}
              onChange={(e) => setExpectedReturns(Number(e.target.value))}
              className="w-full accent-primary h-1 bg-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>4%</span>
              <span>12%</span>
              <span>20%</span>
            </div>
          </div>

          {/* Dash divider */}
          <div className="border-t border-dashed border-border w-full" />

          {/* Summary sub cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="bg-white/30 border border-border p-4 rounded-2xl flex flex-col text-left">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Goal Cost Today</span>
              <span className="text-xl font-bold text-foreground mt-1">{formatCurrency(currentCost)}</span>
            </div>
            <div className="bg-white/30 border border-border p-4 rounded-2xl flex flex-col text-left">
              <span className="text-[10px] font-mono text-[#D32F2F] uppercase tracking-widest font-semibold flex items-center gap-1">
                Loss of Purchase Power
              </span>
              <span className="text-xl font-bold text-[#D32F2F] mt-1">-{formatCurrency(inflationImpact)}</span>
            </div>
          </div>

        </div>

        {/* Right Column: Comparison SVG Chart & Required SIP */}
        <div className="lg:col-span-5 bg-white/35 border border-border rounded-3xl p-8 shadow-md backdrop-blur-2xl flex flex-col justify-center items-center">
          
          {/* Dynamic SVG Circle comparing Today vs Future */}
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
              {/* Backing track showing original cost percentage */}
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
              {/* Foreground representing the inflation gap */}
              {inflationGapPercent > 0 && (
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke="#D32F2F"
                  strokeWidth="10.2"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />
              )}
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center px-4">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Future Cost</span>
              <span className="text-xl md:text-2xl font-bold text-foreground mt-1 select-text">
                {formatCurrency(futureCost)}
              </span>
            </div>
          </div>

          {/* Legend and comparative breakdown */}
          <div className="w-full mt-6 space-y-4 font-sans text-left">
            <div className="flex justify-between items-center text-xs border-b border-border/40 pb-2">
              <span className="text-muted-foreground font-clash font-medium">Inflation-adjusted cost</span>
              <span className="text-foreground font-mono font-bold">{formatCurrency(futureCost)}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-zinc-400 shrink-0" />
                <span className="text-muted-foreground">Original cost of goal</span>
              </div>
              <span className="text-foreground font-mono font-medium">
                {currentCostPercent.toFixed(1)}%
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#D32F2F] shrink-0" />
                <span className="text-muted-foreground">Cost increase due to inflation</span>
              </div>
              <span className="text-foreground font-mono font-medium text-[#D32F2F] font-bold">
                {inflationGapPercent.toFixed(1)}%
              </span>
            </div>

            {/* Actionable Required SIP Box */}
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl flex flex-col gap-1 items-start mt-3">
              <span className="text-[9px] font-mono text-primary uppercase font-bold tracking-widest flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-primary" />
                Beat Inflation Playbook
              </span>
              <div className="w-full flex justify-between items-baseline mt-1.5">
                <span className="text-xs text-muted-foreground leading-none">Required Monthly SIP:</span>
                <span className="text-lg font-extrabold text-primary font-clash leading-none">{formatCurrency(requiredMonthlySip)}</span>
              </div>
              <p className="text-[9px] text-muted-foreground leading-relaxed mt-2">
                Starting a monthly SIP of <strong className="text-primary">{formatCurrency(requiredMonthlySip)}</strong> today growing at {expectedReturns}% return rate over {yearsToGoal} years will accumulate the target future cost of {formatCurrency(futureCost)} cleanly.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Educational info section */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-24 text-left">
        <div className="bg-white/20 backdrop-blur-3xl border border-border p-8 rounded-3xl flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/5 border border-primary/10 text-primary">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary font-clash">Inflation: The Invisible Wealth Depreciator</h3>
              <p className="text-xs text-muted-foreground font-sans">Why saving in cash guarantees loss of purchasing power.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#64748B] font-sans leading-relaxed">
            <div className="space-y-2">
              <h4 className="font-bold text-primary font-clash">Goal Cost Escapes Reality</h4>
              <p>Common lifecycle milestones like education, marriage, and retirement escape standard pricing assumptions. With an average inflation of 6%, prices double roughly every 12 years. Saving with standard low-interest bank accounts ensures you fall short of your targets.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-primary font-clash">Real Rate of Return</h4>
              <p>Your investment must beat inflation to generate true wealth. If inflation is 6% and your deposit returns 5%, your real rate of return is -1% after taxes. To build actual purchasing power, you must compound assets in higher yield products like mutual funds or equity assets.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-primary font-clash">Lead the SIP Early</h4>
              <p>The earlier you start, the smaller your required monthly investment. Delaying your SIP by just 3 years can increase your required monthly contribution by up to 40% to achieve the same inflation-adjusted target value later.</p>
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
