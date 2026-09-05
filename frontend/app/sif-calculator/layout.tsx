import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SIF Calculator - Alternative Investment Strategies',
  description:
    'Calculate returns and check compound simulations for Specialized Investment Funds (SIF).',
};

export default function SIFCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
