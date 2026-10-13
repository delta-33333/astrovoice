import { NextResponse } from 'next/server';
import { pendingRebook } from '@/lib/rebook';
import { listReports } from '@/lib/reports';
import { getSession } from '@/lib/session';
import { formatMoney, normalizeCurrency } from '@/lib/money';
import { getSupabaseAdmin, supabaseAvailable } from '@/lib/supabase';
import { loadSubscription } from '@/lib/subscriptions';
import { reportTitle } from '@/lib/offers';
import { WEEKLY_MAX_CALL_MINUTES, WEEKLY_PLANS, isWeeklyPlan, planMinutes } from '@/lib/weekly';

export const dynamic = 'force-dynamic';

const ENTITLED = new Set(['active', 'trialing']);

async function loadCredits(userId: string) {
  if (!supabaseAvailable) return [];
  const { data, error } = await getSupabaseAdmin()
    .from('booking_credits')
    .select('id, remaining_cents, currency, expires_at')
    .eq('user_id', userId)
    .gt('remaining_cents', 0)
    .gt('expires_at', new Date().toISOString())
    .order('expires_at', { ascending: true });
  if (error) return [];
  return (data ?? []).map((credit) => {
    const currency = normalizeCurrency((credit as { currency?: string | null }).currency);
    return {
      id: credit.id as string,
      remainingCents: credit.remaining_cents as number,
      currency,
      label: formatMoney(credit.remaining_cents as number, currency),
      expiresAt: credit.expires_at as string,
    };
  });
}

async function loadSummaries(userId: string) {
  if (!supabaseAvailable) return [];
  const { data, error } = await getSupabaseAdmin()
    .from('call_sessions')
    .select('booking_id, summary_paid_at, summary_emailed_at')
    .eq('user_id', userId)
    .not('summary_paid_at', 'is', null)
    .order('summary_paid_at', { ascending: false })
    .limit(30);
  if (error) return [];
  return (data ?? []).map((row) => ({
    bookingId: row.booking_id as string | null,
    paidAt: row.summary_paid_at as string,
    emailed: Boolean(row.summary_emailed_at),
  }));
}

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const [subscription, reports, rebook, credits, summaries] = await Promise.all([
    loadSubscription(user.id),
    listReports(user.id),
    pendingRebook(user.id),
    loadCredits(user.id),
    loadSummaries(user.id),
  ]);
  return NextResponse.json({
    subscription: subscription
      ? {
          status: subscription.status,
          active: ENTITLED.has(subscription.status),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodEnd: subscription.current_period_end,
          plan: isWeeklyPlan(subscription.plan) ? subscription.plan : null,
          planName: isWeeklyPlan(subscription.plan) ? WEEKLY_PLANS[subscription.plan].names.fr : 'Hebdomadaire',
          minutesPerWeek: planMinutes(subscription.plan),
          fairUseMinutesUsed: Math.round((subscription.fair_use_seconds_used || 0) / 60),
          fairUseMinutes: planMinutes(subscription.plan),
          maxCallMinutes: WEEKLY_MAX_CALL_MINUTES,
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
    credits,
    prepaidMinutes: Math.floor((user.prepaid_seconds || 0) / 60),
    summaries,
  });
}
