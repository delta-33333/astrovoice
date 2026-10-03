import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AdvisorProfile from '@/components/AdvisorProfile';
import SiteHeader from '@/components/SiteHeader';
import { trackEvent } from '@/lib/events';
import { resolveMarket } from '@/lib/market';
import { advisorPath, indexableAdvisorLocales } from '@/lib/seo';
import { getAdvisorProfile } from '@/lib/slots';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  try {
    const profile = await getAdvisorProfile(slug);
    if (!profile.advisor) return { title: 'Conseiller — Callastral' };
    return {
      title: `${profile.advisor.name} — Callastral`,
      description: profile.advisor.bio.slice(0, 160),
      robots: { index: false, follow: true },
      alternates: {
        canonical: advisorPath(
          indexableAdvisorLocales(profile.advisor.languages)[0] ?? 'fr',
          profile.advisor.slug
        ),
      },
    };
  } catch {
    return { title: 'Conseiller — Callastral' };
  }
}

export default async function AdvisorPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;

  try {
    const profile = await getAdvisorProfile(slug);
    if (profile.unavailable) {
      return (
        <main className="min-h-screen px-4 py-16 text-center text-white/70">
          La fiche est momentanément indisponible.
        </main>
      );
    }
    if (!profile.advisor) notFound();
    await trackEvent({ name: 'view_advisor', advisorId: profile.advisor.id });
    const market = await resolveMarket();
    return (
      <>
        <SiteHeader />
        <AdvisorProfile
          advisor={profile.advisor}
          slots={profile.slots}
          currency={market.currency}
          rates={market.rates}
        />
      </>
    );
  } catch {
    return (
      <main className="min-h-screen px-4 py-16 text-center text-white/70">
        La fiche est momentanément indisponible.
      </main>
    );
  }
}
