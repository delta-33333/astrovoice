import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import HoroscopeSignup from '@/components/HoroscopeSignup';
import JsonLd from '@/components/JsonLd';
import SeoChrome from '@/components/SeoChrome';
import {
  articleJsonLd,
  compatArticleModel,
  ctaLinks,
  risingArticleModel,
  signArticleModel,
  type ArticleModel,
} from '@/lib/zodiac/articles';
import { horoscopeModel, type HoroscopeModel } from '@/lib/weekly-sky';
import { horoscopeLeadParts, horoscopeSectionParts, type InlinePart } from '@/lib/internal-links';
import { isLocale, type Locale } from '@/lib/seo';
import { isThinPath, publishedAlternates } from '@/lib/thin-content';
import { appBaseUrl } from '@/lib/stripe';
import {
  SIGN_IDS,
  SIGNS,
  compatSlug,
  pairBySlug,
  pairList,
  signBySlug,
  type SignId,
} from '@/lib/zodiac/signs';

export type OrganicKind = 'sign' | 'rising' | 'compat';

export function organicStaticParams(kind: OrganicKind, locales: readonly Locale[]) {
  if (kind === 'compat') {
    return locales.flatMap((locale) =>
      pairList().map(([left, right]) => ({ locale, slug: compatSlug(locale, left, right) })),
    );
  }
  return locales.flatMap((locale) =>
    SIGN_IDS.map((id) => ({ locale, slug: SIGNS[id].slugs[locale] })),
  );
}

function modelFor(kind: OrganicKind, locale: Locale, slug: string): ArticleModel | null {
  if (kind === 'compat') {
    const pair = pairBySlug(locale, slug);
    return pair ? compatArticleModel(locale, pair[0], pair[1]) : null;
  }
  const id: SignId | null = signBySlug(locale, slug);
  if (!id) return null;
  return kind === 'sign' ? signArticleModel(locale, id) : risingArticleModel(locale, id);
}

export async function organicMetadata(
  kind: OrganicKind,
  locales: readonly Locale[],
  props: { params: Promise<{ locale: string; slug: string }> },
): Promise<Metadata> {
  const { locale, slug } = await props.params;
  if (!isLocale(locale) || !locales.includes(locale)) return {};
  const model = modelFor(kind, locale, slug);
  if (!model) return {};
  const languages = publishedAlternates(locale, model.path, model.alternates);
  return {
    title: model.title,
    description: model.description,
    keywords: model.keywords,
    alternates: { canonical: model.path, languages },
    robots: isThinPath(model.path) ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: { title: model.title, description: model.description, url: model.path, type: 'website' },
  };
}

export async function OrganicPage(
  kind: OrganicKind,
  locales: readonly Locale[],
  props: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale, slug } = await props.params;
  if (!isLocale(locale) || !locales.includes(locale)) notFound();
  const model = modelFor(kind, locale, slug);
  if (!model) notFound();
  return <ArticleView model={model} />;
}

function InlineParagraph({ parts }: { parts: InlinePart[] }) {
  return (
    <p className="mt-4 text-white/80 leading-relaxed">
      {parts.map((part, index) => part.href ? (
        <Link key={`${part.href}-${index}`} href={part.href} className="text-celestial-gold underline">{part.text}</Link>
      ) : (
        <span key={`${part.text}-${index}`}>{part.text}</span>
      ))}
    </p>
  );
}

function ArticleView({ model }: { model: ArticleModel }) {
  const origin = appBaseUrl();
  const ctas = ctaLinks(model.locale);
  const alternate = (locale: Locale) => model.alternates[locale] ?? `/${locale}`;
  return (
    <main>
      <SeoChrome locale={model.locale} alternatePath={alternate} />
      <article className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl text-glow">{model.h1}</h1>
        {model.sections.map((section) => (
          <section key={section.h2} className="mt-10">
            <h2 className="font-[family-name:var(--font-cinzel)] text-2xl">{section.h2}</h2>
            {section.facts && section.facts.length > 0 && (
              <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {section.facts.map((fact) => (
                  <div key={`${fact.label}-${fact.value}`} className="rounded-xl border border-white/10 px-3 py-2">
                    <dt className="text-xs uppercase tracking-wide text-white/45">{fact.label}</dt>
                    <dd className="text-white/85">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-4 text-white/80 leading-relaxed">{paragraph}</p>
            ))}
            {section.inline?.map((parts, index) => (
              <InlineParagraph key={`${section.h2}-${index}`} parts={parts} />
            ))}
            {section.links && section.links.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm px-3 py-1 rounded-full border border-celestial-gold/40 text-celestial-gold">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
        {model.kind === 'sign' && model.signId && (
          <HoroscopeSignup locale={model.locale} sign={model.signId} placement="sign" />
        )}
        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link href={ctas.calc.href} className="btn-primary text-center">{ctas.calc.label}</Link>
          <Link href={ctas.book.href} data-funnel="book" className="btn-secondary text-center">{ctas.book.label}</Link>
        </div>
      </article>
      <JsonLd data={articleJsonLd(origin, model)} />
    </main>
  );
}

export async function horoscopeMetadata(
  localeAllowed: Locale,
  props: { params: Promise<{ locale: string }> },
): Promise<Metadata> {
  const { locale } = await props.params;
  if (locale !== localeAllowed || !isLocale(locale)) return {};
  const model = horoscopeModel(locale, new Date());
  const languages = publishedAlternates(locale, model.path, model.alternates);
  return {
    title: model.title,
    description: model.description,
    keywords: model.keywords,
    alternates: { canonical: model.path, languages },
    robots: isThinPath(model.path) ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: { title: model.title, description: model.description, url: model.path, type: 'website' },
  };
}

export function HoroscopePage({ model }: { model: HoroscopeModel }) {
  const origin = appBaseUrl();
  const ctas = ctaLinks(model.locale);
  const alternate = (locale: Locale) => model.alternates[locale] ?? `/${locale}`;
  return (
    <main>
      <SeoChrome locale={model.locale} alternatePath={alternate} />
      <article className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl text-glow">{model.h1}</h1>
        <p className="mt-4 text-sm text-celestial-gold">{model.entertainment}</p>
        <section className="mt-8">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl">
            {{ fr: 'Ciel de la semaine', en: 'Sky of the week', es: 'Cielo de la semana', de: 'Himmel der Woche', it: 'Cielo della settimana' }[model.locale]}
          </h2>
          {model.skyParagraphs.map((paragraph) => (
            <p key={paragraph} className="mt-4 text-white/80 leading-relaxed">{paragraph}</p>
          ))}
          <InlineParagraph parts={horoscopeLeadParts(model.locale)} />
        </section>
        {model.sections.map((section) => (
          <section key={section.id} id={section.slug} className="mt-10">
            <h2 className="font-[family-name:var(--font-cinzel)] text-2xl">{section.h2}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-white/80 leading-relaxed">{paragraph}</p>
            ))}
            <InlineParagraph parts={horoscopeSectionParts(model.locale, section.id)} />
          </section>
        ))}
        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl">
            {{ fr: 'Comment ce texte est calculé', en: 'How this text is calculated', es: 'Cómo se calcula este texto', de: 'Wie dieser Text berechnet wird', it: 'Come è calcolato questo testo' }[model.locale]}
          </h2>
          <p className="mt-4 text-white/75 leading-relaxed">{model.method}</p>
        </section>
        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link href={ctas.calc.href} className="btn-primary text-center">{ctas.calc.label}</Link>
          <Link href={ctas.book.href} data-funnel="book" className="btn-secondary text-center">{ctas.book.label}</Link>
        </div>
      </article>
      <JsonLd data={articleJsonLd(origin, model)} />
    </main>
  );
}
