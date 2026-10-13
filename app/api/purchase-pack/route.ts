import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createElementsCheckout } from '@/lib/checkout';
import { trackEvent } from '@/lib/events';
import { foundingAlreadyClaimed } from '@/lib/credits';
import { FOUNDING_MAX_SALES, foundingOfferOpen } from '@/lib/founding';
import { resolveMarket } from '@/lib/market';
import { formatMoney, MARKET_PRICING, marketCodeForContext } from '@/lib/money';
import { getPack, packForMarket, packSeconds } from '@/lib/pricing';
import { getSupabaseAdmin, supabaseAvailable } from '@/lib/supabase';
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

    if (pack.founding) {
      const sales = await foundingSalesCount();
      if (!foundingOfferOpen(new Date(), sales)) {
        return NextResponse.json(
          { error: 'L’offre fondateur est close (100 places, jusqu’au 31 octobre 2026).' },
          { status: 410 }
        );
      }
      if (await foundingAlreadyClaimed(user)) {
        return NextResponse.json(
          { error: 'Le Cercle Fondateur est déjà ouvert sur ce compte.' },
          { status: 409 }
        );
      }
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
    const market = await resolveMarket();
    const code = marketCodeForContext({
      country: market.country,
      locale: market.language,
      currency: market.currency,
    });
    const priced = packForMarket(pack, code);
    const currency = MARKET_PRICING[code].currency;
    const amount = priced.amountCents;

    const checkout = await createElementsCheckout({
      request,
      user,
      amountCents: amount,
      currency,
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

    await trackEvent({
      name: 'checkout_start',
      userId: user.id,
      metadata: { purpose: 'prepaid', packId: pack.id },
    });

    return NextResponse.json({
      clientSecret: checkout.clientSecret,
      checkoutSessionId: checkout.checkoutSessionId,
      amount: checkout.amountCents,
      amountLabel: formatMoney(checkout.amountCents, currency, market.language),
      currency,
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

async function foundingSalesCount(): Promise<number> {
  if (!supabaseAvailable) return 0;
  const { count, error } = await getSupabaseAdmin()
    .from('stripe_credit_grants')
    .select('checkout_session_id', { count: 'exact', head: true })
    .eq('pack_id', 'founding');
  if (error) return FOUNDING_MAX_SALES;
  return count ?? 0;
}
