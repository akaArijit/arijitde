'use client';

import { useState, useEffect } from 'react';
import SoftBoxBlurBg from '@/components/SoftBoxBlurBg';
import GradualBlur from '@/components/GradualBlur';
import { Shield, Eye, Lock, RefreshCw, UserCheck, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPolicy() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Mount animation
  useEffect(() => {
    setMounted(true);
    document.title = 'Privacy Policy | FinAnalysis';
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const sections = [
    {
      id: 'information-collection',
      icon: <Eye className="w-5 h-5 text-primary" />,
      title: 'Information We Collect',
      content: (
        <div className="space-y-3 font-sans text-sm text-muted-foreground leading-relaxed">
          <p>
            We collect information you provide directly to us when using
            FinAnalysis, including when you onboard, request a portfolio check,
            use our interactive calculator models, or subscribe to our
            newsletter.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Personal Details:</strong> Name, email address, phone
              number, and physical address provided during onboarding or
              inquiry.
            </li>
            <li>
              <strong>Financial Credentials:</strong> Portfolio statements,
              asset allocations, mutual fund holdings, and insurance cover
              details uploaded for diagnostics.
            </li>
            <li>
              <strong>Technical Diagnostics:</strong> IP address, device types,
              browser info, and general usage patterns recorded via cookies or
              local storage.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'information-use',
      icon: <Shield className="w-5 h-5 text-primary" />,
      title: 'How We Use Information',
      content: (
        <div className="space-y-3 font-sans text-sm text-muted-foreground leading-relaxed">
          <p>
            Your information is processed to deliver structured, data-driven
            personal distribution services and maintain system integrity:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              To perform portfolio evaluations across our 5 core pillars (Goal
              Alignment, Asset Allocation, Diversification, SIP Discipline, Fee
              Efficiency).
            </li>
            <li>
              To run anomaly detection diagnostic models and verify regulatory
              compliance.
            </li>
            <li>
              To coordinate OTP authentication for secure logins and send
              customized alert updates.
            </li>
            <li>
              To communicate updates on financial regulations, market trends,
              and related distribution updates.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'data-security',
      icon: <Lock className="w-5 h-5 text-primary" />,
      title: 'Data Protection & Security',
      content: (
        <p className="font-sans text-sm text-muted-foreground leading-relaxed">
          FinAnalysis implements rigorous industrial safeguards to protect your
          personal and financial credentials. We utilize encrypted transport
          layers (SSL/TLS), secure credential isolation, and restricted database
          clusters. Uploaded portfolio files are stored securely and accessible
          only under verified, authenticated customer contexts rather than via
          public directories. We do not store plain-text credentials or sell
          your portfolio metrics to third-party marketers.
        </p>
      ),
    },
    {
      id: 'third-party',
      icon: <RefreshCw className="w-5 h-5 text-primary" />,
      title: 'Third-Party Integrations',
      content: (
        <p className="font-sans text-sm text-muted-foreground leading-relaxed">
          We share your data with trusted partners and tools only to complete
          critical system logic. This includes cloud database providers (like
          Neon PostgreSQL), secure email delivery hosts (Nodemailer/Gmail), and
          authorized API systems (Google OAuth and Grok LLM integrations). All
          partner channels are governed by strict confidentiality mandates and
          are prohibited from using your data for independent secondary
          objectives.
        </p>
      ),
    },
    {
      id: 'user-rights',
      icon: <UserCheck className="w-5 h-5 text-primary" />,
      title: 'Your Rights & Options',
      content: (
        <div className="space-y-3 font-sans text-sm text-muted-foreground leading-relaxed">
          <p>
            You hold total sovereignty over your financial data. At any stage,
            you may:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Request access to the portfolio logs and personal identifiers
              stored in our databases.
            </li>
            <li>
              Request corrections or adjustments to any incorrect personal
              information.
            </li>
            <li>
              Revoke cookie consent, adjust tracking parameters, or opt-out of
              promotional newsletters.
            </li>
            <li>
              Request complete deletion of your customer profile, uploaded
              statements, and portfolio metrics from our records.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'contact-us',
      icon: <Mail className="w-5 h-5 text-primary" />,
      title: 'Contact & Inquiries',
      content: (
        <p className="font-sans text-sm text-muted-foreground leading-relaxed">
          If you have questions regarding this Privacy Policy, data handling, or
          wish to invoke your rights of deletion/access, please write to us at{' '}
          <strong className="text-primary font-semibold">
            arijit1504@gmail.com
          </strong>
          .
        </p>
      ),
    },
  ];

  return (
    <main className="relative min-h-screen w-full bg-transparent text-foreground flex flex-col font-clash">
      {/* Fixed Background container with User's Gradient Theme */}
      <div className="page-backdrop fixed inset-0 z-0 select-none pointer-events-none">
        <SoftBoxBlurBg />
      </div>

      <Navbar isLoaded={isLoaded} />

      {/* Header Title Section */}
      <div className="relative z-10 flex flex-col justify-center items-center px-6 pt-44 pb-6 text-center max-w-5xl mx-auto">
        <h1
          className={`text-4xl md:text-7xl font-normal tracking-tight mt-12 mb-4 leading-none text-primary font-clash transition-all duration-[1200ms] ease-out ${
            isLoaded
              ? 'opacity-100 blur-none scale-100'
              : 'opacity-0 blur-lg scale-95'
          } delay-[200ms]`}
        >
          Privacy Policy
        </h1>
        <p
          className={`text-sm md:text-base text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed font-sans transition-all duration-[1200ms] ease-out ${
            isLoaded
              ? 'opacity-100 blur-none scale-100'
              : 'opacity-0 blur-md scale-95'
          } delay-[400ms]`}
        >
          Last updated: June 6, 2026. We prioritize the security of your
          financial credentials and personal data. Learn how we handle and
          protect your information.
        </p>
      </div>

      {/* Main Content Layout */}
      <div
        className={`relative z-10 w-full max-w-5xl mx-auto px-6 pb-36 grid grid-cols-1 lg:grid-cols-12 gap-10 transition-all duration-[1200ms] ease-out ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        } delay-[500ms]`}
      >
        {/* Left Column: Quick Navigation Menu (Hidden on mobile) */}
        <div className="hidden lg:block lg:col-span-4 self-start sticky top-32 bg-white/20 border border-border rounded-3xl p-6 shadow-sm backdrop-blur-2xl">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block mb-4">
            Table of Contents
          </span>
          <nav className="flex flex-col gap-3 font-sans text-sm text-left">
            {sections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="text-muted-foreground hover:text-primary transition-colors duration-200 py-1.5 border-b border-border/10 last:border-0 hover:pl-1 transition-all duration-200"
              >
                {sec.title}
              </a>
            ))}
          </nav>
        </div>

        {/* Right Column: Policies */}
        <div className="lg:col-span-8 bg-white/35 border border-border rounded-3xl p-8 md:p-10 shadow-md backdrop-blur-2xl space-y-10 flex flex-col justify-center text-left">
          {sections.map((sec) => (
            <div key={sec.id} id={sec.id} className="space-y-4 scroll-mt-32">
              <div className="flex items-center gap-3 border-b border-border/40 pb-2">
                {sec.icon}
                <h2 className="text-lg md:text-xl font-bold text-primary font-clash tracking-wide">
                  {sec.title}
                </h2>
              </div>
              {sec.content}
            </div>
          ))}
        </div>
      </div>

      <Footer />

      {isLoaded && (
        <GradualBlur
          preset="page-footer"
          height="2rem"
          style={{ zIndex: 30 }}
        />
      )}
    </main>
  );
}
