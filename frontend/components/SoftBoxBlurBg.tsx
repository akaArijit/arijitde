'use client';

import React, { useState, useEffect } from 'react';

export default function SoftBoxBlurBg() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="backdrop-inner absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none">
      <style>{`
        @keyframes float-orb-1 {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(40px, -30px) scale(1.08);
          }
          66% {
            transform: translate(-25px, 20px) scale(0.95);
          }
        }
        @keyframes float-orb-2 {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(-35px, 25px) scale(0.96);
          }
          66% {
            transform: translate(30px, -35px) scale(1.06);
          }
        }
        @keyframes float-orb-3 {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          50% {
            transform: translate(25px, 35px) scale(1.1);
          }
        }
        @keyframes wave-drift {
          0% {
            transform: translateX(0) translateZ(0) scaleY(1);
          }
          50% {
            transform: translateX(-25%) translateZ(0) scaleY(1.05);
          }
          100% {
            transform: translateX(-50%) translateZ(0) scaleY(1);
          }
        }
        .orb-1 {
          animation: float-orb-1 18s ease-in-out infinite;
        }
        .orb-2 {
          animation: float-orb-2 22s ease-in-out infinite;
        }
        .orb-3 {
          animation: float-orb-3 16s ease-in-out infinite;
        }
      `}</style>

      {/* 1. Base Precision Dot Grid with Radial Falloff */}
      <div
        className="absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.08) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 90% 80% at 50% 40%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 50% 40%, black 20%, transparent 80%)',
        }}
      />

      {/* 2. Soft Ambient Fluid Aurora Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Sky Blue / Cyan Light Source (Bottom Left) */}
        <div
          className="orb-1 absolute bottom-[-10%] left-[-5%] w-[680px] h-[680px] rounded-full blur-[110px] pointer-events-none opacity-70"
          style={{
            background: 'radial-gradient(circle, rgba(147, 197, 253, 0.75) 0%, rgba(186, 230, 253, 0.45) 45%, rgba(242, 240, 239, 0) 75%)',
          }}
        />

        {/* Ocean Indigo / Azure Bloom (Bottom Right) */}
        <div
          className="orb-2 absolute bottom-[-12%] right-[-8%] w-[750px] h-[750px] rounded-full blur-[120px] pointer-events-none opacity-65"
          style={{
            background: 'radial-gradient(circle, rgba(191, 219, 254, 0.8) 0%, rgba(224, 242, 254, 0.5) 40%, rgba(242, 240, 239, 0) 75%)',
          }}
        />

        {/* Subtle Warm Amber / Gold Wealth Shimmer (Center Top) */}
        <div
          className="orb-3 absolute top-[-10%] left-[30%] w-[550px] h-[550px] rounded-full blur-[130px] pointer-events-none opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(253, 230, 138, 0.45) 0%, rgba(254, 243, 199, 0.25) 40%, transparent 70%)',
          }}
        />

        {/* Emerald Precision Accent (Center Bottom) */}
        <div
          className="orb-1 absolute bottom-[-5%] left-[35%] w-[600px] h-[450px] rounded-full blur-[120px] pointer-events-none opacity-35"
          style={{
            background: 'radial-gradient(ellipse, rgba(167, 243, 208, 0.5) 0%, rgba(209, 250, 229, 0.25) 45%, transparent 75%)',
          }}
        />
      </div>



      {/* 4. Elegant Glowing Financial Wave Curves (Bottom Edge) */}
      <div className="absolute bottom-0 left-0 right-0 h-[280px] overflow-hidden pointer-events-none opacity-40">
        <svg
          viewBox="0 0 1440 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute bottom-0 w-full h-full preserve-3d"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="fintechWaveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(147, 197, 253, 0.4)" />
              <stop offset="50%" stopColor="rgba(186, 230, 253, 0.6)" />
              <stop offset="100%" stopColor="rgba(147, 197, 253, 0.2)" />
            </linearGradient>
            <linearGradient id="fintechWaveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.6)" />
              <stop offset="50%" stopColor="rgba(191, 219, 254, 0.4)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.2)" />
            </linearGradient>
          </defs>
          <path
            d="M0,160 C320,240 420,80 720,150 C1020,220 1180,100 1440,160 L1440,280 L0,280 Z"
            fill="url(#fintechWaveGrad1)"
          />
          <path
            d="M0,190 C360,110 520,250 860,180 C1140,120 1280,210 1440,170 L1440,280 L0,280 Z"
            fill="url(#fintechWaveGrad2)"
          />
        </svg>
      </div>

      {/* 5. Subtle Vignette Depth Layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 35%, transparent 45%, rgba(242, 240, 239, 0.4) 100%)',
        }}
      />
    </div>
  );
}
