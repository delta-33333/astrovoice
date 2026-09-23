import Link from "next/link";
import InstallPrompt from "@/components/InstallPrompt";

export default function LandingPage() {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Hero Section */}
        <section className="text-center space-y-8 py-12 sm:py-20">
          <div className="space-y-4">
            <h1 className="font-[family-name:var(--font-cinzel)] text-5xl sm:text-7xl font-bold text-glow">
              Callastral
            </h1>
            <p className="text-celestial-gold text-xl sm:text-2xl font-light">
              Votre astrologue personnel, disponible 24/7
            </p>
          </div>

          <p className="text-lg sm:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
            Consultation vocale basée sur votre thème natal complet. Un même astrologue qui vous connaît, se souvient de vos échanges et vous accompagne dans votre chemin.
          </p>
          
          <div className="flex items-center justify-center gap-3 text-base text-white/70 pt-4">
            <span className="text-celestial-gold font-semibold text-lg">0,99 €/min</span>
            <span className="text-white/30">•</span>
            <span>les 3 premières minutes</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link 
              href="/auth"
              className="btn-primary text-lg"
            >
              Commencer ma consultation
            </Link>
            <Link 
              href="/auth"
              className="btn-secondary text-lg"
            >
              Se connecter
            </Link>
          </div>

          <div className="pt-12 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="space-y-2">
              <div className="text-3xl">🌙</div>
              <p className="text-sm text-white/80 font-medium">Thème natal complet</p>
              <p className="text-xs text-white/50">Date, heure, lieu de naissance</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl">✨</div>
              <p className="text-sm text-white/80 font-medium">Disponible 24/7</p>
              <p className="text-xs text-white/50">À tout moment, jour et nuit</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl">💫</div>
              <p className="text-sm text-white/80 font-medium">Continuité</p>
              <p className="text-xs text-white/50">Votre astrologue se souvient</p>
            </div>
          </div>
        </section>

        {/* Cercle Fondateur - Founding Offer */}
        <section className="py-16 sm:py-20">
          <div className="relative max-w-3xl mx-auto">
            {/* Premium card with glow */}
            <div className="relative bg-gradient-to-br from-celestial-purple/20 via-celestial-blue/10 to-celestial-purple/20 backdrop-blur-sm rounded-3xl border-2 border-celestial-gold/50 p-8 sm:p-10 shadow-2xl shadow-celestial-gold/20">
              
              {/* Badge */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                <div className="bg-celestial-gold text-celestial-darker px-4 py-2 rounded-full text-sm font-bold">
                  ⭐ Cercle Fondateur
                </div>
                <div className="bg-white/10 backdrop-blur-sm text-white/90 px-4 py-2 rounded-full text-sm font-semibold border border-white/20">
                  100 places uniquement
                </div>
              </div>

              {/* Title */}
              <h2 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl font-bold text-center mb-4 text-glow">
                Offre de Lancement
              </h2>
              
              <p className="text-center text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Rejoignez les membres fondateurs de Callastral et bénéficiez d'un accès privilégié à vie
              </p>

              {/* Main offer */}
              <div className="bg-celestial-darker/60 backdrop-blur-sm rounded-2xl p-8 mb-6 border border-celestial-gold/30">
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <p className="text-white/70 text-sm uppercase tracking-wide">Votre première consultation</p>
                    <div className="flex items-center justify-center gap-4">
                      <span className="text-5xl font-bold text-celestial-gold">4,90 €</span>
                      <div className="text-left">
                        <div className="text-sm text-white/60">pour</div>
                        <div className="text-2xl font-semibold">10 minutes</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-white/50">
                      <span className="line-through">14,90 €</span>
                      <span className="text-green-400 font-semibold">(-67%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Included perks */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <span className="text-celestial-gold text-xl">✓</span>
                  <div>
                    <p className="font-semibold text-sm">Badge Membre Fondateur</p>
                    <p className="text-xs text-white/60">Statut privilégié permanent</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <span className="text-celestial-gold text-xl">✓</span>
                  <div>
                    <p className="font-semibold text-sm">Astrologue personnel</p>
                    <p className="text-xs text-white/60">Continuité garantie</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <span className="text-celestial-gold text-xl">✓</span>
                  <div>
                    <p className="font-semibold text-sm">Horoscope du matin</p>
                    <p className="text-xs text-white/60">Basé sur votre thème natal</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <span className="text-celestial-gold text-xl">✓</span>
                  <div>
                    <p className="font-semibold text-sm">Accès anticipé</p>
                    <p className="text-xs text-white/60">Nouvelles fonctionnalités en avant-première</p>
                  </div>
                </div>
              </div>

              {/* Urgency */}
              <div className="text-center mb-6 space-y-2">
                <p className="text-white/60 text-sm">
                  <span className="text-celestial-gold font-semibold">Offre de lancement — 30 jours</span>
                </p>
                <p className="text-white/50 text-xs">
                  Places limitées • Premier arrivé, premier servi
                </p>
              </div>

              {/* CTA */}
              <div className="text-center">
                <Link 
                  href="/auth"
                  className="btn-primary text-lg inline-block"
                >
                  Rejoindre le Cercle Fondateur
                </Link>
                <p className="text-white/40 text-xs mt-4">
                  Après votre première consultation : 1,49 €/min ou packs avantageux
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 sm:py-24 space-y-12">
          <h2 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl font-bold text-center text-glow">
            Comment ça fonctionne
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="space-y-3 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-celestial-gold font-bold text-2xl">1</span>
                <h3 className="text-lg font-semibold">Créez votre compte</h3>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                Indiquez votre date, heure et lieu de naissance pour établir votre thème natal complet.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-celestial-gold font-bold text-2xl">2</span>
                <h3 className="text-lg font-semibold">Choisissez votre astrologue</h3>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                Sélectionnez l'astrologue qui résonne avec vous. Il deviendra votre accompagnant personnel.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-celestial-gold font-bold text-2xl">3</span>
                <h3 className="text-lg font-semibold">Parlez librement</h3>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                Consultation vocale en direct. Posez vos questions, explorez vos transits, approfondissez votre chemin.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-celestial-gold font-bold text-2xl">4</span>
                <h3 className="text-lg font-semibold">Retrouvez votre historique</h3>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                Toutes vos consultations sont sauvegardées. Votre astrologue se souvient de votre parcours.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 sm:py-24 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl font-bold text-glow">
              Tarifs transparents
            </h2>
            <p className="text-white/70">Payez uniquement le temps de consultation. Arrêtez quand vous voulez.</p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Pay as you go */}
            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold">Consultation à la minute</h3>
                  <p className="text-white/60 text-sm">Sans engagement</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-3xl font-bold text-celestial-gold">1,49 €/min</p>
                  <p className="text-sm text-white/60">tarif standard</p>
                </div>
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-white/60 text-sm">
                  Offre découverte : <span className="text-celestial-gold font-semibold">0,99 €/min</span> pour les 3 premières minutes
                </p>
                <p className="text-white/50 text-xs mt-1">
                  (uniquement si vous ne rejoignez pas le Cercle Fondateur)
                </p>
              </div>
            </div>

            {/* Packs */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 space-y-3 text-center">
                <div className="text-2xl font-bold text-celestial-gold">12,90 €</div>
                <div className="text-lg font-semibold">Pack 10 min</div>
                <div className="text-xs text-white/50">1,29 €/min</div>
              </div>

              <div className="p-6 rounded-xl bg-celestial-purple/20 backdrop-blur-sm border border-celestial-purple/40 space-y-3 text-center relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-celestial-gold text-celestial-dark text-xs font-bold rounded-full">
                  Populaire
                </div>
                <div className="text-2xl font-bold text-celestial-gold">34,90 €</div>
                <div className="text-lg font-semibold">Pack 30 min</div>
                <div className="text-xs text-white/50">1,16 €/min</div>
              </div>

              <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 space-y-3 text-center">
                <div className="text-2xl font-bold text-celestial-gold">59,90 €</div>
                <div className="text-lg font-semibold">Pack 60 min</div>
                <div className="text-xs text-white/50">~1 €/min</div>
              </div>
            </div>

            <p className="text-center text-white/50 text-sm pt-4">
              Les packs minutes sont disponibles après votre inscription
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 sm:py-24 space-y-12">
          <h2 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl font-bold text-center text-glow">
            Questions fréquentes
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <details className="group p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <summary className="cursor-pointer text-lg font-semibold list-none flex items-center justify-between">
                <span>Est-ce vraiment mon thème natal qui guide la consultation ?</span>
                <span className="text-celestial-gold transition-transform group-open:rotate-180">↓</span>
              </summary>
              <p className="mt-4 text-white/70 text-sm leading-relaxed">
                Oui, absolument. Dès votre inscription, nous calculons votre thème natal complet à partir de votre date, heure et lieu de naissance précis. Chaque consultation est guidée par la carte du ciel qui était la vôtre au moment de votre naissance : positions planétaires, maisons, aspects, nœuds lunaires. Votre astrologue a accès à toutes ces données pour vous offrir une lecture personnalisée et précise.
              </p>
            </details>

            <details className="group p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <summary className="cursor-pointer text-lg font-semibold list-none flex items-center justify-between">
                <span>Puis-je garder le même astrologue d'un appel à l'autre ?</span>
                <span className="text-celestial-gold transition-transform group-open:rotate-180">↓</span>
              </summary>
              <p className="mt-4 text-white/70 text-sm leading-relaxed">
                Oui, c'est même le cœur de notre approche. Une fois que vous avez choisi votre astrologue, il devient votre accompagnant personnel. À chaque nouvelle consultation, vous retrouvez la même voix, le même regard, la même sensibilité. Cette continuité permet une relation de confiance et un accompagnement en profondeur.
              </p>
            </details>

            <details className="group p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <summary className="cursor-pointer text-lg font-semibold list-none flex items-center justify-between">
                <span>Mon historique de consultations est-il conservé ?</span>
                <span className="text-celestial-gold transition-transform group-open:rotate-180">↓</span>
              </summary>
              <p className="mt-4 text-white/70 text-sm leading-relaxed">
                Oui. Votre astrologue a accès à l'historique de vos échanges. Si vous avez déjà parlé d'un transit, d'une question relationnelle ou d'un projet professionnel lors d'une consultation précédente, il s'en souviendra et pourra faire des liens avec votre situation actuelle. Vous n'avez pas besoin de tout réexpliquer à chaque fois.
              </p>
            </details>

            <details className="group p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <summary className="cursor-pointer text-lg font-semibold list-none flex items-center justify-between">
                <span>Pourquoi ces tarifs sont-ils plus accessibles qu'ailleurs ?</span>
                <span className="text-celestial-gold transition-transform group-open:rotate-180">↓</span>
              </summary>
              <p className="mt-4 text-white/70 text-sm leading-relaxed">
                Nous lançons actuellement Callastral avec une offre spéciale "Cercle Fondateur" pour nos 100 premiers membres. C'est une vraie opportunité de rejoindre un service premium dès son lancement, à des tarifs exceptionnels. Cette offre ne compromet en aucun cas la qualité de nos consultations — elle reflète notre volonté de bâtir une communauté solide de passionnés d'astrologie. Au-delà de l'offre de lancement, nos tarifs restent accessibles grâce à la consultation vocale à distance et notre disponibilité 24/7, qui nous permettent d'optimiser nos coûts sans sacrifier l'expertise astrologique.
              </p>
            </details>

            <details className="group p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <summary className="cursor-pointer text-lg font-semibold list-none flex items-center justify-between">
                <span>Puis-je arrêter la consultation quand je veux ?</span>
                <span className="text-celestial-gold transition-transform group-open:rotate-180">↓</span>
              </summary>
              <p className="mt-4 text-white/70 text-sm leading-relaxed">
                Oui, vous gardez toujours le contrôle. Vous pouvez mettre fin à la consultation à tout moment en raccrochant simplement. Vous ne payez que les minutes réellement écoulées. Aucun engagement, aucune facturation automatique surprise.
              </p>
            </details>

            <details className="group p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <summary className="cursor-pointer text-lg font-semibold list-none flex items-center justify-between">
                <span>Mes données de naissance sont-elles protégées ?</span>
                <span className="text-celestial-gold transition-transform group-open:rotate-180">↓</span>
              </summary>
              <p className="mt-4 text-white/70 text-sm leading-relaxed">
                Absolument. Vos données personnelles et votre thème natal sont stockés de manière sécurisée et ne sont jamais partagés avec des tiers. Nous respectons la confidentialité de vos informations et de vos échanges avec votre astrologue.
              </p>
            </details>

            <details className="group p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <summary className="cursor-pointer text-lg font-semibold list-none flex items-center justify-between">
                <span>Comment fonctionne le paiement à la minute et les packs ?</span>
                <span className="text-celestial-gold transition-transform group-open:rotate-180">↓</span>
              </summary>
              <p className="mt-4 text-white/70 text-sm leading-relaxed">
                Lors de votre première consultation, vous bénéficiez de l'offre découverte : 0,99 €/minute pour les 3 premières minutes, puis 1,49 €/minute. Vous pouvez ensuite acheter des packs de minutes pour réduire le coût (jusqu'à ~1 €/min pour le pack 60 minutes). Les minutes achetées sont déduites automatiquement lors de vos consultations.
              </p>
            </details>

            <details className="group p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <summary className="cursor-pointer text-lg font-semibold list-none flex items-center justify-between">
                <span>Y a-t-il un horoscope quotidien ou un espace personnel ?</span>
                <span className="text-celestial-gold transition-transform group-open:rotate-180">↓</span>
              </summary>
              <p className="mt-4 text-white/70 text-sm leading-relaxed">
                Nous travaillons actuellement sur des fonctionnalités complémentaires : horoscope personnalisé basé sur votre thème natal, espace de suivi de vos transits importants, et journal de vos consultations. Ces outils seront progressivement déployés dans les prochains mois pour enrichir votre expérience.
              </p>
            </details>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 text-center space-y-8">
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl font-bold text-glow">
              Prêt à explorer votre carte du ciel ?
            </h2>
            <p className="text-white/70 text-lg">
              Créez votre compte en 2 minutes et commencez votre première consultation.
            </p>
          </div>
          
          <Link 
            href="/auth"
            className="btn-primary text-lg inline-block"
          >
            Commencer maintenant
          </Link>
        </section>

        {/* Footer */}
        <footer className="pt-16 pb-8 text-center text-white/40 text-xs border-t border-white/10">
          <p>© {new Date().getFullYear()} Callastral — Consultations astrologiques personnalisées</p>
        </footer>

      </div>

      <InstallPrompt />
    </main>
  );
}
