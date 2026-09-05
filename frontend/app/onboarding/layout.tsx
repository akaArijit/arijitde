import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book a Call & Login',
  description:
    'Register a user account, verify access via OTP, or sign in to the premium client distribution cockpit.',
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
