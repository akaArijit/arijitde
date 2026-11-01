'use client';

import React from 'react';

/** Renders the animated ambient backdrop behind the home page content. */
export default function SoftBoxBlurBg() {

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
          maskImage:
            'radial-gradient(ellipse 90% 80% at 50% 40%, black 20%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 90% 80% at 50% 40%, black 20%, transparent 80%)',
        }}
      />

      {/* 2. Soft Ambient Fluid Aurora Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Sky Blue / Cyan Light Source (Bottom Left) */}
        <div
          className="orb-1 absolute bottom-[-10%] left-[-10%] md:left-[-5%] w-[420px] h-[420px] md:w-[680px] md:h-[680px] rounded-full blur-[80px] md:blur-[110px] pointer-events-none opacity-75"
          style={{
            background:
              'radial-gradient(circle, rgba(147, 197, 253, 0.75) 0%, rgba(186, 230, 253, 0.45) 45%, rgba(242, 240, 239, 0) 75%)',
            transform: 'translateZ(0)',
          }}
        />

        {/* Ocean Indigo / Azure Bloom (Bottom Right) */}
        <div
          className="orb-2 absolute bottom-[-12%] right-[-10%] md:right-[-8%] w-[450px] h-[450px] md:w-[750px] md:h-[750px] rounded-full blur-[80px] md:blur-[120px] pointer-events-none opacity-70"
          style={{
            background:
              'radial-gradient(circle, rgba(191, 219, 254, 0.8) 0%, rgba(224, 242, 254, 0.5) 40%, rgba(242, 240, 239, 0) 75%)',
            transform: 'translateZ(0)',
          }}
        />

        {/* Subtle Warm Amber / Gold Wealth Shimmer (Center Top) */}
        <div
          className="orb-3 absolute top-[-10%] left-[15%] md:left-[30%] w-[380px] h-[380px] md:w-[550px] md:h-[550px] rounded-full blur-[90px] md:blur-[130px] pointer-events-none opacity-40"
          style={{
            background:
              'radial-gradient(circle, rgba(253, 230, 138, 0.45) 0%, rgba(254, 243, 199, 0.25) 40%, transparent 70%)',
            transform: 'translateZ(0)',
          }}
        />

        {/* Emerald Precision Accent (Center Bottom) */}
        <div
          className="orb-1 absolute bottom-[-5%] left-[20%] md:left-[35%] w-[380px] h-[300px] md:w-[600px] md:h-[450px] rounded-full blur-[80px] md:blur-[120px] pointer-events-none opacity-35"
          style={{
            background:
              'radial-gradient(ellipse, rgba(167, 243, 208, 0.5) 0%, rgba(209, 250, 229, 0.25) 45%, transparent 75%)',
            transform: 'translateZ(0)',
          }}
        />
      </div>



      {/* 5. Subtle Vignette Depth Layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 35%, transparent 45%, rgba(242, 240, 239, 0.4) 100%)',
        }}
      />
    </div>
  );
}
