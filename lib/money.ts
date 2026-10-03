/**
 * Prix conseiller (base EUR) et conversion affichée / encaissée.
 * Module pur : aucun accès à process.env, utilisable côté client.
 * Les taux effectifs sont fournis par le serveur (lib/market.ts).
 */

export const CURRENCIES = ['eur', 'usd', 'gbp', 'jpy', 'chf', 'cad'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const ADVISOR_LANGS = ['fr', 'en', 'es', 'de', 'it'] as const;
export type AdvisorLang = (typeof ADVISOR_LANGS)[number];

export interface FxRates {
  eur: number;
  usd: number;
  gbp: number;
  jpy: number;
  chf: number;
  cad: number;
}

export const DEFAULT_RATES: FxRates = {
  eur: 1,
  usd: 1.08,
  gbp: 0.84,
  jpy: 172,
  chf: 0.94,
  cad: 1.47,
};

const MIN_EUR_CENTS = 50;
const MAX_EUR_CENTS = 200;

export function isCurrency(value: string): value is Currency {
  return (CURRENCIES as readonly string[]).includes(value);
}

export function isAdvisorLang(value: string): value is AdvisorLang {
  return (ADVISOR_LANGS as readonly string[]).includes(value);
}

export function normalizeCurrency(value: string | null | undefined): Currency {
  const code = (value || '').trim().toLowerCase();
  return isCurrency(code) ? code : 'eur';
}

export function isZeroDecimal(currency: Currency): boolean {
  return currency === 'jpy';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Années d’expérience déduites de l’âge quand la colonne n’est pas renseignée. */
export function yearsFromAge(age: number): number {
  const years = Math.round(Number(age) - 27);
  return clamp(Number.isFinite(years) ? years : 1, 1, 45);
}

/**
 * Tarif minute de base, en centimes d’euro, entre 0,50 € et 2,00 €.
 * Même formule que la migration 20261004040000_advisor_prices_currency.sql.
 */
export function pricePerMinCents(input: {
  years?: number | null;
  age: number;
  specialties: readonly string[];
}): number {
  const years =
    input.years != null && Number.isFinite(input.years) && input.years > 0
      ? clamp(Math.round(input.years), 1, 45)
      : yearsFromAge(input.age);
  const extra = Math.max(0, input.specialties.length - 1);
  return clamp(50 + years * 3 + extra * 12, MIN_EUR_CENTS, MAX_EUR_CENTS);
}

/** Tarif d’intro : 99/149 du tarif du conseiller, strictement en dessous. */
export function introCentsFromStandard(standardCents: number): number {
  const standard = clamp(Math.round(standardCents), MIN_EUR_CENTS, MAX_EUR_CENTS);
  const intro = Math.max(1, Math.round((standard * 99) / 149));
  return intro < standard ? intro : standard - 1;
}

function niceRound(minor: number, currency: Currency): number {
  if (minor <= 0) return 0;
  const step = 10;
  const rounded = Math.round(minor / step) * step;
  return Math.max(step, rounded);
}

/** Convertit des centimes d’euro vers l’unité mineure Stripe de la devise (yen pour JPY). */
export function convertEurCents(eurCents: number, currency: Currency, rates: FxRates): number {
  const cents = Math.max(0, Math.round(eurCents));
  if (cents === 0) return 0;
  if (currency === 'eur') return niceRound(cents, 'eur');
  const rate = rates[currency] > 0 ? rates[currency] : DEFAULT_RATES[currency];
  const major = (cents / 100) * rate;
  if (currency === 'jpy') return niceRound(Math.round(major), 'jpy');
  return niceRound(Math.round(major * 100), currency);
}

export interface LocalRates {
  standardEur: number;
  introEur: number;
  standardLocal: number;
  introLocal: number;
}

export function localRates(eurPerMinCents: number, currency: Currency, rates: FxRates): LocalRates {
  const standardEur = clamp(Math.round(eurPerMinCents), MIN_EUR_CENTS, MAX_EUR_CENTS);
  const introEur = introCentsFromStandard(standardEur);
  let standardLocal = convertEurCents(standardEur, currency, rates);
  let introLocal = convertEurCents(introEur, currency, rates);
  const step = 10;
  if (introLocal >= standardLocal) {
    introLocal = Math.max(step, standardLocal - step);
  }
  return { standardEur, introEur, standardLocal, introLocal };
}

/** Réservation = minutes d’intro × tarif intro local + reste × tarif du conseiller. */
export function localBookingMinor(
  eurPerMinCents: number,
  minutes: number,
  currency: Currency,
  rates: FxRates
): number {
  const { standardLocal, introLocal } = localRates(eurPerMinCents, currency, rates);
  const introMinutes = Math.min(3, Math.max(0, minutes));
  const rest = Math.max(0, minutes - 3);
  return introMinutes * introLocal + rest * standardLocal;
}

/** Compteur à la seconde, dans l’unité mineure déjà convertie. */
export function meterMinor(seconds: number, introPerMin: number, standardPerMin: number): number {
  if (seconds <= 0) return 0;
  const introSeconds = Math.min(180, seconds);
  const rest = Math.max(0, seconds - 180);
  return Math.ceil((introSeconds * introPerMin) / 60) + Math.ceil((rest * standardPerMin) / 60);
}

export function formatMoney(minor: number, currency: Currency): string {
  const zero = isZeroDecimal(currency);
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: zero ? 0 : 2,
    maximumFractionDigits: zero ? 0 : 2,
  }).format(zero ? minor : minor / 100);
}

export interface DurationQuote {
  minutes: number;
  minor: number;
  label: string;
}

export interface AdvisorQuote {
  currency: Currency;
  perMinMinor: number;
  introMinor: number;
  perMinLabel: string;
  introLabel: string;
  durations: DurationQuote[];
}

export function quoteAdvisor(
  eurPerMinCents: number,
  currency: Currency,
  rates: FxRates,
  durations: readonly number[] = [10, 20, 30]
): AdvisorQuote {
  const local = localRates(eurPerMinCents, currency, rates);
  return {
    currency,
    perMinMinor: local.standardLocal,
    introMinor: local.introLocal,
    perMinLabel: `${formatMoney(local.standardLocal, currency)}/min`,
    introLabel: `${formatMoney(local.introLocal, currency)}/min`,
    durations: durations.map((minutes) => {
      const minor = localBookingMinor(eurPerMinCents, minutes, currency, rates);
      return { minutes, minor, label: formatMoney(minor, currency) };
    }),
  };
}
