import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fixed Deposit (FD) Calculator - Guaranteed Returns',
  description:
    'Calculate maturity amounts and interest payouts on bank fixed deposits using current compounding frequencies.',
};

export default function FDCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
