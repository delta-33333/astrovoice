import 'server-only';
import type Stripe from 'stripe';
import { createPasswordlessUser, findUserByEmail } from './auth';
import { grantPrepaidCredits, isPrepaidPaidSession } from './credits';
import { normalizeEmail } from './form-checks';
import { isGuestCheckout } from './guest-checkout-rules';
import { getSupabaseAdmin, supabaseAvailable } from './supabase';

export type GuestAttachResult = {
  userId: string;
  createdAt: string | null;
  passwordHash: string | null;
  granted: boolean;
  already: boolean;
};

function firstNameFrom(name: string | null | undefined): string {
  const first = (name || '').trim().split(/\s+/)[0] || '';
  return first.slice(0, 60);
}

async function findOrCreateByEmail(email: string, name: string): Promise<string | null> {
  const existing = await findUserByEmail(email);
  if (existing) return existing.id;
  const created = await createPasswordlessUser(email, name);
  if (created.success && created.userId) return created.userId;
  // Course webhook / page de retour : l’autre appel vient de créer le compte.
  const again = await findUserByEmail(email);
  return again?.id ?? null;
}

/**
 * Après un achat invité payé : trouve ou crée le compte par l’e-mail saisi dans Stripe,
 * relie le client Stripe et crédite les minutes (une seule fois par Checkout Session).
 */
export async function attachGuestPrepaid(session: Stripe.Checkout.Session): Promise<GuestAttachResult | null> {
  if (!supabaseAvailable) return null;
  if (!isGuestCheckout(session.metadata) || !isPrepaidPaidSession(session)) return null;
  const email = normalizeEmail(session.customer_details?.email);
  if (!email) return null;

  const userId = await findOrCreateByEmail(email, firstNameFrom(session.customer_details?.name));
  if (!userId) return null;

  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from('users')
    .select('created_at, password_hash, stripe_customer_id')
    .eq('id', userId)
    .maybeSingle();
  const customer = typeof session.customer === 'string' ? session.customer : session.customer?.id;
  if (customer && data && !data.stripe_customer_id) {
    await admin.from('users').update({ stripe_customer_id: customer }).eq('id', userId);
  }

  const result = await grantPrepaidCredits(
    { ...session, metadata: { ...(session.metadata || {}), userId } } as Stripe.Checkout.Session,
    { allowCookie: false }
  );
  return {
    userId,
    createdAt: (data?.created_at as string | null) ?? null,
    passwordHash: (data?.password_hash as string | null) ?? null,
    granted: result.granted,
    already: result.already ?? false,
  };
}
