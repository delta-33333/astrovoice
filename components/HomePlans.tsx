import Link from 'next/link';
import { homePlansCopy } from '@/lib/home-plans-copy';
import type { AdvisorLang } from '@/lib/money';
import { packPriceLabel, packsCheckoutPath, packsLead, packsOfferLine } from '@/lib/pack-offer';
import { FIXED_PACKS, isFixedPackId } from '@/lib/pricing';
import type { WeeklyCurrency } from '@/lib/weekly';

/** Trois packs à prix fixe, CTA vers le paiement /packs déjà en place. */
export default function HomePlans({
  locale,
  currency,
}: {
  locale: AdvisorLang;
  currency: WeeklyCurrency;
}) {
  const copy = homePlansCopy(locale);
  const line = packsOfferLine(locale, currency);

  return (
    <section id="packs" data-home-plans data-fixed-packs className="px-4 pt-6">
      <div className="mx-auto max-w-lg md:max-w-4xl">
        <p className="text-xs uppercase tracking-[0.16em] text-celestial-gold">{copy.kicker}</p>
        <h2 className="mt-1 font-[family-name:var(--font-cinzel)] text-2xl leading-tight sm:text-3xl">{copy.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/75 sm:text-base">{copy.lead}</p>
        <p className="mt-2 text-lg font-semibold text-celestial-gold">{line}</p>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {FIXED_PACKS.map((pack) => {
            if (!isFixedPackId(pack.id)) return null;
            const price = packPriceLabel(pack.id, locale, currency);
            return (
              <article
                key={pack.id}
                data-pack={pack.id}
                className={`flex flex-col rounded-3xl border p-4 sm:p-5 ${
                  pack.popular ? 'border-celestial-gold bg-celestial-gold/15' : 'border-white/10 bg-white/5'
                }`}
              >
                {pack.popular ? (
                  <p className="text-xs uppercase tracking-[0.16em] text-celestial-gold">{copy.recommended}</p>
                ) : (
                  <p className="text-xs uppercase tracking-[0.16em] text-white/40">{copy.formula}</p>
                )}
                <h3 className="mt-2 font-[family-name:var(--font-cinzel)] text-xl">{copy.minutes(pack.minutes)}</h3>
                <p className="mt-3 text-2xl font-bold leading-tight text-celestial-gold">{price}</p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/75">{packsLead(locale)}</p>
                <Link href={packsCheckoutPath({ pack: pack.id, lang: locale === 'en' ? 'en' : 'fr' })} className="btn-primary mt-4 block w-full text-center text-base">
                  {copy.choose(`${pack.minutes} min`)}
                </Link>
              </article>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-white/55">{copy.ai}</p>
      </div>
    </section>
  );
}
