import OffersCatalog from '@/components/OffersCatalog';
import SiteHeader from '@/components/SiteHeader';
import { resolveMarket } from '@/lib/market';
import { convertEurCents, formatMoney, MARKET_PRICING, marketCodeForContext, perMinuteRange } from '@/lib/money';
import { COMPATIBILITY_REPORT_EUR_CENTS, FORECAST_REPORT_EUR_CENTS, NATAL_REPORT_EUR_CENTS } from '@/lib/offers';
import { OFFERS_COPY } from '@/lib/offers-copy';
import { SUMMARY_CENTS } from '@/lib/pricing';
import { renewalTerms } from '@/lib/renewal-copy';
import type { Locale } from '@/lib/seo';
import { WEEKLY_PLAN_IDS, WEEKLY_PLANS } from '@/lib/weekly';

/** Page Offres dans une seule langue. fr/es/de/it : euros. en : devise du marché (GBP, USD…). */
export default async function OffersPageBody({ locale }: { locale: Locale }) {
  const market = await resolveMarket();
  const marketCode = marketCodeForContext({ country: market.country, locale: market.language, currency: market.currency });
  const currency = locale === 'en' ? MARKET_PRICING[marketCode].currency : 'eur';
  const money = (eurCents: number) => formatMoney(convertEurCents(eurCents, currency, market.rates), currency, locale);
  const range = perMinuteRange(currency, market.rates, locale, locale === 'en' ? market.country : locale.toUpperCase());
  const t = OFFERS_COPY[locale];
  const plans = WEEKLY_PLAN_IDS.map((id) => {
    const terms = renewalTerms(id, currency, locale);
    return {
      id,
      name: WEEKLY_PLANS[id].names[locale],
      minutes: WEEKLY_PLANS[id].minutes,
      highlighted: id === 'essentiel',
      priceLabel: formatMoney(WEEKLY_PLANS[id].amounts[currency], currency, locale),
      trialLabel: terms.trialLabel,
      renewal: terms.sentence,
    };
  });
  return (
    <main className="min-h-screen pb-16" lang={locale}>
      <SiteHeader />
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">Callastral</p>
          <h1 className="font-[family-name:var(--font-cinzel)] text-4xl">{t.title}</h1>
          <p className="text-white/70">{t.intro}</p>
        </header>
        <OffersCatalog
          locale={locale}
          labels={{
            plans,
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
