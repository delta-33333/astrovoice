import Link from 'next/link';
import { existsSync } from 'fs';
import path from 'path';
import { LOCALES, localeHomePath, type Locale } from '@/lib/seo';

const NAMES: Record<Locale, string> = {
  fr: 'FR',
  en: 'EN',
  es: 'ES',
  de: 'DE',
  it: 'IT',
};

function logoFileExists(): boolean {
  return existsSync(path.join(process.cwd(), 'public', 'logo.png'));
}

export default function SeoChrome({
  locale,
  alternatePath,
}: {
  locale: Locale;
  alternatePath: (locale: Locale) => string;
}) {
  const logo = logoFileExists();
  return (
    <header className="border-b border-white/10">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link href={localeHomePath(locale)} className="inline-flex items-center min-h-8">
          {logo ? (
            // Le fichier est déposé dans /public/logo.png par le propriétaire.
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/logo.png" alt="Callastral" width={148} height={32} className="h-8 w-auto" />
          ) : (
            <span className="font-[family-name:var(--font-cinzel)] text-xl font-semibold">Callastral</span>
          )}
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
