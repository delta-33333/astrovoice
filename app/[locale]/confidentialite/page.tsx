import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SeoChrome from '@/components/SeoChrome';
import { readLegalIdentity } from '@/lib/legal-entity';
import { privacyDocument, privacyPath } from '@/lib/privacy-copy';
import { hreflangAlternates, isLocale, type Locale } from '@/lib/seo';

export async function generateMetadata(
  props: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await props.params;
  if (!isLocale(locale)) return {};
  const doc = privacyDocument(locale, readLegalIdentity(locale));
  const path = privacyPath(locale);
  return {
    title: `${doc.title} | Callastral`,
    description: doc.description,
    alternates: {
      canonical: path,
      languages: hreflangAlternates(privacyPath),
    },
    openGraph: { title: doc.title, description: doc.description, url: path },
  };
}

export default async function PrivacyLocalePage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  if (!isLocale(locale)) notFound();
  const doc = privacyDocument(locale as Locale, readLegalIdentity(locale));
  return (
    <main>
      <SeoChrome locale={locale} alternatePath={privacyPath} />
      <article className="max-w-2xl mx-auto px-4 py-10 space-y-8 text-white/80 leading-relaxed">
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl text-white">{doc.title}</h1>
        {doc.sections.map((section) => (
          <section key={section.heading} className="space-y-3">
            <h2 className="text-white text-lg font-semibold">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </section>
        ))}
      </article>
    </main>
  );
}
