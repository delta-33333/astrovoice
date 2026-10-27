import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { chatPath, chatStartIssue, isChatLocale, isChatTopic, CHAT_NEW_USERS_PER_NETWORK_PER_DAY, type ChatLocale } from '@/lib/chat';
import {
  CHAT_COOKIE,
  CHAT_COOKIE_MAX_AGE,
  currentChatUser,
  newToken,
  pickAdvisor,
  sha256,
} from '@/lib/chat-store';
import { dispatchMail } from '@/lib/email';
import { trackEvent } from '@/lib/events';
import { honeypotTripped } from '@/lib/form-checks';
import { hashNetwork, trialEmailDisposable, trialEmailNorm } from '@/lib/free-call';
import { subscribeHoroscope } from '@/lib/horoscope-subscribers';
import { loadOrComputeChart } from '@/lib/natal-store';
import { clientIp } from '@/lib/request-ip';
import { authSecret } from '@/lib/session';
import { appBaseUrl } from '@/lib/stripe';
import { getSupabaseAdmin, supabaseAvailable } from '@/lib/supabase';
import { signByFrench } from '@/lib/zodiac/signs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LOGIN_MAIL = {
  fr: { subject: 'Reprendre votre conversation Callastral', body: 'Cliquez sur ce lien pour reprendre votre conversation par message (valable 1 heure) :', cta: 'Reprendre la conversation' },
  en: { subject: 'Resume your Callastral conversation', body: 'Click this link to resume your message conversation (valid for 1 hour):', cta: 'Resume the conversation' },
  es: { subject: 'Retoma tu conversación Callastral', body: 'Haz clic en este enlace para retomar tu conversación (válido 1 hora):', cta: 'Retomar la conversación' },
  de: { subject: 'Setze dein Callastral-Gespräch fort', body: 'Klicke auf diesen Link, um dein Gespräch fortzusetzen (1 Stunde gültig):', cta: 'Gespräch fortsetzen' },
  it: { subject: 'Riprendi la tua conversazione Callastral', body: 'Clicca su questo link per riprendere la conversazione (valido 1 ora):', cta: 'Riprendi la conversazione' },
} as const;

export async function POST(request: NextRequest) {
  if (!supabaseAvailable) return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  const body = await request.json().catch(() => null);
  if (!body || honeypotTripped(body)) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const locale: ChatLocale = isChatLocale(body.locale) ? body.locale : 'fr';
  const timeUnknown = body.timeUnknown === true;
  const issue = chatStartIssue({ ...body, timeUnknown });
  if (issue) return NextResponse.json({ error: 'invalid', field: issue }, { status: 400 });
  const email = String(body.email).trim().toLowerCase();
  const emailNorm = trialEmailNorm(email);
  if (!emailNorm || trialEmailDisposable(email)) return NextResponse.json({ error: 'invalid', field: 'email' }, { status: 400 });
  const secret = authSecret() || 'callastral-chat';
  const admin = getSupabaseAdmin();

  const existing = await admin.from('chat_users').select('id, locale').eq('email_norm', emailNorm).maybeSingle();
  if (existing.error) return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  if (existing.data) {
    const current = await currentChatUser();
    if (current?.id === existing.data.id) return NextResponse.json({ status: 'ok', resumed: true });
    // Adresse déjà connue : lien de reprise par e-mail (pas d’accès sans preuve de l’adresse).
    const token = newToken();
    await admin
      .from('chat_users')
      .update({ login_hash: sha256(token), login_expires_at: new Date(Date.now() + 3600_000).toISOString() })
      .eq('id', existing.data.id);
    const url = `${appBaseUrl(request.nextUrl.origin)}/api/chat/login?token=${encodeURIComponent(token)}`;
    const copy = LOGIN_MAIL[locale];
    await dispatchMail({
      to: email,
      subject: copy.subject,
      html: `<p>${copy.body}</p><p><a href="${url}">${copy.cta}</a></p>`,
    });
    return NextResponse.json({ status: 'check_email' });
  }

  const ipHash = hashNetwork(clientIp(request), secret);
  const since = new Date(Date.now() - 86400_000).toISOString();
  const recent = await admin
    .from('chat_users')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', since);
  if ((recent.count ?? 0) >= CHAT_NEW_USERS_PER_NETWORK_PER_DAY) {
    return NextResponse.json({ error: 'limited' }, { status: 429 });
  }

  const birthTime = timeUnknown ? null : String(body.birthTime);
  let chartSummary = '';
  let sunSign: string | null = null;
  try {
    const chart = await loadOrComputeChart({
      date: body.birthDate,
      time: birthTime ?? undefined,
      timeUnknown,
      place: String(body.birthPlace).trim(),
    });
    chartSummary = `${chart.summary}\n${chart.voiceSummary}`;
    sunSign = chart.sunSign;
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    console.warn('Chat thème:', message);
    return NextResponse.json({ error: 'invalid', field: 'birthPlace' }, { status: 400 });
  }

  const topic = isChatTopic(body.topic) ? body.topic : 'other';
  const advisorId = await pickAdvisor(locale, topic, emailNorm);
  const session = newToken();
  const inserted = await admin
    .from('chat_users')
    .insert({
      email,
      email_norm: emailNorm,
      first_name: String(body.firstName).trim().slice(0, 60),
      birth_date: body.birthDate,
      birth_time: birthTime,
      birth_time_unknown: timeUnknown,
      birth_place: String(body.birthPlace).trim().slice(0, 120),
      topic,
      locale,
      advisor_id: advisorId,
      chart_summary: chartSummary,
      sun_sign: sunSign,
      session_hash: sha256(session),
      ip_hash: ipHash,
      horoscope_optin: body.horoscopeOptin === true,
    })
    .select('id')
    .single();
  if (inserted.error || !inserted.data) {
    console.warn('Chat inscription:', inserted.error?.message);
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }

  const jar = await cookies();
  jar.set(CHAT_COOKIE, session, {
    httpOnly: true,
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
    path: '/',
    maxAge: CHAT_COOKIE_MAX_AGE,
  });

  await trackEvent({ name: 'chat_email', advisorId, metadata: { topic, locale, chatUserId: inserted.data.id } });

  if (body.horoscopeOptin === true && sunSign) {
    const sign = signByFrench(sunSign);
    if (sign) {
      await subscribeHoroscope({
        email,
        locale,
        sign,
        birthDate: body.birthDate,
        consent: true,
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        placement: 'chat',
      }).catch(() => undefined);
    }
  }

  return NextResponse.json({ status: 'ok', path: chatPath(locale) });
}
