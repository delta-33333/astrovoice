import Link from 'next/link';
import { discoveryHeadline } from '@/lib/book-funnel';
import { homePlansCopy } from '@/lib/home-plans-copy';
import type { AdvisorLang } from '@/lib/money';
import { renewalTerms } from '@/lib/renewal-copy';
import { WEEKLY_PLAN_IDS, WEEKLY_PLANS, type WeeklyCurrency } from '@/lib/weekly';

/** Trois formules hebdomadaires, Découverte en tête, Essentiel mis en avant. */
export default function HomePlans({
  locale,
  currency,
}: {
  locale: AdvisorLang;
  currency: WeeklyCurrency;
}) {
  const copy = homePlansCopy(locale);
  const plans = WEEKLY_PLAN_IDS.map((id) => {
    const terms = renewalTerms(id, currency, locale);
    return {
      id,
      name: WEEKLY_PLANS[id].names[locale],
      minutes: WEEKLY_PLANS[id].minutes,
      highlighted: id === 'essentiel',
      trial: terms.trialLabel,
      full: terms.fullLabel,
      renewal: terms.sentence,
      href: id === 'decouverte' ? '/book?offer=decouverte' : '/offres#formules',
    };
  });
  const discovery = plans[0];

  return (
    <section id="formules" data-home-plans className="px-4 pt-6">
      <div className="mx-auto max-w-lg md:max-w-4xl">
        <p className="text-xs uppercase tracking-[0.16em] text-celestial-gold">{copy.kicker}</p>
        <h2 className="mt-1 font-[family-name:var(--font-cinzel)] text-2xl leading-tight sm:text-3xl">{copy.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/75 sm:text-base">{copy.lead}</p>

        <article data-offer="decouverte" className="mt-4 rounded-3xl border border-celestial-gold/40 bg-celestial-gold/10 p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-celestial-gold">{WEEKLY_PLANS.decouverte.names[locale]}</p>
          <p className="mt-1 text-3xl font-semibold leading-tight text-celestial-gold sm:text-4xl">
            {discoveryHeadline(locale, currency)}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/85">{discovery.renewal}</p>
          <p className="mt-2 text-xs text-white/55">{copy.ai}</p>
          <Link href="/book?offer=decouverte" className="btn-primary mt-4 block w-full text-center text-base">
            {copy.pay(discovery.trial)}
          </Link>
        </article>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              data-plan={plan.id}
              data-highlighted={plan.highlighted ? 'true' : 'false'}
              className={`flex flex-col rounded-3xl border p-4 sm:p-5 ${
                plan.highlighted ? 'border-celestial-gold bg-celestial-gold/15' : 'border-white/10 bg-white/5'
              }`}
            >
              <p className={`text-xs uppercase tracking-[0.16em] ${plan.highlighted ? 'text-celestial-gold' : 'text-white/40'}`}>
                {plan.highlighted ? copy.recommended : copy.formula}
              </p>
              <h3 className="mt-2 font-[family-name:var(--font-cinzel)] text-xl">{plan.name}</h3>
              <p className="mt-3 text-2xl font-bold leading-tight text-celestial-gold">{plan.trial}</p>
              <p className="text-sm text-white/70">{copy.firstWeek}</p>
              <p className="text-sm text-white/60">{copy.thenWeek(plan.full)}</p>
              <p className="mt-2 text-sm text-white/80">{copy.minutes(plan.minutes)}</p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-white/75">{plan.renewal}</p>
              <Link href={plan.href} className="btn-primary mt-4 block w-full text-center text-base">
                {copy.choose(plan.name)}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
