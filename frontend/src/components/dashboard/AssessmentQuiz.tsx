'use client';

import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Sparkles, ShieldCheck, TrendingUp, Calendar, Compass } from 'lucide-react';

export interface AssessmentData {
  age: number;
  ageRange: string;
  lifeStage: string;
  goal: string;
  investmentTenure: string;
  isCompletePortfolio: boolean | null;
  investmentStyle: string;
  expectedReturn: string;
  riskBehavior: string;
  monthlyInvestment: string;
  emergencyFund: string;
}

interface AssessmentQuizProps {
  initialData?: Partial<AssessmentData>;
  onComplete: (data: AssessmentData) => void;
  onBack?: () => void;
  isLoading?: boolean;
}

const GOAL_OPTIONS = [
  {
    value: 'WEALTH_CREATION',
    label: 'Wealth Creation',
    desc: 'Long-term compounding to build a substantial corpus',
    icon: Sparkles,
  },
  {
    value: 'RETIREMENT',
    label: 'Retirement Planning',
    desc: 'Securing financial independence for your post-work years',
    icon: ShieldCheck,
  },
  {
    value: 'HOUSE_PURCHASE',
    label: 'House Purchase',
    desc: 'Saving for your dream home',
    icon: TrendingUp,
  },
  {
    value: 'CHILD_EDUCATION',
    label: 'Child Education',
    desc: "Building a corpus for your children's education",
    icon: Calendar,
  },
  {
    value: 'MARRIAGE',
    label: 'Marriage',
    desc: 'Funding an upcoming marriage',
    icon: Sparkles,
  },
  {
    value: 'PASSIVE_INCOME',
    label: 'Passive Income',
    desc: 'Generate steady returns from your investments',
    icon: TrendingUp,
  },
  {
    value: 'TAX_SAVING',
    label: 'Tax Saving',
    desc: 'Optimizing investments for tax efficiency',
    icon: ShieldCheck,
  },
  {
    value: 'NOT_SURE_YET',
    label: 'Not Sure Yet',
    desc: 'Exploring and learning about investment options',
    icon: Compass,
  },
];

const AGE_RANGE_OPTIONS = [
  { value: 'BELOW_25', label: 'Below 25', numericAge: 22 },
  { value: '25_35', label: '25–35', numericAge: 30 },
  { value: '36_45', label: '36–45', numericAge: 40 },
  { value: '46_60', label: '46–60', numericAge: 53 },
  { value: 'ABOVE_60', label: 'Above 60', numericAge: 65 },
];

const LIFE_STAGE_OPTIONS = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'EARLY_CAREER', label: 'Early Career Professional' },
  { value: 'MID_CAREER', label: 'Mid-Career Professional' },
  { value: 'BUSINESS_OWNER', label: 'Business Owner' },
  {
    value: 'HIGH_LEVEL_PROFESSIONAL',
    label: 'High-Level Professional (10+ Years Experience)',
  },
  { value: 'RETIRED', label: 'Retired' },
];

const INVESTMENT_TENURE_OPTIONS = [
  { value: 'LESS_THAN_3_YEARS', label: 'Less than 3 Years' },
  { value: '3_TO_5_YEARS', label: '3–5 Years' },
  { value: '5_TO_10_YEARS', label: '5–10 Years' },
  { value: '10_TO_20_YEARS', label: '10–20 Years' },
  { value: 'MORE_THAN_20_YEARS', label: 'More than 20 Years' },
];

const MONTHLY_INVESTMENT_OPTIONS = [
  { value: 'NOT_INVESTING', label: 'Currently Not Investing' },
  { value: 'BELOW_1000', label: 'Below ₹1,000' },
  { value: '1500_2500', label: '₹1,500 – ₹2,500' },
  { value: '3000_5000', label: '₹3,000 – ₹5,000' },
  { value: '6000_10000', label: '₹6,000 – ₹10,000' },
  { value: '15000_PLUS', label: '₹15,000+' },
];

const EMERGENCY_FUND_OPTIONS = [
  {
    value: 'YES_MORE_THAN_6_MONTHS',
    label: 'Yes, more than 6 months expenses',
  },
  { value: 'YES_3_TO_6_MONTHS', label: 'Yes, 3–6 months expenses' },
  { value: 'YES_LESS_THAN_3_MONTHS', label: 'Less than 3 months expenses' },
  { value: 'NO_EMERGENCY_FUND', label: 'No emergency fund' },
];

export function AssessmentQuiz({
  initialData,
  onComplete,
  onBack,
  isLoading = false,
}: AssessmentQuizProps) {
  const [quizStep, setQuizStep] = useState(1);
  const [quizAgeRange, setQuizAgeRange] = useState<string>(
    initialData?.ageRange || '25_35'
  );
  const [quizAge, setQuizAge] = useState<number>(initialData?.age || 30);
  const [quizLifeStage, setQuizLifeStage] = useState<string>(
    initialData?.lifeStage || ''
  );
  const [quizGoal, setQuizGoal] = useState<string>(initialData?.goal || '');
  const [quizInvestmentTenure, setQuizInvestmentTenure] = useState<string>(
    initialData?.investmentTenure || ''
  );
  const [quizIsCompletePortfolio, setQuizIsCompletePortfolio] = useState<
    boolean | null
  >(initialData?.isCompletePortfolio ?? true);
  const [quizInvestmentStyle, setQuizInvestmentStyle] = useState<string>(
    initialData?.investmentStyle || ''
  );
  const [quizExpectedReturn, setQuizExpectedReturn] = useState<string>(
    initialData?.expectedReturn || ''
  );
  const [quizRiskBehavior, setQuizRiskBehavior] = useState<string>(
    initialData?.riskBehavior || ''
  );
  const [quizMonthlyInvestment, setQuizMonthlyInvestment] = useState<string>(
    initialData?.monthlyInvestment || ''
  );
  const [quizEmergencyFund, setQuizEmergencyFund] = useState<string>(
    initialData?.emergencyFund || ''
  );
  const [showNotSureMessage, setShowNotSureMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuizSubmit = () => {
    if (
      !quizAgeRange ||
      !quizGoal ||
      !quizLifeStage ||
      !quizInvestmentTenure ||
      !quizMonthlyInvestment ||
      !quizEmergencyFund
    ) {
      setError('Please complete all assessment fields.');
      return;
    }

    setError(null);
    onComplete({
      age: quizAge,
      ageRange: quizAgeRange,
      lifeStage: quizLifeStage,
      goal: quizGoal,
      investmentTenure: quizInvestmentTenure,
      isCompletePortfolio: quizIsCompletePortfolio,
      investmentStyle: quizInvestmentStyle,
      expectedReturn: quizExpectedReturn,
      riskBehavior: quizRiskBehavior,
      monthlyInvestment: quizMonthlyInvestment,
      emergencyFund: quizEmergencyFund,
    });
  };

  return (
    <div className="w-full max-w-md bg-white/30 border border-white/20 rounded-3xl p-8 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 mb-6 uppercase tracking-widest">
        <span>Stage 01: Profile Assessment</span>
        <span>Step {quizStep} of 5</span>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex gap-2 items-start text-left font-sans animate-in fade-in slide-in-from-top-4">
          <span className="w-4 h-4 shrink-0 mt-0.5">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {quizStep === 1 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">
              Which best describes your current stage?
            </h2>
            <p className="text-neutral-500 text-xs font-sans leading-relaxed">
              Context and financial capacity.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {LIFE_STAGE_OPTIONS.map((opt) => {
              const isSelected = quizLifeStage === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setQuizLifeStage(opt.value)}
                  className={`w-full py-3.5 px-4 rounded-xl border text-xs font-medium transition duration-150 cursor-pointer text-center ${
                    isSelected
                      ? 'bg-primary/10 border-primary text-neutral-900'
                      : 'bg-white/40 border-white/30 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              if (!quizLifeStage) {
                setError('Please select your life stage.');
                return;
              }
              setError(null);
              setQuizStep(2);
            }}
            className="w-full py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer"
          >
            Continue
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {quizStep === 2 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">
              What is the primary reason you&apos;re investing?
            </h2>
            <p className="text-neutral-500 text-xs font-sans leading-relaxed">
              Goal alignment score.
            </p>
          </div>

          <div
            data-lenis-prevent
            className="space-y-3 max-h-[300px] overflow-y-auto pr-1 select-none custom-scrollbar"
          >
            {GOAL_OPTIONS.map((goal) => {
              const IconComponent = goal.icon;
              const isSelected = quizGoal === goal.value;
              return (
                <button
                  key={goal.value}
                  onClick={() => {
                    setQuizGoal(goal.value);
                    if (goal.value === 'NOT_SURE_YET') {
                      setShowNotSureMessage(true);
                    } else {
                      setShowNotSureMessage(false);
                    }
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition duration-200 flex items-start gap-4 cursor-pointer ${
                    isSelected
                      ? 'bg-primary/10 border-primary text-neutral-900'
                      : 'bg-white/40 border-white/30 hover:border-neutral-300 text-neutral-700 hover:text-neutral-900'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl border mt-0.5 ${
                      isSelected
                        ? 'bg-primary/20 border-primary/40 text-primary'
                        : 'bg-white/50 border-border text-neutral-500'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 stroke-[1.5]" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-semibold block">
                      {goal.label}
                    </span>
                    <span className="text-[10px] text-neutral-500 block font-sans mt-0.5 leading-relaxed">
                      {goal.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {showNotSureMessage && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-sans leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="font-bold block mb-1">
                💡 You&apos;re not alone!
              </span>
              More than 60% of investors start investing without a clearly
              defined goal. Let&apos;s help identify one through your
              portfolio health report.
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setQuizStep(1)}
              className="flex-1 py-3.5 bg-white/40 border border-border hover:bg-white/60 text-neutral-700 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (!quizGoal) {
                  setError('Please choose an investment goal.');
                  return;
                }
                setError(null);
                setQuizStep(3);
              }}
              className="flex-1 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer"
            >
              Continue
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {quizStep === 3 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">
              When do you expect to use this money?
            </h2>
            <p className="text-neutral-500 text-xs font-sans leading-relaxed">
              Tenure matching.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {INVESTMENT_TENURE_OPTIONS.map((opt) => {
              const isSelected = quizInvestmentTenure === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setQuizInvestmentTenure(opt.value)}
                  className={`w-full py-3.5 px-4 rounded-xl border text-xs font-medium transition duration-150 cursor-pointer text-center ${
                    isSelected
                      ? 'bg-primary/10 border-primary text-neutral-900'
                      : 'bg-white/40 border-white/30 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setQuizStep(2)}
              className="flex-1 py-3.5 bg-white/40 border border-border hover:bg-white/60 text-neutral-700 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (!quizInvestmentTenure) {
                  setError('Please select your investment tenure.');
                  return;
                }
                setError(null);
                setQuizStep(4);
              }}
              className="flex-1 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer"
            >
              Continue
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {quizStep === 4 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">
              Approximately how much are you able to invest every month?
            </h2>
            <p className="text-neutral-500 text-xs font-sans leading-relaxed">
              Investment capacity profile.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {MONTHLY_INVESTMENT_OPTIONS.map((opt) => {
              const isSelected = quizMonthlyInvestment === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setQuizMonthlyInvestment(opt.value)}
                  className={`w-full py-3.5 px-4 rounded-xl border text-xs font-medium transition duration-150 cursor-pointer text-center ${
                    isSelected
                      ? 'bg-primary/10 border-primary text-neutral-900'
                      : 'bg-white/40 border-white/30 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setQuizStep(3)}
              className="flex-1 py-3.5 bg-white/40 border border-border hover:bg-white/60 text-neutral-700 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (!quizMonthlyInvestment) {
                  setError('Please select your monthly investment amount.');
                  return;
                }
                setError(null);
                setQuizStep(5);
              }}
              className="flex-1 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer"
            >
              Continue
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {quizStep === 5 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-neutral-900 tracking-wide">
              Do you have an emergency fund?
            </h2>
            <p className="text-neutral-500 text-xs font-sans leading-relaxed">
              Safety reserves check.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {EMERGENCY_FUND_OPTIONS.map((opt) => {
              const isSelected = quizEmergencyFund === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setQuizEmergencyFund(opt.value)}
                  className={`w-full py-3.5 px-4 rounded-xl border text-xs font-medium transition duration-150 cursor-pointer text-center ${
                    isSelected
                      ? 'bg-primary/10 border-primary text-neutral-900'
                      : 'bg-white/40 border-white/30 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={() => setQuizStep(4)}
              className="flex-1 py-3.5 bg-white/40 border border-border hover:bg-white/60 text-neutral-700 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={handleQuizSubmit}
              disabled={isLoading || !quizEmergencyFund}
              className="flex-1 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer disabled:opacity-40"
            >
              {isLoading ? 'Submitting...' : 'Finish & Score'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}