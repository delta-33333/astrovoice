import { redirect } from 'next/navigation';
import { resolveMarket } from '@/lib/market';
import { isLocale } from '@/lib/seo';
import { isFixedPackId } from '@/lib/pricing';

/**
 * /offres renvoie vers la page Offres dans la langue du visiteur.
 * Un pack déjà choisi (?pack=10min|20min|40min) part directement au paiement (/packs), sans perdre le choix.
 */
export default async function OffersRedirect(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await props.searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'string') params.set(key, value);
    else if (Array.isArray(value) && value[0]) params.set(key, value[0]);
  }
  const market = await resolveMarket();
  const locale = isLocale(market.language) ? market.language : 'fr';
  const pack = params.get('pack');
  if (pack && isFixedPackId(pack)) {
    if (!params.get('lang')) params.set('lang', locale === 'en' ? 'en' : 'fr');
    redirect(`/packs?${params.toString()}`);
  }
  const query = params.toString();
  redirect(`/${locale}/offres${query ? `?${query}` : ''}`);
}
