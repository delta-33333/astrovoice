import Link from 'next/link';
import AiDisclosure from '@/components/AiDisclosure';
import JsonLd from '@/components/JsonLd';
import { GeoFooter, GeoHeader } from '@/components/GeoShell';
import { GEO_PATHS, type GeoLocale } from '@/lib/geo-pages';
import { GUARANTEE_TEXT } from '@/lib/guarantee-text';
import { localeRates } from '@/lib/market';
import { perMinuteRange } from '@/lib/money';
import { INTRO_MINUTES } from '@/lib/price-bands';
import { ANSWER_TOPICS, consultationContent } from '@/lib/specialty-content';
import { hubPath, localeCurrency, specialtyLabel } from '@/lib/seo';
import { appBaseUrl } from '@/lib/stripe';

export function consultationCopy(locale: GeoLocale) {
  const range = perMinuteRange(localeCurrency(locale), localeRates(locale), locale);
  return consultationContent(locale, { floor: range.floor, ceiling: range.ceiling, introMinutes: INTRO_MINUTES });
}

export default function GeoConsultationPage({ locale }: { locale: GeoLocale }) {
  const copy = consultationCopy(locale);
  const origin = appBaseUrl();
  const url = `${origin}${GEO_PATHS.consultation[locale]}`;
  const home = locale === 'fr' ? '/fr' : '/en';
  return (
    <main>
      <GeoHeader locale={locale} page="consultation" />
      <article className="max-w-3xl mx-auto px-4 py-8 text-white/85 leading-relaxed">
        <nav aria-label="Breadcrumb" className="text-sm text-white/50 mb-4">
          <Link href={home}>{locale === 'fr' ? 'Accueil' : 'Home'}</Link>
          <span> / </span>
          <span>{copy.title}</span>
        </nav>
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl text-white">{copy.title}</h1>
        <p className="mt-5 text-lg text-white">{copy.answer}</p>
        <p className="mt-2 text-xs text-white/50">
          {locale === 'fr'
            ? 'Prix indiqués pour ce marché ; le prix exact pour votre pays est affiché avant le paiement.'
            : 'Prices shown for this market; the exact price for your country is shown before payment.'}
        </p>

        <h2 className="mt-8 text-xl text-white font-semibold">{copy.stepsTitle}</h2>
        <ol className="mt-3 list-decimal pl-5 space-y-2">
          {copy.steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
        <p className="mt-4 rounded-xl border border-celestial-gold/40 bg-celestial-gold/10 p-4 text-sm">
          {locale === 'fr'
            ? `${GUARANTEE_TEXT.title}. ${GUARANTEE_TEXT.body}`
            : `Refunded if the first ${INTRO_MINUTES} minutes don’t suit you: hang up within the first ${INTRO_MINUTES} billed minutes and request a refund from your account within 24 hours. One request per account.`}
        </p>

        <h2 className="mt-8 text-xl text-white font-semibold">{copy.topicsTitle}</h2>
        <ul className="mt-3 flex flex-wrap gap-3">
          {ANSWER_TOPICS.map((topic) => (
            <li key={topic}>
              <Link href={hubPath(locale, topic)} className="underline text-celestial-gold">{specialtyLabel(locale, topic)}</Link>
            </li>
          ))}
        </ul>

        <h2 className="mt-10 text-xl text-white font-semibold">{locale === 'fr' ? 'Questions fréquentes' : 'Frequently asked questions'}</h2>
        <dl className="mt-3 space-y-5">
          {copy.faqs.map((faq) => (
            <div key={faq.question}>
              <dt className="font-semibold text-white">{faq.question}</dt>
              <dd className="mt-1">{faq.answer}</dd>
            </div>
          ))}
        </dl>

        <AiDisclosure locale={locale} className="mt-10" />
        <p className="mt-6">
          <Link href={home} className="btn-primary inline-block">{locale === 'fr' ? 'Voir les conseillers' : 'See the advisors'}</Link>
        </p>
      </article>
      <GeoFooter locale={locale} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'FAQPage',
            mainEntity: copy.faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: locale === 'fr' ? 'Accueil' : 'Home', item: `${origin}${home}` },
              { '@type': 'ListItem', position: 2, name: copy.title, item: url },
            ],
          },
        ],
      }} />
    </main>
  );
}
