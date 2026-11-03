# Horoscope du jour — format et génération

## Ce qui est écrit chaque matin (routine 08:00 Paris)
Rien ne change pour la routine. Elle produit toujours `content/daily-horoscope/<date>.json` :
- `sky` : calculé par `scripts/daily-horoscope-sky.ts` (positions, phase, ingrès, aspects) ;
- `en|fr.summary` et `en|fr.signs.<sign>` : textes rédigés.
Elle lance ensuite `node scripts/daily-horoscope-index.mjs`.

## Nouveau depuis le 2026-11-03 : lecture par signe calculée
`lib/daily-horoscope-insights.ts` (`dailyInsights(locale, sign, day)`) ajoute à chaque page
`/<date>/<sign>` et `/<sign>` six blocs calculés **à partir de `sky`** :
la Lune (maison solaire, ingrès, phase), les planètes qui touchent le signe (conjonction, opposition,
carré, trigone et sextile par signe entier, plus la planète maîtresse), l'amour (Vénus, Mars),
le travail (Mars, Mercure, Saturne), l'argent (Jupiter, maisons 2 et 8) et les aspects du jour
placés dans les maisons du signe.
- Comme ces blocs sont calculés au rendu, toute nouvelle date en profite sans changer le JSON.
- Ils ne contiennent ni prédiction datée ni promesse (« il/elle reviendra », gains, rencontres). Le test
  `tests/daily-insights.test.ts` le vérifie, ainsi qu'au moins 250 mots par signe et un texte différent pour chaque signe.
- Pour gagner encore en contenu unique, la routine peut allonger `signs.<sign>` (200 à 300 mots,
  avec des détails propres au jour). Le format reste le même.

## Mise en page
Le texte du signe, les blocs calculés, le ciel du jour, le CTA avec la mention IA (inchangée) et la FAQ sont dans `<main>`.
L'en-tête et ses langues passent avant `<main>`. « Autres signes », « Aller plus loin », les archives,
la méthode et l'avertissement passent dans un `<aside>` après `<main>`.
