import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Réservation — Callastral',
  description: 'Découverte : prix de la première semaine, renouvellement, puis paiement.',
  robots: { index: false, follow: false },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
