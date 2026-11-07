'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface NavbarProps {
  isLoaded?: boolean;
  activePath?: string;
  onBookCallClick?: () => void;
}

export default function Navbar({ isLoaded = true, activePath = '/', onBookCallClick }: NavbarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState('/onboarding');
  const [userRole, setUserRole] = useState<string | null>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const initializedRef = useRef(false);

  // Smooth hide on scroll down, reveal on scroll up with rAF throttling
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const delta = currentScrollY - lastScrollY.current;

          // Always show when near the top of the page
          if (currentScrollY <= 80) {
            setIsVisible(true);
          } else if (delta > 15) {
            // Definite scroll down (reading website) -> smoothly glide out
            setIsVisible(false);
          } else if (delta < -12) {
            // Definite scroll up -> smoothly glide into view
            setIsVisible(true);
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
          setDashboardUrl('/onboarding');
        }
      } catch (err) {
        console.error('Failed to parse user from localStorage', err);
        setDashboardUrl('/onboarding');
      }
} else {
      setIsLoggedIn(false);
      setUserRole(null);
      setDashboardUrl('/onboarding');
    }

    if (token) {
      fetch(`/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            localStorage.setItem('user', JSON.stringify(data.data));
          }
        })
        .catch((err) => {
          console.error('Failed to sync user from DB', err);
        });
    }
  }, []);

  const showNav = isLoaded && isVisible;

  return (
    <div
      id="main-navbar"
      className="fixed top-0 left-0 right-0 z-40 w-full flex flex-col items-center will-change-transform"
      style={{
        transform: showNav ? 'translate3d(0, 0, 0) scale(1)' : 'translate3d(0, -125%, 0) scale(0.97)',
        opacity: showNav ? 1 : 0,
        pointerEvents: showNav ? 'auto' : 'none',
        transition: 'transform 0.42s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.32s ease',
      }}
    >
      {/* Centered Floating Navbar */}
      <div className="w-full max-w-7xl px-4 sm:px-6 mt-4">
        <header className="w-full border border-border rounded-2xl backdrop-blur-2xl bg-white/35 shadow-md">
          {/* Navbar Row */}
          <div className="w-full px-4 sm:px-6 py-3 flex items-center justify-between">
            {/* Left: Brand Name & Logo */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2.5 text-lg sm:text-xl font-bold tracking-wider text-primary font-chillax select-none hover:opacity-90"
              >
                <img
                  src="/image.png"
                  alt="FinAnalysis Logo"
                  className="w-6 h-6 rounded-full object-cover shrink-0 border border-primary/15 shadow-sm"
                />
                <span>FinAnalysis</span>
              </Link>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {isLoggedIn ? (
                <Link
                  href={dashboardUrl}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition duration-200 shadow-sm text-center whitespace-nowrap"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/onboarding"
                    className="px-3.5 sm:px-5 py-2 sm:py-2.5 border border-primary/20 hover:border-primary/40 text-primary font-bold text-xs rounded-xl hover:bg-primary/5 transition duration-200 text-center whitespace-nowrap"
                  >
                    Login
                  </Link>
                  {onBookCallClick ? (
                    <button
                      onClick={onBookCallClick}
                      className="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition duration-200 shadow-sm text-center whitespace-nowrap cursor-pointer"
                    >
                      Book a Call
                    </button>
                  ) : (
                    <Link
                      href="/?book=true"
                      className="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition duration-200 shadow-sm text-center whitespace-nowrap"
                    >
                      Book a Call
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </header>
      </div>
    </div>
  );
}