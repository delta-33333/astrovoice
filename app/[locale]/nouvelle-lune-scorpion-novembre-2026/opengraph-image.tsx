import { ogCard, ogContentType, ogSize } from '@/lib/og-card';

export const runtime = 'nodejs';
export const alt = 'Nouvelle Lune en Scorpion — 9 novembre 2026';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogCard('Nouvelle Lune en Scorpion', '9 novembre 2026');
}
