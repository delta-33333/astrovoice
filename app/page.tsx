import type { Metadata } from 'next';
import Link from 'next/link';
import ChatCta from '@/components/ChatCta';
import AdvisorDirectory from '@/components/AdvisorDirectory';
import FixedPacks from '@/components/FixedPacks';
import Commitments from '@/components/Commitments';
import UseCases from '@/components/UseCases';
import { TRUST_PROMISE } from '@/lib/trust-copy';
import PromoStrip from '@/components/PromoStrip';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import SkyNowHero from '@/components/SkyNowHero';
import TrialStickyCta from '@/components/TrialStickyCta';
import VoiceSample from '@/components/VoiceSample';
import {
  FEATURED_ADVISOR_LIMIT,
  HOME_DISCLOSURE,
  HOME_TITLE,
  MEMORY_FAQ,
  SKY_PROMISE,
  homeDescription,
  homeReassure,
  publicPerMinute,
} from '@/lib/home-offer';
import { resolveMarket } from '@/lib/market';
import { MARKET_PRICING, marketCodeForContext } from '@/lib/money';
import { hreflangAlternates, localeHomePath } from '@/lib/seo';
import { listDirectoryAdvisorsCached } from '@/lib/slots';
import { trialPath } from '@/lib/free-call';
import { VIRTUAL_ADVISOR_DISCLOSURE } from '@/lib/legal';
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
  let advisors: Awaited<ReturnType<typeof listDirectoryAdvisorsCached>>['advisors'] = [];
  let unavailable = false;
  try {
    const result = await listDirectoryAdvisorsCached();
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
        <p className="text-xs uppercase tracking-[0.18em] text-celestial-gold/80">{SKY_PROMISE.fr.eyebrow}</p>
        <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-2xl sm:text-4xl text-glow">
          {SKY_PROMISE.fr.h1}
        </h1>
        <p className="mt-2 text-celestial-gold font-semibold" data-trust-promise>{TRUST_PROMISE.fr}</p>
        <p className="mt-3 text-white/80 leading-relaxed">{SKY_PROMISE.fr.sub}</p>
        <SkyNowHero locale="fr" trialHref={trialPath('fr')} disclosure={VIRTUAL_ADVISOR_DISCLOSURE} />
        <p className="mt-4 text-center sm:text-left">
          <Link href={trialPath('fr')} data-primary-cta="trial" data-cta="hero-home" className="text-sm text-celestial-gold underline underline-offset-4">
            {SKY_PROMISE.fr.direct}
          </Link>
        </p>
        <p className="mt-3 text-xs text-white/60">{HOME_DISCLOSURE}</p>
        <p className="mt-1 text-xs text-white/45">{homeReassure('fr')}</p>
      </div>
      <UseCases locale="fr" trialHref={trialPath('fr')} />
      <FixedPacks locale="fr" trialHref={trialPath('fr')} />
      <Commitments locale="fr" promise={false} />
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
              Un code à six chiffres arrive par e-mail. Aucune carte, aucun abonnement, aucun prélèvement. L’appel s’arrête à trois minutes.
            </Step>
            <Step n="3" title="Prenez un pack à prix fixe">
              10, 20 ou 40 minutes, payées une fois. L’appel s’arrête tout seul quand le pack est utilisé. Jamais un centime de plus.
            </Step>
          </div>
          <VoiceSample locale="fr" src="/samples/sample-fr.mp3" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Link href="/packs?pack=20min&lang=fr" className="btn-secondary text-center">
              Pack 20 minutes à prix fixe
            </Link>
            <ChatCta locale="fr" placement="home-hero" className="w-full sm:w-auto" />
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
              Oui. Vous raccrochez quand vous voulez et les minutes restantes restent sur votre compte. Il n’y a ni abonnement ni recharge automatique : rien n’est prélevé après l’achat d’un pack.
            </p>
          </details>
        </section>

        <PromoStrip ids={['10']} />
        <SiteFooter locale="fr" />
      </div>
      <TrialStickyCta href={trialPath('fr')} source="home" locale="fr" />
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
