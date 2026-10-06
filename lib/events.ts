import {
  FIRST_TOUCH_COOKIE,
  VISITOR_COOKIE,
  cleanPath,
  cleanReferrer,
  decodeFirstTouch,
  isBotUserAgent,
  validVisitorId,
  type Utm,
} from './attribution';
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
  'call_reengage',
  'call_silence_end',
  'page_view',
  'book_click',
  'signup_view',
  'birth_start',
  'rebook',
] as const;

/** Anciens noms en double, conservés lisibles : la vue SQL events_canonical applique la même table. */
export const LEGACY_EVENT_NAMES: Partial<Record<string, EventName>> = {
  visit: 'view_home',
  slot_selected: 'select_slot',
  checkout_started: 'checkout_start',
  paid: 'payment_success',
};

export function canonicalEventName(name: string): string {
  return LEGACY_EVENT_NAMES[name] ?? name;
}

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

export type EventContext = {
  visitorId?: string | null;
  path?: string | null;
  referrer?: string | null;
  utm?: Utm;
};

type ResolvedContext = {
  visitor_id: string | null;
  path: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  user_agent: string | null;
  is_bot: boolean;
};

const EMPTY_CONTEXT: ResolvedContext = {
  visitor_id: null,
  path: null,
  referrer: null,
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  user_agent: null,
  is_bot: false,
};

/** Contexte de la requête en cours (cookie visiteur, référent, UTM, navigateur). Aucun en dehors d'une requête. */
async function requestContext(given: EventContext | undefined, userId: string | null): Promise<ResolvedContext> {
  try {
    const { cookies, headers } = await import('next/headers');
    const head = await headers();
    const jar = await cookies();
    const userAgent = head.get('user-agent') || '';
    // Webhooks Stripe : pas de visiteur à attribuer.
    if (/^Stripe\//i.test(userAgent)) return EMPTY_CONTEXT;
    const host = head.get('host') || '';
    const rawReferer = head.get('referer');
    let refererPath: string | undefined;
    try {
      if (rawReferer && new URL(rawReferer).host === host) refererPath = new URL(rawReferer).pathname;
    } catch {
      refererPath = undefined;
    }
    const firstTouch = decodeFirstTouch(jar.get(FIRST_TOUCH_COOKIE)?.value);
    const utm = given?.utm && Object.keys(given.utm).length > 0 ? given.utm : firstTouch ?? {};
    const visitor =
      validVisitorId(given?.visitorId) ??
      validVisitorId(jar.get(VISITOR_COOKIE)?.value) ??
      validVisitorId(head.get('x-cl-vid'));
    const referrer =
      given && 'referrer' in given ? cleanReferrer(given.referrer) : refererPath ? undefined : cleanReferrer(rawReferer);
    return {
      visitor_id: visitor,
      path: cleanPath(given?.path ?? refererPath) ?? null,
      referrer: referrer ?? null,
      utm_source: utm.utm_source ?? null,
      utm_medium: utm.utm_medium ?? null,
      utm_campaign: utm.utm_campaign ?? null,
      user_agent: userAgent.slice(0, 300) || null,
      // Les comptes connectés ne sont pas des robots ; un visiteur anonyme l'est si son navigateur l'indique.
      is_bot: !userId && isBotUserAgent(userAgent),
    };
  } catch {
    return EMPTY_CONTEXT;
  }
}

export async function trackEvent(input: {
  name: EventName;
  userId?: string | null;
  advisorId?: string | null;
  bookingId?: string | null;
  metadata?: Record<string, string>;
  /** Contexte explicite (page, référent, UTM), ou `false` hors parcours visiteur (webhook, tâche planifiée). */
  context?: EventContext | false;
}): Promise<void> {
  if (!supabaseAvailable) return;
  const userId = asUuid(input.userId);
  const context = input.context === false ? EMPTY_CONTEXT : await requestContext(input.context, userId);
  const { error } = await getSupabaseAdmin().from('events').insert({
    name: input.name,
    user_id: userId,
    advisor_id: asUuid(input.advisorId),
    booking_id: asUuid(input.bookingId),
    metadata: input.metadata ?? {},
    ...context,
  });
  if (error) console.warn('Événement non enregistré:', input.name, error.message);
}

/**
 * Première source du compte (UTM, référent, page d'arrivée), prise du cookie first-touch posé par le
 * middleware, sinon du premier événement de ce visiteur. N'écrase jamais une source déjà enregistrée.
 */
export async function recordFirstTouch(userId: string): Promise<void> {
  if (!supabaseAvailable || !asUuid(userId)) return;
  try {
    const { cookies, headers } = await import('next/headers');
    const jar = await cookies();
    const head = await headers();
    const visitorId = validVisitorId(jar.get(VISITOR_COOKIE)?.value) ?? validVisitorId(head.get('x-cl-vid'));
    const touch = decodeFirstTouch(jar.get(FIRST_TOUCH_COOKIE)?.value);
    const admin = getSupabaseAdmin();
    let row: Record<string, string | null> = {
      first_utm_source: touch?.utm_source ?? null,
      first_utm_medium: touch?.utm_medium ?? null,
      first_utm_campaign: touch?.utm_campaign ?? null,
      first_referrer: touch?.referrer ?? null,
      first_landing_page: touch?.landing ?? null,
      first_seen_at: touch?.at ?? null,
    };
    if (!touch && visitorId) {
      const { data } = await admin
        .from('events')
        .select('path, referrer, utm_source, utm_medium, utm_campaign, created_at')
        .eq('visitor_id', visitorId)
        .eq('is_bot', false)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (data) {
        const first = data as Record<string, string | null>;
        row = {
          first_utm_source: first.utm_source,
          first_utm_medium: first.utm_medium,
          first_utm_campaign: first.utm_campaign,
          first_referrer: first.referrer,
          first_landing_page: first.path,
          first_seen_at: first.created_at,
        };
      }
    }
    const { error } = await admin
      .from('users')
      .update({ ...row, first_visitor_id: visitorId, first_seen_at: row.first_seen_at ?? new Date().toISOString() })
      .eq('id', userId)
      .is('first_seen_at', null);
    if (error) console.warn('Première source non enregistrée:', error.message);
  } catch (error) {
    console.warn('Première source non enregistrée:', error instanceof Error ? error.message : error);
  }
}
