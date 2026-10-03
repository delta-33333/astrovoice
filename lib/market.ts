import 'server-only';

import { cookies, headers } from 'next/headers';
import {
  DEFAULT_RATES,
  isAdvisorLang,
  isCurrency,
  type AdvisorLang,
  type Currency,
  type FxRates,
} from './money';

export const MARKET_COOKIE = 'callastral_market';

const EUROZONE = new Set([
  'AT', 'BE', 'CY', 'DE', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'IE', 'IT',
  'LT', 'LU', 'LV', 'MT', 'NL', 'PT', 'SI', 'SK',
]);

/** Pays de l’UE hors zone euro, et micro-États qui utilisent l’euro : affichage en euros. */
const EURO_DISPLAY = new Set([
  'BG', 'CZ', 'DK', 'HU', 'PL', 'RO', 'SE', 'MC', 'AD', 'SM', 'VA', 'ME', 'XK',
]);

const MULTILINGUAL = new Set(['BE', 'CH', 'CA', 'LU']);

export interface Market {
  language: AdvisorLang;
  currency: Currency;
  rates: FxRates;
  country: string | null;
}

function positiveRate(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0 || value > 100000) return fallback;
  return value;
}

/** Taux EUR → devise. Surcharge possible via FX_EUR_USD, FX_EUR_GBP, FX_EUR_JPY, FX_EUR_CHF, FX_EUR_CAD. */
export function readRates(): FxRates {
  return {
    eur: 1,
    usd: positiveRate('FX_EUR_USD', DEFAULT_RATES.usd),
    gbp: positiveRate('FX_EUR_GBP', DEFAULT_RATES.gbp),
    jpy: positiveRate('FX_EUR_JPY', DEFAULT_RATES.jpy),
    chf: positiveRate('FX_EUR_CHF', DEFAULT_RATES.chf),
    cad: positiveRate('FX_EUR_CAD', DEFAULT_RATES.cad),
  };
}

export function currencyForCountry(country: string | null): Currency {
  const code = (country || '').toUpperCase();
  // Pays inconnu (pas d’en-tête géo) : euro, la devise de référence du site.
  if (!code || code === 'XX' || EUROZONE.has(code) || EURO_DISPLAY.has(code)) return 'eur';
  if (code === 'GB') return 'gbp';
  if (code === 'JP') return 'jpy';
  if (code === 'CH') return 'chf';
  if (code === 'CA') return 'cad';
  return 'usd';
}

function languageFromCountry(country: string): AdvisorLang | null {
  const code = country.toUpperCase();
  if (code === 'FR' || code === 'BE' || code === 'LU' || code === 'MC') return 'fr';
  if (code === 'DE' || code === 'AT') return 'de';
  if (['ES', 'MX', 'AR', 'CL', 'CO', 'PE', 'UY'].includes(code)) return 'es';
  if (code === 'IT') return 'it';
  if (['GB', 'US', 'IE', 'AU', 'NZ', 'CA'].includes(code)) return 'en';
  return null;
}

function languageFromAccept(header: string | null): AdvisorLang | null {
  if (!header) return null;
  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const qParam = params.find((item) => item.trim().startsWith('q='));
      const q = qParam ? Number(qParam.trim().slice(2)) : 1;
      return { tag: tag.toLowerCase(), q: Number.isFinite(q) ? q : 0 };
    })
    .filter((item) => item.tag)
    .sort((a, b) => b.q - a.q);
  for (const item of ranked) {
    const base = item.tag.slice(0, 2);
    if (isAdvisorLang(base)) return base;
  }
  return null;
}

function parseCookie(value: string | undefined): { language: AdvisorLang; currency: Currency } | null {
  if (!value) return null;
  const [language, currency] = value.split('.');
  if (!language || !currency || !isAdvisorLang(language) || !isCurrency(currency)) return null;
  return { language, currency };
}

export async function resolveMarket(): Promise<Market> {
  const jar = await cookies();
  const hdrs = await headers();
  const country = hdrs.get('x-vercel-ip-country');
  const saved = parseCookie(jar.get(MARKET_COOKIE)?.value);
  const rates = readRates();
  if (saved) {
    return { ...saved, rates, country };
  }

  const code = (country || '').toUpperCase();
  const fromAccept = languageFromAccept(hdrs.get('accept-language'));
  const fromCountry = code ? languageFromCountry(code) : null;
  let language: AdvisorLang;
  if (MULTILINGUAL.has(code) && fromAccept) language = fromAccept;
  else if (fromCountry) language = fromCountry;
  else if (fromAccept) language = fromAccept;
  else language = EUROZONE.has(code) ? 'fr' : 'en';

  return {
    language,
    currency: currencyForCountry(country),
    rates,
    country,
  };
}

export function marketCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  };
}
