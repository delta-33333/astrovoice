import {
  INTRO_MINUTES,
  INTRO_SECONDS,
  PRICE_BANDS,
  bandIntro,
  bandPackPrice,
  bandPackReference,
  bandStandard,
  type BandId,
  type PriceBand,
} from './price-bands';

/**
 * Prix conseiller (palier de base EUR → marché) et conversion affichée / encaissée.
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

/** Taux de change + marché tarifaire (pays). Le marché manquant vaut « fr ». */
export type PriceRates = FxRates & { band?: BandId };

export function priceBand(rates: PriceRates): PriceBand {
  return PRICE_BANDS[rates.band ?? 'fr'] ?? PRICE_BANDS.fr;
}

/** Palier de base d’un conseiller (bornes historiques en centimes d’euro). */
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

function niceRound(minor: number): number {
  if (minor <= 0) return 0;
  const step = 10;
  const rounded = Math.round(minor / step) * step;
  return Math.max(step, rounded);
}

/** Convertit des centimes d’euro vers l’unité mineure Stripe de la devise (yen pour JPY). */
export function convertEurCents(eurCents: number, currency: Currency, rates: FxRates): number {
  const cents = Math.max(0, Math.round(eurCents));
  if (cents === 0) return 0;
  if (currency === 'eur') return niceRound(cents);
  const rate = rates[currency] > 0 ? rates[currency] : DEFAULT_RATES[currency];
  const major = (cents / 100) * rate;
  if (currency === 'jpy') return niceRound(Math.round(major));
  return niceRound(Math.round(major * 100));
}

/** Convertit un montant mineur d’une devise à l’autre, au centime (au yen pour JPY). */
export function convertMinor(minor: number, from: Currency, to: Currency, rates: FxRates): number {
  const amount = Math.max(0, Math.round(minor));
  if (amount === 0 || from === to) return amount;
  const fromRate = rates[from] > 0 ? rates[from] : DEFAULT_RATES[from];
  const toRate = rates[to] > 0 ? rates[to] : DEFAULT_RATES[to];
  const eurMajor = (isZeroDecimal(from) ? amount : amount / 100) / fromRate;
  const target = eurMajor * toRate;
  return Math.max(1, isZeroDecimal(to) ? Math.round(target) : Math.round(target * 100));
}

export interface LocalRates {
  /** Palier de base du conseiller (centimes d’euro, 50 à 199). */
  standardEur: number;
  /** Tarifs dans la devise du marché, avant conversion d’affichage. */
  bandCurrency: Currency;
  standardBand: number;
  introBand: number;
  /** Tarifs encaissés, dans la devise affichée. */
  standardLocal: number;
  introLocal: number;
}

/**
 * Tarif minute d’un conseiller pour le marché du visiteur, puis converti dans la devise
 * affichée si elle diffère de celle du marché. Le serveur encaisse exactement ces montants.
 */
export function localRates(eurPerMinCents: number, currency: Currency, rates: PriceRates): LocalRates {
  const band = priceBand(rates);
  const standardEur = clamp(Math.round(eurPerMinCents), MIN_EUR_CENTS, MAX_EUR_CENTS);
  const standardBand = bandStandard(band, standardEur);
  const introBand = bandIntro(band, standardBand);
  const standardLocal = convertMinor(standardBand, band.currency, currency, rates);
  let introLocal = convertMinor(introBand, band.currency, currency, rates);
  if (introLocal >= standardLocal) introLocal = Math.max(1, standardLocal - 1);
  return { standardEur, bandCurrency: band.currency, standardBand, introBand, standardLocal, introLocal };
}

/** Plancher et plafond du tarif minute du marché, dans la devise affichée. */
export function perMinuteRange(
  currency: Currency,
  rates: PriceRates,
  locale?: string
): { floorMinor: number; ceilingMinor: number; floor: string; ceiling: string } {
  const band = priceBand(rates);
  const floorMinor = convertMinor(band.min, band.currency, currency, rates);
  const ceilingMinor = convertMinor(band.max, band.currency, currency, rates);
  return {
    floorMinor,
    ceilingMinor,
    floor: formatMoney(floorMinor, currency, locale),
    ceiling: formatMoney(ceilingMinor, currency, locale),
  };
}

/** Réservation = minutes d’intro × tarif intro + reste × tarif du conseiller. */
export function localBookingMinor(
  eurPerMinCents: number,
  minutes: number,
  currency: Currency,
  rates: PriceRates
): number {
  const { standardLocal, introLocal } = localRates(eurPerMinCents, currency, rates);
  const introMinutes = Math.min(INTRO_MINUTES, Math.max(0, minutes));
  const rest = Math.max(0, minutes - INTRO_MINUTES);
  return introMinutes * introLocal + rest * standardLocal;
}

/** Compteur à la seconde, dans l’unité mineure déjà convertie. */
export function meterMinor(seconds: number, introPerMin: number, standardPerMin: number): number {
  if (seconds <= 0) return 0;
  const introSeconds = Math.min(INTRO_SECONDS, seconds);
  const rest = Math.max(0, seconds - INTRO_SECONDS);
  return Math.ceil((introSeconds * introPerMin) / 60) + Math.ceil((rest * standardPerMin) / 60);
}

/** Prix d’un pack de minutes pour le marché, dans la devise affichée. L’offre fondateur reste à 4,90 € convertis. */
export function packMinor(
  pack: { minutes: number; amountCents: number; founding?: boolean },
  currency: Currency,
  rates: PriceRates
): number {
  if (pack.founding) return convertEurCents(pack.amountCents, currency, rates);
  const band = priceBand(rates);
  return convertMinor(bandPackPrice(band, pack.minutes), band.currency, currency, rates);
}

/** Prix de référence : les mêmes minutes au tarif minute le plus bas du marché. */
export function packReferenceMinor(minutes: number, currency: Currency, rates: PriceRates): number {
  const band = priceBand(rates);
  return convertMinor(bandPackReference(band, minutes), band.currency, currency, rates);
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
  rates: PriceRates,
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
