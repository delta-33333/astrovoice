import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Chrome, Disclaimer, SignChips, SkyTable, TrialCta } from '@/components/Horoscope2027View';
import { H2027_BASE, H2027_ORIGIN, H2027_SIGNS, h2027JsonLd, h2027Model, isH2027Sign } from '@/lib/horoscope-2027';

export const dynamicParams = false;

export function generateStaticParams() {
  return H2027_SIGNS.map((slug) => ({ locale: 'fr', slug }));
}

export async function generateMetadata(props: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await props.params;
  if (locale !== 'fr' || !isH2027Sign(slug)) return {};
  const model = h2027Model(slug);
  const url = `${H2027_ORIGIN}${model.path}`;
  return {
    title: { absolute: model.title },
    description: model.description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title: model.title, description: model.description, url, type: 'article', locale: 'fr_FR' },
  };
}

export default async function Page(props: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await props.params;
  if (locale !== 'fr' || !isH2027Sign(slug)) notFound();
  const model = h2027Model(slug);
  return (
    <Chrome jsonLd={h2027JsonLd({ path: model.path, h1: model.h1, description: model.description, signName: model.name })}>
      <nav aria-label="Fil d’Ariane" className="text-xs text-white/60">
        <Link href="/fr" className="underline">Accueil</Link> › <Link href={H2027_BASE} className="underline">Horoscope 2027</Link> › {model.name}
      </nav>
      <h1 className="mt-3 font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl text-glow">{model.h1}</h1>
      <Disclaimer />
      {model.sections.map((section) => (
        <section key={section.h2} className="mt-10">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl">{section.h2}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-4 text-white/80 leading-relaxed">{paragraph}</p>
          ))}
        </section>
      ))}
      <TrialCta />
      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-cinzel)] text-2xl">Calendrier astrologique 2027</h2>
        <SkyTable />
      </section>
      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-cinzel)] text-2xl">Les autres signes en 2027</h2>
        <SignChips current={model.id} />
        <p className="mt-4"><Link href={H2027_BASE} className="text-celestial-gold underline">Retour à l’horoscope 2027</Link></p>
      </section>
    </Chrome>
  );
}
