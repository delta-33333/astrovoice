import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import SeoChrome from '@/components/SeoChrome';
import {
  AVIS_CAUTIONS,
  AVIS_DESCRIPTION,
  AVIS_EDITORIAL,
  AVIS_FAQS,
  AVIS_KEYWORDS,
  AVIS_PATH,
  AVIS_STRENGTHS,
  AVIS_TITLE,
  avisJsonLd,
} from '@/lib/avis-callastral';
import { ascendantPath } from '@/lib/ascendant-tool';
import { ctaLinks } from '@/lib/zodiac/articles';
import { appBaseUrl } from '@/lib/stripe';

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: 'fr' }];
}

export const metadata: Metadata = {
  title: AVIS_TITLE,
  description: AVIS_DESCRIPTION,
  keywords: [...AVIS_KEYWORDS],
  alternates: { canonical: AVIS_PATH, languages: { fr: AVIS_PATH, 'x-default': AVIS_PATH } },
  openGraph: { title: AVIS_TITLE, description: AVIS_DESCRIPTION, url: AVIS_PATH, type: 'website' },
};

export default async function AvisCallastralPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  if (locale !== 'fr') notFound();
  const origin = appBaseUrl();
  const ctas = ctaLinks('fr');
  return (
    <main>
      <SeoChrome locale="fr" alternatePath={(item) => (item === 'fr' ? AVIS_PATH : `/${item}`)} />
      <article className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-sm text-white/50">{AVIS_EDITORIAL}</p>
        <h1 className="mt-3 font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl text-glow">{AVIS_TITLE}</h1>

        <section className="mt-8">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl">Ce que fait Callastral</h2>
          <p className="mt-4 text-white/80 leading-relaxed">
            Callastral propose deux choses distinctes. Un calcul d’ascendant gratuit, et des consultations par téléphone avec des conseillers virtuels. Cette page est une présentation factuelle du service, pas un recueil d’avis de clients.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl">Calcul d’ascendant gratuit</h2>
          <p className="mt-4 text-white/80 leading-relaxed">
            Le calcul fonctionne sans inscription. Il demande la date, l’heure exacte et le lieu de naissance. Les fuseaux historiques sont pris en compte, y compris l’heure d’été de l’époque et, quand le décalage n’était pas un fuseau standard, le temps moyen local. Le zodiaque utilisé est le zodiaque tropical. Les données saisies pour ce calcul ne sont pas conservées.
          </p>
          <p className="mt-4 text-white/80 leading-relaxed">
            <Link href={ascendantPath('fr')} className="underline text-celestial-gold">Ouvrir le calcul d’ascendant gratuit</Link>
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl">Consultations par téléphone</h2>
          <p className="mt-4 text-white/80 leading-relaxed">
            Les consultations par téléphone se font avec des conseillers virtuels, des personas d’intelligence artificielle. Esther Owens en est un exemple. Les sujets couverts sont l’amour, le travail, les finances, la famille et le développement personnel. Le tarif à la minute est affiché avant le paiement. On peut aussi choisir une formule hebdomadaire. Le service est un divertissement.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl">Atouts et points d’attention</h2>
          <table className="mt-4 w-full text-sm border-collapse">
            <caption className="sr-only">Atouts et points d’attention de Callastral</caption>
            <thead>
              <tr className="text-left text-white/60">
                <th className="border-b border-white/15 py-2 pr-4 font-medium">Atouts</th>
                <th className="border-b border-white/15 py-2 font-medium">Points d’attention</th>
              </tr>
            </thead>
            <tbody>
              {AVIS_STRENGTHS.map((strength, index) => (
                <tr key={strength}>
                  <td className="border-b border-white/10 py-3 pr-4 text-white/85 align-top">{strength}</td>
                  <td className="border-b border-white/10 py-3 text-white/85 align-top">{AVIS_CAUTIONS[index]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl">Questions fréquentes</h2>
          {AVIS_FAQS.map((item) => (
            <details key={item.question} className="rounded-xl border border-white/10 p-4" open>
              <summary className="font-semibold cursor-pointer">{item.question}</summary>
              <p className="mt-2 text-sm text-white/75 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </section>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link href={ctas.calc.href} className="btn-primary text-center">{ctas.calc.label}</Link>
          <Link href={ctas.book.href} data-funnel="book" className="btn-secondary text-center">{ctas.book.label}</Link>
        </div>
      </article>
      <JsonLd data={avisJsonLd(origin)} />
    </main>
  );
}
