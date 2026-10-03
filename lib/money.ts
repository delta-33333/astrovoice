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

export const MIN_EUR_CENTS = 50;
export const MAX_EUR_CENTS = 199;

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
 * Tarif minute de base, en centimes d’euro, entre 0,50 € et 1,99 €.
 * Même formule que la migration des tarifs conseiller, plafond resserré à 199.
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
  if (currency === 'eur') {
    const rounded = niceRound(cents, 'eur');
    // Le plafond minute est 1,99 € : un arrondi à la dizaine ne doit pas l’afficher à 2,00 €.
    if (cents <= MAX_EUR_CENTS && rounded > MAX_EUR_CENTS) return cents;
    return rounded;
  }
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

/**
 * Tarif minute converti : même règle pour le plancher, le plafond et chaque conseiller.
 * EUR : arrondi à 0,10 € (plafond 1,99 € conservé). Autres devises : conversion au centime
 * (au yen pour JPY), pour que 0,50 € devienne bien 0,54 $, 0,42 £, 86 ¥, etc.
 */
export function convertPerMinute(eurCents: number, currency: Currency, rates: FxRates): number {
  if (currency === 'eur') return convertEurCents(eurCents, currency, rates);
  const cents = Math.max(0, Math.round(eurCents));
  if (cents === 0) return 0;
  const rate = rates[currency] > 0 ? rates[currency] : DEFAULT_RATES[currency];
  const major = (cents / 100) * rate;
  return Math.max(1, currency === 'jpy' ? Math.round(major) : Math.round(major * 100));
}

export function localRates(eurPerMinCents: number, currency: Currency, rates: FxRates): LocalRates {
  const standardEur = clamp(Math.round(eurPerMinCents), MIN_EUR_CENTS, MAX_EUR_CENTS);
  const introEur = introCentsFromStandard(standardEur);
  const standardLocal = convertPerMinute(standardEur, currency, rates);
  let introLocal = convertPerMinute(introEur, currency, rates);
  const step = currency === 'eur' ? 10 : 1;
  if (introLocal >= standardLocal) {
    introLocal = Math.max(1, standardLocal - step);
  }
  return { standardEur, introEur, standardLocal, introLocal };
}

/** Plancher et plafond du tarif minute, convertis comme les tarifs des conseillers. */
export function perMinuteRange(
  currency: Currency,
  rates: FxRates,
  locale?: string
): { floorMinor: number; ceilingMinor: number; floor: string; ceiling: string } {
  const floorMinor = convertPerMinute(MIN_EUR_CENTS, currency, rates);
  const ceilingMinor = convertPerMinute(MAX_EUR_CENTS, currency, rates);
  return {
    floorMinor,
    ceilingMinor,
    floor: formatMoney(floorMinor, currency, locale),
    ceiling: formatMoney(ceilingMinor, currency, locale),
  };
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

const MONEY_LOCALE: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  es: 'es-ES',
  de: 'de-DE',
  it: 'it-IT',
};

/** Locale Intl pour l’affichage des montants ('fr' → 'fr-FR'…). Accepte aussi une locale BCP 47. */
export function moneyLocale(locale?: string | null): string {
  if (!locale) return 'fr-FR';
  return MONEY_LOCALE[locale] ?? (/^[a-z]{2}(-[A-Z]{2})?$/.test(locale) ? locale : 'fr-FR');
}

/**
 * Montant localisé avec le symbole court : 52,90 $ / $52.90, 41,20 £ / £41.20, 8 430 ¥ / ¥8,430.
 * CAD garde « CA$ » / « $CA » pour ne pas se confondre avec le dollar US.
 */
export function formatMoney(minor: number, currency: Currency, locale?: string | null): string {
  const zero = isZeroDecimal(currency);
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currency.toUpperCase(),
    currencyDisplay: currency === 'cad' ? 'symbol' : 'narrowSymbol',
    minimumFractionDigits: zero ? 0 : 2,
    maximumFractionDigits: zero ? 0 : 2,
  };
  const value = zero ? minor : minor / 100;
  try {
    return new Intl.NumberFormat(moneyLocale(locale), options).format(value);
  } catch {
    return new Intl.NumberFormat(moneyLocale(locale), { ...options, currencyDisplay: 'symbol' }).format(value);
  }
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
  durations: readonly number[] = [10, 20, 30],
  locale?: string | null
): AdvisorQuote {
  const local = localRates(eurPerMinCents, currency, rates);
  return {
    currency,
    perMinMinor: local.standardLocal,
    introMinor: local.introLocal,
    perMinLabel: `${formatMoney(local.standardLocal, currency, locale)}/min`,
    introLabel: `${formatMoney(local.introLocal, currency, locale)}/min`,
    durations: durations.map((minutes) => {
      const minor = localBookingMinor(eurPerMinCents, minutes, currency, rates);
      return { minutes, minor, label: formatMoney(minor, currency, locale) };
    }),
  };
}
