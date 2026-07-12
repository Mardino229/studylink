# Nouvelle fonctionnalité — Soumission d'épreuves par les utilisateurs

## Ce qui change par rapport à avant

Avant, seul l'admin pouvait uploader des épreuves. Maintenant n'importe quel utilisateur connecté peut soumettre une épreuve ou un corrigé. Chaque soumission passe par une validation admin avant d'être visible. En échange, l'utilisateur accumule des coins qui peuvent être convertis en jetons.

---

## 1. Le champ `is_validated` n'existe plus

Le booléen `is_validated` est remplacé par `submission_status` (enum).

```typescript
// Avant
exam.is_validated // true | false

// Maintenant
exam.submission_status // 'pending' | 'validated' | 'rejected'
```

**Impact front :** partout où vous affichiez une épreuve en vérifiant `is_validated === true`, remplacez par `submission_status === 'validated'`.

Pour la liste publique des épreuves, filtrer avec le query param `submission_status=validated` — sinon les épreuves en attente apparaissent.

L'épreuve peut aussi avoir un `admin_note` (string | null) qui contient la raison du refus quand `submission_status === 'rejected'`.

---

## 2. Upload d'épreuve ouvert aux utilisateurs

**Avant :** `POST /api/exam-library` → admin uniquement, auto-validé.

**Maintenant :** accessible à tous les utilisateurs connectés.

- Si l'appelant est **admin** → statut `validated` immédiatement, visible de tous, aucun coin attribué.
- Si l'appelant est un **utilisateur** → statut `pending`, invisible du public jusqu'à validation admin.

L'endpoint ne change pas, le comportement dépend du rôle extrait du cookie JWT côté back.

```
POST /api/exam-library
Content-Type: multipart/form-data
credentials: 'include'

name, exam_file (PDF), solution_file (PDF, optionnel),
course_id, program_id, study_level_id, academic_year, session, exam_type, is_solution_paid
```

---

## 3. Suivi des soumissions pour l'utilisateur

Deux nouveaux endpoints pour que l'utilisateur puisse voir l'état de ce qu'il a soumis.

**Mes épreuves soumises** (avec statut + note de refus si rejeté)
```
GET /api/exam-library/my-submissions
```

**Re-soumettre une épreuve refusée** (après correction)
```
PUT /api/exam-library/{id}/resubmit
Content-Type: multipart/form-data

exam_file (optionnel), name, course_id, ... (tous optionnels)
```
Disponible uniquement si `submission_status === 'rejected'`.

---

## 4. Soumission de corrigés par les utilisateurs

Nouvelle mécanique : un utilisateur peut proposer un corrigé pour une épreuve validée qui n'en a pas encore.

**Trouver les épreuves sans corrigé**
```
GET /api/exam-library/missing-solution
```
Retourne les épreuves `validated` dont `solution_file_url === null`. C'est la liste à afficher pour inviter les utilisateurs à soumettre un corrigé.

**Soumettre un corrigé**
```
POST /api/exam-library/{id}/solution/submit
Content-Type: multipart/form-data

solution_file (PDF)
```
La soumission part en `pending`. Plusieurs utilisateurs peuvent soumettre un corrigé pour le même exam — elles coexistent jusqu'à ce que l'admin en valide une.

**Mes soumissions de corrigés**
```
GET /api/exam-library/my-solution-submissions
```
Retourne les soumissions de l'utilisateur avec `submission_status` et `admin_note`.

**Re-soumettre un corrigé refusé**
```
PUT /api/exam-library/solutions/{id}/resubmit
Content-Type: multipart/form-data

solution_file (PDF)
```

---

## 5. Panel admin — ce qui change

L'admin a maintenant deux files de validation séparées.

**File des épreuves en attente**
```
GET /api/exam-library/admin/submissions/pending
POST /api/exam-library/{id}/validate
POST /api/exam-library/{id}/reject     body: { admin_note: string }
```
Quand l'admin valide → l'épreuve devient publique + 0,5 coin crédité sur le wallet du soumetteur.  
Quand l'admin refuse → le soumetteur voit la raison et peut corriger + re-soumettre.

**File des corrigés en attente**
```
GET /api/exam-library/admin/solutions/pending
GET /api/exam-library/{id}/solutions          // toutes les soumissions pour un exam
POST /api/exam-library/solutions/{id}/validate
POST /api/exam-library/solutions/{id}/reject  body: { admin_note: string }
```
Quand l'admin valide une soumission de corrigé → le fichier devient le corrigé officiel de l'exam + les autres soumissions `pending` pour ce même exam sont automatiquement rejetées + 0,5 coin crédité au soumetteur.

---

## 6. Wallet de coins — nouveau module

Nouveau concept distinct des jetons : les **coins** sont gagnés par soumissions validées, jamais achetés.

| Action | Coins gagnés |
|---|---|
| Épreuve validée par l'admin | +0,5 coin |
| Corrigé validé par l'admin | +0,5 coin |
| Conversion | −5 coins → +1 jeton |

Les coins **ne se déduisent qu'une fois** — l'idempotence est gérée côté back (pas de double crédit si l'admin re-valide par erreur).

```
GET  /api/rewards/coins/balance        → { coin_balance: 1.5, ... }
GET  /api/rewards/coins/transactions   → liste des +/− avec type 'earned' | 'converted'
POST /api/rewards/coins/convert        → déduit 5 coins, crédite 1 jeton
```

La conversion échoue (400) si le solde est inférieur à 5 coins.

---

## Récap des nouveaux endpoints

| Méthode | Endpoint | Qui | Quand l'appeler |
|---|---|---|---|
| GET | `/exam-library/missing-solution` | User | Page "soumettre un corrigé" |
| GET | `/exam-library/my-submissions` | User | Tableau de bord soumissions |
| GET | `/exam-library/my-solution-submissions` | User | Tableau de bord corrigés |
| PUT | `/exam-library/{id}/resubmit` | User | Après un refus d'épreuve |
| POST | `/exam-library/{id}/solution/submit` | User | Soumettre un corrigé |
| PUT | `/exam-library/solutions/{id}/resubmit` | User | Après un refus de corrigé |
| GET | `/exam-library/admin/submissions/pending` | Admin | File de modération épreuves |
| POST | `/exam-library/{id}/validate` | Admin | Valider une épreuve |
| POST | `/exam-library/{id}/reject` | Admin | Refuser une épreuve |
| GET | `/exam-library/admin/solutions/pending` | Admin | File de modération corrigés |
| GET | `/exam-library/{id}/solutions` | Admin | Voir toutes les soumissions d'un exam |
| POST | `/exam-library/solutions/{id}/validate` | Admin | Valider un corrigé |
| POST | `/exam-library/solutions/{id}/reject` | Admin | Refuser un corrigé |
| GET | `/rewards/coins/balance` | User | Afficher le solde coins |
| GET | `/rewards/coins/transactions` | User | Historique coins |
| POST | `/rewards/coins/convert` | User | Convertir en jeton |
