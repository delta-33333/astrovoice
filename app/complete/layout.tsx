import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Consultation terminée — Callastral',
  description: 'Fin de consultation et suite possible.',
  robots: { index: false, follow: false },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
