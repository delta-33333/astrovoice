import Link from 'next/link';
import FreeTrialForm from '@/components/FreeTrialForm';
import Commitments from '@/components/Commitments';
import { TRIAL_NO_CHARGE, TRUST_PROMISE } from '@/lib/trust-copy';
import { packsCheckoutPath, packsLead, packsOfferLine } from '@/lib/pack-offer';
import { freeCallEnabled } from '@/lib/free-call';
import { localeCurrency, type Locale } from '@/lib/seo';
import { weeklyCurrency } from '@/lib/weekly';

const CLOSED: Record<Locale, { title: string; body: string }> = {
  fr: {
    title: 'Packs à prix fixe',
    body: 'L’appel offert est fermé. Vous pouvez continuer avec un pack de minutes, payé une fois, sans abonnement.',
  },
  en: {
    title: 'Fixed-price packs',
    body: 'The free call is off. You can continue with a minute pack, paid once, with no subscription.',
  },
  es: {
    title: 'Paquetes a precio fijo',
    body: 'La llamada gratis está cerrada. Puedes continuar con un paquete de minutos, de pago único, sin suscripción.',
  },
  de: {
    title: 'Festpreis-Pakete',
    body: 'Der Gratis-Anruf ist geschlossen. Sie können mit einem Minutenpaket weitermachen, einmalig bezahlt, ohne Abo.',
  },
  it: {
    title: 'Pacchetti a prezzo fisso',
    body: 'La chiamata gratuita è chiusa. Puoi continuare con un pacchetto di minuti, pagamento unico, senza abbonamento.',
  },
};

export default function TrialPage({ locale }: { locale: Locale }) {
  if (!freeCallEnabled()) {
    const copy = CLOSED[locale];
    const currency = weeklyCurrency(localeCurrency(locale));
    return (
      <main className="max-w-lg mx-auto px-4 py-10">
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl">{copy.title}</h1>
        <p className="mt-3 text-sm text-white/75">{copy.body}</p>
        <p className="mt-2 text-sm text-white/70">{packsLead(locale)}</p>
        <p className="mt-4 text-2xl text-celestial-gold">{packsOfferLine(locale, currency)}</p>
        <Link href={packsCheckoutPath({ lang: locale === 'en' ? 'en' : 'fr' })} className="btn-primary mt-6 inline-block">
          {packsOfferLine(locale, currency)}
        </Link>
      </main>
    );
  }
  return (
    <main>
      {(locale === 'fr' || locale === 'en') && (
        <div className="max-w-lg mx-auto px-4 pt-8 -mb-6">
          <p className="text-sm font-semibold text-celestial-gold" data-trust-promise>{TRUST_PROMISE[locale]}</p>
          <p className="mt-1 text-xs text-white/70">{TRIAL_NO_CHARGE[locale]}</p>
        </div>
      )}
      <FreeTrialForm locale={locale} />
      {(locale === 'fr' || locale === 'en') && <Commitments locale={locale} promise={false} />}
    </main>
  );
}
