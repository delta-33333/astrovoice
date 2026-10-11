import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aperçu — Callastral',
  description: 'Aperçu avant la consultation.',
  robots: { index: false, follow: false },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
