/** Programme d’affiliation : logique pure (testable sans serveur). */
export const REF_COOKIE = 'cl_ref';
export const REF_MAX_AGE = 60 * 60 * 24 * 30;
export const COMMISSION_RATE = 0.3;

export type AffLocale = 'fr' | 'en' | 'es' | 'de' | 'it';

export const AFFILIATE_PATHS: Record<AffLocale, string> = {
  fr: '/fr/affiliation',
  en: '/en/affiliate',
  es: '/es/afiliados',
  de: '/de/partnerprogramm',
  it: '/it/affiliazione',
};

export function affiliatePath(locale: AffLocale): string {
  return AFFILIATE_PATHS[locale];
}

export function validRefCode(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const code = value.trim().toUpperCase();
  return /^[A-Z0-9]{4,16}$/.test(code) ? code : null;
}

/** Code lisible : 4 lettres du nom + 4 caractères aléatoires (sans 0/O/1/I). */
export function makeRefCode(name: string, random: () => number = Math.random): string {
  const base = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 4)
    .padEnd(4, 'X');
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i += 1) suffix += alphabet[Math.floor(random() * alphabet.length) % alphabet.length];
  return `${base}${suffix}`;
}

export function commissionCents(amountCents: number, rate = COMMISSION_RATE): number {
  if (!Number.isFinite(amountCents) || amountCents <= 0) return 0;
  return Math.round(amountCents * rate);
}

export function cleanHandle(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const handle = value.trim().replace(/\s+/g, ' ');
  if (handle.length < 2 || handle.length > 120 || /[<>"]/.test(handle)) return null;
  return handle;
}

export function cleanName(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const name = value.trim().replace(/\s+/g, ' ');
  if (name.length < 2 || name.length > 80 || /[<>"]/.test(name)) return null;
  return name;
}
