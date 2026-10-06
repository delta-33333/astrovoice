/*
 * Mesure du parcours : identifiant visiteur anonyme, première source, détection des robots.
 * Sans dépendance Node : utilisé par le middleware (edge) et les routes serveur.
 * Aucune donnée personnelle : l'identifiant visiteur est un UUID aléatoire, le référent est réduit
 * à l'origine + chemin (sans paramètres), et l'IP n'est jamais stockée.
 */

export const VISITOR_COOKIE = 'cl_vid';
export const FIRST_TOUCH_COOKIE = 'cl_ft';
export const VISITOR_MAX_AGE = 60 * 60 * 24 * 365;
export const FIRST_TOUCH_MAX_AGE = 60 * 60 * 24 * 90;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validVisitorId(value: string | null | undefined): string | null {
  return value && UUID_RE.test(value) ? value.toLowerCase() : null;
}

/** Robots, crawlers, aperçus de liens, sondes de disponibilité et clients HTTP sans navigateur. */
const BOT_RE = new RegExp(
  [
    'bot\\b', 'bot/', 'crawl', 'spider', 'slurp', 'scrap', 'headless', 'lighthouse', 'pagespeed',
    'pingdom', 'uptime', 'monitor', 'statuscake', 'site24x7', 'newrelic', 'datadog', 'checkly',
    'betteruptime', 'better stack', 'hetrix', 'freshping', 'nodeping', 'gtmetrix', 'webpagetest',
    'curl/', 'wget', 'python-requests', 'python-urllib', 'aiohttp', 'httpx', 'axios/', 'node-fetch',
    'undici', 'go-http-client', 'java/', 'okhttp', 'libwww', 'httpclient', 'postman', 'insomnia',
    'facebookexternalhit', 'facebookcatalog', 'meta-externalagent', 'whatsapp', 'telegrambot',
    'slackbot', 'discordbot', 'twitterbot', 'linkedinbot', 'embedly', 'skypeuripreview', 'preview',
    'ahrefs', 'semrush', 'mj12', 'dotbot', 'petalbot', 'bytespider', 'yandex', 'baidu', 'sogou',
    'gptbot', 'chatgpt-user', 'oai-searchbot', 'claudebot', 'claude-web', 'anthropic', 'ccbot',
    'perplexity', 'google-inspectiontool', 'google-extended', 'googleother', 'apis-google',
    'mediapartners', 'adsbot', 'feedfetcher', 'bingpreview', 'duckduckbot', 'applebot',
    'phantomjs', 'selenium', 'playwright', 'puppeteer', 'cypress', 'vercel-screenshot',
    'vercelbot', 'vercel-favicon', 'stripe/', 'cloudflare-', 'zgrab', 'masscan', 'nmap',
  ].join('|'),
  'i'
);

export function isBotUserAgent(ua: string | null | undefined): boolean {
  const value = (ua || '').trim();
  if (value.length < 12) return true;
  return BOT_RE.test(value);
}

export type Utm = { utm_source?: string; utm_medium?: string; utm_campaign?: string };

function clean(value: string | null | undefined, max = 120): string | undefined {
  const trimmed = (value || '').trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/[\u0000-\u001f<>"]/g, '').slice(0, max) || undefined;
}

export function utmFrom(params: URLSearchParams): Utm {
  const out: Utm = {};
  const source = clean(params.get('utm_source'));
  const medium = clean(params.get('utm_medium'));
  const campaign = clean(params.get('utm_campaign'));
  if (source) out.utm_source = source.toLowerCase();
  if (medium) out.utm_medium = medium.toLowerCase();
  if (campaign) out.utm_campaign = campaign;
  // Identifiants de clic publicitaires : source implicite, sans stocker l'identifiant.
  if (!out.utm_source) {
    if (params.get('gclid') || params.get('gbraid') || params.get('wbraid')) {
      out.utm_source = 'google';
      out.utm_medium = out.utm_medium || 'cpc';
    } else if (params.get('fbclid')) {
      out.utm_source = 'facebook';
    } else if (params.get('ttclid')) {
      out.utm_source = 'tiktok';
      out.utm_medium = out.utm_medium || 'cpc';
    } else if (params.get('twclid')) {
      out.utm_source = 'x';
      out.utm_medium = out.utm_medium || 'cpc';
    }
  }
  return out;
}

/** Origine + chemin du référent, sans requête ni fragment. */
export function cleanReferrer(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined;
    return `${url.origin}${url.pathname}`.slice(0, 300);
  } catch {
    return undefined;
  }
}

export function isInternalReferrer(referrer: string | undefined, host: string | null | undefined): boolean {
  if (!referrer) return false;
  try {
    const refHost = new URL(referrer).hostname.replace(/^www\./, '');
    const ownHost = (host || '').split(':')[0].replace(/^www\./, '');
    return (
      refHost === ownHost ||
      refHost === 'callastral.com' ||
      refHost.endsWith('.vercel.app') ||
      refHost.endsWith('stripe.com')
    );
  } catch {
    return false;
  }
}

export function cleanPath(value: string | null | undefined): string | undefined {
  if (!value || !value.startsWith('/')) return undefined;
  return value.split(/[?#]/)[0].slice(0, 300);
}

export type FirstTouch = Utm & {
  referrer?: string;
  landing?: string;
  at?: string;
};

/** JSON brut : l'API cookies de Next l'encode elle-même pour l'en-tête Set-Cookie. */
export function encodeFirstTouch(touch: FirstTouch): string {
  return JSON.stringify(touch);
}

function parseTouch(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return JSON.parse(decodeURIComponent(raw)) as Record<string, unknown>;
  }
}

export function decodeFirstTouch(raw: string | null | undefined): FirstTouch | null {
  if (!raw) return null;
  try {
    const parsed = parseTouch(raw);
    const out: FirstTouch = {};
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign'] as const) {
      const value = clean(typeof parsed[key] === 'string' ? (parsed[key] as string) : undefined);
      if (value) out[key] = value;
    }
    const referrer = cleanReferrer(typeof parsed.referrer === 'string' ? parsed.referrer : undefined);
    if (referrer) out.referrer = referrer;
    const landing = cleanPath(typeof parsed.landing === 'string' ? parsed.landing : undefined);
    if (landing) out.landing = landing;
    if (typeof parsed.at === 'string' && !Number.isNaN(Date.parse(parsed.at))) out.at = parsed.at;
    return out;
  } catch {
    return null;
  }
}
