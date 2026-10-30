import { ogCard, ogContentType, ogSize } from '@/lib/og-card';

export const runtime = 'nodejs';
export const alt = 'Mercury and Venus direct — 13–14 November 2026';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogCard('Mercury and Venus direct', '13–14 November 2026');
}
