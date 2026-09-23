'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({
    username: '',
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

      if (data.needsBirthData) {
        router.push('/birth');
      } else {
        router.push('/home');
      }
    } catch (err) {
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
              Lunara
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
                autoComplete="name"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-celestial-purple focus:ring-2 focus:ring-celestial-purple/50 transition-all"
                placeholder="Marie"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              id="username"
              autoComplete="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-celestial-purple focus:ring-2 focus:ring-celestial-purple/50 transition-all"
              placeholder="marie.dupont"
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
              placeholder="••••••••"
              required
              minLength={6}
            />
            {mode === 'signup' && (
              <p className="mt-2 text-xs text-white/50">Minimum 6 caractères</p>
            )}
          </div>

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

        <div className="mt-6 text-center">
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
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-white/50 hover:text-white/70 text-sm">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
