import { renderSitemapIndex } from '@/lib/sitemap-public';
import { appBaseUrl } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export function GET() {
  const xml = renderSitemapIndex(appBaseUrl());
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
