/**
 * Liste les objets Stripe à créer à la main. Ce script n’appelle pas Stripe.
 *
 *   npx tsx scripts/setup-stripe-prices.ts
 */
import { weeklyPriceEnvList } from '../lib/stripe-prices';
import { WEEKLY_CURRENCIES, WEEKLY_PLAN_IDS, WEEKLY_PLANS, decouverteAmountOff, firstWeekMinor } from '../lib/weekly';

function main() {
  console.log('Aucun objet Stripe n’est créé ici. Créez-les dans le Dashboard, puis renseignez les variables.');
  console.log('');
  for (const plan of WEEKLY_PLAN_IDS) {
    const item = WEEKLY_PLANS[plan];
    console.log(`Produit : ${item.productName} — ${item.minutes} min / semaine`);
    for (const currency of WEEKLY_CURRENCIES) {
      const full = item.amounts[currency];
      const first = firstWeekMinor(plan, currency);
      console.log(`  ${currency}  plein ${full}  première semaine ${first}`);
    }
  }
  console.log('');
  console.log('Coupon STRIPE_COUPON_WEEK1_50 : percent_off 50, duration once. Essentiel et Premium seulement.');
  for (const currency of WEEKLY_CURRENCIES) {
    console.log(
      `Coupon STRIPE_COUPON_DECOUVERTE_WEEK1_${currency.toUpperCase()} : amount_off ${decouverteAmountOff(currency)} ${currency}, duration once.`,
    );
  }
  console.log('');
  console.log('Variables Price :');
  for (const name of weeklyPriceEnvList()) console.log(`  ${name}`);
  console.log('Le coupon de bienvenue est une fois par client, toutes formules confondues.');
}

main();
