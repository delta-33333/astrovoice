import { NextResponse } from 'next/server';
import { cancelBooking, getBooking } from '@/lib/bookings';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { id } = await context.params;
  const booking = await getBooking(id);
  if (!booking || booking.user_id !== user.id) {
    return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
  }

  try {
    const result = await cancelBooking(booking, user);
    return NextResponse.json(result);
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'TOO_LATE') {
      return NextResponse.json({ error: 'Cette consultation a déjà commencé.' }, { status: 409 });
    }
    if (code === 'INVALID') {
      return NextResponse.json({ error: 'Cette réservation ne peut plus être annulée.' }, { status: 409 });
    }
    console.error('annulation:', code);
    return NextResponse.json({ error: 'L’annulation n’a pas abouti.' }, { status: 500 });
  }
}
