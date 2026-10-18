import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {
  COUPLE_CTA,
  PUBLIC_COUPLE_KEYS,
  coupleMeta,
  couplePath,
  coupleShareBookPath,
  coupleSharePath,
  personInitial,
  readCouple,
  toPublicCoupleResult,
  type SynastrySigns,
} from '../lib/couple-compat.ts';
import { fallbackMemory, memoryEnabled, memoryPromptBlock, parseMemoryDraft, recapBookPath, recapMail } from '../lib/call-memory-text.ts';
import {
  consentGiven,
  dailyIssue,
  issueKey,
  morningBookPath,
  morningMail,
  parisDay,
  personalLine,
  readHoroscopeToken,
  signHoroscopeToken,
  subscriberSource,
} from '../lib/morning-horoscope.ts';
import { privacyDocument } from '../lib/privacy-copy.ts';
import { LOCALES, type Locale } from '../lib/seo.ts';
import type { LegalIdentity } from '../lib/legal-entity.ts';

const EMPTY: LegalIdentity = {
  entity: '',
  id: '',
  address: '',
  email: '',
  director: '',
  entityMissing: true,
  idMissing: true,
  addressMissing: true,
  emailMissing: true,
  directorMissing: true,
};

const FIRE: SynastrySigns = { sun: 'belier', moon: 'belier', venus: 'belier', mars: 'belier', rising: 'lion' };
const TRINE: SynastrySigns = { sun: 'lion', moon: 'lion', venus: 'lion', mars: 'lion', rising: 'sagittaire' };

test('compatibilité : score stable, cinq locales, partage sans naissance', () => {
  assert.equal(couplePath('fr'), '/fr/compatibilite-couple');
  assert.equal(couplePath('en'), '/en/couple-compatibility');
  assert.equal(couplePath('es'), '/es/compatibilidad-pareja');
  assert.equal(couplePath('de'), '/de/partner-kompatibilitaet');
  assert.equal(couplePath('it'), '/it/compatibilita-coppia');
  const first = readCouple('fr', FIRE, TRINE);
  const second = readCouple('fr', FIRE, TRINE);
  assert.deepEqual(first, second);
  assert.ok(first.score >= 0 && first.score <= 100);
  assert.equal(first.strengths.length, 2);
  assert.equal(first.tensions.length, 2);
  for (const locale of LOCALES) {
    const reading = readCouple(locale, FIRE, TRINE);
    assert.equal(reading.strengths.length, 2, locale);
    assert.equal(reading.tensions.length, 2, locale);
    const meta = coupleMeta(locale);
    assert.ok(meta.description.length >= 70 && meta.description.length <= 160, `${locale} ${meta.description.length}`);
    assert.equal(COUPLE_CTA.fr, 'Approfondir avec un conseiller');
  }
  const pub = toPublicCoupleResult({
    id: '11111111-1111-4111-8111-111111111111',
    locale: 'fr',
    score: first.score,
    strengths: first.strengths,
    tensions: first.tensions,
    initialA: personInitial('Camille', 'A'),
    initialB: personInitial('', 'B'),
    labelA: 'Camille',
    labelB: null,
  });
  assert.equal(pub.initialA, 'C');
  assert.equal(pub.initialB, 'B');
  assert.equal(pub.sharePath, coupleSharePath('fr', pub.id));
  assert.deepEqual(Object.keys(pub).sort(), [...PUBLIC_COUPLE_KEYS].sort());
  const dumped = JSON.stringify(pub);
  assert.equal(dumped.includes('1990'), false);
  assert.equal(dumped.toLowerCase().includes('paris'), false);
  const book = coupleShareBookPath();
  assert.match(book, /offer=decouverte/);
  assert.match(book, /utm_source=couple/);
  assert.match(book, /utm_medium=share/);
  assert.match(book, /utm_campaign=compatibilite/);
});

test('mémoire : trois résumés, reprise, e-mail sans rareté', () => {
  assert.equal(memoryEnabled(undefined), true);
  assert.equal(memoryEnabled(true), true);
  assert.equal(memoryEnabled(false), false);
  const note = (summary: string, n: number) => ({
    id: String(n),
    bookingId: null,
    createdAt: `2026-10-0${n}T08:00:00.000Z`,
    topics: ['travail'],
    questions: ['Et le travail ?'],
    advice: ['Reprendre demain'],
    mood: 'posé',
    summary,
  });
  const block = memoryPromptBlock('fr', [note('alpha', 1), note('beta', 2), note('gamma', 3), note('delta', 4)]);
  assert.match(block, /la dernière fois tu me parlais de/);
  assert.match(block, /alpha/);
  assert.match(block, /gamma/);
  assert.equal(block.includes('delta'), false);
  assert.equal(memoryPromptBlock('fr', []), '');
  const parsed = parseMemoryDraft('note {"topics":["lune"],"questions":["Pourquoi ?"],"advice":["attendre"],"mood":"calme","summary":"On a parlé de la lune."} fin');
  assert.equal(parsed?.summary, 'On a parlé de la lune.');
  const fallback = fallbackMemory([
    { role: 'user', text: 'J’ai peur pour le travail ?' },
    { role: 'advisor', text: 'Regarde la semaine qui vient.' },
  ]);
  assert.equal(fallback.mood, 'inquiet');
  assert.match(fallback.questions[0], /\?/);
  const mail = recapMail({
    locale: 'fr',
    name: 'Ada <script>',
    summary: 'On a parlé du travail.',
    topics: ['travail'],
    transits: ['La Lune traverse le Cancer.'],
    bookUrl: `https://callastral.com${recapBookPath()}`,
    privacyUrl: 'https://callastral.com/fr/confidentialite',
  });
  assert.match(mail.html, /1,99/);
  assert.match(mail.html, /offer=decouverte/);
  assert.match(mail.html, /utm_campaign=memoire/);
  assert.match(mail.html, /Ada &lt;script&gt;/);
  assert.equal(/places? restantes|dernières places|only \d+ left/i.test(mail.html), false);
});

test('horoscope : un texte par signe, consentement, désinscription', () => {
  const now = new Date('2026-10-17T06:00:00.000Z');
  assert.equal(parisDay(now), '2026-10-17');
  const a = dailyIssue('fr', 'belier', now);
  const b = dailyIssue('fr', 'belier', now);
  assert.deepEqual(a, b);
  assert.equal(issueKey(a.day, 'fr', 'belier'), '2026-10-17:fr:belier');
  assert.notEqual(issueKey(a.day, 'fr', 'belier'), issueKey(a.day, 'en', 'belier'));
  for (const locale of LOCALES) {
    const issue = dailyIssue(locale, 'lion', now);
    assert.ok(issue.paragraphs.length >= 2, locale);
    assert.match(issue.paragraphs.join(' '), /Divertissement|Entertainment|Entretenimiento|Unterhaltung|Intrattenimento/);
  }
  const personal = personalLine('fr', '1990-04-04', now);
  assert.match(personal || '', /Soleil natal/);
  assert.equal(personalLine('fr', null, now), null);
  assert.equal(consentGiven(true), true);
  assert.equal(consentGiven(false), false);
  assert.equal(consentGiven('true'), false);
  const source = subscriberSource({ utmSource: null, utmMedium: null, utmCampaign: null, placement: 'home' });
  assert.equal(source.utm_source, 'horoscope');
  assert.equal(source.utm_medium, 'home');
  const secret = 'test-secret';
  const id = '22222222-2222-4222-8222-222222222222';
  const token = signHoroscopeToken(id, 'unsubscribe', secret);
  assert.equal(readHoroscopeToken(token, 'unsubscribe', secret), id);
  assert.equal(readHoroscopeToken(token, 'confirm', secret), null);
  const mail = morningMail({
    locale: 'fr',
    subject: a.subject,
    paragraphs: a.paragraphs,
    personal,
    bookUrl: `https://callastral.com${morningBookPath()}`,
    unsubscribeUrl: `https://callastral.com/api/horoscope/unsubscribe?token=${token}&lang=fr`,
    privacyUrl: 'https://callastral.com/fr/confidentialite',
  });
  assert.match(mail.html, /1,99/);
  assert.match(mail.html, /offer=decouverte/);
  assert.match(mail.html, /utm_medium=email/);
  assert.match(mail.html, /Se désinscrire/);
  assert.match(mail.headers['List-Unsubscribe'], /horoscope\/unsubscribe/);
  assert.equal(mail.headers['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click');
  assert.equal(mail.html.includes('1990-04-04'), false);
});

test('confidentialité : mémoire et horoscope dans les cinq langues', () => {
  const expected: Record<Locale, string[]> = {
    fr: ['Mémoire du conseiller', 'horoscope du matin'],
    en: ['Advisor memory', 'morning horoscope'],
    es: ['Memoria del consejero', 'horóscopo de la mañana'],
    de: ['Beratergedächtnis', 'Morgenhoroskop'],
    it: ['Memoria del consulente', 'oroscopo del mattino'],
  };
  for (const locale of LOCALES) {
    const text = JSON.stringify(privacyDocument(locale, EMPTY));
    for (const token of expected[locale]) assert.ok(text.includes(token), `${locale} ${token}`);
    assert.ok(privacyDocument(locale, EMPTY).description.length <= 160);
  }
});

test('le cron de 8 h envoie l’horoscope, sans cron supplémentaire', () => {
  const vercel = fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8');
  const crons = JSON.parse(vercel).crons as Array<{ path: string; schedule: string }>;
  assert.equal(crons.some((cron) => cron.path === '/api/cron/weekly-renewal' && cron.schedule === '0 8 * * *'), true);
  assert.equal(crons.some((cron) => cron.path.includes('horoscope')), false);
  const route = fs.readFileSync(new URL('../app/api/cron/weekly-renewal/route.ts', import.meta.url), 'utf8');
  assert.match(route, /sendMorningHoroscopes/);
  const sql = fs.readFileSync(new URL('../supabase/migrations/20261017120000_couple_memory_horoscope.sql', import.meta.url), 'utf8');
  assert.match(sql, /horoscope_subscribers/);
  assert.match(sql, /subscriber_paying/);
  assert.match(sql, /ENABLE ROW LEVEL SECURITY/);
  assert.match(sql, /advisor_memory_enabled boolean NOT NULL DEFAULT true/);
  assert.equal(/birth_date|birth_time|birth_place/.test(sql.split('couple_results')[1].split('CREATE TABLE')[0]), false);
});
