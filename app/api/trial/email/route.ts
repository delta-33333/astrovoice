import { NextRequest, NextResponse } from 'next/server';
import { confirmTrialEmail, requestTrialEmail } from '@/lib/free-call-store';
import { echoTrialCode } from '@/lib/free-call';
import { dispatchMail, escapeHtml } from '@/lib/email';
import { honeypotTripped } from '@/lib/form-checks';
import { tooManyRequests } from '@/lib/guard';
import { queueMails, sendDueMails } from '@/lib/mail-schedule';
import { trialFollowupMails } from '@/lib/sequences';
import { authSecret, getSession } from '@/lib/session';
import { appBaseUrl } from '@/lib/stripe';
import { isLocale, type Locale } from '@/lib/seo';
import { signOptOut } from '@/lib/checkout-reminder-copy';

export const dynamic = 'force-dynamic';

const MESSAGE: Record<string, string> = {
  mismatch: 'Indiquez un e-mail valide.',
  disposable: 'Cette adresse e-mail ne peut pas être utilisée.',
  email: 'Un essai a déjà été utilisé avec cette adresse.',
  exists: 'Un compte existe déjà avec cet e-mail. Connectez-vous pour le retrouver.',
  expired: 'Ce code n’est plus valable.',
  attempts: 'Trop de tentatives. Demandez un nouveau code.',
  unavailable: 'Indisponible pour le moment. Réessayez dans un instant.',
};

/**
 * Après un essai lancé sans e-mail : { email } envoie un code, { code } le vérifie
 * et rattache l’e-mail au compte (résumé + suite par e-mail).
 */
export async function POST(request: NextRequest) {
  if (tooManyRequests(request, 'trial-email', 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Trop de demandes. Réessayez plus tard.' }, { status: 429 });
  }
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (honeypotTripped(body)) return NextResponse.json({ error: MESSAGE.mismatch }, { status: 400 });
  const locale: Locale = isLocale(body?.locale) ? body.locale : 'fr';

  if (typeof body?.code === 'string') {
    const result = await confirmTrialEmail({ userId: user.id, code: body.code.trim() }).catch(() => ({ status: 'unavailable' as const }));
    if (result.status !== 'ok') {
      const error = result.status === 'mismatch' ? 'Code incorrect ou expiré.' : MESSAGE[result.status] || MESSAGE.unavailable;
      return NextResponse.json({ error, code: result.status }, { status: result.status === 'unavailable' ? 503 : 400 });
    }
    const secret = authSecret();
    const origin = appBaseUrl();
    const resumeUrl = `${origin}/packs?pack=20min&lang=${locale === 'en' ? 'en' : 'fr'}&advisor=${encodeURIComponent(result.advisorId || '')}&utm_source=trial`;
    const unsubscribeUrl = secret
      ? `${origin}/api/email/unsubscribe?token=${encodeURIComponent(signOptOut(user.id, secret))}&lang=${locale}`
      : `${origin}/account`;
    if (result.summary) {
      const mails = trialFollowupMails({
        locale,
        advisorName: 'Callastral',
        summary: result.summary,
        resumeUrl,
        unsubscribeUrl,
      });
      await queueMails({ userId: user.id, email: result.email, mails }).catch(() => undefined);
      await sendDueMails().catch(() => undefined);
    }
    return NextResponse.json({ ok: true, email: result.email });
  }

  const result = await requestTrialEmail({ userId: user.id, email: typeof body?.email === 'string' ? body.email : '' }).catch(() => ({ status: 'unavailable' as const }));
  if (result.status !== 'ok') {
    return NextResponse.json({ error: MESSAGE[result.status] || MESSAGE.unavailable, code: result.status }, { status: result.status === 'unavailable' ? 503 : 400 });
  }
  const sent = await dispatchMail({
    to: result.email,
    subject: `Votre code Callastral : ${result.code}`,
    html: `<p>Votre code Callastral : <strong>${escapeHtml(result.code)}</strong></p><p>Il est valable 10 minutes.</p>`,
  });
  if (!sent && !echoTrialCode()) return NextResponse.json({ error: MESSAGE.unavailable }, { status: 503 });
  return NextResponse.json({ ok: true, email: result.email, ...(echoTrialCode() ? { code: result.code } : {}) });
}
