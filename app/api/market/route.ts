import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { MARKET_COOKIE, marketCookieOptions, resolveMarket } from '@/lib/market';
import { convertEurCents, formatMoney, isAdvisorLang, isCurrency } from '@/lib/money';
import { MINUTE_PACKS, SUMMARY_CENTS } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export async function GET() {
  const market = await resolveMarket();
  const money = (eurCents: number) =>
    formatMoney(convertEurCents(eurCents, market.currency, market.rates), market.currency);

  return NextResponse.json({
    language: market.language,
    currency: market.currency,
    summaryLabel: money(SUMMARY_CENTS),
    foundingLabel: money(490),
    floorLabel: money(50),
    ceilingLabel: money(200),
    packs: MINUTE_PACKS.map((pack) => ({
      id: pack.id,
      amountLabel: money(pack.amountCents),
      regularLabel: money(pack.regularCents),
      perMinLabel: `${money(Math.round(pack.amountCents / pack.minutes))}/min`,
      savingsLabel: money(Math.max(0, pack.regularCents - pack.amountCents)),
    })),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const language = typeof body?.language === 'string' ? body.language : '';
  const currency = typeof body?.currency === 'string' ? body.currency : '';
  if (!isAdvisorLang(language) || !isCurrency(currency)) {
    return NextResponse.json({ error: 'Marché invalide.' }, { status: 400 });
  }

  const jar = await cookies();
  jar.set(MARKET_COOKIE, `${language}.${currency}`, marketCookieOptions());
  return NextResponse.json({ language, currency });
}
