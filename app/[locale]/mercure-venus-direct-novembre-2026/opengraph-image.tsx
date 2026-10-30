import { ogCard, ogContentType, ogSize } from '@/lib/og-card';

export const runtime = 'nodejs';
export const alt = 'Mercure et Vénus directs — 13–14 novembre 2026';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogCard('Mercure et Vénus directs', '13–14 novembre 2026');
}
