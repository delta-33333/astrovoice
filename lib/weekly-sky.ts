import { DateTime } from 'luxon';
import type { Locale } from './seo.ts';
import { skyAtUtc, type EphemerisEngine, type SkyBody } from './chart-calc.ts';
import { SIGN_IDS, SIGNS, signByFrench, signName, weekAlternates, weekPath, type SignId } from './zodiac/signs.ts';

const ZONE = 'Europe/Paris';
const BODY_ORDER = ['Soleil', 'Lune', 'Mercure', 'Vénus', 'Mars', 'Jupiter', 'Saturne', 'Uranus', 'Neptune', 'Pluton', 'Nœud nord'] as const;

const BODY_NAME: Record<Locale, Record<string, string>> = {
  fr: { Soleil: 'le Soleil', Lune: 'la Lune', Mercure: 'Mercure', Vénus: 'Vénus', Mars: 'Mars', Jupiter: 'Jupiter', Saturne: 'Saturne', Uranus: 'Uranus', Neptune: 'Neptune', Pluton: 'Pluton', 'Nœud nord': 'le Nœud nord' },
  en: { Soleil: 'the Sun', Lune: 'the Moon', Mercure: 'Mercury', Vénus: 'Venus', Mars: 'Mars', Jupiter: 'Jupiter', Saturne: 'Saturn', Uranus: 'Uranus', Neptune: 'Neptune', Pluton: 'Pluto', 'Nœud nord': 'the north node' },
  es: { Soleil: 'el Sol', Lune: 'la Luna', Mercure: 'Mercurio', Vénus: 'Venus', Mars: 'Marte', Jupiter: 'Júpiter', Saturne: 'Saturno', Uranus: 'Urano', Neptune: 'Neptuno', Pluton: 'Plutón', 'Nœud nord': 'el nodo norte' },
  de: { Soleil: 'die Sonne', Lune: 'der Mond', Mercure: 'Merkur', Vénus: 'Venus', Mars: 'Mars', Jupiter: 'Jupiter', Saturne: 'Saturn', Uranus: 'Uranus', Neptune: 'Neptun', Pluton: 'Pluto', 'Nœud nord': 'der Nordknoten' },
  it: { Soleil: 'il Sole', Lune: 'la Luna', Mercure: 'Mercurio', Vénus: 'Venere', Mars: 'Marte', Jupiter: 'Giove', Saturne: 'Saturno', Uranus: 'Urano', Neptune: 'Nettuno', Pluton: 'Plutone', 'Nœud nord': 'il nodo nord' },
};

const ASPECT_NAME: Record<Locale, Record<string, string>> = {
  fr: { conjunction: 'dans le signe', opposition: 'en opposition', square: 'en carré', trine: 'en trigone', sextile: 'en sextile' },
  en: { conjunction: 'in the sign', opposition: 'opposite', square: 'square', trine: 'trine', sextile: 'sextile' },
  es: { conjunction: 'en el signo', opposition: 'en oposición', square: 'en cuadratura', trine: 'en trígono', sextile: 'en sextil' },
  de: { conjunction: 'im Zeichen', opposition: 'in Opposition', square: 'im Quadrat', trine: 'im Trigon', sextile: 'im Sextil' },
  it: { conjunction: 'nel segno', opposition: 'in opposizione', square: 'in quadratura', trine: 'in trigono', sextile: 'in sestile' },
};

export interface SkySample {
  at: string;
  bodies: SkyBody[];
}

export interface Ingress {
  body: string;
  from: string;
  to: string;
  at: string;
}

export interface WeekSky {
  start: string;
  end: string;
  engine: EphemerisEngine;
  samples: SkySample[];
  ingresses: Ingress[];
  snapshot: SkyBody[];
}

export interface HoroscopeSection {
  id: SignId;
  slug: string;
  h2: string;
  paragraphs: string[];
}

export interface HoroscopeModel {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  h1: string;
  keywords: string[];
  alternates: Record<string, string>;
  entertainment: string;
  method: string;
  skyParagraphs: string[];
  sections: HoroscopeSection[];
  prose: string;
}

export function parisWeek(now: Date): { start: DateTime; end: DateTime } {
  const paris = DateTime.fromJSDate(now, { zone: ZONE });
  const start = paris.startOf('day').minus({ days: paris.weekday - 1 });
  return { start, end: start.plus({ days: 7 }) };
}

function sampleAt(instant: DateTime): { bodies: SkyBody[]; engine: EphemerisEngine } {
  const utc = instant.toUTC();
  return skyAtUtc(utc.year, utc.month, utc.day, utc.hour, utc.minute);
}

export function buildWeekSky(now: Date): WeekSky {
  const { start, end } = parisWeek(now);
  const samples: SkySample[] = [];
  let engine: EphemerisEngine = 'swisseph';
  for (let cursor = start; cursor <= end; cursor = cursor.plus({ hours: 6 })) {
    const sky = sampleAt(cursor.toUTC().set({ minute: 0, second: 0, millisecond: 0 }));
    engine = sky.engine;
    samples.push({ at: cursor.toUTC().toISO() ?? cursor.toISO() ?? '', bodies: sky.bodies });
  }
  const ingresses: Ingress[] = [];
  for (let i = 1; i < samples.length; i += 1) {
    const previous = new Map(samples[i - 1].bodies.map((body) => [body.name, body.sign]));
    for (const body of samples[i].bodies) {
      const from = previous.get(body.name);
      if (from && from !== body.sign) {
        ingresses.push({ body: body.name, from, to: body.sign, at: samples[i].at });
      }
    }
  }
  const thursday = start.plus({ days: 3, hours: 12 });
  const snapshot = sampleAt(thursday).bodies;
  return {
    start: start.toISODate() ?? '',
    end: end.minus({ days: 1 }).toISODate() ?? '',
    engine,
    samples,
    ingresses,
    snapshot,
  };
}

function aspectTo(target: SignId, occupant: SignId): 'conjunction' | 'opposition' | 'square' | 'trine' | 'sextile' | null {
  const distance = (SIGN_IDS.indexOf(occupant) - SIGN_IDS.indexOf(target) + 12) % 12;
  if (distance === 0) return 'conjunction';
  if (distance === 6) return 'opposition';
  if (distance === 3 || distance === 9) return 'square';
  if (distance === 4 || distance === 8) return 'trine';
  if (distance === 2 || distance === 10) return 'sextile';
  return null;
}

function formatDay(locale: Locale, iso: string): string {
  const date = DateTime.fromISO(iso, { zone: 'utc' }).setZone(ZONE);
  const tag = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', de: 'de-DE', it: 'it-IT' }[locale];
  return date.setLocale(tag).toLocaleString({ day: 'numeric', month: 'long' });
}

function bodyName(locale: Locale, french: string): string {
  return BODY_NAME[locale][french] ?? french;
}

function localSign(locale: Locale, french: string): string {
  const id = signByFrench(french);
  return id ? signName(locale, id) : french;
}

const COPY = {
  h1: {
    fr: 'Horoscope de la semaine',
    en: 'Weekly horoscope',
    es: 'Horóscopo semanal',
    de: 'Wochenhoroskop',
    it: 'Oroscopo settimanale',
  },
  entertainment: {
    fr: 'Divertissement. Ce texte décrit des transits du zodiaque tropical. Il ne prédit pas un événement personnel.',
    en: 'Entertainment. This text describes tropical-zodiac transits. It does not predict a personal event.',
    es: 'Entretenimiento. Este texto describe tránsitos del zodiaco tropical. No predice un acontecimiento personal.',
    de: 'Unterhaltung. Dieser Text beschreibt Transite des tropischen Tierkreises. Er sagt kein persönliches Ereignis voraus.',
    it: 'Intrattenimento. Questo testo descrive transiti dello zodiaco tropicale. Non predice un evento personale.',
  },
  keyword: {
    fr: 'horoscope de la semaine',
    en: 'weekly horoscope',
    es: 'horóscopo semanal',
    de: 'Wochenhoroskop',
    it: 'oroscopo settimanale',
  },
} as const;

export function horoscopeModel(locale: Locale, now: Date): HoroscopeModel {
  const sky = buildWeekSky(now);
  const range = `${formatDay(locale, sky.start)} – ${formatDay(locale, sky.end)}`;
  const title = `${COPY.h1[locale]} · ${range}`;
  const description = {
    fr: `Horoscope de la semaine du ${range} : transits tropicaux, divertissement.`,
    en: `Weekly horoscope for ${range}: tropical transits, entertainment.`,
    es: `Horóscopo semanal del ${range}: tránsitos tropicales, entretenimiento.`,
    de: `Wochenhoroskop vom ${range}: tropische Transite, Unterhaltung.`,
    it: `Oroscopo settimanale del ${range}: transiti tropicali, intrattenimento.`,
  }[locale];
  const engineLine = sky.engine === 'swisseph'
    ? {
        fr: 'Positions calculées avec Swiss Ephemeris, géocentriques, zodiaque tropical.',
        en: 'Positions calculated with Swiss Ephemeris, geocentric, tropical zodiac.',
        es: 'Posiciones calculadas con Swiss Ephemeris, geocéntricas, zodiaco tropical.',
        de: 'Positionen berechnet mit Swiss Ephemeris, geozentrisch, tropischer Tierkreis.',
        it: 'Posizioni calcolate con Swiss Ephemeris, geocentriche, zodiaco tropicale.',
      }[locale]
    : {
        fr: 'Positions calculées avec l’éphéméride intégrée (Moshier), zodiaque tropical.',
        en: 'Positions calculated with the built-in Moshier ephemeris, tropical zodiac.',
        es: 'Posiciones calculadas con la efeméride integrada (Moshier), zodiaco tropical.',
        de: 'Positionen berechnet mit der eingebauten Moshier-Ephemeride, tropischer Tierkreis.',
        it: 'Posizioni calcolate con l’effemeride integrata (Moshier), zodiaco tropicale.',
      }[locale];
  const method = {
    fr: `${engineLine} La semaine commence le lundi, heure de Paris. Le ciel est échantillonné toutes les six heures. Un changement de signe est daté à l’échantillon où il apparaît.`,
    en: `${engineLine} The week starts on Monday, Paris time. The sky is sampled every six hours. A sign change is dated at the sample where it appears.`,
    es: `${engineLine} La semana empieza el lunes, hora de París. El cielo se muestrea cada seis horas. Un cambio de signo se fecha en la muestra donde aparece.`,
    de: `${engineLine} Die Woche beginnt am Montag, Pariser Zeit. Der Himmel wird alle sechs Stunden abgetastet. Ein Zeichenwechsel wird an der Probe datiert, wo er erscheint.`,
    it: `${engineLine} La settimana inizia lunedì, ora di Parigi. Il cielo è campionato ogni sei ore. Un cambio di segno è datato al campione in cui appare.`,
  }[locale];

  const placements = BODY_ORDER.map((name) => {
    const body = sky.snapshot.find((item) => item.name === name);
    if (!body) return '';
    const retro = body.retrograde
      ? { fr: ' (rétrograde)', en: ' (retrograde)', es: ' (retrógrado)', de: ' (rückläufig)', it: ' (retrogrado)' }[locale]
      : '';
    return `${bodyName(locale, name)} ${localSign(locale, body.sign)}${retro}`;
  }).filter(Boolean);

  const ingressLines = sky.ingresses
    .filter((item) => item.body !== 'Lune' && item.body !== 'Nœud nord')
    .map((item) => ({
      fr: `${bodyName(locale, item.body)} passe de ${localSign(locale, item.from)} à ${localSign(locale, item.to)} autour du ${formatDay(locale, item.at)}.`,
      en: `${bodyName(locale, item.body)} moves from ${localSign(locale, item.from)} to ${localSign(locale, item.to)} around ${formatDay(locale, item.at)}.`,
      es: `${bodyName(locale, item.body)} pasa de ${localSign(locale, item.from)} a ${localSign(locale, item.to)} alrededor del ${formatDay(locale, item.at)}.`,
      de: `${bodyName(locale, item.body)} wechselt von ${localSign(locale, item.from)} nach ${localSign(locale, item.to)} um den ${formatDay(locale, item.at)}.`,
      it: `${bodyName(locale, item.body)} passa da ${localSign(locale, item.from)} a ${localSign(locale, item.to)} intorno al ${formatDay(locale, item.at)}.`,
    }[locale]));

  const skyParagraphs = [
    {
      fr: `Au milieu de la semaine : ${placements.join(', ')}.`,
      en: `Midweek: ${placements.join(', ')}.`,
      es: `A mitad de semana: ${placements.join(', ')}.`,
      de: `Zur Wochenmitte: ${placements.join(', ')}.`,
      it: `A metà settimana: ${placements.join(', ')}.`,
    }[locale],
    ...ingressLines,
  ];

  const moonBySign = new Map<SignId, string[]>();
  for (const sample of sky.samples) {
    const moon = sample.bodies.find((body) => body.name === 'Lune');
    const id = moon ? signByFrench(moon.sign) : null;
    if (!id) continue;
    const day = formatDay(locale, sample.at);
    const list = moonBySign.get(id) ?? [];
    if (!list.includes(day)) list.push(day);
    moonBySign.set(id, list);
  }

  const sections: HoroscopeSection[] = SIGN_IDS.map((id) => {
    const name = signName(locale, id);
    const mentions: string[] = [];
    for (const body of sky.snapshot) {
      if (body.name === 'Lune') continue;
      const occupant = signByFrench(body.sign);
      if (!occupant) continue;
      const aspect = aspectTo(id, occupant);
      if (!aspect || (aspect === 'sextile' && body.name !== 'Soleil')) continue;
      const retro = body.retrograde ? { fr: ', rétrograde', en: ', retrograde', es: ', retrógrado', de: ', rückläufig', it: ', retrogrado' }[locale] : '';
      mentions.push({
        fr: `${bodyName(locale, body.name)} est ${ASPECT_NAME.fr[aspect]} (${localSign(locale, body.sign)}${retro}).`,
        en: `${bodyName(locale, body.name)} is ${ASPECT_NAME.en[aspect]} (${localSign(locale, body.sign)}${retro}).`,
        es: `${bodyName(locale, body.name)} está ${ASPECT_NAME.es[aspect]} (${localSign(locale, body.sign)}${retro}).`,
        de: `${bodyName(locale, body.name)} steht ${ASPECT_NAME.de[aspect]} (${localSign(locale, body.sign)}${retro}).`,
        it: `${bodyName(locale, body.name)} è ${ASPECT_NAME.it[aspect]} (${localSign(locale, body.sign)}${retro}).`,
      }[locale]);
    }
    const moonDays = moonBySign.get(id) ?? [];
    const moonLine = moonDays.length
      ? {
          fr: `La Lune traverse ${name} : ${moonDays.join(', ')}.`,
          en: `The Moon crosses ${name}: ${moonDays.join(', ')}.`,
          es: `La Luna atraviesa ${name}: ${moonDays.join(', ')}.`,
          de: `Der Mond durchquert ${name}: ${moonDays.join(', ')}.`,
          it: `La Luna attraversa ${name}: ${moonDays.join(', ')}.`,
        }[locale]
      : {
          fr: `La Lune ne fait que traverser d’autres signes cette semaine, pas ${name}.`,
          en: `The Moon only crosses other signs this week, not ${name}.`,
          es: `La Luna solo atraviesa otros signos esta semana, no ${name}.`,
          de: `Der Mond durchquert diese Woche nur andere Zeichen, nicht ${name}.`,
          it: `La Luna questa settimana attraversa solo altri segni, non ${name}.`,
        }[locale];
    const ingressHere = sky.ingresses.filter((item) => signByFrench(item.to) === id && item.body !== 'Lune');
    const ingressText = ingressHere.map((item) => ({
      fr: `${bodyName(locale, item.body)} entre dans ${name} autour du ${formatDay(locale, item.at)}.`,
      en: `${bodyName(locale, item.body)} enters ${name} around ${formatDay(locale, item.at)}.`,
      es: `${bodyName(locale, item.body)} entra en ${name} alrededor del ${formatDay(locale, item.at)}.`,
      de: `${bodyName(locale, item.body)} tritt um den ${formatDay(locale, item.at)} in ${name} ein.`,
      it: `${bodyName(locale, item.body)} entra in ${name} intorno al ${formatDay(locale, item.at)}.`,
    }[locale]));
    return {
      id,
      slug: SIGNS[id].slugs[locale],
      h2: name,
      paragraphs: [moonLine, ...mentions.slice(0, 5), ...ingressText],
    };
  });

  const prose = [COPY.entertainment[locale], ...skyParagraphs, ...sections.flatMap((section) => section.paragraphs)].join(' ');
  return {
    locale,
    path: weekPath(locale),
    title,
    description: description.length > 160 ? `${description.slice(0, 159)}…` : description,
    h1: COPY.h1[locale],
    keywords: [COPY.keyword[locale], 'Callastral'],
    alternates: weekAlternates(),
    entertainment: COPY.entertainment[locale],
    method,
    skyParagraphs,
    sections,
    prose,
  };
}
