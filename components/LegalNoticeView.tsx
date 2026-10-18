import type { Metadata } from 'next';
import Link from 'next/link';
import SeoChrome from '@/components/SeoChrome';
import { legalIdentityLines, readLegalIdentity } from '@/lib/legal-entity';
import { legalNoticeAlternates, legalNoticeCopy, legalNoticePath } from '@/lib/legal-notice';
import type { Locale } from '@/lib/seo';

export function legalNoticeMetadata(locale: Locale): Metadata {
  const copy = legalNoticeCopy(locale);
  const path = legalNoticePath(locale);
  return {
    title: `${copy.title} | Callastral`,
    description: copy.description,
    alternates: { canonical: path, languages: legalNoticeAlternates() },
  };
}

export default function LegalNoticeView({ locale }: { locale: Locale }) {
  const copy = legalNoticeCopy(locale);
  const legal = readLegalIdentity(locale);
  const lines = legalIdentityLines(legal);
  return (
    <main>
      <SeoChrome locale={locale} alternatePath={legalNoticePath} />
      <article className="max-w-3xl mx-auto px-4 py-10 text-white/85 leading-relaxed">
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl text-white">{copy.h1}</h1>
        {lines.length > 0 && (
          <section className="mt-6" id="contact">
            <h2 className="text-lg text-white">{copy.publisher}</h2>
            {lines.map((line) => <p key={line} className="mt-1">{line}</p>)}
          </section>
        )}
        {!legal.directorMissing && (
          <section className="mt-6">
            <h2 className="text-lg text-white">{copy.director}</h2>
            <p className="mt-1">{legal.director}</p>
          </section>
        )}
        {!legal.emailMissing && (
          <p className="mt-4" id="contact-email">
            {copy.contact} : <a className="text-celestial-gold underline" href={`mailto:${legal.email}`}>{legal.email}</a>
          </p>
        )}
        <section className="mt-6">
          <h2 className="text-lg text-white">{copy.hostTitle}</h2>
          <p className="mt-1">{copy.host}</p>
        </section>
        <section className="mt-6">
          <h2 className="text-lg text-white">{copy.aiTitle}</h2>
          <p className="mt-1">{copy.disclosure}</p>
          <p className="mt-2">{copy.aiLine}</p>
        </section>
        <p className="mt-8 text-sm">
          <Link href={locale === 'fr' ? '/fr' : `/${locale}`} className="text-celestial-gold underline">Callastral</Link>
        </p>
      </article>
    </main>
  );
}
