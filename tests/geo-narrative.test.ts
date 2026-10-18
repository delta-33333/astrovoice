import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { aboutCopy } from '../lib/about.ts';
import { HOME_TITLE } from '../lib/home-offer.ts';
import { buildLlmsText } from '../lib/llms-document.ts';
import { formatMoney } from '../lib/money.ts';
import { MEMORY_FAQ } from '../lib/home-offer.ts';
import { homeFaqs } from '../lib/seo.ts';
import { tokenize } from '../lib/thin-content.ts';
import { firstWeekMinor, WEEKLY_PLANS } from '../lib/weekly.ts';

const ROOT = path.resolve(import.meta.dirname, '..');

test('les titres d’accueil nomment l’IA dans les cinq langues', () => {
  assert.match(HOME_TITLE.fr, /IA/);
  assert.match(HOME_TITLE.en, /AI/);
  assert.match(HOME_TITLE.es, /IA/);
  assert.match(HOME_TITLE.de, /KI/);
  assert.match(HOME_TITLE.it, /IA/);
  for (const file of ['app/page.tsx', 'app/[locale]/page.tsx']) {
    const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
    assert.match(source, /HOME_TITLE/);
    assert.match(source, /data-primary-cta="trial"/);
  }
});

test('llms.txt reprend les formules, la mémoire, l’appel gratuit et Call Astro', () => {
  const text = buildLlmsText('https://callastral.com', {} as NodeJS.ProcessEnv);
  const first = formatMoney(firstWeekMinor('decouverte', 'eur'), 'eur', 'fr').replace(/[\u00a0\u202f]/g, ' ');
  const full = formatMoney(WEEKLY_PLANS.decouverte.amounts.eur, 'eur', 'fr').replace(/[\u00a0\u202f]/g, ' ');
  assert.ok(text.includes(first));
  assert.ok(text.includes(full));
  assert.match(text, /mémoire/i);
  assert.match(text, /Call Astro|callastro/i);
  assert.equal(text.includes('0,99'), false);
  assert.match(MEMORY_FAQ.fr.answer, /^Oui/);
  assert.match(homeFaqs('es').map((item) => item.answer).join(' '), /^[\s\S]*Sí/);
  assert.match(homeFaqs('de').at(-1)?.answer ?? '', /^Ja/);
  assert.match(homeFaqs('it').at(-1)?.answer ?? '', /^Sì/);
});

test('la page à propos dépasse 400 mots et chaque partie nomme Callastral', () => {
  const about = aboutCopy('fr');
  const text = [about.h1, about.description, ...about.paragraphs, about.labelLine, about.spokenLine].join(' ');
  assert.ok(tokenize(text).length >= 400);
  assert.ok(tokenize(text).length <= 600);
  for (const section of about.sections) {
    assert.match(section.paragraphs[0], /Callastral/);
  }
  assert.equal(text.includes('astrology-api'), false);
});

test('aucune copie publique ne cite astrology-api', () => {
  const hits: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.(ts|tsx)$/.test(entry.name)) continue;
      const text = fs.readFileSync(full, 'utf8');
      if (text.includes('astrology-api')) hits.push(path.relative(ROOT, full));
    }
  };
  for (const folder of ['app', 'components', 'lib']) walk(path.join(ROOT, folder));
  assert.deepEqual(hits, []);
});
