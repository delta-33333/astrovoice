'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || 'L’envoi n’a pas abouti.');
        return;
      }
      setMessage(payload.message || 'Si un compte correspond, un e-mail vient d’être envoyé.');
    } catch {
      setError('L’envoi n’a pas abouti.');
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <h1 className="font-[family-name:var(--font-cinzel)] text-4xl mb-3">Mot de passe oublié</h1>
        <p className="text-white/70 mb-6">
          Indiquez l’e-mail du compte. Un lien à usage unique, valable 1 heure, vous permettra d’en choisir un nouveau.
          Un compte déjà ouvert sans mot de passe peut en définir un par ici.
        </p>
        <form onSubmit={(event) => void submit(event)} className="space-y-4">
          <label className="block text-sm text-white/70">
            E-mail
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-xl bg-white/10 border border-white/15 px-3 py-3 text-white"
            />
          </label>
          {error && <p className="text-sm text-red-200">{error}</p>}
          {message && <p className="text-sm text-white/80">{message}</p>}
          <button type="submit" disabled={sending} className="btn-primary w-full disabled:opacity-50">
            {sending ? 'Envoi…' : 'Recevoir le lien'}
          </button>
        </form>
        <p className="mt-6">
          <Link href="/auth" className="text-sm text-white/50">← Retour à la connexion</Link>
        </p>
      </div>
    </main>
  );
}
