import Link from 'next/link';
import FreeTrialForm from '@/components/FreeTrialForm';
import Commitments from '@/components/Commitments';
import { TRIAL_NO_CHARGE, TRUST_PROMISE } from '@/lib/trust-copy';
import { discoveryHeadline } from '@/lib/book-funnel';
import { freeCallEnabled } from '@/lib/free-call';
import { localeCurrency, type Locale } from '@/lib/seo';
import { weeklyCurrency } from '@/lib/weekly';

const CLOSED: Record<Locale, { title: string; body: string }> = {
  fr: {
    title: 'La formule Découverte',
    body: 'L’appel offert est fermé. La première semaine Découverte reste disponible, résiliable en un clic.',
  },
  en: {
    title: 'The Discovery plan',
    body: 'The free call is off. The first Discovery week is still available. Cancel in one click.',
  },
  es: {
    title: 'La fórmula Descubrimiento',
    body: 'La llamada gratis está cerrada. La primera semana sigue disponible. Se cancela en un clic.',
  },
  de: {
    title: 'Der Tarif Entdeckung',
    body: 'Der Gratis-Anruf ist geschlossen. Die erste Woche bleibt verfügbar. Kündigung mit einem Klick.',
  },
  it: {
    title: 'La formula Scoperta',
    body: 'La chiamata gratuita è chiusa. La prima settimana resta disponibile. Disdetta in un clic.',
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
        <p className="mt-4 text-2xl text-celestial-gold">{discoveryHeadline(locale, currency)}</p>
        <Link href="/book?offer=decouverte" className="btn-primary mt-6 inline-block">
          {discoveryHeadline(locale, currency)}
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
