import { NextRequest, NextResponse } from 'next/server';
import { confirmBookingPayment, getBooking, isImmediateStart, isRepeatBooking } from '@/lib/bookings';
import { getSession } from '@/lib/session';
import { getStripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const checkoutSessionId = body?.checkoutSessionId;
  if (typeof checkoutSessionId !== 'string' || !checkoutSessionId.startsWith('cs_')) {
    return NextResponse.json({ error: 'Session invalide' }, { status: 400 });
  }

  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: 'Paiement indisponible' }, { status: 503 });

  const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);
  if (session.metadata?.userId !== user.id || session.metadata?.purpose !== 'booking') {
    return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });
  }
  if (session.payment_status !== 'paid' || session.status !== 'complete') {
    return NextResponse.json({ error: 'Paiement non confirmé' }, { status: 409 });
  }

  const bookingId = session.metadata.booking_id;
  if (!bookingId) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });

  const result = await confirmBookingPayment({
    bookingId,
    checkoutSessionId: session.id,
    paymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
  });

  const booking = await getBooking(bookingId);
  return NextResponse.json({
    result,
    bookingId,
    immediate: booking ? isImmediateStart(booking.starts_at) : false,
    rebook: booking ? await isRepeatBooking(booking) : false,
  });
}
