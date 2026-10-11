import { ogCard, ogContentType, ogSize } from '@/lib/og-card';

export const runtime = 'nodejs';
export const alt = 'Callastral — consultation astrologique par téléphone';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogCard('Consultation par téléphone', 'Thème natal · tarif affiché avant le paiement');
}
