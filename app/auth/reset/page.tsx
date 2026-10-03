'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token') || '');
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    setError('');
    try {
      const response = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || 'Le lien n’est plus valable.');
        setSending(false);
        return;
      }
      router.push(payload.signedIn ? '/account' : '/auth');
    } catch {
      setError('Le mot de passe n’a pas pu être enregistré.');
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <h1 className="font-[family-name:var(--font-cinzel)] text-4xl mb-3">Nouveau mot de passe</h1>
        <p className="text-white/70 mb-6">Choisissez un mot de passe d’au moins 8 caractères.</p>
        {!token && <p className="text-sm text-red-200 mb-4">Ce lien est incomplet. Demandez-en un nouveau.</p>}
        <form onSubmit={(event) => void submit(event)} className="space-y-4">
          <label className="block text-sm text-white/70">
            Mot de passe
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-xl bg-white/10 border border-white/15 px-3 py-3 text-white"
            />
          </label>
          {error && <p className="text-sm text-red-200">{error}</p>}
          <button type="submit" disabled={sending || !token} className="btn-primary w-full disabled:opacity-50">
            {sending ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </form>
        <p className="mt-6">
          <Link href="/auth/forgot" className="text-sm text-white/50">Demander un nouveau lien</Link>
        </p>
      </div>
    </main>
  );
}
