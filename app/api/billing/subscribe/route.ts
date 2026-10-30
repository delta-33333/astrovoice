import { isLocale, type Locale } from '@/lib/seo';
import { NextRequest, NextResponse } from 'next/server';
import { createSubscriptionCheckout } from '@/lib/checkout';
import { resolveMarket } from '@/lib/market';
import { marketCodeForContext, MARKET_PRICING } from '@/lib/money';
import { loadSubscription } from '@/lib/subscriptions';
import { getSession } from '@/lib/session';
import { isWeeklyPlan, WEEKLY_PLANS } from '@/lib/weekly';
import { renewalTerms } from '@/lib/renewal-copy';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Connectez-vous pour vous abonner.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const plan = typeof body?.plan === 'string' ? body.plan : '';
  if (!isWeeklyPlan(plan)) {
    return NextResponse.json({ error: 'Choisissez une formule.' }, { status: 400 });
  }

  const current = await loadSubscription(user.id);
  if (current && (current.status === 'active' || current.status === 'trialing')) {
    return NextResponse.json({ error: 'Une formule est déjà en cours.' }, { status: 409 });
  }

  const market = await resolveMarket();
  const code = marketCodeForContext({
    country: market.country,
    locale: market.language,
    currency: market.currency,
  });
  // Page Offres localisée : fr/es/de/it affichent et encaissent en euros, dans la langue de la page.
  const pageLocale: Locale | null = typeof body?.locale === 'string' && isLocale(body.locale) ? body.locale : null;
  const currency = pageLocale && pageLocale !== 'en' ? 'eur' : MARKET_PRICING[code].currency;
  const language = pageLocale ?? market.language;
  try {
    const session = await createSubscriptionCheckout({
      request,
      user,
      currency,
      plan,
      language: language,
    });
    const terms = renewalTerms(plan, currency, language, new Date(), session.introWeek);
    return NextResponse.json({
      clientSecret: session.clientSecret,
      checkoutSessionId: session.checkoutSessionId,
      collectContact: session.collectContact,
      currency,
      plan,
      amountLabel: session.introWeek ? terms.trialLabel : terms.fullLabel,
      renewal: terms.sentence,
      name: WEEKLY_PLANS[plan].names[language],
    });
  } catch (error) {
    const codeName = error instanceof Error ? error.message : '';
    if (codeName === 'STRIPE_NOT_CONFIGURED' || codeName === 'PRICE_NOT_CONFIGURED' || codeName === 'COUPON_NOT_CONFIGURED') {
      return NextResponse.json({ error: 'Le paiement est indisponible.' }, { status: 503 });
    }
    console.error('Formule:', codeName);
    return NextResponse.json({ error: 'La formule n’a pas pu être préparée.' }, { status: 500 });
  }
}
