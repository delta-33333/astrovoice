import { NextRequest, NextResponse } from 'next/server';
import { finishTrial } from '@/lib/free-call-store';
import { queueMails, sendDueMails } from '@/lib/mail-schedule';
import { trialFollowupMails } from '@/lib/sequences';
import { getSession } from '@/lib/session';
import { authSecret } from '@/lib/session';
import { appBaseUrl } from '@/lib/stripe';
import { isLocale, type Locale } from '@/lib/seo';
import { signOptOut } from '@/lib/checkout-reminder-copy';
import { discoveryHeadline } from '@/lib/book-funnel';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const trialId = typeof body?.trialId === 'string' ? body.trialId : '';
  const seconds = typeof body?.seconds === 'number' ? body.seconds : 0;
  const lines = Array.isArray(body?.lines)
    ? body.lines
        .filter((line: unknown) => line && typeof line === 'object')
        .slice(0, 40)
        .map((line: { role?: string; text?: string }) => ({
          role: line.role === 'advisor' ? 'advisor' as const : 'user' as const,
          text: typeof line.text === 'string' ? line.text.slice(0, 500) : '',
        }))
        .filter((line: { text: string }) => line.text)
    : [];
  const finished = await finishTrial({ trialId, userId: user.id, seconds, lines });
  if (!finished) return NextResponse.json({ error: 'Essai introuvable' }, { status: 404 });
  const locale: Locale = isLocale(body?.locale) ? body.locale : 'fr';
  const secret = authSecret();
  const origin = appBaseUrl();
  const advisor = finished.advisorId || '';
  const resumeUrl = `${origin}/book?offer=decouverte&advisor=${encodeURIComponent(advisor)}&utm_source=trial`;
  const unsubscribeUrl = secret
    ? `${origin}/api/email/unsubscribe?token=${encodeURIComponent(signOptOut(user.id, secret))}&lang=${locale}`
    : `${origin}/account`;
  const mails = trialFollowupMails({
    locale,
    advisorName: typeof body?.advisorName === 'string' ? body.advisorName.slice(0, 80) : 'Callastral',
    summary: finished.summary,
    resumeUrl,
    unsubscribeUrl,
  });
  const email = user.email || user.username || '';
  if (email.includes('@')) {
    await queueMails({ userId: user.id, email, mails });
    await sendDueMails();
  }
  return NextResponse.json({
    ok: true,
    summary: finished.summary,
    offer: discoveryHeadline(locale, 'eur'),
    resumeUrl,
  });
}
