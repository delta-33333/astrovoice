import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center space-y-8 py-12">
        {/* Logo/Brand */}
        <div className="space-y-4">
          <h1 className="font-[family-name:var(--font-cinzel)] text-6xl sm:text-7xl md:text-8xl font-bold text-glow">
            Lumen
          </h1>
          <p className="text-celestial-gold text-xl sm:text-2xl font-light tracking-wide">
            Consultation Astrale en Direct
          </p>
        </div>

        {/* Value Prop */}
        <div className="max-w-2xl mx-auto space-y-6">
          <p className="text-lg sm:text-xl text-white/80 leading-relaxed">
            Connectez-vous instantanément avec un astrologue expérimenté pour une consultation vocale personnalisée basée sur votre thème natal complet.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-white/60">
            <div className="flex items-center gap-1">
              <svg className="w-5 h-5 text-celestial-gold" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
              <span>$1.99 / minute</span>
            </div>
            <span className="text-white/30">•</span>
            <span>Consultation vocale immédiate</span>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-6">
          <Link 
            href="/birth"
            className="btn-primary inline-block text-lg"
          >
            Parler à un astrologue
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="space-y-2 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-3xl">✨</div>
            <h3 className="font-semibold text-white">Instantané</h3>
            <p className="text-sm text-white/60">Connectez-vous en quelques minutes</p>
          </div>
          
          <div className="space-y-2 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-3xl">🌙</div>
            <h3 className="font-semibold text-white">Personnalisé</h3>
            <p className="text-sm text-white/60">Basé sur votre thème natal complet</p>
          </div>
          
          <div className="space-y-2 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-3xl">🔒</div>
            <h3 className="font-semibold text-white">Sécurisé</h3>
            <p className="text-sm text-white/60">Paiement protégé par Stripe</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto text-center py-8 text-white/40 text-sm">
        <p>© {new Date().getFullYear()} Lumen. Consultation astrale professionnelle.</p>
      </footer>
    </main>
  );
}
