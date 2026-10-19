/** Profils officiels Callastral. Une seule source pour le pied de page, sameAs et llms.txt. */
export const OFFICIAL_SOCIAL_PROFILES = [
  { id: 'youtube', name: 'YouTube', href: 'https://www.youtube.com/@Callastral' },
  { id: 'tiktok', name: 'TikTok', href: 'https://www.tiktok.com/@callastral.com' },
  { id: 'instagram', name: 'Instagram', href: 'https://www.instagram.com/callastral_com/' },
] as const;

export type SocialProfile = (typeof OFFICIAL_SOCIAL_PROFILES)[number];
export type SocialId = SocialProfile['id'];

const LINK_LABEL: Record<string, (name: string) => string> = {
  fr: (name) => `${name} de Callastral`,
  en: (name) => `Callastral on ${name}`,
  es: (name) => `Callastral en ${name}`,
  de: (name) => `Callastral auf ${name}`,
  it: (name) => `Callastral su ${name}`,
};

const NAV_LABEL: Record<string, string> = {
  fr: 'Réseaux sociaux',
  en: 'Social profiles',
  es: 'Redes sociales',
  de: 'Soziale Profile',
  it: 'Profili social',
};

export function socialLinkLabel(locale: string, name: string): string {
  return (LINK_LABEL[locale] ?? LINK_LABEL.en)(name);
}

export function socialNavLabel(locale: string): string {
  return NAV_LABEL[locale] ?? NAV_LABEL.en;
}

function httpsUrls(raw: string | undefined): string[] {
  return (raw || '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => /^https:\/\/[^\s]+$/.test(item));
}

/** Profils officiels, puis SAME_AS_URLS et SITE_SAME_AS, sans doublon. */
export function sameAsUrls(env: NodeJS.ProcessEnv = process.env): string[] {
  const extra = [...httpsUrls(env.SAME_AS_URLS), ...httpsUrls(env.SITE_SAME_AS)];
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const url of [...OFFICIAL_SOCIAL_PROFILES.map((profile) => profile.href), ...extra]) {
    if (seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
  }
  return urls;
}
