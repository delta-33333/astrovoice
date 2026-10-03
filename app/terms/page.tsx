import type { Metadata } from 'next';
import Link from 'next/link';
import { VIRTUAL_ADVISOR_DISCLOSURE } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Conditions générales de vente — Callastral',
  description: 'Tarifs et conditions des consultations astrologiques Callastral.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen px-4 py-10">
      <article className="max-w-2xl mx-auto space-y-8 text-white/80 leading-relaxed">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-white/40">Callastral</p>
          <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl text-white">
            Conditions générales de vente
          </h1>
        </header>

        <section className="space-y-3">
          <h2 className="text-white text-lg font-semibold">Objet</h2>
          <p>
            Callastral propose des consultations astrologiques vocales à distance, fondées sur le thème
            natal établi à partir des données de naissance communiquées par la personne.
          </p>
          <p className="text-sm text-white/55">{VIRTUAL_ADVISOR_DISCLOSURE}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-white text-lg font-semibold">Tarifs</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Chaque conseiller a un tarif entre 0,50 € et 1,99 € par minute. Les trois premières minutes sont à un tarif réduit, calculé sur le tarif de ce conseiller, à la seconde.</li>
            <li>Offre fondateur : 10 minutes pour 4,90 €, une fois par compte.</li>
            <li>Packs de minutes : 10 minutes pour 12,90 €, 30 minutes pour 34,90 €, 60 minutes pour 59,90 €. Ces minutes n’expirent pas.</li>
            <li>Résumé écrit d’une consultation : 2,90 €.</li>
            <li>Thème natal écrit : 9,90 €. Prévision 2026 et 2027 : 14,90 €. Lecture de compatibilité : 7,90 €.</li>
            <li>Callastral Illimité : 49 € par mois. La parole n’est pas facturée à la minute, dans la limite de 300 minutes par mois et de 60 minutes par appel. L’abonnement se résilie à tout moment depuis le compte ; l’accès court jusqu’à la fin de la période déjà payée.</li>
            <li>Après une consultation, le prochain rendez-vous payant peut bénéficier de 15 % de réduction, pendant 30 jours, une seule offre à la fois.</li>
          </ul>
          <p>
            Les prix de référence sont indiqués en euros, toutes taxes comprises. Lors du paiement, le montant
            encaissé est celui affiché dans la devise du visiteur (euro, dollar, livre, yen, franc suisse ou dollar
            canadien). L’abonnement mensuel est proposé en euro, dollar, livre ou yen.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-white text-lg font-semibold">Paiement</h2>
          <p>
            Le règlement s’effectue dans l’application, par carte ou moyen de paiement proposé sur
            l’appareil. Une empreinte peut être prise avant une consultation à la minute ; seul le
            montant correspondant à la durée réelle est encaissé, dans la limite de cette empreinte.
            Les packs, l’offre fondateur, les rapports écrits et l’abonnement sont encaissés au moment de l’achat.
            Un abonné actif n’est pas facturé à la minute tant qu’il reste dans la limite de 300 minutes du mois
            en cours et de 60 minutes pour l’appel.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-white text-lg font-semibold">Annulation d’une réservation</h2>
          <p>
            Jusqu’à 24 heures avant le début, le montant payé est intégralement remboursé. Passé ce délai,
            il est converti en avoir, valable 30 jours, utilisable sur une nouvelle réservation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-white text-lg font-semibold">Consultations</h2>
          <p>
            Une consultation ne constitue ni un avis médical, ni un conseil juridique, ni une
            recommandation d’investissement. La personne peut y mettre fin à tout moment.
          </p>
        </section>

        <p className="text-sm">
          <Link href="/faq" className="text-celestial-gold hover:underline">
            Questions fréquentes
          </Link>
        </p>
      </article>
    </main>
  );
}
