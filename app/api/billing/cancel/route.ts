import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getStripe } from '@/lib/stripe';
import { loadSubscription, syncSubscriptionById } from '@/lib/subscriptions';

export const dynamic = 'force-dynamic';

const ENTITLED = new Set(['active', 'trialing']);

/** Résiliation en un clic : l’accès court jusqu’à la fin de la semaine déjà payée. */
export async function POST() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const row = await loadSubscription(user.id);
  if (!row || !ENTITLED.has(row.status)) {
    return NextResponse.json({ error: 'Aucune formule en cours.' }, { status: 404 });
  }
  if (row.cancel_at_period_end) {
    return NextResponse.json({
      ok: true,
      already: true,
      currentPeriodEnd: row.current_period_end,
    });
  }
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: 'Le paiement est indisponible.' }, { status: 503 });
  await stripe.subscriptions.update(row.stripe_subscription_id, { cancel_at_period_end: true });
  await syncSubscriptionById(row.stripe_subscription_id);
  const next = await loadSubscription(user.id);
  return NextResponse.json({
    ok: true,
    cancelAtPeriodEnd: true,
    currentPeriodEnd: next?.current_period_end ?? row.current_period_end,
  });
}
