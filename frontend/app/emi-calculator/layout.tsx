import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EMI Calculator - Loan Repayment Simulator',
  description:
    'Simulate loan EMIs, interest breakdowns, and amortization graphs to manage home loans, auto loans, or personal credit.',
};

export default function EMICalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
