import { ogCard, ogContentType, ogSize } from '@/lib/og-card';

export const runtime = 'nodejs';
export const alt = 'New Moon in Scorpio — 9 November 2026';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogCard('New Moon in Scorpio', '9 November 2026');
}
