'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AccountPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [nextEmail, setNextEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((response) => response.json())
      .then((payload) => {
        if (!payload.authenticated) {
          router.replace('/auth');
          return;
        }
        setEmail(payload.user.email || '');
        setDisplayName(payload.user.displayName || '');
        setNextEmail(payload.user.email || '');
        setReady(true);
      })
      .catch(() => router.replace('/auth'));
  }, [router]);

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');
    const response = await fetch('/api/auth/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setError(payload?.error || 'Le mot de passe n’a pas été modifié.');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setNotice('Mot de passe mis à jour.');
  };

  const changeEmail = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');
    const response = await fetch('/api/auth/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: nextEmail, password: emailPassword }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setError(payload?.error || 'L’e-mail n’a pas été modifié.');
      return;
    }
    setEmail(nextEmail);
    setEmailPassword('');
    setNotice('E-mail mis à jour.');
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (!ready) {
    return <main className="min-h-screen grid place-items-center text-white/60">Chargement…</main>;
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-md mx-auto space-y-8">
        <div>
          <Link href="/home" className="text-sm text-white/50">← Accueil</Link>
          <h1 className="font-[family-name:var(--font-cinzel)] text-4xl mt-3">Mon compte</h1>
          <p className="text-white/70 mt-2">{displayName}</p>
          <p className="text-white/50 text-sm">{email}</p>
        </div>

        {notice && <p className="text-sm text-celestial-gold">{notice}</p>}
        {error && <p className="text-sm text-red-200">{error}</p>}

        <form onSubmit={(event) => void changePassword(event)} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="font-semibold">Changer le mot de passe</h2>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Mot de passe actuel"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-3"
            required
          />
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Nouveau mot de passe"
            minLength={8}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-3"
            required
          />
          <button type="submit" className="btn-primary w-full">Enregistrer</button>
          <p className="text-xs text-white/45">
            Un compte sans mot de passe passe par <Link href="/auth/forgot" className="underline">Mot de passe oublié</Link>.
          </p>
        </form>

        <form onSubmit={(event) => void changeEmail(event)} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="font-semibold">Changer l’e-mail</h2>
          <input
            type="email"
            autoComplete="email"
            value={nextEmail}
            onChange={(event) => setNextEmail(event.target.value)}
            className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-3"
            required
          />
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Mot de passe"
            value={emailPassword}
            onChange={(event) => setEmailPassword(event.target.value)}
            className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-3"
            required
          />
          <button type="submit" className="btn-secondary w-full">Mettre à jour l’e-mail</button>
        </form>

        <button type="button" onClick={() => void logout()} className="text-sm text-white/50 underline">
          Déconnexion
        </button>
      </div>
    </main>
  );
}
