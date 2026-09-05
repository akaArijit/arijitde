"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

/* ───────── Dynamic Risk Gradient Helper ───────── */

export function getRiskGradientColor(ratio: number): string {
  // ratio: 0 to 1
  if (ratio < 0.25) return "#10B981"; // Emerald Green (Elephant)
  if (ratio < 0.50) return "#06B6D4"; // Cyan / Sky Blue (Deer)
  if (ratio < 0.72) return "#F59E0B"; // Amber Gold (Tiger)
  if (ratio < 0.85) return "#EA580C"; // Deep Orange (Fox)
  return "#EF4444"; // Vivid Crimson (Lion)
}

/* ───────── Smooth Rolling Digit Component ───────── */

function RollingDigit({
  digit,
  isDragging,
}: {
  digit: number;
  isDragging: boolean;
}) {
  return (
    <div
      className="relative inline-block h-[1.12em] overflow-hidden leading-[1.12em] tabular-nums"
      style={{ width: "0.62em" }}
    >
      <div
        className="flex flex-col"
        style={{
          transform: `translateY(-${digit * 10}%)`,
          transition: isDragging
            ? "none"
            : "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "transform",
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className="h-[1.12em] flex items-center justify-center">
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}

function SmoothNumberDisplay({
  value,
  isDragging,
}: {
  value: number;
  isDragging: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const str = clamped.toString();
  const digits = str.split("").map((d) => parseInt(d, 10));

  return (
    <div className="flex items-center justify-center font-chillax font-black tracking-tight text-primary select-none">
      {digits.map((d, i) => (
        <RollingDigit key={`${digits.length}-${i}`} digit={d} isDragging={isDragging} />
      ))}
    </div>
  );
}

/* ───────── Main Knob Slider ───────── */

export interface KnobSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: number;
  color?: string;
  label?: string;
}

export const KnobSlider: React.FC<KnobSliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  size = 250,
  color,
  label = "RISK INDEX",
}) => {
  const knobRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  // Local animated display value to ensure 120 FPS transitions without lagging the parent page
  const [displayValue, setDisplayValue] = useState(value);
  const animRef = useRef<number | null>(null);
  const prevVal = useRef(value);
  const lastTargetRef = useRef(value);

  // Smooth internal animation when parent `value` changes via button click
  useEffect(() => {
    if (isDraggingRef.current) {
      setDisplayValue(value);
      lastTargetRef.current = value;
      return;
    }

    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
    }

    const start = lastTargetRef.current;
    const target = value;
    lastTargetRef.current = value;
    if (start === target) return;

    const startTime = performance.now();
    const duration = 380; // ms: crisp, responsive ease-out

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * ease);
      setDisplayValue(current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(step);
      }
    };

    animRef.current = requestAnimationFrame(step);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [value]);

  const tickCount = 72;
  const innerSize = size * 0.68;
  const currentRatio = Math.max(0, Math.min(1, (displayValue - min) / (max - min)));
  const activeColor = color || getRiskGradientColor(currentRatio);

  /* Convert pointer coordinates → value with wrap-around guard */
  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      if (!knobRef.current) return;

      const rect = knobRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      let angle = (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI + 90;
      if (angle < 0) angle += 360;

      const percent = angle / 360;
      let newValue = Math.round(percent * (max - min) + min);

      // Prevent sudden jump across top dead center (0 <-> max)
      if (prevVal.current > max * 0.8 && newValue < max * 0.2) {
        newValue = max;
      } else if (prevVal.current < max * 0.2 && newValue > max * 0.8) {
        newValue = min;
      }

      newValue = Math.max(min, Math.min(max, newValue));
      prevVal.current = newValue;
      setDisplayValue(newValue);
      onChange(newValue);
    },
    [min, max, onChange]
  );

  /* Pointer events with hardware pointer capture for 120 FPS tracking */
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // fallback
    }
    isDraggingRef.current = true;
    setIsDragging(true);
    if (animRef.current) cancelAnimationFrame(animRef.current);
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  /* Mouse Wheel / Trackpad Scroll to adjust value */
  useEffect(() => {
    const el = knobRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const step = e.shiftKey ? 5 : 1;
      const delta = e.deltaY < 0 ? step : -step;
      const nextVal = Math.min(max, Math.max(min, displayValue + delta));
      if (nextVal !== displayValue) {
        setDisplayValue(nextVal);
        onChange(nextVal);
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [displayValue, min, max, onChange]);

  const currentAngle = currentRatio * 360;

  return (
    <div
      ref={knobRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative flex items-center justify-center rounded-full select-none transition-shadow duration-300 ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      style={{
        width: size,
        height: size,
        touchAction: "none",
        boxShadow: `0 18px 45px -10px ${activeColor}35, 0 0 35px -6px ${activeColor}20`,
      }}
    >
      {/* Outer Glowing Halo Ring */}
      <div
        className="absolute inset-0 rounded-full border border-black/5 dark:border-white/10 bg-gradient-to-br from-white/95 via-slate-50/85 to-slate-100/95 dark:from-neutral-900/95 dark:via-neutral-900/85 dark:to-neutral-950/95 backdrop-blur-xl"
        style={{
          boxShadow: `inset 0 1.5px 3px rgba(255,255,255,0.95), inset 0 -2px 5px rgba(0,0,0,0.05)`,
        }}
      />

      {/* SVG Tick Ring & Dynamic Gradient Ticks */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
      >
        <defs>
          <filter id="knobTickGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor={activeColor} floodOpacity="0.8" />
          </filter>
        </defs>

        {/* Circular Subtle Guide Track */}
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="rgba(0, 0, 0, 0.05)"
          strokeWidth="1.2"
        />

        {/* Dynamic Calibrated Ticks */}
        {Array.from({ length: tickCount }).map((_, i) => {
          const angle = (i * 360) / tickCount;
          const tickRatio = i / tickCount;
          const isActive = angle <= currentAngle || (currentAngle >= 355 && i === 0);
          const tickColor = getRiskGradientColor(tickRatio);
          const isMajor = i % 6 === 0;

          return (
            <line
              key={i}
              x1="50"
              y1="4"
              x2="50"
              y2={isMajor ? "11.5" : "8.5"}
              transform={`rotate(${angle} 50 50)`}
              stroke={isActive ? tickColor : "currentColor"}
              strokeWidth={isActive ? (isMajor ? "1.6" : "1.1") : "0.75"}
              strokeLinecap="round"
              className={isActive ? "" : "text-neutral-300 dark:text-neutral-700"}
              opacity={isActive ? 1 : 0.35}
              filter={isActive ? "url(#knobTickGlow)" : undefined}
            />
          );
        })}
      </svg>

      {/* Rotating Neon Laser Pointer Pip */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `rotate(${currentAngle}deg)`,
          transition: isDragging ? "none" : "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
          style={{ top: size * 0.032 }}
        >
          <div
            className="w-3 h-3 rounded-full shadow-md"
            style={{
              backgroundColor: activeColor,
              boxShadow: `0 0 12px 3px ${activeColor}, 0 0 20px ${activeColor}90`,
              border: "2px solid #ffffff",
            }}
          />
          <div
            className="w-0.5 h-2.5 mt-0.5 rounded-full opacity-80"
            style={{
              backgroundColor: activeColor,
              boxShadow: `0 0 6px ${activeColor}`,
            }}
          />
        </div>
      </div>

      {/* Inner Rotary Dial Hub */}
      <div
        className="relative rounded-full flex flex-col items-center justify-center bg-gradient-to-b from-white via-slate-50 to-slate-100/95 dark:from-neutral-800 dark:via-neutral-850 dark:to-neutral-900 border border-white/90 dark:border-neutral-700 select-none transition-all duration-300"
        style={{
          width: innerSize,
          height: innerSize,
          boxShadow: `0 12px 30px -8px rgba(0,0,0,0.12), inset 0 2px 4px rgba(255,255,255,0.95), inset 0 -3px 6px rgba(0,0,0,0.06)`,
        }}
      >
        {/* Subtle Concentric Rings */}
        <div className="absolute inset-2 rounded-full border border-neutral-200/50 dark:border-neutral-700/50 pointer-events-none" />
        <div className="absolute inset-3.5 rounded-full border border-dashed border-neutral-200/35 dark:border-neutral-700/35 pointer-events-none" />

        {/* Dynamic Center Ambient Glow */}
        <div
          className="absolute w-20 h-20 rounded-full blur-xl opacity-20 pointer-events-none transition-all duration-400"
          style={{ backgroundColor: activeColor }}
        />

        {/* Numeric Display */}
        <div
          className="relative z-10"
          style={{ fontSize: innerSize * 0.34 }}
        >
          <SmoothNumberDisplay value={displayValue} isDragging={isDragging} />
        </div>

        {/* Subtitle / Risk Index Tag */}
        <div className="relative z-10 flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-full bg-neutral-100/90 dark:bg-neutral-800/90 border border-neutral-200/60 dark:border-neutral-700/60 shadow-2xs backdrop-blur-sm">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse shadow-xs"
            style={{ backgroundColor: activeColor }}
          />
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};

export default KnobSlider;