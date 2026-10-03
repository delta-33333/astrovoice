import { NextRequest, NextResponse } from 'next/server';
import { confirmBookingPayment, getBooking, isImmediateStart } from '@/lib/bookings';
import { trackEvent } from '@/lib/events';
import { createElementsCheckout } from '@/lib/checkout';
import { formatCurrency } from '@/lib/pricing';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user || !UUID_RE.test(user.id)) {
    return NextResponse.json({ error: 'Connectez-vous pour payer.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const bookingId = body?.bookingId;
  if (typeof bookingId !== 'string' || !UUID_RE.test(bookingId)) {
    return NextResponse.json({ error: 'Réservation invalide.' }, { status: 400 });
  }

  const booking = await getBooking(bookingId);
  if (!booking || booking.user_id !== user.id) {
    return NextResponse.json({ error: 'Réservation introuvable.' }, { status: 404 });
  }
  if (booking.status !== 'pending') {
    return NextResponse.json({ error: 'Cette réservation n’est plus en attente.' }, { status: 409 });
  }
  if (!booking.hold_expires_at || new Date(booking.hold_expires_at).getTime() <= Date.now()) {
    return NextResponse.json({ error: 'Le blocage de 10 minutes a expiré.' }, { status: 409 });
  }

  if (booking.amount_cents === 0) {
    await trackEvent({
      name: 'checkout_started',
      userId: user.id,
      advisorId: booking.advisor_id,
      bookingId: booking.id,
      metadata: { purpose: 'booking' },
    });
    await confirmBookingPayment({
      bookingId: booking.id,
      checkoutSessionId: `credit_${booking.id}`,
      paymentIntentId: null,
    });
    return NextResponse.json({
      free: true,
      bookingId: booking.id,
      immediate: isImmediateStart(booking.starts_at),
    });
  }

  try {
    const session = await createElementsCheckout({
      request,
      user,
      amountCents: booking.amount_cents,
      productName: `Consultation ${booking.duration_min} min`,
      productDescription: `Consultation de ${booking.duration_min} minutes`,
      purpose: 'booking',
      metadata: {
        booking_id: booking.id,
        startsAt: booking.starts_at,
        durationMin: String(booking.duration_min),
      },
      manualCapture: false,
      flow: 'booking',
      integrationFlow: 'booking',
    });
    await trackEvent({
      name: 'checkout_started',
      userId: user.id,
      advisorId: booking.advisor_id,
      bookingId: booking.id,
      metadata: { purpose: 'booking' },
    });

    return NextResponse.json({
      free: false,
      clientSecret: session.clientSecret,
      checkoutSessionId: session.checkoutSessionId,
      amountCents: booking.amount_cents,
      amountLabel: formatCurrency(booking.amount_cents),
      collectContact: session.collectContact,
      bookingId: booking.id,
      immediate: isImmediateStart(booking.starts_at),
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'STRIPE_NOT_CONFIGURED') {
      return NextResponse.json({ error: 'Le paiement est indisponible.' }, { status: 503 });
    }
    console.error('checkout booking:', code);
    return NextResponse.json({ error: 'Le paiement n’a pas pu être préparé.' }, { status: 500 });
  }
}
