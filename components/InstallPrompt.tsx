'use client';

import { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
    }

    // Check if already dismissed
    const dismissed = localStorage.getItem('installPromptDismissed');
    if (dismissed) return;

    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);
    if (standalone) return;

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    if (ios) {
      setShowPrompt(true);
    } else {
      // Listen for beforeinstallprompt event (Android/Chrome)
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('installPromptDismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50">
      <div className="bg-celestial-purple/95 backdrop-blur-lg border border-white/20 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📱</div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Ajouter à l'écran d'accueil</h3>
            {isIOS ? (
              <div className="text-sm text-white/90 space-y-1">
                <p>Pour installer Lunara :</p>
                <ol className="list-decimal list-inside space-y-0.5 text-xs">
                  <li>Appuyez sur <span className="inline-block">⎙</span> (Partager)</li>
                  <li>Sélectionnez « Sur l'écran d'accueil »</li>
                  <li>Appuyez sur « Ajouter »</li>
                </ol>
              </div>
            ) : (
              <p className="text-sm text-white/90">
                Installez l'app pour un accès rapide et une meilleure expérience
              </p>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/60 hover:text-white text-xl leading-none"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstall}
            className="mt-3 w-full bg-white/20 hover:bg-white/30 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            Installer maintenant
          </button>
        )}
      </div>
    </div>
  );
}
