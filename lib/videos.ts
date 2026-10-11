export type PromoVideo = {
  id: string;
  title: string;
  description: string;
  src: string;
  poster: string;
  durationSec: number;
  durationIso: string;
  uploadDate: string;
};

/** Vidéos TikTok françaises. Dates d’ajout au site : 6 au 10 octobre 2026. */
export const PROMO_VIDEOS: PromoVideo[] = [
  {
    id: '03',
    title: '3 signes qui s’attachent trop vite',
    description:
      'Cancer, Poissons et Scorpion : une lecture légère de trois signes qui s’attachent vite. Divertissement. Les conseillères Callastral sont des personas générées par IA.',
    src: '/videos/03-signes-attachent-vite.mp4',
    poster: '/videos/03-cover.jpg',
    durationSec: 27,
    durationIso: 'PT27S',
    uploadDate: '2026-10-06',
  },
  {
    id: '04',
    title: 'Les signes qui reviennent vers leur ex',
    description:
      'Poissons, Balance et Taureau dans une saynète sur le retour vers l’ex. Divertissement, sans prédiction. Voix et images générées par IA.',
    src: '/videos/04-signes-ex.mp4',
    poster: '/videos/04-cover.jpg',
    durationSec: 27,
    durationIso: 'PT27S',
    uploadDate: '2026-10-06',
  },
  {
    id: '05',
    title: 'Ton signe quand tu es jalouse',
    description:
      'Une saynète sur la jalousie selon le signe. Contenu généré par IA, pour le divertissement uniquement.',
    src: '/videos/05-jalouse-signe.mp4',
    poster: '/videos/05-cover.jpg',
    durationSec: 25,
    durationIso: 'PT25S',
    uploadDate: '2026-10-07',
  },
  {
    id: '06',
    title: 'Les signes qui ghostent',
    description:
      'Gémeaux, Verseau et Sagittaire dans une saynète sur le ghosting. Voix et images générées par IA, pour le divertissement.',
    src: '/videos/06-signes-qui-ghostent.mp4',
    poster: '/videos/06-cover.jpg',
    durationSec: 23,
    durationIso: 'PT23S',
    uploadDate: '2026-10-07',
  },
  {
    id: '07',
    title: 'Ton signe face à un crush',
    description:
      'Lion, Cancer et Bélier : une saynète sur le crush. Contenu généré par IA, sans promesse de résultat.',
    src: '/videos/07-signe-crush.mp4',
    poster: '/videos/07-cover.jpg',
    durationSec: 22,
    durationIso: 'PT22S',
    uploadDate: '2026-10-08',
  },
  {
    id: '08',
    title: 'Le pire défaut en amour',
    description:
      'Vierge, Balance et Capricorne : une lecture tendre d’un défaut amoureux. Divertissement, voix et images générées par IA.',
    src: '/videos/08-pire-defaut-amour.mp4',
    poster: '/videos/08-cover.jpg',
    durationSec: 24,
    durationIso: 'PT24S',
    uploadDate: '2026-10-09',
  },
  {
    id: '09',
    title: 'Les signes les plus fidèles',
    description:
      'Taureau, Scorpion et Poissons dans une saynète sur la fidélité. Contenu généré par IA, pour le divertissement.',
    src: '/videos/09-signes-plus-fideles.mp4',
    poster: '/videos/09-cover.jpg',
    durationSec: 22,
    durationIso: 'PT22S',
    uploadDate: '2026-10-09',
  },
  {
    id: '10',
    title: 'L’énergie de la semaine selon l’élément',
    description:
      'Feu, Terre, Air et Eau : une piste de lecture pour la semaine, pour le divertissement. Voix et images générées par IA.',
    src: '/videos/10-energie-semaine.mp4',
    poster: '/videos/10-cover.jpg',
    durationSec: 24,
    durationIso: 'PT24S',
    uploadDate: '2026-10-10',
  },
];

export const VIDEOS_PATH = '/fr/videos';

export const AI_VIDEO_LABEL = 'Contenu généré par IA';

export function videosByIds(ids: string[]): PromoVideo[] {
  const wanted = new Set(ids);
  return PROMO_VIDEOS.filter((video) => wanted.has(video.id));
}

export function videoObject(origin: string, video: PromoVideo) {
  return {
    '@type': 'VideoObject',
    name: video.title,
    description: video.description,
    thumbnailUrl: `${origin}${video.poster}`,
    contentUrl: `${origin}${video.src}`,
    uploadDate: video.uploadDate,
    duration: video.durationIso,
    inLanguage: 'fr-FR',
    isFamilyFriendly: true,
    publisher: { '@type': 'Organization', name: 'Callastral', url: origin },
  };
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Sitemap vidéo (namespace video). Une URL, huit entrées video:video. */
export function videoSitemapXml(origin: string): string {
  const loc = `${origin}${VIDEOS_PATH}`;
  const blocks = PROMO_VIDEOS.map((video) => `    <video:video>
      <video:thumbnail_loc>${xmlEscape(`${origin}${video.poster}`)}</video:thumbnail_loc>
      <video:title>${xmlEscape(video.title)}</video:title>
      <video:description>${xmlEscape(video.description)}</video:description>
      <video:content_loc>${xmlEscape(`${origin}${video.src}`)}</video:content_loc>
      <video:duration>${video.durationSec}</video:duration>
      <video:publication_date>${video.uploadDate}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
    </video:video>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  <url>
    <loc>${xmlEscape(loc)}</loc>
${blocks}
  </url>
</urlset>
`;
}
