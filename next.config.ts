import type { NextConfig } from "next";
import { alternativeRedirects } from "./lib/alternatives.ts";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.js.stripe.com https://*.stripe.com https://*.stripe.network https://va.vercel-scripts.com",
  "frame-src 'self' https://js.stripe.com https://*.js.stripe.com https://hooks.stripe.com https://*.stripe.com https://*.stripe.network https://pay.google.com https://google.com https://www.google.com",
  "connect-src 'self' https://api.stripe.com https://*.stripe.com https://*.stripe.network https://pay.google.com wss://api.x.ai https://api.x.ai https://va.vercel-scripts.com https://vitals.vercel-insights.com",
  "img-src 'self' data: blob: https://*.stripe.com https://*.stripe.network https://*.supabase.co",
  "media-src 'self' blob:",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "worker-src 'self' blob:",
].join('; ');

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 640, 768, 1024, 1280, 1920],
  },
  serverExternalPackages: ['sweph', 'geo-tz'],
  outputFileTracingIncludes: {
    '/api/natal-chart': ['./ephemeris/**/*', './node_modules/geo-tz/data/**/*'],
    '/api/ascendant': ['./ephemeris/**/*', './node_modules/geo-tz/data/**/*'],
    '/api/birth-data': ['./ephemeris/**/*', './node_modules/geo-tz/data/**/*'],
    '/api/voice-token': ['./ephemeris/**/*', './node_modules/geo-tz/data/**/*'],
    '/api/reports/checkout': ['./ephemeris/**/*', './node_modules/geo-tz/data/**/*'],
    '/api/reports/confirm': ['./ephemeris/**/*', './node_modules/geo-tz/data/**/*'],
    '/api/stripe/webhook': ['./ephemeris/**/*', './node_modules/geo-tz/data/**/*'],
    '/[locale]/horoscope': ['./ephemeris/**/*'],
    '/[locale]/weekly-horoscope': ['./ephemeris/**/*'],
    '/[locale]/horoscopo-semanal': ['./ephemeris/**/*'],
    '/[locale]/wochenhoroskop': ['./ephemeris/**/*'],
    '/[locale]/oroscopo-settimanale': ['./ephemeris/**/*'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Liens courts TikTok (temporaires : 307). Next ajoute la query entrante à la destination.
  async redirects() {
    return [
      {
        source: '/live',
        destination: '/fr?utm_source=tiktok&utm_medium=live&utm_campaign=elopartner_live',
        permanent: false,
      },
      {
        source: '/tiktok',
        destination: '/fr?utm_source=tiktok&utm_medium=bio&utm_campaign=elopartner_bio',
        permanent: false,
      },
      {
        source: '/insta',
        destination: '/fr?utm_source=instagram&utm_medium=bio&utm_campaign=callastral_bio',
        permanent: false,
      },
      { source: '/a-propos', destination: '/fr/a-propos', permanent: true },
      { source: '/about', destination: '/en/about', permanent: true },
      { source: '/packs', destination: '/offres', permanent: true },
      { source: '/pricing', destination: '/offres', permanent: true },
      { source: '/tarifs', destination: '/offres', permanent: true },
      { source: '/fr/tarifs', destination: '/offres', permanent: true },
      { source: '/prix', destination: '/offres', permanent: true },
      { source: '/fr/ascendant', destination: '/fr/calcul-ascendant-gratuit', permanent: true },
      { source: '/login', destination: '/auth', permanent: true },
      { source: '/signin', destination: '/auth', permanent: true },
      { source: '/connexion', destination: '/auth', permanent: true },
      { source: '/:locale(fr|en|es|de|it)/connexion', destination: '/auth', permanent: true },
      { source: '/:locale(fr|en|es|de|it)/login', destination: '/auth', permanent: true },
      { source: '/contact', destination: '/fr/mentions-legales#contact', permanent: true },
      { source: '/fr/contact', destination: '/fr/mentions-legales#contact', permanent: true },
      { source: '/fr/avis', destination: '/fr/avis-callastral', permanent: true },
      { source: '/en/reviews', destination: '/en/about', permanent: true },
      { source: '/fr/astrologie-ia', destination: '/fr', permanent: true },
      { source: '/astrologers', destination: '/?all=1', permanent: true },
      // Fiches « alternative à » fusionnées dans /fr/alternatives et /en/alternatives.
      ...alternativeRedirects(),
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=(), payment=(self "https://js.stripe.com"), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
