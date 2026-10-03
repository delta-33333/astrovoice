import type { Currency } from './money';

/** Catalogue des offres, en centimes d’euro. L’affichage convertit via lib/money. */

export const SUBSCRIPTION_NAME = 'Callastral Illimité';
export const SUBSCRIPTION_EUR_CENTS = 4900;
export const SUBSCRIPTION_FAIR_USE_MINUTES = 300;
export const SUBSCRIPTION_MAX_CALL_MINUTES = 60;
export const SUBSCRIPTION_FAIR_USE_SECONDS = SUBSCRIPTION_FAIR_USE_MINUTES * 60;
export const SUBSCRIPTION_MAX_CALL_SECONDS = SUBSCRIPTION_MAX_CALL_MINUTES * 60;

export const NATAL_REPORT_EUR_CENTS = 990;
export const FORECAST_REPORT_EUR_CENTS = 1490;
export const COMPATIBILITY_REPORT_EUR_CENTS = 790;
export const FORECAST_YEARS = [2026, 2027] as const;

export const REBOOK_PERCENT = 15;
export const REBOOK_DAYS = 30;

export const REPORT_KINDS = ['natal_pdf', 'forecast', 'compatibility'] as const;
export type ReportKind = (typeof REPORT_KINDS)[number];

export const SUBSCRIPTION_CURRENCIES = ['eur', 'usd', 'gbp', 'jpy'] as const;
export type SubscriptionCurrency = (typeof SUBSCRIPTION_CURRENCIES)[number];

export function isReportKind(value: string): value is ReportKind {
  return (REPORT_KINDS as readonly string[]).includes(value);
}

export function reportEurCents(kind: ReportKind): number {
  if (kind === 'natal_pdf') return NATAL_REPORT_EUR_CENTS;
  if (kind === 'forecast') return FORECAST_REPORT_EUR_CENTS;
  return COMPATIBILITY_REPORT_EUR_CENTS;
}

export function reportTitle(kind: string): string {
  if (kind === 'natal_pdf') return 'Thème natal';
  if (kind === 'forecast') return 'Prévision 2026 et 2027';
  if (kind === 'compatibility') return 'Lecture de compatibilité';
  if (kind === 'summary') return 'Résumé écrit';
  return 'Rapport';
}

/** L’abonnement Stripe n’est proposé qu’en EUR, USD, GBP et JPY. */
export function subscriptionCurrency(currency: Currency): SubscriptionCurrency {
  if (currency === 'usd' || currency === 'gbp' || currency === 'jpy') return currency;
  if (currency === 'cad') return 'usd';
  return 'eur';
}

export function subscriptionLookupKey(currency: SubscriptionCurrency): string {
  return `callastral_unlimited_${currency}`;
}
