import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' })
  : null;

const packPrices: Record<string, { minutes: number; priceId?: string; amount: number }> = {
  '10min': {
    minutes: 10,
    priceId: process.env.STRIPE_PRICE_ID_10MIN_PACK,
    amount: 1499,
  },
  '30min': {
    minutes: 30,
    priceId: process.env.STRIPE_PRICE_ID_30MIN_PACK,
    amount: 3999,
  },
  '60min': {
    minutes: 60,
    priceId: process.env.STRIPE_PRICE_ID_60MIN_PACK,
    amount: 6999,
  },
};

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { packId } = await request.json();
    const pack = packPrices[packId];

    if (!pack) {
      return NextResponse.json(
        { error: 'Pack invalide' },
        { status: 400 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Paiement non configuré' },
        { status: 503 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Pack ${pack.minutes} minutes`,
              description: `Prépaiement de ${pack.minutes} minutes de consultation`,
            },
            unit_amount: pack.amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/home?pack_success=true`,
      cancel_url: `${appUrl}/packs`,
      client_reference_id: user.id,
      metadata: {
        type: 'minute_pack',
        packId,
        minutes: pack.minutes.toString(),
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error('Purchase pack error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
