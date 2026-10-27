import { NextRequest, NextResponse } from 'next/server';
import { chatPath } from '@/lib/chat';
import { chatPriceId, currentChatUser } from '@/lib/chat-store';
import { appBaseUrl, getStripe, integrationIdentifier } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NOTICE = {
  fr: 'Conseillère/Conseiller virtuel Callastral — réponses générées par IA. Résiliable à tout moment. Usage raisonnable : 300 messages/mois.',
  en: 'Callastral virtual advisor — AI-generated replies. Cancel anytime. Fair use: 300 messages/month.',
  es: 'Consejero virtual de Callastral — respuestas generadas por IA. Cancela cuando quieras. Uso razonable: 300 mensajes/mes.',
  de: 'Virtuelle Callastral-Beratung — KI-generierte Antworten. Jederzeit kündbar. Fair Use: 300 Nachrichten/Monat.',
  it: 'Consulente virtuale Callastral — risposte generate dall’IA. Disdici quando vuoi. Uso equo: 300 messaggi/mese.',
} as const;

export async function POST(request: NextRequest) {
  const user = await currentChatUser();
  if (!user) return NextResponse.json({ error: 'no_session' }, { status: 401 });
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  try {
    const price = await chatPriceId(stripe);
    let customer = user.stripe_customer_id;
    if (!customer) {
      const created = await stripe.customers.create({
        email: user.email,
        name: user.first_name || undefined,
        metadata: { app: 'callastral', purpose: 'chat', chatUserId: user.id },
      });
      customer = created.id;
      await getSupabaseAdmin().from('chat_users').update({ stripe_customer_id: customer }).eq('id', user.id);
    }
    const origin = appBaseUrl(request.nextUrl.origin);
    const back = `${origin}${chatPath(user.locale)}`;
    const metadata = { app: 'callastral', purpose: 'chat', chatUserId: user.id, locale: user.locale };
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      ui_mode: 'hosted_page',
      locale: user.locale === 'fr' ? 'fr' : user.locale === 'de' ? 'de' : user.locale === 'es' ? 'es' : user.locale === 'it' ? 'it' : 'en',
      customer,
      integration_identifier: integrationIdentifier('subscription'),
      line_items: [{ price, quantity: 1 }],
      success_url: `${back}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${back}?canceled=1`,
      metadata,
      subscription_data: { metadata },
      client_reference_id: user.id,
      custom_text: { submit: { message: NOTICE[user.locale] } },
    });
    return NextResponse.json({ url: session.url, priceId: price });
  } catch (error) {
    console.error('Chat abonnement:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'failed' }, { status: 502 });
  }
}
