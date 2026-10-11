import { ogCard, ogContentType, ogSize } from '@/lib/og-card';

export const runtime = 'nodejs';
export const alt = 'Comparatif 2026';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogCard('Comparatif 2026', 'Sites de voyance et d’astrologie');
}
