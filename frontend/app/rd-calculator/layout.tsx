import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recurring Deposit (RD) Calculator - Regular Savings Growth',
  description:
    'Determine maturity values on recurring monthly savings deposits under varying interest rates.',
};

export default function RDCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
