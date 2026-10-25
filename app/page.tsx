import type { Metadata } from 'next';
import Link from 'next/link';
import AdvisorDirectory from '@/components/AdvisorDirectory';
import HomePlans from '@/components/HomePlans';
import InstallPrompt from '@/components/InstallPrompt';
import PromoStrip from '@/components/PromoStrip';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import TrialStickyCta from '@/components/TrialStickyCta';
import VoiceSample from '@/components/VoiceSample';
import {
  FEATURED_ADVISOR_LIMIT,
  HOME_DISCLOSURE,
  HOME_H1,
  HOME_SUB,
  HOME_TITLE,
  MEMORY_FAQ,
  homeDescription,
  homePrimaryCta,
  homeReassure,
  homeSecondaryCta,
  publicPerMinute,
} from '@/lib/home-offer';
import { resolveMarket } from '@/lib/market';
import { MARKET_PRICING, marketCodeForContext } from '@/lib/money';
import { hreflangAlternates, localeHomePath } from '@/lib/seo';
import { listDirectoryAdvisors } from '@/lib/slots';
import { trialPath } from '@/lib/free-call';
import { weeklyCurrency } from '@/lib/weekly';

export async function generateMetadata(): Promise<Metadata> {
  const market = await resolveMarket();
  const code = marketCodeForContext({
    country: market.country,
    locale: market.language,
    currency: market.currency,
  });
  const currency = weeklyCurrency(MARKET_PRICING[code].currency);
  const description = homeDescription('fr', currency);
  return {
    title: HOME_TITLE.fr,
    description,
    alternates: {
      canonical: '/fr',
      languages: hreflangAlternates(localeHomePath),
    },
    openGraph: {
      title: HOME_TITLE.fr,
      description,
      url: '/fr',
    },
  };
}

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ dispo?: string; recall?: string; all?: string }>;
}) {
  const params = await searchParams;
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
  const code = marketCodeForContext({
    country: market.country,
    locale: market.language,
    currency: market.currency,
  });
  const grid = MARKET_PRICING[code];
  const currency = weeklyCurrency(grid.currency);
  const showAll = params.all === '1';
  const featured = showAll ? advisors : advisors.slice(0, FEATURED_ADVISOR_LIMIT);
  const memory = MEMORY_FAQ.fr;

  return (
    <main className="min-h-screen pb-28 sm:pb-12">
      <SiteHeader />
      <div className="max-w-4xl mx-auto px-4 pt-5 sm:pt-8">
        <h1 className="font-[family-name:var(--font-cinzel)] text-2xl sm:text-4xl text-glow">
          {HOME_H1.fr}
        </h1>
        <p className="mt-3 text-white/80 leading-relaxed">{HOME_SUB.fr}</p>
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <Link href={trialPath('fr')} data-primary-cta="trial" data-cta="hero-home" className="btn-primary text-center">
            {homePrimaryCta('fr')}
          </Link>
          <Link href="/book?offer=decouverte" className="btn-secondary text-center">
            {homeSecondaryCta('fr', currency)}
          </Link>
        </div>
        <p className="mt-3 text-sm text-white/70">{HOME_DISCLOSURE}</p>
        <p className="mt-2 text-xs text-white/50">{homeReassure('fr')}</p>
        <VoiceSample locale="fr" src="/samples/sample-fr.mp3" />
      </div>
      <HomePlans locale="fr" currency={currency} />
      <div className="max-w-4xl mx-auto px-4">
        <section className="py-16 space-y-8">
          <h2 className="font-[family-name:var(--font-cinzel)] text-3xl font-bold text-center text-glow">
            Comment ça fonctionne
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <Step n="1" title="Écoutez un extrait">
              Vingt-cinq secondes, générées par IA, pour entendre le ton avant d’appeler.
            </Step>
            <Step n="2" title="Essayez 3 minutes">
              Un code à six chiffres arrive par e-mail. L’appel s’arrête à trois minutes.
            </Step>
            <Step n="3" title="Choisissez votre formule">
              Découverte, Essentiel ou Premium. La première semaine Découverte est à tarif réduit. Résiliation en un clic.
            </Step>
          </div>
        </section>
      </div>
      <AdvisorDirectory
        embedded
        hideSticky
        advisors={featured}
        unavailable={unavailable}
        preferredLanguage="fr"
        currency={grid.currency}
        country={market.country}
        rates={market.rates}
        showPerMinute={publicPerMinute()}
        initialAvailability={params.dispo === 'now' ? 'now' : ''}
        highlightId={params.recall || ''}
      />
      {!showAll && advisors.length > featured.length && (
        <p className="max-w-6xl mx-auto px-4 -mt-4 mb-8">
          <Link href="/?all=1" className="text-celestial-gold underline">Voir tous les conseillers</Link>
        </p>
      )}
      <div className="max-w-4xl mx-auto px-4">
        <section className="py-12 space-y-6">
          <h2 className="font-[family-name:var(--font-cinzel)] text-3xl font-bold text-center text-glow">
            Questions fréquentes
          </h2>
          <details className="p-6 rounded-xl bg-white/5 border border-white/10" open>
            <summary className="cursor-pointer text-lg font-semibold">Qui sont les conseillers Callastral ?</summary>
            <p className="mt-4 text-white/70 text-sm leading-relaxed">{HOME_DISCLOSURE}</p>
          </details>
          <details className="p-6 rounded-xl bg-white/5 border border-white/10">
            <summary className="cursor-pointer text-lg font-semibold">{memory.question}</summary>
            <p className="mt-4 text-white/70 text-sm leading-relaxed">{memory.answer}</p>
          </details>
          <details className="p-6 rounded-xl bg-white/5 border border-white/10">
            <summary className="cursor-pointer text-lg font-semibold">Puis-je arrêter quand je veux ?</summary>
            <p className="mt-4 text-white/70 text-sm leading-relaxed">
              Oui. L’essai s’arrête à trois minutes. Une formule hebdomadaire se résilie en un clic depuis le compte.
            </p>
          </details>
        </section>

        <PromoStrip ids={['10']} />
        <SiteFooter locale="fr" />
      </div>
      <InstallPrompt lifted />
      <TrialStickyCta href={trialPath('fr')} source="home" />
    </main>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: string }) {
  return (
    <div className="space-y-2 p-6 rounded-2xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-3">
        <span className="text-celestial-gold font-bold text-2xl">{n}</span>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-white/70 text-sm leading-relaxed">{children}</p>
    </div>
  );
}
