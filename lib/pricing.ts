/**
 * Tarifs Callastral en euros (centimes).
 * Intro : 0,99 € pour les 2 premières minutes, puis 1,49 €/min à la seconde.
 */

export const CURRENCY = 'eur' as const;

export const INTRO_SECONDS = 120;
export const INTRO_CENTS = 99;
export const PER_MINUTE_CENTS = 149;

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
    regularCents: 1490,
    founding: true,
  },
  {
    id: '10min',
    minutes: 10,
    amountCents: 1290,
    regularCents: 1490,
  },
  {
    id: '30min',
    minutes: 30,
    amountCents: 3490,
    regularCents: 4470,
    popular: true,
  },
  {
    id: '60min',
    minutes: 60,
    amountCents: 5990,
    regularCents: 8940,
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
 * 0 seconde = 0. De 1 à 120 s : forfait d'intro 0,99 €. Au-delà : 1,49 €/min à la seconde.
 */
export function calculateCost(seconds: number): number {
  if (seconds <= 0) return 0;
  if (seconds <= INTRO_SECONDS) return INTRO_CENTS;
  const additionalSeconds = seconds - INTRO_SECONDS;
  const additionalCost = Math.ceil((additionalSeconds * PER_MINUTE_CENTS) / 60);
  return INTRO_CENTS + additionalCost;
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

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}
