import { NextRequest, NextResponse } from 'next/server';
import { readAcquisition } from '@/lib/acquisition-store';
import { honeypotTripped, normalizeEmail } from '@/lib/form-checks';
import { subscribeHoroscope } from '@/lib/horoscope-subscribers';
import { cleanUtm } from '@/lib/morning-horoscope';
import { clientIp } from '@/lib/rate-limit';
import { parseHeardFrom } from '@/lib/heard-from';
import { isLocale } from '@/lib/seo';

export const dynamic = 'force-dynamic';

const WINDOW_MS = 60_000;
const LIMIT = 8;
const hits = new Map<string, number[]>();

function tooMany(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((at) => now - at < WINDOW_MS);
  if (recent.length >= LIMIT) return true;
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function POST(request: NextRequest) {
  if (tooMany(clientIp(request))) {
    return NextResponse.json({ error: 'RATE' }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  if (honeypotTripped(body)) return NextResponse.json({ error: 'INVALID' }, { status: 400 });
  const email = normalizeEmail(body?.email);
  const locale = typeof body?.locale === 'string' ? body.locale : '';
  if (!email || !isLocale(locale)) return NextResponse.json({ error: 'INVALID' }, { status: 400 });
  const touch = await readAcquisition();
  const result = await subscribeHoroscope({
    email,
    locale,
    sign: typeof body?.sign === 'string' ? body.sign : '',
    birthDate: typeof body?.birthDate === 'string' ? body.birthDate : null,
    consent: body?.consent,
    utmSource: cleanUtm(body?.utmSource) || touch.utm_source,
    utmMedium: cleanUtm(body?.utmMedium) || touch.utm_medium,
    utmCampaign: cleanUtm(body?.utmCampaign) || touch.utm_campaign,
    placement: typeof body?.placement === 'string' ? body.placement.slice(0, 40) : 'widget',
    heardFrom: parseHeardFrom(body?.heardFrom),
  });
  if (result === 'consent') return NextResponse.json({ error: 'CONSENT' }, { status: 400 });
  if (result === 'invalid') return NextResponse.json({ error: 'INVALID' }, { status: 400 });
  if (result === 'unavailable') return NextResponse.json({ error: 'UNAVAILABLE' }, { status: 503 });
  return NextResponse.json({ ok: true });
}
