import type { Metadata } from 'next';
import NotFoundView from '@/components/NotFoundView';

export const metadata: Metadata = {
  title: 'Page introuvable | Callastral',
  description: 'Cette adresse ne correspond à aucune page Callastral.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundView />;
}
