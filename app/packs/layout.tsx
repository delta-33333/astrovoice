import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Packs de minutes — Callastral',
  description: 'Packs de minutes de consultation Callastral.',
  robots: { index: false, follow: false },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
