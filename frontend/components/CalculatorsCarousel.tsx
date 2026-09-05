"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Zap,
  Coins,
  Clock,
  Flame,
  Briefcase,
  Landmark,
  PiggyBank,
  CreditCard,
  Scale,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export interface CalculatorItem {
  icon: React.ElementType;
  color: string;
  badgeBg: string;
  title: string;
  desc: string;
  href: string;
}

export const calculatorsData: CalculatorItem[] = [
  {
    icon: TrendingUp,
    color: "text-emerald-600 border-emerald-200",
    badgeBg: "bg-emerald-50 text-emerald-700",
    title: "SIP Calculator",
    desc: "Model your systematic investments and project compounding growth curves.",
    href: "/sip-calculator",
  },
  {
    icon: Zap,
    color: "text-amber-600 border-amber-200",
    badgeBg: "bg-amber-50 text-amber-700",
    title: "Step-up SIP",
    desc: "Calculate how annual contribution step-ups exponentially accelerate wealth.",
    href: "/step-up-sip-calculator",
  },
  {
    icon: Coins,
    color: "text-sky-600 border-sky-200",
    badgeBg: "bg-sky-50 text-sky-700",
    title: "Lumpsum Calculator",
    desc: "Project the compounding terminal value of a one-time principal allocation.",
    href: "/lumpsum-calculator",
  },
  {
    icon: Clock,
    color: "text-purple-600 border-purple-200",
    badgeBg: "bg-purple-50 text-purple-700",
    title: "SWP Calculator",
    desc: "Plan retirement cash flows and evaluate corpus longevity under withdrawals.",
    href: "/swp-calculator",
  },
  {
    icon: Flame,
    color: "text-rose-600 border-rose-200",
    badgeBg: "bg-rose-50 text-rose-700",
    title: "Inflation Calculator",
    desc: "Visualize future purchasing power and calibrate targets to real terms.",
    href: "/inflation-calculator",
  },
  {
    icon: Briefcase,
    color: "text-teal-600 border-teal-200",
    badgeBg: "bg-teal-50 text-teal-700",
    title: "SIF Portfolio Modeler",
    desc: "Simulate Specialized Investment Fund compounding using hurdle rates.",
    href: "/sif-calculator",
  },
  {
    icon: Landmark,
    color: "text-blue-600 border-blue-200",
    badgeBg: "bg-blue-50 text-blue-700",
    title: "Fixed Deposit (FD)",
    desc: "Compute assured term returns with quarterly reinvestment compounding.",
    href: "/fd-calculator",
  },
  {
    icon: PiggyBank,
    color: "text-pink-600 border-pink-200",
    badgeBg: "bg-pink-50 text-pink-700",
    title: "Recurring Deposit",
    desc: "Estimate monthly deposit maturity values across fixed interest horizons.",
    href: "/rd-calculator",
  },
  {
    icon: CreditCard,
    color: "text-cyan-600 border-cyan-200",
    badgeBg: "bg-cyan-50 text-cyan-700",
    title: "EMI Loan Calculator",
    desc: "Calculate debt servicing outgo and total interest amortization for loans.",
    href: "/emi-calculator",
  },
  {
    icon: Scale,
    color: "text-orange-600 border-orange-200",
    badgeBg: "bg-orange-50 text-orange-700",
    title: "Loan Prepayment",
    desc: "Visualize tenure compression and interest saved via prepayment schedules.",
    href: "/loan-calculator",
  },
];

export default function CalculatorsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const touchStartX = useRef<number | null>(null);

  // Responsive items per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, calculatorsData.length - itemsPerView);
  const activeIndex = Math.min(currentIndex, maxIndex);

  // Smooth loop navigation (Next / Prev wrap smoothly)
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Touch Swipe Handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    touchStartX.current = null;
  };

  const gapPx = 20;
  // Exact mathematical translation accounting for gaps
  const transformStyle = `calc(-${activeIndex} * ((100% - ${(itemsPerView - 1) * gapPx}px) / ${itemsPerView} + ${gapPx}px))`;

  return (
    <div className="w-full relative select-none">
      {/* Centered Header Section */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/10 bg-white/70 text-xs font-semibold text-primary font-mono shadow-xs mb-3 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>INTERACTIVE FINANCIAL SUITE</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-primary font-chillax leading-tight">
          Precision Financial Calculators
        </h2>
        <p className="text-muted-foreground text-xs md:text-sm leading-relaxed font-sans font-medium mt-3 mx-auto max-w-xl">
          Project systematic compounding, model recurring cashflows, optimize debt schedules, and visualize inflation-adjusted goals.
        </p>
      </div>

      {/* Carousel Container */}
      <div
        className="relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Masked Card Viewport Frame */}
        <div className="overflow-hidden rounded-3xl p-1">
          <div
            className="flex transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              gap: `${gapPx}px`,
              transform: `translateX(${transformStyle})`,
            }}
          >
            {calculatorsData.map((calc, i) => {
              const Icon = calc.icon;
              return (
                <div
                  key={i}
                  className="shrink-0 w-full sm:w-[calc((100%-20px)/2)] lg:w-[calc((100%-40px)/3)]"
                >
                  {/* Stable Card (NO auto-scroll, NO hover jump) */}
                  <Link
                    href={calc.href}
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        sessionStorage.setItem("savedHomeScrollY", String(window.scrollY));
                      }
                    }}
                    className="flex flex-col justify-between h-[215px] p-5 sm:p-6 bg-white/75 backdrop-blur-xl border border-white/90 rounded-3xl shadow-[0_8px_25px_rgba(0,0,0,0.03)] text-left relative overflow-hidden block transition-colors duration-200 hover:border-primary/40 hover:bg-white/95"
                  >
                    {/* Card Top */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center ${calc.color} ${calc.badgeBg} shadow-2xs`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10.5px] font-mono font-bold text-muted-foreground bg-white/85 border border-white px-2 py-0.5 rounded-full shadow-2xs">
                          {i + 1 < 10 ? "0" : ""}
                          {i + 1}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-primary font-chillax mb-1.5 leading-snug">
                        {calc.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed font-sans font-medium line-clamp-2">
                        {calc.desc}
                      </p>
                    </div>

                    {/* Card Bottom Link */}
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary tracking-wider uppercase font-mono pt-2.5 border-t border-black/5">
                      <span>Calculate Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Centered Bottom Navigation Controls (Prev Arrow + Dots + Next Arrow) */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous calculator"
          className="w-10 h-10 rounded-2xl bg-white/80 hover:bg-white border border-white/90 hover:border-primary/30 shadow-xs hover:shadow-md flex items-center justify-center text-primary transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Centered Pagination Indicators */}
        <div className="flex items-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              onClick={() => setCurrentIndex(dotIdx)}
              aria-label={`Go to calculator page ${dotIdx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === dotIdx
                  ? "w-7 bg-primary"
                  : "w-2 bg-primary/20 hover:bg-primary/40"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next calculator"
          className="w-10 h-10 rounded-2xl bg-white/80 hover:bg-white border border-white/90 hover:border-primary/30 shadow-xs hover:shadow-md flex items-center justify-center text-primary transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
