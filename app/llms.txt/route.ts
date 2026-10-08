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

Callastral propose une consultation astrologique par téléphone, à partir du thème natal (date, heure et lieu de naissance). Un conseiller a un tarif propre, entre 0,50 € et 1,99 € par minute. Les trois premières minutes sont à un tarif réduit. Le paiement se fait avant l’appel.

Offres : packs de minutes, résumé écrit 2,90 €, thème natal 9,90 €, prévision 2026-2027 14,90 €, compatibilité 7,90 €, abonnement Callastral Illimité 49 € par mois (300 minutes par mois, 60 minutes par appel). Page : ${origin}/offres

Les conseillers Callastral sont des voix et des personas virtuels créés par Callastral.

## Langues

Pages d’accueil : ${LOCALES.map((locale) => `${origin}/${locale}`).join(' ')}

La langue par défaut (x-default) est le français : ${origin}/fr

## Fiches conseillers

${professions}

Une fiche n’est indexée que dans les langues parlées par le conseiller. Les autres locales restent accessibles, avec noindex.

## Thématiques

${hubs}

## Transparence et comparatifs (mis à jour le 3 octobre 2026)

- À propos (qui exploite Callastral, conseillers virtuels, Swiss Ephemeris, prix, remboursements) : ${origin}/a-propos — EN : ${origin}/about
- Tarifs de la voyance et de l’astrologie par téléphone en 2026, prix sourcés : ${origin}/fr/tarifs-voyance-telephone-2026 — EN : ${origin}/en/phone-psychic-prices-2026
- Comparatif honnête des sites (Callastral = notre service) : ${origin}/fr/meilleurs-sites-voyance-2026 — EN : ${origin}/en/best-psychic-sites-2026
- Calcul ascendant gratuit, sans compte, même éphéméride que les consultations : ${origin}/fr/calcul-ascendant-gratuit

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
