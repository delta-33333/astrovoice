import Link from 'next/link';
import CallastralLockup from '@/components/CallastralLockup';
import { LOCALES, localeHomePath, type Locale } from '@/lib/seo';

const NAMES: Record<Locale, string> = {
  fr: 'FR',
  en: 'EN',
  es: 'ES',
  de: 'DE',
  it: 'IT',
};

export default function SeoChrome({
  locale,
  alternatePath,
}: {
  locale: Locale;
  alternatePath: (locale: Locale) => string;
}) {
  return (
    <header className="border-b border-white/10">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link href={localeHomePath(locale)} className="inline-flex items-center min-w-0">
          <CallastralLockup className="h-7 w-auto sm:h-8" />
        </Link>
        <nav aria-label="Langues" className="flex gap-2 text-xs text-white/70">
          {LOCALES.map((item) => (
            <Link
              key={item}
              href={alternatePath(item)}
              hrefLang={item}
              className={item === locale ? 'text-celestial-gold' : 'hover:text-white'}
            >
              {NAMES[item]}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
