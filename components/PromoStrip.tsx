import Link from 'next/link';
import PromoVideo from '@/components/PromoVideo';
import { videosByIds, VIDEOS_PATH } from '@/lib/videos';

/** Bandeau vidéo réservé au français, sous la ligne de flottaison. */
export default function PromoStrip({ ids }: { ids: string[] }) {
  const videos = videosByIds(ids);
  if (videos.length === 0) return null;
  return (
    <section className="mt-12" aria-label="Vidéos">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-[family-name:var(--font-cinzel)] text-2xl">Vidéos</h2>
        <Link href={VIDEOS_PATH} className="text-sm underline text-celestial-gold">
          Toutes les vidéos
        </Link>
      </div>
      <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
        {videos.map((video) => (
          <PromoVideo key={video.id} video={video} />
        ))}
      </div>
    </section>
  );
}
