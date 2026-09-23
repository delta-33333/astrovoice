'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import InstallPrompt from '@/components/InstallPrompt';
import { formatCurrency, INTRO_CENTS, PER_MINUTE_CENTS } from '@/lib/pricing';

interface UserData {
  displayName: string;
  hasBirthData: boolean;
  favoriteAstrologerId?: string;
  prepaidSeconds: number;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [packNotice, setPackNotice] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();

        if (!data.authenticated) {
          router.push('/auth');
          return;
        }

        if (!data.user.hasBirthData) {
          router.push('/birth');
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/auth');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const params = new URLSearchParams(window.location.search);
    if (params.get('pack_success') === '1') {
      setPackNotice(true);
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const startCall = () => {
    if (user?.favoriteAstrologerId) {
      sessionStorage.setItem('astrologerId', user.favoriteAstrologerId);
      router.push('/consent');
    } else {
      router.push('/astrologers');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">Chargement...</div>
      </div>
    );
  }

  if (!user) return null;

  const hasPrepaidMinutes = user.prepaidSeconds > 0;
  const prepaidMinutes = Math.floor(user.prepaidSeconds / 60);

  return (
    <main className="min-h-screen flex flex-col px-4 py-8">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="font-[family-name:var(--font-cinzel)] text-3xl font-bold text-glow">
              Lunara
            </h1>
            <p className="text-white/60 text-sm mt-1">Bonjour, {user.displayName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/60 hover:text-white text-sm"
          >
            Déconnexion
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center space-y-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🌙</div>
            <h2 className="text-2xl font-semibold mb-2">Prête pour une consultation ?</h2>
            <p className="text-white/70">
              Connectez-vous avec un astrologue en quelques secondes
            </p>
          </div>

          {packNotice && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className="text-celestial-gold font-semibold">Minutes ajoutées</p>
              <p className="text-white/60 text-sm mt-1">
                Elles seront utilisées en premier lors de votre prochaine consultation.
              </p>
            </div>
          )}

          {hasPrepaidMinutes && (
            <div className="bg-celestial-gold/10 border border-celestial-gold/30 rounded-2xl p-4 text-center">
              <p className="text-celestial-gold font-semibold">
                ✨ {prepaidMinutes} min disponibles
              </p>
              <p className="text-white/60 text-sm mt-1">
                Vous avez {prepaidMinutes} minute{prepaidMinutes > 1 ? 's' : ''} prépayée{prepaidMinutes > 1 ? 's' : ''}
              </p>
            </div>
          )}

          <button
            onClick={startCall}
            className="btn-primary text-xl py-5 w-full"
          >
            Appeler maintenant
          </button>

          <div className="text-center text-sm text-white/60">
            <p>{formatCurrency(PER_MINUTE_CENTS)}/min • {formatCurrency(INTRO_CENTS)}/min les 3 premières minutes</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <Link
              href="/packs"
              className="bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/30 rounded-2xl p-6 text-center transition-all"
            >
              <div className="text-3xl mb-2">💎</div>
              <h3 className="font-semibold mb-1">Packs minutes</h3>
              <p className="text-xs text-white/60">Économisez sur vos consultations</p>
            </Link>

            <Link
              href="/astrologers"
              className="bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/30 rounded-2xl p-6 text-center transition-all"
            >
              <div className="text-3xl mb-2">✨</div>
              <h3 className="font-semibold mb-1">Astrologues</h3>
              <p className="text-xs text-white/60">Choisir un astrologue</p>
            </Link>
          </div>
        </div>
      </div>

      <InstallPrompt />
    </main>
  );
}
