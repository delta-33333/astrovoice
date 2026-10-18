import { createHash, randomInt } from 'node:crypto';
import { normalizeEmail } from './form-checks.ts';
import { isDisposableDomain } from './disposable-domains.ts';
import type { Locale } from './seo.ts';

/** Durée coupée par le serveur. Le client ne peut pas l’allonger. */
export const FREE_CALL_SECONDS = 180;
export const FREE_CALL_CODE_TTL_MS = 10 * 60 * 1000;
export const FREE_CALL_MAX_ATTEMPTS = 5;
export const FREE_CALL_CODE_REQUESTS_PER_HOUR = 5;
export const DEVICE_COOKIE = 'ca_dev';
export const DEVICE_MAX_AGE = 60 * 60 * 24 * 400;

export const TRIAL_PATHS: Record<Locale, string> = {
  fr: '/fr/essai',
  en: '/en/free-trial',
  es: '/es/prueba',
  de: '/de/probe',
  it: '/it/prova',
};

export function trialPath(locale: Locale): string {
  return TRIAL_PATHS[locale];
}

/** Kill switch. Absent ou vrai : l’essai est ouvert. `false` / `0` / `off` le coupe. */
export function freeCallEnabled(env?: { FREE_CALL_ENABLED?: string }): boolean {
  const raw = (env?.FREE_CALL_ENABLED ?? process.env.FREE_CALL_ENABLED ?? '').trim().toLowerCase();
  if (raw === '0' || raw === 'false' || raw === 'off' || raw === 'no') return false;
  return true;
}

/** Plafond d’essais vérifiés par jour de Paris. Défaut 50. */
export function freeCallDailyCap(env?: { FREE_CALL_DAILY_CAP?: string }): number {
  const raw = (env?.FREE_CALL_DAILY_CAP ?? process.env.FREE_CALL_DAILY_CAP ?? '').trim();
  if (!raw) return 50;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return 50;
  return Math.floor(value);
}

/**
 * E-mail canonique : minuscules, alias + retiré,
 * points retirés pour gmail.com et googlemail.com.
 */
export function trialEmailNorm(value: unknown): string | null {
  const email = normalizeEmail(value);
  if (!email) return null;
  const at = email.lastIndexOf('@');
  const localRaw = email.slice(0, at);
  let domain = email.slice(at + 1);
  if (domain === 'googlemail.com') domain = 'gmail.com';
  let local = localRaw.split('+')[0] || '';
  if (!local) return null;
  if (domain === 'gmail.com') local = local.replace(/\./g, '');
  const norm = `${local}@${domain}`;
  return normalizeEmail(norm);
}

export function trialEmailDisposable(value: unknown): boolean {
  const email = normalizeEmail(value);
  if (!email) return false;
  const domain = email.slice(email.lastIndexOf('@') + 1);
  return isDisposableDomain(domain);
}

/** IPv4 /24 ou IPv6 /48. Le reste de l’adresse n’entre pas dans l’empreinte. */
export function networkKey(ip: string): string {
  const value = ip.trim().toLowerCase();
  if (value.includes(':')) {
    const parts = value.split(':').filter((part, index, all) => part.length > 0 || index === 0 || index === all.length - 1);
    const head = value.split(':').slice(0, 3).join(':');
    return head || parts.slice(0, 3).join(':') || value;
  }
  const parts = value.split('.');
  if (parts.length === 4 && parts.every((part) => /^\d{1,3}$/.test(part))) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  }
  return value.slice(0, 64) || '0.0.0.0';
}

export function hashSecret(value: string, secret: string): string {
  return createHash('sha256').update(`${secret}:${value}`).digest('hex');
}

export function hashNetwork(ip: string, secret: string): string {
  return hashSecret(networkKey(ip), secret);
}

export function hashDevice(deviceId: string, secret: string): string {
  return hashSecret(deviceId.trim().toLowerCase(), secret);
}

export function hashCode(code: string, secret: string): string {
  return hashSecret(code.replace(/\D/g, ''), secret);
}

export function randomTrialCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

export function codeStillValid(expiresAt: string | null, now = Date.now()): boolean {
  if (!expiresAt) return false;
  const time = Date.parse(expiresAt);
  return Number.isFinite(time) && time > now;
}

export type TrialBlock =
  | 'disabled'
  | 'disposable'
  | 'email'
  | 'device'
  | 'ip'
  | 'paid'
  | 'cap'
  | 'expired'
  | 'attempts'
  | 'mismatch';

export function trialStartDecision(input: {
  enabled: boolean;
  disposable: boolean;
  sameEmailExists: boolean;
  deviceUsedByOther: boolean;
  ipUsedByOther: boolean;
  alreadyPaid: boolean;
  verifiedToday: number;
  cap: number;
}): TrialBlock | 'ok' {
  if (!input.enabled) return 'disabled';
  if (input.disposable) return 'disposable';
  if (input.alreadyPaid) return 'paid';
  if (input.deviceUsedByOther) return 'device';
  if (input.ipUsedByOther) return 'ip';
  if (input.sameEmailExists) return 'email';
  if (input.verifiedToday >= input.cap) return 'cap';
  return 'ok';
}

/** Un second jeton ne reçoit que les secondes encore disponibles, jamais plus de 180. */
export function remainingTrialSeconds(input: {
  secondsUsed: number;
  tokenIssuedAt: string | null;
  now?: number;
}): number {
  const now = input.now ?? Date.now();
  let used = Math.max(0, input.secondsUsed);
  if (input.tokenIssuedAt) {
    const issued = Date.parse(input.tokenIssuedAt);
    if (Number.isFinite(issued) && issued <= now) {
      used += Math.floor((now - issued) / 1000);
    }
  }
  return Math.max(0, FREE_CALL_SECONDS - Math.min(FREE_CALL_SECONDS, used));
}

export function clampTrialSeconds(reported: number): number {
  if (!Number.isFinite(reported) || reported <= 0) return 0;
  return Math.min(FREE_CALL_SECONDS, Math.floor(reported));
}

/** Le code n’est renvoyé au client que hors production, et seulement si le drapeau est posé. */
export function echoTrialCode(env: NodeJS.ProcessEnv = process.env): boolean {
  if ((env.VERCEL_ENV || '').trim() === 'production') return false;
  const flag = (env.TRIAL_CODE_ECHO ?? '').trim().toLowerCase();
  return flag === '1' || flag === 'true';
}
