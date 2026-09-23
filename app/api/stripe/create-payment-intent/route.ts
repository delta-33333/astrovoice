import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { birthData, astrologerId } = await request.json();

    if (!birthData || !astrologerId) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
      console.warn('⚠️ Stripe not configured - using mock mode');
      return NextResponse.json({
        clientSecret: 'mock_client_secret',
        sessionId: `mock_session_${Date.now()}`,
        mock: true,
      });
    }

    // Calculate natal chart first
    const chartResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/natal-chart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(birthData),
    });

    if (!chartResponse.ok) {
      throw new Error('Erreur lors du calcul du thème natal');
    }

    const natalChart = await chartResponse.json();

    // Create or get customer
    const customers = await stripe.customers.list({
      email: `${birthData.name.toLowerCase().replace(/\s/g, '.')}@placeholder.com`,
      limit: 1,
    });

    let customer: Stripe.Customer;
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: `${birthData.name.toLowerCase().replace(/\s/g, '.')}@placeholder.com`,
        name: birthData.name,
        metadata: {
          birthDate: birthData.date,
          birthPlace: birthData.place,
        },
      });
    }

    // Create PaymentIntent with manual capture for exact amount later
    // Max 30 minutes = $59.70
    const maxAmount = 5970; // cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount: maxAmount,
      currency: 'usd',
      customer: customer.id,
      description: 'Consultation astrale',
      capture_method: 'manual', // We'll capture exact amount after call
      metadata: {
        astrologerId,
        sessionId: `session_${Date.now()}_${customer.id.slice(-6)}`,
        birthData: JSON.stringify(birthData),
        natalChartPreview: JSON.stringify(natalChart).slice(0, 500),
      },
    });

    // Store session data (in production, use a database)
    const sessionId = paymentIntent.metadata.sessionId;

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      sessionId,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du paiement' },
      { status: 500 }
    );
  }
}
