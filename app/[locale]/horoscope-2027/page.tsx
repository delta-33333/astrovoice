import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Chrome, Disclaimer, SignChips, SkyTable, TrialCta } from '@/components/Horoscope2027View';
import { H2027_BASE, H2027_ORIGIN, h2027JsonLd } from '@/lib/horoscope-2027';

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: 'fr' }];
}

const TITLE = 'Horoscope 2027 : amour, travail, argent mois par mois | Callastral';
const H1 = 'Horoscope 2027 : les grandes dates de l’année, signe par signe';
const DESCRIPTION = 'Horoscope 2027 pour les 12 signes : Jupiter en Vierge le 26 juillet, éclipse totale du 2 août, Saturne et Neptune en Bélier, rétrogrades. Dates calculées.';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  if (locale !== 'fr') return {};
  const url = `${H2027_ORIGIN}${H2027_BASE}`;
  return {
    title: { absolute: TITLE },
    description: DESCRIPTION,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title: TITLE, description: DESCRIPTION, url, type: 'article', locale: 'fr_FR' },
  };
}

const VIRAGES: { h3: string; text: string }[] = [
  { h3: '1. Saturne et Neptune ensemble en Bélier', text: 'Les deux planètes passent toute l’année 2027 dans le premier signe du zodiaque. Neptune rétrograde du 10 juillet au 15 décembre, Saturne du 9 août au 24 décembre. Lecture symbolique : un nouveau cycle qui demande de donner une forme concrète à des idéaux.' },
  { h3: '2. Jupiter quitte le Lion pour la Vierge le 26 juillet', text: 'Après avoir repris sa marche directe le 13 avril à 17° Lion, Jupiter entre en Vierge le 26 juillet 2027. La planète de l’expansion passe d’un registre d’expression à un registre de méthode et d’utilité.' },
  { h3: '3. Deux éclipses solaires sur l’axe Lion-Verseau', text: 'Une éclipse annulaire le 6 février à 17° Verseau, puis une éclipse totale le 2 août à 9° Lion. Trois éclipses lunaires pénombrales complètent la série : 21 février (Vierge), 18 juillet (Capricorne) et 17 août (Verseau).' },
  { h3: '4. Mars rétrograde en début d’année', text: 'Mars rétrograde du 10 janvier (10° Vierge) au 1er avril (21° Lion). Un premier trimestre plus propice à la reprise de dossiers qu’aux lancements.' },
  { h3: '5. Trois rétrogradations de Mercure, aucune de Vénus', text: 'Mercure rétrograde du 9 février au 3 mars, du 10 juin au 4 juillet et du 7 au 28 octobre. Vénus, elle, ne rétrograde pas en 2027. Uranus reste en Gémeaux et Pluton en Verseau toute l’année.' },
];

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  if (locale !== 'fr') notFound();
  return (
    <Chrome jsonLd={h2027JsonLd({ path: H2027_BASE, h1: H1, description: DESCRIPTION })}>
      <nav aria-label="Fil d’Ariane" className="text-xs text-white/60">
        <Link href="/fr" className="underline">Accueil</Link> › Horoscope 2027
      </nav>
      <h1 className="mt-3 font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl text-glow">{H1}</h1>
      <p className="mt-4 text-white/80 leading-relaxed">
        Quelles seront les grandes tendances astrologiques de 2027 ? Plutôt que des prédictions vagues, nous sommes partis des positions réelles des planètes, calculées à partir des éphémérides astronomiques, pour établir le calendrier de l’année : changements de signe, rétrogradations et éclipses. Chaque horoscope par signe interprète ensuite ces dates selon votre signe solaire, en amour, au travail et pour l’argent.
      </p>
      <Disclaimer />
      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-cinzel)] text-2xl">Choisissez votre signe</h2>
        <SignChips />
      </section>
      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-cinzel)] text-2xl">Les 5 grands virages astrologiques de 2027</h2>
        {VIRAGES.map((item) => (
          <div key={item.h3} className="mt-6">
            <h3 className="text-xl text-white/90">{item.h3}</h3>
            <p className="mt-2 text-white/80 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </section>
      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-cinzel)] text-2xl">Calendrier astrologique 2027</h2>
        <SkyTable />
        <p className="mt-4 text-xs text-white/60">Méthode : longitudes géocentriques tropicales apparentes, éphéméride JPL DE440, dates converties à l’heure de Paris. Un horoscope solaire reste général ; un thème natal complet utilise aussi l’heure et le lieu de naissance (<Link href="/fr/calcul-ascendant-gratuit" className="underline">calculer son ascendant</Link>).</p>
      </section>
      <TrialCta />
    </Chrome>
  );
}
