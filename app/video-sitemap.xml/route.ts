import { videoSitemapXml } from '@/lib/videos';
import { appBaseUrl } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export function GET() {
  const xml = videoSitemapXml(appBaseUrl());
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
