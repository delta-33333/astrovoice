/**
 * Crée les Price Stripe de Callastral Illimité (EUR, USD, GBP, JPY) s’ils n’existent pas.
 * Même fonction que l’application : ensureAllUnlimitedPrices (lookup_key).
 *
 *   STRIPE_SECRET_KEY=sk_live_... npx tsx scripts/setup-stripe-prices.ts
 */
import { ensureAllUnlimitedPrices, unlimitedMinor } from '../lib/stripe-prices';
import { SUBSCRIPTION_CURRENCIES } from '../lib/offers';

async function main() {
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
    console.error('STRIPE_SECRET_KEY manquante');
    process.exit(1);
  }
  for (const currency of SUBSCRIPTION_CURRENCIES) {
    console.log(currency, unlimitedMinor(currency));
  }
  const ids = await ensureAllUnlimitedPrices();
  console.log(ids);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
