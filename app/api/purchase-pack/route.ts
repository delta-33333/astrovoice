import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createElementsCheckout } from '@/lib/checkout';
import { foundingAlreadyClaimed } from '@/lib/credits';
import { formatCurrency, getPack, packSeconds } from '@/lib/pricing';
import { stripeSecretConfigured } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { packId } = await request.json();
    const pack = getPack(packId);
    if (!pack) {
      return NextResponse.json({ error: 'Offre introuvable' }, { status: 400 });
    }

    if (pack.founding && (await foundingAlreadyClaimed(user))) {
      return NextResponse.json(
        { error: 'Le Cercle Fondateur est déjà ouvert sur ce compte.' },
        { status: 409 }
      );
    }

    if (!stripeSecretConfigured()) {
      return NextResponse.json(
        { error: 'Le paiement n’est pas disponible pour le moment.' },
        { status: 503 }
      );
    }

    const label = pack.founding
      ? 'Cercle Fondateur'
      : `Pack ${pack.minutes} minutes`;

    const checkout = await createElementsCheckout({
      request,
      user,
      amountCents: pack.amountCents,
      productName: label,
      productDescription: pack.founding
        ? 'Dix minutes offertes au tarif fondateur'
        : `Prépaiement de ${pack.minutes} minutes de consultation`,
      purpose: 'prepaid',
      manualCapture: false,
      flow: 'pack',
      integrationFlow: 'prepaid',
      metadata: {
        packId: pack.id,
        minutes: String(pack.minutes),
        seconds: String(packSeconds(pack)),
      },
    });

    return NextResponse.json({
      clientSecret: checkout.clientSecret,
      checkoutSessionId: checkout.checkoutSessionId,
      amount: checkout.amountCents,
      amountLabel: formatCurrency(checkout.amountCents),
      currency: 'eur',
      minutes: pack.minutes,
      label,
      collectContact: checkout.collectContact,
    });
  } catch (error) {
    console.error('Achat de minutes:', error);
    return NextResponse.json(
      { error: 'Le paiement n’a pas pu être préparé. Réessayez dans un instant.' },
      { status: 500 }
    );
  }
}
