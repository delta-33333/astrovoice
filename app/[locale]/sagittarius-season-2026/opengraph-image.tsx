import { ogCard, ogContentType, ogSize } from '@/lib/og-card';

export const runtime = 'nodejs';
export const alt = 'Sagittarius season 2026 — 22 November – 21 December';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogCard('Sagittarius season 2026', '22 November – 21 December');
}
