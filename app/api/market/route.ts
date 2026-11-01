import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { foundingOfferOpen } from '@/lib/founding';
import { MARKET_COOKIE, marketCookieOptions, resolveMarket } from '@/lib/market';
import {
  convertEurCents,
  formatMoney,
  isAdvisorLang,
  isCurrency,
  MARKET_PRICING,
  marketCodeForContext,
  packMarketFor,
  perMinuteRange,
} from '@/lib/money';
import {
  COMPATIBILITY_REPORT_EUR_CENTS,
  FORECAST_REPORT_EUR_CENTS,
  NATAL_REPORT_EUR_CENTS,
} from '@/lib/offers';
import { MINUTE_PACKS, packForMarket, SUMMARY_CENTS } from '@/lib/pricing';
import { renewalTerms } from '@/lib/renewal-copy';
import { WEEKLY_MAX_CALL_MINUTES, WEEKLY_PLAN_IDS, WEEKLY_PLANS } from '@/lib/weekly';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const market = await resolveMarket();
  const code = marketCodeForContext({
    country: market.country,
    locale: market.language,
    currency: market.currency,
  });
  const grid = MARKET_PRICING[code];
  const pageLang = new URL(request.url).searchParams.get('lang');
  const packCode = packMarketFor(pageLang, market);
  const packGrid = MARKET_PRICING[packCode];
  const showPack = (minor: number) => formatMoney(minor, packGrid.currency, pageLang || market.language);
  const show = (minor: number) => formatMoney(minor, grid.currency, market.language);
  const money = (eurCents: number) =>
    formatMoney(convertEurCents(eurCents, market.currency, market.rates), market.currency, market.language);
  const range = perMinuteRange(market.currency, market.rates, market.language, market.country);
  const plans = WEEKLY_PLAN_IDS.map((id) => {
    const plan = WEEKLY_PLANS[id];
    const terms = renewalTerms(id, grid.currency, market.language);
    return {
      id,
      name: plan.names[market.language],
      minutes: plan.minutes,
      highlighted: id === 'essentiel',
      priceLabel: show(plan.amounts[grid.currency]),
      trialLabel: terms.trialLabel,
      renewal: terms.sentence,
    };
  });

  return NextResponse.json({
    packCurrency: packGrid.currency,
    language: market.language,
    currency: grid.currency,
    country: market.country,
    summaryLabel: money(SUMMARY_CENTS),
    foundingLabel: show(grid.founding),
    foundingOpen: foundingOfferOpen(new Date(), 0),
    floorLabel: range.floor,
    ceilingLabel: range.ceiling,
    introLabel: range.intro,
    offers: {
      summaryLabel: money(SUMMARY_CENTS),
      natalLabel: money(NATAL_REPORT_EUR_CENTS),
      forecastLabel: money(FORECAST_REPORT_EUR_CENTS),
      compatibilityLabel: money(COMPATIBILITY_REPORT_EUR_CENTS),
      rebookPercent: 15,
      maxCallMinutes: WEEKLY_MAX_CALL_MINUTES,
      plans,
    },
    packs: MINUTE_PACKS.map((pack) => {
      const priced = packForMarket(pack, packCode);
      return {
        id: pack.id,
        amountLabel: showPack(priced.amountCents),
        regularLabel: showPack(priced.regularCents),
        perMinLabel: `${showPack(Math.round(priced.amountCents / pack.minutes))}/min`,
        savingsLabel: showPack(Math.max(0, priced.regularCents - priced.amountCents)),
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
