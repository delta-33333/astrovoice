import Link from 'next/link';
import { VIRTUAL_ADVISOR_DISCLOSURE } from '@/lib/legal';

export const TRIAL_CTA_FR = '3 min offertes, sans carte';

/** Barre fixe en bas d’écran (mobile) vers l’essai gratuit de 3 minutes. */
export default function TrialStickyCta({ href = '/fr/essai', source }: { href?: string; source: string }) {
  return (
    <div
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-[#0c1018]/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      data-sticky-cta={source}
    >
      <Link href={href} data-cta={`sticky-${source}`} className="btn-primary block text-center w-full">
        {TRIAL_CTA_FR}
      </Link>
      <p className="mt-1 text-center text-[11px] text-white/55">Conseillers IA · {VIRTUAL_ADVISOR_DISCLOSURE.replace(/\.$/, '')}</p>
    </div>
  );
}
