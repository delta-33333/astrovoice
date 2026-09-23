import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import { getSession, updateUserCookie } from './session';
import type { UserProfile } from './supabase';
import { getStripe } from './stripe';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let adminClient: SupabaseClient | null | undefined;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function getAdmin(): SupabaseClient | null {
  if (adminClient !== undefined) return adminClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || key.includes('placeholder') || url.includes('your-project')) {
    adminClient = null;
    return null;
  }
  adminClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}

export function isPrepaidPaidSession(session: Stripe.Checkout.Session): boolean {
  return (
    session.metadata?.purpose === 'prepaid' &&
    session.payment_status === 'paid' &&
    session.status === 'complete'
  );
}

async function markCreditsGranted(sessionId: string): Promise<void> {
  const stripe = getStripe();
  if (!stripe) return;
  await stripe.checkout.sessions.update(sessionId, {
    metadata: { credits_granted: 'true' },
  });
}

async function addCookieCredits(
  userId: string,
  checkoutSessionId: string,
  seconds: number,
  packId: string | undefined
): Promise<boolean> {
  const user = await getSession();
  if (!user || user.id !== userId) return false;
  const credited = user.credited_checkout_sessions ?? [];
  if (credited.includes(checkoutSessionId)) return false;
  const nextCredits = [...credited, checkoutSessionId].slice(-40);
  return updateUserCookie(userId, {
    prepaid_seconds: (user.prepaid_seconds ?? 0) + seconds,
    credited_checkout_sessions: nextCredits,
    founding_claimed: packId === 'founding' ? true : user.founding_claimed,
  });
}

async function incrementDbPrepaid(
  admin: SupabaseClient,
  userId: string,
  seconds: number
): Promise<boolean> {
  const { data, error } = await admin
    .from('users')
    .select('prepaid_seconds')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return false;
  const next = (data.prepaid_seconds ?? 0) + seconds;
  const { error: updateError } = await admin
    .from('users')
    .update({ prepaid_seconds: next })
    .eq('id', userId);
  return !updateError;
}

/**
 * Crédite les minutes prépayées une seule fois par Checkout Session.
 * Le webhook et la page de retour appellent la même fonction.
 */
export async function grantPrepaidCredits(
  session: Stripe.Checkout.Session,
  options: { allowCookie: boolean }
): Promise<{ granted: boolean; already?: boolean }> {
  if (!isPrepaidPaidSession(session)) {
    return { granted: false };
  }

  const userId = session.metadata?.userId;
  const seconds = Number(session.metadata?.seconds || 0);
  const packId = session.metadata?.packId;
  const amountCents = session.amount_total ?? Number(session.metadata?.amountCents || 0);

  if (!userId || !Number.isFinite(seconds) || seconds <= 0) {
    return { granted: false };
  }

  if (session.metadata?.credits_granted === 'true') {
    if (options.allowCookie && !isUuid(userId)) {
      await addCookieCredits(userId, session.id, seconds, packId);
    }
    return { granted: false, already: true };
  }

  const admin = getAdmin();

  if (admin && isUuid(userId)) {
    const rpc = await admin.rpc('grant_prepaid_seconds', {
      p_session_id: session.id,
      p_user_id: userId,
      p_seconds: seconds,
      p_amount: amountCents,
      p_pack_id: packId ?? null,
    });

    if (!rpc.error && (rpc.data === true || rpc.data === false)) {
      await markCreditsGranted(session.id);
      return { granted: rpc.data === true, already: rpc.data === false };
    }

    if (rpc.error) {
      console.warn('grant_prepaid_seconds indisponible, repli table:', rpc.error.message);
    }

    const insert = await admin.from('stripe_credit_grants').insert({
      checkout_session_id: session.id,
      user_id: userId,
      seconds,
      amount_cents: amountCents,
      pack_id: packId ?? null,
    });

    if (insert.error && insert.error.code === '23505') {
      await markCreditsGranted(session.id);
      return { granted: false, already: true };
    }

    if (!insert.error) {
      await incrementDbPrepaid(admin, userId, seconds);
      await markCreditsGranted(session.id);
      return { granted: true };
    }

    console.error('Crédit minutes impossible:', insert.error.message);
  }

  if (options.allowCookie && !isUuid(userId)) {
    const saved = await addCookieCredits(userId, session.id, seconds, packId);
    if (saved) {
      await markCreditsGranted(session.id);
      return { granted: true };
    }
  }

  if (admin && isUuid(userId)) {
    const incremented = await incrementDbPrepaid(admin, userId, seconds);
    if (incremented) {
      await markCreditsGranted(session.id);
      return { granted: true };
    }
  }

  return { granted: false };
}

export async function foundingAlreadyClaimed(user: UserProfile): Promise<boolean> {
  if (user.founding_claimed) return true;
  const admin = getAdmin();
  if (!admin) return false;
  const { data, error } = await admin
    .from('stripe_credit_grants')
    .select('checkout_session_id')
    .eq('user_id', user.id)
    .eq('pack_id', 'founding')
    .limit(1);
  if (error) {
    console.warn('Vérification Cercle Fondateur ignorée:', error.message);
    return false;
  }
  return (data?.length ?? 0) > 0;
}

export async function consumePrepaidSeconds(userId: string, seconds: number): Promise<number> {
  if (seconds <= 0) return 0;
  const admin = getAdmin();

  if (admin && isUuid(userId)) {
    const rpc = await admin.rpc('consume_prepaid_seconds', {
      p_user_id: userId,
      p_seconds: seconds,
    });
    if (!rpc.error && typeof rpc.data === 'number' && rpc.data >= 0) {
      return rpc.data;
    }

    const row = await admin
      .from('users')
      .select('prepaid_seconds')
      .eq('id', userId)
      .maybeSingle();
    if (!row.error && row.data) {
      const available = row.data.prepaid_seconds ?? 0;
      const used = Math.min(Math.max(available, 0), seconds);
      const { error } = await admin
        .from('users')
        .update({ prepaid_seconds: Math.max(available, 0) - used })
        .eq('id', userId);
      if (!error) return used;
    }
  }

  const user = await getSession();
  if (!user || user.id !== userId) return 0;
  const available = user.prepaid_seconds ?? 0;
  const used = Math.min(Math.max(available, 0), seconds);
  await updateUserCookie(userId, { prepaid_seconds: available - used });
  return used;
}

export async function restorePrepaidSeconds(userId: string, seconds: number): Promise<void> {
  if (seconds <= 0) return;
  const admin = getAdmin();
  if (admin && isUuid(userId)) {
    const row = await admin
      .from('users')
      .select('prepaid_seconds')
      .eq('id', userId)
      .maybeSingle();
    if (row.data) {
      await admin
        .from('users')
        .update({ prepaid_seconds: (row.data.prepaid_seconds ?? 0) + seconds })
        .eq('id', userId);
      return;
    }
  }
  const user = await getSession();
  if (!user || user.id !== userId) return;
  await updateUserCookie(userId, {
    prepaid_seconds: (user.prepaid_seconds ?? 0) + seconds,
  });
}

export async function loadCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session | null> {
  const stripe = getStripe();
  if (!stripe) return null;
  return stripe.checkout.sessions.retrieve(sessionId);
}
