import { coupleOg, coupleOgContentType, coupleOgSize } from '@/lib/couple-og';
import { loadCoupleResult } from '@/lib/couple-store';
import { isLocale } from '@/lib/seo';

export const alt = 'Callastral';
export const size = coupleOgSize;
export const contentType = coupleOgContentType;

export default async function CoupleShareImage(props: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await props.params;
  if (!isLocale(locale)) return coupleOg('A', 'B', null);
  const result = await loadCoupleResult(id);
  if (!result || result.locale !== locale) return coupleOg('A', 'B', null);
  return coupleOg(result.initialA, result.initialB, result.score);
}
