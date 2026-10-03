import { GUARANTEE_TEXT } from '@/lib/guarantee-text';
import { INTRO_MINUTES, bandTableText } from '@/lib/price-bands';
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

Callastral propose une consultation astrologique par téléphone, à partir du thème natal (date, heure et lieu de naissance). Chaque conseiller a un tarif propre, placé dans la fourchette du pays depuis lequel on consulte (pays détecté automatiquement ; à défaut, tarifs France). Les ${INTRO_MINUTES} premières minutes sont à un tarif réduit (60 % du tarif du conseiller, plafonné). Le prix est affiché avant le paiement et c’est ce montant qui est encaissé. Le paiement se fait avant l’appel.

## Tarifs par minute selon le pays

${bandTableText('fr').map((line) => `- ${line}`).join('\n')}
- Autres pays : tarifs France

Garantie : ${GUARANTEE_TEXT.body}
Annulation d’une réservation : remboursement intégral jusqu’à 24 h avant, sinon avoir valable 30 jours.

Offres : offre fondateur 10 minutes pour 4,90 € (une fois par compte), packs de minutes (France : 10 min 19,90 €, 30 min 55,90 €, 60 min 98,90 €), résumé écrit 2,90 €, thème natal 9,90 €, prévision 2026-2027 14,90 €, compatibilité 7,90 €, abonnement Callastral Illimité 49 € par mois (300 minutes par mois, 60 minutes par appel). Page : ${origin}/offres

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
- Consultation astrale par téléphone (réponse directe, FAQ) : ${origin}/fr/consultation-astrale — EN : ${origin}/en/astrology-reading-by-phone

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
