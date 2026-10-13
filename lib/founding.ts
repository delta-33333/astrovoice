import { DateTime } from 'luxon';

/** 10 minutes, une fois par compte, 100 ventes, fin le 31 octobre 2026 à 23:59, heure de Paris. */
export const FOUNDING_MAX_SALES = 100;
export const FOUNDING_MINUTES = 10;

const END = DateTime.fromISO('2026-10-31T23:59:00', { zone: 'Europe/Paris' });

export function foundingEndsAt(): DateTime {
  return END;
}

export function foundingOfferOpen(now: Date, sales: number): boolean {
  if (!Number.isFinite(sales) || sales >= FOUNDING_MAX_SALES) return false;
  const at = DateTime.fromJSDate(now, { zone: 'Europe/Paris' });
  return at <= END;
}
