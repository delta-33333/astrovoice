import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Espace — Callastral',
  description: 'Reprendre une consultation Callastral.',
  robots: { index: false, follow: false },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
