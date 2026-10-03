import { NextRequest, NextResponse } from 'next/server';
import { fulfillCheckoutReport } from '@/lib/reports';
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
  if (session.metadata?.userId !== user.id || session.metadata?.purpose !== 'report') {
    return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });
  }
  if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
    return NextResponse.json({ error: 'Paiement non confirmé' }, { status: 402 });
  }
  await fulfillCheckoutReport(session);
  return NextResponse.json({ ok: true, reportId: session.metadata.report_id });
}
