import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getStripe } from '@/lib/stripe';
import { syncSubscription } from '@/lib/subscriptions';
import type Stripe from 'stripe';

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
  const session = await stripe.checkout.sessions.retrieve(checkoutSessionId, { expand: ['subscription'] });
  if (session.metadata?.userId !== user.id || session.metadata?.purpose !== 'subscription') {
    return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });
  }
  const subscription = session.subscription;
  if (subscription && typeof subscription !== 'string') {
    await syncSubscription(subscription as Stripe.Subscription);
  } else if (typeof subscription === 'string') {
    const full = await stripe.subscriptions.retrieve(subscription);
    await syncSubscription(full);
  }
  return NextResponse.json({ ok: true });
}
