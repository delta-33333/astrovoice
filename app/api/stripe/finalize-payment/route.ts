import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { calculateCost } from '@/lib/utils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { sessionId, durationSeconds } = await request.json();

    if (!sessionId || typeof durationSeconds !== 'number') {
      return NextResponse.json(
        { error: 'Session ID et durée requis' },
        { status: 400 }
      );
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
      console.warn('⚠️ Stripe not configured - using mock finalization');
      const cost = calculateCost(durationSeconds);
      return NextResponse.json({
        success: true,
        mock: true,
        amountCharged: cost,
        durationSeconds,
      });
    }

    // Calculate actual cost
    const actualAmount = calculateCost(durationSeconds);

    // Find the payment intent by session ID in metadata
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
    });

    const paymentIntent = paymentIntents.data.find(
      pi => pi.metadata.sessionId === sessionId
    );

    if (!paymentIntent) {
      throw new Error('Session de paiement introuvable');
    }

    // Update amount and capture
    if (actualAmount > paymentIntent.amount) {
      // Should not happen, but cap at max authorized amount
      await stripe.paymentIntents.capture(paymentIntent.id);
    } else {
      // Update to actual amount and capture
      await stripe.paymentIntents.update(paymentIntent.id, {
        amount: actualAmount,
      });
      await stripe.paymentIntents.capture(paymentIntent.id);
    }

    return NextResponse.json({
      success: true,
      amountCharged: actualAmount,
      durationSeconds,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    console.error('Payment finalization error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la finalisation du paiement' },
      { status: 500 }
    );
  }
}
