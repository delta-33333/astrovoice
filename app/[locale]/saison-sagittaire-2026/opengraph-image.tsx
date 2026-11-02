import { ogCard, ogContentType, ogSize } from '@/lib/og-card';

export const runtime = 'nodejs';
export const alt = 'Saison du Sagittaire 2026 — 22 novembre – 21 décembre';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogCard('Saison du Sagittaire 2026', '22 novembre – 21 décembre');
}
