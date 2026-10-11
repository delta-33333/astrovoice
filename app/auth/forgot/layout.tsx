import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mot de passe oublié — Callastral',
  description: 'Recevoir un lien pour choisir un nouveau mot de passe.',
  robots: { index: false, follow: false },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
