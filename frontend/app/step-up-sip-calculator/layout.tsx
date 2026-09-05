import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Step-Up SIP Calculator - Incremental Wealth Planner',
  description:
    'Plan systematic investment step-ups over time. See how small yearly top-ups dramatically increase your maturity value.',
};

export default function StepUpSIPCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
