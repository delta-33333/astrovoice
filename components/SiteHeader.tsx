import Link from 'next/link';
import Logo from '@/components/Logo';
import MarketSwitch from '@/components/MarketSwitch';
import { resolveMarket } from '@/lib/market';
import { getSession } from '@/lib/session';
import { headers } from 'next/headers';
import { isAdvisorLang } from '@/lib/money';

export default async function SiteHeader() {
  const [market, user, hdrs] = await Promise.all([resolveMarket(), getSession(), headers()]);
  // Sur une page localisée (/fr/…, /en/…), la langue de l’URL prime sur le cookie de marché :
  // /fr/offres ne doit jamais afficher EN / GBP. fr/es/de/it : euros ; en : devise du marché.
  const pathLocale = hdrs.get('x-locale');
  const language = pathLocale && isAdvisorLang(pathLocale) ? pathLocale : market.language;
  const currency = pathLocale && pathLocale !== 'en' ? 'eur' : market.currency;
  const english = Boolean(pathLocale && pathLocale !== 'fr');
  const signIn = english ? (user ? 'Account' : 'Sign in') : user ? 'Compte' : 'Connexion';

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0c1018]/95 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Logo />
        <div className="flex items-center gap-2">
          <MarketSwitch language={language} currency={currency} />
          <Link href={user ? '/account' : '/auth'} className="text-sm text-white/80 px-2 py-1">
            {signIn}
          </Link>
        </div>
      </div>
    </header>
  );
}
