import Link from 'next/link';
import { CookieSettingsButton } from '@/components/Consent';
import { ascendantPath } from '@/lib/ascendant-tool';
import { getCopy } from '@/lib/ascendant-copy';
import { HUB_PATHS } from '@/lib/alternatives';
import { GEO_PATHS } from '@/lib/geo-pages';
import { privacyPath } from '@/lib/privacy-copy';
import { localeHomePath, type Locale } from '@/lib/seo';
import { VIDEOS_PATH } from '@/lib/videos';

const LABEL: Record<Locale, {
  nav: string;
  terms: string;
  sales: string;
  privacy: string;
  videos: string;
  cookies: string;
  about: string;
  prices: string;
  compare: string;
  alternatives: string;
}> = {
  fr: {
    nav: 'Pied de page',
    terms: 'CGU',
    sales: 'Conditions générales',
    privacy: 'Confidentialité',
    videos: 'Vidéos',
    cookies: 'Cookies',
    about: 'À propos',
    prices: 'Tarifs 2026',
    compare: 'Comparatif 2026',
    alternatives: 'Alternatives',
  },
  en: {
    nav: 'Footer',
    terms: 'Terms of use',
    sales: 'Terms of sale',
    privacy: 'Privacy',
    videos: 'Videos (French)',
    cookies: 'Cookies',
    about: 'About',
    prices: 'Prices 2026',
    compare: 'Comparison 2026',
    alternatives: 'Alternatives',
  },
  es: {
    nav: 'Pie de página',
    terms: 'Condiciones de uso',
    sales: 'Condiciones de venta',
    privacy: 'Privacidad',
    videos: 'Vídeos (francés)',
    cookies: 'Cookies',
    about: 'Acerca de',
    prices: 'Tarifas',
    compare: 'Comparativa',
    alternatives: 'Alternativas',
  },
  de: {
    nav: 'Fußzeile',
    terms: 'Nutzungsbedingungen',
    sales: 'Verkaufsbedingungen',
    privacy: 'Datenschutz',
    videos: 'Videos (Französisch)',
    cookies: 'Cookies',
    about: 'Über uns',
    prices: 'Preise',
    compare: 'Vergleich',
    alternatives: 'Alternativen',
  },
  it: {
    nav: 'Piè di pagina',
    terms: 'Condizioni d’uso',
    sales: 'Condizioni di vendita',
    privacy: 'Privacy',
    videos: 'Video (francese)',
    cookies: 'Cookie',
    about: 'Chi siamo',
    prices: 'Tariffe',
    compare: 'Confronto',
    alternatives: 'Alternative',
  },
};

export default function SiteFooter({ locale }: { locale: Locale }) {
  const copy = LABEL[locale];
  const year = new Date().getFullYear();
  return (
    <footer className="max-w-3xl mx-auto px-4 py-8 mt-12 border-t border-white/10 text-sm text-white/80">
      <nav aria-label={copy.nav} className="flex flex-wrap gap-x-4 gap-y-2">
        <Link href={localeHomePath(locale)} className="underline hover:text-white">{locale === 'fr' ? 'Accueil' : 'Home'}</Link>
        <Link href="/cgu" className="underline hover:text-white">{copy.terms}</Link>
        <Link href="/terms" className="underline hover:text-white">{copy.sales}</Link>
        <Link href={privacyPath(locale)} className="underline hover:text-white">{copy.privacy}</Link>
        <Link href={ascendantPath(locale)} className="underline hover:text-white">{getCopy(locale).h1}</Link>
        <Link href="/faq" className="underline hover:text-white">FAQ</Link>
        <Link href={VIDEOS_PATH} className="underline hover:text-white">{copy.videos}</Link>
        {(locale === 'fr' || locale === 'en') && (
          <>
            <Link href={GEO_PATHS.about[locale]} className="underline hover:text-white">{copy.about}</Link>
            <Link href={GEO_PATHS.prices[locale]} className="underline hover:text-white">{copy.prices}</Link>
            <Link href={GEO_PATHS.compare[locale]} className="underline hover:text-white">{copy.compare}</Link>
            <Link href={HUB_PATHS[locale]} className="underline hover:text-white">{copy.alternatives}</Link>
          </>
        )}
        <CookieSettingsButton label={copy.cookies} />
      </nav>
      <p className="mt-3 text-xs text-white/80">© {year} Callastral</p>
    </footer>
  );
}
