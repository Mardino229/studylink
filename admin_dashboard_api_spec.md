# Spécification de l'API - Dashboard Admin

## Résumé
Ce document décrit la route d'API nécessaire pour alimenter le tableau de bord de l'administration (`AdminHome.tsx`). L'API doit renvoyer toutes les données liées aux KPI, aux graphiques d'activité et de revenus, ainsi qu'aux listes des activités récentes.

---

## 📌 Endpoint Principal
`GET /api/admin/dashboard`

## 🔒 Autorisation
- **Authentification requise** : Oui
- **Rôle requis** : `ADMIN`

## 📥 Requête
**Headers :**
```http
Authorization: Bearer <votre_token_jwt>
```

---

## 📤 Réponse attendue (200 OK)

Le format de réponse doit rassembler l'ensemble des données mockées actuellement présentes dans `AdminHome.tsx` :

```json
{
  "success": true,
  "data": {
    "kpis": {
      "totalUsers": 1254,
      "activeSubscriptions": 842,
      "monthlyRevenue": 12850
    },
    "charts": {
      "activity": [
        {
          "name": "Activité",
          "data": [3, 5, 2, 8, 6, 9, 7, 10, 8, 12, 9, 11]
        }
      ],
      "revenue": [
        {
          "name": "Revenus",
          "data": [120, 150, 170, 160, 210, 230, 250, 240, 280, 300, 320, 350]
        }
      ]
    },
    "recentUsers": [
      {
        "id": "usr_12345",
        "firstName": "Jean",
        "lastName": "Dupont",
        "email": "jean.dupont@example.com",
        "avatar": "https://...",
        "createdAt": "2026-03-13T10:00:00Z"
      }
      // ... 5 derniers utilisateurs max
    ],
    "recentTransactions": [
      {
        "id": "txn_67890",
        "user": {
          "id": "usr_12345",
          "name": "Jean Dupont"
        },
        "amount": 49.99,
        "planName": "Premium",
        "status": "completed",
        "date": "2026-03-13T12:30:00Z"
      }
      // ... 5 dernières transactions max
    ],
    "systemActivity": [
      {
        "id": "act_1",
        "message": "Maintenance terminée à 04:00",
        "date": "2026-03-13T04:00:00Z",
        "color": "brand" // brand, emerald, amber, red ...
      },
      {
        "id": "act_2",
        "message": "Nouveau plan créé : Premium Plus",
        "date": "2026-03-12T15:30:00Z",
        "color": "emerald"
      },
      {
        "id": "act_3",
        "message": "Sauvegarde automatique réussie",
        "date": "2026-03-12T02:00:00Z",
        "color": "amber"
      }
    ]
  }
}
```

---

## 🛠 Détails d'implémentation (Backend)

1. **Calcul des KPIs (`kpis`) :**
   - **`totalUsers`** : Effectuer un `COUNT` sur la table des utilisateurs, hors admins ou selon les besoins.
   - **`activeSubscriptions`** : Compter les abonnements dont le statut est "actif".
   - **`monthlyRevenue`** : Somme des montants des transactions réussies (`status = 'completed'`) sur le mois en cours.

2. **Génération des valeurs de graphiques (`charts`) :**
   - **`activity`** : Grouper le nombre de nouvelles inscriptions ou de connexions par mois sur les 12 derniers mois.
   - **`revenue`** : Grouper le chiffre d'affaires généré par mois sur les 12 derniers mois. Le format attendu est un tableau d'entiers ou de flottants pour le graphique ApexCharts.

3. **Listes limitées (`recentUsers`, `recentTransactions`, `systemActivity`) :**
   - Optimisez la base de données en effectuant vos requêtes avec une clause `LIMIT 5` et `ORDER BY date DESC`.

## 🎨 Utilisation côté Frontend (`AdminHome.tsx`)

Une fois l'API prête, côté React, il suffira de :
1. Créer un Hook (par exemple `useAdminDashboard()`) à l'aide de React Query ou SWR, qui fetch l'endpoint `GET /api/admin/dashboard`.
2. Gérer le chargement (`isLoading`). 
3. Remplacer les valeurs écrites "en dur" par `data.kpis.totalUsers`, `data.charts.activity`, etc.
