import { cache } from 'react';
import Link from 'next/link';
import { listPublicAdvisors } from '@/lib/astrologers';
import { advisorIndexPath, advisorPath, localeHomePath, type Locale } from '@/lib/seo';

/*
 * Liens de marque répétés sur les pages publiques (en-tête + pied de page) : accueil, conseillers,
 * tarifs, connexion et trois fiches phares. Une structure de liens stable aide Google à proposer des
 * liens annexes (sitelinks) sur la requête « callastral ».
 */

const LABELS: Record<Locale, { home: string; advisors: string; prices: string; login: string; featured: string }> = {
  fr: { home: 'Accueil', advisors: 'Astrologues', prices: 'Tarifs', login: 'Connexion', featured: 'Astrologues à découvrir' },
  en: { home: 'Home', advisors: 'Astrologers', prices: 'Prices', login: 'Log in', featured: 'Featured astrologers' },
  es: { home: 'Inicio', advisors: 'Astrólogos', prices: 'Tarifas', login: 'Iniciar sesión', featured: 'Astrólogos destacados' },
  de: { home: 'Startseite', advisors: 'Astrologen', prices: 'Preise', login: 'Anmelden', featured: 'Ausgewählte Astrologen' },
  it: { home: 'Home', advisors: 'Astrologi', prices: 'Tariffe', login: 'Accedi', featured: 'Astrologi in evidenza' },
};

/** Trois conseillers mis en avant parlant la langue (ordre stable : vedettes, puis nom). */
export const flagshipAdvisors = cache(async (locale: Locale) => {
  try {
    const { advisors } = await listPublicAdvisors();
    const speaking = advisors.filter((advisor) => advisor.languages.includes(locale));
    const featured = speaking.filter((advisor) => advisor.featured);
    return (featured.length >= 3 ? featured : speaking).slice(0, 3).map((advisor) => ({
      name: advisor.name,
      href: advisorPath(locale, advisor.slug),
    }));
  } catch {
    return [];
  }
});

export function brandNavLinks(locale: Locale) {
  const label = LABELS[locale];
  return [
    { href: localeHomePath(locale), label: label.home },
    { href: advisorIndexPath(locale), label: label.advisors },
    { href: '/offres', label: label.prices },
    { href: '/auth', label: label.login },
  ];
}

export function BrandNav({ locale, className = '' }: { locale: Locale; className?: string }) {
  return (
    <nav aria-label="Callastral" className={`flex flex-wrap gap-x-4 gap-y-1 text-sm ${className}`}>
      {brandNavLinks(locale).map((link) => (
        <Link key={link.href} href={link.href} className="text-white/75 hover:text-celestial-gold">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export async function BrandFooter({ locale }: { locale: Locale }) {
  const featured = await flagshipAdvisors(locale);
  const label = LABELS[locale];
  return (
    <footer className="max-w-3xl mx-auto px-4 py-8 mt-8 border-t border-white/10 text-sm text-white/60 space-y-3">
      <p className="font-[family-name:var(--font-cinzel)] text-white/80">Callastral</p>
      <BrandNav locale={locale} />
      {featured.length > 0 && (
        <p className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="text-white/40">{label.featured} :</span>
          {featured.map((advisor) => (
            <Link key={advisor.href} href={advisor.href} className="hover:text-celestial-gold">
              {advisor.name}
            </Link>
          ))}
        </p>
      )}
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/45">
        <Link href="/faq" className="hover:text-white/70">FAQ</Link>
        <Link href="/cgu" className="hover:text-white/70">CGU</Link>
        <Link href="/terms" className="hover:text-white/70">CGV</Link>
        <Link href="/privacy" className="hover:text-white/70">Confidentialité</Link>
      </p>
    </footer>
  );
}
