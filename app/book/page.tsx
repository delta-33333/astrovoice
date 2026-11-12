import BookCheckout from '@/components/BookCheckout';
import { discoveryHeadline, discoveryPriceLabel } from '@/lib/book-funnel';
import { resolveMarket } from '@/lib/market';
import { packsLead } from '@/lib/pack-offer';
import { weeklyCurrency } from '@/lib/weekly';

export default async function BookPage() {
  const market = await resolveMarket();
  const currency = weeklyCurrency(market.currency);
  return (
    <BookCheckout
      language={market.language}
      currency={market.currency}
      headline={discoveryHeadline(market.language, currency)}
      renewal={packsLead(market.language)}
      trialLabel={discoveryPriceLabel(market.language, currency)}
      fullLabel=""
    />
  );
}
