import { NextRequest, NextResponse } from 'next/server';
import { busyAlternatives, holdSlot, isBookingDuration } from '@/lib/bookings';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user || !UUID_RE.test(user.id)) {
    return NextResponse.json({ error: 'Connectez-vous pour réserver.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const slotId = body?.slotId;
  const durationMin = Number(body?.durationMin);
  if (typeof slotId !== 'string' || !UUID_RE.test(slotId) || !isBookingDuration(durationMin)) {
    return NextResponse.json({ error: 'Créneau invalide.' }, { status: 400 });
  }

  const advisorId = typeof body?.advisorId === 'string' && UUID_RE.test(body.advisorId) ? body.advisorId : null;
  const immediate = body?.immediate === true;

  try {
    const held = await holdSlot({ userId: user.id, slotId, durationMin, advisorId, immediate });
    return NextResponse.json(held);
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'ADVISOR_BUSY' || code === 'UNAVAILABLE' || code === 'HELD') {
      const alternatives = await busyAlternatives(advisorId).catch(() => ({ nextSlot: null, alternative: null }));
      return NextResponse.json(
        {
          error: code === 'ADVISOR_BUSY'
            ? 'Ce conseiller est en consultation en ce moment.'
            : 'Ce créneau n’est plus disponible.',
          code: code === 'ADVISOR_BUSY' ? 'busy' : 'unavailable',
          ...alternatives,
        },
        { status: 409 }
      );
    }
    console.error('hold:', code);
    return NextResponse.json({ error: 'La réservation n’a pas pu être préparée.' }, { status: 500 });
  }
}
