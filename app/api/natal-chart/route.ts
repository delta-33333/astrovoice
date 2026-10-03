import { NextRequest, NextResponse } from 'next/server';
import { ChartError } from '@/lib/ephemeris';
import { loadOrComputeChart, profileMatchesBirth } from '@/lib/natal-store';
import { getSession } from '@/lib/session';

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

    const user = await getSession();
    const birth = { date, time, timeUnknown, place };
    const persistUser = Boolean(user && (!user.birth_date || profileMatchesBirth(user, birth)));
    const chart = await loadOrComputeChart(
      birth,
      user ? { userId: user.id, displayName: user.display_name, persistUser } : undefined
    );
    return NextResponse.json(chart);
  } catch (error) {
    if (error instanceof ChartError) {
      const status = error.code === 'EPHEMERIS' ? 503 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    console.error('Thème natal:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Le thème natal n’a pas pu être calculé.' }, { status: 500 });
  }
}
