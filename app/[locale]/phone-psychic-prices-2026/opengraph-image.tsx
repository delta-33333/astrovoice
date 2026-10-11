import { ogCard, ogContentType, ogSize } from '@/lib/og-card';

export const runtime = 'nodejs';
export const alt = 'Phone reading prices 2026';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogCard('Phone reading prices 2026', 'Rates shown before payment');
}
