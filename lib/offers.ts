/** Catalogue des rapports, en centimes d’euro. L’affichage convertit via lib/money. Les formules hebdomadaires sont dans lib/weekly.ts. */

export const NATAL_REPORT_EUR_CENTS = 990;
export const FORECAST_REPORT_EUR_CENTS = 1490;
export const COMPATIBILITY_REPORT_EUR_CENTS = 790;
export const FORECAST_YEARS = [2026, 2027] as const;

export const REBOOK_PERCENT = 15;
export const REBOOK_DAYS = 30;

export const REPORT_KINDS = ['natal_pdf', 'forecast', 'compatibility'] as const;
export type ReportKind = (typeof REPORT_KINDS)[number];

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

