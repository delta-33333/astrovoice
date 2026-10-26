'use client';

import { track } from '@vercel/analytics';
import { analyticsAllowed } from '@/lib/consent';
import { pickAttribution, type Landing } from '@/lib/attribution-pick';

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

// Source d'arrivée mémorisée pour la session (référent externe + UTM), envoyée avec chaque événement,
// y compris view_home atteint après une navigation interne.
const LANDING_KEY = 'cl_landing';
let memoryLanding: Landing | null = null;

function attribution(): { referrer: string | null; search: string } {
  let stored: Landing | null = memoryLanding;
  try {
    const raw = window.sessionStorage.getItem(LANDING_KEY);
    if (raw) stored = JSON.parse(raw) as Landing;
  } catch {
    /* stockage indisponible */
  }
  const picked = pickAttribution({ referrer: document.referrer || null, search: window.location.search, host: window.location.host, stored });
  memoryLanding = picked.landing;
  try {
    window.sessionStorage.setItem(LANDING_KEY, JSON.stringify(picked.landing));
  } catch {
    /* stockage indisponible */
  }
  return { referrer: picked.referrer, search: picked.search };
}

const VID_KEY = 'cl_vid';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let memoryVid: string | null = null;

/** Identifiant visiteur anonyme (UUID aléatoire, first-party), même finalité que le cookie cl_vid. */
export function visitorId(): string | null {
  try {
    const stored = window.localStorage.getItem(VID_KEY);
    if (stored && UUID_RE.test(stored)) return stored;
    const fresh = memoryVid ?? crypto.randomUUID();
    memoryVid = fresh;
    window.localStorage.setItem(VID_KEY, fresh);
    return fresh;
  } catch {
    memoryVid = memoryVid ?? (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : null);
    return memoryVid;
  }
}

function looksLikeBot(): boolean {
  try {
    const ua = navigator.userAgent || '';
    return navigator.webdriver === true || ua.trim().length < 12 || /headless|phantomjs|puppeteer|playwright|selenium|dataprovider|bot\b|crawl|spider/i.test(ua);
  } catch {
    return false;
  }
}

export function postEvent(name: string, extra: { advisorId?: string | null; metadata?: Record<string, string> } = {}) {
  try {
    const source = attribution();
    const body = JSON.stringify({
      name,
      path: window.location.pathname,
      search: source.search,
      referrer: source.referrer,
      advisorId: extra.advisorId ?? null,
      metadata: extra.metadata ?? {},
      visitorId: visitorId(),
      bot: looksLikeBot(),
    });
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

function consentCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )cl_ck=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function funnel(
  event: FunnelEvent,
  props: Props = {},
  options: { log?: boolean; advisorId?: string | null; metadata?: Record<string, string> } = {}
) {
  const choice = consentCookie();
  if (!choice) return;
  if (analyticsAllowed(choice)) {
    try {
      track(event, props);
    } catch {
      /* Web Analytics indisponible */
    }
  }
  const serverName = SERVER_NAME[event];
  if (options.log && serverName) {
    postEvent(serverName, { advisorId: options.advisorId, metadata: options.metadata });
  }
}
