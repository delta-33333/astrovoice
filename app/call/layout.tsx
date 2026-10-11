import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Appel — Callastral',
  description: 'Rejoindre la consultation vocale.',
  robots: { index: false, follow: false },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
