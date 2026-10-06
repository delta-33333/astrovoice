import {
  VERCEL_ANALYTICS_URL,
  loadAcquisition,
  loadVercelStats,
  type WeeklyRow,
} from '@/lib/admin-funnel';

export const dynamic = 'force-dynamic';

function pct(value: number | null | undefined): string {
  if (value == null) return '—';
  return `${(Number(value) * 100).toFixed(Number(value) < 0.1 ? 1 : 0)} %`;
}

function Ratio({ label, help, value }: { label: string; help: string; value: number | null }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-wide text-white/45">{label}</p>
      <p className="text-2xl font-semibold mt-1 text-celestial-gold">{pct(value)}</p>
      <p className="text-[11px] text-white/45 mt-1">{help}</p>
    </div>
  );
}

const th = 'px-2 py-2 text-left font-normal text-white/45 whitespace-nowrap';
const td = 'px-2 py-1.5 whitespace-nowrap';

function sumWeeks(rows: WeeklyRow[], key: keyof WeeklyRow): number {
  return rows.reduce((sum, row) => sum + Number(row[key] ?? 0), 0);
}

export default async function AcquisitionPage() {
  const [data, vercel] = await Promise.all([loadAcquisition(), loadVercelStats(7)]);
  const current = data.weekly[0];
  const last4 = data.weekly.slice(0, 4);
  const ratio = (num: number, den: number) => (den > 0 ? num / den : null);

  return (
    <main className="space-y-10">
      <section>
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl mb-2">Acquisition</h1>
        <p className="text-sm text-white/50">
          Semaines ISO, heure de Paris. Robots, sondes et comptes de test exclus (mailinator, audit, test,
          example.com, compte admin). Visiteurs uniques = cookie anonyme first-party (depuis le 6 octobre 2026).
        </p>
        {data.error && <p className="text-sm text-red-200 mt-3">Lecture impossible : {data.error}</p>}
      </section>

      <section>
        <h2 className="text-lg mb-3">4 dernières semaines</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Ratio
            label="Visiteur → compte"
            help={`${sumWeeks(last4, 'signups')} comptes / ${sumWeeks(last4, 'unique_visitors')} visiteurs`}
            value={ratio(sumWeeks(last4, 'signups'), sumWeeks(last4, 'unique_visitors'))}
          />
          <Ratio
            label="Compte → 1er paiement"
            help={`${sumWeeks(last4, 'first_paid')} premiers paiements / ${sumWeeks(last4, 'signups')} comptes`}
            value={ratio(sumWeeks(last4, 'first_paid'), sumWeeks(last4, 'signups'))}
          />
          <Ratio
            label="Payé → appel terminé"
            help={`${sumWeeks(last4, 'completed_calls')} appels / ${sumWeeks(last4, 'paid_bookings')} consultations payées`}
            value={ratio(sumWeeks(last4, 'completed_calls'), sumWeeks(last4, 'paid_bookings'))}
          />
          <Ratio
            label="Taux de rachat"
            help={`${sumWeeks(last4, 'repeat_bookers')} clients revenus / ${sumWeeks(last4, 'paying_users')} clients payants`}
            value={ratio(sumWeeks(last4, 'repeat_bookers'), sumWeeks(last4, 'paying_users'))}
          />
        </div>
        {current && (
          <p className="text-xs text-white/45 mt-2">
            Semaine en cours ({current.iso_week}) : {current.unique_visitors} visiteurs, {current.signups} comptes,{' '}
            {current.first_paid} premiers paiements, {current.completed_calls} appels terminés.
          </p>
        )}
      </section>

      <section>
        <h2 className="text-lg mb-3">Par semaine</h2>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className={th}>Semaine</th>
                <th className={th}>Visiteurs</th>
                <th className={th}>Pages vues</th>
                <th className={th}>Comptes</th>
                <th className={th}>1er payé</th>
                <th className={th}>Payées</th>
                <th className={th}>Appels</th>
                <th className={th}>Rachats</th>
                <th className={th}>Visit.→compte</th>
                <th className={th}>Compte→payé</th>
                <th className={th}>Payé→appel</th>
                <th className={th}>Rachat</th>
              </tr>
            </thead>
            <tbody>
              {data.weekly.map((row) => (
                <tr key={row.week_start} className="border-t border-white/5">
                  <td className={td}>{row.iso_week}</td>
                  <td className={td}>{row.unique_visitors}</td>
                  <td className={td}>{row.page_views}</td>
                  <td className={td}>{row.signups}</td>
                  <td className={td}>{row.first_paid}</td>
                  <td className={td}>{row.paid_bookings}</td>
                  <td className={td}>{row.completed_calls}</td>
                  <td className={td}>{row.repeat_bookers}</td>
                  <td className={`${td} text-celestial-gold`}>{pct(row.visitor_to_signup)}</td>
                  <td className={`${td} text-celestial-gold`}>{pct(row.signup_to_first_paid)}</td>
                  <td className={`${td} text-celestial-gold`}>{pct(row.paid_to_completed)}</td>
                  <td className={`${td} text-celestial-gold`}>{pct(row.repeat_rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg mb-3">Par jour (30 jours)</h2>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className={th}>Jour</th>
                <th className={th}>Visiteurs</th>
                <th className={th}>Pages vues</th>
                <th className={th}>Clics réserver</th>
                <th className={th}>Paiements ouverts</th>
                <th className={th}>Comptes</th>
                <th className={th}>1er payé</th>
                <th className={th}>Payées</th>
                <th className={th}>Appels terminés</th>
              </tr>
            </thead>
            <tbody>
              {data.daily.map((row) => (
                <tr key={row.day} className="border-t border-white/5">
                  <td className={td}>{row.day}</td>
                  <td className={td}>{row.unique_visitors}</td>
                  <td className={td}>{row.page_views}</td>
                  <td className={td}>{row.book_clicks}</td>
                  <td className={td}>{row.checkouts}</td>
                  <td className={td}>{row.signups}</td>
                  <td className={td}>{row.first_paid}</td>
                  <td className={td}>{row.paid_bookings}</td>
                  <td className={td}>{row.completed_calls}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-lg mb-1">Sources (première visite)</h2>
          <p className="text-xs text-white/45 mb-3">utm_source, sinon domaine référent, sinon (direct). Comptes = première source enregistrée à l’inscription.</p>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className={th}>Source</th>
                  <th className={th}>Medium / campagne</th>
                  <th className={th}>Visiteurs</th>
                  <th className={th}>Comptes</th>
                  <th className={th}>Payants</th>
                </tr>
              </thead>
              <tbody>
                {data.sources.length === 0 && (
                  <tr><td className={td} colSpan={5}>Pas encore de données.</td></tr>
                )}
                {data.sources.map((row) => (
                  <tr key={`${row.source}|${row.medium}|${row.campaign}`} className="border-t border-white/5">
                    <td className={td}>{row.source}</td>
                    <td className={`${td} text-white/60`}>{[row.medium, row.campaign].filter(Boolean).join(' / ') || '—'}</td>
                    <td className={td}>{row.visitors}</td>
                    <td className={td}>{row.signups}</td>
                    <td className={td}>{row.paying_users}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 className="text-lg mb-1">Pages d’arrivée</h2>
          <p className="text-xs text-white/45 mb-3">Première page vue par chaque visiteur.</p>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className={th}>Page</th>
                  <th className={th}>Visiteurs</th>
                  <th className={th}>Comptes</th>
                  <th className={th}>Payants</th>
                </tr>
              </thead>
              <tbody>
                {data.landings.length === 0 && (
                  <tr><td className={td} colSpan={4}>Pas encore de données.</td></tr>
                )}
                {data.landings.map((row) => (
                  <tr key={row.landing_page} className="border-t border-white/5">
                    <td className={`${td} max-w-[16rem] truncate`} title={row.landing_page}>{row.landing_page}</td>
                    <td className={td}>{row.visitors}</td>
                    <td className={td}>{row.signups}</td>
                    <td className={td}>{row.paying_users}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg mb-1">Vercel Web Analytics</h2>
        {vercel ? (
          <div className="space-y-4">
            <p className="text-sm text-white/60">
              7 derniers jours : {vercel.visitors} visiteurs, {vercel.pageviews} pages vues.
            </p>
            <div className="grid gap-6 lg:grid-cols-3 text-sm">
              <ul className="space-y-1">
                <li className="text-white/45">Pages</li>
                {vercel.topPages.map((row) => (
                  <li key={row.path} className="flex justify-between gap-3"><span className="truncate">{row.path}</span><span>{row.visitors}</span></li>
                ))}
              </ul>
              <ul className="space-y-1">
                <li className="text-white/45">Référents</li>
                {vercel.topReferrers.map((row) => (
                  <li key={row.referrer} className="flex justify-between gap-3"><span className="truncate">{row.referrer}</span><span>{row.visitors}</span></li>
                ))}
              </ul>
              <ul className="space-y-1">
                <li className="text-white/45">Événements du parcours</li>
                {vercel.events.map((row) => (
                  <li key={row.name} className="flex justify-between gap-3"><span className="truncate">{row.name}</span><span>{row.count}</span></li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/60">
            Visiteurs, pages, référents, pays et événements du parcours (book_click, signup_view, slot_selected,
            checkout_start, payment_success, call_start…) sont dans le tableau de bord Vercel.
            Pour les afficher ici, ajouter la variable <code className="text-white/80">VERCEL_ANALYTICS_TOKEN</code> (jeton Vercel en lecture) au projet.
          </p>
        )}
        <a
          href={VERCEL_ANALYTICS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 rounded-full border border-celestial-gold/50 px-4 py-2 text-sm text-celestial-gold hover:bg-celestial-gold/10"
        >
          Ouvrir Vercel Analytics ↗
        </a>
      </section>
    </main>
  );
}
