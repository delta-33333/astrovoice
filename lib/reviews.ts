import { getSupabaseAdmin, supabaseAvailable } from './supabase';

import { REVIEWS_SCHEMA_MIN } from './review-rules';

export { REVIEWS_DISPLAY_MIN, REVIEWS_SCHEMA_MIN } from './review-rules';

export interface PublicReview {
  stars: number;
  comment: string | null;
  createdAt: string;
}

export interface AdvisorReviews {
  count: number;
  average: number | null;
  items: PublicReview[];
}

export async function advisorReviews(advisorId: string, limit = 6): Promise<AdvisorReviews> {
  const empty: AdvisorReviews = { count: 0, average: null, items: [] };
  if (!supabaseAvailable) return empty;
  try {
    const admin = getSupabaseAdmin();
    const { data, error, count } = await admin
      .from('reviews')
      .select('stars, comment, created_at', { count: 'exact' })
      .eq('advisor_id', advisorId)
      .order('created_at', { ascending: false })
      .limit(200);
    if (error || !data) return empty;
    const total = count ?? data.length;
    if (total === 0) return empty;
    const sum = data.reduce((acc, row) => acc + Number(row.stars || 0), 0);
    return {
      count: total,
      average: data.length ? Math.round((sum / data.length) * 10) / 10 : null,
      items: data
        .filter((row) => typeof row.comment === 'string' && row.comment.trim())
        .slice(0, limit)
        .map((row) => ({ stars: row.stars, comment: row.comment, createdAt: row.created_at })),
    };
  } catch {
    return empty;
  }
}

/** Champ JSON-LD aggregateRating, uniquement à partir de données réelles et d’au moins 5 avis. */
export function aggregateRatingLd(reviews: AdvisorReviews): Record<string, unknown> | null {
  if (reviews.count < REVIEWS_SCHEMA_MIN || reviews.average == null) return null;
  return {
    '@type': 'AggregateRating',
    ratingValue: reviews.average.toFixed(1),
    reviewCount: reviews.count,
    bestRating: 5,
    worstRating: 1,
  };
}
