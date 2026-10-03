import { NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/events';
import { ChartError } from '@/lib/ephemeris';
import { loadOrComputeChart } from '@/lib/natal-store';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Coordonnées de naissance déjà enregistrées, pour ne pas les redemander sur un nouvel appareil. */
export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (!user.birth_date || !user.birth_place) return NextResponse.json({ birthData: null });
  const extra = user as unknown as { birth_latitude?: number | null; birth_longitude?: number | null };
  const time = typeof user.birth_time === 'string' ? user.birth_time.slice(0, 5) : '';
  return NextResponse.json({
    birthData: {
      name: user.display_name || '',
      date: user.birth_date,
      time,
      timeUnknown: Boolean(user.birth_time_unknown) || !time,
      place: user.birth_place,
      latitude: typeof extra.birth_latitude === 'number' ? extra.birth_latitude : undefined,
      longitude: typeof extra.birth_longitude === 'number' ? extra.birth_longitude : undefined,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 80) : '';
    const date = typeof body?.date === 'string' ? body.date.trim() : '';
    const place = typeof body?.place === 'string' ? body.place.trim().slice(0, 160) : '';
    const time = typeof body?.time === 'string' ? body.time.trim().slice(0, 8) : '';
    const timeUnknown = Boolean(body?.timeUnknown) || !time;

    if (!date || !place) {
      return NextResponse.json({ error: 'Date et lieu requis' }, { status: 400 });
    }

    const chart = await loadOrComputeChart(
      { date, time: time || undefined, timeUnknown, place },
      { userId: user.id, displayName: name || user.display_name, persistUser: true }
    );

    await trackEvent({ name: 'birth_data', userId: user.id });
    return NextResponse.json({
      success: true,
      chart,
      latitude: chart.coords.lat,
      longitude: chart.coords.lon,
      timeZone: chart.zoneId,
    });
  } catch (error) {
    if (error instanceof ChartError) {
      const status = error.code === 'EPHEMERIS' ? 503 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    console.error('Save birth data error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 });
  }
}
