# Lunara — Consultation Astrale Personnalisée

Application web de consultation astrologique vocale à la minute, avec comptes utilisateurs persistants et PWA pour mobile. Développée avec Next.js 15, TypeScript, Tailwind CSS, et Supabase.

## 🌟 Fonctionnalités

### Core
- **Comptes utilisateurs** : Création de compte et connexion avec username/password (bcrypt)
- **Persistance des données** : Informations de naissance et thème natal sauvegardés
- **PWA** : Installation sur l'écran d'accueil (iOS et Android)
- **Consultation vocale en temps réel** avec 5 astrologues aux spécialités différentes
- **Thème natal complet** calculé via Astrology-API.io (Swiss Ephemeris)
- **Conformité EU AI Act** : consentement clair et horodaté

### Tarification & Upsells
- **Pay-as-you-go** : 2 premières minutes à $0.99, puis $1.99/min
- **Packs minutes** : 10 min ($14.99), 30 min ($39.99), 60 min ($69.99) avec économies jusqu'à 40%
- **Rappel rapide** : Favori astrologue sauvegardé
- **Paiement sécurisé** : Stripe avec autorisation pré-consultation et capture exacte

## 🚀 Installation

### Prérequis

- Node.js 18+ et npm
- Compte Stripe (https://dashboard.stripe.com)
- Compte Astrology-API.io (https://astrology-api.io)
- Compte xAI (https://console.x.ai)
- **Compte Supabase** (https://supabase.com) — recommandé pour la production

### Installation locale

```bash
git clone https://github.com/delta-33333/astrovoice.git
cd astrovoice

npm install

cp .env.example .env
# Éditez .env avec vos clés API
```

### Configuration Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Dans le SQL Editor, exécutez le fichier `supabase-schema.sql`
3. Récupérez vos clés dans **Project Settings → API**
4. Ajoutez-les dans `.env` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... # Pour les opérations serveur
```

### Variables d'environnement

Éditez `.env` :

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Astrology API
ASTROLOGY_API_KEY=your_key

# xAI Grok
XAI_API_KEY=xai-...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (requis pour les comptes utilisateurs)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Stripe Price IDs (optionnel pour les upsells)
STRIPE_PRICE_ID_10MIN_PACK=price_...
STRIPE_PRICE_ID_30MIN_PACK=price_...
STRIPE_PRICE_ID_MONTHLY_PASS=price_...
STRIPE_PRICE_ID_NATAL_REPORT=price_...
```

### Lancement

```bash
npm run dev
```

Accédez à http://localhost:3000

## 🏗️ Architecture

### Nouveau flux utilisateur (v2)

**Non connecté :**
1. `/` — Landing avec CTA « Créer un compte » / « Se connecter »
2. `/auth` — Login ou signup (username/password)
3. `/birth` — Collecte données de naissance (une seule fois)
4. `/home` — Page d'accueil utilisateur connecté

**Utilisateur connecté :**
1. `/home` — Bouton « Appeler maintenant » + packs + astrologues
2. `/astrologers` — Choix astrologue (skip si favori défini)
3. `/consent` — Acceptation EU AI Act (skip si déjà accepté)
4. `/payment` — Autorisation Stripe
5. `/call` — Interface vocale temps réel
6. `/complete` — Récapitulatif + upsells (packs, rapport natal, pass mensuel)

### Structure du projet

```
lunara/
├── app/
│   ├── api/
│   │   ├── auth/              # Login, signup, logout, me
│   │   ├── birth-data/        # Sauvegarde infos naissance
│   │   ├── consent/           # Sauvegarde consentement
│   │   ├── purchase-pack/     # Achat packs minutes
│   │   ├── natal-chart/       # Calcul thème natal
│   │   ├── call-session/      # Session vocale
│   │   └── stripe/            # Webhooks & paiements
│   ├── auth/                  # Page login/signup
│   ├── home/                  # Accueil connecté
│   ├── packs/                 # Packs minutes
│   ├── astrologers/           # Sélection astrologue
│   ├── birth/                 # Formulaire naissance
│   ├── preview/               # Aperçu thème natal
│   ├── consent/               # Consentement EU
│   ├── payment/               # Paiement Stripe
│   ├── call/                  # Interface appel
│   ├── complete/              # Fin consultation + upsells
│   └── layout.tsx
├── lib/
│   ├── supabase.ts            # Client Supabase
│   ├── auth.ts                # Fonctions auth (bcrypt, CRUD users)
│   ├── session.ts             # Gestion session cookies
│   ├── types.ts
│   ├── astrologers.ts
│   └── utils.ts
├── components/
│   └── InstallPrompt.tsx      # Bannière installation PWA
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   └── icon.svg               # Icône app
├── supabase-schema.sql        # Schema SQL pour Supabase
└── package.json
```

## 📱 PWA (Progressive Web App)

L'application est installable sur mobile :

- **Android/Chrome** : Bannière automatique « Ajouter à l'écran d'accueil »
- **iOS Safari** : Instructions guidées (Partager → Sur l'écran d'accueil)
- **Service Worker** : Cache offline pour une expérience rapide
- **Standalone mode** : Plein écran sans barre d'adresse

Le prompt d'installation apparaît sur `/` et `/home`, dismissible avec mémorisation dans localStorage.

## 💳 Tarification & Packs

### Pay-as-you-go
- **Intro** : 2 premières minutes à $0.99
- **Après** : $1.99/min (facturation à la seconde)
- **Hold Stripe** : $19.90 max (~10 min)
- **Alerte** : Pop-up à $20 pendant l'appel

### Packs Minutes (prépayés)

| Pack | Prix | Prix normal | Économie |
|------|------|-------------|----------|
| 10 min | $14.99 | $19.90 | $4.91 (25%) |
| 30 min | $39.99 | $59.70 | $19.71 (33%) |
| 60 min | $69.99 | $119.40 | $49.41 (41%) |

Les minutes prépayées sont consommées en priorité lors des appels. Aucune expiration.

### Upsells (à venir)
- **Rapport natal écrit** : $4.99 (PDF complet)
- **Pass Lunara** : Abonnement mensuel avec minutes incluses

## 🔒 Sécurité & Authentification

- **Password hashing** : bcrypt avec 10 rounds
- **Sessions** : Cookies httpOnly, secure en production, SameSite=Lax
- **Supabase** : Service role key pour opérations serveur (pas d'exposition client)
- **Stripe** : Webhooks signés avec `STRIPE_WEBHOOK_SECRET`
- **HTTPS** : Obligatoire en production (automatique sur Vercel)

## 📦 Déploiement

### Vercel (recommandé)

1. Pushez sur GitHub
2. Importez sur [vercel.com](https://vercel.com)
3. Ajoutez toutes les variables d'environnement
4. Déployez

**Important** : Configurez le webhook Stripe avec l'URL de production :
```
https://votre-domaine.vercel.app/api/stripe/webhook
```

### Supabase Setup

Après déploiement, exécutez `supabase-schema.sql` dans votre projet Supabase SQL Editor.

## 🧪 Mode développement

L'app fonctionne en mode dégradé sans toutes les clés :

- **Sans Supabase** : Auth désactivée, message d'erreur explicite
- **Sans Stripe** : Paiements simulés (logs console)
- **Sans Astrology API** : Thème natal mock
- **Sans xAI** : Interface de call sans voix réelle

## 🎨 Design & UX

### Principes
- **Mobile-first** : Thumb-reach CTAs, navigation simplifiée
- **Minimaliste** : Espaces blancs, focus sur l'essentiel
- **Celestial** : Dégradé sombre, or (#d4af37) et violet (#6b46c1)
- **Pas de mention "AI"** : Brand élégant sans jargon tech

### Polices
- **Titres** : Cinzel (serif élégant)
- **Corps** : Inter (sans-serif moderne)

## ⚖️ Conformité EU AI Act

- **Article 50** : Disclosure « consultation digitale automatisée »
- **Consentement explicite** : Checkbox avec horodatage sauvegardé en base
- **Skip si déjà accepté** : Pas de re-consentement à chaque appel
- **Wording élégant** : Pas de « AI » dans le marketing, seulement dans legal

## 🐛 Dépannage

### "Database not configured"
- Vérifiez `NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`
- Exécutez `supabase-schema.sql` dans votre projet Supabase

### Icônes PWA manquantes
- L'app utilise `icon.svg` pour la simplicité
- Pour la production, générez des PNG 192x192 et 512x512 avec ImageMagick :
  ```bash
  magick public/icon.svg -resize 192x192 public/icon-192.png
  magick public/icon.svg -resize 512x512 public/icon-512.png
  ```
- Puis modifiez `public/manifest.json` pour référencer les PNG

### Service worker ne se charge pas
- En dev, vérifiez que `/sw.js` est accessible
- En prod sur Vercel, le SW est servi automatiquement
- Testez avec DevTools → Application → Service Workers

## 📝 Variables d'environnement complètes

| Variable | Requis | Description |
|----------|--------|-------------|
| `STRIPE_SECRET_KEY` | Oui (prod) | Clé secrète Stripe |
| `STRIPE_PUBLISHABLE_KEY` | Oui | Clé publique Stripe |
| `STRIPE_WEBHOOK_SECRET` | Oui (prod) | Secret webhook Stripe |
| `ASTROLOGY_API_KEY` | Oui | Clé Astrology-API.io |
| `XAI_API_KEY` | Oui | Clé xAI Grok |
| `NEXT_PUBLIC_APP_URL` | Oui | URL publique (https://) |
| `NEXT_PUBLIC_SUPABASE_URL` | **Oui** | URL projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Oui** | Clé anon Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | **Oui** | Clé service Supabase (serveur) |
| `STRIPE_PRICE_ID_10MIN_PACK` | Non | Price ID pack 10 min |
| `STRIPE_PRICE_ID_30MIN_PACK` | Non | Price ID pack 30 min |
| `STRIPE_PRICE_ID_MONTHLY_PASS` | Non | Price ID pass mensuel |

## 🚀 Nouveautés v2

- ✅ Comptes utilisateurs avec username/password
- ✅ Sauvegarde persistante des données de naissance
- ✅ PWA avec installation home screen
- ✅ Page `/home` pour utilisateurs connectés
- ✅ Packs minutes prépayés
- ✅ Upsells sur page de fin (packs, rapport natal, pass)
- ✅ Skip consentement si déjà accepté
- ✅ Recall astrologue favori
- ✅ UI minimaliste et mobile-first

## 📄 License

Projet privé — © 2026 Lunara

---

**Développé avec ❤️ et ✨**

