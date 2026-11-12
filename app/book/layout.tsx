import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Réservation — Callastral',
  description: 'Packs à prix fixe : 10, 20 ou 40 minutes, paiement unique, sans abonnement.',
  robots: { index: false, follow: false },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
