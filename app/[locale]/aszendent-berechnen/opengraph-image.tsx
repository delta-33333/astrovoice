import { getCopy } from '@/lib/ascendant-copy';
import { ogCard, ogContentType, ogSize } from '@/lib/og-card';

export const runtime = 'nodejs';
export const alt = 'Aszendent berechnen';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  const copy = getCopy('de');
  return ogCard(copy.h1, copy.description.slice(0, 120));
}
