import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Réservation — Callastral',
  description: 'Choisir la durée et payer la consultation.',
  robots: { index: false, follow: false },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
