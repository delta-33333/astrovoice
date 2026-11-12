import { formatMoney, MARKET_PRICING, type AdvisorLang } from './money.ts';
import { FIXED_PACKS, isFixedPackId, type FixedPackId } from './pricing.ts';
import type { WeeklyCurrency } from './weekly.ts';

/** Pack mis en avant (le plus choisi) pour les CTA après essai. */
export const DEFAULT_PACK_ID: FixedPackId = '20min';

export function packGrid(locale: AdvisorLang, currency: WeeklyCurrency = 'eur') {
  if (currency === 'gbp') return MARKET_PRICING.GB;
  if (currency === 'usd') return MARKET_PRICING.US;
  if (currency === 'chf') return MARKET_PRICING.CH;
  if (locale === 'es') return MARKET_PRICING.ES;
  if (locale === 'it') return MARKET_PRICING.IT;
  return MARKET_PRICING.FR;
}

export function narrowMoney(label: string): string {
  return label.replace(/[\u00a0\u202f]/g, ' ');
}

/** « 10 min 12,90 € · 20 min 22,90 € · 40 min 39,90 € » selon le marché. */
export function packsOfferLine(locale: AdvisorLang, currency: WeeklyCurrency = 'eur'): string {
  const grid = packGrid(locale, currency);
  return FIXED_PACKS.filter((pack): pack is typeof pack & { id: FixedPackId } => isFixedPackId(pack.id)).map((pack) => {
    const price = narrowMoney(formatMoney(grid.packs[pack.id], grid.currency, locale));
    return `${pack.minutes} min ${price}`;
  }).join(' · ');
}

export function packPriceLabel(packId: FixedPackId, locale: AdvisorLang, currency: WeeklyCurrency = 'eur'): string {
  const grid = packGrid(locale, currency);
  return narrowMoney(formatMoney(grid.packs[packId], grid.currency, locale));
}

export function packsLead(locale: AdvisorLang): string {
  switch (locale) {
    case 'en':
      return 'Fixed-price packs, paid once. No subscription, no auto top-up.';
    case 'es':
      return 'Paquetes a precio fijo, pago único, sin suscripción ni recarga automática.';
    case 'de':
      return 'Festpreis-Pakete, einmalig bezahlt, ohne Abo und ohne automatische Aufladung.';
    case 'it':
      return 'Pacchetti a prezzo fisso, pagamento unico, senza abbonamento né ricarica automatica.';
    default:
      return 'Packs à prix fixe, payés une fois. Pas d’abonnement, pas de recharge automatique.';
  }
}

export function packsCheckoutPath(query: Record<string, string | undefined | null> = {}): string {
  const params = new URLSearchParams();
  const pack = query.pack && isFixedPackId(query.pack) ? query.pack : DEFAULT_PACK_ID;
  params.set('pack', pack);
  for (const [key, value] of Object.entries(query)) {
    if (key === 'pack' || value == null || value === '') continue;
    params.set(key, value);
  }
  return `/packs?${params.toString()}`;
}

export const PACKS_CATALOG_PATH = '/packs';
