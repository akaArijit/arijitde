'use client';

import Link from 'next/link';
import SoftBoxBlurBg from '@/components/SoftBoxBlurBg';
import { GoArrowLeft } from 'react-icons/go';

export default function NotFound() {
  return (
    <main className="relative min-h-screen w-full bg-[#F2F0EF] text-foreground flex flex-col items-center justify-center font-clash px-6 overflow-hidden">
      {/* Background container */}
      <div className="page-backdrop fixed inset-0 z-0 select-none pointer-events-none">
        <SoftBoxBlurBg />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 w-full max-w-xl p-8 md:p-12 bg-white/20 backdrop-blur-2xl border border-border rounded-[32px] shadow-xl text-center space-y-8 flex flex-col items-center">
        {/* Error Badge */}
        <span className="text-[10px] text-primary border border-primary/25 bg-primary/5 px-3 py-1 rounded-full uppercase tracking-wider font-semibold select-none">
          Error 404
        </span>

        {/* Heading */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-primary font-instrument-serif leading-none">
            Page Not Found
          </h1>
          <p className="text-[#64748B] text-sm leading-relaxed font-sans max-w-sm mx-auto">
            The page you are looking for doesn't exist or has been shifted.
            Let's redirect you back to safety.
          </p>
        </div>

        {/* Home Button */}
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-2xl transition duration-200 shadow-md uppercase tracking-wider group cursor-pointer"
          >
            <GoArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-200 text-white" />
            <span className="font-bold text-sm">Return to Homepage</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
