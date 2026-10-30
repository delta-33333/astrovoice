import { redirect } from 'next/navigation';
import { resolveMarket } from '@/lib/market';
import { isLocale } from '@/lib/seo';

/** /offres renvoie vers la page Offres dans la langue du visiteur. */
export default async function OffersRedirect() {
  const market = await resolveMarket();
  const locale = isLocale(market.language) ? market.language : 'fr';
  redirect(`/${locale}/offres`);
}
