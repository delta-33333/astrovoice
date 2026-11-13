import { NextRequest, NextResponse } from 'next/server';
import { DEVICE_COOKIE, DEVICE_MAX_AGE } from '@/lib/free-call';
import { beginQuickTrial } from '@/lib/free-call-store';
import { honeypotTripped } from '@/lib/form-checks';
import { tooManyRequests } from '@/lib/guard';
import { parseHeardFrom } from '@/lib/heard-from';
import { isLocale, type Locale } from '@/lib/seo';
import { clientIp } from '@/lib/request-ip';
import { createSession, getSession } from '@/lib/session';
import { trackEvent } from '@/lib/events';

export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MESSAGE: Record<string, string> = {
  disabled: 'L’essai gratuit est suspendu. Les packs à prix fixe restent disponibles.',
  email: 'Un essai a déjà été utilisé sur ce compte.',
  device: 'Un essai a déjà été utilisé sur cet appareil.',
  ip: 'Un essai a déjà été utilisé depuis ce réseau.',
  paid: 'Votre compte a déjà une formule. Ouvrez votre compte.',
  cap: 'Les essais gratuits du jour sont épuisés. Revenez demain, ou choisissez un pack à prix fixe.',
  unavailable: 'L’essai gratuit n’est pas encore ouvert. Vous pouvez commencer par un pack à prix fixe.',
};

/** Essai allégé : consentement IA obligatoire, puis appel tout de suite (e-mail demandé après). */
export async function POST(request: NextRequest) {
  if (tooManyRequests(request, 'trial-quick', 3, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Trop de demandes. Réessayez dans une heure.' }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  if (honeypotTripped(body)) return NextResponse.json({ error: MESSAGE.unavailable }, { status: 400 });
  if (body?.consent !== true) {
    return NextResponse.json({ error: 'Le consentement est requis.' }, { status: 400 });
  }
  const locale: Locale = isLocale(body?.locale) ? body.locale : 'fr';
  const existing = request.cookies.get(DEVICE_COOKIE)?.value;
  const deviceId = existing && UUID_RE.test(existing) ? existing : crypto.randomUUID();
  const current = await getSession();
  const result = await beginQuickTrial({
    ip: clientIp(request),
    deviceId,
    locale,
    heardFrom: parseHeardFrom(body?.heardFrom),
    firstName: typeof body?.firstName === 'string' ? body.firstName : null,
    currentUser: current,
  }).catch(() => ({ status: 'unavailable' as const }));

  if (result.status !== 'ok') {
    const status = result.status === 'cap' ? 429 : result.status === 'disabled' ? 403 : result.status === 'unavailable' ? 503 : 400;
    return NextResponse.json({ error: MESSAGE[result.status] || MESSAGE.unavailable, code: result.status }, { status });
  }
  if (!current) {
    const opened = await createSession(result.userId);
    if (!opened) return NextResponse.json({ error: MESSAGE.unavailable }, { status: 503 });
  }
  await trackEvent({ name: 'trial_verified', userId: result.userId, metadata: { locale, quick: 'true' }, context: false });
  const response = NextResponse.json({ ok: true, trialId: result.trialId, advisorId: result.advisorId });
  if (!existing) {
    response.cookies.set(DEVICE_COOKIE, deviceId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: DEVICE_MAX_AGE,
    });
  }
  return response;
}
