import type { Metadata } from 'next';
import OffersCatalog from '@/components/OffersCatalog';
import SiteHeader from '@/components/SiteHeader';
import { resolveMarket } from '@/lib/market';
import { convertEurCents, formatMoney, MAX_EUR_CENTS, MIN_EUR_CENTS } from '@/lib/money';
import {
  COMPATIBILITY_REPORT_EUR_CENTS,
  FORECAST_REPORT_EUR_CENTS,
  NATAL_REPORT_EUR_CENTS,
  SUBSCRIPTION_EUR_CENTS,
  subscriptionCurrency,
} from '@/lib/offers';
import { SUMMARY_CENTS } from '@/lib/pricing';

export const metadata: Metadata = {
  title: 'Offres — Callastral',
  description:
    'Consultation à la minute, packs, résumé écrit, thème natal, prévision et abonnement Callastral Illimité.',
};

export default async function OffersPage() {
  const market = await resolveMarket();
  const subCurrency = subscriptionCurrency(market.currency);
  const money = (eurCents: number) =>
    formatMoney(convertEurCents(eurCents, market.currency, market.rates), market.currency);
  const subscription = formatMoney(
    convertEurCents(SUBSCRIPTION_EUR_CENTS, subCurrency, market.rates),
    subCurrency
  );
  const currencyNote =
    subCurrency === market.currency
      ? 'Le prélèvement mensuel se fait dans la devise affichée.'
      : `Le prélèvement mensuel se fait en ${subCurrency.toUpperCase()} (${subscription}).`;

  return (
    <main className="min-h-screen pb-16">
      <SiteHeader />
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">Callastral</p>
          <h1 className="font-[family-name:var(--font-cinzel)] text-4xl">Offres</h1>
          <p className="text-white/70">
            Tous les prix ci-dessous sont ceux encaissés. L’abonnement mensuel est limité à 300 minutes par mois
            et à 60 minutes par appel.
          </p>
        </header>
        <OffersCatalog
          labels={{
            subscription,
            summary: money(SUMMARY_CENTS),
            natal: money(NATAL_REPORT_EUR_CENTS),
            forecast: money(FORECAST_REPORT_EUR_CENTS),
            compatibility: money(COMPATIBILITY_REPORT_EUR_CENTS),
            floor: money(MIN_EUR_CENTS),
            ceiling: money(MAX_EUR_CENTS),
            currencyNote,
          }}
        />
      </div>
    </main>
  );
}
