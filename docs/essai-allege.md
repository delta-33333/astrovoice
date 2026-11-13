# Essai gratuit allégé (13 nov. 2026)

**Avant** : e-mail + consentement IA + code à 6 chiffres reçu par e-mail, puis appel de 3 min.

**Maintenant** : consentement IA (case obligatoire, inchangée) → « Commencer l’appel » → appel de 3 min.
L’e-mail est demandé **après** l’appel (écran de fin), avec le même code à 6 chiffres, pour garder le compte et recevoir le résumé.
La mini-lecture du ciel de l’accueil ne demande jamais d’e-mail.

## Pourquoi ce choix
- Le coût réel est l’appel vocal (3 min). La vérification e-mail avant l’appel ne protégeait pas mieux que les contrôles appareil/réseau déjà en place, mais faisait perdre la plupart des visiteurs mobiles (changement d’app pour lire le code).
- Garde-fous côté serveur (`/api/trial/quick`, `beginQuickTrial`) :
  - consentement IA obligatoire (refus 400 sans) ;
  - 1 essai par appareil (cookie `ca_dev` haché) et par réseau (IP hachée, même règle qu’avant) ;
  - 1 essai par compte (compte connecté déjà utilisé ou e-mail déjà utilisé → refus) ;
  - plafond quotidien `FREE_CALL_DAILY_CAP` inchangé ;
  - limite 3 demandes/heure/IP + pot de miel ;
  - la durée reste plafonnée à 180 s côté jeton vocal.
- Au rattachement de l’e-mail après l’appel : refus si l’adresse a déjà servi à un essai ou appartient à un compte existant (1 essai par e-mail), code à usage unique, 5 essais max, 10 min.
- L’ancien parcours e-mail + code (`/api/trial/start`, `/api/trial/verify`) reste en place.

## Base
Migration `20261113070000_free_trials_quick_start.sql` : colonnes `pending_email` et `quick` sur `callastral.free_trials`.
Les comptes d’essai sans e-mail ont `username = trial:<uuid>` et `email = null` ; aucun e-mail ne leur est envoyé.
