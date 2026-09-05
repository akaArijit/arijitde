import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Loan Calculator - Full Repayment Schedule',
  description:
    'Analyze loan tenures, interest payable, and custom prepayments to optimize loan foreclosure timelines.',
};

export default function LoanCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
