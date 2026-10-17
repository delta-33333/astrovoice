import { NextRequest, NextResponse } from 'next/server';
import {
  displayLabel,
  personInitial,
  readCouple,
  signsFromPositions,
  toPublicCoupleResult,
} from '@/lib/couple-compat';
import { saveCoupleResult } from '@/lib/couple-store';
import { ChartError, chartFromBirth } from '@/lib/ephemeris';
import { honeypotTripped } from '@/lib/form-checks';
import { clientIp } from '@/lib/rate-limit';
import { isLocale } from '@/lib/seo';
import type { NatalChart } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WINDOW_MS = 60_000;
const LIMIT = 12;
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
  return false;
}

function asText(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function planet(chart: NatalChart, name: string): string {
  return chart.planets.find((item) => item.name === name)?.sign || '';
}

export async function POST(request: NextRequest) {
  if (tooMany(clientIp(request))) {
    return NextResponse.json({ error: 'RATE' }, { status: 429, headers: { 'Cache-Control': 'no-store' } });
  }
  const body = await request.json().catch(() => null);
  if (honeypotTripped(body)) {
    return NextResponse.json({ error: 'FAIL' }, { status: 400 });
  }
  const locale = asText(body?.locale, 2);
  if (!isLocale(locale)) return NextResponse.json({ error: 'FAIL' }, { status: 400 });

  const self = body?.self ?? {};
  const partner = body?.partner ?? {};
  try {
    const [leftChart, rightChart] = await Promise.all([
      chartFromBirth({
        date: asText(self.date, 10),
        time: asText(self.time, 5) || null,
        timeUnknown: self.timeUnknown === true || !asText(self.time, 5),
        place: asText(self.place, 160),
      }),
      chartFromBirth({
        date: asText(partner.date, 10),
        time: asText(partner.time, 5) || null,
        timeUnknown: partner.timeUnknown === true || !asText(partner.time, 5),
        place: asText(partner.place, 160),
      }),
    ]);
    const left = signsFromPositions({
      sunSign: leftChart.sunSign,
      moonSign: leftChart.moonSign,
      venusSign: planet(leftChart, 'Vénus'),
      marsSign: planet(leftChart, 'Mars'),
      ascendant: leftChart.ascendant,
      timeKnown: leftChart.timeKnown,
    });
    const right = signsFromPositions({
      sunSign: rightChart.sunSign,
      moonSign: rightChart.moonSign,
      venusSign: planet(rightChart, 'Vénus'),
      marsSign: planet(rightChart, 'Mars'),
      ascendant: rightChart.ascendant,
      timeKnown: rightChart.timeKnown,
    });
    if (!left || !right) return NextResponse.json({ error: 'EPHEMERIS' }, { status: 500 });
    const reading = readCouple(locale, left, right);
    const labelA = displayLabel(self.name);
    const labelB = displayLabel(partner.name);
    const stored = await saveCoupleResult({
      locale,
      score: reading.score,
      strengths: reading.strengths,
      tensions: reading.tensions,
      initialA: personInitial(labelA, 'A'),
      initialB: personInitial(labelB, 'B'),
      labelA,
      labelB,
    });
    const result =
      stored ??
      toPublicCoupleResult({
        id: '00000000-0000-4000-8000-000000000000',
        locale,
        score: reading.score,
        strengths: reading.strengths,
        tensions: reading.tensions,
        initialA: personInitial(labelA, 'A'),
        initialB: personInitial(labelB, 'B'),
        labelA,
        labelB,
      });
    return NextResponse.json(
      { result: stored ? result : { ...result, sharePath: null } },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    if (error instanceof ChartError) {
      return NextResponse.json({ error: error.code }, { status: 400 });
    }
    console.error('Couple:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'FAIL' }, { status: 500 });
  }
}
