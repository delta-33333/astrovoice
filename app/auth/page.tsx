'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Une erreur est survenue');
        setIsSubmitting(false);
        return;
      }

      router.push(data.needsBirthData ? '/astrologers?dispo=now' : '/home');
    } catch {
      setError('Erreur de connexion au serveur');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="font-[family-name:var(--font-cinzel)] text-5xl font-bold mb-2 text-glow cursor-pointer">
              Callastral
            </h1>
          </Link>
          <p className="text-white/70">
            {mode === 'login' ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10">
          {mode === 'signup' && (
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium mb-2">
                Prénom
              </label>
              <input
                type="text"
                id="displayName"
                autoComplete="given-name"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-celestial-purple focus:ring-2 focus:ring-celestial-purple/50 transition-all"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-celestial-purple focus:ring-2 focus:ring-celestial-purple/50 transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-celestial-purple focus:ring-2 focus:ring-celestial-purple/50 transition-all"
              required
              minLength={mode === 'signup' ? 8 : 1}
            />
            {mode === 'signup' && (
              <p className="mt-2 text-xs text-white/50">Au moins 8 caractères</p>
            )}
          </div>

          {mode === 'login' && (
            <div className="text-right">
              <Link href="/auth/forgot" className="text-sm text-celestial-gold hover:underline">
                Mot de passe oublié
              </Link>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
            }}
            className="text-celestial-gold hover:underline text-sm"
          >
            {mode === 'login'
              ? 'Pas encore de compte ? Inscrivez-vous'
              : 'Déjà un compte ? Connectez-vous'}
          </button>
          <p>
            <Link href="/astrologers?dispo=now" className="text-white/60 hover:text-white text-sm">
              Voir les conseillers disponibles
            </Link>
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-white/50 hover:text-white/70 text-sm">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
