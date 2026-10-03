import { NextResponse } from 'next/server';
import { pendingRebook } from '@/lib/rebook';
import { listReports } from '@/lib/reports';
import { getSession } from '@/lib/session';
import { loadSubscription } from '@/lib/subscriptions';
import { reportTitle, SUBSCRIPTION_FAIR_USE_MINUTES, SUBSCRIPTION_MAX_CALL_MINUTES } from '@/lib/offers';

export const dynamic = 'force-dynamic';

const ENTITLED = new Set(['active', 'trialing']);

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const [subscription, reports, rebook] = await Promise.all([
    loadSubscription(user.id),
    listReports(user.id),
    pendingRebook(user.id),
  ]);
  return NextResponse.json({
    subscription: subscription
      ? {
          status: subscription.status,
          active: ENTITLED.has(subscription.status),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodEnd: subscription.current_period_end,
          fairUseMinutesUsed: Math.round((subscription.fair_use_seconds_used || 0) / 60),
          fairUseMinutes: SUBSCRIPTION_FAIR_USE_MINUTES,
          maxCallMinutes: SUBSCRIPTION_MAX_CALL_MINUTES,
          currency: subscription.currency,
          portal: Boolean(user.stripe_customer_id),
        }
      : null,
    reports: reports.map((report) => ({
      id: report.id,
      kind: report.kind,
      title: reportTitle(report.kind),
      status: report.status,
      createdAt: report.created_at,
      deliveredAt: report.delivered_at,
    })),
    rebook: rebook ? { percent: rebook.percent, expiresAt: rebook.expires_at } : null,
  });
}
