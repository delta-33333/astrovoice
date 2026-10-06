import 'server-only';
import { getSupabaseAdmin, supabaseAvailable } from './supabase';

/*
 * Tableau de bord d'acquisition (admin uniquement) : vues SQL callastral.funnel_weekly, funnel_daily,
 * acquisition_sources et landing_pages (robots et comptes de test exclus), plus Vercel Web Analytics
 * via l'API officielle quand un jeton de lecture est configuré.
 */

export type WeeklyRow = {
  week_start: string;
  iso_week: string;
  unique_visitors: number;
  page_views: number;
  signups: number;
  first_paid: number;
  paid_bookings: number;
  completed_calls: number;
  paying_users: number;
  repeat_bookers: number;
  visitor_to_signup: number | null;
  signup_to_first_paid: number | null;
  paid_to_completed: number | null;
  repeat_rate: number | null;
};

export type DailyRow = {
  day: string;
  unique_visitors: number;
  page_views: number;
  book_clicks: number;
  checkouts: number;
  signups: number;
  first_paid: number;
  paid_bookings: number;
  completed_calls: number;
};

export type SourceRow = {
  source: string;
  medium: string;
  campaign: string;
  visitors: number;
  signups: number;
  paying_users: number;
};

export type LandingRow = { landing_page: string; visitors: number; signups: number; paying_users: number };

export type VercelStats = {
  pageviews: number;
  visitors: number;
  topPages: { path: string; pageviews: number; visitors: number }[];
  topReferrers: { referrer: string; pageviews: number; visitors: number }[];
  /** null : événements personnalisés indisponibles (offre Vercel Hobby). */
  events: { name: string; count: number; visitors: number }[] | null;
};

export const VERCEL_ANALYTICS_URL = 'https://vercel.com/alpha-ais-projects-d439fdc7/lunara/analytics';
const VERCEL_PROJECT_ID = 'prj_14MqFLKYq5hmOV46ke3ulDUzwPne';
const VERCEL_TEAM_ID = 'team_9eoPOeUbDnJa81oCG2kvEdjT';

async function view<T>(name: string, order: string, limit: number): Promise<T[]> {
  const { data, error } = await getSupabaseAdmin().from(name).select('*').order(order, { ascending: false }).limit(limit);
  if (error) throw new Error(`${name}: ${error.message}`);
  return (data ?? []) as T[];
}

function num(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

async function vercelQuery(path: string, params: Record<string, string>): Promise<unknown> {
  const token = process.env.VERCEL_ANALYTICS_TOKEN;
  if (!token) return null;
  const query = new URLSearchParams({ projectId: VERCEL_PROJECT_ID, teamId: VERCEL_TEAM_ID, ...params });
  const response = await fetch(`https://api.vercel.com/v1/query/web-analytics/${path}?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 600 },
  });
  if (!response.ok) throw new Error(`Vercel Analytics ${path}: ${response.status}`);
  return response.json();
}

type Rows = { data?: Record<string, unknown>[] };

export async function loadVercelStats(days = 7): Promise<VercelStats | null> {
  if (!process.env.VERCEL_ANALYTICS_TOKEN) return null;
  // `until` est exclusif côté API (date = minuit) : demain pour inclure aujourd'hui.
  const until = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  try {
    const [pages, referrers, events] = (await Promise.all([
      vercelQuery('visits/aggregate', { since, until, by: 'requestPath', limit: '10' }),
      vercelQuery('visits/aggregate', { since, until, by: 'referrerHostname', limit: '10' }),
      // Événements personnalisés : offre Pro/Enterprise uniquement (402 sinon) — non bloquant.
      vercelQuery('events/aggregate', { since, until, by: 'eventName', limit: '20' }).catch(() => null),
    ])) as (Rows | null)[];
    const topPages = (pages?.data ?? []).map((row) => ({
      path: String(row.requestPath ?? '—'),
      pageviews: num(row.pageviews),
      visitors: num(row.visitors),
    }));
    const topReferrers = (referrers?.data ?? []).map((row) => ({
      referrer: String(row.referrerHostname || '(direct)'),
      pageviews: num(row.pageviews),
      visitors: num(row.visitors),
    }));
    const totals = topPages.reduce(
      (sum, row) => ({ pageviews: sum.pageviews + row.pageviews, visitors: Math.max(sum.visitors, row.visitors) }),
      { pageviews: 0, visitors: 0 }
    );
    const count = (await vercelQuery('visits/count', { since, until })) as { data?: { pageviews?: number; visitors?: number } } | null;
    return {
      pageviews: num(count?.data?.pageviews ?? totals.pageviews),
      visitors: num(count?.data?.visitors ?? totals.visitors),
      topPages,
      topReferrers,
      events: events
        ? (events.data ?? []).map((row) => ({
            name: String(row.eventName ?? '—'),
            count: num(row.count),
            visitors: num(row.visitors),
          }))
        : null,
    };
  } catch (error) {
    console.warn('Vercel Analytics:', error instanceof Error ? error.message : error);
    return null;
  }
}

export async function loadAcquisition(): Promise<{
  weekly: WeeklyRow[];
  daily: DailyRow[];
  sources: SourceRow[];
  landings: LandingRow[];
  error: string | null;
}> {
  if (!supabaseAvailable) return { weekly: [], daily: [], sources: [], landings: [], error: 'Base indisponible' };
  try {
    const [weekly, daily, sources, landings] = await Promise.all([
      view<WeeklyRow>('funnel_weekly', 'week_start', 12),
      view<DailyRow>('funnel_daily', 'day', 30),
      view<SourceRow>('acquisition_sources', 'visitors', 15),
      view<LandingRow>('landing_pages', 'visitors', 15),
    ]);
    return { weekly, daily, sources, landings, error: null };
  } catch (error) {
    return {
      weekly: [],
      daily: [],
      sources: [],
      landings: [],
      error: error instanceof Error ? error.message : 'Lecture impossible',
    };
  }
}
