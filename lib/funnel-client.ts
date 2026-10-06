'use client';

import { track } from '@vercel/analytics';

/*
 * Étapes du parcours côté navigateur.
 * - `track()` envoie l'événement personnalisé à Vercel Web Analytics ;
 * - `log: true` l'enregistre aussi dans callastral.events (pour les étapes que le serveur ne voit pas).
 */
export type FunnelEvent =
  | 'book_click'
  | 'signup_view'
  | 'signup_submit'
  | 'birth_start'
  | 'birth_submit'
  | 'slot_selected'
  | 'checkout_start'
  | 'payment_success'
  | 'call_start'
  | 'call_completed'
  | 'rebook';

const SERVER_NAME: Partial<Record<FunnelEvent, string>> = {
  book_click: 'book_click',
  signup_view: 'signup_view',
  birth_start: 'birth_start',
  slot_selected: 'select_slot',
};

type Props = Record<string, string | number | boolean | null>;

// document.referrer ne change pas lors des navigations internes : on ne l'envoie qu'une fois par chargement.
let referrerSent = false;

export function postEvent(name: string, extra: { advisorId?: string | null; metadata?: Record<string, string> } = {}) {
  try {
    const body = JSON.stringify({
      name,
      path: window.location.pathname,
      search: window.location.search,
      referrer: referrerSent ? null : document.referrer || null,
      advisorId: extra.advisorId ?? null,
      metadata: extra.metadata ?? {},
    });
    referrerSent = true;
    if (navigator.sendBeacon) {
      const sent = navigator.sendBeacon('/api/events', new Blob([body], { type: 'application/json' }));
      if (sent) return;
    }
    void fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* la mesure ne doit jamais bloquer le parcours */
  }
}

export function funnel(
  event: FunnelEvent,
  props: Props = {},
  options: { log?: boolean; advisorId?: string | null; metadata?: Record<string, string> } = {}
) {
  try {
    track(event, props);
  } catch {
    /* Web Analytics indisponible */
  }
  const serverName = SERVER_NAME[event];
  if (options.log && serverName) {
    postEvent(serverName, { advisorId: options.advisorId, metadata: options.metadata });
  }
}
