import Link from 'next/link';
import CallastralLockup from '@/components/CallastralLockup';
import { GEO_PATHS, updatedLabel, type GeoLocale, type GeoPage, type Source } from '@/lib/geo-pages';

export function GeoHeader({ locale, page }: { locale: GeoLocale; page: GeoPage }) {
  return (
    <header className="border-b border-white/10">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link href={locale === 'fr' ? '/fr' : '/en'} className="inline-flex items-center min-w-0">
          <CallastralLockup className="h-7 w-auto sm:h-8" />
        </Link>
        <nav aria-label={locale === 'fr' ? 'Langues' : 'Languages'} className="flex gap-2 text-xs text-white/70">
          {(['fr', 'en'] as const).map((item) => (
            <Link
              key={item}
              href={GEO_PATHS[page][item]}
              hrefLang={item}
              className={item === locale ? 'text-celestial-gold' : 'hover:text-white'}
            >
              {item.toUpperCase()}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function Updated({ locale }: { locale: GeoLocale }) {
  return (
    <p className="text-xs text-white/50 mt-2">
      <time dateTime="2026-10-03">{updatedLabel(locale)}</time>
    </p>
  );
}

export function SourceLinks({ sources }: { sources: Source[] }) {
  if (sources.length === 0) return <span className="text-white/50">callastral.com</span>;
  return (
    <span className="space-x-2">
      {sources.map((source) => (
        <a
          key={source.url}
          href={source.url}
          rel="noopener noreferrer nofollow"
          target="_blank"
          className="underline text-celestial-gold/90"
          title={source.label}
        >
          [{source.id}]
        </a>
      ))}
    </span>
  );
}

export function GeoFooter({ locale }: { locale: GeoLocale }) {
  const fr = locale === 'fr';
  return (
    <footer className="max-w-3xl mx-auto px-4 py-8 text-xs text-white/50 border-t border-white/10 mt-12 space-x-4">
      <Link href={GEO_PATHS.prices[locale]} className="hover:text-white">{fr ? 'Tarifs 2026' : 'Prices 2026'}</Link>
      <Link href={GEO_PATHS.compare[locale]} className="hover:text-white">{fr ? 'Comparatif 2026' : 'Comparison 2026'}</Link>
      <Link href={GEO_PATHS.about[locale]} className="hover:text-white">{fr ? 'À propos' : 'About'}</Link>
      <Link href={GEO_PATHS.consultation[locale]} className="hover:text-white">{fr ? 'Consultation astrale' : 'Astrology reading by phone'}</Link>
      <Link href="/terms" className="hover:text-white">{fr ? 'Conditions générales' : 'Terms (FR)'}</Link>
      <Link href="/privacy" className="hover:text-white">{fr ? 'Confidentialité' : 'Privacy (FR)'}</Link>
    </footer>
  );
}
