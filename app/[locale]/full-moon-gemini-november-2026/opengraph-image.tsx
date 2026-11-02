import { ogCard, ogContentType, ogSize } from '@/lib/og-card';

export const runtime = 'nodejs';
export const alt = 'Full Moon in Gemini — 24 November 2026';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogCard('Full Moon in Gemini', '24 November 2026');
}
