import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AiDisclosure from '@/components/AiDisclosure';
import JsonLd from '@/components/JsonLd';
import SeoChrome from '@/components/SeoChrome';
import ReviewsBlock from '@/components/ReviewsBlock';
import { advisorReviews, aggregateRatingLd } from '@/lib/reviews';
import { exampleQuestions, methodParagraph, readingStyleText } from '@/lib/profile-content';
import { INTRO_MINUTES } from '@/lib/price-bands';
import { localizedBio } from '@/lib/advisor-bio';
import { bookPath } from '@/lib/book-path';
import { localeRates } from '@/lib/market';
import { quoteAdvisor } from '@/lib/money';
import { appBaseUrl } from '@/lib/stripe';
import { getAdvisorProfile, listDirectoryAdvisors } from '@/lib/slots';
import {
  advisorAlternates,
  advisorFaqs,
  advisorPath,
  advisorSpeaks,
  availabilitySentence,
  indexableAdvisorLocales,
  homeLabel,
  hubPath,
  isLocale,
  languageLabel,
  localeCurrency,
  localeHomePath,
  phonePhrase,
  professionSlug,
  specialtyLabel,
  styleLabel,
  type Locale,
} from '@/lib/seo';

export const dynamic = 'force-dynamic';

async function load(locale: string, segment: string, slug: string) {
  if (!isLocale(locale) || segment !== professionSlug(locale)) return null;
  try {
    const profile = await getAdvisorProfile(slug);
    if (!profile.advisor || profile.unavailable) return null;
    return profile.advisor;
  } catch {
    return null;
  }
}

export async function generateMetadata(
  props: { params: Promise<{ locale: string; segment: string; slug: string }> }
): Promise<Metadata> {
  const { locale, segment, slug } = await props.params;
  const advisor = await load(locale, segment, slug);
  if (!advisor || !isLocale(locale)) return {};
  const currency = localeCurrency(locale);
  const quote = quoteAdvisor(advisor.pricePerMinCents, currency, localeRates(locale), undefined, locale);
  const topic = specialtyLabel(locale, advisor.specialties[0] || 'amour');
  const title = `${advisor.name} — ${topic} — ${phonePhrase(locale)} dès ${quote.introLabel}`;
  const description = `${advisor.name} : ${phonePhrase(locale)} sur ${advisor.specialties.map((item) => specialtyLabel(locale, item)).join(', ')}. ${styleLabel(locale, advisor.readingStyle)}. Dès ${quote.introLabel}.`.slice(0, 160);
  const path = advisorPath(locale, advisor.slug);
  const indexable = indexableAdvisorLocales(advisor.languages);
  const listed = indexable.includes(locale);
  const canonical = listed || indexable.length === 0 ? path : advisorPath(indexable[0], advisor.slug);
  return {
    title,
    description,
    robots: listed ? { index: true, follow: true } : { index: false, follow: true },
    alternates: {
      canonical,
      ...(listed ? { languages: advisorAlternates(advisor.slug, advisor.languages) } : {}),
    },
    openGraph: { title, description, url: canonical, type: 'website' },
  };
}

export default async function AdvisorSeoPage(
  props: { params: Promise<{ locale: string; segment: string; slug: string }> }
) {
  const { locale, segment, slug } = await props.params;
  if (!isLocale(locale) || segment !== professionSlug(locale)) notFound();
  const advisor = await load(locale, segment, slug);
  if (!advisor) notFound();

  const currency = localeCurrency(locale);
  const rates = localeRates(locale);
  const quote = quoteAdvisor(advisor.pricePerMinCents, currency, rates, undefined, locale);
  const topics = advisor.specialties.map((item) => specialtyLabel(locale, item));
  const languages = advisor.languages.map((code) => languageLabel(locale, code));
  const availability = availabilitySentence(locale, advisor.availability);
  const primary = advisor.specialties[0] || 'amour';
  const faqs = advisorFaqs({
    locale,
    name: advisor.name,
    specialties: topics.join(', '),
    style: styleLabel(locale, advisor.readingStyle),
    languages: languages.join(', '),
    intro: quote.introLabel,
    standard: quote.perMinLabel,
    availability,
    gender: advisor.gender,
  });
  const bio = localizedBio(advisor, locale);
  const origin = appBaseUrl();
  const pageUrl = `${origin}${advisorPath(locale, advisor.slug)}`;
  const bookHref = advisor.availability.immediateSlotId && advisor.availability.immediateStartsAt
    ? bookPath(advisor.availability.immediateSlotId, advisor.availability.immediateStartsAt, advisor.id)
    : `/advisors/${advisor.slug}`;

  let related: { slug: string; name: string }[] = [];
  try {
    const directory = await listDirectoryAdvisors();
    related = directory.advisors
      .filter((item) => item.id !== advisor.id && item.specialties.includes(primary) && advisorSpeaks(item.languages, locale))
      .slice(0, 6)
      .map((item) => ({ slug: item.slug, name: item.name }));
  } catch {
    related = [];
  }

  const cta: Record<Locale, string> = {
    fr: advisor.availability.hasImmediate ? 'Appeler maintenant' : 'Prendre rendez-vous',
    en: advisor.availability.hasImmediate ? 'Call now' : 'Book a time',
    es: advisor.availability.hasImmediate ? 'Llamar ahora' : 'Reservar',
    de: advisor.availability.hasImmediate ? 'Jetzt anrufen' : 'Termin nehmen',
    it: advisor.availability.hasImmediate ? 'Chiama ora' : 'Prenota',
  };

  const intro: Record<Locale, string> = {
    fr: `${advisor.name} propose une ${phonePhrase(locale)} dès ${quote.introLabel} (puis ${quote.perMinLabel}) sur ${topics.join(', ')}. Le style est ${styleLabel(locale, advisor.readingStyle)}. Langues : ${languages.join(', ')}. ${availability}`,
    en: `${advisor.name} offers a ${phonePhrase(locale)} from ${quote.introLabel} (then ${quote.perMinLabel}) on ${topics.join(', ')}. The style is ${styleLabel(locale, advisor.readingStyle)}. Languages: ${languages.join(', ')}. ${availability}`,
    es: `${advisor.name} ofrece una ${phonePhrase(locale)} desde ${quote.introLabel} (luego ${quote.perMinLabel}) sobre ${topics.join(', ')}. El estilo es ${styleLabel(locale, advisor.readingStyle)}. Idiomas: ${languages.join(', ')}. ${availability}`,
    de: `${advisor.name} bietet eine ${phonePhrase(locale)} ab ${quote.introLabel} (danach ${quote.perMinLabel}) zu ${topics.join(', ')}. Der Stil ist ${styleLabel(locale, advisor.readingStyle)}. Sprachen: ${languages.join(', ')}. ${availability}`,
    it: `${advisor.name} offre un ${phonePhrase(locale)} da ${quote.introLabel} (poi ${quote.perMinLabel}) su ${topics.join(', ')}. Lo stile è ${styleLabel(locale, advisor.readingStyle)}. Lingue: ${languages.join(', ')}. ${availability}`,
  };

  const reviews = await advisorReviews(advisor.id);
  const rating = aggregateRatingLd(reviews);
  const bookCta: Record<Locale, string> = {
    fr: 'Réserver un créneau',
    en: 'Book a time slot',
    es: 'Reservar una hora',
    de: 'Termin reservieren',
    it: 'Prenota un orario',
  };
  const priceNote: Record<Locale, string> = {
    fr: `Tarif réduit les ${INTRO_MINUTES} premières minutes. Le prix exact pour votre pays est affiché avant le paiement.`,
    en: `Reduced rate for the first ${INTRO_MINUTES} minutes. The exact price for your country is shown before payment.`,
    es: `Tarifa reducida los ${INTRO_MINUTES} primeros minutos. El precio exacto para tu país se muestra antes del pago.`,
    de: `Ermäßigter Tarif in den ersten ${INTRO_MINUTES} Minuten. Der genaue Preis für Ihr Land wird vor der Zahlung angezeigt.`,
    it: `Tariffa ridotta per i primi ${INTRO_MINUTES} minuti. Il prezzo esatto per il tuo paese è indicato prima del pagamento.`,
  };
  const headings: Record<Locale, { style: string; questions: string }> = {
    fr: { style: 'Style de lecture', questions: 'Exemples de questions à poser' },
    en: { style: 'Reading style', questions: 'Example questions to ask' },
    es: { style: 'Estilo de lectura', questions: 'Ejemplos de preguntas' },
    de: { style: 'Deutungsstil', questions: 'Beispielfragen' },
    it: { style: 'Stile di lettura', questions: 'Esempi di domande' },
  };
  const showRating = reviews.count >= 3 && reviews.average != null;
  const priceMajor = currency === 'jpy' ? quote.introMinor : (quote.introMinor / 100).toFixed(2);
  const listed = indexableAdvisorLocales(advisor.languages).includes(locale);
  const orgId = `${origin}/#organization`;

  return (
    <main>
      <SeoChrome locale={locale} alternatePath={(item) => advisorPath(item, advisor.slug)} />
      <article className="max-w-3xl mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" className="text-sm text-white/50 mb-4">
          <Link href={localeHomePath(locale)}>{homeLabel(locale)}</Link>
          <span> / </span>
          <Link href={hubPath(locale, primary)}>{specialtyLabel(locale, primary)}</Link>
          <span> / </span>
          <span>{advisor.name}</span>
        </nav>
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-5xl">{advisor.name}</h1>
        <AiDisclosure locale={locale} gender={advisor.gender} className="mt-3" />
        <p className="mt-4 text-lg text-white/85 leading-relaxed">{intro[locale]}</p>
        <p className="mt-3 text-celestial-gold">{quote.introLabel} · {quote.perMinLabel}</p>
        <p className="mt-2 text-xs text-white/50">{priceNote[locale]}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={bookHref} className="btn-primary inline-block">{cta[locale]}</Link>
          {advisor.availability.hasImmediate && (
            <Link href={`/advisors/${advisor.slug}#creneaux`} className="btn-secondary inline-block">{bookCta[locale]}</Link>
          )}
        </div>

        <dl className="mt-8 grid gap-3 text-sm">
          <div>
            <dt className="text-white/45">{locale === 'fr' ? 'Spécialités' : locale === 'de' ? 'Themen' : locale === 'es' ? 'Especialidades' : locale === 'it' ? 'Specialità' : 'Specialties'}</dt>
            <dd className="mt-1 flex flex-wrap gap-2">
              {advisor.specialties.map((item) => (
                <Link key={item} href={hubPath(locale, item)} className="underline text-celestial-gold">
                  {specialtyLabel(locale, item)}
                </Link>
              ))}
            </dd>
          </div>
          <div>
            <dt className="text-white/45">{locale === 'fr' ? 'Style' : locale === 'de' ? 'Stil' : locale === 'es' ? 'Estilo' : locale === 'it' ? 'Stile' : 'Style'}</dt>
            <dd>{styleLabel(locale, advisor.readingStyle)}</dd>
          </div>
          <div>
            <dt className="text-white/45">{locale === 'fr' ? 'Langues' : locale === 'de' ? 'Sprachen' : locale === 'es' ? 'Idiomas' : locale === 'it' ? 'Lingue' : 'Languages'}</dt>
            <dd>{languages.join(', ')}</dd>
          </div>
          <div>
            <dt className="text-white/45">{locale === 'fr' ? 'Disponibilité' : locale === 'de' ? 'Verfügbarkeit' : locale === 'es' ? 'Disponibilidad' : locale === 'it' ? 'Disponibilità' : 'Availability'}</dt>
            <dd>{availability}</dd>
          </div>
          {showRating && (
            <div>
              <dt className="text-white/45">{locale === 'en' ? 'Reviews' : locale === 'de' ? 'Bewertungen' : locale === 'es' ? 'Opiniones' : locale === 'it' ? 'Recensioni' : 'Avis'}</dt>
              <dd>{reviews.average} / 5 · {reviews.count}</dd>
            </div>
          )}
        </dl>

        {bio && <p className="mt-6 text-white/75 leading-relaxed">{bio}</p>}
        <p className="mt-3 text-white/75 leading-relaxed">{methodParagraph(locale, advisor)}</p>
        {readingStyleText(locale, advisor.readingStyle) && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold">{headings[locale].style}</h2>
            <p className="mt-2 text-white/75 leading-relaxed">{readingStyleText(locale, advisor.readingStyle)}</p>
          </section>
        )}
        <section className="mt-8">
          <h2 className="text-xl font-semibold">{headings[locale].questions}</h2>
          {advisor.specialties.map((specialty) => {
            const questions = exampleQuestions(locale, specialty);
            if (!questions.length) return null;
            return (
              <div key={specialty} className="mt-4">
                <h3 className="font-semibold text-celestial-gold">{specialtyLabel(locale, specialty)}</h3>
                <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-white/75">
                  {questions.map((question) => <li key={question}>{question}</li>)}
                </ul>
              </div>
            );
          })}
        </section>
        <ReviewsBlock reviews={reviews} locale={locale} />

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-[family-name:var(--font-cinzel)]">FAQ</h2>
          {faqs.map((item) => (
            <details key={item.question} className="rounded-xl border border-white/10 p-4">
              <summary className="font-semibold cursor-pointer">{item.question}</summary>
              <p className="mt-2 text-sm text-white/75 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </section>

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-[family-name:var(--font-cinzel)]">{specialtyLabel(locale, primary)}</h2>
            <ul className="mt-3 space-y-2">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link href={advisorPath(locale, item.slug)} className="underline hover:text-celestial-gold">{item.name}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
      {listed && (
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: homeLabel(locale), item: `${origin}${localeHomePath(locale)}` },
                { '@type': 'ListItem', position: 2, name: specialtyLabel(locale, primary), item: `${origin}${hubPath(locale, primary)}` },
                { '@type': 'ListItem', position: 3, name: advisor.name, item: pageUrl },
              ],
            },
            {
              '@type': 'Service',
              name: `${phonePhrase(locale)} — ${advisor.name}`,
              url: pageUrl,
              provider: { '@id': orgId },
              serviceType: phonePhrase(locale),
              offers: {
                '@type': 'Offer',
                url: pageUrl,
                priceCurrency: currency.toUpperCase(),
                price: priceMajor,
                ...(advisor.availability.hasImmediate || advisor.availability.nextSlotAt
                  ? { availability: 'https://schema.org/InStock' }
                  : {}),
                description: `${quote.introLabel} / ${quote.perMinLabel}`,
              },
              ...(rating ? { aggregateRating: rating } : {}),
            },
            {
              '@type': 'FAQPage',
              mainEntity: faqs.map((item) => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: { '@type': 'Answer', text: item.answer },
              })),
            },
          ],
        }} />
      )}
    </main>
  );
}
