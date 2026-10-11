import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Réservations — Callastral',
  description: 'Détail d’une réservation Callastral.',
  robots: { index: false, follow: false },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
