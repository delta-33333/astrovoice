import { ogCard, ogContentType, ogSize } from '@/lib/og-card';

export const runtime = 'nodejs';
export const alt = 'Offres Callastral';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogCard('Offres Callastral', 'Minute, packs et abonnement');
}
