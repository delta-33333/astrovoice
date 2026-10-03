import { NextRequest, NextResponse } from 'next/server';
import { holdSlot, isBookingDuration } from '@/lib/bookings';
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

  try {
    const held = await holdSlot({ userId: user.id, slotId, durationMin });
    return NextResponse.json(held);
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'HELD') {
      return NextResponse.json({ error: 'Ce créneau vient d’être retenu.' }, { status: 409 });
    }
    if (code === 'UNAVAILABLE') {
      return NextResponse.json({ error: 'Ce créneau n’est plus disponible.' }, { status: 409 });
    }
    console.error('hold:', code);
    return NextResponse.json({ error: 'La réservation n’a pas pu être préparée.' }, { status: 500 });
  }
}
