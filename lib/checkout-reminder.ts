import 'server-only';
import { isAdvisorLang, type AdvisorLang } from './money';
import { renewalTerms } from './renewal-copy';
import { isWeeklyPlan, weeklyCurrency, type WeeklyCurrency, type WeeklyPlanId } from './weekly';
import { discoveryHeadline } from './book-funnel';
import { checkoutReminderMail, reminderAt, signOptOut } from './checkout-reminder-copy';
import { cancelScheduledMail, dispatchMail, recipientEmail } from './email';
import { isMissingRelation } from './missing-relation';
import { resolveMarket } from './market';
import { authSecret } from './session';
import { appBaseUrl } from './stripe';
import { getSupabaseAdmin, supabaseAvailable, type UserProfile } from './supabase';

/**
 * Un rappel Resend, programmé à l’ouverture du paiement pour une heure plus tard.
 * Pas de cron horaire : l’offre Hobby n’en autorise pas. Si la personne paie, l’envoi est annulé.
 * La migration qui crée checkout_reminders n’est pas appliquée par l’application.
 */

export async function noteCheckoutOpened(input: {
  user: UserProfile;
  checkoutSessionId: string;
  purpose: string;
  plan?: string | null;
  currency?: string | null;
  language?: string | null;
}): Promise<void> {
  if (!supabaseAvailable || !input.checkoutSessionId) return;
  const to = recipientEmail(input.user);
  const secret = authSecret();
  if (!to || !secret) return;
  try {
    const admin = getSupabaseAdmin();
    const { data: userRow, error: userError } = await admin
      .from('users')
      .select('email_checkout_opt_out')
      .eq('id', input.user.id)
      .maybeSingle();
    if (userError) {
      if (!isMissingRelation(userError)) console.warn('Opt-out rappel:', userError.message);
      return;
    }
    if ((userRow as { email_checkout_opt_out?: boolean } | null)?.email_checkout_opt_out) return;

    const when = reminderAt();
    const { error: insertError } = await admin.from('checkout_reminders').insert({
      user_id: input.user.id,
      checkout_session_id: input.checkoutSessionId,
      scheduled_for: when.toISOString(),
      status: 'scheduled',
    });
    if (insertError) {
      if (insertError.code === '23505' || isMissingRelation(insertError)) return;
      console.warn('Rappel paiement:', insertError.message);
      return;
    }

    const market = await resolveMarket().catch(() => null);
    const requestedLang = input.language || '';
    const locale: AdvisorLang = isAdvisorLang(requestedLang) ? requestedLang : market?.language || 'fr';
    const requestedPlan = input.plan || '';
    const plan: WeeklyPlanId = isWeeklyPlan(requestedPlan) ? requestedPlan : 'decouverte';
    const requestedCurrency = input.currency || '';
    const currency: WeeklyCurrency = isWeeklyCurrencySafe(requestedCurrency)
      ? requestedCurrency
      : weeklyCurrency(market?.currency || 'eur');
    const terms = renewalTerms(plan, currency, locale);
    const origin = appBaseUrl();
    const mail = checkoutReminderMail({
      locale,
      name: input.user.display_name || '',
      offer: discoveryHeadline(locale, currency),
      renewal: terms.sentence,
      resumeUrl: `${origin}/book?offer=decouverte`,
      unsubscribeUrl: `${origin}/api/email/unsubscribe?token=${encodeURIComponent(signOptOut(input.user.id, secret))}&lang=${locale}`,
    });
    const emailId = await dispatchMail({
      to,
      subject: mail.subject,
      html: mail.html,
      scheduledAt: when.toISOString(),
    });
    if (!emailId) {
      await admin.from('checkout_reminders').delete().eq('user_id', input.user.id).eq('status', 'scheduled');
      return;
    }
    const saved = await admin
      .from('checkout_reminders')
      .update({ resend_email_id: emailId })
      .eq('user_id', input.user.id)
      .eq('status', 'scheduled');
    if (saved.error && !isMissingRelation(saved.error)) console.warn('Rappel paiement:', saved.error.message);
  } catch (error) {
    console.warn('Rappel paiement:', error instanceof Error ? error.message : error);
  }
}

function isWeeklyCurrencySafe(value: string): value is WeeklyCurrency {
  return value === 'eur' || value === 'chf' || value === 'gbp' || value === 'usd';
}

export async function cancelCheckoutReminder(input: {
  userId?: string | null;
  checkoutSessionId?: string | null;
}): Promise<void> {
  if (!supabaseAvailable) return;
  if (!input.userId && !input.checkoutSessionId) return;
  try {
    const admin = getSupabaseAdmin();
    let query = admin.from('checkout_reminders').select('user_id, resend_email_id, status').eq('status', 'scheduled');
    if (input.userId) query = query.eq('user_id', input.userId);
    else if (input.checkoutSessionId) query = query.eq('checkout_session_id', input.checkoutSessionId);
    const { data, error } = await query.maybeSingle();
    if (error) {
      if (!isMissingRelation(error)) console.warn('Annulation rappel:', error.message);
      return;
    }
    const row = data as { user_id?: string; resend_email_id?: string | null } | null;
    if (!row?.user_id) return;
    if (row.resend_email_id) await cancelScheduledMail(row.resend_email_id);
    const updated = await admin
      .from('checkout_reminders')
      .update({ status: 'cancelled' })
      .eq('user_id', row.user_id)
      .eq('status', 'scheduled');
    if (updated.error && !isMissingRelation(updated.error)) console.warn('Annulation rappel:', updated.error.message);
  } catch (error) {
    console.warn('Annulation rappel:', error instanceof Error ? error.message : error);
  }
}

export async function optOutCheckoutReminder(userId: string): Promise<boolean> {
  if (!supabaseAvailable) return false;
  const admin = getSupabaseAdmin();
  const updated = await admin.from('users').update({ email_checkout_opt_out: true }).eq('id', userId);
  if (updated.error) {
    if (!isMissingRelation(updated.error)) console.warn('Désinscription rappel:', updated.error.message);
    return false;
  }
  await cancelCheckoutReminder({ userId });
  return true;
}
