'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { funnel, postEvent } from '@/lib/funnel-client';

/**
 * Pages vues (toutes les pages, y compris les pages SEO /[locale]/...) dans callastral.events,
 * et clics vers la réservation. Monté une fois dans le layout racine.
 */
export default function FunnelTracker() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname === last.current || pathname.startsWith('/admin')) return;
    last.current = pathname;
    postEvent('page_view');
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest('a[href],[data-funnel="book"]') : null;
      if (!target) return;
      const href = target.getAttribute('href') || '';
      if (target.getAttribute('data-funnel') === 'book' || /^\/book(\?|$)/.test(href)) {
        funnel('book_click', { from: window.location.pathname }, { log: true, metadata: { source: window.location.pathname.slice(0, 80) } });
      }
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return null;
}
