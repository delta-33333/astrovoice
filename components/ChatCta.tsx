import Link from 'next/link';
import { CHAT_CTA, chatPath, isChatLocale } from '@/lib/chat';

/** Bouton « question par message, 1ère réponse offerte ». */
export default function ChatCta({ locale, placement, className = '' }: { locale: string; placement: string; className?: string }) {
  const lang = isChatLocale(locale) ? locale : 'fr';
  return (
    <Link
      href={chatPath(lang)}
      data-cta={`chat-${placement}`}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-celestial-gold/50 bg-celestial-gold/10 px-6 py-3 text-center font-semibold text-white hover:bg-celestial-gold/20 ${className}`}
    >
      <span aria-hidden="true">✉️</span>
      {CHAT_CTA[lang]}
    </Link>
  );
}
