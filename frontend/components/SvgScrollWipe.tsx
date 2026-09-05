'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

interface SvgScrollWipeProps {
  screen1: React.ReactNode;
  screen2: React.ReactNode;
}

export default function SvgScrollWipe({
  screen1,
  screen2,
}: SvgScrollWipeProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const screen1Ref = useRef<HTMLDivElement>(null);
  const screen2Ref = useRef<HTMLDivElement>(null);

  // 16 paths for full coverage of the top-left corner and fanned curved sweeps
  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);
  const path3Ref = useRef<SVGPathElement>(null);
  const path4Ref = useRef<SVGPathElement>(null);
  const path5Ref = useRef<SVGPathElement>(null);
  const path6Ref = useRef<SVGPathElement>(null);
  const path7Ref = useRef<SVGPathElement>(null);
  const path8Ref = useRef<SVGPathElement>(null);
  const path9Ref = useRef<SVGPathElement>(null);
  const path10Ref = useRef<SVGPathElement>(null);
  const path11Ref = useRef<SVGPathElement>(null);
  const path12Ref = useRef<SVGPathElement>(null);
  const path13Ref = useRef<SVGPathElement>(null);
  const path14Ref = useRef<SVGPathElement>(null);
  const path15Ref = useRef<SVGPathElement>(null);
  const path16Ref = useRef<SVGPathElement>(null);

  /*
  useEffect(() => {
    const trigger = triggerRef.current;
    const container = containerRef.current;
    const overlay = overlayRef.current;
    const screen1 = screen1Ref.current;
    const screen2 = screen2Ref.current;

    const paths = [
      path1Ref.current,
      path2Ref.current,
      path3Ref.current,
      path4Ref.current,
      path5Ref.current,
      path6Ref.current,
      path7Ref.current,
      path8Ref.current,
      path9Ref.current,
      path10Ref.current,
      path11Ref.current,
      path12Ref.current,
      path13Ref.current,
      path14Ref.current,
      path15Ref.current,
      path16Ref.current,
    ].filter(Boolean) as SVGPathElement[];

    if (!trigger || !container || !overlay || !screen1 || !screen2 || paths.length === 0) return;

    const ctx = gsap.context(() => {
      // 1. Initial State
      gsap.set(overlay, {
        backdropFilter: 'blur(0px)',
        backgroundColor: 'rgba(250, 246, 240, 0)',
        visibility: 'hidden'
      });
      gsap.set(screen1, { opacity: 1, y: 0, pointerEvents: 'auto' });
      gsap.set(screen2, { opacity: 0, y: 40, pointerEvents: 'none' });

      // Create scroll timeline mapping exactly to scroll progress (0.0 to 1.0)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trigger,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          pin: container,
          anticipatePin: 1,
        },
      });

      // 2. Timeline Animation Steps

      // Step A: Fade in backdrop blur overlay as strokes start drawing
      tl.to(overlay, {
        visibility: 'visible',
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(250, 246, 240, 0.45)',
        duration: 0.35,
      }, 0);

      // Step B: Draw paths in (dashoffset: 1000 -> 0) with varied durations, eases, and larger stagger offsets
      paths.forEach((path, i) => {
        const duration = 0.32 + (i % 4) * 0.035;
        const ease = ['power1.inOut', 'power2.inOut', 'sine.inOut', 'quad.inOut'][i % 4];
        tl.to(path, {
          strokeDashoffset: 0,
          ease: ease,
          duration: duration,
        }, i * 0.024);
      });

      // Step C: Content Swap underneath the full-screen blur transition (peak coverage around 0.4 - 0.6)
      tl.to(screen1, {
        opacity: 0,
        y: -40,
        pointerEvents: 'none',
        duration: 0.15,
        ease: 'power2.in',
      }, 0.25);

      tl.to(screen2, {
        opacity: 1,
        y: 0,
        pointerEvents: 'auto',
        duration: 0.18,
        ease: 'power2.out',
      }, 0.42);

      // Step D: Draw paths out (dashoffset: 0 -> -1000) with varied durations, eases, and offsets
      paths.forEach((path, i) => {
        const duration = 0.32 + ((15 - i) % 4) * 0.035;
        const ease = ['power1.inOut', 'power2.inOut', 'sine.inOut', 'quad.inOut'][(15 - i) % 4];
        tl.to(path, {
          strokeDashoffset: -1000,
          ease: ease,
          duration: duration,
        }, 0.42 + i * 0.02);
      });

      // Step F: Fade out backdrop blur overlay
      tl.to(overlay, {
        backdropFilter: 'blur(0px)',
        backgroundColor: 'rgba(250, 246, 240, 0)',
        duration: 0.35,
      }, 0.65);

      // Set visibility hidden at the very end
      tl.set(overlay, { visibility: 'hidden' }, 1.0);
    }, triggerRef); // scope to triggerRef

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1500);

    // Explicit cleanup using gsap.context to prevent duplicate pin-spacers during React 18 double mounts or Hot Reloads
    return () => {
      ctx.revert();
      clearTimeout(refreshTimer);
    };
  }, []);
  */

  return (
    <div className="w-full relative z-20 flex flex-col gap-40 md:gap-52 py-16 md:py-24">
      {/* Screen 1 wrapper */}
      <div className="w-full flex items-center justify-center">{screen1}</div>

      {/* Screen 2 wrapper */}
      <div
        id="about"
        className="w-full flex items-center justify-center mt-20 sm:mt-28 md:mt-36 lg:mt-48"
      >
        {screen2}
      </div>
    </div>
  );
}
