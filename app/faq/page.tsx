import type { Metadata } from 'next';
import Link from 'next/link';
import { VIRTUAL_ADVISOR_DISCLOSURE } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Questions fréquentes — Callastral',
  description: 'Tarifs, thème natal et déroulement d’une consultation Callastral.',
};

const ENTRIES: { q: string; a: string }[] = [
  {
    q: 'Qui sont les conseillers Callastral ?',
    a: VIRTUAL_ADVISOR_DISCLOSURE,
  },
  {
    q: 'Comment est calculé le prix d’une consultation à la minute ?',
    a: 'Chaque conseiller a son tarif, entre 0,50 € et 1,99 € par minute. Les trois premières minutes sont à un tarif réduit, propre à ce tarif. Des packs de minutes et une offre fondateur de 10 minutes à 4,90 € sont proposés après l’inscription. L’abonnement Callastral Illimité est à 49 € par mois, dans la limite de 300 minutes par mois et de 60 minutes par appel.',
  },
  {
    q: 'La consultation s’appuie-t-elle sur mon thème natal ?',
    a: 'Oui. La date, l’heure et le lieu de naissance servent à établir le thème : positions, maisons et aspects. Si l’heure est inconnue, la lecture reste plus prudente sur l’ascendant et les maisons.',
  },
  {
    q: 'Que comprend Callastral Illimité ?',
    a: '49 € par mois, parole sans facturation à la minute, dans la limite de 300 minutes par mois et de 60 minutes par appel. Ces limites sont indiquées avant le paiement et dans les conditions générales. La résiliation se fait à tout moment depuis le compte.',
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
        </p>
      </div>
    </main>
  );
}
