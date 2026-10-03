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
  const [billing, setBilling] = useState<{
    subscription: {
      status: string;
      active: boolean;
      cancelAtPeriodEnd: boolean;
      currentPeriodEnd: string | null;
      fairUseMinutesUsed: number;
      fairUseMinutes: number;
      maxCallMinutes: number;
      portal: boolean;
    } | null;
    reports: Array<{ id: string; title: string; status: string; createdAt: string }>;
    rebook: { percent: number; expiresAt: string } | null;
  } | null>(null);

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
        fetch('/api/account/billing')
          .then((response) => (response.ok ? response.json() : null))
          .then((payload) => {
            if (payload) setBilling(payload);
          })
          .catch(() => undefined);
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

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <h2 className="font-semibold">Callastral Illimité</h2>
          {billing?.subscription?.active ? (
            <>
              <p className="text-sm text-white/75">
                Abonnement en cours
                {billing.subscription.cancelAtPeriodEnd ? ', résiliation prévue en fin de période' : ''}.
                {billing.subscription.fairUseMinutesUsed} min utilisées sur {billing.subscription.fairUseMinutes} ce mois-ci.
                Maximum {billing.subscription.maxCallMinutes} min par appel.
              </p>
              <button
                type="button"
                className="btn-secondary w-full"
                onClick={() => {
                  void fetch('/api/billing/portal', { method: 'POST' })
                    .then((response) => response.json())
                    .then((payload) => {
                      if (payload.url) window.location.href = payload.url;
                      else setError(payload.error || 'Le portail n’a pas pu s’ouvrir.');
                    });
                }}
              >
                Gérer ou résilier
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-white/75">
                49 € par mois, sans facturation à la minute, dans la limite de 300 minutes par mois et de 60 minutes par appel.
              </p>
              <Link href="/offres" className="btn-primary inline-block w-full text-center">Voir l’offre</Link>
            </>
          )}
          {billing?.rebook && (
            <p className="text-sm text-celestial-gold">
              Prochain rendez-vous : {billing.rebook.percent} % de réduction, jusqu’au{' '}
              {new Date(billing.rebook.expiresAt).toLocaleDateString('fr-FR')}.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <h2 className="font-semibold">Rapports</h2>
          {billing?.reports?.length ? (
            <ul className="space-y-2 text-sm">
              {billing.reports.map((report) => (
                <li key={report.id}>
                  <Link href={`/reports/${report.id}`} className="text-celestial-gold underline">
                    {report.title}
                  </Link>
                  <span className="text-white/45"> · {report.status === 'delivered' ? 'envoyé' : 'en préparation'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white/60">Aucun rapport pour le moment.</p>
          )}
          <Link href="/offres" className="text-sm text-white/70 underline">Commander un thème, une prévision ou une compatibilité</Link>
        </section>

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
