import { ImageResponse } from 'next/og';
import { readRates } from '@/lib/market';
import { quoteAdvisor } from '@/lib/money';
import { getAdvisorProfile } from '@/lib/slots';
import { isLocale, localeCurrency, phonePhrase, professionSlug, specialtyLabel } from '@/lib/seo';

export const runtime = 'nodejs';
export const alt = 'Callastral';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function AdvisorOg(props: {
  params: Promise<{ locale: string; segment: string; slug: string }>;
}) {
  const { locale, segment, slug } = await props.params;
  let name = 'Callastral';
  let line = '';
  if (isLocale(locale) && segment === professionSlug(locale)) {
    try {
      const profile = await getAdvisorProfile(slug);
      if (profile.advisor) {
        const quote = quoteAdvisor(profile.advisor.pricePerMinCents, localeCurrency(locale), readRates(), undefined, locale);
        const topic = specialtyLabel(locale, profile.advisor.specialties[0] || 'amour');
        name = profile.advisor.name;
        line = `${topic} · ${phonePhrase(locale)} · ${quote.introLabel}`;
      }
    } catch {
      line = '';
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 72,
          background: '#0c1018',
          color: '#f5f0e6',
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 4, color: '#d4af77' }}>CALLASTRAL</div>
        <div style={{ fontSize: 72, marginTop: 24, lineHeight: 1.05 }}>{name}</div>
        <div style={{ fontSize: 32, marginTop: 28, color: '#d4af77' }}>{line || ' '}</div>
      </div>
    ),
    { ...size }
  );
}
