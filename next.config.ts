import type { NextConfig } from "next";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.js.stripe.com https://*.stripe.com https://*.stripe.network",
  "frame-src 'self' https://js.stripe.com https://*.js.stripe.com https://hooks.stripe.com https://*.stripe.com https://*.stripe.network https://pay.google.com https://google.com https://www.google.com",
  "connect-src 'self' https://api.stripe.com https://*.stripe.com https://*.stripe.network https://pay.google.com",
  "img-src 'self' data: blob: https://*.stripe.com https://*.stripe.network",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "worker-src 'self' blob:",
].join('; ');

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
        ],
      },
    ];
  },
};

export default nextConfig;
