import 'server-only';
import type Stripe from 'stripe';
import { isMissingRelation } from './missing-relation';
import {
  SUBSCRIPTION_FAIR_USE_SECONDS,
  SUBSCRIPTION_MAX_CALL_SECONDS,
} from './offers';
import { getStripe } from './stripe';
import { getSupabaseAdmin, supabaseAvailable } from './supabase';

export interface SubscriptionRow {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string;
  stripe_price_id: string | null;
  status: string;
  currency: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  fair_use_seconds_used: number;
  fair_use_period: string | null;
}

const ENTITLED = new Set(['active', 'trialing']);

function periodBounds(sub: Stripe.Subscription): { start: number | null; end: number | null } {
  const raw = sub as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
  };
  const item = sub.items?.data?.[0] as
    | { current_period_start?: number; current_period_end?: number; price?: { id?: string } }
    | undefined;
  return {
    start: raw.current_period_start ?? item?.current_period_start ?? null,
    end: raw.current_period_end ?? item?.current_period_end ?? null,
  };
}

function iso(unix: number | null): string | null {
  if (!unix) return null;
  return new Date(unix * 1000).toISOString();
}

function customerId(sub: Stripe.Subscription): string | null {
  if (typeof sub.customer === 'string') return sub.customer;
  return sub.customer?.id ?? null;
}

function priceId(sub: Stripe.Subscription): string | null {
  const price = sub.items?.data?.[0]?.price;
  if (!price) return null;
  return typeof price === 'string' ? price : price.id;
}

async function userIdFor(sub: Stripe.Subscription): Promise<string | null> {
  const fromMeta = sub.metadata?.userId?.trim();
  if (fromMeta) return fromMeta;
  const customer = customerId(sub);
  if (!customer || !supabaseAvailable) return null;
  const { data, error } = await getSupabaseAdmin()
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customer)
    .maybeSingle();
  if (error) {
    if (!isMissingRelation(error)) console.warn('Client Stripe:', error.message);
    return null;
  }
  return (data?.id as string | undefined) ?? null;
}

export async function syncSubscription(sub: Stripe.Subscription): Promise<'saved' | 'skipped' | 'missing'> {
  if (!supabaseAvailable) return 'skipped';
  const userId = await userIdFor(sub);
  if (!userId) {
    console.warn('Abonnement sans compte', sub.id);
    return 'skipped';
  }
  const admin = getSupabaseAdmin();
  const bounds = periodBounds(sub);
  const periodKey = bounds.start ? String(bounds.start) : null;
  const existing = await admin
    .from('subscriptions')
    .select('fair_use_period, fair_use_seconds_used')
    .eq('stripe_subscription_id', sub.id)
    .maybeSingle();
  if (existing.error) {
    if (isMissingRelation(existing.error)) return 'missing';
    throw new Error(existing.error.message);
  }
  const samePeriod = existing.data?.fair_use_period === periodKey;
  const used = samePeriod ? Number(existing.data?.fair_use_seconds_used ?? 0) : 0;
  const currency = (sub.items?.data?.[0]?.price?.currency || sub.currency || 'eur').toLowerCase();
  const { error } = await admin.from('subscriptions').upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId(sub),
      stripe_subscription_id: sub.id,
      stripe_price_id: priceId(sub),
      status: sub.status,
      currency,
      current_period_start: iso(bounds.start),
      current_period_end: iso(bounds.end),
      cancel_at_period_end: Boolean(sub.cancel_at_period_end),
      fair_use_seconds_used: Number.isFinite(used) ? used : 0,
      fair_use_period: periodKey,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'stripe_subscription_id' }
  );
  if (error) {
    if (isMissingRelation(error)) return 'missing';
    throw new Error(error.message);
  }
  return 'saved';
}

export function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const legacy = (invoice as Stripe.Invoice & { subscription?: string | { id?: string } | null }).subscription;
  if (typeof legacy === 'string') return legacy;
  if (legacy && typeof legacy === 'object' && typeof legacy.id === 'string') return legacy.id;
  const parent = invoice.parent?.subscription_details?.subscription;
  if (typeof parent === 'string') return parent;
  if (parent && typeof parent === 'object' && 'id' in parent && typeof parent.id === 'string') return parent.id;
  return null;
}

export async function syncSubscriptionById(subscriptionId: string): Promise<void> {
  const stripe = getStripe();
  if (!stripe) return;
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  await syncSubscription(sub);
}

export async function loadSubscription(userId: string): Promise<SubscriptionRow | null> {
  if (!supabaseAvailable) return null;
  const { data, error } = await getSupabaseAdmin()
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    if (isMissingRelation(error)) return null;
    throw new Error(error.message);
  }
  return (data as SubscriptionRow | null) ?? null;
}

function stillInPeriod(row: SubscriptionRow): boolean {
  if (!row.current_period_end) return true;
  return new Date(row.current_period_end).getTime() > Date.now();
}

export async function subscriptionVoiceAllowance(
  userId: string
): Promise<{ entitled: boolean; seconds: number } | null> {
  if (!supabaseAvailable) return null;
  try {
    const row = await loadSubscription(userId);
    if (!row) return { entitled: false, seconds: 0 };
    if (!ENTITLED.has(row.status) || !stillInPeriod(row)) return { entitled: false, seconds: 0 };
    const remaining = Math.max(0, SUBSCRIPTION_FAIR_USE_SECONDS - (row.fair_use_seconds_used || 0));
    if (remaining <= 0) return { entitled: false, seconds: 0 };
    return { entitled: true, seconds: Math.min(SUBSCRIPTION_MAX_CALL_SECONDS, remaining) };
  } catch (error) {
    console.warn('Abonnement voix:', error instanceof Error ? error.message : error);
    return null;
  }
}

export async function recordSubscriptionUsage(userId: string, seconds: number): Promise<void> {
  if (!supabaseAvailable || seconds <= 0) return;
  const row = await loadSubscription(userId);
  if (!row || !ENTITLED.has(row.status)) return;
  const next = Math.min(SUBSCRIPTION_FAIR_USE_SECONDS, (row.fair_use_seconds_used || 0) + Math.floor(seconds));
  const { error } = await getSupabaseAdmin()
    .from('subscriptions')
    .update({ fair_use_seconds_used: next, updated_at: new Date().toISOString() })
    .eq('id', row.id);
  if (error && !isMissingRelation(error)) console.warn('Usage abonnement:', error.message);
}
