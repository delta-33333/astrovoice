import type { Metadata } from 'next';
import Link from 'next/link';
import AiTermsSection from '@/components/AiTermsSection';

export const metadata: Metadata = {
  title: 'Conditions générales d’utilisation — Callastral',
  description:
    'Conditions d’utilisation de Callastral : conseillers virtuels, voix générée par IA, thème natal et limites des consultations.',
  alternates: { canonical: '/cgu' },
};

export default function CguPage() {
  return (
    <main className="min-h-screen px-4 py-10">
      <article className="max-w-2xl mx-auto space-y-8 text-white/80 leading-relaxed">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-white/40">Callastral</p>
          <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl text-white">
            Conditions générales d’utilisation
          </h1>
        </header>

        <section className="space-y-3">
          <h2 className="text-white text-lg font-semibold">Objet</h2>
          <p>
            Les présentes conditions encadrent l’utilisation du site et des consultations astrologiques vocales
            Callastral. Les tarifs, le paiement et l’annulation sont décrits dans les{' '}
            <Link href="/terms" className="text-celestial-gold hover:underline">conditions générales de vente</Link>.
          </p>
        </section>

        <AiTermsSection />

        <section className="space-y-3">
          <h2 className="text-white text-lg font-semibold">Déroulement d’un appel</h2>
          <p>
            La personne peut mettre fin à l’appel à tout moment. Si elle reste silencieuse, le conseiller la relance
            avec une question ouverte, deux fois au plus ; sans aucune réponse pendant 90 secondes après la seconde
            relance, le conseiller prend congé et l’appel se termine automatiquement. Le décompte du temps s’arrête
            à la fin de l’appel.
          </p>
        </section>

        <p className="text-sm space-x-4">
          <Link href="/terms" className="text-celestial-gold hover:underline">Conditions générales de vente</Link>
          <Link href="/privacy" className="text-celestial-gold hover:underline">Confidentialité</Link>
          <Link href="/faq" className="text-celestial-gold hover:underline">Questions fréquentes</Link>
        </p>
      </article>
    </main>
  );
}
