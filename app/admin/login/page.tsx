'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const payload = await response.json().catch(() => null);
    setPending(false);
    if (!response.ok) {
      setError(payload?.error || 'Identifiants refusés.');
      return;
    }
    router.replace('/admin');
  };

  return (
    <main className="min-h-screen grid place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 bg-white/5 border border-white/10 rounded-3xl p-6">
        <h1 className="font-[family-name:var(--font-cinzel)] text-2xl">Administration</h1>
        <input
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="E-mail"
          className="w-full rounded-xl bg-white/10 px-3 py-3 text-sm"
          required
        />
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Mot de passe"
          className="w-full rounded-xl bg-white/10 px-3 py-3 text-sm"
          required
        />
        {error && <p className="text-sm text-red-200">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={pending}>
          {pending ? 'Vérification…' : 'Entrer'}
        </button>
      </form>
    </main>
  );
}
