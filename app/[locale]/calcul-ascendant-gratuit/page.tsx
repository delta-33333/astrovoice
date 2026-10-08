import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import AscendantCalculator from '@/components/AscendantCalculator';
import CallastralLockup from '@/components/CallastralLockup';
import JsonLd from '@/components/JsonLd';
import {
  ASCENDANT_CTA,
  ASCENDANT_DESCRIPTION,
  ASCENDANT_FAQS,
  ASCENDANT_H1,
  ASCENDANT_PATH,
  ASCENDANT_SIGNS,
  ASCENDANT_TITLE,
  ascendantJsonLd,
  consultChoice,
  signProfile,
  type ConsultCandidate,
} from '@/lib/ascendant-tool';
import { AI_ACT_LINE, AI_ACT_LINE_FEMININE } from '@/lib/legal';
import { advisorPath, hubPath, isLocale, specialtyLabel } from '@/lib/seo';
import { listDirectoryAdvisors } from '@/lib/slots';
import { appBaseUrl } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  props: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await props.params;
  if (locale !== 'fr') {
    return { robots: { index: false, follow: true }, alternates: { canonical: ASCENDANT_PATH } };
  }
  return {
    title: ASCENDANT_TITLE,
    description: ASCENDANT_DESCRIPTION,
    alternates: { canonical: ASCENDANT_PATH },
    robots: { index: true, follow: true },
    openGraph: {
      title: ASCENDANT_TITLE,
      description: ASCENDANT_DESCRIPTION,
      url: ASCENDANT_PATH,
      type: 'website',
      locale: 'fr_FR',
    },
  };
}

export default async function AscendantToolPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  if (!isLocale(locale)) notFound();
  if (locale !== 'fr') permanentRedirect(ASCENDANT_PATH);

  let candidates: ConsultCandidate[] = [];
  let profiles: { slug: string; name: string; gender: 'femme' | 'homme'; specialties: string[] }[] = [];
  try {
    const directory = await listDirectoryAdvisors();
    const french = directory.advisors.filter((advisor) => advisor.languages.includes('fr'));
    candidates = french.map((advisor) => ({
      id: advisor.id,
      slug: advisor.slug,
      gender: advisor.gender,
      languages: advisor.languages,
      immediateSlotId: advisor.availability.immediateSlotId,
      immediateStartsAt: advisor.availability.immediateStartsAt,
    }));
    profiles = [...french.filter((advisor) => advisor.gender === 'femme'), ...french.filter((advisor) => advisor.gender === 'homme')]
      .slice(0, 4)
      .map((advisor) => ({
        slug: advisor.slug,
        name: advisor.name,
        gender: advisor.gender,
        specialties: advisor.specialties.slice(0, 3),
      }));
  } catch {
    candidates = [];
    profiles = [];
  }

  const choice = consultChoice(candidates);
  const cta = choice.gender === 'femme' ? ASCENDANT_CTA : 'Parler à un conseiller IA Callastral';
  const disclosure = choice.gender === 'femme' ? AI_ACT_LINE_FEMININE.fr : AI_ACT_LINE.fr;
  const origin = appBaseUrl();

  return (
    <main>
      <header className="border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <Link href="/fr" className="inline-flex items-center min-w-0">
            <CallastralLockup className="h-7 w-auto sm:h-8" />
          </Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 py-8">
        <nav aria-label="Fil d’Ariane" className="text-sm text-white/50 mb-4">
          <Link href="/fr">Accueil</Link>
          <span> / </span>
          <span>{ASCENDANT_H1}</span>
        </nav>

        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl text-glow">{ASCENDANT_H1}</h1>
        <p className="mt-4 text-white/80 leading-relaxed">
          Le calcul ascendant gratuit utilise la date, l’heure et le lieu de naissance pour trouver le signe qui se levait à l’horizon est. Le résultat est immédiat, sans inscription. C’est une lecture de tradition astrologique, pas une prédiction.
        </p>

        <div className="mt-8">
          <AscendantCalculator />
        </div>

        <section className="mt-6 rounded-3xl border border-celestial-gold/30 bg-celestial-purple/10 p-5 sm:p-6">
          <p className="text-sm text-white/75 leading-relaxed">
            L’ascendant ouvre le thème. Une conseillère IA Callastral peut le relier à votre Soleil et à votre Lune, par téléphone. Le tarif s’affiche avant le paiement.
          </p>
          <Link href={choice.href} data-funnel="book" className="btn-primary mt-4 inline-block w-full text-center">
            {cta}
          </Link>
          <p className="mt-3 text-xs text-white/50">{disclosure}</p>
        </section>

        <section className="mt-12">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl">Comment l’ascendant est calculé</h2>
          <div className="mt-4 space-y-3 text-sm text-white/75 leading-relaxed">
            <p>
              L’heure civile est convertie en temps universel avec le fuseau historique du lieu, heure d’été comprise. Le calcul astronomique, le même Swiss Ephemeris que pour les consultations Callastral, situe ensuite le degré de l’écliptique qui coupait l’horizon est.
            </p>
            <p>
              Le zodiaque utilisé est le zodiaque tropical. Le signe solaire et le signe lunaire sont affichés à côté, pour situer l’ascendant. Ils ne remplacent pas une carte du ciel complète.
            </p>
            <p>
              La précision dépend surtout de l’heure déclarée et de la commune choisie. Quatre minutes environ déplacent l’ascendant d’un degré.
            </p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl">Les douze ascendants</h2>
          <ul className="mt-4 space-y-4">
            {ASCENDANT_SIGNS.map((sign) => {
              const profile = signProfile(sign);
              return (
                <li key={sign}>
                  <h3 className="text-lg text-celestial-gold">
                    Ascendant {profile.sign}
                    <span className="text-sm font-normal text-white/50"> · {profile.element} · {profile.modality}</span>
                  </h3>
                  <p className="mt-1 text-sm text-white/75 leading-relaxed">{profile.reading}</p>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl">Questions fréquentes</h2>
          {ASCENDANT_FAQS.map((item) => (
            <details key={item.question} className="rounded-xl border border-white/10 p-4">
              <summary className="font-semibold cursor-pointer">{item.question}</summary>
              <p className="mt-2 text-sm text-white/75 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl">Conseillères IA Callastral</h2>
          <p className="mt-3 text-sm text-white/70 leading-relaxed">
            Ce sont des personas virtuels, pas des personnes humaines. La voix de l’appel est générée par intelligence artificielle.
          </p>
          <ul className="mt-4 space-y-3">
            {profiles.map((advisor) => (
              <li key={advisor.slug}>
                <Link href={advisorPath('fr', advisor.slug)} className="underline hover:text-celestial-gold">
                  {advisor.name}
                </Link>
                <p className="text-xs text-white/50">
                  {advisor.gender === 'femme' ? 'Conseillère IA Callastral' : 'Conseiller IA Callastral'}
                  {advisor.specialties.length > 0
                    ? ` · ${advisor.specialties.map((item) => specialtyLabel('fr', item)).join(', ')}`
                    : ''}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-white/60 space-x-3">
            <Link href={hubPath('fr', 'amour')} className="underline hover:text-white">Astrologie amour</Link>
            <Link href={hubPath('fr', 'spiritualité')} className="underline hover:text-white">Astrologie spiritualité</Link>
            <Link href="/fr/astrologie-compatibilite" className="underline hover:text-white">Compatibilité</Link>
            <Link href="/fr/tarifs-voyance-telephone-2026" className="underline hover:text-white">Tarifs 2026</Link>
            <Link href="/offres" className="underline hover:text-white">Offres</Link>
          </p>
        </section>
      </article>

      <footer className="max-w-3xl mx-auto px-4 py-8 text-xs text-white/50 border-t border-white/10 mt-4 space-x-4">
        <Link href="/fr" className="hover:text-white">Accueil</Link>
        <Link href="/a-propos" className="hover:text-white">À propos</Link>
        <Link href="/faq" className="hover:text-white">FAQ</Link>
        <Link href="/cgu" className="hover:text-white">CGU</Link>
        <Link href="/privacy" className="hover:text-white">Confidentialité</Link>
      </footer>

      <JsonLd data={ascendantJsonLd(origin)} />
    </main>
  );
}
