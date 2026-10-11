import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Paiement — Callastral',
  description: 'Paiement sécurisé de la consultation.',
  robots: { index: false, follow: false },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
