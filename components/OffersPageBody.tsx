import OffersCatalog from '@/components/OffersCatalog';
import SiteHeader from '@/components/SiteHeader';
import FixedPacks from '@/components/FixedPacks';
import Commitments from '@/components/Commitments';
import { trialPath } from '@/lib/free-call';
import { TRUST_PROMISE } from '@/lib/trust-copy';
import { resolveMarket } from '@/lib/market';
import { convertEurCents, formatMoney, MARKET_PRICING, marketCodeForContext, perMinuteRange } from '@/lib/money';
import { COMPATIBILITY_REPORT_EUR_CENTS, FORECAST_REPORT_EUR_CENTS, NATAL_REPORT_EUR_CENTS } from '@/lib/offers';
import { OFFERS_COPY } from '@/lib/offers-copy';
import { SUMMARY_CENTS } from '@/lib/pricing';
import type { Locale } from '@/lib/seo';

/** Page Offres dans une seule langue. fr/es/de/it : euros. en : devise du marché (GBP, USD…). */
export default async function OffersPageBody({ locale }: { locale: Locale }) {
  const market = await resolveMarket();
  const marketCode = marketCodeForContext({ country: market.country, locale: market.language, currency: market.currency });
  const currency = locale === 'en' ? MARKET_PRICING[marketCode].currency : 'eur';
  const money = (eurCents: number) => formatMoney(convertEurCents(eurCents, currency, market.rates), currency, locale);
  const range = perMinuteRange(currency, market.rates, locale, locale === 'en' ? market.country : locale.toUpperCase());
  const t = OFFERS_COPY[locale];

  return (
    <main className="min-h-screen pb-16" lang={locale}>
      <SiteHeader />
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">Callastral</p>
          <h1 className="font-[family-name:var(--font-cinzel)] text-4xl">{t.title}</h1>
          <p className="text-celestial-gold font-semibold" data-trust-promise>{TRUST_PROMISE[locale === 'fr' ? 'fr' : 'en']}</p>
          <p className="text-white/70">{t.intro}</p>
        </header>
        <div className="-mx-4">
          <FixedPacks locale={locale === 'fr' ? 'fr' : 'en'} pageLocale={locale} trialHref={trialPath(locale)} />
          <Commitments locale={locale === 'fr' ? 'fr' : 'en'} promise={false} />
        </div>
        <OffersCatalog
          locale={locale}
          labels={{
            plans: [],
            summary: money(SUMMARY_CENTS),
            natal: money(NATAL_REPORT_EUR_CENTS),
            forecast: money(FORECAST_REPORT_EUR_CENTS),
            compatibility: money(COMPATIBILITY_REPORT_EUR_CENTS),
            floor: range.floor,
            ceiling: range.ceiling,
            intro: range.intro,
          }}
        />
      </div>
    </main>
  );
}
