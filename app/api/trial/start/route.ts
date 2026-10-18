import { NextRequest, NextResponse } from 'next/server';
import { DEVICE_COOKIE, DEVICE_MAX_AGE, echoTrialCode, trialEmailNorm } from '@/lib/free-call';
import { beginTrial } from '@/lib/free-call-store';
import { honeypotTripped } from '@/lib/form-checks';
import { tooManyRequests } from '@/lib/guard';
import { parseHeardFrom } from '@/lib/heard-from';
import { dispatchMail, escapeHtml } from '@/lib/email';
import { isLocale, type Locale } from '@/lib/seo';
import { clientIp } from '@/lib/request-ip';
import { trackEvent } from '@/lib/events';

export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MESSAGE: Record<string, string> = {
  disabled: 'L’essai gratuit est suspendu. La 1re semaine Découverte reste disponible.',
  disposable: 'Cette adresse e-mail ne peut pas recevoir l’essai.',
  email: 'Un essai a déjà été utilisé avec cette adresse.',
  device: 'Un essai a déjà été utilisé sur cet appareil.',
  ip: 'Un essai a déjà été utilisé depuis ce réseau.',
  paid: 'Un compte a déjà une formule ou l’offre d’accueil. Ouvrez votre compte.',
  cap: 'Les essais gratuits du jour sont épuisés. Revenez demain, ou commencez à 1,99 €.',
  unavailable: 'L’essai gratuit n’est pas encore ouvert. Vous pouvez commencer par la formule Découverte.',
  mismatch: 'Indiquez un e-mail valide.',
  expired: 'Ce code n’est plus valable.',
  attempts: 'Trop de tentatives. Demandez un nouveau code.',
};

export async function POST(request: NextRequest) {
  if (tooManyRequests(request, 'trial-code', 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Trop de demandes. Réessayez dans une heure.' }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  if (honeypotTripped(body)) {
    return NextResponse.json({ error: MESSAGE.mismatch }, { status: 400 });
  }
  if (body?.consent !== true) {
    return NextResponse.json({ error: 'Le consentement est requis.' }, { status: 400 });
  }
  const locale: Locale = isLocale(body?.locale) ? body.locale : 'fr';
  const existing = request.cookies.get(DEVICE_COOKIE)?.value;
  const deviceId = existing && UUID_RE.test(existing) ? existing : crypto.randomUUID();
  const result = await beginTrial({
    email: typeof body?.email === 'string' ? body.email : '',
    ip: clientIp(request),
    deviceId,
    locale,
    heardFrom: parseHeardFrom(body?.heardFrom),
    firstName: typeof body?.firstName === 'string' ? body.firstName : null,
  }).catch(() => ({ status: 'unavailable' as const }));

  if (result.status !== 'ok') {
    const status = result.status === 'cap' ? 429 : result.status === 'disabled' ? 403 : result.status === 'unavailable' ? 503 : 400;
    return NextResponse.json({ error: MESSAGE[result.status] || MESSAGE.unavailable, code: result.status }, { status });
  }

  const code = 'code' in result ? result.code : '';
  if (code) {
    const sent = await dispatchMail({
      to: result.email,
      subject: `Votre code Callastral : ${code}`,
      html: `<p>Votre code Callastral : <strong>${escapeHtml(code)}</strong></p><p>Il est valable 10 minutes.</p>`,
    });
    if (!sent && !echoTrialCode()) {
      return NextResponse.json({ error: MESSAGE.unavailable, code: 'unavailable' }, { status: 503 });
    }
  }
  await trackEvent({ name: 'trial_code', metadata: { locale }, context: false });
  const response = NextResponse.json({
    ok: true,
    email: trialEmailNorm(result.email) || result.email,
    ...(echoTrialCode() && code ? { code } : {}),
  });
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
