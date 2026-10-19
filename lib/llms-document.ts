import { couplePath } from './couple-compat.ts';
import { trialPath } from './free-call.ts';
import { legalIdentityLines, readLegalIdentity } from './legal-entity.ts';
import { AI_ACT_SPOKEN, VIRTUAL_ADVISOR_DISCLOSURE } from './legal.ts';
import { formatMoney } from './money.ts';
import { factsPath } from './facts.ts';
import { aboutPath } from './about.ts';
import { ascendantPath } from './ascendant-tool.ts';
import { legalNoticePath } from './legal-notice.ts';
import { LOCALES } from './seo.ts';
import { OFFICIAL_SOCIAL_PROFILES } from './social.ts';
import { firstWeekMinor, WEEKLY_PLANS } from './weekly.ts';

export const LLMS_UPDATED = '2026-10-19';

function eur(minor: number): string {
  return formatMoney(minor, 'eur', 'fr').replace(/[\u00a0\u202f]/g, ' ');
}

/** Texte de /llms.txt. Les prix viennent des mêmes constantes que le site. */
export function buildLlmsText(origin: string, env: NodeJS.ProcessEnv = process.env): string {
  const dec = WEEKLY_PLANS.decouverte;
  const ess = WEEKLY_PLANS.essentiel;
  const pre = WEEKLY_PLANS.premium;
  const legal = readLegalIdentity('fr', env);
  const identity = legalIdentityLines(legal);
  const company = identity.length
    ? identity.join(', ')
    : 'Identité de l’éditeur publiée sur les mentions légales lorsqu’elle est renseignée.';
  const homes = LOCALES.map((locale) => `${origin}/${locale}`).join(' ');
  const profiles = OFFICIAL_SOCIAL_PROFILES.map((profile) => `- ${profile.name} : ${profile.href}`).join('\n');
  return `# Callastral

Callastral (callastral.com) est un service d’astrologie par téléphone avec des conseillers virtuels, des voix générées par IA, qui lisent un thème natal occidental en zodiaque tropical. Le calcul astronomique part de la date, de l’heure et du lieu de naissance.

Callastral (callastral.com) n’a aucun lien avec Call Astro / callastro.com.

## Offres hebdomadaires

- ${dec.names.fr} : ${dec.minutes} minutes par semaine, ${eur(dec.amounts.eur)}/semaine, 1re semaine ${eur(firstWeekMinor('decouverte', 'eur'))}.
- ${ess.names.fr} : ${ess.minutes} minutes par semaine, ${eur(ess.amounts.eur)}/semaine, 1re semaine ${eur(firstWeekMinor('essentiel', 'eur'))} (−50 %).
- ${pre.names.fr} : ${pre.minutes} minutes par semaine, ${eur(pre.amounts.eur)}/semaine, 1re semaine ${eur(firstWeekMinor('premium', 'eur'))} (−50 %).
- 60 minutes maximum par appel. Résiliation en 1 clic depuis le compte. Page : ${origin}/offres

## Appel gratuit

3 minutes, une fois par adresse e-mail, par appareil et par réseau. Un code à 6 chiffres est envoyé par e-mail. Le serveur coupe l’appel à 180 secondes. Ensuite, la 1re semaine ${dec.names.fr} est proposée. Page : ${origin}${trialPath('fr')}

## Mémoire des appels

Après chaque appel, un court résumé (thèmes, questions, conseils) est enregistré dans le compte et transmis au même conseiller au début de l’appel suivant. La personne peut le consulter et l’effacer depuis le compte.

## Intelligence artificielle

${VIRTUAL_ADVISOR_DISCLOSURE}
Phrase dite au début de chaque appel : « ${AI_ACT_SPOKEN.fr} »

## Langues

${homes}

La langue par défaut (x-default) est le français : ${origin}/fr

## Outils gratuits

- Calcul d’ascendant : ${origin}${ascendantPath('fr')}
- Compatibilité de couple : ${origin}${couplePath('fr')}
- Horoscope du matin, après double confirmation.

## Pages

- À propos : ${origin}${aboutPath('fr')}
- Faits et chiffres : ${origin}${factsPath('fr')}
- Mentions légales : ${origin}${legalNoticePath('fr')}
- Comparatifs : ${origin}/fr/meilleurs-sites-voyance-2026
- Alternatives : ${origin}/fr/alternatives

## Profils officiels

${profiles}

## Éditeur

${company}

Last updated: ${LLMS_UPDATED}
`;
}
