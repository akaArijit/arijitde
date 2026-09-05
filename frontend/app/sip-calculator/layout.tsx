import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SIP Calculator - Mutual Fund Return Predictor',
  description:
    'Calculate your future wealth compound growth from Systemic Investment Plans (SIP) using our interactive mutual fund calculator. Adjust monthly investments and expected returns.',
};

export default function SIPCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
