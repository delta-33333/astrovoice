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
import { FIXED_PACKS } from './pricing.ts';
import { chatPath } from './chat.ts';
import { h2027Path } from './horoscope-2027.ts';
import { dailyHubPath } from './daily-horoscope.ts';

export const LLMS_UPDATED = '2026-11-12';

function eur(minor: number): string {
  return formatMoney(minor, 'eur', 'fr').replace(/[\u00a0\u202f]/g, ' ');
}

/** Texte de /llms.txt. Les prix viennent des mêmes constantes que le site. */
export function buildLlmsText(origin: string, env: NodeJS.ProcessEnv = process.env): string {
  const packs = FIXED_PACKS.map((pack) => {
    const perMinute = eur(Math.round(pack.amountCents / pack.minutes));
    return `- ${pack.minutes} minutes : ${eur(pack.amountCents)} (soit ${perMinute}/min)${pack.popular ? ', le plus choisi' : ''}.`;
  }).join('\n');
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

## Tarifs : packs de minutes à prix fixe

${packs}
- Paiement unique, sans abonnement ni recharge automatique. L’appel s’arrête tout seul quand le pack est utilisé : rien d’autre n’est prélevé.
- Minutes sans date d’expiration. Si la ligne coupe, les minutes non utilisées restent sur le compte.
- Page : ${origin}/fr/offres

## Appel gratuit

3 minutes offertes, sans carte bancaire, une fois par adresse e-mail, par appareil et par réseau. Un code à 6 chiffres est envoyé par e-mail. Le serveur coupe l’appel à 180 secondes. Aucun abonnement n’est créé ensuite. Page : ${origin}${trialPath('fr')}

## Engagements

- Aucune date annoncée pour un événement, aucun « votre ex va revenir » : on parle de tendances et de choix, pas de promesses.
- Thème calculé sur le ciel réel : positions des planètes calculées par éphémérides pour la date, l’heure et le lieu de naissance.
- Réponses franches, sans flatterie, et sans faire durer l’appel.

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
- Horoscope du matin par e-mail, après double confirmation.
- Horoscope du jour, 12 signes, calculé sur le ciel du jour : ${origin}${dailyHubPath('fr')} (anglais : ${origin}${dailyHubPath('en')})
- Horoscope 2027 par signe : ${origin}${h2027Path()}
- Question par message (chat) : ${origin}${chatPath('fr')} (anglais : ${origin}${chatPath('en')})

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
