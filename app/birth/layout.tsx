import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Naissance — Callastral',
  description: 'Date, heure et lieu de naissance pour le thème natal.',
  robots: { index: false, follow: false },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
