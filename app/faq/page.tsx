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
    q: 'Quels sont les tarifs ?',
    a: 'Un appel de 3 minutes est offert une fois, après un code envoyé par e-mail, sans carte. Ensuite les packs de minutes à prix fixe : 10 minutes 12,90 €, 20 minutes 22,90 €, 40 minutes 39,90 €. Paiement unique, sans abonnement ni recharge automatique. L’appel s’arrête tout seul quand le pack est utilisé.',
  },
  {
    q: 'La consultation s’appuie-t-elle sur mon thème natal ?',
    a: 'Oui. La date, l’heure et le lieu de naissance servent à établir le thème : positions, maisons et aspects. Si l’heure est inconnue, la lecture reste plus prudente sur l’ascendant et les maisons.',
  },
  {
    q: 'Que comprennent les packs de minutes ?',
    a: 'Trois packs prépayés à prix fixe : 10 minutes 12,90 €, 20 minutes 22,90 €, 40 minutes 39,90 €. Vous payez une fois. Les minutes n’expirent pas. L’appel s’arrête tout seul quand le pack est utilisé : pas d’abonnement, pas de recharge automatique, jamais un centime de plus.',
  },
  {
    q: 'Quels documents écrits sont proposés ?',
    a: 'Le résumé d’une consultation coûte 2,90 €. Le thème natal écrit coûte 9,90 €, la prévision 2026 et 2027 coûte 14,90 €, la lecture de compatibilité coûte 7,90 €. Chaque document payé est envoyé par e-mail et reste dans le compte.',
  },
  {
    q: 'Le conseiller se souvient-il des appels précédents ?',
    a: 'Oui. Après chaque appel, un court résumé est enregistré dans le compte et transmis au même conseiller au début de l’appel suivant. Vous pouvez le consulter et l’effacer depuis le compte.',
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
