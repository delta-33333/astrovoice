import { EVENT_NAMES, type EventName } from './events';
import { getStripe } from './stripe';
import { getSupabaseAdmin, supabaseAvailable } from './supabase';

export interface FunnelDay {
  day: string;
  counts: Record<EventName, number>;
}

function parisDay(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));
}

export async function loadFunnel(days = 14): Promise<{ days: FunnelDay[]; unavailable: boolean }> {
  const empty = (day: string): FunnelDay => ({
    day,
    counts: Object.fromEntries(EVENT_NAMES.map((name) => [name, 0])) as Record<EventName, number>,
  });
  const today = new Date();
  const rows: FunnelDay[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today.getTime() - offset * 24 * 60 * 60 * 1000);
    rows.push(empty(parisDay(date.toISOString())));
  }
  if (!supabaseAvailable) return { days: rows, unavailable: true };

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from('events')
    .select('name, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: true })
    .limit(8000);
  if (error) {
    console.warn('Entonnoir:', error.message);
    return { days: rows, unavailable: true };
  }
  const byDay = new Map(rows.map((row) => [row.day, row]));
  for (const event of data ?? []) {
    const name = event.name as EventName;
    if (!EVENT_NAMES.includes(name)) continue;
    const bucket = byDay.get(parisDay(event.created_at as string));
    if (bucket) bucket.counts[name] += 1;
  }
  return { days: rows, unavailable: false };
}

export async function loadRows<T>(table: string, columns: string, order: string, limit = 80): Promise<T[]> {
  if (!supabaseAvailable) return [];
  const { data, error } = await getSupabaseAdmin()
    .from(table)
    .select(columns)
    .order(order, { ascending: false })
    .limit(limit);
  if (error) {
    console.warn(table, error.message);
    return [];
  }
  return (data ?? []) as T[];
}

export async function loadStripePayments(): Promise<Array<{
  id: string;
  amount: number;
  status: string;
  created: number;
  purpose: string;
  currency: string;
}>> {
  const stripe = getStripe();
  if (!stripe) return [];
  try {
    const list = await stripe.paymentIntents.list({ limit: 30 });
    return list.data.map((intent) => ({
      id: intent.id,
      amount: intent.amount_received || intent.amount,
      status: intent.status,
      created: intent.created,
      purpose: intent.metadata?.purpose || '',
      currency: intent.currency || 'eur',
    }));
  } catch (error) {
    console.warn('Paiements Stripe:', error instanceof Error ? error.message : error);
    return [];
  }
}
