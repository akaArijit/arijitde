'use client';

import { useState } from 'react';
import { Loader2, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, HelpCircle, Sparkles, ShieldCheck, Calendar, TrendingUp, TrendingDown, X, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PasswordStrengthMeter } from '@/components/PasswordStrengthMeter';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useClientAuth } from '@/hooks';

const GOAL_LABELS: Record<string, { label: string; desc: string; icon: LucideIcon }> = {
  WEALTH_CREATION: { label: 'Wealth Creation', desc: 'Long-term compounding to build a substantial corpus', icon: Sparkles },
  RETIREMENT: { label: 'Retirement Planning', desc: 'Securing financial independence for your post-work years', icon: ShieldCheck },
  HOUSE_PURCHASE: { label: 'House Purchase', desc: 'Saving for a dream home', icon: TrendingUp },
  CHILD_EDUCATION: { label: 'Child Education', desc: "Building a corpus for children's education", icon: Calendar },
  MARRIAGE: { label: 'Marriage', desc: 'Funding an upcoming marriage', icon: Sparkles },
  PASSIVE_INCOME: { label: 'Passive Income', desc: 'Generate steady returns from investments', icon: TrendingUp },
  TAX_SAVING: { label: 'Tax Saving', desc: 'Optimizing investments for tax efficiency', icon: ShieldCheck },
  NOT_SURE_YET: { label: 'Not Sure Yet', desc: 'Exploring and learning about investment options', icon: HelpCircle },
};

const AGE_RANGE_OPTIONS = [
  { value: 'BELOW_25', label: 'Below 25', numericAge: 22 },
  { value: '25_35', label: '25-35', numericAge: 30 },
  { value: '36_45', label: '36-45', numericAge: 40 },
  { value: '46_60', label: '46-60', numericAge: 53 },
  { value: 'ABOVE_60', label: 'Above 60', numericAge: 65 },
];

const LIFE_STAGE_OPTIONS = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'EARLY_CAREER', label: 'Early Career Professional' },
  { value: 'MID_CAREER', label: 'Mid-Career Professional' },
  { value: 'BUSINESS_OWNER', label: 'Business Owner' },
  { value: 'HIGH_LEVEL_PROFESSIONAL', label: 'High-Level Professional (10+ Years Experience)' },
  { value: 'RETIRED', label: 'Retired' },
];

const INVESTMENT_TENURE_OPTIONS = [
  { value: 'LESS_THAN_3_YEARS', label: 'Less than 3 Years' },
  { value: '3_TO_5_YEARS', label: '3-5 Years' },
  { value: '5_TO_10_YEARS', label: '5-10 Years' },
  { value: '10_TO_20_YEARS', label: '10-20 Years' },
  { value: 'MORE_THAN_20_YEARS', label: 'More than 20 Years' },
];

const MONTHLY_INVESTMENT_OPTIONS = [
  { value: 'NOT_INVESTING', label: 'Currently Not Investing' },
  { value: 'BELOW_1000', label: 'Below Rs1,000' },
  { value: '1500_2500', label: 'Rs1,500 - Rs2,500' },
  { value: '3000_5000', label: 'Rs3,000 - Rs5,000' },
  { value: '6000_10000', label: 'Rs6,000 - Rs10,000' },
  { value: '15000_PLUS', label: 'Rs15,000+' },
];

const EMERGENCY_FUND_OPTIONS = [
  { value: 'YES_MORE_THAN_6_MONTHS', label: 'Yes, more than 6 months expenses' },
  { value: 'YES_3_TO_6_MONTHS', label: 'Yes, 3-6 months expenses' },
  { value: 'YES_LESS_THAN_3_MONTHS', label: 'Less than 3 months expenses' },
  { value: 'NO_EMERGENCY_FUND', label: 'No emergency fund' },
];

const STEPS = [
  { id: 1, label: 'Age & Goal' },
  { id: 2, label: 'Life Stage' },
  { id: 3, label: 'Investment Style' },
  { id: 4, label: 'Financial Health' },
  { id: 5, label: 'Review' },
];

interface AssessmentWizardProps {
  showQuiz: boolean;
  setShowQuiz: (show: boolean) => void;
  quizStep: number;
  setQuizStep: (step: number) => void;
  quizAgeRange: string;
  setQuizAgeRange: (range: string) => void;
  quizAge: number;
  setQuizAge: (age: number) => void;
  quizLifeStage: string;
  setQuizLifeStage: (stage: string) => void;
  quizGoal: string;
  setQuizGoal: (goal: string) => void;
  quizInvestmentTenure: string;
  setQuizInvestmentTenure: (tenure: string) => void;
  quizIsCompletePortfolio: boolean | null;
  setQuizIsCompletePortfolio: (val: boolean) => void;
  quizInvestmentStyle: string;
  setQuizInvestmentStyle: (style: string) => void;
  quizExpectedReturn: string;
  setQuizExpectedReturn: (ret: string) => void;
  quizRiskBehavior: string;
  setQuizRiskBehavior: (behavior: string) => void;
  quizMonthlyInvestment: string;
  setQuizMonthlyInvestment: (inv: string) => void;
  quizEmergencyFund: string;
  setQuizEmergencyFund: (fund: string) => void;
  showNotSureMessage: boolean;
  setShowNotSureMessage: (show: boolean) => void;
  onQuizSubmit: () => Promise<void>;
  isLoading: boolean;
  activeAssessmentId: string | null;
}

export function AssessmentWizard({
  showQuiz,
  setShowQuiz,
  quizStep,
  setQuizStep,
  quizAgeRange,
  setQuizAgeRange,
  quizAge,
  setQuizAge,
  quizLifeStage,
  setQuizLifeStage,
  quizGoal,
  setQuizGoal,
  quizInvestmentTenure,
  setQuizInvestmentTenure,
  quizIsCompletePortfolio,
  setQuizIsCompletePortfolio,
  quizInvestmentStyle,
  setQuizInvestmentStyle,
  quizExpectedReturn,
  setQuizExpectedReturn,
  quizRiskBehavior,
  setQuizRiskBehavior,
  quizMonthlyInvestment,
  setQuizMonthlyInvestment,
  quizEmergencyFund,
  setQuizEmergencyFund,
  showNotSureMessage,
  setShowNotSureMessage,
  onQuizSubmit,
  isLoading,
  activeAssessmentId,
}: AssessmentWizardProps) {
  const { user } = useClientAuth();

  if (!showQuiz) return null;

  const currentStepData = STEPS[quizStep - 1];

  return (
    <ErrorBoundary>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
            <div>
              <h2 className="text-xl font-bold font-clash text-neutral-900">Lifecycle Assessment</h2>
              <p className="text-sm text-neutral-500">Step {quizStep} of {STEPS.length}: {currentStepData.label}</p>
            </div>
            <button
              onClick={() => setShowQuiz(false)}
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="flex items-center justify-between mb-6">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all',
                    index + 1 < quizStep
                      ? 'bg-green-500 text-white'
                      : index + 1 === quizStep
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-200 text-neutral-500'
                  )}>
                    {index + 1 < quizStep ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={cn(
                      'w-16 h-1 mx-2',
                      index + 1 < quizStep ? 'bg-green-500' : 'bg-neutral-200'
                    )} />
                  )}
                </div>
              ))}
            </div>

            {quizStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">Your Age</label>
                  <input
                    type="number"
                    value={quizAge}
                    onChange={(e) => setQuizAge(Number(e.target.value))}
                    min={18}
                    max={100}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">Age Range</label>
                  <select
                    value={quizAgeRange}
                    onChange={(e) => setQuizAgeRange(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {AGE_RANGE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">Primary Financial Goal</label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(GOAL_LABELS).map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => setQuizGoal(key)}
                        className={'p-4 rounded-xl border-2 transition-all text-left ' + (quizGoal === key ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-neutral-300')}
                      >
                        <value.icon className={'w-5 h-5 ' + (quizGoal === key ? 'text-primary' : 'text-neutral-400')} />
                        <div className="mt-2">
                          <p className="font-semibold text-neutral-900">{value.label}</p>
                          <p className="text-xs text-neutral-500 mt-1">{value.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {quizStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">Life Stage</label>
                  <div className="grid grid-cols-2 gap-3">
                    {LIFE_STAGE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setQuizLifeStage(opt.value)}
                        className={'p-4 rounded-xl border-2 transition-all text-left ' + (quizLifeStage === opt.value ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-neutral-300')}
                      >
                        <p className="font-semibold text-neutral-900">{opt.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">Investment Tenure</label>
                  <div className="grid grid-cols-2 gap-3">
                    {INVESTMENT_TENURE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setQuizInvestmentTenure(opt.value)}
                        className={'p-4 rounded-xl border-2 transition-all text-left ' + (quizInvestmentTenure === opt.value ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-neutral-300')}
                      >
                        <p className="font-semibold text-neutral-900">{opt.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">Monthly Investment Capacity</label>
                  <div className="grid grid-cols-2 gap-3">
                    {MONTHLY_INVESTMENT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setQuizMonthlyInvestment(opt.value)}
                        className={'p-4 rounded-xl border-2 transition-all text-left ' + (quizMonthlyInvestment === opt.value ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-neutral-300')}
                      >
                        <p className="font-semibold text-neutral-900">{opt.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">Emergency Fund</label>
                  <div className="grid grid-cols-2 gap-3">
                    {EMERGENCY_FUND_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setQuizEmergencyFund(opt.value)}
                        className={'p-4 rounded-xl border-2 transition-all text-left ' + (quizEmergencyFund === opt.value ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-neutral-300')}
                      >
                        <p className="font-semibold text-neutral-900">{opt.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {quizStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">Investment Style</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'CONSERVATIVE', label: 'Conservative', desc: 'Capital preservation priority' },
                      { value: 'MODERATE', label: 'Moderate', desc: 'Balanced growth & safety' },
                      { value: 'AGGRESSIVE', label: 'Aggressive', desc: 'Maximum growth potential' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setQuizInvestmentStyle(opt.value)}
                        className={'p-4 rounded-xl border-2 transition-all text-left ' + (quizInvestmentStyle === opt.value ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-neutral-300')}
                      >
                        <p className="font-semibold text-neutral-900">{opt.label}</p>
                        <p className="text-xs text-neutral-500 mt-1">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">Expected Annual Return</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'BELOW_8', label: 'Below 8%', desc: 'Conservative expectation' },
                      { value: '8_12', label: '8-12%', desc: 'Moderate expectation' },
                      { value: '12_15', label: '12-15%', desc: 'Optimistic expectation' },
                      { value: 'ABOVE_15', label: 'Above 15%', desc: 'Aggressive expectation' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setQuizExpectedReturn(opt.value)}
                        className={'p-4 rounded-xl border-2 transition-all text-left ' + (quizExpectedReturn === opt.value ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-neutral-300')}
                      >
                        <p className="font-semibold text-neutral-900">{opt.label}</p>
                        <p className="text-xs text-neutral-500 mt-1">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">Risk Behavior</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'PANIC_SELL', label: 'Panic Sell', desc: 'Exit during downturns' },
                      { value: 'HOLD', label: 'Hold Steady', desc: 'Stay invested through volatility' },
                      { value: 'BUY_DIP', label: 'Buy the Dip', desc: 'Invest more when markets fall' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setQuizRiskBehavior(opt.value)}
                        className={'p-4 rounded-xl border-2 transition-all text-left ' + (quizRiskBehavior === opt.value ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-neutral-300')}
                      >
                        <p className="font-semibold text-neutral-900">{opt.label}</p>
                        <p className="text-xs text-neutral-500 mt-1">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {quizStep === 4 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">Complete Portfolio Analysis?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: true, label: 'Yes', desc: 'I have existing holdings to analyze' },
                      { value: false, label: 'No', desc: 'Build portfolio from scratch' },
                    ].map((opt) => (
                      <button
                        key={String(opt.value)}
                        onClick={() => setQuizIsCompletePortfolio(opt.value)}
                        className={'p-4 rounded-xl border-2 transition-all text-left ' + (quizIsCompletePortfolio === opt.value ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-neutral-300')}
                      >
                        <p className="font-semibold text-neutral-900">{opt.label}</p>
                        <p className="text-xs text-neutral-500 mt-1">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <PasswordStrengthMeter password="" show={false} />
              </div>
            )}

            {quizStep === 5 && (
              <div className="space-y-6">
                <div className="bg-neutral-50 rounded-xl p-4">
                  <h3 className="font-semibold text-neutral-900 mb-4">Review Your Assessment</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-neutral-500">Age</span><span className="font-semibold">{quizAge}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">Age Range</span><span className="font-semibold">{AGE_RANGE_OPTIONS.find(o => o.value === quizAgeRange)?.label}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">Goal</span><span className="font-semibold">{GOAL_LABELS[quizGoal]?.label}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">Life Stage</span><span className="font-semibold">{LIFE_STAGE_OPTIONS.find(o => o.value === quizLifeStage)?.label}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">Tenure</span><span className="font-semibold">{INVESTMENT_TENURE_OPTIONS.find(o => o.value === quizInvestmentTenure)?.label}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">Monthly Investment</span><span className="font-semibold">{MONTHLY_INVESTMENT_OPTIONS.find(o => o.value === quizMonthlyInvestment)?.label}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">Emergency Fund</span><span className="font-semibold">{EMERGENCY_FUND_OPTIONS.find(o => o.value === quizEmergencyFund)?.label}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">Investment Style</span><span className="font-semibold">{quizInvestmentStyle}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">Expected Return</span><span className="font-semibold">{quizExpectedReturn}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">Risk Behavior</span><span className="font-semibold">{quizRiskBehavior}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">Complete Portfolio</span><span className="font-semibold">{quizIsCompletePortfolio ? 'Yes' : 'No'}</span></div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t border-neutral-200">
              <button
                onClick={() => setQuizStep(quizStep - 1)}
                disabled={quizStep === 1}
                className="px-6 py-3 border border-neutral-200 rounded-xl font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 transition"
              >
                <ChevronLeft className="w-4 h-4 inline mr-2" />
                Back
              </button>
              <div className="flex gap-3">
                {quizStep < STEPS.length ? (
                  <button
                    onClick={() => setQuizStep(quizStep + 1)}
                    className="px-6 py-3 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-700 transition"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 inline ml-2" />
                  </button>
                ) : (
                  <button
                    onClick={onQuizSubmit}
                    disabled={isLoading}
                    className="px-6 py-3 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-700 disabled:opacity-50 transition flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Assessment
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default AssessmentWizard;