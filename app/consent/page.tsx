'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConsentPage() {
  const router = useRouter();
  const [hasConsented, setHasConsented] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = () => {
    if (!hasConsented) return;

    setIsSubmitting(true);

    // Store consent with timestamp
    const consentData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      type: 'automated_consultation',
    };
    
    sessionStorage.setItem('legalConsent', JSON.stringify(consentData));
    
    // Navigate to payment
    router.push('/payment');
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">✨</div>
          <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl font-bold mb-2 text-glow">
            Avant de commencer
          </h1>
          <p className="text-white/70">
            Information importante sur votre consultation
          </p>
        </div>

        {/* Legal Notice */}
        <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 space-y-6 mb-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Nature de la consultation
            </h2>
            
            <div className="space-y-3 text-white/80 leading-relaxed">
              <p>
                Vous êtes sur le point de vivre une <strong>consultation astrale digitale automatisée</strong>.
              </p>
              
              <p>
                Cette expérience utilise un système automatisé pour analyser votre thème natal et répondre à vos questions de manière personnalisée. 
                Votre thème est calculé avec précision grâce au Swiss Ephemeris.
              </p>

              <p>
                La consultation vocale est générée par un système d'intelligence artificielle conversationnelle 
                et n'implique pas d'astrologue humain en direct.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10"></div>

          {/* Benefits */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white/90">Ce que vous obtenez :</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-celestial-gold mt-0.5">✓</span>
                <span>Disponibilité immédiate 24/7 sans rendez-vous</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-celestial-gold mt-0.5">✓</span>
                <span>Thème natal calculé avec précision scientifique</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-celestial-gold mt-0.5">✓</span>
                <span>Consultation personnalisée basée sur vos données</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-celestial-gold mt-0.5">✓</span>
                <span>Tarif clair : $1.99/min • 2 premières minutes à $0.99</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-celestial-gold mt-0.5">✓</span>
                <span>Vous contrôlez la durée et le coût</span>
              </li>
            </ul>
          </div>

          {/* Consent Checkbox */}
          <div className="pt-4 border-t border-white/10">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={hasConsented}
                onChange={(e) => setHasConsented(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-2 border-white/20 bg-white/10 checked:bg-celestial-purple checked:border-celestial-purple focus:ring-2 focus:ring-celestial-purple/50 cursor-pointer"
              />
              <span className="text-sm text-white/90 group-hover:text-white transition-colors">
                Je comprends et j'accepte que cette consultation est une expérience digitale automatisée 
                utilisant l'intelligence artificielle. J'accepte les{' '}
                <a href="/terms" className="text-celestial-gold hover:underline" target="_blank">
                  conditions générales
                </a>
                {' '}et la{' '}
                <a href="/privacy" className="text-celestial-gold hover:underline" target="_blank">
                  politique de confidentialité
                </a>.
              </span>
            </label>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleContinue}
          disabled={!hasConsented || isSubmitting}
          className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Chargement...' : 'J\'accepte et je continue'}
        </button>

        {/* Legal Footer */}
        <div className="mt-6 text-center text-xs text-white/40">
          <p>
            Conformément à l'Article 50 du Règlement européen sur l'IA • 
            Votre consentement est horodaté et stocké
          </p>
        </div>
      </div>
    </main>
  );
}
