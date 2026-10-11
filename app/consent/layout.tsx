import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Consentement — Callastral',
  description: 'Validation du compte avant la consultation.',
  robots: { index: false, follow: false },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
