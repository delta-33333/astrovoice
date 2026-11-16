import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ChatApp from '@/components/ChatApp';
import SeoChrome from '@/components/SeoChrome';
import { CHAT_CTA, chatPath, isChatLocale } from '@/lib/chat';
import { trialPath } from '@/lib/free-call';
import { hreflangAlternates } from '@/lib/seo';

export const dynamic = 'force-dynamic';

const TITLE = {
  fr: 'Chat astrologie par message, 1re réponse offerte | Callastral',
  en: 'Astrology Chat by Message: First Answer Free | Callastral',
  es: 'Chat de astrología por mensaje — primera respuesta gratis | Callastral',
  de: 'Astrologie-Chat per Nachricht — erste Antwort gratis | Callastral',
  it: 'Chat di astrologia per messaggio — prima risposta gratis | Callastral',
} as const;

const DESCRIPTION = {
  fr: 'Amour, ex, travail, décision : posez votre question par écrit à une Conseillère ou un Conseiller Callastral, sur votre thème natal calculé. 1re réponse offerte.',
  en: 'Love, an ex, work or a decision: ask a Callastral advisor in writing, with an answer based on your calculated natal chart. First answer free.',
  es: 'Haz tu pregunta por escrito a un consejero de Callastral, según tu carta natal calculada. Primera respuesta gratis, luego 6,90 €/mes.',
  de: 'Stelle einer Callastral-Beratung deine Frage schriftlich, basierend auf deinem berechneten Geburtshoroskop. Erste Antwort gratis, dann 6,90 €/Monat.',
  it: 'Fai la tua domanda per iscritto a un consulente Callastral, in base al tuo tema natale calcolato. Prima risposta gratis, poi 6,90 €/mese.',
} as const;

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  if (!isChatLocale(locale)) return {};
  return {
    title: TITLE[locale],
    description: DESCRIPTION[locale],
    alternates: { canonical: chatPath(locale), languages: hreflangAlternates((l) => chatPath(l)) },
    openGraph: { title: TITLE[locale], description: DESCRIPTION[locale], url: chatPath(locale) },
  };
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  if (!isChatLocale(locale)) notFound();
  return (
    <main className="min-h-screen pb-10">
      <SeoChrome locale={locale} alternatePath={(l) => chatPath(l)} />
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <h1 className="font-[family-name:var(--font-cinzel)] text-2xl sm:text-3xl text-glow">{CHAT_CTA[locale]}</h1>
        <p className="mt-2 text-white/75 text-sm">{DESCRIPTION[locale]}</p>
        <ChatApp locale={locale} voicePath={trialPath(locale)} />
      </div>
    </main>
  );
}
