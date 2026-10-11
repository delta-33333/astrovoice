import { ogCard, ogContentType, ogSize } from '@/lib/og-card';

export const runtime = 'nodejs';
export const alt = 'Vidéos Callastral';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogCard('Vidéos', 'Contenu généré par IA · divertissement');
}
