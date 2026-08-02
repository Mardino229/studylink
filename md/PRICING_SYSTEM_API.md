# Système de Pricing — Documentation Frontend

> Ce document couvre l'ensemble du système de monétisation de StudyLink :
> plans d'abonnement, packs de jetons, contrôle d'accès et flux de paiement.

Authentification : cookie `access_token` sur toutes les routes.
Envoyer les requêtes avec `credentials: "include"` (fetch) ou `withCredentials: true` (axios).

---

## Conventions de types

Tous les champs JSON suivent ces conventions de sérialisation :

| Type Python | Type JSON reçu | Exemple |
| --- | --- | --- |
| `UUID` | `string` | `"a1b2c3d4-..."` |
| `datetime` | `string` ISO 8601 UTC | `"2026-06-28T10:00:00Z"` |
| `Decimal` | `string` | `"6.99"` |
| `int` | `number` | `12` |
| `bool` | `boolean` | `true` / `false` |
| `str` (enum) | `string` littéral | `"active"`, `"monthly"` |
| `None` / absent | `null` ou champ absent | — |

Le wrapper standard de **toutes** les réponses est :

```jsonc
{
  "success": true,           // boolean
  "message": "...",          // string
  "data": { ... } | null     // T | null
}
```

Les exemples ci-dessous montrent uniquement le contenu de `data`.

---

## 1. Les trois niveaux d'accès

| Niveau | Comment l'obtenir | Accès |
| --- | --- | --- |
| Free | Inscription gratuite | Lecture seule (épreuves, anciens artefacts) |
| Jetons | Achat d'un pack | Actions payées au jeton |
| Pro | Abonnement mensuel ou annuel | Tout illimité, bypass jetons |

### Matrice d'accès

| Fonctionnalité | Free | Jetons | Pro |
| --- | --- | --- | --- |
| Générer résumé / flashcards / quiz / podcast | ❌ | 1 jeton | ✅ illimité |
| Chat RAG (par tranche de 10 messages) | ❌ | 1 jeton | ✅ illimité |
| Voir un corrigé payant | ❌ | 2 jetons | ✅ illimité |
| Télécharger une épreuve | ✅ | ✅ | ✅ |
| Voir ses anciens artefacts | ✅ toujours | ✅ toujours | ✅ toujours |

> Un abonné Pro actif ne consomme jamais de jetons.
> Les artefacts déjà générés restent visibles même après désabonnement.

---

## 2. Statut de l'utilisateur au chargement

Appelle ces deux endpoints en parallèle au démarrage de l'app.

### Abonnement actif

```
GET /api/v1/subscriptions/active
```

Réponse si abonné — `data` est :

```jsonc
{
  "id": "string (UUID)",
  "user_id": "string (UUID)",
  "plan_id": "string (UUID)",
  "billing_type": "monthly" | "annual",
  "status": "active" | "past_due" | "canceled",
  "start_date": "string (ISO 8601)",
  "end_date": "string (ISO 8601)",
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)",
  "plan": {
    "id": "string (UUID)",
    "name": "string",
    "price": "string (Decimal)",         // mensuel, ex : "6.99"
    "annual_price": "string (Decimal)",  // annuel, ex : "49.99"
    "description": "string | null",
    "benefits_description": "string[]"
  }
}
```

Réponse si non abonné — `data` vaut `null`.

### Solde de jetons

```
GET /api/v1/tokens/balance
```

`data` :

```jsonc
{
  "balance": "number",               // jetons disponibles
  "chat_messages_count": "number",   // total messages envoyés (pour le calcul 1 jeton/10 msgs)
  "updated_at": "string (ISO 8601) | null"
}
```

### Logique frontend recommandée

```ts
const [subRes, tokenRes] = await Promise.all([
  fetch('/api/v1/subscriptions/active', { credentials: 'include' }),
  fetch('/api/v1/tokens/balance',       { credentials: 'include' }),
])
const isPro        = subRes.data?.status === 'active'
const tokenBalance = tokenRes.data?.balance ?? 0
```

---

## 3. Plans d'abonnement

### Lister les plans

```
GET /api/v1/admin/plans
```

`data` est un tableau. Chaque élément :

```jsonc
{
  "id": "string (UUID)",
  "name": "string",
  "price": "string (Decimal)",         // prix mensuel, ex : "6.99"
  "annual_price": "string (Decimal)",  // prix annuel,  ex : "49.99"
  "description": "string | null",
  "benefits_description": "string[]",
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)"
}
```

### Flux d'abonnement via Stripe

```
1. GET  /api/v1/admin/plans                    → afficher les plans
2. POST /api/v1/subscriptions/checkout         → obtenir checkout_url
3. Rediriger vers checkout_url
4. Stripe webhook → abonnement créé automatiquement
5. GET  /api/v1/subscriptions/active           → rafraîchir le statut
```

**Body de l'étape 2 :**

```jsonc
{
  "plan_id": "string (UUID)",
  "billing_type": "monthly" | "annual",
  "success_url": "string",  // ex: "https://monapp.com/success?session_id={CHECKOUT_SESSION_ID}"
  "cancel_url": "string"    // ex: "https://monapp.com/pricing"
}
```

**Réponse de l'étape 2 — `data` :**

```jsonc
{
  "checkout_url": "string",       // URL Stripe vers laquelle rediriger
  "transaction_id": "string (UUID)",
  "stripe_session_id": "string"   // ex : "cs_..."
}
```

### Annuler un abonnement

```http
PATCH /api/v1/subscriptions/{subscription_id}/cancel
```

Pas de body. Passe le statut à `"canceled"`. L'accès Pro reste actif jusqu'à `end_date`.

### Renouveler un abonnement

```
PATCH /api/v1/subscriptions/{subscription_id}/renew
```

**Body :**

```jsonc
{
  "billing_type": "monthly" | "annual"  // optionnel — garde l'actuel si absent
}
```

### Historique des paiements d'abonnement

```
GET /api/v1/subscriptions/transactions?skip=0&limit=50
```

`data` est un tableau. Chaque élément :

```jsonc
{
  "id": "string (UUID)",
  "user_id": "string (UUID)",
  "plan_id": "string (UUID)",
  "billing_type": "monthly" | "annual",
  "amount": "string (Decimal)",
  "currency": "string",               // ex : "cad"
  "status": "pending" | "completed" | "failed" | "refunded",
  "stripe_session_id": "string | null",
  "stripe_payment_intent_id": "string | null",
  "subscription_id": "string (UUID) | null",
  "payment_date": "string (ISO 8601) | null",
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)"
}
```

---

## 4. Packs de jetons

### Lister les packs

```
GET /api/v1/tokens/packs
```

`data` est un tableau. Chaque élément :

```jsonc
{
  "id": "string (UUID)",
  "name": "string",               // "Starter" | "Standard" | "Maxi"
  "tokens": "number",             // 10 | 35 | 80
  "price_cad": "string (Decimal)",// ex : "7.99"
  "is_active": "boolean"
}
```

### Acheter un pack — Checkout Stripe

```
POST /api/v1/tokens/packs/{pack_id}/checkout
```

Pas de body. `pack_id` est un `string (UUID)` dans l'URL.

**Réponse — `data` :**

```jsonc
{
  "checkout_url": "string",  // URL Stripe vers laquelle rediriger
  "pack": {
    "id": "string (UUID)",
    "name": "string",
    "tokens": "number",
    "price_cad": "string (Decimal)",
    "is_active": "boolean"
  }
}
```

**Flux complet :**

```
1. GET  /api/v1/tokens/packs              → afficher les cartes pack
2. POST /api/v1/tokens/packs/{id}/checkout → obtenir checkout_url
3. Rediriger vers checkout_url
4. Stripe webhook → jetons crédités + transaction enregistrée
5. GET  /api/v1/tokens/balance            → rafraîchir le solde
```

---

## 5. Types de transactions jetons — référence complète

Le modèle `TokenTransactionTypeEnum` définit **6 valeurs** :

| `type` | `amount` | Catégorie | Déclencheur |
| --- | --- | --- | --- |
| `"purchase"` | `> 0` | Crédit | Achat d'un pack via Stripe (webhook automatique) |
| `"artefact"` | `< 0` | Débit | Génération résumé / flashcards / quiz / podcast |
| `"corrige"` | `< 0` | Débit | Accès à un corrigé payant |
| `"chat"` | `< 0` | Débit | Tranche de 10 messages chat |
| `"bonus"` | `> 0` | Crédit | Crédit manuel offert par un admin |
| `"refund"` | `> 0` | Crédit | Remboursement admin |

> Seuls les types **débit** (`artefact`, `corrige`, `chat`) apparaissent dans les blocs `consumption`.
> Les types **crédit** (`purchase`, `bonus`, `refund`) apparaissent dans l'historique mais jamais dans `consumption`.

La déduction est automatique côté backend avant l'exécution de l'action. Si le solde est insuffisant → `HTTP 402` avant que l'IA soit appelée.

---

## 6. Statistiques personnelles

### Stats de consommation

```http
GET /api/v1/tokens/stats
```

`data` :

```jsonc
{
  "balance": "number",              // solde actuel
  "totalTokensPurchased": "number", // total crédité depuis la création du compte
  "totalTokensSpent": "number",     // total débité depuis la création du compte
  "consumption": {
    // Seules les clés avec au moins 1 transaction apparaissent.
    // Valeurs possibles : "artefact", "corrige", "chat" (débits uniquement).
    "artefact"?: { "count": "number", "tokensSpent": "number" },
    "corrige"?:  { "count": "number", "tokensSpent": "number" },
    "chat"?:     { "count": "number", "tokensSpent": "number" }
  }
}
```

### Historique des transactions jetons

```
GET /api/v1/tokens/transactions?skip=0&limit=50
```

`data` est un tableau. Chaque élément :

```jsonc
{
  "id": "string (UUID)",
  "amount": "number",  // positif = crédit, négatif = débit
  "type": "purchase" | "artefact" | "corrige" | "chat" | "bonus" | "refund",
  "description": "string | null",
  "created_at": "string (ISO 8601)"
}
```

---

## 7. Gestion des erreurs de paiement

### HTTP 402 — Solde insuffisant

```jsonc
// Réponse HTTP 402
{
  "detail": "string"  // ex : "Insufficient tokens. Generating a résumé costs 1 token."
}
```

Afficher une modale proposant d'acheter un pack ou de passer Pro.

### Tableau des erreurs

| Code | Cause | Action frontend |
| --- | --- | --- |
| `401` | Cookie absent ou expiré | Rediriger vers `/login` |
| `402` | Solde insuffisant (artefact, chat, corrigé) | Modale achat jeton / upgrade Pro |
| `403` | Route admin appelée par un non-admin | Rediriger vers accueil |
| `404` | Ressource introuvable | Afficher message d'erreur |
| `500` | Pack non configuré dans Stripe | Contacter le support |

---

## 8. Affichage recommandé selon le statut

### Navbar / header

```
isPro === true
  → "Pro — jusqu'au {end_date}"  [Gérer]

isPro === false && tokenBalance > 0
  → "{tokenBalance} jetons"  [Acheter plus]

isPro === false && tokenBalance === 0
  → "Plus de jetons"  [Recharger]  [Passer Pro]
```

### Boutons de génération (coût : 1 jeton)

```
isPro                   → bouton actif, pas d'indicateur de coût
!isPro && balance >= 1  → bouton actif + badge "🪙 1"
!isPro && balance === 0 → bouton désactivé + icône 🔒, ouvre la modale
```

### Bouton corrigé (coût : 2 jetons)

```
isPro                   → bouton actif
!isPro && balance >= 2  → bouton actif + badge "🪙 2"
!isPro && balance < 2   → bouton désactivé + icône 🔒, ouvre la modale
```

---

## 9. Analytics admin — Dashboard

```
GET /api/v1/admin/dashboard
```

### KPIs — `data.kpis`

```jsonc
{
  "totalUsers": "number",
  "activeSubscriptions": "number",
  "monthlyRevenue": "number",              // abonnements + packs ce mois
  "monthlySubscriptionRevenue": "number",
  "monthlyTokenRevenue": "number",
  "totalTokensCredited": "number",         // jetons vendus depuis le lancement
  "totalTokensSpent": "number"             // jetons consommés depuis le lancement
}
```

### Courbes — `data.charts`

```jsonc
{
  "activity": [
    { "name": "string", "data": "number[]" }   // inscriptions par mois (12 derniers)
  ],
  "revenue": [
    { "name": "Revenus abonnements", "data": "number[]" },  // 12 valeurs
    { "name": "Revenus jetons",      "data": "number[]" },
    { "name": "Revenus total",       "data": "number[]" }
  ]
}
```

### Token analytics — `data.tokenAnalytics`

```jsonc
{
  "packsSold": [
    {
      "packName": "string",
      "tokens": "number",
      "salesCount": "number",
      "revenue": "number"
    }
    // un objet par pack actif ayant au moins 1 vente
  ],
  "consumption": {
    // Seules les clés avec au moins 1 transaction apparaissent.
    // Valeurs possibles : "artefact", "corrige", "chat".
    "artefact"?: { "count": "number", "tokensSpent": "number" },
    "corrige"?:  { "count": "number", "tokensSpent": "number" },
    "chat"?:     { "count": "number", "tokensSpent": "number" }
  }
}
```

### Transactions récentes — `data.recentTransactions`

```jsonc
[
  {
    "id": "string",
    "type": "subscription" | "token_pack",
    "user": { "id": "string", "name": "string" },
    "amount": "number",
    "currency": "string",              // "cad"
    "label": "string",                 // nom du plan ou "Pack Standard"
    "status": "pending" | "completed" | "failed" | "refunded",
    "date": "string (ISO 8601)"
  }
]
```

---

## 10. Routes admin — Gestion du pricing

> Toutes ces routes nécessitent le rôle `admin`.

### Plans d'abonnement

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/api/v1/admin/plans` | Lister tous les plans |
| `POST` | `/api/v1/admin/plans` | Créer un plan (Stripe automatique) |
| `PATCH` | `/api/v1/admin/plans/{id}` | Modifier nom, prix, avantages |
| `DELETE` | `/api/v1/admin/plans/{id}` | Archiver un plan |

**Body POST :**

```jsonc
{
  "name": "string",
  "price": "number",           // prix mensuel
  "annual_price": "number",
  "description": "string",
  "benefits_description": "string[]"
}
```

**Body PATCH (tous les champs optionnels) :**

```jsonc
{
  "name": "string?",
  "price": "number?",
  "annual_price": "number?",
  "description": "string?",
  "benefits_description": "string[]?"
}
```

### Packs de jetons

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/api/v1/tokens/packs` | Lister les packs actifs |
| `POST` | `/api/v1/tokens/packs` | Créer un pack (Stripe automatique) |
| `PATCH` | `/api/v1/tokens/packs/{id}` | Modifier prix, jetons, nom, activation |

**Body POST :**

```jsonc
{
  "name": "string",
  "tokens": "number",
  "price_cad": "number"
}
```

**Body PATCH (tous les champs optionnels) :**

```jsonc
{
  "name": "string?",
  "tokens": "number?",
  "price_cad": "number?",
  "is_active": "boolean?"   // false = masqué aux étudiants
}
```

> Si `price_cad` ou `name` change, l'ancien prix Stripe est archivé et un nouveau est créé automatiquement.

**Créditer manuellement un utilisateur :**

```http
POST /api/v1/tokens/admin/credit
```

```jsonc
{
  "user_id": "string (UUID)",
  "amount": "number",
  "description": "string?"
}
```

---

## 11. Initialisation en production (une seule fois)

```bash
# Créer le plan Pro
POST /api/v1/admin/plans
{
  "name": "Pro",
  "price": 6.99,
  "annual_price": 49.99,
  "description": "Accès illimité à toutes les fonctionnalités",
  "benefits_description": [
    "Résumés, flashcards, quiz, podcasts illimités",
    "Tous les corrigés inclus",
    "Chat RAG illimité",
    "Accès prioritaire aux nouveautés"
  ]
}

# Créer les packs de jetons
POST /api/v1/tokens/packs  →  { "name": "Starter",  "tokens": 10, "price_cad": 2.99 }
POST /api/v1/tokens/packs  →  { "name": "Standard", "tokens": 35, "price_cad": 7.99 }
POST /api/v1/tokens/packs  →  { "name": "Maxi",     "tokens": 80, "price_cad": 14.99 }
```

---

## 12. Récapitulatif des endpoints

| Endpoint | Accès | Usage |
| --- | --- | --- |
| `GET /api/v1/subscriptions/active` | Utilisateur | Vérifier si abonné |
| `POST /api/v1/subscriptions/checkout` | Utilisateur | Démarrer l'abonnement |
| `PATCH /api/v1/subscriptions/{i/d}/cancel` | Utilisateur | Annuler |
| `PATCH /api/v1/subscriptions/{id}/renew` | Utilisateur | Renouveler |
| `GET /api/v1/subscriptions/transactions` | Utilisateur | Historique paiements abonnement |
| `GET /api/v1/tokens/balance` | Utilisateur | Solde de jetons |
| `GET /api/v1/tokens/packs` | Utilisateur | Lister les packs |
| `POST /api/v1/tokens/packs/{id}/checkout` | Utilisateur | Acheter un pack |
| `GET /api/v1/tokens/stats` | Utilisateur | Stats de consommation |
| `GET /api/v1/tokens/transactions` | Utilisateur | Historique transactions jetons |
| `POST /api/v1/tokens/packs` | Admin | Créer un pack |
| `PATCH /api/v1/tokens/packs/{id}` | Admin | Modifier un pack / prix |
| `POST /api/v1/tokens/admin/credit` | Admin | Créditer manuellement |
| `GET /api/v1/admin/dashboard` | Admin | Analytics revenus complets |
