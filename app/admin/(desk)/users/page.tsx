import { loadRows } from '@/lib/admin-data';

export const dynamic = 'force-dynamic';

interface UserRow {
  id: string;
  display_name: string;
  email: string | null;
  username: string;
  created_at: string;
}

export default async function AdminUsersPage() {
  const rows = await loadRows<UserRow>('users', 'id, display_name, email, username, created_at', 'created_at', 80);
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cinzel)] text-3xl mb-6">Nouveaux comptes</h1>
      <ul className="space-y-2 text-sm">
        {rows.map((user) => (
          <li key={user.id} className="flex justify-between gap-3 border-b border-white/10 py-2">
            <span>{user.display_name} · {user.email || user.username}</span>
            <span className="text-white/45">{new Date(user.created_at).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</span>
          </li>
        ))}
      </ul>
      {rows.length === 0 && <p className="text-white/55">Aucun compte.</p>}
    </main>
  );
}
