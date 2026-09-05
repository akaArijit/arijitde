'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize Lenis smooth scrolling
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    // Sync ScrollTrigger with Lenis
    gsap.registerPlugin(ScrollTrigger);
    lenis.on('scroll', ScrollTrigger.update);

    // Bind Lenis animation frame updates to GSAP's ticker
    const updateRaf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateRaf);
    gsap.ticker.lagSmoothing(0);

    const restoreSavedScroll = () => {
      if (window.location.pathname === '/') {
        const savedY = sessionStorage.getItem('savedHomeScrollY');
        if (savedY) {
          const targetY = parseFloat(savedY);
          window.scrollTo(0, targetY);
          if (lenisRef.current) {
            lenisRef.current.scrollTo(targetY, { immediate: true });
          }
          requestAnimationFrame(() => {
            window.scrollTo(0, targetY);
            if (lenisRef.current) {
              lenisRef.current.scrollTo(targetY, { immediate: true });
            }
          });
        }
      }
    };

    window.addEventListener('popstate', restoreSavedScroll);

    return () => {
      window.removeEventListener('popstate', restoreSavedScroll);
      gsap.ticker.remove(updateRaf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // When navigating between routes
  useEffect(() => {
    const lenis = lenisRef.current;
    if (typeof window === 'undefined') return;

    if (pathname !== '/') {
      // Sub-pages always start at the top
      window.scrollTo(0, 0);
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      }
    } else {
      // Returning to homepage: immediately restore previous scroll position
      const savedY = sessionStorage.getItem('savedHomeScrollY');
      if (savedY) {
        const targetY = parseFloat(savedY);
        window.scrollTo(0, targetY);
        if (lenis) {
          lenis.scrollTo(targetY, { immediate: true });
        }
        requestAnimationFrame(() => {
          window.scrollTo(0, targetY);
          if (lenisRef.current) {
            lenisRef.current.scrollTo(targetY, { immediate: true });
          }
          sessionStorage.removeItem('savedHomeScrollY');
        });
      }
    }
  }, [pathname]);

  return null;
}
