import { NextResponse } from 'next/server';
import { sitemapUrls, submitOncePerDeployment, submitToIndexNow } from '@/lib/indexnow';

export const dynamic = 'force-dynamic';

/**
 * GET sans en-tête : soumet le sitemap une seule fois par déploiement de production.
 * GET avec Authorization: Bearer CRON_SECRET : soumission forcée.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const forced = Boolean(secret) && request.headers.get('authorization') === `Bearer ${secret}`;
  try {
    if (forced) {
      const result = await submitToIndexNow(await sitemapUrls());
      return NextResponse.json({ ok: result.status === 200 || result.status === 202, forced: true, ...result });
    }
    const result = await submitOncePerDeployment('deploy');
    return NextResponse.json({
      ok: result.skipped ? true : result.status === 200 || result.status === 202,
      ...result,
    });
  } catch (error) {
    console.error('indexnow:', error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false, error: 'Soumission impossible' }, { status: 500 });
  }
}
