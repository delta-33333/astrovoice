import { NextRequest, NextResponse } from 'next/server';
import { formatArcminute } from '@/lib/chart-calc';
import { presentAscendant } from '@/lib/ascendant-tool';
import { ChartError, chartFromBirth } from '@/lib/ephemeris';
import { clientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WINDOW_MS = 60_000;
const LIMIT = 20;
const hits = new Map<string, number[]>();

function tooMany(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((at) => now - at < WINDOW_MS);
  if (recent.length >= LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 4000) {
    const first = hits.keys().next().value;
    if (first) hits.delete(first);
  }
  return false;
}

/**
 * Calcul d’ascendant sans compte.
 * La date, l’heure et le lieu ne sont pas enregistrés.
 * Le géocodage peut mémoriser la commune seule (coordonnées), jamais l’instant de naissance.
 */
export async function POST(request: NextRequest) {
  if (tooMany(clientIp(request))) {
    return NextResponse.json(
      { error: 'Trop de calculs d’affilée. Réessayez dans une minute.' },
      { status: 429, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const body = await request.json().catch(() => null);
  const date = typeof body?.date === 'string' ? body.date.trim() : '';
  const time = typeof body?.time === 'string' ? body.time.trim() : '';
  const place = typeof body?.place === 'string' ? body.place.trim() : '';

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{1,2}:\d{2}$/.test(time)) {
    return NextResponse.json(
      { error: 'Indiquez une date et une heure de naissance.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }
  if (place.length < 2 || place.length > 80 || /[<>]/.test(place)) {
    return NextResponse.json(
      { error: 'Indiquez une commune et un pays, par exemple « Lyon, France ».' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  try {
    const chart = await chartFromBirth({ date, time, place, timeUnknown: false });
    const placed = formatArcminute(chart.ascendantLongitude);
    const result = presentAscendant({
      sign: placed.sign,
      position: placed.text,
      sunSign: chart.sunSign,
      moonSign: chart.moonSign,
      placeLabel: chart.placeLabel,
      timeZone: chart.timeZone,
      localMeanTime: chart.localMeanTime,
    });
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof ChartError) {
      const status = error.code === 'EPHEMERIS' ? 503 : 400;
      return NextResponse.json(
        { error: error.message },
        { status, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    console.error('Ascendant:', error instanceof Error ? error.message : 'erreur');
    return NextResponse.json(
      { error: 'Le calcul n’a pas abouti.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
