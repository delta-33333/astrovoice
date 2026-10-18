import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { analyticsAllowed, parseConsent } from '../lib/consent.ts';
import { birthIssue, honeypotTripped, normalizeEmail, passwordError } from '../lib/form-checks.ts';
import { privacyDocument, privacyPath } from '../lib/privacy-copy.ts';
import { AI_VIDEO_LABEL, PROMO_VIDEOS, VIDEOS_PATH, videoObject, videoSitemapXml } from '../lib/videos.ts';
import type { LegalIdentity } from '../lib/legal-entity.ts';
import type { Locale } from '../lib/seo.ts';

const LOCALES: Locale[] = ['fr', 'en', 'es', 'de', 'it'];

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

test('le consentement n’ouvre la mesure que pour all et custom-on', () => {
  assert.equal(parseConsent('all'), 'all');
  assert.equal(parseConsent('nope'), null);
  assert.equal(analyticsAllowed(null), false);
  assert.equal(analyticsAllowed('essential'), false);
  assert.equal(analyticsAllowed('custom-off'), false);
  assert.equal(analyticsAllowed('all'), true);
  assert.equal(analyticsAllowed('custom-on'), true);
});

test('honeypot, e-mail, mot de passe et naissance', () => {
  assert.equal(honeypotTripped({ cl_hp: 'http://spam.test' }), true);
  assert.equal(honeypotTripped({ cl_hp: '   ' }), false);
  assert.equal(honeypotTripped({}), false);
  assert.equal(normalizeEmail('Ada@Example.com'), 'ada@example.com');
  assert.equal(normalizeEmail('pas-un-email'), null);
  assert.match(passwordError('court') || '', /8/);
  assert.equal(passwordError('motdepasse'), null);
  assert.equal(birthIssue({ name: 'Ada', date: '1990-01-02', time: '08:30', timeUnknown: false, place: 'Lyon' }), null);
  assert.ok(birthIssue({ name: '', date: '1990-01-02', time: '', timeUnknown: true, place: 'Lyon' }));
  assert.ok(birthIssue({ name: 'Ada', date: '1990-13-02', time: '08:30', timeUnknown: false, place: 'Lyon' }));
});

test('politique de confidentialité localisée, sans entité inventée', () => {
  for (const locale of LOCALES) {
    const doc = privacyDocument(locale, EMPTY);
    const text = JSON.stringify(doc);
    assert.equal(privacyPath(locale), `/${locale}/confidentialite`);
    assert.ok(doc.description.length <= 160, `${locale} ${doc.description.length}`);
    assert.ok(doc.description.length >= 70, locale);
    for (const token of ['Stripe', 'Supabase', 'Vercel', 'Resend', 'xAI', 'cl_vid', 'cl_ft']) {
      assert.ok(text.includes(token), `${locale} ${token}`);
    }
    assert.equal(text.includes('à compléter'), false, locale);
    assert.equal(text.includes('LEGAL_ENTITY_NAME'), false, locale);
    assert.equal(text.includes('to be completed'), false, locale);
  }
});

test('huit vidéos, label IA, dates et sitemap vidéo', () => {
  assert.equal(PROMO_VIDEOS.length, 8);
  assert.equal(AI_VIDEO_LABEL, 'Contenu généré par IA');
  assert.equal(VIDEOS_PATH, '/fr/videos');
  const dates = PROMO_VIDEOS.map((video) => video.uploadDate).sort();
  assert.equal(dates[0] >= '2026-10-06' && dates[dates.length - 1] <= '2026-10-10', true);
  for (const video of PROMO_VIDEOS) {
    assert.match(video.description, /IA|généré/);
    assert.ok(video.durationSec >= 20 && video.durationSec <= 30);
    assert.match(video.durationIso, /^PT\d+S$/);
    const node = videoObject('https://callastral.com', video);
    assert.equal(node['@type'], 'VideoObject');
    assert.equal(node.thumbnailUrl, `https://callastral.com${video.poster}`);
    assert.equal(node.contentUrl, `https://callastral.com${video.src}`);
    assert.equal('aggregateRating' in node, false);
  }
  const xml = videoSitemapXml('https://callastral.com');
  assert.match(xml, /xmlns:video=/);
  assert.equal(xml.split('<video:video>').length - 1, 8);
  assert.match(xml, /<loc>https:\/\/callastral.com\/fr\/videos<\/loc>/);
});

test('robots, en-têtes et modules serveur', () => {
  const robots = fs.readFileSync(new URL('../app/robots.ts', import.meta.url), 'utf8');
  assert.match(robots, /\/admin/);
  assert.match(robots, /\/account/);
  assert.match(robots, /\/api/);
  assert.match(robots, /video-sitemap\.xml/);
  const config = fs.readFileSync(new URL('../next.config.ts', import.meta.url), 'utf8');
  for (const header of ['Strict-Transport-Security', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'Content-Security-Policy']) {
    assert.ok(config.includes(header), header);
  }
  assert.match(fs.readFileSync(new URL('../lib/stripe.ts', import.meta.url), 'utf8'), /server-only/);
  assert.match(fs.readFileSync(new URL('../lib/xai.ts', import.meta.url), 'utf8'), /server-only/);
  assert.match(fs.readFileSync(new URL('../lib/supabase.ts', import.meta.url), 'utf8'), /server-only/);
});
