import { NextRequest, NextResponse } from 'next/server';
import { getBooking } from '@/lib/bookings';
import { createElementsCheckout } from '@/lib/checkout';
import { SUMMARY_CENTS, formatCurrency } from '@/lib/pricing';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const bookingId = body?.bookingId;
  if (typeof bookingId !== 'string') {
    return NextResponse.json({ error: 'Réservation introuvable' }, { status: 400 });
  }

  const booking = await getBooking(bookingId);
  if (!booking || booking.user_id !== user.id) {
    return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
  }
  if (booking.status !== 'confirmed' && booking.status !== 'completed') {
    return NextResponse.json({ error: 'Consultation non confirmée' }, { status: 409 });
  }

  try {
    const checkout = await createElementsCheckout({
      request,
      user,
      amountCents: SUMMARY_CENTS,
      productName: 'Résumé écrit de consultation',
      productDescription: 'Résumé écrit envoyé par e-mail après la consultation.',
      purpose: 'summary',
      flow: 'summary',
      integrationFlow: 'summary',
      manualCapture: false,
      metadata: { booking_id: booking.id },
    });
    return NextResponse.json({
      ...checkout,
      amountLabel: formatCurrency(SUMMARY_CENTS),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'STRIPE_NOT_CONFIGURED') {
      return NextResponse.json({ error: 'Paiement indisponible' }, { status: 503 });
    }
    console.error('Paiement résumé:', message);
    return NextResponse.json({ error: 'Paiement impossible' }, { status: 500 });
  }
}
