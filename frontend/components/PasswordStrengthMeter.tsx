'use client';

import { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  password: string;
  show?: boolean;
  className?: string;
}

interface StrengthResult {
  score: number; // 0-5
  label: string;
  color: string;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

interface StrengthState {
  score: number;
  label: string;
  color: string;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

export function PasswordStrengthMeter({ password, show = true, className }: PasswordStrengthMeterProps) {
  const [strength, setStrength] = useState<StrengthState>({
    score: 0,
    label: '',
    color: '',
    checks: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    },
  });

  useEffect(() => {
    if (!password) {
      setStrength({
        score: 0,
        label: '',
        color: '',
        checks: {
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          special: false,
        },
      });
      return;
    }

    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    let score = 0;
    let label = '';
    let color = '';

    if (password.length === 0) {
      score = 0;
      label = '';
      color = '';
    } else if (passedChecks <= 1) {
      score = 1;
      label = 'Very Weak';
      color = 'text-red-500';
    } else if (passedChecks === 2) {
      score = 2;
      label = 'Weak';
      color = 'text-orange-500';
    } else if (passedChecks === 3) {
      score = 3;
      label = 'Fair';
      color = 'text-yellow-500';
    } else if (passedChecks === 4) {
      score = 4;
      label = 'Strong';
      color = 'text-lime-500';
    } else if (passedChecks === 5) {
      score = 5;
      label = 'Very Strong';
      color = 'text-green-500';
    }

    setStrength({ score, label, color, checks });
  }, [password]);

  if (!show || !password) {
    return null;
  }

  const getBarColor = (index: number) => {
    if (strength.score === 0) return 'bg-gray-200';
    if (index < strength.score) return strength.color.replace('text-', 'bg-');
    return 'bg-gray-200';
  };

  const barSegments = useMemo(() => {
    return [1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        className={cn('flex-1 mx-0.5 rounded h-full', getBarColor(i))}
      />
    ));
  }, [strength.score]);

  return (
    <div className={cn('space-y-2', className)}>
      {/* Strength Bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300 ease-out flex"
          style={{ width: `${(strength.score / 5) * 100}%` }}
        >
          {barSegments}
        </div>
      </div>

      {/* Strength Label */}
      <div className="flex items-center justify-between text-sm">
        <span className={cn('font-extrabold', strength.color)}>
          {strength.label || 'Enter a password'}
        </span>
        <span className="text-xs text-gray-500">
          {Object.values(strength.checks).filter(Boolean).length}/5 checks passed
        </span>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1 text-xs">
        {[
          { key: 'length', label: 'At least 8 characters' },
          { key: 'uppercase', label: 'One uppercase letter (A-Z)' },
          { key: 'lowercase', label: 'One lowercase letter (a-z)' },
          { key: 'number', label: 'One number (0-9)' },
          { key: 'special', label: 'One special character (!@#$%)' },
        ].map((req) => (
          <div
            key={req.key}
            className={cn(
              'flex items-center gap-2 transition-colors',
              strength.checks[req.key as keyof typeof strength.checks]
                ? 'text-green-600'
                : 'text-gray-400'
            )}
          >
            {strength.checks[req.key as keyof typeof strength.checks] ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PasswordStrengthMeter;