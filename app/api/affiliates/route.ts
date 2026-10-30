import { NextRequest, NextResponse } from 'next/server';
import { AFFILIATE_PATHS, cleanHandle, cleanName, makeRefCode, type AffLocale } from '@/lib/affiliate';
import { honeypotTripped, normalizeEmail } from '@/lib/form-checks';
import { clientIp } from '@/lib/rate-limit';
import { localeHomePath } from '@/lib/seo';
import { appBaseUrl } from '@/lib/stripe';
import { getSupabaseAdmin, supabaseAvailable } from '@/lib/supabase';
import { sendMail } from '@/lib/email';
import { AFFILIATE_CONTACT, AFFILIATE_EXTRA, affiliateStatsPath } from '@/lib/affiliate-extra-copy';

const esc = (value: string) => value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

async function sendWelcome(input: { to: string; name: string; code: string; link: string; statsUrl: string; locale: AffLocale }) {
  const m = AFFILIATE_EXTRA[input.locale].mail;
  const html = `<p>${esc(m.hello)} ${esc(input.name)},</p><p>${esc(m.intro)}</p>
<p><strong>${esc(m.link)} :</strong> <a href="${esc(input.link)}">${esc(input.link)}</a><br/><strong>${esc(m.code)} :</strong> ${esc(input.code)}</p>
<p><a href="${esc(input.statsUrl)}">${esc(m.stats)}</a></p><p>${esc(m.payout)}</p><p>${esc(m.rules)}</p><p>${esc(m.sign)}</p>`;
  const ok = await sendMail({ to: input.to, subject: m.subject, html, from: 'Julien de Callastral <julien@callastral.com>', replyTo: AFFILIATE_CONTACT });
  if (!ok) console.warn('Affiliation : e-mail de bienvenue non envoyé');
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };
const hits = new Map<string, number[]>();

function tooMany(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((at) => now - at < 3_600_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 4000) {
    const first = hits.keys().next().value;
    if (first) hits.delete(first);
  }
  return recent.length > 8;
}

/** Inscription créateur au programme d’affiliation (écriture service role uniquement). */
export async function POST(request: NextRequest) {
  if (tooMany(clientIp(request))) return NextResponse.json({ error: 'RATE' }, { status: 429, headers: NO_STORE });
  const body = await request.json().catch(() => null);
  if (!body || honeypotTripped(body)) return NextResponse.json({ error: 'FAIL' }, { status: 400, headers: NO_STORE });
  const name = cleanName(body.name);
  const email = normalizeEmail(body.email);
  const handle = cleanHandle(body.social);
  const payoutRaw = typeof body.payout === 'string' ? body.payout.trim().replace(/\s+/g, ' ') : '';
  if (payoutRaw.length > 200 || /[<>"]/.test(payoutRaw)) return NextResponse.json({ error: 'FAIL' }, { status: 400, headers: NO_STORE });
  const payout = payoutRaw || null;
  const locale: AffLocale = typeof body.locale === 'string' && body.locale in AFFILIATE_PATHS ? (body.locale as AffLocale) : 'fr';
  if (!name) return NextResponse.json({ error: 'NAME' }, { status: 400, headers: NO_STORE });
  if (!email || email.length > 160) return NextResponse.json({ error: 'EMAIL' }, { status: 400, headers: NO_STORE });
  if (!handle) return NextResponse.json({ error: 'SOCIAL' }, { status: 400, headers: NO_STORE });
  if (body.accept !== true) return NextResponse.json({ error: 'TERMS' }, { status: 400, headers: NO_STORE });
  if (!supabaseAvailable) return NextResponse.json({ error: 'FAIL' }, { status: 503, headers: NO_STORE });

  const admin = getSupabaseAdmin();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = makeRefCode(name);
    const { error } = await admin.from('affiliates').insert({ code, name, email, social_handle: handle, locale, payout_details: payout });
    if (!error) {
      const base = appBaseUrl(request.nextUrl.origin);
      const link = `${base}${localeHomePath(locale)}?ref=${code}`;
      await sendWelcome({ to: email, name, code, link, statsUrl: `${base}${affiliateStatsPath(locale)}`, locale });
      return NextResponse.json({ code, link }, { headers: NO_STORE });
    }
    if (error.code === '23505' && /email/i.test(error.message + (error.details ?? ''))) {
      return NextResponse.json({ error: 'EXISTS' }, { status: 409, headers: NO_STORE });
    }
    if (error.code !== '23505') {
      console.warn('Affiliation inscription:', error.message);
      return NextResponse.json({ error: 'FAIL' }, { status: 500, headers: NO_STORE });
    }
  }
  return NextResponse.json({ error: 'FAIL' }, { status: 500, headers: NO_STORE });
}
