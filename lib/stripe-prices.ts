import { convertEurCents, DEFAULT_RATES, type FxRates } from './money';
import {
  SUBSCRIPTION_CURRENCIES,
  SUBSCRIPTION_EUR_CENTS,
  SUBSCRIPTION_NAME,
  subscriptionLookupKey,
  type SubscriptionCurrency,
} from './offers';
import { getStripe } from './stripe';

function positiveRate(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

/** Même surcharge d’environnement que lib/market.ts, sans importer ce module (script CLI). */
export function ratesForPrices(): FxRates {
  return {
    eur: 1,
    usd: positiveRate('FX_EUR_USD', DEFAULT_RATES.usd),
    gbp: positiveRate('FX_EUR_GBP', DEFAULT_RATES.gbp),
    jpy: positiveRate('FX_EUR_JPY', DEFAULT_RATES.jpy),
    chf: positiveRate('FX_EUR_CHF', DEFAULT_RATES.chf),
    cad: positiveRate('FX_EUR_CAD', DEFAULT_RATES.cad),
  };
}

export function unlimitedMinor(currency: SubscriptionCurrency, rates: FxRates = ratesForPrices()): number {
  return convertEurCents(SUBSCRIPTION_EUR_CENTS, currency, rates);
}

async function ensureProduct(stripe: NonNullable<ReturnType<typeof getStripe>>): Promise<string> {
  const found = await stripe.products.search({
    query: "active:'true' AND metadata['sku']:'unlimited'",
    limit: 1,
  });
  const existing = found.data[0];
  if (existing) return existing.id;
  const created = await stripe.products.create({
    name: SUBSCRIPTION_NAME,
    description:
      'Parole illimitée, dans la limite de 300 minutes par mois et de 60 minutes par appel. Résiliable à tout moment.',
    metadata: { app: 'callastral', sku: 'unlimited' },
  });
  return created.id;
}

/**
 * Prix mensuel Stripe, un par devise, identifié par lookup_key.
 * Ne remplace pas un prix déjà créé : le montant reste celui du premier enregistrement.
 */
export async function ensureUnlimitedPrice(currency: SubscriptionCurrency): Promise<string> {
  const stripe = getStripe();
  if (!stripe) throw new Error('STRIPE_NOT_CONFIGURED');
  const lookupKey = subscriptionLookupKey(currency);
  const listed = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
  const current = listed.data[0];
  if (current) return current.id;

  const product = await ensureProduct(stripe);
  try {
    const created = await stripe.prices.create({
      product,
      currency,
      unit_amount: unlimitedMinor(currency),
      recurring: { interval: 'month' },
      lookup_key: lookupKey,
      transfer_lookup_key: true,
      nickname: `${SUBSCRIPTION_NAME} ${currency.toUpperCase()}`,
      metadata: { app: 'callastral', sku: 'unlimited', currency },
    });
    return created.id;
  } catch (error) {
    const again = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
    if (again.data[0]) return again.data[0].id;
    throw error;
  }
}

export async function ensureAllUnlimitedPrices(): Promise<Record<SubscriptionCurrency, string>> {
  const ids = {} as Record<SubscriptionCurrency, string>;
  for (const currency of SUBSCRIPTION_CURRENCIES) {
    ids[currency] = await ensureUnlimitedPrice(currency);
  }
  return ids;
}
