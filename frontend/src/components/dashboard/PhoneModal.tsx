'use client';

import { useEffect } from 'react';
import { X, Calendar, Mail } from 'lucide-react';

interface PhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  phoneInput: string;
  setPhoneInput: (value: string) => void;
  dobInput: string;
  setDobInput: (value: string) => void;
  anniversaryInput: string;
  setAnniversaryInput: (value: string) => void;
  modalSubmitting: boolean;
  modalError: string | null;
  setModalError: (error: string | null) => void;
  setModalSubmitting: (submitting: boolean) => void;
}

export function PhoneModal({
  isOpen,
  onClose,
  onSubmit,
  phoneInput,
  setPhoneInput,
  dobInput,
  setDobInput,
  anniversaryInput,
  setAnniversaryInput,
  modalSubmitting,
  modalError,
  setModalError,
  setModalSubmitting,
}: PhoneModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white/70 border border-white/40 rounded-3xl p-8 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300 text-left">
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide font-clash">
          Complete Profile
        </h2>
        <p className="text-neutral-500 text-xs font-sans mt-2 leading-relaxed">
          Please enter your details to proceed with your onboarding and
          premium distribution services.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              Mobile / Phone Number *
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. +91 98765 43210"
              value={phoneInput}
              onChange={(e) =>
                setPhoneInput(e.target.value.replace(/[^\d+ ]/g, ''))
              }
              className="w-full px-4 py-3 bg-white/40 border border-border rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-primary font-mono text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              Date of Birth *
            </label>
            <input
              type="date"
              required
              max={new Date().toISOString().split('T')[0]}
              value={dobInput}
              onChange={(e) => setDobInput(e.target.value)}
              className="w-full px-4 py-3 bg-white/40 border border-border rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-primary font-mono text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              Anniversary Date (Optional)
            </label>
            <input
              type="date"
              max={new Date().toISOString().split('T')[0]}
              value={anniversaryInput}
              onChange={(e) => setAnniversaryInput(e.target.value)}
              className="w-full px-4 py-3 bg-white/40 border border-border rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-primary font-mono text-sm"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs font-sans">{error}</p>
          )}

          <button
            type="submit"
            disabled={false}
            className="w-full py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer disabled:opacity-40"
          >
            <span>Save & Continue</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M12 5a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V17a2 2 0 01-2 2h-2M7 7h10" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
}