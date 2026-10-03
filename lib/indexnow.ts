import sitemap from '@/app/sitemap';
import { appBaseUrl } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * IndexNow (Bing, Yandex, Seznam, Naver…) : la clé est publique par conception,
 * servie à la racine par le middleware (/{INDEXNOW_KEY}.txt).
 */
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_URLS = 10000;

export function indexNowKey(): string | null {
  const key = (process.env.INDEXNOW_KEY || '').trim();
  return /^[A-Za-z0-9-]{8,128}$/.test(key) ? key : null;
}

export async function sitemapUrls(): Promise<string[]> {
  const entries = await sitemap();
  const origin = appBaseUrl();
  const urls = new Set<string>();
  for (const entry of entries) {
    if (entry.url.startsWith(origin)) urls.add(entry.url);
  }
  return [...urls].slice(0, MAX_URLS);
}

export interface IndexNowResult {
  status: number | null;
  urlCount: number;
  error?: string;
}

export async function submitToIndexNow(urls: string[]): Promise<IndexNowResult> {
  const key = indexNowKey();
  if (!key) return { status: null, urlCount: 0, error: 'INDEXNOW_KEY absente' };
  if (urls.length === 0) return { status: null, urlCount: 0, error: 'Aucune URL' };
  const origin = appBaseUrl();
  const host = new URL(origin).host;
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host, key, keyLocation: `${origin}/${key}.txt`, urlList: urls }),
      signal: AbortSignal.timeout(15000),
    });
    return { status: response.status, urlCount: urls.length };
  } catch (error) {
    return { status: null, urlCount: urls.length, error: error instanceof Error ? error.message : 'Envoi impossible' };
  }
}

function deploymentId(): string | null {
  return process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_GIT_COMMIT_SHA || null;
}

export interface DeploySubmission extends IndexNowResult {
  deploymentId: string | null;
  skipped?: 'not-production' | 'already-submitted';
}

/**
 * Une seule soumission par déploiement de production (journal callastral.indexnow_submissions).
 * Déclenchée par la première visite de /api/indexnow après la mise en ligne, ou par le cron quotidien.
 */
export async function submitOncePerDeployment(trigger: string): Promise<DeploySubmission> {
  const id = deploymentId();
  if (process.env.VERCEL_ENV !== 'production' || !id) {
    return { status: null, urlCount: 0, deploymentId: id, skipped: 'not-production' };
  }
  const db = getSupabaseAdmin();
  const { error: claimError } = await db
    .from('indexnow_submissions')
    .insert({ deployment_id: id, trigger });
  if (claimError) {
    if (claimError.code === '23505') {
      const { data } = await db
        .from('indexnow_submissions')
        .select('status, url_count')
        .eq('deployment_id', id)
        .maybeSingle();
      return {
        status: (data?.status as number | null) ?? null,
        urlCount: (data?.url_count as number | undefined) ?? 0,
        deploymentId: id,
        skipped: 'already-submitted',
      };
    }
    throw new Error(claimError.message);
  }
  const result = await submitToIndexNow(await sitemapUrls());
  await db
    .from('indexnow_submissions')
    .update({ status: result.status, url_count: result.urlCount, submitted_at: new Date().toISOString() })
    .eq('deployment_id', id);
  return { ...result, deploymentId: id };
}
