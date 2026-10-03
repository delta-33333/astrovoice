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
            <li>0,99 € par minute pendant les trois premières minutes, puis 1,49 € par minute, à la seconde.</li>
            <li>Packs de minutes : 12,90 €, 34,90 € et 59,90 €.</li>
            <li>Offre fondateur : 10 minutes pour 4,90 €.</li>
          </ul>
          <p>Les prix sont indiqués en euros, toutes taxes comprises.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-white text-lg font-semibold">Paiement</h2>
          <p>
            Le règlement s’effectue dans l’application, par carte ou moyen de paiement proposé sur
            l’appareil. Une empreinte peut être prise avant une consultation à la minute ; seul le
            montant correspondant à la durée réelle est encaissé, dans la limite de cette empreinte.
            Les packs et l’offre fondateur sont encaissés au moment de l’achat.
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
