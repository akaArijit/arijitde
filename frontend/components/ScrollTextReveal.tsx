'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ScrollTextReveal() {
  const triggerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  const aboutText =
    'we offer something no app can replicate — 35 years of relationship-driven expertise combined with modern portfolio intelligence, goal-based planning, and technology-backed analysis.';

  useEffect(() => {
    const trigger = triggerRef.current;
    const container = containerRef.current;
    const textElement = textRef.current;
    if (!trigger || !container || !textElement) return;

    const ctx = gsap.context(() => {
      const chars = textElement.querySelectorAll('.char');
      if (chars.length === 0) return;

      // Set initial state of characters to low opacity
      gsap.set(chars, { opacity: 0.15 });

      // Create scroll-driven timeline to stagger-reveal characters
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trigger,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      });

      tl.to(chars, {
        opacity: 1,
        stagger: 0.5 / chars.length,
        duration: 0.5,
        ease: 'none',
      });
    }, triggerRef); // scope to triggerRef

    // Explicit cleanup using gsap.context to prevent duplicate pin-spacers during React 18 double mounts or Hot Reloads
    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div ref={triggerRef} className="h-[200vh] w-full relative z-10">
      {/* Pinned View Container */}
      <div
        ref={containerRef}
        className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-transparent"
      >
        <div className="max-w-5xl w-full px-6 text-left">
          <h2
            ref={textRef}
            className="text-3xl md:text-5xl lg:text-[54px] font-normal leading-[1.2] tracking-tight text-[#0B3C5D] font-clash indent-[15%] md:indent-[35%]"
          >
            {aboutText.split('').map((char, index) => (
              <span key={index} className="char transition-colors duration-75">
                {char}
              </span>
            ))}
          </h2>
        </div>
      </div>
    </div>
  );
}
