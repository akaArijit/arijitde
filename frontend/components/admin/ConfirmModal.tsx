'use client';

import { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => void;
  danger?: boolean;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  danger = false,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-[70] bg-white border border-neutral-200 rounded-[2rem] p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-6 shrink-0">
          <div>
            <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">
              Confirm Action
            </span>
            <h2 className="text-xl font-semibold font-clash text-neutral-900 mt-0.5">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 border border-neutral-200 hover:bg-neutral-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        {/* Icon & Message */}
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${danger ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}
        >
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-neutral-900 mb-2 font-clash">
          {title}
        </h3>
        <p className="text-xs text-neutral-500 leading-relaxed font-sans mb-6">
          {message}
        </p>

        <div className="flex gap-4 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-xs font-semibold border border-neutral-200 bg-white hover:bg-neutral-50 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={loading}
            className={`flex-1 py-3 text-xs font-bold text-white rounded-xl transition duration-200 cursor-pointer ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-neutral-900 hover:bg-neutral-800'} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}