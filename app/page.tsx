import Link from "next/link";
import InstallPrompt from "@/components/InstallPrompt";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl mx-auto text-center space-y-12">
        <div className="space-y-4">
          <h1 className="font-[family-name:var(--font-cinzel)] text-6xl sm:text-7xl font-bold text-glow">
            Lunara
          </h1>
          <p className="text-celestial-gold text-xl sm:text-2xl font-light">
            Consultation Astrale Personnalisée
          </p>
        </div>

        <p className="text-lg text-white/80 leading-relaxed max-w-xl mx-auto">
          Consultation vocale basée sur votre thème natal complet, disponible 24/7
        </p>
        
        <div className="flex items-center justify-center gap-3 text-sm text-white/60">
          <span className="font-semibold text-celestial-gold">$1.99/min</span>
          <span className="text-white/30">•</span>
          <span>2 premières min à $0.99</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link 
            href="/auth"
            className="btn-primary text-lg"
          >
            Créer un compte
          </Link>
          <Link 
            href="/auth"
            className="btn-secondary text-lg"
          >
            Se connecter
          </Link>
        </div>

        <div className="pt-8 grid grid-cols-3 gap-4 max-w-md mx-auto text-center">
          <div>
            <div className="text-2xl mb-1">✨</div>
            <p className="text-xs text-white/60">Instantané</p>
          </div>
          <div>
            <div className="text-2xl mb-1">🌙</div>
            <p className="text-xs text-white/60">Personnalisé</p>
          </div>
          <div>
            <div className="text-2xl mb-1">🔒</div>
            <p className="text-xs text-white/60">Sécurisé</p>
          </div>
        </div>
      </div>

      <footer className="mt-16 text-center text-white/40 text-xs">
        <p>© {new Date().getFullYear()} Lunara</p>
      </footer>

      <InstallPrompt />
    </main>
  );
}
