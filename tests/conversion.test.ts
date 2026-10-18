import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { isAdminPath, isBotUserAgent, shouldCaptureVisit, utmFrom, encodeFirstTouch, decodeFirstTouch } from '../lib/attribution.ts';
import {
  FUNNEL_AFTER,
  FUNNEL_BEFORE,
  chartReadingCta,
  discoveryHeadline,
  readBirthParams,
  resultCheckoutPath,
} from '../lib/book-funnel.ts';
import {
  CHECKOUT_REMINDER_DELAY_MS,
  checkoutReminderMail,
  readOptOut,
  reminderAt,
  signOptOut,
} from '../lib/checkout-reminder-copy.ts';
import { homePlansCopy } from '../lib/home-plans-copy.ts';
import type { AdvisorLang } from '../lib/money.ts';
import { renewalTerms } from '../lib/renewal-copy.ts';

const LOCALES: AdvisorLang[] = ['fr', 'en', 'es', 'de', 'it'];
const CHROME = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1';

test('la première visite retient source, référent et page, hors admin et robots', () => {
  const utm = utmFrom(new URLSearchParams('utm_source=google&utm_medium=organic&utm_campaign=ascendant'));
  assert.equal(utm.utm_source, 'google');
  assert.equal(utm.utm_medium, 'organic');
  assert.equal(utm.utm_campaign, 'ascendant');
  const raw = encodeFirstTouch({
    ...utm,
    referrer: 'https://www.google.com/search',
    landing: '/fr/calcul-ascendant-gratuit',
    at: '2026-10-13T10:00:00.000Z',
  });
  const touch = decodeFirstTouch(raw);
  assert.equal(touch?.utm_source, 'google');
  assert.equal(touch?.referrer, 'https://www.google.com/search');
  assert.equal(touch?.landing, '/fr/calcul-ascendant-gratuit');
  assert.equal(isAdminPath('/admin'), true);
  assert.equal(isAdminPath('/admin/acquisition'), true);
  assert.equal(isAdminPath('/book'), false);
  assert.equal(shouldCaptureVisit('/admin', CHROME), false);
  assert.equal(shouldCaptureVisit('/fr/calcul-ascendant-gratuit', 'Googlebot/2.1'), false);
  assert.equal(isBotUserAgent('curl/8.0'), true);
  assert.equal(shouldCaptureVisit('/book', CHROME), true);
});

test('le parcours /book tient en deux étapes et affiche Découverte', () => {
  assert.ok(FUNNEL_BEFORE.length > FUNNEL_AFTER.length);
  assert.ok(FUNNEL_AFTER.length <= 2);
  assert.equal(discoveryHeadline('fr', 'eur'), '1,99 € la 1re semaine');
  assert.equal(
    chartReadingCta('fr', 'eur'),
    'Fais lire ton thème complet en 10 min — 1,99 € la 1re semaine',
  );
  for (const locale of LOCALES) {
    const cta = chartReadingCta(locale, locale === 'en' ? 'usd' : 'eur');
    assert.match(cta, /10\s*min/i);
    assert.match(cta, locale === 'en' ? /\$2\.49/ : /1,99 €/);
  }
  const page = fs.readFileSync(new URL('../components/BookCheckout.tsx', import.meta.url), 'utf8');
  const offerAt = page.indexOf('data-offer="decouverte"');
  const accountAt = page.indexOf('copy.accountTitle');
  assert.ok(offerAt > -1 && accountAt > offerAt);
  assert.equal(page.includes('BOOKING_DURATIONS'), false);
  const sheet = fs.readFileSync(new URL('../components/PaymentSheet.tsx', import.meta.url), 'utf8');
  assert.equal(sheet.includes('ExpressCheckoutElement'), true);
  assert.equal(sheet.includes("applePay: 'auto'"), true);
  assert.equal(sheet.includes("googlePay: 'auto'"), true);
});

test('le résultat d’ascendant ouvre le paiement avec la naissance', () => {
  const href = resultCheckoutPath({
    consultHref: '/book?slot=slot-w&at=2026-10-08T18%3A05%3A00.000Z&advisor=woman',
    date: '1990-01-02',
    time: '08:30',
    place: 'Lyon, France',
  });
  const params = new URL(href, 'https://callastral.com').searchParams;
  assert.equal(params.get('slot'), 'slot-w');
  assert.equal(params.get('advisor'), 'woman');
  assert.equal(params.get('offer'), 'decouverte');
  const birth = readBirthParams(params);
  assert.deepEqual(birth, { date: '1990-01-02', time: '08:30', place: 'Lyon, France' });

  const plain = resultCheckoutPath({
    consultHref: '/fr/astrologue/lea',
    date: '1990-01-02',
    time: '08:30',
    place: 'Lyon',
  });
  assert.equal(plain.startsWith('/book?'), true);
  assert.equal(new URL(plain, 'https://callastral.com').searchParams.get('place'), 'Lyon');
  for (const locale of LOCALES) {
    assert.equal(chartReadingCta(locale, 'eur').length > 20, true);
  }
});

test('un seul rappel une heure plus tard, avec désinscription, sans urgence inventée', () => {
  const from = new Date('2026-10-13T10:00:00.000Z');
  assert.equal(reminderAt(from).toISOString(), '2026-10-13T11:00:00.000Z');
  assert.equal(CHECKOUT_REMINDER_DELAY_MS, 60 * 60 * 1000);
  const secret = 'test-secret-at-least-16';
  const token = signOptOut('11111111-1111-4111-8111-111111111111', secret);
  assert.equal(readOptOut(token, secret), '11111111-1111-4111-8111-111111111111');
  assert.equal(readOptOut(`${token}x`, secret), null);
  for (const locale of LOCALES) {
    const mail = checkoutReminderMail({
      locale,
      name: 'Ada',
      offer: discoveryHeadline(locale, locale === 'en' ? 'usd' : 'eur'),
      renewal: 'renewal',
      resumeUrl: 'https://callastral.com/book?offer=decouverte',
      unsubscribeUrl: 'https://callastral.com/api/email/unsubscribe?token=abc',
    });
    assert.match(mail.html, /unsubscribe|baja|abbestellen|désinscrire|Disiscriviti/i);
    assert.equal(/compte à rebours|plus que \d|expire dans|dernières places|only \d left/i.test(mail.html), false);
    assert.match(mail.html, /IA|AI|KI/);
    assert.equal(mail.html.includes('/fr/essai'), false);
  }
  const withTrial = checkoutReminderMail({
    locale: 'fr',
    name: 'Ada',
    offer: discoveryHeadline('fr', 'eur'),
    renewal: 'renewal',
    resumeUrl: 'https://callastral.com/book?offer=decouverte',
    unsubscribeUrl: 'https://callastral.com/api/email/unsubscribe?token=abc',
    trialUrl: 'https://callastral.com/fr/essai?utm_source=checkout_abandon',
  });
  assert.match(withTrial.html, /\/fr\/essai/);
  assert.match(withTrial.html, /désinscrire/i);
  const migration = fs.readFileSync(
    new URL('../supabase/migrations/20261013143000_acquisition_checkout.sql', import.meta.url),
    'utf8',
  );
  assert.match(migration, /checkout_attributions/);
  assert.match(migration, /checkout_reminders/);
  assert.match(migration, /email_checkout_opt_out/);
  assert.match(migration, /\/admin%/);
  assert.match(migration, /ne lance pas cette migration/);
  assert.equal(migration.toLowerCase().includes('apply_migration'), false);
});

test('les formules précèdent les conseillers, Essentiel reste mis en avant', () => {
  const root = fs.readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
  const localeHome = fs.readFileSync(new URL('../app/[locale]/page.tsx', import.meta.url), 'utf8');
  const plans = fs.readFileSync(new URL('../components/HomePlans.tsx', import.meta.url), 'utf8');
  assert.ok(root.indexOf('<HomePlans') < root.indexOf('<AdvisorDirectory'));
  const hero = root.slice(root.indexOf('return ('));
  assert.ok(hero.indexOf('data-primary-cta="trial"') < hero.indexOf('{HOME_DISCLOSURE}'));
  assert.equal((root.match(/data-primary-cta="trial"/g) ?? []).length, 1);
  assert.match(root, /href="\/book\?offer=decouverte"/);
  assert.ok(root.indexOf('Comment ça fonctionne') < root.indexOf('<AdvisorDirectory'));
  assert.ok(localeHome.indexOf('<HomePlans') < localeHome.indexOf('ordered.map'));
  assert.match(plans, /grid-cols-1/);
  assert.match(plans, /md:grid-cols-3/);
  assert.match(plans, /id === 'essentiel'/);
  assert.match(plans, /data-offer="decouverte"/);
  assert.equal(discoveryHeadline('fr', 'eur'), '1,99 € la 1re semaine');
  const renewal = renewalTerms('decouverte', 'eur', 'fr', new Date('2026-10-13T09:00:00Z'));
  assert.match(renewal.sentence, /5,90/);
  assert.match(renewal.sentence, /sans engagement/);
  for (const locale of LOCALES) {
    const copy = homePlansCopy(locale);
    assert.ok(copy.title.length > 2);
    assert.ok(copy.recommended.length > 2);
    assert.match(copy.ai, /IA|AI|KI/);
    assert.equal(/compte à rebours|plus que \d|dernières places|only \d left/i.test(`${copy.lead} ${copy.title}`), false);
  }
});
