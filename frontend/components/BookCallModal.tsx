'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Mail,
  User,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface BookCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookCallModal({ isOpen, onClose }: BookCallModalProps) {
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [slot1, setSlot1] = useState('');
  const [slot2, setSlot2] = useState('');
  const [slot3, setSlot3] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set min datetime dynamically to 1 hour from now
  const [minDateTime, setMinDateTime] = useState('');

  useEffect(() => {
    // Generate ISO string format for datetime-local input: YYYY-MM-DDTHH:MM
    const date = new Date(Date.now() + 3600000); // 1 hour from now
    const localISO = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setMinDateTime(localISO);

    // Try prefilling form if user is logged in
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.name) setName(user.name);
        if (user.email) setEmail(user.email);
        if (user.phone) setPhone(user.phone);
      } catch (e) {
        console.error('Failed to parse user details from local storage:', e);
      }
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !phone || !slot1 || !slot2 || !slot3) {
      setError('Please fill out all required fields.');
      return;
    }

    // Basic date validations
    const s1 = new Date(slot1).getTime();
    const s2 = new Date(slot2).getTime();
    const s3 = new Date(slot3).getTime();
    const now = Date.now();

    if (s1 <= now || s2 <= now || s3 <= now) {
      setError('Preferred slots must be in the future.');
      return;
    }

    if (s1 === s2 || s1 === s3 || s2 === s3) {
      setError('Please choose 3 distinct preferred slots.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(
        `${backendUrl}/api/leads/book-session-public`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim().toLowerCase(),
            slot1: new Date(slot1).toISOString(),
            slot2: new Date(slot2).toISOString(),
            slot3: new Date(slot3).toISOString(),
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to submit slots. Please try again.',
        );
      }

      setSuccess(true);
      // Reset form slot inputs
      setSlot1('');
      setSlot2('');
      setSlot3('');
    } catch (err: any) {
      setError(
        err.message || 'An unexpected error occurred while booking your call.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-xl bg-white/45 backdrop-blur-2xl border border-white/25 rounded-[2.5rem] p-6 md:p-10 shadow-[0_20px_50px_rgba(147,197,253,0.18)] overflow-hidden flex flex-col text-left text-foreground animate-in fade-in zoom-in-95 duration-300">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-white/40 border border-white/30 hover:bg-white/60 transition-colors text-neutral-700 hover:text-neutral-900 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {success ? (
          /* Success Screen */
          <div className="flex flex-col items-center justify-center text-center py-8 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-neutral-900 tracking-wide font-clash">
                Booking Submitted!
              </h2>
              <p className="text-neutral-600 text-xs font-sans leading-relaxed max-w-sm">
                Thank you, <strong>{name}</strong>! Your 3 preferred dates &
                time slots have been registered. Arijit will confirm the final
                slot shortly. You will receive an email confirmation with the
                Google Meet link at <strong>{email}</strong> once confirmed.
              </p>
            </div>
            <button
              onClick={() => {
                setSuccess(false);
                onClose();
              }}
              className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl transition duration-200 cursor-pointer shadow-md"
            >
              Done
            </button>
          </div>
        ) : (
          /* Booking Form */
          <div className="space-y-6 relative z-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-neutral-900 tracking-wide font-clash flex items-center gap-2">
                <Calendar className="w-7 h-7 text-primary stroke-[1.5]" />
                Book a consultation
              </h2>
              <p className="text-neutral-600 text-xs font-sans leading-relaxed">
                Provide your details and select 3 distinct preferred date & time
                slots. Once Arijit confirms one of them, the meeting link will
                be sent to your email.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-xs text-red-600 font-sans flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Details Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block font-mono">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/50 border border-neutral-200 rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-primary text-neutral-950 font-sans"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block font-mono">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/50 border border-neutral-200 rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-primary text-neutral-950 font-sans"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block font-mono">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white/50 border border-neutral-200 rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-primary text-neutral-950 font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Time Slots Selection */}
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block font-mono border-b border-neutral-200/50 pb-1">
                  Preferred Time Options (IST)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Slot 1 */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider block font-mono">
                      Option 1 *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={slot1}
                      onChange={(e) => setSlot1(e.target.value)}
                      min={minDateTime}
                      className="w-full bg-white/50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-primary text-neutral-950 font-mono"
                    />
                  </div>

                  {/* Slot 2 */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider block font-mono">
                      Option 2 *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={slot2}
                      onChange={(e) => setSlot2(e.target.value)}
                      min={minDateTime}
                      className="w-full bg-white/50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-primary text-neutral-950 font-mono"
                    />
                  </div>

                  {/* Slot 3 */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider block font-mono">
                      Option 3 *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={slot3}
                      onChange={(e) => setSlot3(e.target.value)}
                      min={minDateTime}
                      className="w-full bg-white/50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-primary text-neutral-950 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  loading ||
                  !name ||
                  !email ||
                  !phone ||
                  !slot1 ||
                  !slot2 ||
                  !slot3
                }
                className="w-full py-4 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-lg disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Consultation...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Slots</span>
                    <Clock className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
