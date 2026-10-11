import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import PromoVideo from '@/components/PromoVideo';
import SeoChrome from '@/components/SeoChrome';
import { AI_VIDEO_LABEL, PROMO_VIDEOS, VIDEOS_PATH, videoObject } from '@/lib/videos';
import { isLocale, localeHomePath } from '@/lib/seo';
import { appBaseUrl } from '@/lib/stripe';

const TITLE = 'Vidéos astrologie | Callastral';
const DESCRIPTION = 'Huit courtes vidéos en français, voix et images générées par IA, pour le divertissement.';

export async function generateMetadata(
  props: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await props.params;
  if (!isLocale(locale)) return {};
  const path = `/${locale}/videos`;
  const french = locale === 'fr';
  return {
    title: french ? TITLE : 'Vidéos (français) | Callastral',
    description: french
      ? DESCRIPTION
      : 'These short videos are in French. Voice and pictures are AI-generated entertainment.',
    alternates: {
      canonical: VIDEOS_PATH,
      languages: { fr: VIDEOS_PATH, 'x-default': VIDEOS_PATH },
    },
    robots: french ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title: french ? TITLE : 'Vidéos (français) | Callastral',
      description: DESCRIPTION,
      url: VIDEOS_PATH,
      type: 'website',
    },
  };
}

export default async function VideosPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  if (!isLocale(locale)) notFound();
  const origin = appBaseUrl();

  if (locale !== 'fr') {
    return (
      <main>
        <SeoChrome locale={locale} alternatePath={(item) => `/${item}/videos`} />
        <article className="max-w-2xl mx-auto px-4 py-10 space-y-4">
          <h1 className="font-[family-name:var(--font-cinzel)] text-3xl text-white">Vidéos</h1>
          <p className="text-white/80 leading-relaxed">
            Ces vidéos sont en français. La voix et les images sont générées par IA.
          </p>
          <p>
            <Link href={VIDEOS_PATH} className="underline text-celestial-gold">Voir les vidéos en français</Link>
          </p>
          <p>
            <Link href={localeHomePath(locale)} className="underline">Home</Link>
          </p>
        </article>
      </main>
    );
  }

  return (
    <main>
      <SeoChrome locale="fr" alternatePath={(item) => `/${item}/videos`} />
      <article className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl">Vidéos</h1>
        <p className="mt-3 max-w-2xl text-white/80 leading-relaxed">
          Huit courtes vidéos en français. {AI_VIDEO_LABEL} : voix et images. Les conseillers Callastral sont des
          personas virtuels. Ces saynètes sont un divertissement, pas une prédiction.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {PROMO_VIDEOS.map((video) => (
            <PromoVideo key={video.id} video={video} />
          ))}
        </div>
      </article>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': PROMO_VIDEOS.map((video) => videoObject(origin, video)),
        }}
      />
    </main>
  );
}
