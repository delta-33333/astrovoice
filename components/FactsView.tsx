import type { Metadata } from 'next';
import Link from 'next/link';
import SeoChrome from '@/components/SeoChrome';
import { aboutPath } from '@/lib/about';
import { factRows, factsAlternates, factsPath, FACTS_UPDATED } from '@/lib/facts';
import { listDirectoryAdvisors } from '@/lib/slots';
import type { Locale } from '@/lib/seo';

const TITLE: Record<Locale, string> = {
  fr: 'Callastral : faits et chiffres',
  en: 'Callastral facts and figures',
  es: 'Callastral: datos y cifras',
  de: 'Callastral: Fakten und Zahlen',
  it: 'Callastral: fatti e cifre',
};

export function factsMetadata(locale: Locale): Metadata {
  const path = factsPath(locale);
  return {
    title: `${TITLE[locale]} | Callastral`,
    description: TITLE[locale],
    alternates: { canonical: path, languages: factsAlternates() },
  };
}

export default async function FactsView({ locale }: { locale: Locale }) {
  let count: number | null = null;
  try {
    const listed = await listDirectoryAdvisors();
    count = listed.unavailable ? null : listed.advisors.length;
  } catch {
    count = null;
  }
  const rows = factRows(locale, count);
  return (
    <main>
      <SeoChrome locale={locale} alternatePath={factsPath} />
      <article className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl">{TITLE[locale]}</h1>
        <p className="mt-2 text-sm text-white/50">{FACTS_UPDATED}</p>
        <dl className="mt-6 space-y-4">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="text-sm text-white/50">{row.label}</dt>
              <dd className="text-white/85">{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-sm">
          <Link href={aboutPath(locale)} className="text-celestial-gold underline">{aboutPath(locale)}</Link>
        </p>
      </article>
    </main>
  );
}
