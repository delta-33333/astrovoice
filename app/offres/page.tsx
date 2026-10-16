import type { Metadata } from 'next';
import OffersCatalog from '@/components/OffersCatalog';
import SiteHeader from '@/components/SiteHeader';
import { resolveMarket } from '@/lib/market';
import {
  convertEurCents,
  formatMoney,
  MARKET_PRICING,
  marketCodeForContext,
  perMinuteRange,
} from '@/lib/money';
import {
  COMPATIBILITY_REPORT_EUR_CENTS,
  FORECAST_REPORT_EUR_CENTS,
  NATAL_REPORT_EUR_CENTS,
} from '@/lib/offers';
import { SUMMARY_CENTS } from '@/lib/pricing';
import { renewalTerms } from '@/lib/renewal-copy';
import { WEEKLY_PLAN_IDS, WEEKLY_PLANS } from '@/lib/weekly';

export const metadata: Metadata = {
  title: 'Offres — Callastral',
  description:
    'Consultation à la minute, packs, résumé écrit, thème natal, prévision et formules hebdomadaires.',
  alternates: { canonical: '/offres', languages: { fr: '/offres', 'x-default': '/offres' } },
};

export default async function OffersPage() {
  const market = await resolveMarket();
  const code = marketCodeForContext({
    country: market.country,
    locale: market.language,
    currency: market.currency,
  });
  const grid = MARKET_PRICING[code];
  const money = (eurCents: number) =>
    formatMoney(convertEurCents(eurCents, market.currency, market.rates), market.currency, market.language);
  const range = perMinuteRange(market.currency, market.rates, market.language, market.country);
  const plans = WEEKLY_PLAN_IDS.map((id) => {
    const terms = renewalTerms(id, grid.currency, market.language);
    return {
      id,
      name: WEEKLY_PLANS[id].names[market.language],
      minutes: WEEKLY_PLANS[id].minutes,
      highlighted: id === 'essentiel',
      priceLabel: formatMoney(WEEKLY_PLANS[id].amounts[grid.currency], grid.currency, market.language),
      trialLabel: terms.trialLabel,
      renewal: terms.sentence,
    };
  });

  return (
    <main className="min-h-screen pb-16">
      <SiteHeader />
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">Callastral</p>
          <h1 className="font-[family-name:var(--font-cinzel)] text-4xl">Offres</h1>
          <p className="text-white/70">
            Tous les prix ci-dessous sont ceux encaissés. Chaque formule inclut un volume de minutes par semaine,
            avec 60 minutes maximum par appel.
          </p>
        </header>
        <OffersCatalog
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
