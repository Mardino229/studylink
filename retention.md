# Rétention des abonnements — Frontend

Documentation des endpoints à utiliser pour le tableau de bord admin.

## Authentification

Tous les endpoints ci-dessous nécessitent une session administrateur, comme les autres routes `/admin/*`.

Préfixe habituel : `/api/v1`.

Les réponses suivent cette enveloppe :

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

## Nouvel endpoint : rétention par cohortes

```http
GET /api/v1/admin/reports/retention?period=12m
```

Valeurs acceptées pour `period` : `3m`, `6m`, `12m`. Valeur par défaut : `12m`.

Réponse :

```json
{
  "success": true,
  "message": "Retention report retrieved successfully",
  "data": {
    "period": "12m",
    "cohorts": [
      {
        "cohort": "2026-01",
        "initial_users": 20,
        "retention": {
          "m0": 100.0,
          "m1": 75.0,
          "m2": 60.0,
          "m3": null
        }
      }
    ],
    "summary": {
      "retention_30d": 75.0,
      "retention_90d": null,
      "cohort_count": 1
    }
  }
}
```

### Règles d’affichage

- `cohort` est le mois de démarrage, au format `YYYY-MM`.
- `m0` représente la cohorte initiale, toujours `100%`.
- `m1`, `m2`, etc. représentent la rétention après 1, 2, etc. mois.
- Une valeur `null` signifie que la période n’est pas encore mesurable. L’afficher comme `—`, pas comme `0%`.
- Afficher les cohortes sous forme de matrice ou de tableau avec une couleur proportionnelle au pourcentage.
- `retention_30d` et `retention_90d` peuvent être `null` s’il n’existe pas encore de cohorte suffisamment ancienne.

## Endpoints existants à réutiliser

### Nouveaux abonnements

```http
GET /api/v1/admin/reports/subscriptions?period=12m
```

Retourne notamment :

```json
{
  "months": [
    {"month": "Jan 2026", "new_subscriptions": 12}
  ],
  "total_new": 12,
  "active_count": 42,
  "canceled_count": 3
}
```

Utilisation frontend : graphique des acquisitions, compteur des actifs et compteur des annulations.

### Revenus

```http
GET /api/v1/admin/reports/revenue?period=12m
```

Aucune modification de contrat n’est nécessaire. Les renouvellements Stripe enregistrés apparaîtront automatiquement dans les revenus complétés.

### Synthèse

```http
GET /api/v1/admin/reports/summary
```

À utiliser pour les KPI généraux : utilisateurs, abonnements actifs, MRR et revenus du mois.

## Aucun changement obligatoire aux anciens endpoints

Le frontend peut conserver les appels existants. Ajouter uniquement l’appel à `/admin/reports/retention` pour la nouvelle vue de rétention.

Note : les cohortes historiques commencent à être complètes pour les abonnements créés après l’activation du journal d’événements. Les anciennes données peuvent ne pas avoir d’événement de démarrage.
