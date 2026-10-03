import { updateAdvisorAction } from '@/lib/admin-actions';
import { getSupabaseAdmin, supabaseAvailable } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface AdvisorRow {
  id: string;
  first_name: string;
  last_name: string;
  languages: string[] | null;
  active: boolean;
  featured: boolean;
  daily_capacity: number;
  bio: string;
}

export default async function AdminAdvisorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q || '').trim().toLowerCase();
  let rows: AdvisorRow[] = [];
  if (supabaseAvailable) {
    const { data, error } = await getSupabaseAdmin()
      .from('advisors')
      .select('id, first_name, last_name, languages, active, featured, daily_capacity, bio')
      .order('last_name', { ascending: true })
      .limit(200);
    if (error) console.warn('Conseillers admin:', error.message);
    rows = (data ?? []) as AdvisorRow[];
  }
  const visible = query
    ? rows.filter((row) => `${row.first_name} ${row.last_name}`.toLowerCase().includes(query))
    : rows.slice(0, 40);

  return (
    <main>
      <h1 className="font-[family-name:var(--font-cinzel)] text-3xl mb-4">Conseillers</h1>
      <form className="mb-6">
        <input
          name="q"
          defaultValue={q || ''}
          placeholder="Nom"
          className="rounded-full bg-white/10 px-4 py-2 text-sm"
        />
      </form>
      <div className="space-y-4">
        {visible.map((advisor) => (
          <form key={advisor.id} action={updateAdvisorAction} className="rounded-2xl border border-white/10 p-4 space-y-3">
            <input type="hidden" name="id" value={advisor.id} />
            <p className="font-semibold">
              {advisor.first_name} {advisor.last_name}
              <span className="text-white/45 font-normal"> · {(advisor.languages ?? []).join(', ')}</span>
            </p>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <label>
                Statut
                <select name="active" defaultValue={advisor.active ? '1' : '0'} className="mt-1 w-full rounded-lg bg-white/10 px-2 py-2">
                  <option value="1">Actif</option>
                  <option value="0">Désactivé</option>
                </select>
              </label>
              <label>
                Mise en avant
                <select name="featured" defaultValue={advisor.featured ? '1' : '0'} className="mt-1 w-full rounded-lg bg-white/10 px-2 py-2">
                  <option value="0">Non</option>
                  <option value="1">Oui</option>
                </select>
              </label>
              <label>
                Capacité / jour
                <input
                  name="daily_capacity"
                  type="number"
                  min={1}
                  max={24}
                  defaultValue={advisor.daily_capacity}
                  className="mt-1 w-full rounded-lg bg-white/10 px-2 py-2"
                />
              </label>
            </div>
            <textarea name="bio" defaultValue={advisor.bio} rows={3} className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm" />
            <button type="submit" className="btn-secondary text-sm py-2">Enregistrer</button>
          </form>
        ))}
      </div>
      {visible.length === 0 && <p className="text-white/55">Aucun conseiller.</p>}
    </main>
  );
}
