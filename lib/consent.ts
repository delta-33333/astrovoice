/**
 * Choix de cookies, lisible par le middleware et les routes.
 * `cl_ck` est strictement nécessaire (il mémorise le choix). Les cookies de mesure
 * `cl_vid` et `cl_ft` ne sont posés que si l’audience est acceptée.
 */
export const CONSENT_COOKIE = 'cl_ck';
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 180;

export const CONSENT_VALUES = ['all', 'essential', 'custom-on', 'custom-off'] as const;
export type ConsentValue = (typeof CONSENT_VALUES)[number];

export function parseConsent(value: string | null | undefined): ConsentValue | null {
  if (value && (CONSENT_VALUES as readonly string[]).includes(value)) return value as ConsentValue;
  return null;
}

export function analyticsAllowed(value: string | null | undefined): boolean {
  const parsed = parseConsent(value);
  return parsed === 'all' || parsed === 'custom-on';
}
