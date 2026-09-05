import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Investor Risk Quiz - Custom Risk Telemetry',
  description:
    'Assess your investment behavior, age profiles, and wealth goals to receive SEBI-compliant risk profiles.',
};

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
