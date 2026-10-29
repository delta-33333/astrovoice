import { NextRequest, NextResponse } from 'next/server';
import { AFFILIATE_PATHS, cleanHandle, cleanName, makeRefCode, type AffLocale } from '@/lib/affiliate';
import { honeypotTripped, normalizeEmail } from '@/lib/form-checks';
import { clientIp } from '@/lib/rate-limit';
import { localeHomePath } from '@/lib/seo';
import { appBaseUrl } from '@/lib/stripe';
import { getSupabaseAdmin, supabaseAvailable } from '@/lib/supabase';

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
  const locale: AffLocale = typeof body.locale === 'string' && body.locale in AFFILIATE_PATHS ? (body.locale as AffLocale) : 'fr';
  if (!name) return NextResponse.json({ error: 'NAME' }, { status: 400, headers: NO_STORE });
  if (!email || email.length > 160) return NextResponse.json({ error: 'EMAIL' }, { status: 400, headers: NO_STORE });
  if (!handle) return NextResponse.json({ error: 'SOCIAL' }, { status: 400, headers: NO_STORE });
  if (body.accept !== true) return NextResponse.json({ error: 'TERMS' }, { status: 400, headers: NO_STORE });
  if (!supabaseAvailable) return NextResponse.json({ error: 'FAIL' }, { status: 503, headers: NO_STORE });

  const admin = getSupabaseAdmin();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = makeRefCode(name);
    const { error } = await admin.from('affiliates').insert({ code, name, email, social_handle: handle, locale });
    if (!error) {
      const link = `${appBaseUrl(request.nextUrl.origin)}${localeHomePath(locale)}?ref=${code}`;
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
