'use client';

import React, { useRef, useState, useEffect } from 'react';

interface ScrollRevealSectionProps {
  text: string;
  isLoaded: boolean;
}

export default function ScrollRevealSection({
  text,
  isLoaded,
}: ScrollRevealSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isVisible = false;
    let animationFrameId: number;

    const handleScroll = () => {
      if (!isVisible) return;

      const rect = container.getBoundingClientRect();
      const totalHeight = rect.height;
      const visibleHeight = window.innerHeight;

      // Calculate scroll progress through the container's scroll area
      // rect.top is the offset of the container from the top of the viewport.
      // When it starts pinning (top is 0) to when it finishes pinning (top is -(totalHeight - visibleHeight)).
      const scrolled = -rect.top;
      const maxScroll = totalHeight - visibleHeight;

      if (maxScroll <= 0) return;

      let progress = scrolled / maxScroll;
      progress = Math.min(1, Math.max(0, progress));

      setScrollProgress(progress);
    };

    const handleScrollTick = () => {
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          window.addEventListener('scroll', handleScrollTick, {
            passive: true,
          });
          handleScroll(); // Initial check
        } else {
          window.removeEventListener('scroll', handleScrollTick);
          cancelAnimationFrame(animationFrameId);
        }
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }, // 0, 0.05, 0.1, ... 1.0
    );

    observer.observe(container);

    // Also update on resize to ensure correct heights
    const handleResize = () => {
      handleScroll();
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScrollTick);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Split text into characters
  const characters = text.split('');
  const totalChars = characters.length;

  return (
    <div ref={containerRef} className="h-[250vh] w-full relative select-none">
      {/* Sticky container that centers the text in viewport */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center  overflow-hidden">
        <div
          className={`w-full max-w-5xl px-6 transition-all duration-[1200ms] ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          } delay-[1300ms]`}
        >
          <h2 className="text-3xl md:text-5xl lg:text-[54px] font-normal leading-[1.2] tracking-tight text-[#0B3C5D] font-clash text-left indent-[15%] md:indent-[35%]">
            {characters.map((char, index) => {
              // Distribute reveal starts from 0% to 80% scroll progress.
              // This gives the remaining 20% scroll progress for the text to be fully illuminated
              // before the container unpins and scrolls away.
              const charStart = (index / totalChars) * 0.8;
              const charEnd = charStart + 0.15; // smooth fade window for each letter

              let charOpacity = 0.15; // default muted opacity
              if (scrollProgress > charStart) {
                const fraction =
                  (scrollProgress - charStart) / (charEnd - charStart);
                charOpacity = 0.15 + Math.min(1, Math.max(0, fraction)) * 0.85;
              }

              return (
                <span
                  key={index}
                  style={{
                    opacity: charOpacity,
                    transition: 'opacity 0.08s ease-out',
                  }}
                >
                  {char}
                </span>
              );
            })}
          </h2>
        </div>
      </div>
    </div>
  );
}
