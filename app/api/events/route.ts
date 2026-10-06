import { NextRequest, NextResponse } from 'next/server';
import { getBooking } from '@/lib/bookings';
import { trackEvent } from '@/lib/events';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

const CALL_EVENTS = new Set(['call_reengage', 'call_silence_end']);

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = body?.name;

  if (typeof name === 'string' && CALL_EVENTS.has(name)) {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    const bookingId = typeof body.bookingId === 'string' ? body.bookingId.slice(0, 64) : null;
    let advisorId = typeof body.advisorId === 'string' ? body.advisorId.slice(0, 64) : null;
    if (bookingId) {
      const booking = await getBooking(bookingId).catch(() => null);
      if (!booking || booking.user_id !== user.id) {
        return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
      }
      advisorId = booking.advisor_id;
    }
    const metadata: Record<string, string> = {};
    const raw = body.metadata && typeof body.metadata === 'object' ? body.metadata : {};
    for (const key of ['attempt', 'silentMs', 'elapsed', 'reason']) {
      const value = (raw as Record<string, unknown>)[key];
      if (typeof value === 'string' || typeof value === 'number') metadata[key] = String(value).slice(0, 40);
    }
    await trackEvent({
      name: name as 'call_reengage' | 'call_silence_end',
      userId: user.id,
      advisorId,
      bookingId,
      metadata,
    });
    return NextResponse.json({ ok: true });
  }

  if (name !== 'select_slot' && name !== 'slot_selected') {
    return NextResponse.json({ error: 'Événement refusé' }, { status: 400 });
  }
  const user = await getSession();
  const advisorId = typeof body.advisorId === 'string' ? body.advisorId : null;
  const slotId = typeof body.metadata?.slotId === 'string' ? body.metadata.slotId.slice(0, 80) : '';
  await trackEvent({
    name: 'select_slot',
    userId: user?.id,
    advisorId,
    metadata: slotId ? { slotId } : {},
  });
  return NextResponse.json({ ok: true });
}
