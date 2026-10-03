import type { NextRequest } from 'next/server';
import type Stripe from 'stripe';
import type { UserProfile } from './supabase';
import { getSupabaseAdmin, supabaseAvailable } from './supabase';
import { updateUserCookie } from './session';
import { isCurrency, type Currency } from './money';
import type { SubscriptionCurrency } from './offers';
import { ensureUnlimitedPrice } from './stripe-prices';
import { appBaseUrl, getStripe, integrationIdentifier } from './stripe';

export type CheckoutPurpose = 'call_meter' | 'prepaid' | 'booking' | 'summary' | 'report';

function userEmail(user: UserProfile): string | undefined {
  const candidates = [user.email, user.username];
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (value && value.includes('@') && !value.endsWith('@placeholder.com')) {
      return value;
    }
  }
  return undefined;
}

async function ensureCustomer(
  stripe: Stripe,
  user: UserProfile
): Promise<{ customerId: string; email?: string }> {
  const email = userEmail(user);
  if (user.stripe_customer_id) {
    return { customerId: user.stripe_customer_id, email };
  }

  const customer = await stripe.customers.create({
    name: user.display_name,
    ...(email ? { email } : {}),
    metadata: {
      userId: user.id,
      app: 'callastral',
    },
  });

  if (supabaseAvailable) {
    const { error } = await getSupabaseAdmin()
      .from('users')
      .update({ stripe_customer_id: customer.id })
      .eq('id', user.id);
    if (error) console.error('stripe_customer_id update failed:', error.message);
  } else {
    await updateUserCookie(user.id, { stripe_customer_id: customer.id });
  }

  return { customerId: customer.id, email };
}

export async function createElementsCheckout(options: {
  request: NextRequest;
  user: UserProfile;
  amountCents: number;
  currency?: Currency;
  productName: string;
  productDescription: string;
  purpose: CheckoutPurpose;
  metadata: Record<string, string>;
  manualCapture: boolean;
  flow: 'call' | 'pack' | 'booking' | 'summary' | 'report';
  integrationFlow: 'call-meter' | 'prepaid' | 'booking' | 'summary' | 'report';
}): Promise<{
  clientSecret: string;
  checkoutSessionId: string;
  sessionId: string;
  amountCents: number;
  collectContact: boolean;
}> {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error('STRIPE_NOT_CONFIGURED');
  }

  const { customerId, email } = await ensureCustomer(stripe, options.user);
  const origin = appBaseUrl(options.request.nextUrl.origin);
  const sessionId =
    options.metadata.sessionId ||
    `session_${Date.now()}_${options.user.id.slice(-6)}`;

  const currency: Currency =
    options.currency && isCurrency(options.currency) ? options.currency : 'eur';
  const metadata: Record<string, string> = {
    ...options.metadata,
    purpose: options.purpose,
    userId: options.user.id,
    sessionId,
    app: 'callastral',
    amountCents: String(options.amountCents),
    currency,
  };

  // ui_mode "elements" remplace "custom" depuis l'API 2026-03-25.dahlia.
  // C'est le Payment Element intégré : pas de redirection vers Checkout hébergé.
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    ui_mode: 'elements',
    locale: 'fr',
    customer: customerId,
    adaptive_pricing: { enabled: false },
    integration_identifier: integrationIdentifier(options.integrationFlow),
    return_url: `${origin}/payment/return?session_id={CHECKOUT_SESSION_ID}&flow=${options.flow}`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: options.amountCents,
          product_data: {
            name: options.productName,
            description: options.productDescription,
          },
        },
      },
    ],
    metadata,
    payment_intent_data: {
      description: options.productDescription,
      metadata,
      ...(options.manualCapture ? { capture_method: 'manual' as const } : {}),
    },
    client_reference_id: options.user.id,
  });

  if (!session.client_secret) {
    throw new Error('CLIENT_SECRET_MISSING');
  }

  return {
    clientSecret: session.client_secret,
    checkoutSessionId: session.id,
    sessionId,
    amountCents: options.amountCents,
    collectContact: !email,
  };
}

export async function createSubscriptionCheckout(options: {
  request: NextRequest;
  user: UserProfile;
  currency: SubscriptionCurrency;
}): Promise<{ clientSecret: string; checkoutSessionId: string; collectContact: boolean }> {
  const stripe = getStripe();
  if (!stripe) throw new Error('STRIPE_NOT_CONFIGURED');
  const { customerId, email } = await ensureCustomer(stripe, options.user);
  const priceId = await ensureUnlimitedPrice(options.currency);
  const origin = appBaseUrl(options.request.nextUrl.origin);
  const metadata: Record<string, string> = {
    purpose: 'subscription',
    userId: options.user.id,
    app: 'callastral',
    currency: options.currency,
  };
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    ui_mode: 'elements',
    locale: 'fr',
    customer: customerId,
    adaptive_pricing: { enabled: false },
    integration_identifier: integrationIdentifier('subscription'),
    return_url: `${origin}/payment/return?session_id={CHECKOUT_SESSION_ID}&flow=subscription`,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata,
    subscription_data: { metadata },
    client_reference_id: options.user.id,
  });
  if (!session.client_secret) throw new Error('CLIENT_SECRET_MISSING');
  return {
    clientSecret: session.client_secret,
    checkoutSessionId: session.id,
    collectContact: !email,
  };
}

export async function createPortalSession(options: {
  request: NextRequest;
  user: UserProfile;
}): Promise<string> {
  const stripe = getStripe();
  if (!stripe) throw new Error('STRIPE_NOT_CONFIGURED');
  if (!options.user.stripe_customer_id) throw new Error('NO_CUSTOMER');
  const origin = appBaseUrl(options.request.nextUrl.origin);
  const session = await stripe.billingPortal.sessions.create({
    customer: options.user.stripe_customer_id,
    return_url: `${origin}/account`,
  });
  return session.url;
}
