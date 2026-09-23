import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createElementsCheckout } from '@/lib/checkout';
import { CALL_HOLD_CENTS } from '@/lib/pricing';
import { stripeSecretConfigured } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Empreinte pour une consultation à la minute.
 * Checkout Session ui_mode=elements + capture manuelle.
 * Le montant réel est capturé à la fin de l'appel.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { birthData, astrologerId } = await request.json();
    if (!birthData?.name || !birthData?.date || !astrologerId) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const sessionId = `session_${Date.now()}_${user.id.slice(-6)}`;

    if (!stripeSecretConfigured()) {
      return NextResponse.json({
        mock: true,
        clientSecret: null,
        sessionId,
        checkoutSessionId: `mock_${sessionId}`,
        amount: CALL_HOLD_CENTS,
        currency: 'eur',
      });
    }

    const checkout = await createElementsCheckout({
      request,
      user,
      amountCents: CALL_HOLD_CENTS,
      productName: 'Consultation Callastral',
      productDescription: 'Empreinte de consultation — seul le temps réel est encaissé',
      purpose: 'call_meter',
      manualCapture: true,
      flow: 'call',
      integrationFlow: 'call-meter',
      metadata: {
        sessionId,
        astrologerId: String(astrologerId).slice(0, 80),
        birthName: String(birthData.name).slice(0, 80),
        birthDate: String(birthData.date).slice(0, 40),
        birthPlace: String(birthData.place || '').slice(0, 120),
      },
    });

    return NextResponse.json({
      clientSecret: checkout.clientSecret,
      checkoutSessionId: checkout.checkoutSessionId,
      sessionId: checkout.sessionId,
      amount: checkout.amountCents,
      currency: 'eur',
      collectContact: checkout.collectContact,
    });
  } catch (error) {
    console.error('Création empreinte consultation:', error);
    return NextResponse.json(
      { error: 'Le paiement n’a pas pu être préparé. Réessayez dans un instant.' },
      { status: 500 }
    );
  }
}
