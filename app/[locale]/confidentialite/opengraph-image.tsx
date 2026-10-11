import { ogCard, ogContentType, ogSize } from '@/lib/og-card';

export const runtime = 'nodejs';
export const alt = 'Politique de confidentialité Callastral';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogCard('Confidentialité', 'RGPD · cookies · droits');
}
