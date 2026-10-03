import type { MetadataRoute } from 'next';
import { appBaseUrl } from '@/lib/stripe';

const ALLOWED = [
  'Googlebot',
  'Bingbot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  'PerplexityBot',
  'ClaudeBot',
  'Google-Extended',
];

export default function robots(): MetadataRoute.Robots {
  const origin = appBaseUrl();
  return {
    rules: [
      ...ALLOWED.map((userAgent) => ({ userAgent, allow: '/' })),
      { userAgent: '*', allow: '/' },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
