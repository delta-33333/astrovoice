import { ogCard, ogContentType, ogSize } from '@/lib/og-card';

export const runtime = 'nodejs';
export const alt = 'Questions fréquentes';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogCard('Questions fréquentes', 'Consultations Callastral');
}
