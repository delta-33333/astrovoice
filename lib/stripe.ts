import 'server-only';
import { randomBytes } from 'crypto';
import Stripe from 'stripe';

const API_VERSION = '2026-07-29.dahlia';

let stripeClient: Stripe | null = null;

export function stripeSecretConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  return !!key && !key.includes('placeholder');
}

/**
 * Client Stripe instancié (pas de clé globale).
 * Renvoie null tant que la clé secrète Astre n'est pas configurée.
 */
export function getStripe(): Stripe | null {
  if (!stripeSecretConfigured()) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: API_VERSION,
      typescript: true,
    });
    attachReferral(stripeClient);
  }
  return stripeClient;
}

export function appBaseUrl(requestOrigin?: string): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  if (configured) return configured;
  if (requestOrigin) return requestOrigin.replace(/\/$/, '');
  return 'http://localhost:3000';
}

/** Suffixe de 8 lettres, exigé pour integration_identifier (API Dahlia). */
export function integrationIdentifier(
  flow: 'call-meter' | 'prepaid' | 'booking' | 'summary' | 'subscription' | 'report'
): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const bytes = randomBytes(8);
  let suffix = '';
  for (let i = 0; i < bytes.length; i += 1) {
    suffix += alphabet[bytes[i] % alphabet.length];
  }
  return `callastral-${flow}-${suffix}`;
}

/** Lit le cookie d’affiliation de la requête en cours (absent hors requête). */
async function currentRef(): Promise<string | null> {
  try {
    const { cookies } = await import('next/headers');
    const { REF_COOKIE, validRefCode } = await import('./affiliate');
    return validRefCode((await cookies()).get(REF_COOKIE)?.value);
  } catch {
    return null;
  }
}

type WithMeta = { metadata?: Stripe.MetadataParam | '' | null } & Record<string, unknown>;

async function withRef<T>(params: T): Promise<T> {
  const ref = await currentRef();
  if (!ref || !params || typeof params !== 'object') return params;
  const next = { ...(params as WithMeta) };
  const meta = next.metadata && typeof next.metadata === 'object' ? next.metadata : {};
  next.metadata = { ...meta, ref };
  return next as T;
}

/** Ajoute metadata.ref (cookie ?ref=) à toute session Checkout, PaymentIntent ou abonnement créé. */
function attachReferral(client: Stripe): void {
  const sessions = client.checkout.sessions;
  const createSession = sessions.create.bind(sessions);
  sessions.create = (async (params?: Stripe.Checkout.SessionCreateParams, options?: Stripe.RequestOptions) =>
    createSession(await withRef(params ?? {}), options)) as typeof sessions.create;
  const intents = client.paymentIntents;
  const createIntent = intents.create.bind(intents);
  intents.create = (async (params: Stripe.PaymentIntentCreateParams, options?: Stripe.RequestOptions) =>
    createIntent(await withRef(params), options)) as typeof intents.create;
  const subs = client.subscriptions;
  const createSub = subs.create.bind(subs);
  subs.create = (async (params: Stripe.SubscriptionCreateParams, options?: Stripe.RequestOptions) =>
    createSub(await withRef(params), options)) as typeof subs.create;
}
