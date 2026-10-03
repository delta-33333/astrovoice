/**
 * Constantes historiques en euros (centimes). Les prix affichés et encaissés
 * viennent de lib/price-bands.ts (bandes par pays) via lib/money.ts.
 * Ces valeurs ne servent plus que de repli (paiement à la minute sans métadonnées).
 * Les montants de packs ci-dessous = bande France (référence).
 */

export const CURRENCY = 'eur' as const;

export const INTRO_SECONDS = 300;
export const INTRO_CENTS = 179;
export const PER_MINUTE_CENTS = 220;

/** Empreinte d'environ 10 minutes, encaissée au réel à la fin. */
export const CALL_HOLD_SECONDS = 10 * 60;

export type PackId = 'founding' | '10min' | '30min' | '60min';

export interface MinutePack {
  id: PackId;
  minutes: number;
  amountCents: number;
  regularCents: number;
  founding?: boolean;
  popular?: boolean;
}

export const MINUTE_PACKS: MinutePack[] = [
  {
    id: 'founding',
    minutes: 10,
    amountCents: 490,
    regularCents: 2200,
    founding: true,
  },
  {
    id: '10min',
    minutes: 10,
    amountCents: 1990,
    regularCents: 2200,
  },
  {
    id: '30min',
    minutes: 30,
    amountCents: 5590,
    regularCents: 6600,
    popular: true,
  },
  {
    id: '60min',
    minutes: 60,
    amountCents: 9890,
    regularCents: 13200,
  },
];

export function getPack(id: string): MinutePack | undefined {
  return MINUTE_PACKS.find((pack) => pack.id === id);
}

export function packSeconds(pack: MinutePack): number {
  return pack.minutes * 60;
}

/**
 * Montant en centimes pour une durée facturable (hors minutes déjà prépayées).
 * Repli historique : intro puis tarif standard, à la seconde.
 */
export function calculateCost(seconds: number): number {
  if (seconds <= 0) return 0;
  if (seconds <= INTRO_SECONDS) {
    return Math.ceil((seconds * INTRO_CENTS) / 60);
  }
  const introCost = Math.ceil((INTRO_SECONDS * INTRO_CENTS) / 60);
  const additionalSeconds = seconds - INTRO_SECONDS;
  return introCost + Math.ceil((additionalSeconds * PER_MINUTE_CENTS) / 60);
}

export const CALL_HOLD_CENTS = calculateCost(CALL_HOLD_SECONDS);

export function quoteCall(durationSeconds: number, prepaidSeconds: number) {
  const safeDuration = Math.max(0, Math.floor(durationSeconds));
  const safePrepaid = Math.max(0, Math.floor(prepaidSeconds));
  const coveredSeconds = Math.min(safePrepaid, safeDuration);
  const billableSeconds = safeDuration - coveredSeconds;
  const rawCents = calculateCost(billableSeconds);
  const amountCents = Math.min(rawCents, CALL_HOLD_CENTS);
  return {
    coveredSeconds,
    billableSeconds,
    amountCents,
    capped: rawCents > CALL_HOLD_CENTS,
  };
}

export const BOOKING_DURATIONS = [10, 20, 30] as const;

/** Résumé écrit envoyé par e-mail après la consultation. */
export const SUMMARY_CENTS = 290;

export function bookingListPriceCents(durationMin: number): number {
  return calculateCost(durationMin * 60);
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}
