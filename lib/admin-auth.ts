import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

export const ADMIN_EMAIL = 'ju.descostes@gmail.com';
const COOKIE = 'callastral_admin';
const MAX_AGE = 12 * 60 * 60;

export function adminConfigured(): boolean {
  const hash = process.env.ADMIN_PASSWORD_HASH?.trim() ?? '';
  return hash.length > 0 && !hash.includes('placeholder');
}

function secret(): string {
  return (process.env.ADMIN_PASSWORD_HASH || '').trim();
}

export async function adminAuthenticated(): Promise<boolean> {
  if (!adminConfigured()) return false;
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return false;
  const dot = raw.lastIndexOf('.');
  if (dot <= 0) return false;
  const body = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  const expected = createHmac('sha256', secret()).update(body).digest('base64url');
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as {
      email?: string;
      exp?: number;
    };
    return payload.email === ADMIN_EMAIL && typeof payload.exp === 'number' && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export async function requireAdmin(): Promise<void> {
  if (!adminConfigured() || !(await adminAuthenticated())) {
    redirect('/admin/login');
  }
}

export async function openAdminSession(): Promise<void> {
  const body = Buffer.from(JSON.stringify({
    email: ADMIN_EMAIL,
    exp: Date.now() + MAX_AGE * 1000,
  })).toString('base64url');
  const sig = createHmac('sha256', secret()).update(body).digest('base64url');
  const jar = await cookies();
  jar.set(COOKIE, `${body}.${sig}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function closeAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}

export async function checkAdminPassword(email: string, password: string): Promise<'disabled' | 'refused' | 'ok'> {
  if (!adminConfigured()) return 'disabled';
  if (email.trim().toLowerCase() !== ADMIN_EMAIL) return 'refused';
  try {
    const match = await bcrypt.compare(password, secret());
    return match ? 'ok' : 'refused';
  } catch {
    return 'disabled';
  }
}
