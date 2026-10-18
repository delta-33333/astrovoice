import 'server-only';
import { dispatchBatch, dispatchMail } from './email';
import { isMissingRelation } from './missing-relation';
import {
  cleanUtm,
  confirmMail,
  consentGiven,
  dailyIssue,
  isMorningSign,
  issueKey,
  morningBookPath,
  morningMail,
  MORNING_SIGNS,
  parisDay,
  personalLine,
  readHoroscopeToken,
  signHoroscopeToken,
  subscriberSource,
  type DailyIssue,
} from './morning-horoscope';
import { privacyPath } from './privacy-copy';
import { freeCallEnabled, trialPath } from './free-call';
import { horoscopeWelcomeMail, morningPromo } from './sequences';
import { isLocale, type Locale } from './seo';
import { authSecret } from './session';
import { appBaseUrl } from './stripe';
import { getSupabaseAdmin, supabaseAvailable } from './supabase';

export interface SubscribeInput {
  email: string;
  locale: Locale;
  sign: string;
  birthDate: string | null;
  consent: unknown;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  placement: string;
  heardFrom?: string | null;
}

export async function subscribeHoroscope(input: SubscribeInput): Promise<'ok' | 'consent' | 'invalid' | 'unavailable'> {
  if (!consentGiven(input.consent)) return 'consent';
  if (!isLocale(input.locale) || !isMorningSign(input.sign)) return 'invalid';
  if (!supabaseAvailable) return 'unavailable';
  const secret = authSecret();
  if (!secret) return 'unavailable';
  const birth = input.birthDate && /^\d{4}-\d{2}-\d{2}$/.test(input.birthDate) ? input.birthDate : null;
  const source = subscriberSource({
    utmSource: cleanUtm(input.utmSource),
    utmMedium: cleanUtm(input.utmMedium),
    utmCampaign: cleanUtm(input.utmCampaign),
    placement: input.placement || 'widget',
  });
  const admin = getSupabaseAdmin();
  const existing = await admin.from('horoscope_subscribers').select('id, status').eq('email', input.email).maybeSingle();
  if (existing.error) {
    if (isMissingRelation(existing.error)) return 'unavailable';
    console.warn('Horoscope:', existing.error.message);
    return 'unavailable';
  }
  const now = new Date().toISOString();
  let id = existing.data?.id as string | undefined;
  if (id) {
    const updated = await admin
      .from('horoscope_subscribers')
      .update({
        locale: input.locale,
        sign: input.sign,
        birth_date: birth,
        utm_source: source.utm_source,
        utm_medium: source.utm_medium,
        utm_campaign: source.utm_campaign,
        consent_at: now,
        status: existing.data?.status === 'unsubscribed' ? 'pending' : existing.data?.status,
      })
      .eq('id', id);
    if (updated.error) return 'unavailable';
    if (input.heardFrom) {
      const extra = await admin.from('horoscope_subscribers').update({ heard_from: input.heardFrom }).eq('id', id);
      if (extra.error && !isMissingRelation(extra.error)) console.warn('Horoscope source:', extra.error.message);
    }
    if (existing.data?.status === 'confirmed') return 'ok';
  } else {
    const inserted = await admin
      .from('horoscope_subscribers')
      .insert({
        email: input.email,
        locale: input.locale,
        sign: input.sign,
        birth_date: birth,
        utm_source: source.utm_source,
        utm_medium: source.utm_medium,
        utm_campaign: source.utm_campaign,
        status: 'pending',
        consent_at: now,
      })
      .select('id')
      .single();
    if (inserted.error || !inserted.data) {
      if (!isMissingRelation(inserted.error)) console.warn('Horoscope:', inserted.error?.message);
      return 'unavailable';
    }
    id = inserted.data.id as string;
    if (input.heardFrom) {
      const extra = await admin.from('horoscope_subscribers').update({ heard_from: input.heardFrom }).eq('id', id);
      if (extra.error && !isMissingRelation(extra.error)) console.warn('Horoscope source:', extra.error.message);
    }
  }
  const origin = appBaseUrl();
  const token = signHoroscopeToken(id, 'confirm', secret);
  const url = `${origin}/api/horoscope/confirm?token=${encodeURIComponent(token)}&lang=${input.locale}`;
  const mail = confirmMail(input.locale, url);
  const sent = await dispatchMail({ to: input.email, subject: mail.subject, html: mail.html });
  return sent ? 'ok' : 'unavailable';
}

export async function confirmHoroscope(token: string): Promise<boolean> {
  const secret = authSecret();
  if (!secret || !supabaseAvailable) return false;
  const id = readHoroscopeToken(token, 'confirm', secret);
  if (!id) return false;
  const admin = getSupabaseAdmin();
  const before = await admin.from('horoscope_subscribers').select('id, email, locale, status').eq('id', id).maybeSingle();
  if (before.error || !before.data || before.data.status === 'unsubscribed') return false;
  const { error } = await admin
    .from('horoscope_subscribers')
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
    .eq('id', id)
    .neq('status', 'unsubscribed');
  if (error) return false;
  if (before.data.status !== 'confirmed' && typeof before.data.email === 'string' && isLocale(before.data.locale)) {
    const locale = before.data.locale;
    const unsub = signHoroscopeToken(id, 'unsubscribe', secret);
    const mail = horoscopeWelcomeMail({
      locale,
      trialUrl: `${appBaseUrl()}${trialPath(locale)}`,
      unsubscribeUrl: `${appBaseUrl()}/api/horoscope/unsubscribe?token=${encodeURIComponent(unsub)}&lang=${locale}`,
    });
    await dispatchMail({ to: before.data.email, subject: mail.subject, html: mail.html });
  }
  return true;
}

export async function unsubscribeHoroscope(token: string): Promise<boolean> {
  const secret = authSecret();
  if (!secret || !supabaseAvailable) return false;
  const id = readHoroscopeToken(token, 'unsubscribe', secret);
  if (!id) return false;
  const { error } = await getSupabaseAdmin()
    .from('horoscope_subscribers')
    .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
    .eq('id', id);
  return !error;
}

export async function attachHoroscopeSubscriber(userId: string, email: string): Promise<void> {
  if (!supabaseAvailable || !userId || !email) return;
  const { error } = await getSupabaseAdmin()
    .from('horoscope_subscribers')
    .update({ user_id: userId })
    .eq('email', email.toLowerCase())
    .is('user_id', null);
  if (error && !isMissingRelation(error)) console.warn('Horoscope compte:', error.message);
}

interface SubscriberRow {
  id: string;
  email: string;
  locale: string;
  sign: string;
  birth_date: string | null;
  confirmed_at?: string | null;
}

export async function sendMorningHoroscopes(now = new Date()): Promise<{ issues: number; sent: number }> {
  if (!supabaseAvailable) return { issues: 0, sent: 0 };
  const day = parisDay(now);
  const admin = getSupabaseAdmin();
  const cache = new Map<string, DailyIssue>();
  let issues = 0;
  for (const locale of ['fr', 'en', 'es', 'de', 'it'] as const) {
    for (const sign of MORNING_SIGNS) {
      const issue = dailyIssue(locale, sign, now);
      cache.set(issueKey(day, locale, sign), issue);
      const saved = await admin.from('horoscope_issues').upsert(
        { day, locale, sign, subject: issue.subject, body: issue.paragraphs.join('\n\n') },
        { onConflict: 'day,locale,sign' }
      );
      if (saved.error) {
        if (!isMissingRelation(saved.error)) console.warn('Horoscope cache:', saved.error.message);
      } else {
        issues += 1;
      }
    }
  }

  const secret = authSecret();
  if (!secret) return { issues, sent: 0 };
  const rows = await admin
    .from('horoscope_subscribers')
    .select('id, email, locale, sign, birth_date, confirmed_at')
    .eq('status', 'confirmed')
    .or(`last_sent_on.is.null,last_sent_on.lt.${day}`);
  if (rows.error) {
    if (!isMissingRelation(rows.error)) console.warn('Horoscope envoi:', rows.error.message);
    return { issues, sent: 0 };
  }
  const origin = appBaseUrl();
  const pending: Array<{ id: string; mail: { to: string; subject: string; html: string; headers: Record<string, string> } }> = [];
  for (const row of (rows.data ?? []) as SubscriberRow[]) {
    if (!isLocale(row.locale) || !isMorningSign(row.sign)) continue;
    const issue = cache.get(issueKey(day, row.locale, row.sign)) ?? dailyIssue(row.locale, row.sign, now);
    const token = signHoroscopeToken(row.id, 'unsubscribe', secret);
    const confirmedAt = row.confirmed_at ? Date.parse(row.confirmed_at) : NaN;
    const days = Number.isFinite(confirmedAt) ? Math.floor((now.getTime() - confirmedAt) / 86_400_000) : null;
    const promo = morningPromo({
      locale: row.locale,
      daysSinceConfirm: days,
      freeCall: freeCallEnabled(),
      origin,
    });
    const mail = morningMail({
      locale: row.locale,
      subject: issue.subject,
      paragraphs: issue.paragraphs,
      personal: personalLine(row.locale, row.birth_date, now),
      bookUrl: `${origin}${morningBookPath()}`,
      unsubscribeUrl: `${origin}/api/horoscope/unsubscribe?token=${encodeURIComponent(token)}&lang=${row.locale}`,
      privacyUrl: `${origin}${privacyPath(row.locale)}`,
      ctaLabel: promo?.label,
      ctaUrl: promo?.url,
    });
    pending.push({ id: row.id, mail: { to: row.email, ...mail } });
  }
  const sentCount = await dispatchBatch(pending.map((item) => item.mail));
  const sentIds = pending.slice(0, sentCount).map((item) => item.id);
  if (sentIds.length) {
    const marked = await admin.from('horoscope_subscribers').update({ last_sent_on: day }).in('id', sentIds);
    if (marked.error && !isMissingRelation(marked.error)) console.warn('Horoscope marque:', marked.error.message);
  }
  return { issues, sent: sentCount };
}
