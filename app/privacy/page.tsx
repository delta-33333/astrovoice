import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Confidentialité — Callastral',
  description: 'Données utilisées pour établir un thème natal et mener une consultation.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-4 py-10">
      <article className="max-w-2xl mx-auto space-y-6 text-white/80 leading-relaxed">
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl text-white">
          Confidentialité
        </h1>
        <p>
          Callastral enregistre le compte, les données de naissance nécessaires au thème natal, et
          les éléments de paiement traités par Stripe. Ces informations servent à ouvrir la
          consultation, à la facturer et à la reprendre avec le même conseiller.
        </p>
        <p>
          Elles ne sont pas vendues. L’accès aux fiches en base est réservé au service qui fait
          fonctionner l’application.
        </p>
        <p className="text-sm">
          <Link href="/terms" className="text-celestial-gold hover:underline">
            Conditions générales de vente
          </Link>
        </p>
      </article>
    </main>
  );
}
