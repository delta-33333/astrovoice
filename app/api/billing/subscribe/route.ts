import { NextRequest, NextResponse } from 'next/server';
import { createSubscriptionCheckout } from '@/lib/checkout';
import { resolveMarket } from '@/lib/market';
import { subscriptionCurrency } from '@/lib/offers';
import { loadSubscription } from '@/lib/subscriptions';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Connectez-vous pour vous abonner.' }, { status: 401 });

  const current = await loadSubscription(user.id);
  if (current && (current.status === 'active' || current.status === 'trialing')) {
    return NextResponse.json({ error: 'Un abonnement est déjà en cours.' }, { status: 409 });
  }

  const market = await resolveMarket();
  const currency = subscriptionCurrency(market.currency);
  try {
    const session = await createSubscriptionCheckout({ request, user, currency });
    return NextResponse.json({
      clientSecret: session.clientSecret,
      checkoutSessionId: session.checkoutSessionId,
      collectContact: session.collectContact,
      currency,
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'STRIPE_NOT_CONFIGURED') {
      return NextResponse.json({ error: 'Le paiement est indisponible.' }, { status: 503 });
    }
    console.error('Abonnement:', code);
    return NextResponse.json({ error: 'L’abonnement n’a pas pu être préparé.' }, { status: 500 });
  }
}
