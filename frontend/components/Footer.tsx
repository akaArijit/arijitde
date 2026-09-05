'use client';

import React, { useState, useEffect } from 'react';

interface FooterProps {
  footerRef?: React.RefObject<HTMLDivElement | null>;
  onBookCallClick?: () => void;
}

export default function Footer({ footerRef, onBookCallClick }: FooterProps) {
  const [currentTime, setCurrentTime] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.05 }
    );
    const el = containerRef.current;
    if (el) {
      observer.observe(el);
    }
    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
      };
      setCurrentTime(now.toLocaleTimeString("en-US", options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer ref={footerRef as any} className="w-full bg-transparent relative z-10 pt-24 pb-16 overflow-hidden text-foreground">
      {/* Top Columns Grid */}
      <div className="w-full max-w-5xl mx-auto px-6 mb-20 flex flex-col items-center gap-12 text-center">
        {/* Big "Good buy." title */}
        <h2 className="font-instrument-serif text-7xl sm:text-7xl md:text-[8rem] lg:text-[12rem] font-normal text-primary tracking-tight leading-none drop-shadow-sm select-none">
          Invest Better.
        </h2>
        
        {/* Paragraph description */}
        <p className="font-clash text-sm md:text-lg text-muted-foreground max-w-xl leading-relaxed text-center mx-auto whitespace-pre-line">
          Contact us about your portfolio health report
          or wealth targets. Let's
          collaborate, call us today!
        </p>

        {/* 3 Columns details */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-12 text-sm font-clash mt-6 text-center">
          {/* General Enquiries */}
          <div className="flex flex-col items-center gap-2.5">
            <span className="text-primary font-bold text-base md:text-lg">General Enquiries</span>
            <a href="mailto:arijit1504@gmail.com" className="text-muted-foreground hover:text-primary transition duration-200 underline decoration-primary/30 underline-offset-4 font-normal">
              arijit1504@gmail.com
            </a>
            {onBookCallClick ? (
              <button
                onClick={onBookCallClick}
                className="text-muted-foreground hover:text-primary transition duration-200 underline decoration-primary/30 underline-offset-4 font-normal cursor-pointer bg-transparent border-none p-0 text-left font-clash"
              >
                Book a call
              </button>
            ) : (
              <a
                href="/?book=true"
                className="text-muted-foreground hover:text-primary transition duration-200 underline decoration-primary/30 underline-offset-4 font-normal"
              >
                Book a call
              </a>
            )}
          </div>

          {/* Visit us */}
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <span className="text-primary font-bold text-base md:text-lg mb-0.5">Visit us</span>
            <span className="font-normal">Baguiati, Jardabagan</span>
            <span className="font-normal">Kolkata, West Bengal</span>
            <span className="font-normal">India</span>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center gap-2.5">
            <span className="text-primary font-bold text-base md:text-lg">Quick Links</span>
            <a href="https://www.linkedin.com/in/arijit-de-ba1594358" className="text-muted-foreground hover:text-primary transition duration-200 underline decoration-primary/30 underline-offset-4 font-normal">
              LinkedIn
            </a>
            <a href="https://www.instagram.com/arijit_.04" className="text-muted-foreground hover:text-primary transition duration-200 underline decoration-primary/30 underline-offset-4 font-normal">
              Instagram
            </a>
          </div>
        </div>

        {/* New business profile card */}
        <div className="w-full max-w-xl mx-auto mt-12 p-6 md:p-8 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-white/50 via-white/35 to-amber-500/5 shadow-[0_20px_50px_rgba(245,158,11,0.08)] flex flex-col md:flex-row items-center gap-6 md:gap-8 text-center md:text-left select-none relative overflow-hidden">
          {/* Decorative glowing background gradients */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          <img
            src="/20260702_171545.webp"
            alt="Arijit De"
            className="w-24 h-24 md:w-36 md:h-36 rounded-2xl object-cover object-[center_47%] shrink-0 border border-amber-500/15 shadow-md animate-fade-in relative z-10"
          />
          <div className="flex-1 flex flex-col gap-2.5 relative z-10">
            <h3 className="font-instrument-serif text-xl sm:text-3xl font-bold text-amber-800">New investment?</h3>
            <p className="font-chillax text-base sm:text-xl text-neutral-800 leading-relaxed">
              Reach out today to Arijit De for new financial enquiries at{" "}
              <a href="mailto:arijit1504@gmail.com" className="text-amber-700 hover:text-amber-900 hover:underline font-semibold font-chillax">
                arijit1504@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* SEBI Compliance Disclaimer Block */}
      <div className="w-full max-w-5xl mx-auto px-6 pt-8 pb-4 text-center text-xs md:text-sm text-slate-900 font-sans leading-relaxed select-text space-y-1.5">
        <p className="font-semibold text-neutral-700 text-[12px] sm:text-sm">
          Arijit De | AMFI-registered Mutual Fund Distributor | ARN-273396
        </p>
        <p>
          Portfolio reports on this platform are automated technology outputs and do not constitute investment advice under SEBI regulations.
        </p>
        <p className="text-[13px] sm:text-sm font-medium text-slate-900 mt-1">
          Mutual fund investments are subject to market risks. Please read all scheme related documents carefully.
        </p>
      </div>

      {/* Middle Divider Row */}
      <div className="flex flex-col md:flex-row justify-between items-center w-full border-t border-border max-w-5xl mx-auto px-6 py-6 text-xs text-slate-500 font-sans gap-4">
        <span>©2026 FinAnalysis</span>
        <div className="flex gap-6">
          <a href="/privacy" className="hover:text-primary transition duration-200">Privacy</a>
          <a href="/terms" className="hover:text-primary transition duration-200">Terms</a>
          <a href="/cookies" className="hover:text-primary transition duration-200">Cookies</a>
        </div>
        <span>Designed and Developed by <a href="https://arddev.in" target="_blank" rel="noopener noreferrer" className="hover:text-primary font-bold transition duration-200 font-sans">ard.dev</a></span>
      </div>

      {/* Big Brand Logo Text */}
      <div 
        ref={containerRef}
        className="w-full overflow-hidden flex flex-col justify-end items-center relative min-h-[140px] mt-10"
      >
        <div className="absolute bottom-[-10vw] left-1/2 -translate-x-1/2 w-[60vw] h-[20vw] rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.03)_0%,transparent_70%)] pointer-events-none select-none" />

        {/* Thank You Note */}
        <div 
          style={{
            transition: 'all 2000ms cubic-bezier(0.16, 1, 0.3, 1)',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          }}
          className="text-[12px] sm:text-[14px] font-mono uppercase tracking-widest text-black select-none z-10 text-center animate-pulse mb-6"
        >
          Thank you for choosing us!
        </div>

        <h1 
          style={{ 
            fontSize: "13vw",
            transition: 'all 2400ms cubic-bezier(0.16, 1, 0.3, 1)',
            letterSpacing: isVisible ? '0.06em' : '-0.08em',
            filter: isVisible ? 'blur(0px)' : 'blur(24px)',
            transform: isVisible ? 'translateY(5%) scale(1)' : 'translateY(100px) scale(0.85)',
            opacity: isVisible ? 1 : 0
          }} 
          className="font-chillax font-bold text-black leading-none select-none text-center uppercase"
        >
          FinAnalysis
        </h1>
      </div>
    </footer>
  );
  
}
