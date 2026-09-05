'use client';

import React, { useState, useEffect, useRef } from 'react';

interface NavbarProps {
  isLoaded?: boolean;
  activePath?: string;
  onBookCallClick?: () => void;
}

export default function Navbar({ isLoaded = true, activePath = '/', onBookCallClick }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState('/onboarding');
  const [userRole, setUserRole] = useState<string | null>(null);
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      setIsLoggedIn(true);
      try {
        const user = JSON.parse(userStr);
        const role = user?.role;
        setUserRole(role || 'USER');
        if (role === 'ADMIN') {
          setDashboardUrl('/dashboard/admin');
        } else if (role === 'CLIENT') {
          setDashboardUrl('/dashboard/client');
        } else {
          setDashboardUrl('/dashboard/user');
        }
      } catch (err) {
        console.error("Failed to parse user from localStorage", err);
        setDashboardUrl('/dashboard/user');
      }
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
      setDashboardUrl('/onboarding');
    }

    if (token) {
      fetch(`${backendUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            localStorage.setItem('user', JSON.stringify(data.data));
          }
        })
        .catch(err => {
          console.error("Failed to sync user from DB", err);
        });
    }
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-40 w-full flex flex-col items-center transition-all duration-[1000ms] cubic-bezier(0.25,1,0.5,1) ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-24"
        }`}
    >
      {/* Centered Floating Navbar */}
      <div className="w-full max-w-7xl px-4 sm:px-6 mt-4">
        <header className="w-full border border-border rounded-2xl backdrop-blur-2xl bg-white/35 shadow-md transition-all duration-350 ease-in-out">
          {/* Top Navbar Row */}
          <div className="w-full px-6 py-3.5 flex items-center justify-between">
            {/* Left: Brand Name & Logo */}
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-2.5 text-xl font-bold tracking-wider text-primary font-chillax select-none hover:opacity-90">
                <img
                  src="/image.png"
                  alt="FinAnalysis Logo"
                  className="w-6 h-6 rounded-full object-cover shrink-0 border border-primary/15 shadow-sm"
                />
                <span>FinAnalysis</span>
              </a>
            </div>

            {/* Center: Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
              <a
                href="/#about"
                className={`hover:text-primary transition duration-200 ${activePath === '#about' ? 'text-primary font-bold' : ''}`}
              >
                About
              </a>
              <a
                href="/#contact"
                className={`hover:text-primary transition duration-200 ${activePath === '#contact' ? 'text-primary font-bold' : ''}`}
              >
                Contact
              </a>
              <a
                href="/#calculators"
                className={`hover:text-primary transition duration-200 ${activePath === '#calculators' ? 'text-primary font-bold' : ''}`}
              >
                Calculators
              </a>
              <a
                href="/quiz"
                className={`hover:text-primary transition duration-200 ${activePath === '/quiz' ? 'text-primary font-bold' : ''}`}
              >
                Investor Quiz
              </a>
              <a
                href="/#faq"
                className={`hover:text-primary transition duration-200 ${activePath === '#faq' ? 'text-primary font-bold' : ''}`}
              >
                FAQ
              </a>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn ? (
                <a href={dashboardUrl} className="px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition duration-200 shadow-sm text-center whitespace-nowrap">
                  Dashboard
                </a>
              ) : (
                <>
                  <a href="/onboarding" className="px-5 py-2.5 border border-primary/20 hover:border-primary/40 text-primary font-bold text-xs rounded-xl hover:bg-primary/5 transition duration-200 text-center whitespace-nowrap">
                    Login
                  </a>
                  {onBookCallClick ? (
                    <button
                      onClick={onBookCallClick}
                      className="px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition duration-200 shadow-sm text-center whitespace-nowrap cursor-pointer"
                    >
                      Book a Call
                    </button>
                  ) : (
                    <a
                      href="/?book=true"
                      className="px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition duration-200 shadow-sm text-center whitespace-nowrap"
                    >
                      Book a Call
                    </a>
                  )}
                </>
              )}
            </div>

            <div className="flex md:hidden items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-primary hover:text-primary/80 focus:outline-none p-1"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Bottom Row: Mobile Nav Links */}
          <div
            className={`md:hidden transition-all duration-500 ease-in-out border-t border-border bg-card/40 ${isMobileMenuOpen ? "max-h-[400px] py-6 px-6" : "max-h-0 py-0 px-6 pointer-events-none opacity-0"
              } overflow-hidden`}
          >
            <nav className="flex flex-col gap-4 text-base font-semibold text-muted-foreground">
              <a
                href="/#about"
                className={`hover:text-primary transition-all duration-300 transform ${isMobileMenuOpen ? "opacity-100 translate-x-0 font-clash" : "opacity-0 -translate-x-4"
                  } delay-[100ms]`}
              >
                About
              </a>
              <a
                href="/#contact"
                className={`hover:text-primary transition-all duration-300 transform ${isMobileMenuOpen ? "opacity-100 translate-x-0 font-clash" : "opacity-0 -translate-x-4"
                  } delay-[200ms]`}
              >
                Contact
              </a>
              <a
                href="/#calculators"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`hover:text-primary transition-all duration-300 transform ${isMobileMenuOpen ? "opacity-100 translate-x-0 font-clash" : "opacity-0 -translate-x-4"
                  } delay-[400ms]`}
              >
                Calculators
              </a>
              <a
                href="/quiz"
                className={`hover:text-primary transition-all duration-300 transform ${isMobileMenuOpen ? "opacity-100 translate-x-0 font-clash" : "opacity-0 -translate-x-4"
                  } delay-[450ms]`}
              >
                Investor Quiz
              </a>
              <a
                href="/#faq"
                className={`hover:text-primary transition-all duration-300 transform ${isMobileMenuOpen ? "opacity-100 translate-x-0 font-clash" : "opacity-0 -translate-x-4"
                  } delay-[500ms]`}
              >
                FAQ
              </a>
              <hr className="border-border my-2" />
              <div
                className={`flex gap-4 items-center transition-all duration-300 transform ${isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  } delay-[500ms]`}
              >
                {isLoggedIn ? (
                  <a href={dashboardUrl} className="flex-1 text-center py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary/90 transition duration-200">
                    Dashboard
                  </a>
                ) : (
                  <>
                    <a href="/onboarding" className="flex-1 text-center py-2.5 text-sm font-bold text-primary border border-primary/25 rounded-xl hover:bg-primary/5 transition duration-200">
                      Login
                    </a>
                    {onBookCallClick ? (
                      <button
                        onClick={onBookCallClick}
                        className="flex-1 text-center py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary/90 transition duration-200 cursor-pointer"
                      >
                        Book a Call
                      </button>
                    ) : (
                      <a
                        href="/?book=true"
                        className="flex-1 text-center py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary/90 transition duration-200"
                      >
                        Book a Call
                      </a>
                    )}
                  </>
                )}
              </div>
            </nav>
          </div>
        </header>
      </div>
    </div>
  );
}
