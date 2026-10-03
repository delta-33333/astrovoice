import type { Metadata } from 'next';
import OffersCatalog from '@/components/OffersCatalog';
import SiteHeader from '@/components/SiteHeader';
import { resolveMarket } from '@/lib/market';
import { convertEurCents, formatMoney, packMinor, perMinuteRange } from '@/lib/money';
import { MINUTE_PACKS } from '@/lib/pricing';
import { GUARANTEE_TEXT } from '@/lib/guarantee-text';
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
  const range = perMinuteRange(market.currency, market.rates);
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
            floor: range.floor,
            ceiling: range.ceiling,
            currencyNote,
          }}
        />
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-3">
          <h2 className="text-xl font-semibold">Prix des packs dans votre pays</h2>
          <ul className="text-white/75 space-y-1">
            {MINUTE_PACKS.map((pack) => (
              <li key={pack.id}>
                {pack.founding ? `Offre fondateur, ${pack.minutes} minutes (une fois par compte)` : `Pack ${pack.minutes} minutes`} :{' '}
                <strong className="text-white">{formatMoney(packMinor(pack, market.currency, market.rates), market.currency)}</strong>
              </li>
            ))}
          </ul>
        </section>
        <section id="annulation" className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-2">
          <h2 className="text-xl font-semibold">Annulation</h2>
          <p className="text-white/75">
            Réservation annulée plus de 24 h avant : remboursement intégral. Ensuite : avoir valable 30 jours. L’abonnement se résilie à tout moment depuis le compte.
          </p>
        </section>
        <section id="garantie" className="rounded-3xl border border-celestial-gold/40 bg-celestial-gold/10 p-6 space-y-2">
          <h2 className="text-xl font-semibold">{GUARANTEE_TEXT.title}</h2>
          <p className="text-white/75">{GUARANTEE_TEXT.body}</p>
        </section>
      </div>
    </main>
  );
}
