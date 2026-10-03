import type { Metadata } from "next";
import Link from "next/link";
import AdvisorDirectory from "@/components/AdvisorDirectory";
import InstallPrompt from "@/components/InstallPrompt";
import SiteHeader from "@/components/SiteHeader";
import { trackEvent } from "@/lib/events";
import { VIRTUAL_ADVISOR_DISCLOSURE } from "@/lib/legal";
import { resolveMarket } from "@/lib/market";
import { convertEurCents, formatMoney, MAX_EUR_CENTS, MIN_EUR_CENTS } from "@/lib/money";
import { SUBSCRIPTION_EUR_CENTS, subscriptionCurrency } from "@/lib/offers";
import { MINUTE_PACKS } from "@/lib/pricing";
import { hreflangAlternates, localeHomePath } from "@/lib/seo";
import { listDirectoryAdvisors } from "@/lib/slots";

export const metadata: Metadata = {
  alternates: {
    canonical: "/fr",
    languages: hreflangAlternates(localeHomePath),
  },
};

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ dispo?: string }>;
}) {
  const params = await searchParams;
  await trackEvent({ name: 'view_home' });
  const market = await resolveMarket();
  let advisors: Awaited<ReturnType<typeof listDirectoryAdvisors>>['advisors'] = [];
  let unavailable = false;
  try {
    const result = await listDirectoryAdvisors();
    advisors = result.advisors;
    unavailable = result.unavailable;
  } catch {
    unavailable = true;
  }
  const money = (eurCents: number) =>
    formatMoney(convertEurCents(eurCents, market.currency, market.rates), market.currency);
  const founding = money(490);
  const floor = money(MIN_EUR_CENTS);
  const ceiling = money(MAX_EUR_CENTS);
  const subscriptionCurrencyCode = subscriptionCurrency(market.currency);
  const subscriptionLabel = formatMoney(
    convertEurCents(SUBSCRIPTION_EUR_CENTS, subscriptionCurrencyCode, market.rates),
    subscriptionCurrencyCode
  );
  const packs = MINUTE_PACKS.filter((pack) => !pack.founding);

  return (
    <main className="min-h-screen pb-28 sm:pb-12">
      <SiteHeader />
      <AdvisorDirectory
        embedded
        advisors={advisors}
        unavailable={unavailable}
        preferredLanguage={market.language}
        currency={market.currency}
        rates={market.rates}
        initialAvailability={params.dispo === 'now' ? 'now' : ''}
      />
      <div className="max-w-4xl mx-auto px-4">

        {/* Cercle Fondateur - Founding Offer */}
        <section className="py-16 sm:py-20">
          <div className="relative max-w-3xl mx-auto">
            {/* Premium card with glow */}
            <div className="relative bg-gradient-to-br from-celestial-purple/20 via-celestial-blue/10 to-celestial-purple/20 backdrop-blur-sm rounded-3xl border-2 border-celestial-gold/50 p-8 sm:p-10 shadow-2xl shadow-celestial-gold/20">
              
              {/* Badge */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                <div className="bg-celestial-gold text-celestial-darker px-4 py-2 rounded-full text-sm font-bold">
                  Cercle Fondateur
                </div>
              </div>

              {/* Title */}
              <h2 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl font-bold text-center mb-4 text-glow">
                Offre de Lancement
              </h2>
              
              <p className="text-center text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Dix minutes de consultation pour {founding}, une fois par compte.
              </p>

              {/* Main offer */}
              <div className="bg-celestial-darker/60 backdrop-blur-sm rounded-2xl p-8 mb-6 border border-celestial-gold/30">
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <p className="text-white/70 text-sm uppercase tracking-wide">Votre première consultation</p>
                    <div className="flex items-center justify-center gap-4">
                      <span className="text-5xl font-bold text-celestial-gold">{founding}</span>
                      <div className="text-left">
                        <div className="text-sm text-white/60">pour</div>
                        <div className="text-2xl font-semibold">10 minutes</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Included perks */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <span className="text-celestial-gold text-xl">✓</span>
                  <div>
                    <p className="font-semibold text-sm">10 minutes</p>
                    <p className="text-xs text-white/60">Pour {founding}, une fois par compte</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <span className="text-celestial-gold text-xl">✓</span>
                  <div>
                    <p className="font-semibold text-sm">Même conseiller</p>
                    <p className="text-xs text-white/60">Vous pouvez le rappeler ensuite</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <span className="text-celestial-gold text-xl">✓</span>
                  <div>
                    <p className="font-semibold text-sm">Thème natal</p>
                    <p className="text-xs text-white/60">Date, heure et lieu de naissance</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <span className="text-celestial-gold text-xl">✓</span>
                  <div>
                    <p className="font-semibold text-sm">Ensuite, le tarif du conseiller</p>
                    <p className="text-xs text-white/60">Affiché sur la fiche, entre {floor} et {ceiling} / min</p>
                  </div>
                </div>
              </div>

              {/* Urgency */}
              <div className="text-center mb-6">
                <p className="text-white/50 text-xs">
                  Une fois par compte, après inscription.
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
                  Après votre première consultation : le tarif indiqué sur la fiche, ou des packs de minutes
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
                <h3 className="text-lg font-semibold">Choisissez un conseiller</h3>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                Ouvrez l’annuaire et prenez quelqu’un de disponible maintenant, dans votre langue.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-celestial-gold font-bold text-2xl">2</span>
                <h3 className="text-lg font-semibold">Prenez un créneau</h3>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                Le prix du conseiller est affiché avant le paiement : tarif réduit les trois premières minutes, puis son tarif habituel.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-celestial-gold font-bold text-2xl">3</span>
                <h3 className="text-lg font-semibold">Créez le compte au paiement</h3>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                Prénom, e-mail et mot de passe suffisent. Apple Pay et Google Pay sont proposés quand votre téléphone les a.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-celestial-gold font-bold text-2xl">4</span>
                <h3 className="text-lg font-semibold">Rejoignez l’appel</h3>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                Après le paiement, ouvrez l’appel ou ajoutez le rendez-vous à votre calendrier. Vous pouvez annuler jusqu’à 24 h avant.
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
            <p className="text-white/70">Chaque conseiller affiche son tarif, entre {floor} et {ceiling} la minute.</p>
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
                  <p className="text-3xl font-bold text-celestial-gold">{floor}–{ceiling}</p>
                  <p className="text-sm text-white/60">par minute, selon le conseiller</p>
                </div>
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-white/60 text-sm">
                  Les 3 premières minutes sont à un tarif réduit, environ deux tiers du tarif du conseiller.
                </p>
              </div>
            </div>

            {/* Packs */}
            <div className="grid sm:grid-cols-3 gap-4">
              {packs.map((pack) => (
                <div
                  key={pack.id}
                  className={`p-6 rounded-xl space-y-3 text-center ${
                    pack.popular
                      ? 'bg-celestial-purple/20 backdrop-blur-sm border border-celestial-purple/40'
                      : 'bg-white/5 backdrop-blur-sm border border-white/10'
                  }`}
                >
                  <div className="text-2xl font-bold text-celestial-gold">{money(pack.amountCents)}</div>
                  <div className="text-lg font-semibold">Pack {pack.minutes} min</div>
                  <div className="text-xs text-white/50">{money(Math.round(pack.amountCents / pack.minutes))}/min</div>
                </div>
              ))}
            </div>

            <div className="p-8 rounded-2xl bg-celestial-gold/10 border border-celestial-gold/40 space-y-3">
              <h3 className="text-xl font-semibold">Callastral Illimité</h3>
              <p className="text-3xl font-bold text-celestial-gold">{subscriptionLabel}<span className="text-base font-normal text-white/70"> / mois</span></p>
              <p className="text-white/75 text-sm">
                Parole sans facturation à la minute, dans la limite de 300 minutes par mois et de 60 minutes par appel. Résiliable à tout moment.
              </p>
              <Link href="/offres" className="text-celestial-gold underline">Voir toutes les offres</Link>
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
            <details className="group p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10" open>
              <summary className="cursor-pointer text-lg font-semibold list-none flex items-center justify-between">
                <span>Qui sont les conseillers Callastral ?</span>
                <span className="text-celestial-gold transition-transform group-open:rotate-180">↓</span>
              </summary>
              <p className="mt-4 text-white/70 text-sm leading-relaxed">
                {VIRTUAL_ADVISOR_DISCLOSURE}
              </p>
            </details>

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
                Chaque conseiller a un tarif entre {floor} et {ceiling} la minute. Les trois premières minutes sont à tarif réduit. L’offre fondateur est de 10 minutes pour {founding}, une fois par compte. Les packs de minutes sont indiqués dans votre devise.
              </p>
            </details>

            <details className="group p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <summary className="cursor-pointer text-lg font-semibold list-none flex items-center justify-between">
                <span>Puis-je arrêter la consultation quand je veux ?</span>
                <span className="text-celestial-gold transition-transform group-open:rotate-180">↓</span>
              </summary>
              <p className="mt-4 text-white/70 text-sm leading-relaxed">
                Oui, vous gardez toujours le contrôle. Vous pouvez mettre fin à la consultation à tout moment. À la minute, vous réglez la durée réellement écoulée. L’abonnement Callastral Illimité est un choix séparé, résiliable depuis le compte.
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
                Une réservation se paie à l’avance : minutes × tarif du conseiller, avec un tarif réduit sur les trois premières minutes. Vous pouvez aussi acheter des packs de minutes, déduits ensuite de la durée de consultation. Le montant est encaissé dans la devise affichée.
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
              Un conseiller est disponible maintenant. Le compte se crée juste avant le paiement.
            </p>
          </div>
          
          <Link 
            href="#annuaire"
            className="btn-primary text-lg inline-block"
          >
            Appeler maintenant
          </Link>
        </section>

        {/* Footer */}
        <footer className="pt-16 pb-8 text-center text-white/40 text-xs border-t border-white/10">
          <p>© {new Date().getFullYear()} Callastral — Consultations astrologiques personnalisées</p>
          <p className="mt-3 space-x-4">
            <Link href="/offres" className="hover:text-white/70">Offres</Link>
            <Link href="/faq" className="hover:text-white/70">Questions fréquentes</Link>
            <Link href="/terms" className="hover:text-white/70">Conditions générales</Link>
            <Link href="/privacy" className="hover:text-white/70">Confidentialité</Link>
          </p>
        </footer>

      </div>

      <InstallPrompt lifted />
    </main>
  );
}
