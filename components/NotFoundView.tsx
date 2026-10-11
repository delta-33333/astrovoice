import Link from 'next/link';
import { headers } from 'next/headers';
import { ascendantPath } from '@/lib/ascendant-tool';
import { privacyPath } from '@/lib/privacy-copy';
import { isLocale, localeHomePath, type Locale } from '@/lib/seo';

const COPY: Record<Locale, { title: string; body: string; home: string; advisors: string; tool: string }> = {
  fr: {
    title: 'Page introuvable',
    body: 'Cette adresse ne correspond à aucune page Callastral.',
    home: 'Accueil',
    advisors: 'Conseillers',
    tool: 'Calcul d’ascendant gratuit',
  },
  en: {
    title: 'Page not found',
    body: 'This address does not match a Callastral page.',
    home: 'Home',
    advisors: 'Advisors',
    tool: 'Free rising sign calculator',
  },
  es: {
    title: 'Página no encontrada',
    body: 'Esta dirección no corresponde a ninguna página de Callastral.',
    home: 'Inicio',
    advisors: 'Consejeros',
    tool: 'Calcular ascendente gratis',
  },
  de: {
    title: 'Seite nicht gefunden',
    body: 'Diese Adresse entspricht keiner Callastral-Seite.',
    home: 'Start',
    advisors: 'Berater',
    tool: 'Aszendent kostenlos berechnen',
  },
  it: {
    title: 'Pagina non trovata',
    body: 'Questo indirizzo non corrisponde a una pagina Callastral.',
    home: 'Home',
    advisors: 'Consulenti',
    tool: 'Calcolo ascendente gratis',
  },
};

export default async function NotFoundView() {
  const headerLocale = (await headers()).get('x-locale');
  const locale: Locale = headerLocale && isLocale(headerLocale) ? headerLocale : 'fr';
  const copy = COPY[locale];
  return (
    <main className="min-h-[70vh] px-4 py-16">
      <div className="max-w-xl mx-auto space-y-6">
        <p className="text-sm text-white/80">404</p>
        <h1 className="font-[family-name:var(--font-cinzel)] text-4xl">{copy.title}</h1>
        <p className="text-white/80 leading-relaxed">{copy.body}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href={localeHomePath(locale)} className="btn-primary text-center">{copy.home}</Link>
          <Link href={locale === 'fr' ? '/#annuaire' : localeHomePath(locale)} className="underline self-center text-white">
            {copy.advisors}
          </Link>
          <Link href={ascendantPath(locale)} className="underline self-center text-white">
            {copy.tool}
          </Link>
        </div>
        <p className="text-sm text-white/80 space-x-3">
          <Link href="/cgu" className="underline">CGU</Link>
          <Link href={privacyPath(locale)} className="underline">{locale === 'fr' ? 'Confidentialité' : 'Privacy'}</Link>
        </p>
      </div>
    </main>
  );
}
