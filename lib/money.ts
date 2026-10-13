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

export const MIN_EUR_CENTS = 89;
export const MAX_EUR_CENTS = 199;

export const MARKET_CODES = ['FR', 'BE', 'DE', 'ES', 'IT', 'CH', 'GB', 'US'] as const;
export type MarketCode = (typeof MARKET_CODES)[number];

export type MarketCurrency = 'eur' | 'chf' | 'gbp' | 'usd';

/**
 * Grille par pays détecté. Les autres pays en euro suivent la France.
 * Les autres pays suivent les États-Unis.
 */
export const MARKET_PRICING = {
  FR: { currency: 'eur', minMinor: 99, maxMinor: 199, introMinor: 49, packs: { '10min': 1290, '30min': 3490, '60min': 5990 }, founding: 490 },
  BE: { currency: 'eur', minMinor: 99, maxMinor: 199, introMinor: 49, packs: { '10min': 1290, '30min': 3490, '60min': 5990 }, founding: 490 },
  DE: { currency: 'eur', minMinor: 99, maxMinor: 199, introMinor: 49, packs: { '10min': 1290, '30min': 3490, '60min': 5990 }, founding: 490 },
  ES: { currency: 'eur', minMinor: 89, maxMinor: 149, introMinor: 45, packs: { '10min': 990, '30min': 2690, '60min': 4790 }, founding: 490 },
  IT: { currency: 'eur', minMinor: 89, maxMinor: 129, introMinor: 45, packs: { '10min': 990, '30min': 2690, '60min': 4790 }, founding: 490 },
  CH: { currency: 'chf', minMinor: 99, maxMinor: 199, introMinor: 49, packs: { '10min': 1290, '30min': 3490, '60min': 5990 }, founding: 490 },
  GB: { currency: 'gbp', minMinor: 99, maxMinor: 179, introMinor: 49, packs: { '10min': 1190, '30min': 2990, '60min': 4990 }, founding: 490 },
  US: { currency: 'usd', minMinor: 149, maxMinor: 299, introMinor: 69, packs: { '10min': 1990, '30min': 4990, '60min': 8990 }, founding: 590 },
} as const;

const EURO_COUNTRIES = new Set([
  'AT', 'BE', 'CY', 'DE', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'IE', 'IT',
  'LT', 'LU', 'LV', 'MT', 'NL', 'PT', 'SI', 'SK',
  'BG', 'CZ', 'DK', 'HU', 'PL', 'RO', 'SE', 'MC', 'AD', 'SM', 'VA', 'ME', 'XK',
]);

export function marketCodeForCountry(country: string | null | undefined): MarketCode {
  const code = (country || '').trim().toUpperCase();
  if (
    code === 'FR' || code === 'BE' || code === 'DE' || code === 'ES' ||
    code === 'IT' || code === 'CH' || code === 'GB' || code === 'US'
  ) {
    return code;
  }
  if (!code || code === 'XX' || EURO_COUNTRIES.has(code)) return 'FR';
  return 'US';
}

export function marketCodeForContext(input: {
  country?: string | null;
  locale?: string | null;
  currency?: Currency | null;
}): MarketCode {
  const country = (input.country || '').trim().toUpperCase();
  if (country && country !== 'XX') return marketCodeForCountry(country);
  const locale = (input.locale || '').toLowerCase().slice(0, 2);
  if (locale === 'es') return 'ES';
  if (locale === 'it') return 'IT';
  if (locale === 'de') return 'DE';
  if (locale === 'fr') return 'FR';
  if (input.currency === 'gbp') return 'GB';
  if (input.currency === 'chf') return 'CH';
  if (input.currency === 'usd') return 'US';
  if (locale === 'en') return 'US';
  return 'FR';
}

export interface PriceContext {
  country?: string | null;
  locale?: string | null;
  /** Tarif d’accueil des 3 premières minutes. Faux s’il a déjà été utilisé sur le compte. */
  introEligible?: boolean;
}

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
 * Tarif minute de base, en centimes d’euro, entre 0,89 € et 1,99 €.
 * 89 + années × 2 + (spécialités − 1) × 10.
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
  return clamp(89 + years * 2 + extra * 10, MIN_EUR_CENTS, MAX_EUR_CENTS);
}

/**
 * Tarif local du conseiller :
 * min + (prix EUR − 89) / (199 − 89) × (max − min).
 * Arrondi au dixième pour EUR, CHF et GBP. Les bornes publiées restent exactes.
 */
export function advisorLocalMinor(eurCents: number, market: MarketCode): number {
  const grid = MARKET_PRICING[market];
  const eur = clamp(Math.round(eurCents), MIN_EUR_CENTS, MAX_EUR_CENTS);
  const span = MAX_EUR_CENTS - MIN_EUR_CENTS;
  const raw = grid.minMinor + ((eur - MIN_EUR_CENTS) / span) * (grid.maxMinor - grid.minMinor);
  if (Math.abs(raw - grid.minMinor) < 0.001) return grid.minMinor;
  if (Math.abs(raw - grid.maxMinor) < 0.001) return grid.maxMinor;
  const rounded = grid.currency === 'usd' ? Math.round(raw) : Math.round(raw / 10) * 10;
  return clamp(rounded, grid.minMinor, grid.maxMinor);
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
  market: MarketCode;
  currency: MarketCurrency;
}

/**
 * Tarif minute du marché du visiteur. Le pays détecté prime sur la devise choisie.
 * L’intro est le montant fixe du marché, pendant 3 minutes, une fois par compte.
 */
export function localRates(
  eurPerMinCents: number,
  currency: Currency,
  _rates: FxRates,
  context?: PriceContext,
): LocalRates {
  const market = marketCodeForContext({
    country: context?.country,
    locale: context?.locale,
    currency,
  });
  const grid = MARKET_PRICING[market];
  const standardEur = clamp(Math.round(eurPerMinCents), MIN_EUR_CENTS, MAX_EUR_CENTS);
  const standardLocal = advisorLocalMinor(standardEur, market);
  const introEligible = context?.introEligible !== false;
  const introLocal = introEligible ? grid.introMinor : standardLocal;
  return {
    standardEur,
    introEur: introEligible ? grid.introMinor : standardEur,
    standardLocal,
    introLocal,
    market,
    currency: grid.currency,
  };
}

/** Plancher, plafond et tarif d’accueil du marché. */
export function perMinuteRange(
  currency: Currency,
  rates: FxRates,
  locale?: string | null,
  country?: string | null,
): {
  market: MarketCode;
  currency: MarketCurrency;
  floorMinor: number;
  ceilingMinor: number;
  introMinor: number;
  floor: string;
  ceiling: string;
  intro: string;
} {
  const priced = localRates(MIN_EUR_CENTS, currency, rates, { country, locale, introEligible: true });
  const grid = MARKET_PRICING[priced.market];
  return {
    market: priced.market,
    currency: grid.currency,
    floorMinor: grid.minMinor,
    ceilingMinor: grid.maxMinor,
    introMinor: grid.introMinor,
    floor: formatMoney(grid.minMinor, grid.currency, locale),
    ceiling: formatMoney(grid.maxMinor, grid.currency, locale),
    intro: formatMoney(grid.introMinor, grid.currency, locale),
  };
}

/** Réservation = minutes d’accueil × tarif fixe + reste × tarif du conseiller. */
export function localBookingMinor(
  eurPerMinCents: number,
  minutes: number,
  currency: Currency,
  rates: FxRates,
  context?: PriceContext,
): number {
  const { standardLocal, introLocal } = localRates(eurPerMinCents, currency, rates, context);
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
  locale?: string | null,
  country?: string | null,
  introEligible = true,
): AdvisorQuote {
  const context: PriceContext = { country, locale, introEligible };
  const local = localRates(eurPerMinCents, currency, rates, context);
  return {
    currency: local.currency,
    perMinMinor: local.standardLocal,
    introMinor: local.introLocal,
    perMinLabel: `${formatMoney(local.standardLocal, local.currency, locale)}/min`,
    introLabel: `${formatMoney(local.introLocal, local.currency, locale)}/min`,
    durations: durations.map((minutes) => {
      const minor = localBookingMinor(eurPerMinCents, minutes, currency, rates, context);
      return { minutes, minor, label: formatMoney(minor, local.currency, locale) };
    }),
  };
}
