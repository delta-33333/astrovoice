import 'server-only';
import type Stripe from 'stripe';
import { isMissingRelation } from './missing-relation';
import { recipientEmail, sendMail } from './email';
import { renewalTerms } from './renewal-copy';
import { getStripe } from './stripe';
import { getSupabaseAdmin, supabaseAvailable } from './supabase';
import { weeklyPriceId } from './stripe-prices';
import {
  WEEKLY_CURRENCIES,
  WEEKLY_MAX_CALL_SECONDS,
  WEEKLY_PLAN_IDS,
  isWeeklyPlan,
  planAllowanceSeconds,
  type WeeklyPlanId,
} from './weekly';
import { isAdvisorLang, type AdvisorLang } from './money';

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
  plan?: string | null;
  first_full_charge_at?: string | null;
  renewal_reminder_sent_at?: string | null;
  language?: string | null;
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
  let existing = await admin
    .from('subscriptions')
    .select('fair_use_period, fair_use_seconds_used, first_full_charge_at')
    .eq('stripe_subscription_id', sub.id)
    .maybeSingle();
  if (existing.error && isMissingRelation(existing.error)) {
    existing = await admin
      .from('subscriptions')
      .select('fair_use_period, fair_use_seconds_used')
      .eq('stripe_subscription_id', sub.id)
      .maybeSingle();
  }
  if (existing.error) {
    if (isMissingRelation(existing.error)) return 'missing';
    throw new Error(existing.error.message);
  }
  const samePeriod = existing.data?.fair_use_period === periodKey;
  const used = samePeriod ? Number(existing.data?.fair_use_seconds_used ?? 0) : 0;
  const currency = (sub.items?.data?.[0]?.price?.currency || sub.currency || 'eur').toLowerCase();
  const plan = isWeeklyPlan(sub.metadata?.plan) ? sub.metadata.plan : planFromPriceId(priceId(sub));
  const introWeek = sub.metadata?.introWeek === 'true';
  const storedCharge = (existing.data as { first_full_charge_at?: string | null } | null)?.first_full_charge_at ?? null;
  const firstCharge = storedCharge || (introWeek ? iso(bounds.end) : null);
  const base = {
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
  };
  const extra = {
    ...base,
    plan,
    first_full_charge_at: firstCharge,
    language: sub.metadata?.language || null,
  };
  let { error } = await admin.from('subscriptions').upsert(extra, { onConflict: 'stripe_subscription_id' });
  if (error && isMissingRelation(error)) {
    ({ error } = await admin.from('subscriptions').upsert(base, { onConflict: 'stripe_subscription_id' }));
  }
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
    const allowance = planAllowanceSeconds(await resolvePlan(row));
    const remaining = Math.max(0, allowance - (row.fair_use_seconds_used || 0));
    if (remaining <= 0) return { entitled: false, seconds: 0 };
    return { entitled: true, seconds: Math.min(WEEKLY_MAX_CALL_SECONDS, remaining) };
  } catch (error) {
    console.warn('Abonnement voix:', error instanceof Error ? error.message : error);
    return null;
  }
}

export async function recordSubscriptionUsage(userId: string, seconds: number): Promise<void> {
  if (!supabaseAvailable || seconds <= 0) return;
  const row = await loadSubscription(userId);
  if (!row || !ENTITLED.has(row.status)) return;
  const cap = planAllowanceSeconds(await resolvePlan(row)) || (row.fair_use_seconds_used || 0);
  const next = Math.min(cap, (row.fair_use_seconds_used || 0) + Math.floor(seconds));
  const { error } = await getSupabaseAdmin()
    .from('subscriptions')
    .update({ fair_use_seconds_used: next, updated_at: new Date().toISOString() })
    .eq('id', row.id);
  if (error && !isMissingRelation(error)) console.warn('Usage abonnement:', error.message);
}

export function planFromPriceId(priceId: string | null): WeeklyPlanId | null {
  if (!priceId) return null;
  for (const plan of WEEKLY_PLAN_IDS) {
    for (const currency of WEEKLY_CURRENCIES) {
      if (weeklyPriceId(plan, currency) === priceId) return plan;
    }
  }
  return null;
}

async function resolvePlan(row: SubscriptionRow): Promise<WeeklyPlanId | null> {
  if (isWeeklyPlan(row.plan)) return row.plan;
  const fromPrice = planFromPriceId(row.stripe_price_id);
  if (fromPrice) return fromPrice;
  const stripe = getStripe();
  if (!stripe || !row.stripe_subscription_id) return null;
  try {
    const sub = await stripe.subscriptions.retrieve(row.stripe_subscription_id);
    return isWeeklyPlan(sub.metadata?.plan) ? sub.metadata.plan : null;
  } catch {
    return null;
  }
}

/** Vrai si ce compte a déjà eu une formule, y compris résiliée. Le coupon d’appel ne s’applique alors plus. */
export async function everSubscribed(userId: string, stripeCustomerId?: string | null): Promise<boolean> {
  if (supabaseAvailable) {
    const { count, error } = await getSupabaseAdmin()
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (!error && (count ?? 0) > 0) return true;
    if (error && !isMissingRelation(error)) console.warn('Historique formule:', error.message);
  }
  const stripe = getStripe();
  if (!stripe || !stripeCustomerId) return false;
  try {
    const list = await stripe.subscriptions.list({ customer: stripeCustomerId, status: 'all', limit: 1 });
    return list.data.length > 0;
  } catch {
    return false;
  }
}

/** Affine la date du premier prélèvement plein à partir de invoice.upcoming, sans la repousser. */
export async function noteUpcomingFullCharge(invoice: Stripe.Invoice): Promise<void> {
  if (!supabaseAvailable) return;
  const subscriptionId = subscriptionIdFromInvoice(invoice);
  if (!subscriptionId) return;
  const attempt = (invoice as Stripe.Invoice & { next_payment_attempt?: number | null }).next_payment_attempt;
  if (!attempt) return;
  const when = new Date(attempt * 1000).toISOString();
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('subscriptions')
    .select('id, renewal_reminder_sent_at, first_full_charge_at')
    .eq('stripe_subscription_id', subscriptionId)
    .maybeSingle();
  if (error || !data) return;
  const row = data as { id: string; renewal_reminder_sent_at?: string | null; first_full_charge_at?: string | null };
  if (row.renewal_reminder_sent_at || !row.first_full_charge_at) return;
  if (new Date(when).getTime() >= new Date(row.first_full_charge_at).getTime()) return;
  const { error: updateError } = await admin.from('subscriptions').update({ first_full_charge_at: when }).eq('id', row.id);
  if (updateError && !isMissingRelation(updateError)) console.warn('Échéance formule:', updateError.message);
}

function reminderLocale(value: string | null | undefined): AdvisorLang {
  return value && isAdvisorLang(value) ? value : 'fr';
}

/** E-mail Resend 24 h avant le premier prélèvement au tarif plein. */
export async function sendDueRenewalReminders(now: Date = new Date()): Promise<{ sent: number; skipped?: string }> {
  if (!supabaseAvailable) return { sent: 0, skipped: 'base' };
  const horizon = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('subscriptions')
    .select('id, user_id, plan, currency, language, first_full_charge_at, cancel_at_period_end, status, renewal_reminder_sent_at')
    .is('renewal_reminder_sent_at', null)
    .eq('cancel_at_period_end', false)
    .in('status', ['active', 'trialing'])
    .gt('first_full_charge_at', now.toISOString())
    .lte('first_full_charge_at', horizon);
  if (error) {
    if (isMissingRelation(error)) return { sent: 0, skipped: 'migration' };
    throw new Error(error.message);
  }
  let sent = 0;
  for (const raw of data ?? []) {
    const row = raw as {
      id: string;
      user_id: string;
      plan?: string | null;
      currency?: string | null;
      language?: string | null;
      first_full_charge_at?: string | null;
    };
    if (!isWeeklyPlan(row.plan) || !row.currency || !row.first_full_charge_at) continue;
    const currency = row.currency.toLowerCase();
    if (currency !== 'eur' && currency !== 'chf' && currency !== 'gbp' && currency !== 'usd') continue;
    const { data: user } = await admin.from('users').select('email, username, display_name').eq('id', row.user_id).maybeSingle();
    const to = recipientEmail((user || {}) as { email?: string | null; username?: string | null });
    if (!to) continue;
    const locale = reminderLocale(row.language);
    const terms = renewalTerms(row.plan, currency, locale, new Date(new Date(row.first_full_charge_at).getTime() - 7 * 24 * 60 * 60 * 1000));
    const name = (user as { display_name?: string } | null)?.display_name || '';
    const ok = await sendMail({
      to,
      subject: reminderSubject(locale),
      html: reminderHtml(locale, name, terms.sentence),
    });
    if (!ok) continue;
    const { error: markError } = await admin
      .from('subscriptions')
      .update({ renewal_reminder_sent_at: now.toISOString(), updated_at: now.toISOString() })
      .eq('id', row.id)
      .is('renewal_reminder_sent_at', null);
    if (!markError) sent += 1;
  }
  return { sent };
}

function reminderSubject(locale: AdvisorLang): string {
  switch (locale) {
    case 'en':
      return 'Your Callastral plan renews at full price tomorrow';
    case 'es':
      return 'Tu fórmula Callastral se renueva a precio completo mañana';
    case 'de':
      return 'Ihre Callastral-Formel wird morgen zum vollen Preis verlängert';
    case 'it':
      return 'La tua formula Callastral si rinnova a prezzo pieno domani';
    default:
      return 'Votre formule Callastral passe au tarif plein demain';
  }
}

function reminderHtml(locale: AdvisorLang, name: string, sentence: string): string {
  const hello = locale === 'en' ? 'Hello' : locale === 'es' ? 'Hola' : locale === 'de' ? 'Guten Tag' : locale === 'it' ? 'Buongiorno' : 'Bonjour';
  const lead = locale === 'en'
    ? 'This is a reminder 24 hours before the first charge at the full weekly price.'
    : locale === 'es'
      ? 'Recordatorio 24 horas antes del primer cobro al precio semanal completo.'
      : locale === 'de'
        ? 'Erinnerung 24 Stunden vor der ersten Abbuchung zum vollen Wochenpreis.'
        : locale === 'it'
          ? 'Promemoria 24 ore prima del primo addebito al prezzo settimanale pieno.'
          : 'Rappel 24 heures avant le premier prélèvement au tarif hebdomadaire plein.';
  const account = locale === 'en'
    ? 'You can cancel in one click from your account. Access continues until the end of the week already paid.'
    : locale === 'es'
      ? 'Puede cancelar en un clic desde su cuenta. El acceso sigue hasta el final de la semana ya pagada.'
      : locale === 'de'
        ? 'Sie können mit einem Klick in Ihrem Konto kündigen. Der Zugang läuft bis zum Ende der bereits bezahlten Woche.'
        : locale === 'it'
          ? 'Puoi disdire in un clic dal tuo account. L’accesso continua fino alla fine della settimana già pagata.'
          : 'Vous pouvez résilier en un clic depuis votre compte. L’accès continue jusqu’à la fin de la semaine déjà payée.';
  const safeName = name.replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char] || char));
  const safeSentence = sentence.replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char] || char));
  return `<p>${hello} ${safeName},</p><p>${lead}</p><p>${safeSentence}</p><p>${account}</p>`;
}
