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
  'Claude-SearchBot',
  'Google-Extended',
];

const PRIVATE = ['/admin', '/account', '/api', '/auth', '/payment', '/bookings', '/call', '/birth', '/book'];

export default function robots(): MetadataRoute.Robots {
  const origin = appBaseUrl();
  return {
    rules: [
      ...ALLOWED.map((userAgent) => ({ userAgent, allow: '/', disallow: PRIVATE })),
      { userAgent: '*', allow: '/', disallow: PRIVATE },
    ],
    sitemap: [`${origin}/sitemap.xml`, `${origin}/video-sitemap.xml`],
    host: origin,
  };
}
