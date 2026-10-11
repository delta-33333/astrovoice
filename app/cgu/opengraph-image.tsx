import { ogCard, ogContentType, ogSize } from '@/lib/og-card';

export const runtime = 'nodejs';
export const alt = 'Conditions d’utilisation';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogCard('Conditions d’utilisation', 'Conseillers virtuels Callastral');
}
