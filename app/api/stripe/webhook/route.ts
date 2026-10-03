import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { confirmBookingPayment } from '@/lib/bookings';
import { grantPrepaidCredits } from '@/lib/credits';
import { fulfillCheckoutReport } from '@/lib/reports';
import { getStripe } from '@/lib/stripe';
import { subscriptionIdFromInvoice, syncSubscription, syncSubscriptionById } from '@/lib/subscriptions';
import { deliverPaidSummary, markSummaryPaid } from '@/lib/summaries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!stripe || !signature || !webhookSecret || webhookSecret.includes('placeholder')) {
    console.warn('Webhook Stripe ignoré : signature ou clé non configurée');
    return NextResponse.json({ received: true, ignored: true });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Signature webhook invalide:', error);
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.purpose === 'prepaid') {
          const result = await grantPrepaidCredits(session, { allowCookie: false });
          console.log('Crédit minutes', session.id, result);
        } else if (session.metadata?.purpose === 'booking' && session.metadata.booking_id) {
          const paymentIntent = typeof session.payment_intent === 'string' ? session.payment_intent : null;
          const result = await confirmBookingPayment({
            bookingId: session.metadata.booking_id,
            checkoutSessionId: session.id,
            paymentIntentId: paymentIntent,
          });
          console.log('Réservation', session.id, result);
        } else if (session.metadata?.purpose === 'summary' && session.metadata.booking_id) {
          if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') {
            await markSummaryPaid(session.metadata.booking_id, session.id);
            const delivery = await deliverPaidSummary(session.metadata.booking_id);
            console.log('Résumé', session.id, delivery);
          }
        } else if (session.metadata?.purpose === 'report' && session.metadata.report_id) {
          const delivery = await fulfillCheckoutReport(session);
          console.log('Rapport', session.id, delivery);
        } else if (session.metadata?.purpose === 'subscription') {
          const subscriptionRef = session.subscription;
          const subscriptionId = typeof subscriptionRef === 'string' ? subscriptionRef : subscriptionRef?.id;
          if (subscriptionId) await syncSubscriptionById(subscriptionId);
          console.log('Abonnement', session.id, subscriptionId);
        } else if (session.metadata?.purpose === 'call_meter') {
          console.log('Empreinte consultation confirmée', session.id, session.payment_status);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const saved = await syncSubscription(subscription);
        console.log('Abonnement', event.type, subscription.id, saved);
        break;
      }
      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = subscriptionIdFromInvoice(invoice);
        if (subscriptionId) await syncSubscriptionById(subscriptionId);
        console.log('Facture', event.type, invoice.id, subscriptionId);
        break;
      }
      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;
        if (intent.metadata?.purpose === 'call_meter') {
          console.log('Compteur arrêté, montant encaissé', intent.id, intent.amount_received);
        }
        break;
      }
      case 'payment_intent.amount_capturable_updated': {
        const intent = event.data.object as Stripe.PaymentIntent;
        if (intent.metadata?.purpose === 'call_meter') {
          console.log('Empreinte autorisée', intent.id, intent.amount_capturable);
        }
        break;
      }
      case 'payment_intent.canceled': {
        const intent = event.data.object as Stripe.PaymentIntent;
        console.log('Empreinte libérée', intent.id);
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;
        console.error('Paiement refusé', intent.id);
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Traitement webhook:', error);
    return NextResponse.json({ error: 'Traitement impossible' }, { status: 500 });
  }
}
