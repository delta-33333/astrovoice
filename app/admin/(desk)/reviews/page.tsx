import { loadRows } from '@/lib/admin-data';

export const dynamic = 'force-dynamic';

interface ReviewRow {
  id: string;
  stars: number;
  comment: string | null;
  created_at: string;
  advisor_id: string;
}

export default async function AdminReviewsPage() {
  const rows = await loadRows<ReviewRow>('reviews', 'id, stars, comment, created_at, advisor_id', 'created_at', 80);
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cinzel)] text-3xl mb-6">Avis</h1>
      <ul className="space-y-3">
        {rows.map((review) => (
          <li key={review.id} className="rounded-2xl border border-white/10 p-4">
            <p className="text-sm text-celestial-gold">{review.stars} / 5</p>
            {review.comment && <p className="mt-2 text-sm text-white/80">{review.comment}</p>}
            <p className="mt-2 text-xs text-white/40">
              {new Date(review.created_at).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}
            </p>
          </li>
        ))}
      </ul>
      {rows.length === 0 && <p className="text-white/55">Aucun avis.</p>}
    </main>
  );
}
