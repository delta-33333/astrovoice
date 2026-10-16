import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { VIRTUAL_ADVISOR_DISCLOSURE } from '@/lib/legal';
import { appBaseUrl } from '@/lib/stripe';

export const metadata: Metadata = {
  title: 'Questions fréquentes — Callastral',
  description: 'Tarifs, thème natal et déroulement d’une consultation Callastral.',
  alternates: { canonical: '/faq', languages: { fr: '/faq', 'x-default': '/faq' } },
};

const ENTRIES: { q: string; a: string }[] = [
  {
    q: 'Qui sont les conseillers Callastral ?',
    a: VIRTUAL_ADVISOR_DISCLOSURE,
  },
  {
    q: 'Comment est calculé le prix d’une consultation à la minute ?',
    a: 'Chaque conseiller a son tarif, entre 0,99 € et 1,99 € par minute en France, en Belgique et en Allemagne. Le plancher est 0,89 € en Espagne et en Italie, 0,99 CHF en Suisse, 0,99 £ au Royaume-Uni et 1,49 $ aux États-Unis. Les trois premières minutes sont à un tarif fixe du marché, une fois par compte. L’offre fondateur est de 10 minutes à 4,90 € (5,90 $), une fois par compte, 100 places, jusqu’au 31 octobre 2026. Les formules hebdomadaires sont Découverte (10 min), Essentiel (30 min) et Premium (60 min), avec 60 minutes maximum par appel.',
  },
  {
    q: 'La consultation s’appuie-t-elle sur mon thème natal ?',
    a: 'Oui. La date, l’heure et le lieu de naissance servent à établir le thème : positions, maisons et aspects. Si l’heure est inconnue, la lecture reste plus prudente sur l’ascendant et les maisons.',
  },
  {
    q: 'Que comprennent les formules hebdomadaires ?',
    a: 'Découverte : 10 minutes par semaine, 5,90 € puis 1,99 € la première semaine. Essentiel : 30 minutes par semaine, 14,90 € puis 7,45 € la première semaine. Premium : 60 minutes par semaine, 27,90 € puis 13,95 € la première semaine. Le plafond est de 60 minutes par appel. La première semaine à tarif réduit ne s’applique qu’une fois par client, toutes formules confondues. Le renouvellement se fait au tarif plein. La résiliation se fait en un clic depuis le compte.',
  },
  {
    q: 'Quels documents écrits sont proposés ?',
    a: 'Le résumé d’une consultation coûte 2,90 €. Le thème natal écrit coûte 9,90 €, la prévision 2026 et 2027 coûte 14,90 €, la lecture de compatibilité coûte 7,90 €. Chaque document payé est envoyé par e-mail et reste dans le compte.',
  },
  {
    q: 'Puis-je interrompre une consultation ?',
    a: 'Oui. Vous pouvez y mettre fin à tout moment. Pour une consultation à la minute, vous réglez la durée réellement écoulée, dans la limite de l’empreinte autorisée.',
  },
];

export default function FaqPage() {
  const origin = appBaseUrl();
  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-white/40">Callastral</p>
          <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl">
            Questions fréquentes
          </h1>
        </header>
        <div className="space-y-4">
          {ENTRIES.map((entry) => (
            <details
              key={entry.q}
              className="group p-5 rounded-xl bg-white/5 border border-white/10"
              open={entry.q.startsWith('Qui sont')}
            >
              <summary className="cursor-pointer font-semibold list-none">{entry.q}</summary>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">{entry.a}</p>
            </details>
          ))}
        </div>
        <p className="text-sm">
          <Link href="/terms" className="text-celestial-gold hover:underline">
            Conditions générales de vente
          </Link>
          {' · '}
          <Link href="/fr/calcul-ascendant-gratuit" className="text-celestial-gold hover:underline">
            Calcul ascendant gratuit
          </Link>
        </p>
      </div>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${origin}/fr` },
              { '@type': 'ListItem', position: 2, name: 'Questions fréquentes', item: `${origin}/faq` },
            ],
          },
          {
            '@type': 'FAQPage',
            mainEntity: ENTRIES.map((entry) => ({
              '@type': 'Question',
              name: entry.q,
              acceptedAnswer: { '@type': 'Answer', text: entry.a },
            })),
          },
        ],
      }} />
    </main>
  );
}
