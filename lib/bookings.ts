import { trackEvent } from './events';
import { AI_ACT_LINE } from './legal';
import { ensureImmediateAvailability } from './slots';
import { resolveMarket } from './market';
import {
  formatMoney,
  localBookingMinor,
  MAX_EUR_CENTS,
  MIN_EUR_CENTS,
  normalizeCurrency,
  pricePerMinCents,
  type Currency,
} from './money';
import { BOOKING_DURATIONS } from './pricing';
import { recipientEmail, sendMail } from './email';
import { attachRebook, consumeRebookOnBooking, discountedMinor, pendingRebook } from './rebook';
import { subscriptionVoiceAllowance } from './subscriptions';
import { getSupabaseAdmin, supabaseAvailable, type UserProfile } from './supabase';
import { appBaseUrl } from './stripe';

export type BookingDuration = (typeof BOOKING_DURATIONS)[number];

// Aligné sur la fenêtre « Maintenant » (15 min) : un client qui paie « Appeler maintenant »
// pour un créneau qui démarre dans 6 à 15 min doit pouvoir rejoindre tout de suite.
export const JOIN_LEAD_MS = 15 * 60 * 1000;
const IMMEDIATE_MS = 15 * 60 * 1000;

export function isBookingDuration(value: number): value is BookingDuration {
  return BOOKING_DURATIONS.includes(value as BookingDuration);
}

export interface BookingRow {
  id: string;
  user_id: string;
  advisor_id: string;
  slot_id: string;
  starts_at: string;
  duration_min: number;
  list_price_cents: number;
  credit_cents: number;
  amount_cents: number;
  credit_id: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  currency?: string | null;
  hold_expires_at: string | null;
  reminder_sent_at: string | null;
  confirmed_at: string | null;
}

function parisWhen(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function joinOpensAt(startsAt: string): Date {
  return new Date(new Date(startsAt).getTime() - JOIN_LEAD_MS);
}

export function isImmediateStart(startsAt: string, now = new Date()): boolean {
  return new Date(startsAt).getTime() - now.getTime() <= IMMEDIATE_MS;
}

function missingColumn(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const message = error.message || '';
  return error.code === '42703' || error.code === 'PGRST204' || /does not exist/i.test(message);
}

function oldHoldSignature(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const message = error.message || '';
  return error.code === 'PGRST202' || /schema cache/i.test(message) || /p_currency/i.test(message);
}

async function eurPriceForSlot(slotId: string): Promise<number> {
  const admin = getSupabaseAdmin();
  const { data: slot, error: slotError } = await admin
    .from('slots')
    .select('advisor_id')
    .eq('id', slotId)
    .maybeSingle();
  if (slotError || !slot?.advisor_id) throw new Error('UNAVAILABLE');

  const full = await admin
    .from('advisors')
    .select('age, specialties, years_experience, price_per_min_cents')
    .eq('id', slot.advisor_id)
    .maybeSingle();

  if (full.error && missingColumn(full.error)) {
    const basic = await admin
      .from('advisors')
      .select('age, specialties')
      .eq('id', slot.advisor_id)
      .maybeSingle();
    if (basic.error || !basic.data) throw new Error('UNAVAILABLE');
    return pricePerMinCents({
      age: basic.data.age,
      specialties: basic.data.specialties ?? [],
    });
  }
  if (full.error || !full.data) throw new Error('UNAVAILABLE');
  const stored = full.data.price_per_min_cents;
  if (typeof stored === 'number' && stored >= MIN_EUR_CENTS && stored <= MAX_EUR_CENTS) return stored;
  return pricePerMinCents({
    years: full.data.years_experience,
    age: full.data.age,
    specialties: full.data.specialties ?? [],
  });
}

function money(minor: number, currency: string | null | undefined): string {
  return formatMoney(minor, normalizeCurrency(currency));
}

export function canJoinCall(booking: Pick<BookingRow, 'starts_at' | 'duration_min' | 'status'>, now = new Date()): boolean {
  if (booking.status !== 'confirmed' && booking.status !== 'completed') return false;
  const start = new Date(booking.starts_at).getTime();
  const end = start + booking.duration_min * 60 * 1000;
  return now.getTime() >= start - JOIN_LEAD_MS && now.getTime() <= end;
}

export interface HoldResult {
  bookingId: string;
  amountCents: number;
  creditCents: number;
  listPriceCents: number;
  startsAt: string;
  holdExpiresAt: string;
  currency: Currency;
  included: boolean;
  slotId: string;
  reallocated: boolean;
}

/**
 * Bloque un créneau. Pour « Appeler maintenant » (immediate), un créneau périmé (début passé,
 * supprimé, retenu ailleurs) n’est jamais bloquant : on prend ou crée côté serveur un créneau
 * immédiat valable pour le même conseiller. ADVISOR_BUSY seulement s’il est réellement occupé.
 */
export async function holdSlot(input: {
  userId: string;
  slotId: string;
  durationMin: BookingDuration;
  advisorId?: string | null;
  immediate?: boolean;
}): Promise<HoldResult> {
  if (!supabaseAvailable) throw new Error('SUPABASE_NOT_CONFIGURED');
  const admin = getSupabaseAdmin();
  let advisorId = input.advisorId ?? null;
  if (input.immediate) {
    const { data: slotRow } = await admin
      .from('slots')
      .select('advisor_id')
      .eq('id', input.slotId)
      .maybeSingle();
    if (slotRow?.advisor_id) advisorId = slotRow.advisor_id as string;
  }

  try {
    const held = await holdExactSlot(input);
    return { ...held, slotId: input.slotId, reallocated: false };
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (!input.immediate || !advisorId || (code !== 'UNAVAILABLE' && code !== 'HELD')) throw error;
  }

  const { data: freshId, error: allocError } = await admin.rpc('allocate_immediate_slot', {
    p_advisor_id: advisorId,
    p_user_id: input.userId,
  });
  if (allocError) {
    console.error('allocate_immediate_slot:', allocError.message);
    throw new Error('HOLD_FAILED');
  }
  if (!freshId) throw new Error('ADVISOR_BUSY');
  const held = await holdExactSlot({ ...input, slotId: String(freshId) });
  return { ...held, slotId: String(freshId), reallocated: true };
}

/** Propositions en un geste quand le conseiller est réellement occupé. */
export async function busyAlternatives(advisorId: string | null): Promise<{
  nextSlot: { id: string; startsAt: string; advisorId: string } | null;
  alternative: { advisorId: string; name: string; slotId: string; startsAt: string } | null;
}> {
  if (!supabaseAvailable) return { nextSlot: null, alternative: null };
  const admin = getSupabaseAdmin();
  const soon = new Date(Date.now() + 60 * 1000).toISOString();
  let nextSlot: { id: string; startsAt: string; advisorId: string } | null = null;
  let languages: string[] = [];
  if (advisorId) {
    const [{ data: next }, { data: adv }] = await Promise.all([
      admin
        .from('slots')
        .select('id, starts_at')
        .eq('advisor_id', advisorId)
        .eq('status', 'available')
        .gt('starts_at', soon)
        .order('starts_at', { ascending: true })
        .limit(1)
        .maybeSingle(),
      admin.from('advisors').select('languages').eq('id', advisorId).maybeSingle(),
    ]);
    if (next) nextSlot = { id: next.id as string, startsAt: next.starts_at as string, advisorId };
    languages = ((adv?.languages as string[] | null) ?? []).slice(0, 5);
  }
  const horizon = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  const { data: candidates } = await admin
    .from('slots')
    .select('id, starts_at, advisor_id, advisors!inner(first_name, last_name, languages, active)')
    .eq('status', 'available')
    .gt('starts_at', soon)
    .lte('starts_at', horizon)
    .order('starts_at', { ascending: true })
    .limit(50);
  type Candidate = {
    id: string;
    starts_at: string;
    advisor_id: string;
    advisors: { first_name: string; last_name: string; languages: string[] | null; active: boolean } | null;
  };
  const list = ((candidates ?? []) as unknown as Candidate[]).filter(
    (row) => row.advisor_id !== advisorId && row.advisors?.active
  );
  const pick =
    list.find((row) => languages.length === 0 || (row.advisors?.languages ?? []).some((lang) => languages.includes(lang))) ??
    list[0];
  const alternative = pick
    ? {
        advisorId: pick.advisor_id,
        name: `${pick.advisors?.first_name ?? ''} ${pick.advisors?.last_name ?? ''}`.trim(),
        slotId: pick.id,
        startsAt: pick.starts_at,
      }
    : null;
  return { nextSlot, alternative };
}

async function holdExactSlot(input: {
  userId: string;
  slotId: string;
  durationMin: BookingDuration;
}): Promise<{
  bookingId: string;
  amountCents: number;
  creditCents: number;
  listPriceCents: number;
  startsAt: string;
  holdExpiresAt: string;
  currency: Currency;
  included: boolean;
}> {
  if (!supabaseAvailable) throw new Error('SUPABASE_NOT_CONFIGURED');
  try {
    await ensureImmediateAvailability();
  } catch (error) {
    console.warn('Créneaux immédiats:', error instanceof Error ? error.message : error);
  }

  const market = await resolveMarket();
  const eurPerMin = await eurPriceForSlot(input.slotId);
  const chargeCurrency = market.currency;
  const offer = await pendingRebook(input.userId);
  const allowance = await subscriptionVoiceAllowance(input.userId);
  const included =
    Boolean(allowance?.entitled) && (allowance?.seconds ?? 0) >= input.durationMin * 60;
  const priceFor = (currency: Currency) => {
    if (included) return { charge: 0, offerId: null as string | null };
    const list = localBookingMinor(eurPerMin, input.durationMin, currency, market.rates);
    if (!offer) return { charge: list, offerId: null as string | null };
    const charge = discountedMinor(list, offer.percent);
    return { charge, offerId: charge < list ? offer.id : null };
  };
  let priced = priceFor(chargeCurrency);
  const admin = getSupabaseAdmin();

  let { data, error } = await admin.rpc('hold_slot', {
    p_user_id: input.userId,
    p_slot_id: input.slotId,
    p_duration: input.durationMin,
    p_list_price: priced.charge,
    p_currency: chargeCurrency,
  });

  let currency: Currency = chargeCurrency;
  if (error && oldHoldSignature(error)) {
    currency = 'eur';
    priced = priceFor('eur');
    ({ data, error } = await admin.rpc('hold_slot', {
      p_user_id: input.userId,
      p_slot_id: input.slotId,
      p_duration: input.durationMin,
      p_list_price: priced.charge,
    }));
  }

  if (error) {
    const message = error.message || '';
    if (message.includes('held')) throw new Error('HELD');
    if (message.includes('unavailable') || message.includes('invalid')) throw new Error('UNAVAILABLE');
    console.error('hold_slot:', message);
    throw new Error('HOLD_FAILED');
  }
  const row = data as {
    bookingId: string;
    amountCents: number;
    creditCents: number;
    listPriceCents: number;
    startsAt: string;
    holdExpiresAt: string;
    currency?: string;
  };
  if (priced.offerId) await attachRebook(row.bookingId, priced.offerId);
  return { ...row, currency: normalizeCurrency(row.currency || currency), included };
}

export async function getBooking(id: string): Promise<BookingRow | null> {
  if (!supabaseAvailable) return null;
  const { data, error } = await getSupabaseAdmin()
    .from('bookings')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as BookingRow | null) ?? null;
}

export async function confirmBookingPayment(input: {
  bookingId: string;
  checkoutSessionId: string;
  paymentIntentId: string | null;
}): Promise<'confirmed' | 'already' | 'missing' | 'invalid'> {
  if (!supabaseAvailable) throw new Error('SUPABASE_NOT_CONFIGURED');
  const { data, error } = await getSupabaseAdmin().rpc('confirm_booking_payment', {
    p_booking_id: input.bookingId,
    p_session_id: input.checkoutSessionId,
    p_payment_intent: input.paymentIntentId ?? '',
  });
  if (error) throw new Error(error.message);
  const status = String(data) as 'confirmed' | 'already' | 'missing' | 'invalid';
  if (status === 'confirmed') {
    const booking = await getBooking(input.bookingId);
    if (booking) {
      await consumeRebookOnBooking(booking.id);
      await sendBookingConfirmation(booking);
      await trackEvent({
        name: 'payment_success',
        userId: booking.user_id,
        advisorId: booking.advisor_id,
        bookingId: booking.id,
        metadata: { purpose: 'booking' },
      });
      if (await isRepeatBooking(booking)) {
        await trackEvent({
          name: 'rebook',
          userId: booking.user_id,
          advisorId: booking.advisor_id,
          bookingId: booking.id,
          metadata: { purpose: 'booking' },
        });
      }
    }
  }
  return status;
}

/** Vrai si le client avait déjà une consultation payée ou réalisée avant celle-ci. */
export async function isRepeatBooking(booking: Pick<BookingRow, 'id' | 'user_id'>): Promise<boolean> {
  if (!supabaseAvailable) return false;
  const { count } = await getSupabaseAdmin()
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', booking.user_id)
    .neq('id', booking.id)
    .in('status', ['confirmed', 'completed']);
  return (count ?? 0) > 0;
}

async function advisorName(advisorId: string): Promise<string> {
  const { data } = await getSupabaseAdmin()
    .from('advisors')
    .select('first_name, last_name')
    .eq('id', advisorId)
    .maybeSingle();
  if (!data) return 'votre conseiller';
  return `${data.first_name} ${data.last_name}`;
}

export async function sendBookingConfirmation(booking: BookingRow): Promise<void> {
  const { data: user } = await getSupabaseAdmin()
    .from('users')
    .select('email, username, display_name')
    .eq('id', booking.user_id)
    .maybeSingle();
  if (!user) return;
  const to = recipientEmail(user);
  if (!to) return;
  const name = await advisorName(booking.advisor_id);
  const origin = appBaseUrl();
  const link = `${origin}/call/${booking.id}`;
  const when = parisWhen(booking.starts_at);
  await sendMail({
    to,
    subject: 'Votre consultation Callastral est confirmée',
    html: `<p>Bonjour ${escapeHtml(user.display_name || '')},</p>
<p>Votre consultation avec ${escapeHtml(name)} est confirmée.</p>
<p>${escapeHtml(AI_ACT_LINE.fr)}</p>
<ul>
<li>Quand : ${escapeHtml(when)} (heure de Paris)</li>
<li>Durée : ${booking.duration_min} minutes</li>
<li>Montant réglé : ${escapeHtml(money(booking.amount_cents, booking.currency))}</li>
</ul>
<p><a href="${link}">Rejoindre l'appel</a></p>
<p>Le lien s'ouvre 15 minutes avant le début.</p>`,
  });
}

export async function sendBookingReminder(booking: BookingRow): Promise<boolean> {
  const { data: user } = await getSupabaseAdmin()
    .from('users')
    .select('email, username, display_name')
    .eq('id', booking.user_id)
    .maybeSingle();
  if (!user) return false;
  const to = recipientEmail(user);
  if (!to) return false;
  const name = await advisorName(booking.advisor_id);
  const origin = appBaseUrl();
  const sent = await sendMail({
    to,
    subject: 'Votre consultation commence bientôt',
    html: `<p>Bonjour ${escapeHtml(user.display_name || '')},</p>
<p>Votre consultation avec ${escapeHtml(name)} commence à ${escapeHtml(parisWhen(booking.starts_at))} (heure de Paris).</p>
<p><a href="${origin}/call/${booking.id}">Rejoindre l'appel</a></p>
<p>Le lien s'ouvre 15 minutes avant le début.</p>`,
  });
  return sent;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function sendDueReminders(): Promise<{ sent: number }> {
  if (!supabaseAvailable) throw new Error('SUPABASE_NOT_CONFIGURED');
  const now = Date.now();
  const from = new Date(now + 12 * 60 * 1000).toISOString();
  const to = new Date(now + 32 * 60 * 1000).toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from('bookings')
    .select('*')
    .eq('status', 'confirmed')
    .is('reminder_sent_at', null)
    .gt('starts_at', from)
    .lte('starts_at', to)
    .limit(50);
  if (error) throw new Error(error.message);

  let sent = 0;
  for (const booking of (data ?? []) as BookingRow[]) {
    const ok = await sendBookingReminder(booking);
    if (!ok) continue;
    const update = await getSupabaseAdmin()
      .from('bookings')
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq('id', booking.id)
      .is('reminder_sent_at', null);
    if (!update.error) sent += 1;
  }
  return { sent };
}

export async function cancelBooking(booking: BookingRow, user: UserProfile): Promise<{
  mode: 'refund' | 'credit';
  amountCents: number;
}> {
  if (booking.user_id !== user.id) throw new Error('FORBIDDEN');
  if (booking.status !== 'confirmed') throw new Error('INVALID');
  const start = new Date(booking.starts_at).getTime();
  if (start <= Date.now()) throw new Error('TOO_LATE');
  // Appel déjà commencé en avance (fenêtre de 15 min) : plus d'annulation.
  const started = await getSupabaseAdmin()
    .from('call_sessions')
    .select('id')
    .eq('booking_id', booking.id)
    .limit(1);
  if (!started.error && (started.data?.length ?? 0) > 0) throw new Error('TOO_LATE');

  const minutesBefore = (start - Date.now()) / 60000;
  const fullValue = booking.amount_cents + booking.credit_cents;
  const admin = getSupabaseAdmin();

  if (minutesBefore >= 1440) {
    if (booking.stripe_payment_intent_id && booking.amount_cents > 0) {
      const { getStripe } = await import('./stripe');
      const stripe = getStripe();
      if (!stripe) throw new Error('STRIPE_NOT_CONFIGURED');
      await stripe.refunds.create(
        {
          payment_intent: booking.stripe_payment_intent_id,
          amount: booking.amount_cents,
        },
        { idempotencyKey: `refund_${booking.id}` }
      );
    }
    if (booking.credit_cents > 0 && booking.credit_id) {
      const { data: credit } = await admin
        .from('booking_credits')
        .select('remaining_cents')
        .eq('id', booking.credit_id)
        .maybeSingle();
      if (credit) {
        await admin
          .from('booking_credits')
          .update({ remaining_cents: credit.remaining_cents + booking.credit_cents })
          .eq('id', booking.credit_id);
      }
    }
    await markCancelled(booking.id, booking.slot_id);
    await sendCancellationMail(user, booking, 'refund', booking.amount_cents);
    return { mode: 'refund', amountCents: booking.amount_cents };
  }

  if (fullValue > 0) {
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const creditCurrency = normalizeCurrency(booking.currency);
    const inserted = await admin.from('booking_credits').insert({
      user_id: booking.user_id,
      source_booking_id: booking.id,
      amount_cents: fullValue,
      remaining_cents: fullValue,
      expires_at: expires,
      currency: creditCurrency,
    });
    if (inserted.error && missingColumn(inserted.error) && creditCurrency === 'eur') {
      const retry = await admin.from('booking_credits').insert({
        user_id: booking.user_id,
        source_booking_id: booking.id,
        amount_cents: fullValue,
        remaining_cents: fullValue,
        expires_at: expires,
      });
      if (retry.error) throw new Error(retry.error.message);
    } else if (inserted.error) {
      throw new Error(inserted.error.message);
    }
  }
  await markCancelled(booking.id, booking.slot_id);
  await sendCancellationMail(user, booking, 'credit', fullValue);
  return { mode: 'credit', amountCents: fullValue };
}

async function markCancelled(bookingId: string, slotId: string): Promise<void> {
  const admin = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { error } = await admin
    .from('bookings')
    .update({ status: 'cancelled', cancelled_at: now })
    .eq('id', bookingId)
    .eq('status', 'confirmed');
  if (error) throw new Error(error.message);
  await admin
    .from('slots')
    .update({ status: 'available', booking_id: null, hold_expires_at: null })
    .eq('id', slotId)
    .eq('status', 'booked')
    .gt('starts_at', now);
}

async function sendCancellationMail(
  user: UserProfile,
  booking: BookingRow,
  mode: 'refund' | 'credit',
  amountCents: number
): Promise<void> {
  const to = recipientEmail(user);
  if (!to) return;
  const body = mode === 'refund'
    ? `Votre consultation du ${escapeHtml(parisWhen(booking.starts_at))} est annulée. ${escapeHtml(money(amountCents, booking.currency))} sera remboursé sur le moyen de paiement utilisé.`
    : `Votre consultation du ${escapeHtml(parisWhen(booking.starts_at))} est annulée. Un avoir de ${escapeHtml(money(amountCents, booking.currency))} est disponible pendant 30 jours pour une nouvelle réservation.`;
  await sendMail({
    to,
    subject: 'Annulation de votre consultation',
    html: `<p>Bonjour ${escapeHtml(user.display_name || '')},</p><p>${body}</p>`,
  });
}
