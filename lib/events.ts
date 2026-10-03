import { getSupabaseAdmin, supabaseAvailable } from './supabase';

export const EVENT_NAMES = [
  'visit',
  'signup',
  'birth_data',
  'slot_selected',
  'checkout_started',
  'paid',
  'call_started',
  'call_completed',
  'summary_bought',
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function asUuid(value: string | null | undefined): string | null {
  return value && UUID_RE.test(value) ? value : null;
}

export async function trackEvent(input: {
  name: EventName;
  userId?: string | null;
  advisorId?: string | null;
  bookingId?: string | null;
  metadata?: Record<string, string>;
}): Promise<void> {
  if (!supabaseAvailable) return;
  const { error } = await getSupabaseAdmin().from('events').insert({
    name: input.name,
    user_id: asUuid(input.userId),
    advisor_id: asUuid(input.advisorId),
    booking_id: asUuid(input.bookingId),
    metadata: input.metadata ?? {},
  });
  if (error) console.warn('Événement non enregistré:', input.name, error.message);
}
