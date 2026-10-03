import { NextRequest, NextResponse } from 'next/server';
import { getBooking } from '@/lib/bookings';
import { getSupabaseAdmin, supabaseAvailable } from '@/lib/supabase';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const bookingId = request.nextUrl.searchParams.get('bookingId');
  if (!bookingId) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 400 });
  if (!supabaseAvailable) return NextResponse.json({ eligible: false, existing: null });

  const booking = await getBooking(bookingId);
  if (!booking || booking.user_id !== user.id) {
    return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
  }

  const { data } = await getSupabaseAdmin()
    .from('reviews')
    .select('stars, comment')
    .eq('booking_id', bookingId)
    .maybeSingle();

  // Même règle que submit_review en base : appel terminé d'au moins 2 minutes.
  const { data: calls } = await getSupabaseAdmin()
    .from('call_sessions')
    .select('duration_seconds, ended_at')
    .eq('booking_id', bookingId);
  const longEnough = (calls ?? []).some(
    (call) => Boolean(call.ended_at) && Number(call.duration_seconds ?? 0) >= 120
  );

  return NextResponse.json({
    eligible: ['completed', 'confirmed'].includes(booking.status) && longEnough && !data,
    existing: data ?? null,
  });
}

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (!supabaseAvailable) return NextResponse.json({ error: 'Indisponible' }, { status: 503 });

  const body = await request.json().catch(() => null);
  const bookingId = body?.bookingId;
  const stars = body?.stars;
  const comment = typeof body?.comment === 'string' ? body.comment : '';
  if (typeof bookingId !== 'string' || typeof stars !== 'number' || stars < 1 || stars > 5) {
    return NextResponse.json({ error: 'Avis incomplet' }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin().rpc('submit_review', {
    p_user_id: user.id,
    p_booking_id: bookingId,
    p_stars: stars,
    p_comment: comment,
  });
  if (error) {
    const message = error.message || '';
    if (message.includes('exists')) {
      return NextResponse.json({ error: 'Avis déjà enregistré' }, { status: 409 });
    }
    if (message.includes('ineligible') || message.includes('invalid')) {
      return NextResponse.json({ error: 'Cette consultation ne peut pas encore être notée' }, { status: 403 });
    }
    console.error('Avis:', message);
    return NextResponse.json({ error: 'Enregistrement impossible' }, { status: 500 });
  }
  return NextResponse.json({ id: data });
}
