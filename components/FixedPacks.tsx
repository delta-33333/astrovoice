import Link from 'next/link';
import { resolveMarket } from '@/lib/market';
import { formatMoney, MARKET_PRICING, packMarketFor } from '@/lib/money';
import { FIXED_PACKS, packForMarket } from '@/lib/pricing';
import { FIXED_PRICE_LINE, type TrustLocale } from '@/lib/trust-copy';

const COPY: Record<TrustLocale, { kicker: string; title: string; lead: string; minutes: string; perMin: string; buy: string; popular: string; foot: string; trial: string }> = {
  fr: {
    kicker: 'Tarif unique',
    title: 'Packs de minutes à prix fixe',
    lead: 'Vous payez une fois. L’appel s’arrête tout seul quand le pack est utilisé. Pas d’abonnement, pas de recharge automatique.',
    minutes: 'minutes',
    perMin: 'soit {x}/min',
    buy: 'Choisir {n} min',
    popular: 'Le plus choisi',
    foot: 'Paiement unique sécurisé (Stripe). Minutes sans date d’expiration. Si la ligne coupe, les minutes non utilisées restent sur votre compte.',
    trial: 'Pas encore sûr ? 3 minutes offertes, sans carte.',
  },
  en: {
    kicker: 'One price list',
    title: 'Fixed-price minute packs',
    lead: 'You pay once. The call stops by itself when the pack is used up. No subscription, no auto top-up.',
    minutes: 'minutes',
    perMin: '{x}/min',
    buy: 'Choose {n} min',
    popular: 'Most chosen',
    foot: 'One-off secure payment (Stripe). Minutes never expire. If the line drops, unused minutes stay on your account.',
    trial: 'Not sure yet? 3 free minutes, no card.',
  },
};

/** Grille unique : trois packs prépayés à prix fixe (offre principale du site). */
export default async function FixedPacks({ locale, pageLocale, trialHref }: { locale: TrustLocale; pageLocale?: string; trialHref?: string }) {
  const market = await resolveMarket();
  const code = packMarketFor(pageLocale ?? locale, market);
  const currency = MARKET_PRICING[code].currency;
  const t = COPY[locale];
  const fmtLocale = pageLocale ?? locale;
  return (
    <section id="packs" data-fixed-packs className="px-4 pt-6">
      <div className="mx-auto max-w-lg md:max-w-4xl">
        <p className="text-xs uppercase tracking-[0.16em] text-celestial-gold">{t.kicker}</p>
        <h2 className="mt-1 font-[family-name:var(--font-cinzel)] text-2xl leading-tight sm:text-3xl">{t.title}</h2>
        <p className="mt-2 text-lg font-semibold text-celestial-gold">{FIXED_PRICE_LINE[locale]}</p>
        <p className="mt-1 text-sm leading-relaxed text-white/75">{t.lead}</p>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {FIXED_PACKS.map((pack) => {
            const priced = packForMarket(pack, code);
            const price = formatMoney(priced.amountCents, currency, fmtLocale);
            const perMin = formatMoney(Math.round(priced.amountCents / pack.minutes), currency, fmtLocale);
            return (
              <article
                key={pack.id}
                data-pack={pack.id}
                className={`flex flex-col rounded-3xl border p-4 sm:p-5 ${pack.popular ? 'border-celestial-gold bg-celestial-gold/15' : 'border-white/10 bg-white/5'}`}
              >
                {pack.popular && <p className="text-xs uppercase tracking-[0.16em] text-celestial-gold">{t.popular}</p>}
                <p className="mt-1 text-2xl font-semibold">{pack.minutes} {t.minutes}</p>
                <p className="mt-1 text-3xl font-semibold text-celestial-gold">{price}</p>
                <p className="text-xs text-white/55">{t.perMin.replace('{x}', perMin)}</p>
                <Link href={`/packs?pack=${pack.id}&lang=${locale}`} data-cta={`pack-${pack.id}`} className={`${pack.popular ? 'btn-primary' : 'btn-secondary'} mt-4 block w-full text-center`}>
                  {t.buy.replace('{n}', String(pack.minutes))}
                </Link>
              </article>
            );
          })}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-white/55">{t.foot}</p>
        {trialHref && (
          <p className="mt-2 text-sm"><Link href={trialHref} className="text-celestial-gold underline">{t.trial}</Link></p>
        )}
      </div>
    </section>
  );
}
