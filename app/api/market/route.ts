import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { MARKET_COOKIE, marketCookieOptions, resolveMarket } from '@/lib/market';
import {
  convertEurCents,
  formatMoney,
  isAdvisorLang,
  isCurrency,
  packMinor,
  packReferenceMinor,
  perMinuteRange,
} from '@/lib/money';
import { INTRO_MINUTES } from '@/lib/price-bands';
import {
  COMPATIBILITY_REPORT_EUR_CENTS,
  FORECAST_REPORT_EUR_CENTS,
  NATAL_REPORT_EUR_CENTS,
  SUBSCRIPTION_EUR_CENTS,
  SUBSCRIPTION_FAIR_USE_MINUTES,
  SUBSCRIPTION_MAX_CALL_MINUTES,
  subscriptionCurrency,
} from '@/lib/offers';
import { MINUTE_PACKS, SUMMARY_CENTS } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export async function GET() {
  const market = await resolveMarket();
  const money = (eurCents: number) =>
    formatMoney(convertEurCents(eurCents, market.currency, market.rates), market.currency);

  const range = perMinuteRange(market.currency, market.rates);

  return NextResponse.json({
    language: market.language,
    currency: market.currency,
    summaryLabel: money(SUMMARY_CENTS),
    foundingLabel: money(490),
    floorLabel: range.floor,
    ceilingLabel: range.ceiling,
    offers: {
      subscriptionLabel: formatMoney(
        convertEurCents(SUBSCRIPTION_EUR_CENTS, subscriptionCurrency(market.currency), market.rates),
        subscriptionCurrency(market.currency)
      ),
      summaryLabel: money(SUMMARY_CENTS),
      natalLabel: money(NATAL_REPORT_EUR_CENTS),
      forecastLabel: money(FORECAST_REPORT_EUR_CENTS),
      compatibilityLabel: money(COMPATIBILITY_REPORT_EUR_CENTS),
      rebookPercent: 15,
      fairUseMinutes: SUBSCRIPTION_FAIR_USE_MINUTES,
      maxCallMinutes: SUBSCRIPTION_MAX_CALL_MINUTES,
    },
    introMinutes: INTRO_MINUTES,
    band: market.band,
    packs: MINUTE_PACKS.map((pack) => {
      const amount = packMinor(pack, market.currency, market.rates);
      const regular = packReferenceMinor(pack.minutes, market.currency, market.rates);
      const fmt = (minor: number) => formatMoney(minor, market.currency);
      return {
        id: pack.id,
        amountLabel: fmt(amount),
        regularLabel: fmt(regular),
        perMinLabel: `${fmt(Math.round(amount / pack.minutes))}/min`,
        savingsLabel: fmt(Math.max(0, regular - amount)),
      };
    }),
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
