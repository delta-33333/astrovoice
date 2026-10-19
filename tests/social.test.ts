import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { buildLlmsText } from '../lib/llms-document.ts';
import { organizationGraph, siteSameAs } from '../lib/seo.ts';
import {
  OFFICIAL_SOCIAL_PROFILES,
  sameAsUrls,
  socialLinkLabel,
  socialNavLabel,
} from '../lib/social.ts';

const OFFICIAL = [
  'https://www.youtube.com/@Callastral',
  'https://www.tiktok.com/@callastral.com',
  'https://www.instagram.com/callastral_com/',
];

test('les profils officiels sont YouTube, TikTok et Instagram', () => {
  assert.deepEqual(OFFICIAL_SOCIAL_PROFILES.map((profile) => profile.href), OFFICIAL);
  assert.deepEqual(OFFICIAL_SOCIAL_PROFILES.map((profile) => profile.name), ['YouTube', 'TikTok', 'Instagram']);
});

test('sameAs fusionne SAME_AS_URLS et SITE_SAME_AS sans doublon', () => {
  assert.deepEqual(sameAsUrls({} as NodeJS.ProcessEnv), OFFICIAL);
  assert.deepEqual(siteSameAs({} as NodeJS.ProcessEnv), OFFICIAL);
  const merged = siteSameAs({
    SAME_AS_URLS: ` ${OFFICIAL[0]} , https://example.com/a , http://insecure.example `,
    SITE_SAME_AS: 'https://example.com/a, https://example.com/b ',
  });
  assert.deepEqual(merged, [...OFFICIAL, 'https://example.com/a', 'https://example.com/b']);
});

test('le JSON-LD Organization reprend sameAs', () => {
  const graph = organizationGraph('https://callastral.com', {} as NodeJS.ProcessEnv);
  const org = graph.find((node) => node['@type'] === 'Organization');
  assert.deepEqual(org?.sameAs, OFFICIAL);
});

test('llms.txt cite les trois profils', () => {
  const text = buildLlmsText('https://callastral.com', {} as NodeJS.ProcessEnv);
  assert.match(text, /## Profils officiels/);
  for (const url of OFFICIAL) assert.equal(text.includes(url), true, url);
});

test('le pied de page et la page à propos utilisent la constante partagée', () => {
  const footer = fs.readFileSync(new URL('../components/SiteFooter.tsx', import.meta.url), 'utf8');
  const links = fs.readFileSync(new URL('../components/SocialProfiles.tsx', import.meta.url), 'utf8');
  const about = fs.readFileSync(new URL('../components/GeoAboutPage.tsx', import.meta.url), 'utf8');
  const seo = fs.readFileSync(new URL('../lib/seo.ts', import.meta.url), 'utf8');
  assert.match(footer, /SocialProfiles/);
  assert.match(links, /OFFICIAL_SOCIAL_PROFILES/);
  assert.match(links, /rel="me noopener"/);
  assert.match(links, /target="_blank"/);
  assert.match(links, /sr-only/);
  assert.match(about, /sameAsUrls\(\)/);
  assert.equal(about.includes('envList'), false);
  assert.match(seo, /sameAsUrls/);
  for (const locale of ['fr', 'en', 'es', 'de', 'it']) {
    assert.ok(socialNavLabel(locale).length > 0);
    assert.match(socialLinkLabel(locale, 'YouTube'), /YouTube/);
  }
});
