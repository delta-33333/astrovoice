import Link from 'next/link';
import ChatCta from '@/components/ChatCta';
import { trialPath } from '@/lib/free-call';
import { COMMON } from '@/lib/free-tools-copy';
import type { ToolLang } from '@/lib/free-tools';
import { aiActLine } from '@/lib/legal';

/** CTA commun des outils gratuits : 3 minutes d’appel offertes + question par message. */
export default function FreeToolCta({ locale, placement, lead }: { locale: ToolLang; placement: string; lead?: string }) {
  const copy = COMMON[locale];
  return (
    <section className="mt-8 rounded-3xl border border-celestial-gold/30 bg-celestial-purple/10 p-5 sm:p-6">
      {lead ? <p className="text-sm text-white/80 leading-relaxed">{lead}</p> : null}
      <Link href={trialPath(locale)} data-cta={`trial-${placement}`} data-funnel="trial" className="btn-primary mt-4 inline-block w-full text-center">
        {copy.callCta}
      </Link>
      <div className="mt-3"><ChatCta locale={locale} placement={placement} className="w-full" /></div>
      <p className="mt-3 text-xs text-white/60">{copy.callNote}</p>
      <p className="mt-1 text-xs text-white/50">{aiActLine(locale)}</p>
    </section>
  );
}
