'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronRight, Loader2, ShieldCheck } from 'lucide-react';

interface BookingCalendarProps {
  onBook: (slots: { slot1: string; slot2: string; slot3: string }) => void;
  isLoading?: boolean;
  onBack?: () => void;
  freeSlots?: string[];
  isFetchingSlots?: boolean;
  onFetchSlots?: () => void;
}

export function BookingCalendar({
  onBook,
  isLoading = false,
  onBack,
  freeSlots = [],
  isFetchingSlots = false,
  onFetchSlots,
}: BookingCalendarProps) {
  const [slot1, setSlot1] = useState('');
  const [slot2, setSlot2] = useState('');
  const [slot3, setSlot3] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (freeSlots.length === 0 && onFetchSlots) {
      onFetchSlots();
    }
  }, [onFetchSlots]);

  const handleBookMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot1 || !slot2 || !slot3) {
      setError('Please select all 3 preferred time slots.');
      return;
    }

    setError(null);
    onBook({ slot1, slot2, slot3 });
  };

  const minDateTime = new Date(Date.now() + 3600000)
    .toISOString()
    .slice(0, 16);

  return (
    <div className="w-full max-w-xl border border-primary/20 bg-[radial-gradient(circle_at_top_right,rgba(138,92,255,0.06)_0%,transparent_60%)] bg-white/30 backdrop-blur-xl rounded-3xl p-8 md:p-10 flex flex-col gap-6 shadow-2xl relative overflow-hidden animate-in fade-in duration-500 text-left">
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold text-neutral-900 tracking-wide font-clash">
          Schedule Consultation
        </h2>
        <p className="text-neutral-600 text-xs font-sans leading-relaxed">
          You have selected the Live Portfolio Review Discussion. Please
          select your 3 distinct preferred date and time slots for Arijit
          to review and confirm one.
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block font-mono">
              Preferred Time Option 1 *
            </label>
            <input
              type="datetime-local"
              required
              value={slot1}
              onChange={(e) => setSlot1(e.target.value)}
              min={minDateTime}
              className="w-full bg-white/50 border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary text-neutral-950 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block font-mono">
              Preferred Time Option 2 *
            </label>
            <input
              type="datetime-local"
              required
              value={slot2}
              onChange={(e) => setSlot2(e.target.value)}
              min={minDateTime}
              className="w-full bg-white/50 border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary text-neutral-950 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block font-mono">
              Preferred Time Option 3 *
            </label>
            <input
              type="datetime-local"
              required
              value={slot3}
              onChange={(e) => setSlot3(e.target.value)}
              min={minDateTime}
              className="w-full bg-white/50 border border-neutral-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary text-neutral-950 font-mono"
            />
          </div>
        </div>

        <div className="w-full p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-[11px] text-blue-700 font-sans leading-relaxed flex gap-2.5">
          <span className="text-base">🛡️</span>
          <span>
            <strong>We value your trust.</strong> If your scheduled
            session does not happen for any reason, you will receive a
            full refund within 24 hours. No questions asked.
          </span>
        </div>

        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={() => onBook({ slot1, slot2, slot3 })}
            disabled={isLoading || !slot1 || !slot2 || !slot3}
            className="w-full py-3.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer shadow-lg disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Slots...</span>
              </>
            ) : (
              <>
                <span>Submit Booking Slots</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}