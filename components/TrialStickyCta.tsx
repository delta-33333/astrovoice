'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { VIRTUAL_ADVISOR_DISCLOSURE, VIRTUAL_ADVISOR_DISCLOSURE_EN } from '@/lib/legal';

export const TRIAL_CTA_FR = '3 min offertes, sans carte';
const CTA: Record<'fr' | 'en', string> = { fr: TRIAL_CTA_FR, en: 'Try 3 minutes free, no card' };
const AI: Record<'fr' | 'en', string> = { fr: 'Conseillers IA', en: 'AI advisors' };

/**
 * Barre fixe en bas d’écran (mobile) vers l’essai gratuit de 3 minutes.
 * Apparaît une fois le premier écran dépassé, pour ne pas doubler le bouton du haut ni masquer le bandeau cookies.
 */
export default function TrialStickyCta({ href = '/fr/essai', source, locale = 'fr', afterPx = 420 }: { href?: string; source: string; locale?: 'fr' | 'en'; afterPx?: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > afterPx);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [afterPx]);
  return (
    <div
      className={`sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-[#0c1018]/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full pointer-events-none'}`}
      data-sticky-cta={source}
      aria-hidden={!visible}
    >
      <Link href={href} data-cta={`sticky-${source}`} tabIndex={visible ? 0 : -1} className="btn-primary block text-center w-full">
        {CTA[locale]}
      </Link>
      <p className="mt-1 text-center text-[11px] text-white/55">{AI[locale]} · {(locale === 'en' ? VIRTUAL_ADVISOR_DISCLOSURE_EN : VIRTUAL_ADVISOR_DISCLOSURE).replace(/\.$/, '')}</p>
    </div>
  );
}
