'use client';

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ScrollBlurRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // delay in milliseconds
  duration?: number; // duration in seconds
  style?: React.CSSProperties;
}

export default function ScrollBlurReveal({ 
  children, 
  className, 
  delay = 0,
  duration,
  style
}: ScrollBlurRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            timer = setTimeout(() => {
              setIsIntersecting(true);
            }, delay);
          } else {
            setIsIntersecting(true);
          }
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -80px 0px",
      }
    );

    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      if (rect.top < window.innerHeight + 250 && rect.bottom > -250) {
        setIsIntersecting(true);
      } else {
        observer.observe(ref.current);
      }
    }

    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [delay]);

  const customTransitionStyle: React.CSSProperties = {
    ...style,
    ...(duration ? {
      transitionDuration: `${duration}s`,
    } : {})
  };

  return (
    <div
      ref={ref}
      style={customTransitionStyle}
      className={cn(
        "reveal-fallback-hidden",
        isIntersecting && "reveal-fallback-visible",
        className
      )}
    >
      {children}
    </div>
  );
}
