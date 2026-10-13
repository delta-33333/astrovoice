import BookCheckout from '@/components/BookCheckout';
import { discoveryHeadline, discoveryPriceLabel, narrowPrice } from '@/lib/book-funnel';
import { resolveMarket } from '@/lib/market';
import { renewalTerms } from '@/lib/renewal-copy';
import { weeklyCurrency } from '@/lib/weekly';

export default async function BookPage() {
  const market = await resolveMarket();
  const currency = weeklyCurrency(market.currency);
  const terms = renewalTerms('decouverte', currency, market.language);
  return (
    <BookCheckout
      language={market.language}
      currency={market.currency}
      headline={discoveryHeadline(market.language, currency)}
      renewal={terms.sentence}
      trialLabel={discoveryPriceLabel(market.language, currency)}
      fullLabel={narrowPrice(terms.fullLabel)}
    />
  );
}
