import { createHmac, timingSafeEqual } from 'node:crypto';
import { DateTime } from 'luxon';
import { skyAtUtc, type SkyBody } from './chart-calc.ts';
import { escapeHtml } from './email.ts';
import { discoveryHeadline } from './book-funnel.ts';
import type { Locale } from './seo.ts';
import { isSignId, signByFrench, signName, SIGN_IDS, SIGNS, type SignId } from './zodiac/signs.ts';

const ZONE = 'Europe/Paris';

export function parisDay(now: Date): string {
  return DateTime.fromJSDate(now, { zone: ZONE }).toISODate() ?? now.toISOString().slice(0, 10);
}

export function issueKey(day: string, locale: Locale, sign: SignId): string {
  return `${day}:${locale}:${sign}`;
}

export function morningBookPath(): string {
  const params = new URLSearchParams({
    offer: 'decouverte',
    utm_source: 'horoscope',
    utm_medium: 'email',
    utm_campaign: 'morning',
  });
  return `/book?${params.toString()}`;
}

type AspectKey = 'conjunction' | 'opposition' | 'square' | 'trine' | 'sextile';

function aspectTo(target: SignId, occupant: SignId): AspectKey | null {
  const distance = (SIGNS[occupant].index - SIGNS[target].index + 12) % 12;
  if (distance === 0) return 'conjunction';
  if (distance === 6) return 'opposition';
  if (distance === 3 || distance === 9) return 'square';
  if (distance === 4 || distance === 8) return 'trine';
  if (distance === 2 || distance === 10) return 'sextile';
  return null;
}

const ASPECT: Record<Locale, Record<AspectKey, string>> = {
  fr: { conjunction: 'dans le signe', opposition: 'en opposition', square: 'en carré', trine: 'en trigone', sextile: 'en sextile' },
  en: { conjunction: 'in the sign', opposition: 'opposite', square: 'square', trine: 'trine', sextile: 'sextile' },
  es: { conjunction: 'en el signo', opposition: 'en oposición', square: 'en cuadratura', trine: 'en trígono', sextile: 'en sextil' },
  de: { conjunction: 'im Zeichen', opposition: 'in Opposition', square: 'im Quadrat', trine: 'im Trigon', sextile: 'im Sextil' },
  it: { conjunction: 'nel segno', opposition: 'in opposizione', square: 'in quadratura', trine: 'in trigono', sextile: 'in sestile' },
};

const BODY: Record<Locale, Record<string, string>> = {
  fr: { Lune: 'La Lune', Soleil: 'Le Soleil', Mercure: 'Mercure', 'Vénus': 'Vénus', Mars: 'Mars' },
  en: { Lune: 'The Moon', Soleil: 'The Sun', Mercure: 'Mercury', 'Vénus': 'Venus', Mars: 'Mars' },
  es: { Lune: 'La Luna', Soleil: 'El Sol', Mercure: 'Mercurio', 'Vénus': 'Venus', Mars: 'Marte' },
  de: { Lune: 'Der Mond', Soleil: 'Die Sonne', Mercure: 'Merkur', 'Vénus': 'Venus', Mars: 'Mars' },
  it: { Lune: 'La Luna', Soleil: 'Il Sole', Mercure: 'Mercurio', 'Vénus': 'Venere', Mars: 'Marte' },
};

export interface DailyIssue {
  day: string;
  locale: Locale;
  sign: SignId;
  subject: string;
  paragraphs: string[];
}

export function skyForMorning(now: Date): SkyBody[] {
  const paris = DateTime.fromJSDate(now, { zone: ZONE }).set({ hour: 8, minute: 0, second: 0, millisecond: 0 }).toUTC();
  return skyAtUtc(paris.year, paris.month, paris.day, paris.hour, paris.minute).bodies;
}

export function dailyIssue(locale: Locale, sign: SignId, now: Date): DailyIssue {
  const day = parisDay(now);
  const name = signName(locale, sign);
  const bodies = skyForMorning(now);
  const lines: string[] = [];
  for (const french of ['Lune', 'Soleil', 'Mercure', 'Vénus', 'Mars'] as const) {
    const body = bodies.find((item) => item.name === french);
    const occupant = body ? signByFrench(body.sign) : null;
    if (!body || !occupant) continue;
    const aspect = aspectTo(sign, occupant);
    if (!aspect) continue;
    const label = BODY[locale][french];
    const where = signName(locale, occupant);
    const retro = body.retrograde
      ? { fr: ', rétrograde', en: ', retrograde', es: ', retrógrado', de: ', rückläufig', it: ', retrogrado' }[locale]
      : '';
    lines.push(
      {
        fr: `${label} est ${ASPECT.fr[aspect]} (${where}${retro}).`,
        en: `${label} is ${ASPECT.en[aspect]} (${where}${retro}).`,
        es: `${label} está ${ASPECT.es[aspect]} (${where}${retro}).`,
        de: `${label} steht ${ASPECT.de[aspect]} (${where}${retro}).`,
        it: `${label} è ${ASPECT.it[aspect]} (${where}${retro}).`,
      }[locale]
    );
    if (lines.length >= 2) break;
  }
  if (!lines.length) {
    lines.push(
      {
        fr: `Aucun des astres rapides n’aspecte ${name} ce matin. La journée reste ordinaire côté ciel.`,
        en: `None of the fast planets aspects ${name} this morning. The day stays ordinary in the sky.`,
        es: `Ningún astro rápido aspecta a ${name} esta mañana. El día sigue ordinario en el cielo.`,
        de: `Keiner der schnellen Planeten aspektiert ${name} heute Morgen. Der Tag bleibt am Himmel gewöhnlich.`,
        it: `Nessun astro veloce forma un aspetto con ${name} stamattina. La giornata resta ordinaria nel cielo.`,
      }[locale]
    );
  }
  lines.push(
    {
      fr: 'Divertissement. Ce texte décrit le ciel du jour. Il ne prédit pas un événement personnel.',
      en: 'Entertainment. This text describes today’s sky. It does not predict a personal event.',
      es: 'Entretenimiento. Este texto describe el cielo del día. No predice un hecho personal.',
      de: 'Unterhaltung. Dieser Text beschreibt den Himmel des Tages. Er sagt kein persönliches Ereignis voraus.',
      it: 'Intrattenimento. Questo testo descrive il cielo del giorno. Non predice un evento personale.',
    }[locale]
  );
  const subject = {
    fr: `Horoscope du matin — ${name}`,
    en: `Morning horoscope — ${name}`,
    es: `Horóscopo de la mañana — ${name}`,
    de: `Morgenhoroskop — ${name}`,
    it: `Oroscopo del mattino — ${name}`,
  }[locale];
  return { day, locale, sign, subject, paragraphs: lines };
}

export function personalLine(locale: Locale, birthDate: string | null, now: Date): string | null {
  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return null;
  const [year, month, day] = birthDate.split('-').map(Number);
  if (year < 1900 || year > 2100) return null;
  let sun: string;
  try {
    sun = skyAtUtc(year, month, day, 12, 0).bodies.find((body) => body.name === 'Soleil')?.sign ?? '';
  } catch {
    return null;
  }
  const natal = signByFrench(sun);
  if (!natal) return null;
  const moon = skyForMorning(now).find((body) => body.name === 'Lune');
  const moonSign = moon ? signByFrench(moon.sign) : null;
  if (!moonSign) return null;
  const aspect = aspectTo(natal, moonSign);
  const natalName = signName(locale, natal);
  const moonName = signName(locale, moonSign);
  if (!aspect) {
    return {
      fr: `Selon la date indiquée, le Soleil natal est en ${natalName}. La Lune du jour est en ${moonName}, sans aspect majeur.`,
      en: `From the date given, the natal Sun is in ${natalName}. Today’s Moon is in ${moonName}, with no major aspect.`,
      es: `Según la fecha indicada, el Sol natal está en ${natalName}. La Luna de hoy está en ${moonName}, sin aspecto mayor.`,
      de: `Nach dem angegebenen Datum steht die Geburtssonne in ${natalName}. Der Mond des Tages steht in ${moonName}, ohne Hauptaspekt.`,
      it: `Secondo la data indicata, il Sole natale è in ${natalName}. La Luna di oggi è in ${moonName}, senza aspetto maggiore.`,
    }[locale];
  }
  return {
    fr: `Selon la date indiquée, le Soleil natal est en ${natalName}. La Lune du jour, en ${moonName}, est ${ASPECT.fr[aspect]}.`,
    en: `From the date given, the natal Sun is in ${natalName}. Today’s Moon, in ${moonName}, is ${ASPECT.en[aspect]}.`,
    es: `Según la fecha indicada, el Sol natal está en ${natalName}. La Luna de hoy, en ${moonName}, está ${ASPECT.es[aspect]}.`,
    de: `Nach dem angegebenen Datum steht die Geburtssonne in ${natalName}. Der Mond des Tages, in ${moonName}, steht ${ASPECT.de[aspect]}.`,
    it: `Secondo la data indicata, il Sole natale è in ${natalName}. La Luna di oggi, in ${moonName}, è ${ASPECT.it[aspect]}.`,
  }[locale];
}

export function morningMail(input: {
  locale: Locale;
  subject: string;
  paragraphs: string[];
  personal: string | null;
  bookUrl: string;
  unsubscribeUrl: string;
  privacyUrl: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): { subject: string; html: string; headers: Record<string, string> } {
  const price = discoveryHeadline(input.locale, 'eur');
  const cta = {
    fr: `Première semaine Découverte à ${price}`,
    en: `Découverte first week at ${price}`,
    es: `Primera semana Découverte a ${price}`,
    de: `Erste Découverte-Woche zu ${price}`,
    it: `Prima settimana Découverte a ${price}`,
  }[input.locale];
  const ctaText = input.ctaLabel || cta;
  const ctaHref = input.ctaUrl || input.bookUrl;
  const bye = {
    fr: 'Se désinscrire',
    en: 'Unsubscribe',
    es: 'Darse de baja',
    de: 'Abmelden',
    it: 'Disiscriviti',
  }[input.locale];
  const body = input.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
  const personal = input.personal ? `<p>${escapeHtml(input.personal)}</p>` : '';
  const html = `${body}${personal}
<p><a href="${escapeHtml(ctaHref)}">${escapeHtml(ctaText)}</a></p>
<p><a href="${escapeHtml(input.unsubscribeUrl)}">${bye}</a></p>
<p><a href="${escapeHtml(input.privacyUrl)}">${escapeHtml(input.privacyUrl)}</a></p>`;
  return {
    subject: input.subject,
    html,
    headers: {
      'List-Unsubscribe': `<${input.unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function signHoroscopeToken(id: string, purpose: 'confirm' | 'unsubscribe', secret: string): string {
  const body = id.trim().toLowerCase();
  const sig = createHmac('sha256', secret).update(`horoscope-${purpose}:${body}`).digest('base64url');
  return `${body}.${sig}`;
}

export function readHoroscopeToken(token: string, purpose: 'confirm' | 'unsubscribe', secret: string): string | null {
  const split = token.split('.');
  if (split.length !== 2) return null;
  const [id, sig] = split;
  if (!UUID_RE.test(id) || !sig) return null;
  const expected = signHoroscopeToken(id, purpose, secret).split('.')[1];
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  return id.toLowerCase();
}

export function consentGiven(value: unknown): boolean {
  return value === true;
}

export function cleanUtm(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const text = value.trim().slice(0, 120);
  if (!text || /[\r\n]/.test(text)) return null;
  return text;
}

export function subscriberSource(input: {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  placement: string;
}): { utm_source: string; utm_medium: string; utm_campaign: string } {
  return {
    utm_source: input.utmSource || 'horoscope',
    utm_medium: input.utmMedium || input.placement || 'widget',
    utm_campaign: input.utmCampaign || 'morning',
  };
}

export function isMorningSign(value: string): value is SignId {
  return isSignId(value);
}

export const MORNING_SIGNS = SIGN_IDS;

export function confirmMail(locale: Locale, url: string): { subject: string; html: string } {
  const subject = {
    fr: 'Confirmez l’horoscope du matin',
    en: 'Confirm the morning horoscope',
    es: 'Confirme el horóscopo de la mañana',
    de: 'Morgenhoroskop bestätigen',
    it: 'Conferma l’oroscopo del mattino',
  }[locale];
  const line = {
    fr: 'Cliquez pour confirmer l’envoi. Sans ce clic, aucun horoscope n’est envoyé.',
    en: 'Click to confirm. Without this click, no horoscope is sent.',
    es: 'Pulse para confirmar. Sin este clic no se envía ningún horóscopo.',
    de: 'Klicken Sie zur Bestätigung. Ohne diesen Klick wird kein Horoskop gesendet.',
    it: 'Clicca per confermare. Senza questo clic non parte nessun oroscopo.',
  }[locale];
  return {
    subject,
    html: `<p>${line}</p><p><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>`,
  };
}
