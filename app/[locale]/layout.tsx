import { notFound } from 'next/navigation';
import SiteFooter from '@/components/SiteFooter';
import { isLocale } from '@/lib/seo';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <div lang={locale}>
      {children}
      <SiteFooter locale={locale} />
    </div>
  );
}
