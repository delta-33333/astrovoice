# Objets Stripe à créer à la main

L’application lit uniquement les variables d’environnement. Elle ne crée ni produit, ni prix, ni coupon.

## Produits

Trois produits, récurrence hebdomadaire, 60 minutes maximum par appel.

| Produit | Formule | Minutes / semaine | EUR, CHF, GBP | USD |
|---|---|---|---|---|
| Callastral Hebdo Découverte | decouverte | 10 | 5,90 | 6,90 |
| Callastral Hebdo 30 | essentiel | 30 | 14,90 | 16,90 |
| Callastral Hebdo Premium | premium | 60 | 27,90 | 31,90 |

Douze Price, une par formule et par devise. Montants en unité mineure : 590 / 1490 / 2790, et 690 / 1690 / 3190 en USD.

## Coupons

`STRIPE_COUPON_WEEK1_50` : `percent_off` 50, `duration` once. Réservé à Essentiel et Premium. Première facture : 7,45 € / 7,45 CHF / £7.45 / $8.45 (Essentiel) et 13,95 € / 13,95 CHF / £13.95 / $15.95 (Premium).

Coupons Découverte, `amount_off`, `duration` once, une devise chacun. La première facture tombe à 1,99 (1,99 CHF, £1.99) ou 2,49 $.

| Variable | amount_off | Devise | Première facture |
|---|---|---|---|
| STRIPE_COUPON_DECOUVERTE_WEEK1_EUR | 391 | eur | 199 |
| STRIPE_COUPON_DECOUVERTE_WEEK1_CHF | 391 | chf | 199 |
| STRIPE_COUPON_DECOUVERTE_WEEK1_GBP | 391 | gbp | 199 |
| STRIPE_COUPON_DECOUVERTE_WEEK1_USD | 441 | usd | 249 |

Le coupon de bienvenue, quel qu’il soit, s’applique une seule fois par client, toutes formules confondues. Un client qui a déjà eu une formule paie le plein tarif, sans coupon. Au renouvellement, le plein tarif s’applique.

## Variables

```
STRIPE_PRICE_WEEKLY_DECOUVERTE_EUR=
STRIPE_PRICE_WEEKLY_DECOUVERTE_CHF=
STRIPE_PRICE_WEEKLY_DECOUVERTE_GBP=
STRIPE_PRICE_WEEKLY_DECOUVERTE_USD=
STRIPE_PRICE_WEEKLY_ESSENTIEL_EUR=
STRIPE_PRICE_WEEKLY_ESSENTIEL_CHF=
STRIPE_PRICE_WEEKLY_ESSENTIEL_GBP=
STRIPE_PRICE_WEEKLY_ESSENTIEL_USD=
STRIPE_PRICE_WEEKLY_PREMIUM_EUR=
STRIPE_PRICE_WEEKLY_PREMIUM_CHF=
STRIPE_PRICE_WEEKLY_PREMIUM_GBP=
STRIPE_PRICE_WEEKLY_PREMIUM_USD=
STRIPE_COUPON_WEEK1_50=
STRIPE_COUPON_DECOUVERTE_WEEK1_EUR=
STRIPE_COUPON_DECOUVERTE_WEEK1_CHF=
STRIPE_COUPON_DECOUVERTE_WEEK1_GBP=
STRIPE_COUPON_DECOUVERTE_WEEK1_USD=
```

Si le Price ou le coupon requis manque pour un premier client, le checkout répond 503.

## Rappel et résiliation

Cron Vercel sur `/api/cron/weekly-renewal`, en-tête `Authorization: Bearer CRON_SECRET`. L’e-mail part dans les 24 h qui précèdent le premier prélèvement au plein tarif, une seule fois. `invoice.upcoming` peut avancer cette date, pas la créer ni la reculer.

Le projet est sur l’offre Hobby : un cron plus fréquent qu’une fois par jour fait échouer le déploiement. L’expression retenue est donc `0 8 * * *`. Sur une offre qui autorise l’heure, la remplacer par `0 * * * *`.

La résiliation en 1 clic pose `cancel_at_period_end`. L’accès court jusqu’à la fin de la période payée.
