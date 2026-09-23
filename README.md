# Lunara — Consultation Astrale en Direct

Application web de consultation astrologique vocale à la minute, développée avec Next.js 15, TypeScript et Tailwind CSS.

## 🌟 Fonctionnalités

- **Consultation vocale en temps réel** avec des astrologues expérimentés
- **Thème natal complet** calculé via Astrology-API.io (Swiss Ephemeris)
- **Facturation à la seconde** avec intro offer : 2 premières minutes à $0.99, puis $1.99/min (1,99 €/min)
- **Interface élégante** avec design céleste immersif
- **5 astrologues** avec spécialités différentes (Relations, Spiritualité, Prévisions, etc.)
- **Paiement sécurisé** avec autorisation pré-consultation et capture du montant exact
- **Conformité EU AI Act** : consentement clair avant consultation

## 🚀 Installation

### Prérequis

- Node.js 18+ et npm/yarn
- Compte Stripe (https://dashboard.stripe.com)
- Compte Astrology-API.io (https://astrology-api.io)
- Compte xAI (https://console.x.ai) pour les fonctionnalités vocales

### Installation locale

```bash
# Cloner le repository
git clone https://github.com/delta-33333/astrovoice.git
cd astrovoice

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env
```

### Configuration des variables d'environnement

Éditez le fichier `.env` et ajoutez vos clés API :

```env
# Stripe (obtenir sur https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Astrology API (obtenir sur https://astrology-api.io)
ASTROLOGY_API_KEY=your_astrology_api_key_here

# xAI Grok API (obtenir sur https://console.x.ai)
XAI_API_KEY=xai-...

# URL de l'application (pour les webhooks et callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Lancement en développement

```bash
npm run dev
```

L'application sera accessible sur http://localhost:3000

## 📦 Déploiement sur Vercel

### Via l'interface Vercel

1. Pushez votre code sur GitHub
2. Connectez votre repository sur [vercel.com](https://vercel.com)
3. Ajoutez les variables d'environnement dans les paramètres du projet
4. Déployez !

### Via CLI Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Login
vercel login

# Déployer
vercel

# Pour la production
vercel --prod
```

### Variables d'environnement sur Vercel

Ajoutez toutes les variables du fichier `.env` dans **Project Settings → Environment Variables** :

- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `ASTROLOGY_API_KEY`
- `XAI_API_KEY`
- `NEXT_PUBLIC_APP_URL` (votre URL Vercel, ex: https://lunara.vercel.app)

## 🔗 Configuration des webhooks Stripe

1. Dans le [Dashboard Stripe](https://dashboard.stripe.com/webhooks), créez un webhook endpoint
2. URL du webhook : `https://votre-domaine.com/api/stripe/webhook`
3. Événements à écouter :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copiez le **Webhook signing secret** dans `STRIPE_WEBHOOK_SECRET`

### Test local des webhooks

Utilisez Stripe CLI pour tester les webhooks localement :

```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks vers localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 🏗️ Architecture

### Structure du projet

```
astrovoice/
├── app/
│   ├── api/
│   │   ├── natal-chart/      # Calcul du thème natal
│   │   ├── call-session/     # Création de session vocale
│   │   └── stripe/           # Gestion paiements Stripe
│   ├── astrologers/          # Sélection astrologue
│   ├── birth/                # Formulaire données de naissance
│   ├── preview/              # Aperçu du thème natal
│   ├── consent/              # Consentement EU AI Act
│   ├── payment/              # Page de paiement
│   ├── call/                 # Interface d'appel
│   ├── complete/             # Confirmation fin de consultation
│   ├── layout.tsx
│   ├── page.tsx              # Page d'accueil
│   └── globals.css
├── lib/
│   ├── types.ts              # Types TypeScript
│   ├── astrologers.ts        # Données astrologues
│   └── utils.ts              # Fonctions utilitaires
├── components/               # Composants réutilisables
├── public/                   # Assets statiques
└── package.json
```

### Flux utilisateur

1. **Landing** (`/`) — Page d'accueil avec CTA
2. **Astrologers** (`/astrologers`) — Choix parmi 5 astrologues
3. **Birth Data** (`/birth`) — Collecte nom, date, heure, lieu de naissance
4. **Preview** (`/preview`) — Aperçu du thème natal calculé
5. **Consent** (`/consent`) — Consentement EU AI Act (Art. 50)
6. **Payment** (`/payment`) — Autorisation Stripe pré-consultation
7. **Call** (`/call`) — Interface vocale avec timer et coût en temps réel
8. **Complete** (`/complete`) — Récapitulatif et reçu

### Intégrations API

#### Astrology-API.io

Calcul du thème natal avec positions planétaires, maisons et aspects :

```typescript
POST /api/natal-chart
Body: { date, time, place, timeUnknown }
Response: { planets, houses, aspects, coords }
```

#### Stripe

**Autorisation pré-consultation** :
- `PaymentIntent` avec `capture_method: manual`
- Montant max autorisé : $19.90 (environ 10 minutes)

**Capture du montant exact** :
- Intro offer : 2 premières minutes à $0.99 (99 cents)
- Après 2 min : $1.99/min billed par seconde
- Formule : `if (seconds <= 120) { 99¢ } else { 99¢ + ceil((seconds-120)*199/60)¢ }`

#### xAI Grok Voice

Connexion vocale temps réel avec voix sélectionnée (Ara, Eve, Leo, Rex, Sal).

**Note** : L'implémentation actuelle utilise un mode fallback si l'API vocale xAI n'est pas disponible. Consultez la [documentation xAI](https://docs.x.ai) pour les dernières spécifications de l'API realtime/voice.

## 🎨 Marque et design

### Palette de couleurs

```css
--celestial-dark: #0a0e1a
--celestial-darker: #050810
--celestial-purple: #6b46c1
--celestial-gold: #d4af37
--celestial-blue: #4a5ea8
```

### Polices

- **Titres** : Cinzel (Google Fonts)
- **Corps** : Inter (Google Fonts)

### Principes UX

- Design sombre/céleste immersif
- Animations douces (glow, float)
- Expérience élégante et professionnelle
- Mobile-first responsive

## 🧪 Mode développement

L'application fonctionne en mode dégradé si les clés API ne sont pas configurées :

- **Sans Stripe** : Paiements simulés avec logs console
- **Sans Astrology-API** : Thème natal mock avec données d'exemple
- **Sans xAI** : Interface de call avec timer mais sans voix

Ceci permet le développement et les tests sans configuration complète.

## 📝 Variables d'environnement complètes

| Variable | Requis | Description |
|----------|--------|-------------|
| `STRIPE_SECRET_KEY` | Oui (prod) | Clé secrète Stripe (sk_test_ ou sk_live_) |
| `STRIPE_PUBLISHABLE_KEY` | Oui | Clé publique Stripe (pk_test_ ou pk_live_) |
| `STRIPE_WEBHOOK_SECRET` | Oui (prod) | Secret de signature webhook (whsec_) |
| `ASTROLOGY_API_KEY` | Oui | Clé API Astrology-API.io |
| `XAI_API_KEY` | Oui | Clé API xAI pour Grok Voice |
| `NEXT_PUBLIC_APP_URL` | Oui | URL publique de l'app (avec https://) |

## 🔒 Sécurité

- Toutes les clés API sont côté serveur uniquement (routes API)
- Pas d'exposition de secrets dans le code client
- Validation webhook Stripe avec signature
- Variables sensibles dans `.env` (gitignored)
- HTTPS obligatoire en production (automatique sur Vercel)

## ⚖️ Conformité légale

### EU AI Act (Article 50)

L'application respecte le Règlement européen sur l'IA :

- **Disclosure obligatoire** : Les utilisateurs sont informés avant la consultation qu'il s'agit d'une "consultation digitale automatisée" utilisant l'IA
- **Consentement explicite** : Checkbox de consentement avec horodatage
- **Wording élégant** : Le marketing reste professionnel sans mentionner "AI/IA" explicitement
- **Immersion après consentement** : L'expérience astrologue démarre après acceptation

## 💰 Tarification

### Intro Offer
- **2 premières minutes** : $0.99 (99 cents)
- **Après 2 minutes** : $1.99/min (1,99 €/min)
- **Facturation** : À la seconde exacte
- **Alerte** : Pop-up à $20 pour éviter les surprises

### Hold Stripe
- **Montant maximum** : $19.90 (~10 minutes)
- **Capture** : Montant exact selon durée réelle

## 🐛 Dépannage

### "Stripe not configured"

- Vérifiez que `STRIPE_SECRET_KEY` est bien défini
- En dev local : redémarrez `npm run dev` après avoir modifié `.env`
- Sur Vercel : vérifiez les variables d'environnement dans les paramètres

### "xAI not configured"

- L'API vocale xAI peut nécessiter un accès beta
- Consultez https://console.x.ai pour vérifier l'accès
- L'app continue de fonctionner en mode fallback

### Webhooks Stripe non reçus

- Vérifiez l'URL du webhook dans le Dashboard Stripe
- En local : utilisez `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Vérifiez que `STRIPE_WEBHOOK_SECRET` correspond au secret du webhook

### Géocodage échoue

- L'app utilise Nominatim (OpenStreetMap) gratuit
- Format attendu : "Ville, Pays" (ex: "Paris, France")
- Vérifiez que le lieu est valide

## 📄 License

Projet privé — © 2026 Lunara

## 🤝 Contribution

Ce projet est privé. Pour toute question, contactez l'équipe de développement.

---

**Développé avec ❤️ et ✨ pour connecter les étoiles et l'humanité**
