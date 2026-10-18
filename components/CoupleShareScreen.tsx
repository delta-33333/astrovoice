import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CoupleShareButton from '@/components/CoupleShareButton';
import { COUPLE_CTA, couplePath, coupleShareBookPath, coupleSharePath } from '@/lib/couple-compat';
import { trialPath } from '@/lib/free-call';
import { loadCoupleResult } from '@/lib/couple-store';
import { aiActLine } from '@/lib/legal';
import { isLocale } from '@/lib/seo';

export async function coupleShareMetadata(props: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await props.params;
  if (!isLocale(locale)) return {};
  const result = await loadCoupleResult(id);
  const path = coupleSharePath(locale, id);
  const title = result ? `${result.initialA} · ${result.initialB} — ${result.score}` : 'Callastral';
  return {
    title,
    description: title,
    robots: { index: false, follow: false },
    alternates: { canonical: path },
    openGraph: { title, description: title, url: path, type: 'website' },
  };
}

export default async function CoupleShareScreen(props: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await props.params;
  if (!isLocale(locale)) notFound();
  const result = await loadCoupleResult(id);
  if (!result || result.locale !== locale) notFound();
  const names = [result.labelA, result.labelB].filter(Boolean).join(' · ');
  return (
    <main className="max-w-xl mx-auto px-4 py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-celestial-gold">Callastral</p>
      <h1 className="mt-3 font-[family-name:var(--font-cinzel)] text-4xl">
        {result.initialA} · {result.initialB}
      </h1>
      {names && <p className="mt-2 text-white/60">{names}</p>}
      <p className="mt-6 font-[family-name:var(--font-cinzel)] text-6xl text-celestial-gold">{result.score}</p>
      <ul className="mt-6 space-y-2 text-sm text-white/80">
        {result.strengths.map((item) => <li key={item}>{item}</li>)}
        {result.tensions.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <p className="mt-6 text-sm text-white/60">{aiActLine(locale)}</p>
      <Link href={coupleShareBookPath()} data-funnel="book" className="btn-primary mt-6 inline-block text-center">
        {COUPLE_CTA[locale]}
      </Link>
      <p className="mt-4 flex flex-col gap-2">
        <Link href={couplePath(locale)} className="text-sm text-celestial-gold underline">
          {locale === 'en' ? 'Calculate yours' : 'Calculer la vôtre'}
        </Link>
        <Link href={`${trialPath(locale)}?topic=couple`} className="text-sm text-celestial-gold underline">
          {locale === 'en' ? 'Talk 3 minutes free about your couple' : 'Parler 3 min gratuitement de votre couple'}
        </Link>
      </p>
      <CoupleShareButton
        url={coupleSharePath(locale, id)}
        title={`${result.initialA} · ${result.initialB}`}
        text={`Notre compatibilité astro : ${result.score}/100 (calcul Callastral)`}
        label={locale === 'en' ? 'Share' : 'Partager'}
      />
    </main>
  );
}
