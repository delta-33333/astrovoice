import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connexion — Callastral',
  description: 'Connexion ou création d’un compte Callastral.',
  robots: { index: false, follow: false },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
