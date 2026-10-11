import { ogCard, ogContentType, ogSize } from '@/lib/og-card';

export const runtime = 'nodejs';
export const alt = 'À propos de Callastral';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogCard('À propos de Callastral', 'Conseillers virtuels, voix générée par IA');
}
