import { BOOKING_DURATIONS, bookingListPriceCents, formatCurrency } from './pricing';
import { recipientEmail, sendMail } from './email';
import { getSupabaseAdmin, supabaseAvailable, type UserProfile } from './supabase';
import { appBaseUrl } from './stripe';

export type BookingDuration = (typeof BOOKING_DURATIONS)[number];

const JOIN_LEAD_MS = 5 * 60 * 1000;
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

export function canJoinCall(booking: Pick<BookingRow, 'starts_at' | 'duration_min' | 'status'>, now = new Date()): boolean {
  if (booking.status !== 'confirmed' && booking.status !== 'completed') return false;
  const start = new Date(booking.starts_at).getTime();
  const end = start + booking.duration_min * 60 * 1000;
  return now.getTime() >= start - JOIN_LEAD_MS && now.getTime() <= end;
}

export async function holdSlot(input: {
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
}> {
  if (!supabaseAvailable) throw new Error('SUPABASE_NOT_CONFIGURED');
  const { data, error } = await getSupabaseAdmin().rpc('hold_slot', {
    p_user_id: input.userId,
    p_slot_id: input.slotId,
    p_duration: input.durationMin,
    p_list_price: bookingListPriceCents(input.durationMin),
  });
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
  };
  return row;
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
    if (booking) await sendBookingConfirmation(booking);
  }
  return status;
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
<ul>
<li>Quand : ${escapeHtml(when)} (heure de Paris)</li>
<li>Durée : ${booking.duration_min} minutes</li>
<li>Montant réglé : ${escapeHtml(formatCurrency(booking.amount_cents))}</li>
</ul>
<p><a href="${link}">Rejoindre l'appel</a></p>
<p>Le lien s'ouvre 5 minutes avant le début.</p>`,
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
<p>Le lien s'ouvre 5 minutes avant le début.</p>`,
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
    await admin.from('booking_credits').insert({
      user_id: booking.user_id,
      source_booking_id: booking.id,
      amount_cents: fullValue,
      remaining_cents: fullValue,
      expires_at: expires,
    });
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
    ? `Votre consultation du ${escapeHtml(parisWhen(booking.starts_at))} est annulée. ${escapeHtml(formatCurrency(amountCents))} sera remboursé sur le moyen de paiement utilisé.`
    : `Votre consultation du ${escapeHtml(parisWhen(booking.starts_at))} est annulée. Un avoir de ${escapeHtml(formatCurrency(amountCents))} est disponible pendant 30 jours pour une nouvelle réservation.`;
  await sendMail({
    to,
    subject: 'Annulation de votre consultation',
    html: `<p>Bonjour ${escapeHtml(user.display_name || '')},</p><p>${body}</p>`,
  });
}
