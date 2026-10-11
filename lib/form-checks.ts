/** Validations partagées entre le navigateur et les routes, sans secret. */

export const HONEYPOT_FIELD = 'cl_hp';

const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) return null;
  return email;
}

export function passwordError(password: unknown): string | null {
  if (typeof password !== 'string' || password.length < 8) {
    return 'Le mot de passe doit contenir au moins 8 caractères';
  }
  if (password.length > 200) return 'Mot de passe trop long';
  return null;
}

export function honeypotTripped(body: unknown): boolean {
  if (!body || typeof body !== 'object') return false;
  const value = (body as Record<string, unknown>)[HONEYPOT_FIELD];
  return typeof value === 'string' && value.trim().length > 0;
}

export function birthIssue(input: {
  name?: string;
  date: string;
  time: string;
  timeUnknown: boolean;
  place: string;
}): string | null {
  if (input.name !== undefined && !input.name.trim()) return 'Le nom est requis';
  if (!DATE_RE.test(input.date)) return 'Date de naissance invalide';
  const [year, month, day] = input.date.split('-').map(Number);
  if (year < 1800 || year > 2200 || month < 1 || month > 12 || day < 1 || day > 31) {
    return 'Date de naissance invalide';
  }
  const parsed = new Date(`${input.date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.getUTCFullYear() !== year || parsed.getUTCMonth() + 1 !== month || parsed.getUTCDate() !== day) {
    return 'Date de naissance invalide';
  }
  if (!input.timeUnknown && !TIME_RE.test(input.time.slice(0, 5))) return 'Heure de naissance invalide';
  const place = input.place.trim();
  if (place.length < 2 || place.length > 160 || /[<>]/.test(place)) return 'Lieu de naissance invalide';
  return null;
}
