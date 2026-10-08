import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { bookPath } from '../lib/book-path.ts';
import {
  ASCENDANT_CTA,
  ASCENDANT_DESCRIPTION,
  ASCENDANT_FAQS,
  ASCENDANT_H1,
  ASCENDANT_KEYWORD,
  ASCENDANT_PATH,
  ASCENDANT_SIGNS,
  ASCENDANT_TITLE,
  ascendantJsonLd,
  consultChoice,
  signProfile,
} from '../lib/ascendant-tool.ts';

const FORBIDDEN = ['AggregateRating', 'aggregateRating', 'reviewCount', 'ratingValue', '"@type":"Person"', '"@type": "Person"'];

test('mot-clé, title, meta et H1', () => {
  assert.equal(ASCENDANT_KEYWORD, 'calcul ascendant gratuit');
  assert.equal(ASCENDANT_PATH, '/fr/calcul-ascendant-gratuit');
  assert.equal(ASCENDANT_H1.toLowerCase(), ASCENDANT_KEYWORD);
  assert.match(ASCENDANT_TITLE.toLowerCase(), /calcul ascendant gratuit/);
  assert.match(ASCENDANT_DESCRIPTION.toLowerCase(), /calcul ascendant gratuit/);
  assert.ok(ASCENDANT_DESCRIPTION.length <= 160, `meta ${ASCENDANT_DESCRIPTION.length}`);
  assert.ok(ASCENDANT_DESCRIPTION.length >= 70);
  assert.match(ASCENDANT_CTA, /conseillère IA Callastral/);
});

test('JSON-LD : FAQ, application gratuite, fil d’Ariane, sans avis ni Person', () => {
  const data = ascendantJsonLd('https://callastral.com');
  const graph = data['@graph'] as Array<Record<string, unknown>>;
  assert.equal(data['@context'], 'https://schema.org');
  assert.equal(graph.length, 3);

  const breadcrumb = graph.find((node) => node['@type'] === 'BreadcrumbList');
  const app = graph.find((node) => node['@type'] === 'WebApplication');
  const faq = graph.find((node) => node['@type'] === 'FAQPage');
  assert.ok(breadcrumb && app && faq);

  const crumbs = breadcrumb.itemListElement as Array<Record<string, unknown>>;
  assert.equal(crumbs.length, 2);
  assert.equal(crumbs[0].position, 1);
  assert.equal(crumbs[0].name, 'Accueil');
  assert.equal(crumbs[0].item, 'https://callastral.com/fr');
  assert.equal(crumbs[1].name, ASCENDANT_H1);
  assert.equal(crumbs[1].item, 'https://callastral.com/fr/calcul-ascendant-gratuit');

  assert.equal(app.name, ASCENDANT_H1);
  assert.equal(app.isAccessibleForFree, true);
  const offer = app.offers as Record<string, unknown>;
  assert.equal(offer['@type'], 'Offer');
  assert.equal(offer.price, '0');
  assert.equal(offer.priceCurrency, 'EUR');

  const questions = faq.mainEntity as Array<Record<string, unknown>>;
  assert.ok(questions.length >= 5 && questions.length <= 7);
  assert.equal(questions.length, ASCENDANT_FAQS.length);
  for (const question of questions) {
    assert.equal(question['@type'], 'Question');
    assert.equal(typeof question.name, 'string');
    assert.ok((question.name as string).length > 10);
    const answer = question.acceptedAnswer as Record<string, unknown>;
    assert.equal(answer['@type'], 'Answer');
    assert.ok((answer.text as string).length > 40);
  }

  const serialized = JSON.stringify(data);
  for (const token of FORBIDDEN) {
    assert.equal(serialized.includes(token), false, token);
  }
});

test('douze lectures et un seul CTA produit dans la page', () => {
  assert.equal(ASCENDANT_SIGNS.length, 12);
  for (const sign of ASCENDANT_SIGNS) {
    const profile = signProfile(sign);
    assert.equal(profile.sign, sign);
    assert.ok(profile.element.length > 0);
    assert.ok(profile.reading.length > 40);
  }

  const page = fs.readFileSync(new URL('../app/[locale]/calcul-ascendant-gratuit/page.tsx', import.meta.url), 'utf8');
  const calculator = fs.readFileSync(new URL('../components/AscendantCalculator.tsx', import.meta.url), 'utf8');
  const route = fs.readFileSync(new URL('../app/api/ascendant/route.ts', import.meta.url), 'utf8');
  assert.equal((page.match(/<h1[\s>]/g) ?? []).length, 1);
  assert.equal((page.match(/btn-primary/g) ?? []).length, 1);
  assert.equal(page.includes('data-funnel="book"'), true);
  assert.equal(calculator.includes('btn-primary'), false);
  assert.equal(calculator.includes('sessionStorage'), false);
  assert.equal(calculator.includes('localStorage'), false);
  assert.equal(/natal-store|loadOrComputeChart/.test(route), false);
  assert.equal(route.includes('Astrology-API'), false);
  assert.equal(route.includes('astrology-api'), false);
  assert.equal(page.includes('AggregateRating'), false);
});

test('le CTA vise la réservation d’une conseillère, sinon sa fiche', () => {
  const href = consultChoice([
    {
      id: 'man',
      slug: 'marc',
      gender: 'homme',
      languages: ['fr'],
      immediateSlotId: 'slot-m',
      immediateStartsAt: '2026-10-08T18:00:00.000Z',
    },
    {
      id: 'woman',
      slug: 'lea',
      gender: 'femme',
      languages: ['fr'],
      immediateSlotId: 'slot-w',
      immediateStartsAt: '2026-10-08T18:05:00.000Z',
    },
  ]);
  assert.equal(href.gender, 'femme');
  assert.equal(href.href, bookPath('slot-w', '2026-10-08T18:05:00.000Z', 'woman'));

  const profile = consultChoice([
    {
      id: 'woman',
      slug: 'lea',
      gender: 'femme',
      languages: ['fr'],
      immediateSlotId: null,
      immediateStartsAt: null,
    },
  ]);
  assert.equal(profile.href, '/fr/astrologue/lea');
  assert.equal(profile.gender, 'femme');

  const manOnly = consultChoice([
    {
      id: 'man',
      slug: 'marc',
      gender: 'homme',
      languages: ['fr'],
      immediateSlotId: null,
      immediateStartsAt: null,
    },
  ]);
  assert.equal(manOnly.href, '/fr/astrologue/marc');
  assert.equal(manOnly.gender, 'homme');
  assert.deepEqual(consultChoice([]), { href: '/fr#annuaire', gender: 'femme' });
});
