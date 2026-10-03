import { appBaseUrl } from '@/lib/stripe';
import { SPECIALTY_IDS, hubPath, professionSlug, LOCALES } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export function GET() {
  const origin = appBaseUrl();
  const hubs = LOCALES.flatMap((locale) =>
    SPECIALTY_IDS.map((specialty) => `- ${origin}${hubPath(locale, specialty)}`)
  ).join('\n');
  const professions = LOCALES.map((locale) => `${locale}: /${locale}/${professionSlug(locale)}/{slug}`).join('\n');
  const body = `# Callastral

Callastral propose une consultation astrologique par téléphone, à partir du thème natal (date, heure et lieu de naissance). Un conseiller a un tarif propre, entre 0,50 € et 2,00 € par minute. Les trois premières minutes sont à un tarif réduit. Le paiement se fait avant l’appel.

Les conseillers Callastral sont des voix et des personas virtuels créés par Callastral.

## Langues

Pages d’accueil : ${LOCALES.map((locale) => `${origin}/${locale}`).join(' ')}

La langue par défaut (x-default) est le français : ${origin}/fr

## Fiches conseillers

${professions}

## Thématiques

${hubs}

## Réservation

Le parcours de paiement reste sur ${origin}/ (annuaire) et ${origin}/advisors/{slug}.
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
