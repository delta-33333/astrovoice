import { AI_VIDEO_LABEL, type PromoVideo } from '@/lib/videos';

export default function PromoVideo({ video }: { video: PromoVideo }) {
  return (
    <figure className="w-[min(100%,280px)] shrink-0">
      <video
        className="aspect-[9/16] w-full rounded-2xl bg-black object-cover"
        controls
        playsInline
        preload="none"
        poster={video.poster}
        width={1080}
        height={1920}
        aria-label={video.title}
      >
        <source src={video.src} type="video/mp4" />
      </video>
      <figcaption className="mt-2 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-celestial-gold">{AI_VIDEO_LABEL}</p>
        <p className="font-semibold text-white">{video.title}</p>
        <p className="text-sm text-white/80 leading-relaxed">{video.description}</p>
      </figcaption>
    </figure>
  );
}
