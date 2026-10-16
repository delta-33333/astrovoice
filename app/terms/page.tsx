import type { Metadata } from 'next';
import Link from 'next/link';
import AiTermsSection from '@/components/AiTermsSection';
import { VIRTUAL_ADVISOR_DISCLOSURE } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Conditions générales de vente — Callastral',
  description: 'Tarifs et conditions des consultations astrologiques Callastral.',
  alternates: { canonical: '/terms', languages: { fr: '/terms', 'x-default': '/terms' } },
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
          <p className="text-sm text-white/55">
            {VIRTUAL_ADVISOR_DISCLOSURE}{' '}
            <Link href="/cgu" className="text-celestial-gold hover:underline">Voir les CGU</Link>.
          </p>
        </section>

        <AiTermsSection />

        <section className="space-y-3">
          <h2 className="text-white text-lg font-semibold">Tarifs</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Chaque conseiller a un tarif dans la fourchette du pays : 0,99 € à 1,99 € la minute en France, en Belgique et en Allemagne ; 0,89 € à 1,49 € en Espagne ; 0,89 € à 1,29 € en Italie ; 0,99 CHF à 1,99 CHF en Suisse ; 0,99 £ à 1,79 £ au Royaume-Uni ; 1,49 $ à 2,99 $ aux États-Unis. Les trois premières minutes sont à un tarif fixe du marché, une fois par compte, à la seconde.</li>
            <li>Offre fondateur : 10 minutes pour 4,90 € (5,90 $), une fois par compte, 100 ventes au total, jusqu’au 31 octobre 2026 à 23 h 59, heure de Paris.</li>
            <li>Packs de minutes, en France : 10 minutes pour 12,90 €, 30 minutes pour 34,90 €, 60 minutes pour 59,90 €. Ces minutes n’expirent pas. Les autres marchés ont leur propre grille.</li>
            <li>Résumé écrit d’une consultation : 2,90 €.</li>
            <li>Thème natal écrit : 9,90 €. Prévision 2026 et 2027 : 14,90 €. Lecture de compatibilité : 7,90 €.</li>
            <li>Formules hebdomadaires, 60 minutes maximum par appel. Découverte : 10 minutes par semaine, 5,90 € (1,99 € la première semaine). Essentiel : 30 minutes, 14,90 € (7,45 € la première semaine). Premium : 60 minutes, 27,90 € (13,95 € la première semaine). Les montants en franc suisse et en livre suivent les mêmes chiffres ; le dollar a sa grille. La première semaine à tarif réduit est réservée aux clients qui n’ont jamais souscrit. Ensuite le prix plein est prélevé chaque semaine. La résiliation se fait en un clic depuis le compte ; l’accès court jusqu’à la fin de la semaine déjà payée.</li>
            <li>Après une consultation, le prochain rendez-vous payant peut bénéficier de 15 % de réduction, pendant 30 jours, une seule offre à la fois.</li>
          </ul>
          <p>
            Les prix de référence sont indiqués toutes taxes comprises, selon le pays détecté. Les formules
            hebdomadaires sont proposées en euro, franc suisse, livre et dollar.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-white text-lg font-semibold">Paiement</h2>
          <p>
            Le règlement s’effectue dans l’application, par carte ou moyen de paiement proposé sur
            l’appareil. Une empreinte peut être prise avant une consultation à la minute ; seul le
            montant correspondant à la durée réelle est encaissé, dans la limite de cette empreinte.
            Les packs, l’offre fondateur, les rapports écrits et l’abonnement sont encaissés au moment de l’achat.
            Une formule active n’est pas facturée à la minute tant qu’il reste des minutes dans la semaine
            et dans la limite de 60 minutes pour l’appel.
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

        <p className="text-sm space-x-4">
          <Link href="/cgu" className="text-celestial-gold hover:underline">CGU</Link>
          <Link href="/faq" className="text-celestial-gold hover:underline">
            Questions fréquentes
          </Link>
        </p>
      </article>
    </main>
  );
}
