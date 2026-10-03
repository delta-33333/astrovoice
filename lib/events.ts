import { getSupabaseAdmin, supabaseAvailable } from './supabase';

export const EVENT_NAMES = [
  'view_home',
  'view_advisor',
  'select_slot',
  'signup',
  'checkout_start',
  'payment_success',
  'call_started',
  'call_completed',
  'visit',
  'birth_data',
  'slot_selected',
  'checkout_started',
  'paid',
  'summary_bought',
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

export const FUNNEL_STEPS = [
  'view_home',
  'view_advisor',
  'select_slot',
  'signup',
  'checkout_start',
  'payment_success',
  'call_started',
  'call_completed',
] as const;

export type FunnelStep = (typeof FUNNEL_STEPS)[number];

export const FUNNEL_LABELS: Record<FunnelStep, string> = {
  view_home: 'Accueil',
  view_advisor: 'Fiche conseiller',
  select_slot: 'Créneau',
  signup: 'Compte',
  checkout_start: 'Paiement ouvert',
  payment_success: 'Paiement réussi',
  call_started: 'Appel commencé',
  call_completed: 'Appel terminé',
};

export function funnelStepOf(name: string): FunnelStep | null {
  switch (name) {
    case 'view_home':
    case 'visit':
      return 'view_home';
    case 'view_advisor':
      return 'view_advisor';
    case 'select_slot':
    case 'slot_selected':
      return 'select_slot';
    case 'signup':
      return 'signup';
    case 'checkout_start':
    case 'checkout_started':
      return 'checkout_start';
    case 'payment_success':
    case 'paid':
      return 'payment_success';
    case 'call_started':
      return 'call_started';
    case 'call_completed':
      return 'call_completed';
    default:
      return null;
  }
}

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
