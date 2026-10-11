import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nouveau mot de passe — Callastral',
  description: 'Choisir un nouveau mot de passe Callastral.',
  robots: { index: false, follow: false },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
