import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { getCopy, signProfile } from '../lib/ascendant-copy.ts';
import {
  ASCENDANT_PATHS,
  ASCENDANT_SIGNS,
  ascendantJsonLd,
  ascendantPath,
  consultChoice,
  type ToolLocale,
} from '../lib/ascendant-tool.ts';
import { bookPath } from '../lib/book-path.ts';

const FORBIDDEN = ['AggregateRating', 'aggregateRating', 'reviewCount', 'ratingValue', '"@type":"Person"', '"@type": "Person"'];

const LOCALES: ToolLocale[] = ['fr', 'en', 'es', 'de', 'it'];

test('chaque langue a un mot-clé, un slug, un title, une meta et un H1', () => {
  assert.deepEqual(ASCENDANT_PATHS, {
    fr: '/fr/calcul-ascendant-gratuit',
    en: '/en/rising-sign-calculator',
    es: '/es/calcular-ascendente',
    de: '/de/aszendent-berechnen',
    it: '/it/calcolo-ascendente',
  });

  for (const locale of LOCALES) {
    const copy = getCopy(locale);
    assert.equal(ascendantPath(locale), ASCENDANT_PATHS[locale]);
    assert.equal(copy.h1.toLowerCase().includes(copy.keyword), true, locale);
    assert.equal(copy.title.toLowerCase().includes(copy.keyword), true, `${locale} title`);
    assert.equal(copy.description.toLowerCase().includes(copy.keyword), true, `${locale} meta`);
    assert.ok(copy.description.length <= 160, `${locale} meta ${copy.description.length}`);
    assert.ok(copy.description.length >= 70, `${locale} meta courte`);
    assert.ok(copy.faqs.length >= 5 && copy.faqs.length <= 7, locale);
    assert.match(copy.ctaFemme, /IA|AI|KI/);
    assert.equal(copy.method.length, 3);
  }
});

test('JSON-LD par langue : FAQ, application gratuite, fil d’Ariane, sans avis ni Person', () => {
  for (const locale of LOCALES) {
    const copy = getCopy(locale);
    const path = ascendantPath(locale);
    const data = ascendantJsonLd({
      origin: 'https://callastral.com',
      locale,
      path,
      h1: copy.h1,
      description: copy.description,
      homeLabel: copy.home,
      faqs: copy.faqs,
    });
    const graph = data['@graph'] as Array<Record<string, unknown>>;
    assert.equal(data['@context'], 'https://schema.org');
    assert.equal(graph.length, 3);

    const breadcrumb = graph.find((node) => node['@type'] === 'BreadcrumbList');
    const app = graph.find((node) => node['@type'] === 'WebApplication');
    const faq = graph.find((node) => node['@type'] === 'FAQPage');
    assert.ok(breadcrumb && app && faq, locale);

    const crumbs = breadcrumb.itemListElement as Array<Record<string, unknown>>;
    assert.equal(crumbs[0].name, copy.home);
    assert.equal(crumbs[0].item, `https://callastral.com/${locale}`);
    assert.equal(crumbs[1].name, copy.h1);
    assert.equal(crumbs[1].item, `https://callastral.com${path}`);

    assert.equal(app.name, copy.h1);
    assert.equal(app.isAccessibleForFree, true);
    assert.equal(app.inLanguage, locale === 'fr' ? 'fr-FR' : locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : locale === 'de' ? 'de-DE' : 'it-IT');
    const offer = app.offers as Record<string, unknown>;
    assert.equal(offer.price, '0');
    assert.equal(offer.priceCurrency, locale === 'en' ? 'USD' : 'EUR');

    const questions = faq.mainEntity as Array<Record<string, unknown>>;
    assert.equal(questions.length, copy.faqs.length);
    for (const question of questions) {
      assert.equal(question['@type'], 'Question');
      const answer = question.acceptedAnswer as Record<string, unknown>;
      assert.ok((answer.text as string).length > 40);
    }

    const serialized = JSON.stringify(data);
    for (const token of FORBIDDEN) {
      assert.equal(serialized.includes(token), false, `${locale} ${token}`);
    }
  }
});

test('douze lectures, un seul CTA, et redirection vers le slug de la langue', () => {
  assert.equal(ASCENDANT_SIGNS.length, 12);
  for (const locale of LOCALES) {
    const copy = getCopy(locale);
    assert.equal(Object.keys(copy.signs).length, 12);
    for (const sign of ASCENDANT_SIGNS) {
      const profile = copy.signs[sign];
      assert.ok(profile.name.length > 0, `${locale} ${sign}`);
      assert.ok(profile.reading.length > 40, `${locale} ${sign}`);
    }
  }
  const french = signProfile('Balance');
  assert.equal(french.sign, 'Balance');
  assert.ok(french.reading.length > 40);

  const screen = fs.readFileSync(new URL('../components/AscendantToolScreen.tsx', import.meta.url), 'utf8');
  const calculator = fs.readFileSync(new URL('../components/AscendantCalculator.tsx', import.meta.url), 'utf8');
  const route = fs.readFileSync(new URL('../app/api/ascendant/route.ts', import.meta.url), 'utf8');
  const frPage = fs.readFileSync(new URL('../app/[locale]/calcul-ascendant-gratuit/page.tsx', import.meta.url), 'utf8');
  const sitemap = fs.readFileSync(new URL('../app/sitemap.ts', import.meta.url), 'utf8');

  assert.equal((screen.match(/<h1[\s>]/g) ?? []).length, 1);
  assert.equal((screen.match(/btn-primary/g) ?? []).length, 1);
  assert.equal(screen.includes('data-funnel="book"'), true);
  assert.equal(screen.includes('hreflangAlternates(ascendantPath)'), true);
  assert.equal(screen.includes('permanentRedirect(ascendantPath(locale))'), true);
  assert.equal(screen.includes('permanentRedirect(ASCENDANT_PATH)'), false);
  assert.equal(frPage.includes("locale !== 'fr'"), false);
  assert.equal(calculator.includes('btn-primary'), false);
  assert.equal(calculator.includes('sessionStorage'), false);
  assert.equal(calculator.includes('localStorage'), false);
  assert.equal(/natal-store|loadOrComputeChart/.test(route), false);
  assert.equal(route.includes('Astrology-API'), false);
  assert.equal(route.includes('astrology-api'), false);
  assert.equal(screen.includes('AggregateRating'), false);
  assert.equal(sitemap.includes('ascendantPath(locale)'), true);
  for (const path of Object.values(ASCENDANT_PATHS)) {
    const page = path.split('/').pop();
    assert.ok(fs.existsSync(new URL(`../app/[locale]/${page}/page.tsx`, import.meta.url)), page);
  }
});

test('le CTA vise la réservation d’une conseillère de la langue, sinon sa fiche', () => {
  const href = consultChoice('fr', [
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

  const profile = consultChoice('fr', [
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

  const manOnly = consultChoice('fr', [
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
  assert.deepEqual(consultChoice('fr', []), { href: '/fr#annuaire', gender: 'femme' });

  const english = consultChoice('en', [
    {
      id: 'woman',
      slug: 'lea',
      gender: 'femme',
      languages: ['en'],
      immediateSlotId: null,
      immediateStartsAt: null,
    },
  ]);
  assert.equal(english.href, '/en/astrologer/lea');

  const spanishFallback = consultChoice('es', [
    {
      id: 'woman',
      slug: 'lea',
      gender: 'femme',
      languages: ['fr'],
      immediateSlotId: 'slot-w',
      immediateStartsAt: '2026-10-08T18:05:00.000Z',
    },
  ]);
  assert.equal(spanishFallback.href, '/es');
});
