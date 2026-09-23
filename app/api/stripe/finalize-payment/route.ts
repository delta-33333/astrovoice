import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { consumePrepaidSeconds, restorePrepaidSeconds } from '@/lib/credits';
import { quoteCall } from '@/lib/pricing';
import { getStripe, stripeSecretConfigured } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Arrête le compteur : consomme les minutes prépayées, puis capture
 * le montant réel (ou libère l'empreinte si rien n'est dû).
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { sessionId, checkoutSessionId, durationSeconds } = await request.json();
    if (typeof durationSeconds !== 'number' || durationSeconds < 0) {
      return NextResponse.json({ error: 'Durée requise' }, { status: 400 });
    }

    const prepaidBefore = user.prepaid_seconds ?? 0;
    const quote = quoteCall(durationSeconds, prepaidBefore);
    const isMock =
      !stripeSecretConfigured() ||
      (typeof checkoutSessionId === 'string' && checkoutSessionId.startsWith('mock_')) ||
      (typeof sessionId === 'string' && sessionId.startsWith('mock_'));

    if (isMock) {
      const used = await consumePrepaidSeconds(user.id, quote.coveredSeconds);
      return NextResponse.json({
        success: true,
        mock: true,
        amountCharged: quote.amountCents,
        durationSeconds,
        prepaidSecondsUsed: used,
        capped: quote.capped,
      });
    }

    if (!checkoutSessionId || typeof checkoutSessionId !== 'string') {
      return NextResponse.json({ error: 'Session de paiement manquante' }, { status: 400 });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: 'Paiement indisponible' }, { status: 503 });
    }

    const checkout = await stripe.checkout.sessions.retrieve(checkoutSessionId);
    if (checkout.metadata?.userId !== user.id || checkout.metadata?.purpose !== 'call_meter') {
      return NextResponse.json({ error: 'Session de paiement introuvable' }, { status: 404 });
    }

    if (checkout.status !== 'complete') {
      return NextResponse.json(
        { error: 'L’empreinte n’a pas été confirmée.' },
        { status: 402 }
      );
    }

    const paymentIntentId =
      typeof checkout.payment_intent === 'string'
        ? checkout.payment_intent
        : checkout.payment_intent?.id;

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 });
    }

    const used = await consumePrepaidSeconds(user.id, quote.coveredSeconds);

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        return NextResponse.json({
          success: true,
          amountCharged: paymentIntent.amount_received,
          durationSeconds,
          prepaidSecondsUsed: used,
          paymentIntentId,
          capped: quote.capped,
        });
      }

      if (quote.amountCents <= 0 || paymentIntent.status === 'canceled') {
        if (paymentIntent.status === 'requires_capture') {
          await stripe.paymentIntents.cancel(paymentIntentId);
        }
        return NextResponse.json({
          success: true,
          amountCharged: 0,
          durationSeconds,
          prepaidSecondsUsed: used,
          paymentIntentId,
          released: true,
        });
      }

      if (paymentIntent.status !== 'requires_capture') {
        throw new Error(`Statut inattendu: ${paymentIntent.status}`);
      }

      const amountToCapture = Math.min(quote.amountCents, paymentIntent.amount);
      const captured = await stripe.paymentIntents.capture(paymentIntentId, {
        amount_to_capture: amountToCapture,
      });

      return NextResponse.json({
        success: true,
        amountCharged: captured.amount_received,
        durationSeconds,
        prepaidSecondsUsed: used,
        paymentIntentId,
        capped: quote.capped || amountToCapture < quote.amountCents,
      });
    } catch (captureError) {
      await restorePrepaidSeconds(user.id, used);
      throw captureError;
    }
  } catch (error) {
    console.error('Arrêt du compteur:', error);
    return NextResponse.json(
      { error: 'La consultation est terminée. Le règlement sera confirmé sous peu.' },
      { status: 500 }
    );
  }
}
