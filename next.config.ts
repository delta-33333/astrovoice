import type { NextConfig } from "next";

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
