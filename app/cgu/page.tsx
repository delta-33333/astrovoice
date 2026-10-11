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
          <h2 className="text-white text-lg font-semibold">Compte</h2>
          <p>
            L’accès aux consultations payantes suppose un compte : e-mail, prénom et mot de passe. Vous pouvez
            demander la suppression du compte et des données associées dans les conditions de la politique de
            confidentialité.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-white text-lg font-semibold">Usage acceptable</h2>
          <p>
            Le service est un divertissement. Il est interdit de l’utiliser pour harceler, pour obtenir un avis
            médical, juridique ou financier présenté comme certain, ou pour tenter de contourner le paiement.
            Callastral peut suspendre un compte en cas d’abus.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-white text-lg font-semibold">Déroulement d’un appel</h2>
          <p>
            La personne peut mettre fin à l’appel à tout moment. Si elle reste silencieuse, le conseiller la relance
            avec une question ouverte, deux fois au plus ; sans aucune réponse pendant 90 secondes après la seconde
            relance, le conseiller prend congé et l’appel se termine automatiquement. Le décompte du temps s’arrête
            à la fin de l’appel.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-white text-lg font-semibold">Paiement</h2>
          <p>
            Les prix, l’encaissement par Stripe, l’annulation et les avoirs sont décrits dans les conditions
            générales de vente. Le tarif du conseiller est affiché avant le paiement.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-white text-lg font-semibold">Responsabilité</h2>
          <p>
            Les lectures sont symboliques. Elles ne garantissent aucun événement. Callastral n’est pas responsable
            des décisions prises à partir d’une consultation. En cas de détresse, contactez les services d’urgence
            (112, ou 3114 en France).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-white text-lg font-semibold">Données et contact</h2>
          <p>
            Le traitement des données est décrit dans la politique de confidentialité. L’éditeur est celui indiqué
            sur la page À propos lorsque l’entité légale est renseignée. À défaut, les champs restent des marqueurs
            à compléter, sans valeur inventée.
          </p>
        </section>

        <p className="text-sm space-x-4">
          <Link href="/terms" className="text-celestial-gold hover:underline">Conditions générales de vente</Link>
          <Link href="/fr/confidentialite" className="text-celestial-gold hover:underline">Confidentialité</Link>
          <Link href="/faq" className="text-celestial-gold hover:underline">Questions fréquentes</Link>
        </p>
      </article>
    </main>
  );
}
