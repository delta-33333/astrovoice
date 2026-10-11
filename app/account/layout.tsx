import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compte — Callastral',
  description: 'Abonnement, rapports et réglages du compte.',
  robots: { index: false, follow: false },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
