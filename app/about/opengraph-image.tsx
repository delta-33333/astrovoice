import { ogCard, ogContentType, ogSize } from '@/lib/og-card';

export const runtime = 'nodejs';
export const alt = 'About Callastral';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogCard('About Callastral', 'Virtual advisors, AI-generated voice');
}
