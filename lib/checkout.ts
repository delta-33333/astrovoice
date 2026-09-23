import type { NextRequest } from 'next/server';
import type Stripe from 'stripe';
import type { UserProfile } from './supabase';
import { supabase, supabaseAvailable } from './supabase';
import { updateUserCookie } from './session';
import { appBaseUrl, getStripe, integrationIdentifier } from './stripe';

export type CheckoutPurpose = 'call_meter' | 'prepaid';

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

  if (supabaseAvailable && supabase) {
    await supabase
      .from('users')
      .update({ stripe_customer_id: customer.id })
      .eq('id', user.id);
  } else {
    await updateUserCookie(user.id, { stripe_customer_id: customer.id });
  }

  return { customerId: customer.id, email };
}

export async function createElementsCheckout(options: {
  request: NextRequest;
  user: UserProfile;
  amountCents: number;
  productName: string;
  productDescription: string;
  purpose: CheckoutPurpose;
  metadata: Record<string, string>;
  manualCapture: boolean;
  flow: 'call' | 'pack';
  integrationFlow: 'call-meter' | 'prepaid';
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

  const metadata: Record<string, string> = {
    ...options.metadata,
    purpose: options.purpose,
    userId: options.user.id,
    sessionId,
    app: 'callastral',
    amountCents: String(options.amountCents),
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
          currency: 'eur',
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
