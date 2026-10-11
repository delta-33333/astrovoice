import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Administration — Callastral',
  description: 'Espace d’administration Callastral.',
  robots: { index: false, follow: false },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
