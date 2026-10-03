/**
 * Tarifs par marché (pays détecté par x-vercel-ip-country).
 * Chaque conseiller a un palier (son tarif de base en centimes d’euro, 50 à 199) qui est
 * placé dans la fourchette du marché. La devise d’affichage peut être changée (cookie) :
 * le prix du marché est alors converti au taux du jour, et c’est ce montant converti
 * qui est encaissé. Module pur, utilisable côté client.
 */
import type { Currency } from './money';

export const BAND_IDS = ['us', 'gb', 'ca', 'au', 'fr', 'ch', 'de', 'es', 'latam', 'eu'] as const;
export type BandId = (typeof BAND_IDS)[number];

export interface PriceBand {
  id: BandId;
  currency: Currency;
  /** Tarif minute plancher et plafond, unité mineure de la devise du marché. */
  min: number;
  max: number;
  /** Plafond du tarif d’intro (5 premières minutes). */
  introCap: number;
  /** x9 : paliers de 0,50 (2,49 / 2,99…) ; tenth : arrondi à 0,10. */
  style: 'x9' | 'tenth';
  label: { fr: string; en: string };
}

export const PRICE_BANDS: Record<BandId, PriceBand> = {
  us: { id: 'us', currency: 'usd', min: 249, max: 499, introCap: 199, style: 'x9', label: { fr: 'États-Unis', en: 'United States' } },
  gb: { id: 'gb', currency: 'gbp', min: 220, max: 450, introCap: 169, style: 'tenth', label: { fr: 'Royaume-Uni', en: 'United Kingdom' } },
  ca: { id: 'ca', currency: 'cad', min: 220, max: 450, introCap: 269, style: 'tenth', label: { fr: 'Canada', en: 'Canada' } },
  au: { id: 'au', currency: 'usd', min: 149, max: 299, introCap: 199, style: 'x9', label: { fr: 'Australie (en dollars US, ≈ 2,20–4,50 AUD)', en: 'Australia (in US dollars, ≈ A$2.20–4.50)' } },
  fr: { id: 'fr', currency: 'eur', min: 220, max: 450, introCap: 179, style: 'tenth', label: { fr: 'France, Belgique, Luxembourg', en: 'France, Belgium, Luxembourg' } },
  ch: { id: 'ch', currency: 'chf', min: 210, max: 420, introCap: 169, style: 'tenth', label: { fr: 'Suisse', en: 'Switzerland' } },
  de: { id: 'de', currency: 'eur', min: 220, max: 420, introCap: 179, style: 'tenth', label: { fr: 'Allemagne, Autriche', en: 'Germany, Austria' } },
  es: { id: 'es', currency: 'eur', min: 149, max: 299, introCap: 179, style: 'x9', label: { fr: 'Espagne', en: 'Spain' } },
  latam: { id: 'latam', currency: 'usd', min: 149, max: 299, introCap: 199, style: 'x9', label: { fr: 'Amérique latine (en dollars US)', en: 'Latin America (in US dollars)' } },
  eu: { id: 'eu', currency: 'eur', min: 220, max: 420, introCap: 179, style: 'tenth', label: { fr: 'Autres pays de l’UE', en: 'Other EU countries' } },
};

/** Ordre d’affichage des tableaux de prix. */
export const BAND_ORDER: BandId[] = ['fr', 'de', 'eu', 'es', 'ch', 'gb', 'us', 'ca', 'au', 'latam'];

export const INTRO_MINUTES = 5;
export const INTRO_SECONDS = INTRO_MINUTES * 60;
export const INTRO_SHARE = 0.6;

const LATAM = new Set([
  'MX', 'GT', 'HN', 'SV', 'NI', 'CR', 'PA', 'CU', 'DO', 'PR', 'CO', 'VE', 'EC', 'PE', 'BO', 'PY', 'CL', 'AR', 'UY', 'BR',
]);
const EU_OTHER = new Set([
  'IT', 'NL', 'PT', 'IE', 'FI', 'GR', 'CY', 'MT', 'EE', 'LV', 'LT', 'SK', 'SI', 'HR',
  'PL', 'CZ', 'HU', 'RO', 'BG', 'SE', 'DK',
]);

export function isBandId(value: unknown): value is BandId {
  return typeof value === 'string' && (BAND_IDS as readonly string[]).includes(value);
}

export function bandForCountry(country: string | null | undefined): BandId {
  const code = (country || '').toUpperCase();
  if (code === 'US') return 'us';
  if (code === 'GB') return 'gb';
  if (code === 'CA') return 'ca';
  if (code === 'AU') return 'au';
  if (code === 'FR' || code === 'BE' || code === 'LU' || code === 'MC') return 'fr';
  if (code === 'CH' || code === 'LI') return 'ch';
  if (code === 'DE' || code === 'AT') return 'de';
  if (code === 'ES') return 'es';
  if (LATAM.has(code)) return 'latam';
  if (EU_OTHER.has(code)) return 'eu';
  return 'fr';
}

/** Marché utilisé par les pages éditoriales d’une langue (crawlées sans pays fiable). */
export function bandForLocale(locale: string): BandId {
  if (locale === 'en') return 'us';
  if (locale === 'de') return 'de';
  if (locale === 'es') return 'es';
  if (locale === 'it') return 'eu';
  return 'fr';
}

const BASE_MIN = 50;
const BASE_MAX = 199;

/** Tarif minute du conseiller dans la devise du marché (unité mineure). */
export function bandStandard(band: PriceBand, eurBaseCents: number): number {
  const base = Math.min(BASE_MAX, Math.max(BASE_MIN, Math.round(eurBaseCents)));
  const t = (base - BASE_MIN) / (BASE_MAX - BASE_MIN);
  const span = band.max - band.min;
  if (band.style === 'x9') {
    const steps = Math.round((t * span) / 50);
    return Math.min(band.max, band.min + steps * 50);
  }
  const raw = band.min + t * span;
  return Math.min(band.max, Math.max(band.min, Math.round(raw / 10) * 10));
}

/** Tarif d’intro : 60 % du tarif du conseiller, plafonné (1,99 $ / 1,79 € / 1,69 £…). */
export function bandIntro(band: PriceBand, standard: number): number {
  const intro = Math.min(band.introCap, Math.round(standard * INTRO_SHARE));
  return Math.max(1, Math.min(intro, standard - 1));
}

/** Prix d’un pack dans la devise du marché : minutes × plancher × facteur, arrondi à x,90. */
const PACK_FACTOR: Record<number, number> = { 10: 0.9, 30: 0.85, 60: 0.75 };

export function bandPackPrice(band: PriceBand, minutes: number): number {
  const factor = PACK_FACTOR[minutes] ?? 0.9;
  const raw = (band.min * minutes * factor) / 100;
  const rounded = Math.max(1, Math.round(raw)) - 0.1;
  return Math.round(rounded * 100);
}

/** Prix de référence d’un pack : les mêmes minutes au tarif minute le plus bas du marché. */
export function bandPackReference(band: PriceBand, minutes: number): number {
  return band.min * minutes;
}

const TABLE_LOCALE: Record<string, string> = { fr: 'fr-FR', en: 'en-US', es: 'es-ES', de: 'de-DE', it: 'it-IT' };

function fmtBand(minor: number, currency: Currency, locale: string): string {
  return new Intl.NumberFormat(TABLE_LOCALE[locale] ?? 'fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase(),
    currencyDisplay: currency === 'cad' ? 'symbol' : 'narrowSymbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(minor / 100);
}

export interface BandRow {
  id: BandId;
  label: string;
  currency: Currency;
  min: string;
  max: string;
  introMin: string;
  introMax: string;
}

/** Tableau des prix par marché, dans la devise de chaque marché (pages tarifs, llms.txt, CGV). */
export function bandTable(locale: string): BandRow[] {
  const lang = locale === 'en' ? 'en' : 'fr';
  return BAND_ORDER.map((id) => {
    const band = PRICE_BANDS[id];
    return {
      id,
      label: band.label[lang],
      currency: band.currency,
      min: fmtBand(band.min, band.currency, locale),
      max: fmtBand(band.max, band.currency, locale),
      introMin: fmtBand(bandIntro(band, band.min), band.currency, locale),
      introMax: fmtBand(bandIntro(band, band.max), band.currency, locale),
    };
  });
}

/** Une ligne de texte par marché, ex. « France, Belgique, Luxembourg : 2,20 € à 4,50 €/min ». */
export function bandTableText(locale: string): string[] {
  const to = locale === 'en' ? 'to' : 'à';
  const sep = locale === 'en' ? ':' : ' :';
  return bandTable(locale).map((row) => `${row.label}${sep} ${row.min} ${to} ${row.max}/min`);
}
