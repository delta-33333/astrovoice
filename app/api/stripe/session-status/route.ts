import { NextRequest, NextResponse } from 'next/server';
import { authSecret, getSession } from '@/lib/session';
import { GUEST_CHECKOUT_COOKIE, guestCheckoutMatches, isGuestCheckout } from '@/lib/guest-checkout-rules';
import { getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const user = await getSession();
  const sessionId = request.nextUrl.searchParams.get('session_id');
  if (!sessionId || !sessionId.startsWith('cs_')) {
    return NextResponse.json({ error: user ? 'Session invalide' : 'Non authentifié' }, { status: user ? 400 : 401 });
  }
  // Achat invité : seul le navigateur qui a ouvert le paiement (cookie signé) peut lire son statut.
  const guestOk = guestCheckoutMatches(request.cookies.get(GUEST_CHECKOUT_COOKIE)?.value, sessionId, authSecret());
  if (!user && !guestOk) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: 'Paiement indisponible' }, { status: 503 });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const guestSession = guestOk && isGuestCheckout(session.metadata);
  if (!guestSession && session.metadata?.userId !== user?.id) {
    return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });
  }

  return NextResponse.json({
    status: session.status,
    paymentStatus: session.payment_status,
    purpose: session.metadata?.purpose ?? null,
    sessionId: session.metadata?.sessionId ?? null,
    checkoutSessionId: session.id,
    amountTotal: session.amount_total,
    packId: session.metadata?.packId ?? null,
    bookingId: session.metadata?.booking_id ?? null,
    reportId: session.metadata?.report_id ?? null,
    startsAt: session.metadata?.startsAt ?? null,
  });
}
