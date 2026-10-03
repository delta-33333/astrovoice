import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import SeoChrome from '@/components/SeoChrome';
import { bookPath } from '@/lib/book-path';
import { readRates } from '@/lib/market';
import { quoteAdvisor } from '@/lib/money';
import { appBaseUrl } from '@/lib/stripe';
import { getAdvisorProfile, listDirectoryAdvisors } from '@/lib/slots';
import {
  advisorFaqs,
  advisorPath,
  availabilitySentence,
  homeLabel,
  hreflangAlternates,
  hubPath,
  isLocale,
  languageLabel,
  localeCurrency,
  localeHomePath,
  phonePhrase,
  professionSlug,
  professionTitle,
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
  const quote = quoteAdvisor(advisor.pricePerMinCents, currency, readRates());
  const topic = specialtyLabel(locale, advisor.specialties[0] || 'amour');
  const title = `${advisor.name} — ${topic} — ${phonePhrase(locale)} dès ${quote.introLabel}`;
  const description = `${advisor.name} : ${phonePhrase(locale)} sur ${advisor.specialties.map((item) => specialtyLabel(locale, item)).join(', ')}. ${styleLabel(locale, advisor.readingStyle)}. Dès ${quote.introLabel}.`.slice(0, 160);
  const path = advisorPath(locale, advisor.slug);
  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: hreflangAlternates((item) => advisorPath(item, advisor.slug)),
    },
    openGraph: { title, description, url: path, type: 'profile' },
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
  const rates = readRates();
  const quote = quoteAdvisor(advisor.pricePerMinCents, currency, rates);
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
  });
  const origin = appBaseUrl();
  const pageUrl = `${origin}${advisorPath(locale, advisor.slug)}`;
  const bookHref = advisor.availability.immediateSlotId && advisor.availability.immediateStartsAt
    ? bookPath(advisor.availability.immediateSlotId, advisor.availability.immediateStartsAt, advisor.id)
    : `/advisors/${advisor.slug}`;

  let related: { slug: string; name: string }[] = [];
  try {
    const directory = await listDirectoryAdvisors();
    related = directory.advisors
      .filter((item) => item.id !== advisor.id && item.specialties.includes(primary))
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

  const showRating = advisor.averageRating != null && advisor.reviewCount >= 5;
  const priceMajor = currency === 'jpy' ? quote.introMinor : (quote.introMinor / 100).toFixed(2);
  const personId = `${pageUrl}#person`;

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
        <p className="mt-4 text-lg text-white/85 leading-relaxed">{intro[locale]}</p>
        <p className="mt-3 text-celestial-gold">{quote.introLabel} · {quote.perMinLabel}</p>
        <Link href={bookHref} className="btn-primary inline-block mt-6">{cta[locale]}</Link>

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
              <dd>{advisor.averageRating} · {advisor.reviewCount}</dd>
            </div>
          )}
        </dl>

        {advisor.bio && <p className="mt-6 text-white/75 leading-relaxed">{advisor.bio}</p>}

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
            '@type': 'Person',
            '@id': personId,
            name: advisor.name,
            url: pageUrl,
            jobTitle: professionTitle(locale),
            knowsLanguage: advisor.languages,
            description: advisor.bio?.slice(0, 300) || intro[locale],
          },
          {
            '@type': 'Service',
            name: `${phonePhrase(locale)} — ${advisor.name}`,
            url: pageUrl,
            provider: { '@id': personId },
            serviceType: phonePhrase(locale),
            ...(showRating
              ? {
                  aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: advisor.averageRating,
                    reviewCount: advisor.reviewCount,
                    bestRating: 5,
                    worstRating: 1,
                  },
                }
              : {}),
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
    </main>
  );
}
