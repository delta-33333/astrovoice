import { NextRequest, NextResponse } from 'next/server';
import { skyAtUtc } from '@/lib/chart-calc';
import { tooManyRequests } from '@/lib/guard';
import { buildSkyNowReading, type SkyNowLocale } from '@/lib/sky-now';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

/**
 * Mini-lecture gratuite sans compte : date de naissance seule → signe solaire + ciel réel du moment.
 * Rien n’est enregistré.
 */
export async function POST(request: NextRequest) {
  if (tooManyRequests(request, 'sky-now', 30, 60_000)) {
    return NextResponse.json({ error: 'RATE' }, { status: 429, headers: NO_STORE });
  }
  const body = await request.json().catch(() => null);
  const date = typeof body?.date === 'string' ? body.date.trim() : '';
  const locale: SkyNowLocale = body?.locale === 'en' ? 'en' : 'fr';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return NextResponse.json({ error: 'DATE' }, { status: 400, headers: NO_STORE });
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const now = new Date();
  if (year < 1900 || year > now.getUTCFullYear() || month < 1 || month > 12 || day < 1 || day > 31) {
    return NextResponse.json({ error: 'DATE' }, { status: 400, headers: NO_STORE });
  }
  try {
    const natal = skyAtUtc(year, month, day, 12, 0).bodies;
    const sky = skyAtUtc(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes()).bodies;
    const natalSun = natal.find((b) => b.name === 'Soleil');
    const sun = sky.find((b) => b.name === 'Soleil');
    const moon = sky.find((b) => b.name === 'Lune');
    if (!natalSun || !sun || !moon) throw new Error('sky');
    const reading = buildSkyNowReading(locale, {
      natalSun: natalSun.longitude,
      sunNow: sun.longitude,
      moonNow: moon.longitude,
      moonSpeed: moon.speed,
    });
    return NextResponse.json({ reading, at: now.toISOString() }, { headers: NO_STORE });
  } catch {
    return NextResponse.json({ error: 'FAIL' }, { status: 500, headers: NO_STORE });
  }
}
