import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getStripe } from '@/lib/stripe';
import { deliverPaidSummary, markSummaryPaid } from '@/lib/summaries';

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
  if (session.metadata?.userId !== user.id || session.metadata?.purpose !== 'summary') {
    return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });
  }
  if (session.payment_status !== 'paid' || session.status !== 'complete') {
    return NextResponse.json({ error: 'Paiement non confirmé' }, { status: 409 });
  }
  const bookingId = session.metadata.booking_id;
  if (!bookingId) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });

  try {
    await markSummaryPaid(bookingId, session.id);
    const delivery = await deliverPaidSummary(bookingId);
    return NextResponse.json({ ok: true, bookingId, delivery });
  } catch (error) {
    console.error('Confirmation résumé:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Confirmation impossible' }, { status: 500 });
  }
}
