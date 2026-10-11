import { ogCard, ogContentType, ogSize } from '@/lib/og-card';

export const runtime = 'nodejs';
export const alt = 'Comparison 2026';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogCard('Comparison 2026', 'Phone psychic and astrology sites');
}
