import { NextRequest, NextResponse } from 'next/server';
import { verifyTrial } from '@/lib/free-call-store';
import { honeypotTripped } from '@/lib/form-checks';
import { tooManyRequests } from '@/lib/guard';
import { isLocale, type Locale } from '@/lib/seo';
import { createSession } from '@/lib/session';
import { trackEvent } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (tooManyRequests(request, 'trial-verify', 12, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans quelques minutes.' }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  if (honeypotTripped(body)) return NextResponse.json({ error: 'Code incorrect.' }, { status: 400 });
  const locale: Locale = isLocale(body?.locale) ? body.locale : 'fr';
  const result = await verifyTrial({
    email: typeof body?.email === 'string' ? body.email : '',
    code: typeof body?.code === 'string' ? body.code.trim() : '',
    locale,
    firstName: typeof body?.firstName === 'string' ? body.firstName : null,
  }).catch(() => ({ status: 'unavailable' as const }));
  if (result.status !== 'ok') {
    const status = result.status === 'disabled' ? 403 : result.status === 'unavailable' ? 503 : result.status === 'cap' ? 429 : 400;
    const error = result.status === 'unavailable'
      ? 'L’essai gratuit n’est pas encore ouvert. Vous pouvez commencer par la formule Découverte.'
      : result.status === 'disabled'
        ? 'L’essai gratuit est suspendu.'
        : result.status === 'cap'
          ? 'Les essais gratuits du jour sont épuisés. Revenez demain, ou commencez à 1,99 €.'
          : 'Code incorrect ou expiré.';
    return NextResponse.json({ error, code: result.status }, { status });
  }
  const session = await createSession(result.userId);
  if (!session) return NextResponse.json({ error: 'La session n’a pas pu être ouverte.' }, { status: 503 });
  await trackEvent({ name: 'trial_verified', userId: result.userId, metadata: { locale }, context: false });
  return NextResponse.json({ ok: true, trialId: result.trialId, advisorId: result.advisorId });
}
