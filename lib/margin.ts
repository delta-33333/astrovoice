/**
 * Marge HT de la proposition du 13/10/2026.
 * marge = (TTC / (1+TVA) − (%Stripe × TTC + fixe 0,25 € × FX + 0,084 € × FX × minutes)) / HT
 * Le fixe Stripe de 0,25 € est converti au taux du dépôt (USD 1,08, GBP 0,84, CHF 0,94).
 */

export const VOICE_EUR_PER_MIN = 0.084;
export const STRIPE_FIXED_EUR = 0.25;

export const MARGIN_FX = {
  eur: 1,
  usd: 1.08,
  gbp: 0.84,
  chf: 0.94,
} as const;

export type MarginCountry = 'FR' | 'BE' | 'DE' | 'ES' | 'IT' | 'CH' | 'GB' | 'US';

export const MARGIN_VAT: Record<MarginCountry, number> = {
  FR: 0.2,
  BE: 0.21,
  DE: 0.19,
  ES: 0.21,
  IT: 0.22,
  CH: 0.081,
  GB: 0.2,
  US: 0,
};

export function marginCurrency(country: MarginCountry): keyof typeof MARGIN_FX {
  if (country === 'CH') return 'chf';
  if (country === 'GB') return 'gbp';
  if (country === 'US') return 'usd';
  return 'eur';
}

/** Pourcentage Stripe TTC, conversion comprise hors euro. */
export function stripePercent(country: MarginCountry): number {
  if (country === 'GB') return 0.025 + 0.02;
  if (country === 'CH' || country === 'US') return 0.0325 + 0.02;
  return 0.015;
}

/** Marge HT, entre 0 et 1, pour un ticket entièrement consommé. */
export function marginPreVat(ttcMajor: number, minutes: number, country: MarginCountry): number {
  const fx = MARGIN_FX[marginCurrency(country)];
  const vat = MARGIN_VAT[country];
  const ht = ttcMajor / (1 + vat);
  if (ht <= 0) return 0;
  const stripe = stripePercent(country) * ttcMajor + STRIPE_FIXED_EUR * fx;
  const voice = VOICE_EUR_PER_MIN * fx * minutes;
  return (ht - stripe - voice) / ht;
}
