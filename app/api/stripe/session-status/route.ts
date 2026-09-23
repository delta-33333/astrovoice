import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const sessionId = request.nextUrl.searchParams.get('session_id');
  if (!sessionId || !sessionId.startsWith('cs_')) {
    return NextResponse.json({ error: 'Session invalide' }, { status: 400 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: 'Paiement indisponible' }, { status: 503 });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.metadata?.userId !== user.id) {
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
  });
}
