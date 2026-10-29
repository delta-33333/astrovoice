import 'server-only';
import { commissionCents, validRefCode } from './affiliate';
import { getSupabaseAdmin, supabaseAvailable } from './supabase';

/**
 * Enregistre la commission sur le PREMIER paiement d’un client parrainé.
 * customer_key unique : les paiements suivants du même client sont ignorés.
 */
export async function recordReferral(input: {
  ref: unknown;
  customerKey: string | null | undefined;
  stripeObjectId: string;
  amountCents: number | null | undefined;
  currency: string | null | undefined;
  purpose?: string | null;
}): Promise<'saved' | 'skipped' | 'duplicate' | 'error'> {
  const code = validRefCode(input.ref);
  const amount = input.amountCents ?? 0;
  if (!code || !supabaseAvailable || amount <= 0) return 'skipped';
  const customerKey = (input.customerKey || '').trim().toLowerCase() || `obj:${input.stripeObjectId}`;
  const admin = getSupabaseAdmin();
  const { data: affiliate, error } = await admin
    .from('affiliates')
    .select('id, status, commission_rate')
    .eq('code', code)
    .maybeSingle();
  if (error) {
    console.warn('Affiliation:', error.message);
    return 'error';
  }
  if (!affiliate || affiliate.status !== 'active') return 'skipped';
  const insert = await admin.from('referrals').insert({
    affiliate_id: affiliate.id,
    ref_code: code,
    customer_key: customerKey.slice(0, 200),
    stripe_object_id: input.stripeObjectId,
    purpose: input.purpose ?? null,
    amount_cents: amount,
    currency: (input.currency || 'eur').toLowerCase(),
    commission_cents: commissionCents(amount, Number(affiliate.commission_rate) || undefined),
  });
  if (insert.error) {
    if (insert.error.code === '23505') return 'duplicate';
    console.warn('Affiliation insert:', insert.error.message);
    return 'error';
  }
  return 'saved';
}
