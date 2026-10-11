import { ogCard, ogContentType, ogSize } from '@/lib/og-card';

export const runtime = 'nodejs';
export const alt = 'Tarifs voyance 2026';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogCard('Tarifs voyance 2026', 'Prix affichés avant le paiement');
}
