import { ogCard, ogContentType, ogSize } from '@/lib/og-card';

export const runtime = 'nodejs';
export const alt = 'Pleine Lune en Gémeaux — 24 novembre 2026';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogCard('Pleine Lune en Gémeaux', '24 novembre 2026');
}
