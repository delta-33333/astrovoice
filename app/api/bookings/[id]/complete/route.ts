import { NextResponse } from 'next/server';
import { getBooking } from '@/lib/bookings';
import { getSupabaseAdmin } from '@/lib/supabase';
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
  if (booking.status === 'completed') return NextResponse.json({ ok: true, already: true });
  if (booking.status !== 'confirmed') {
    return NextResponse.json({ error: 'Consultation non confirmée' }, { status: 409 });
  }

  const { error } = await getSupabaseAdmin()
    .from('bookings')
    .update({ status: 'completed' })
    .eq('id', booking.id)
    .eq('status', 'confirmed');
  if (error) return NextResponse.json({ error: 'Clôture impossible' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
