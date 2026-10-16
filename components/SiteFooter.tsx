import Link from 'next/link';
import { CookieSettingsButton } from '@/components/Consent';
import { footerLinks } from '@/lib/internal-links';
import type { Locale } from '@/lib/seo';

const COOKIES: Record<Locale, string> = {
  fr: 'Cookies',
  en: 'Cookies',
  es: 'Cookies',
  de: 'Cookies',
  it: 'Cookie',
};

export default function SiteFooter({ locale }: { locale: Locale }) {
  const year = new Date().getFullYear();
  return (
    <footer className="max-w-3xl mx-auto px-4 py-8 mt-12 border-t border-white/10 text-sm text-white/80">
      <nav aria-label={locale === 'fr' ? 'Pied de page' : 'Footer'} className="flex flex-wrap gap-x-4 gap-y-2">
        {footerLinks(locale).map((link) => (
          <Link key={`${link.href}-${link.label}`} href={link.href} className="underline hover:text-white">{link.label}</Link>
        ))}
        <CookieSettingsButton label={COOKIES[locale]} />
      </nav>
      <p className="mt-3 text-xs text-white/80">© {year} Callastral</p>
    </footer>
  );
}
