import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { getUserById } from './auth';
import type { UserProfile } from './supabase';

const SESSION_COOKIE_NAME = 'lunara_session';
const USER_COOKIE_NAME = 'lunara_user';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export function authSecret(): string | null {
  const value = process.env.AUTH_SECRET?.trim() ?? '';
  if (value.length < 16) return null;
  return value;
}

function sign(body: string, secret: string): string {
  return createHmac('sha256', secret).update(body).digest('base64url');
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Cookie de session httpOnly, Secure en production, SameSite=Lax.
 * La valeur est un jeton HMAC (AUTH_SECRET), jamais l’identifiant en clair.
 * Sans AUTH_SECRET, aucune session n’est créée ni reconnue.
 */
export async function createSession(userId: string): Promise<boolean> {
  const secret = authSecret();
  if (!secret) {
    console.error('AUTH_SECRET manquant : session refusée.');
    return false;
  }

  const body = Buffer.from(JSON.stringify({
    uid: userId,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  })).toString('base64url');
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, `${body}.${sign(body, secret)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
  cookieStore.delete(USER_COOKIE_NAME);
  return true;
}

export async function getSession(): Promise<UserProfile | null> {
  const secret = authSecret();
  if (!secret) return null;

  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;

  const dot = raw.lastIndexOf('.');
  if (dot <= 0) return null;
  const body = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);
  if (!safeEqual(signature, sign(body, secret))) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as {
      uid?: string;
      exp?: number;
    };
    if (!payload.uid || typeof payload.exp !== 'number' || payload.exp <= Date.now()) return null;
    return getUserById(payload.uid);
  } catch {
    return null;
  }
}

export async function updateUserCookie(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get(USER_COOKIE_NAME);
  if (!userCookie?.value) return false;

  try {
    const existingData = JSON.parse(userCookie.value) as { id?: string; userId?: string };
    if (existingData.id !== userId && existingData.userId !== userId) return false;
    cookieStore.set(USER_COOKIE_NAME, JSON.stringify({
      ...existingData,
      ...updates,
      id: existingData.id,
      userId: existingData.userId,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });
    return true;
  } catch (error) {
    console.error('Failed to update user cookie:', error);
    return false;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(USER_COOKIE_NAME);
}
