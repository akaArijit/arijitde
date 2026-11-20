'use client';

import { X } from 'lucide-react';

export interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function DetailDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  className = '',
}: DetailDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay dim background */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      {/* Drawer container */}
      <div className={`relative z-10 w-full max-w-2xl md:max-w-4xl bg-white border-l border-neutral-200 h-screen max-h-screen shadow-2xl flex flex-col p-6 md:p-8 animate-in slide-in-from-right duration-350 ease-out text-neutral-900 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-6 shrink-0">
          <div>
            <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">
              Detail View
            </span>
            <h2 className="text-xl font-semibold font-clash text-neutral-900 mt-0.5">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-neutral-500 font-mono mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 border border-neutral-200 hover:bg-neutral-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          data-lenis-prevent
          className="space-y-8 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-200 overscroll-contain touch-pan-y pb-10"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default DetailDrawer;