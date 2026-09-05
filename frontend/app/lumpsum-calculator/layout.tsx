import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lumpsum Calculator - Compound Growth Calculator',
  description:
    'Calculate compounding returns on one-time mutual fund, stock, or bond investments using our premium financial simulation tool.',
};

export default function LumpsumCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
