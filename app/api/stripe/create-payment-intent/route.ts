import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createElementsCheckout } from '@/lib/checkout';
import { trackEvent } from '@/lib/events';
import { getPublicAdvisorById } from '@/lib/astrologers';
import { introAlreadyClaimed } from '@/lib/intro';
import { resolveMarket } from '@/lib/market';
import { formatMoney, localBookingMinor, localRates, marketCodeForContext, quoteAdvisor } from '@/lib/money';
import { PER_MINUTE_CENTS } from '@/lib/pricing';
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
    const market = await resolveMarket();
    const advisor = await getPublicAdvisorById(String(astrologerId)).catch(() => null);
    const eurPerMin = advisor?.pricePerMinCents ?? PER_MINUTE_CENTS;
    const introEligible = !(await introAlreadyClaimed(user));
    const context = {
      country: market.country,
      locale: market.language,
      introEligible,
    };
    const priced = marketCodeForContext(context);
    const rates = localRates(eurPerMin, market.currency, market.rates, context);
    const quote = quoteAdvisor(eurPerMin, market.currency, market.rates, undefined, market.language, market.country, introEligible);
    const holdMinor = localBookingMinor(eurPerMin, 10, market.currency, market.rates, context);
    const meter = {
      currency: rates.currency,
      market: priced,
      introMinor: rates.introLocal,
      standardMinor: rates.standardLocal,
      holdMinor,
      amountLabel: formatMoney(holdMinor, rates.currency, market.language),
      introLabel: quote.introLabel,
      perMinLabel: quote.perMinLabel,
      introApplied: introEligible,
    };

    if (!stripeSecretConfigured()) {
      return NextResponse.json({
        mock: true,
        clientSecret: null,
        sessionId,
        checkoutSessionId: `mock_${sessionId}`,
        amount: holdMinor,
        ...meter,
      });
    }

    const checkout = await createElementsCheckout({
      request,
      user,
      amountCents: holdMinor,
      currency: rates.currency,
      productName: 'Consultation Callastral',
      productDescription: 'Empreinte de consultation — seul le temps réel est encaissé',
      purpose: 'call_meter',
      manualCapture: true,
      flow: 'call',
      integrationFlow: 'call-meter',
      metadata: {
        sessionId,
        introMinor: String(rates.introLocal),
        standardMinor: String(rates.standardLocal),
        introApplied: introEligible ? 'true' : 'false',
        astrologerId: String(astrologerId).slice(0, 80),
        birthName: String(birthData.name).slice(0, 80),
        birthDate: String(birthData.date).slice(0, 40),
        birthPlace: String(birthData.place || '').slice(0, 120),
      },
    });

    await trackEvent({
      name: 'checkout_start',
      userId: user.id,
      metadata: { purpose: 'call_meter' },
    });

    return NextResponse.json({
      clientSecret: checkout.clientSecret,
      checkoutSessionId: checkout.checkoutSessionId,
      sessionId: checkout.sessionId,
      amount: checkout.amountCents,
      ...meter,
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
