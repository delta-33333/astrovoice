import { getSupabaseAdmin, supabaseAvailable } from './supabase';
import {
  GUARANTEE_EXCLUDED_PAYMENT_INTENTS,
  GUARANTEE_MAX_SECONDS,
  GUARANTEE_WINDOW_HOURS,
} from './guarantee-text';

export * from './guarantee-text';

export interface GuaranteeCandidate {
  booking_id: string;
  advisor_id: string;
  starts_at: string;
  ended_at: string;
  billed_seconds: number;
  amount_cents: number;
  credit_cents: number;
  currency: string;
}

export interface GuaranteeClaimRow {
  id: string;
  booking_id: string;
  status: 'pending' | 'refunded' | 'credited';
  amount_cents: number;
  credit_cents: number;
  currency: string;
  created_at: string;
}

/** Règle pure, identique à la fonction SQL (utilisée pour les tests). */
export function isGuaranteeEligible(input: {
  status: string;
  amountCents: number;
  creditCents: number;
  paymentIntent: string | null;
  endedAt: string | null;
  billedSeconds: number | null;
  alreadyClaimed: boolean;
  now?: Date;
}): boolean {
  const now = (input.now ?? new Date()).getTime();
  if (input.alreadyClaimed) return false;
  if (input.status !== 'confirmed' && input.status !== 'completed') return false;
  if (input.amountCents <= 0 && input.creditCents <= 0) return false;
  if (input.paymentIntent && GUARANTEE_EXCLUDED_PAYMENT_INTENTS.has(input.paymentIntent)) return false;
  if (!input.endedAt) return false;
  if (now - new Date(input.endedAt).getTime() > GUARANTEE_WINDOW_HOURS * 3600 * 1000) return false;
  const seconds = input.billedSeconds ?? 0;
  return seconds >= 1 && seconds <= GUARANTEE_MAX_SECONDS;
}

export async function guaranteeState(userId: string): Promise<{
  claim: GuaranteeClaimRow | null;
  candidates: GuaranteeCandidate[];
}> {
  if (!supabaseAvailable) return { claim: null, candidates: [] };
  const admin = getSupabaseAdmin();
  const { data: claim } = await admin
    .from('guarantee_claims')
    .select('id, booking_id, status, amount_cents, credit_cents, currency, created_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (claim) return { claim: claim as GuaranteeClaimRow, candidates: [] };
  const { data, error } = await admin.rpc('guarantee_candidates', { p_user_id: userId });
  if (error) {
    console.error('Garantie:', error.message);
    return { claim: null, candidates: [] };
  }
  return { claim: null, candidates: (data as GuaranteeCandidate[]) ?? [] };
}

export async function claimGuarantee(userId: string, bookingId: string): Promise<{
  mode: 'refund' | 'credit';
  amountCents: number;
  creditCents: number;
  currency: string;
}> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.rpc('claim_guarantee', {
    p_user_id: userId,
    p_booking_id: bookingId,
  });
  if (error) {
    const message = error.message || '';
    if (message.includes('already_claimed')) throw new Error('ALREADY_CLAIMED');
    if (message.includes('ineligible')) throw new Error('INELIGIBLE');
    throw new Error(message || 'CLAIM_FAILED');
  }
  const row = (Array.isArray(data) ? data[0] : data) as {
    claim_id: string;
    amount_cents: number;
    credit_cents: number;
    currency: string;
    payment_intent: string | null;
  } | null;
  if (!row) throw new Error('CLAIM_FAILED');

  if (row.amount_cents > 0) {
    if (!row.payment_intent || GUARANTEE_EXCLUDED_PAYMENT_INTENTS.has(row.payment_intent)) {
      // Ne devrait pas arriver (filtré en SQL) : la demande reste « pending » pour traitement manuel.
      return { mode: 'credit', amountCents: 0, creditCents: row.credit_cents, currency: row.currency };
    }
    const { getStripe } = await import('./stripe');
    const stripe = getStripe();
    if (!stripe) throw new Error('STRIPE_NOT_CONFIGURED');
    const refund = await stripe.refunds.create(
      {
        payment_intent: row.payment_intent,
        amount: row.amount_cents,
        reason: 'requested_by_customer',
        metadata: { kind: 'callastral_guarantee', booking_id: bookingId, claim_id: row.claim_id },
      },
      { idempotencyKey: `guarantee_${row.claim_id}` }
    );
    await admin
      .from('guarantee_claims')
      .update({ status: 'refunded', stripe_refund_id: refund.id, resolved_at: new Date().toISOString() })
      .eq('id', row.claim_id);
    return { mode: 'refund', amountCents: row.amount_cents, creditCents: row.credit_cents, currency: row.currency };
  }
  return { mode: 'credit', amountCents: 0, creditCents: row.credit_cents, currency: row.currency };
}
