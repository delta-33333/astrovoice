import { NextRequest, NextResponse } from 'next/server';
import { ChartError, chartFromBirth } from '@/lib/ephemeris';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const date = typeof body?.date === 'string' ? body.date : '';
    const place = typeof body?.place === 'string' ? body.place : '';
    const time = typeof body?.time === 'string' ? body.time : undefined;
    const timeUnknown = Boolean(body?.timeUnknown) || !time;

    if (!date || !place) {
      return NextResponse.json({ error: 'Date et lieu requis' }, { status: 400 });
    }

    const chart = await chartFromBirth({ date, time, timeUnknown, place });
    return NextResponse.json({
      planets: chart.planets,
      houses: chart.houses,
      aspects: chart.aspects,
      ascendant: chart.ascendant,
      sunSign: chart.sunSign,
      moonSign: chart.moonSign,
      summary: chart.summary,
      coords: chart.coords,
      timeUsed: chart.timeUsed,
      timeZone: chart.timeZone,
      timeKnown: chart.timeKnown,
      engine: chart.engine,
      placeLabel: chart.placeLabel,
    });
  } catch (error) {
    if (error instanceof ChartError) {
      const status = error.code === 'EPHEMERIS' ? 503 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    console.error('Thème natal:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Le thème natal n’a pas pu être calculé.' }, { status: 500 });
  }
}
