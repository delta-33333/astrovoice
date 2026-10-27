import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { advisorCard, currentChatUser, entitlementOf, loadMessages, syncChatSubscription } from '@/lib/chat-store';
import { trackEvent } from '@/lib/events';
import { getStripe } from '@/lib/stripe';
import { supabaseAvailable } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!supabaseAvailable) return NextResponse.json({ user: null });
  let user = await currentChatUser();
  if (!user) return NextResponse.json({ user: null });

  // Retour de Stripe : on confirme l’abonnement sans attendre le webhook.
  const sessionId = request.nextUrl.searchParams.get('session_id');
  if (sessionId && /^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
    const stripe = getStripe();
    try {
      const session = stripe ? await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] }) : null;
      if (session && session.metadata?.chatUserId === user.id && session.subscription && typeof session.subscription !== 'string') {
        const synced = await syncChatSubscription(session.subscription as Stripe.Subscription);
        if (synced && synced.previous !== 'active' && synced.status === 'active') {
          await trackEvent({ name: 'chat_subscribe', advisorId: user.advisor_id, metadata: { source: 'return', locale: user.locale } });
        }
        user = (await currentChatUser()) ?? user;
      }
    } catch (error) {
      console.warn('Chat retour Stripe:', error instanceof Error ? error.message : error);
    }
  }

  const [messages, advisor] = await Promise.all([loadMessages(user.id), advisorCard(user.advisor_id, user.locale)]);
  return NextResponse.json({
    user: { firstName: user.first_name, locale: user.locale, topic: user.topic, subscribed: user.subscription_status === 'active' || user.subscription_status === 'trialing' },
    advisor,
    messages,
    entitlement: entitlementOf(user),
  });
}
