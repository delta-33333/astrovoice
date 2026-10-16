import { entriesFor, renderUrlset, SITEMAP_KINDS, type SitemapKind } from '@/lib/sitemap-public';
import { pageEntriesWithAdvisors } from '@/lib/sitemap-server';
import { appBaseUrl } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

function isKind(value: string): value is SitemapKind {
  return (SITEMAP_KINDS as readonly string[]).includes(value);
}

export async function GET(_request: Request, context: { params: Promise<{ kind: string }> }) {
  const { kind: raw } = await context.params;
  const kind = raw.endsWith('.xml') ? raw.slice(0, -4) : raw;
  if (!isKind(kind)) return new Response('Not found', { status: 404 });
  const origin = appBaseUrl();
  const entries = kind === 'pages' ? await pageEntriesWithAdvisors() : entriesFor(kind);
  return new Response(renderUrlset(origin, entries), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
