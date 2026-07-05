# Mise à jour — Accès aux corrigés

> Ce document complète et **remplace les sections corrigé** de `EXAM_LIBRARY_API.md`.
> Les sections cours, épreuves, admin restent inchangées.

---

## Ce qui a changé

### Avant
- Seul un abonnement actif donnait accès aux corrigés.
- L'accès par jeton n'existait pas.
- Le backend renvoyait un fichier téléchargeable.

### Maintenant
- Deux modes d'accès : **abonnement** ou **jetons**.
- L'accès par jeton est **persistant** : on paie une fois pour un corrigé donné, on peut le rouvrir autant de fois qu'on veut sans repayer.
- Le backend renvoie le PDF en **lecture seule** — le front doit l'afficher dans un viewer qui désactive le téléchargement.

---

## Modèle d'accès

```
┌─────────────────────────────────────────────────────────────────┐
│  GET /api/v1/exam-library/{exam_id}/solution                    │
└─────────────────────────────────────────────────────────────────┘

L'utilisateur a un abonnement Pro actif ?
  → Oui  ──▶  Accès immédiat, 0 jeton déduit
  → Non  ──▶  Voir ci-dessous

L'utilisateur a déjà payé ce corrigé par le passé ?
  → Oui  ──▶  Accès immédiat, 0 jeton déduit  (accès persistant)
  → Non  ──▶  Voir ci-dessous

L'utilisateur a ≥ 2 jetons ?
  → Oui  ──▶  −2 jetons, accès enregistré définitivement, PDF affiché
  → Non  ──▶  HTTP 402
```

| Profil | 1ère ouverture | Ouvertures suivantes |
|--------|---------------|----------------------|
| Abonné Pro | Gratuit | Gratuit |
| Token user (≥ 2 jetons) | −2 jetons | Gratuit (accès déjà en base) |
| Token user (< 2 jetons) | HTTP 402 | HTTP 402 (accès non acquis) |
| Aucun abonnement, 0 jeton | HTTP 402 | HTTP 402 |

> `is_solution_paid = false` sur l'épreuve = corrigé gratuit pour tout utilisateur connecté, aucune vérification.

---

## Endpoint corrigé

```
GET /api/v1/exam-library/{exam_id}/solution
```

**Accès :** Utilisateur connecté (abonnement actif **ou** jetons suffisants)

**Réponse succès :**
```
HTTP 200
Content-Type: application/pdf
Content-Disposition: inline
Cache-Control: no-store
X-Content-Type-Options: nosniff
```

Le corps de la réponse est le flux binaire du PDF. Il n'y a **pas de JSON** — c'est directement le fichier.

**Codes d'erreur :**

| Code | Raison |
|------|--------|
| `401` | Cookie `access_token` manquant ou expiré |
| `402` | Pas d'abonnement actif ET solde de jetons insuffisant (< 2) |
| `404` | Épreuve introuvable ou aucun corrigé uploadé pour cette épreuve |

---

## Ce que le frontend doit faire

### 1 — Afficher le corrigé sans téléchargement

Le PDF est streamé avec `Content-Disposition: inline`. Le front **doit** utiliser un viewer JS qui désactive le bouton de téléchargement natif du navigateur.

**Recommandation :** [`react-pdf`](https://react-pdf.org/) ou [`@react-pdf-viewer/core`](https://react-pdf-viewer.github.io/).

```tsx
// Exemple avec @react-pdf-viewer/core
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { toolbarPlugin } from '@react-pdf-viewer/toolbar';

const toolbar = toolbarPlugin();
const { renderDefaultToolbar, Toolbar } = toolbar;

// Masquer le bouton download dans la toolbar
const renderToolbar = (Toolbar) => (
  <Toolbar>
    {renderDefaultToolbar((slot) => ({
      ...slot,
      Download: () => <></>,         // retire le bouton download
      DownloadMenuItem: () => <></>,
      Print: () => <></>,            // retire l'impression si souhaité
    }))}
  </Toolbar>
);

// Fetch du PDF via credentials (cookie)
const [pdfUrl, setPdfUrl] = useState<string | null>(null);

async function loadSolution(examId: string) {
  const res = await fetch(`/api/v1/exam-library/${examId}/solution`, {
    credentials: 'include',  // indispensable pour envoyer le cookie
  });

  if (res.status === 402) {
    // Voir section "Gérer le 402" ci-dessous
    return;
  }
  if (!res.ok) throw new Error('Erreur accès corrigé');

  const blob = await res.blob();
  setPdfUrl(URL.createObjectURL(blob));
}
```

> **Important :** Ne jamais mettre l'URL de l'API directement dans `<iframe src="">` ou `<embed src="">` — le cookie ne serait pas envoyé. Toujours passer par `fetch` avec `credentials: 'include'`, puis créer un blob URL.

### 2 — Libérer le blob URL

```tsx
useEffect(() => {
  return () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
  };
}, [pdfUrl]);
```

### 3 — Gérer le 402

Quand la réponse est `402`, deux cas possibles :
- L'utilisateur n'a **pas d'abonnement** → afficher la page d'upgrade vers Pro.
- L'utilisateur a un abonnement mais **pas assez de jetons** → afficher la modale d'achat de pack de jetons.

Pour différencier, vérifie d'abord le solde :

```tsx
async function handleSolutionAccess(examId: string) {
  // Vérif préalable du solde (optionnelle, pour UX proactive)
  const balanceRes = await fetch('/api/v1/tokens/balance', { credentials: 'include' });
  const { data: balance } = await balanceRes.json(); // { balance: number, ... }

  if (balance.balance < 2) {
    // Montrer la modale d'achat de jetons
    openTokenPurchaseModal();
    return;
  }

  // Sinon tenter l'accès
  await loadSolution(examId);
}
```

### 4 — Indiquer si l'accès est déjà acquis (UX)

Il n'y a pas d'endpoint dédié "est-ce que j'ai déjà payé ce corrigé ?". La logique est côté backend — il suffit d'appeler l'endpoint et de réagir à la réponse :

- `200` → afficher le PDF (que ce soit un premier accès ou un accès déjà en base, le résultat est le même)
- `402` → l'accès n'est pas encore acquis

Pour afficher un badge "Déjà acheté" dans la liste, tu peux maintenir un état local après le premier succès :

```tsx
const [unlockedExams, setUnlockedExams] = useState<Set<string>>(new Set());

// Après un succès :
setUnlockedExams(prev => new Set(prev).add(examId));
```

Ou persister en `localStorage` pour retrouver l'état entre sessions.

---

## TypeScript — types

```typescript
// Réponse de GET /api/v1/exam-library/{id}
interface ExamLibraryItem {
  id: string;                        // UUID
  name: string;
  course_id: string | null;          // UUID
  course: Course | null;
  program_id: string | null;         // UUID
  study_level_id: string | null;     // UUID
  academic_year: number | null;
  session: 'fall' | 'winter' | 'summer' | null;
  exam_type: 'midterm' | 'final' | 'quiz' | 'other' | null;
  is_solution_paid: boolean;         // true = accès payant (abonnement ou jetons)
  exam_file_url: string;             // chemin interne, ne pas utiliser directement
  solution_file_url: string | null;  // null si pas encore uploadé
  is_validated: boolean;
  creation_date: string;             // ISO 8601
  creator_user_id: string;           // UUID
}

interface Course {
  id: string;
  code: string;   // ex: "CSI2120"
  name: string;
  faculty_id: string | null;
}

// Erreur 402
interface PaymentRequiredError {
  detail: string;
  // ex: "Insufficient tokens. Accessing a solution costs 2 tokens."
  //  ou logique à déduire en vérifiant GET /api/v1/tokens/balance
}
```

---

## Matrice d'accès complète

| Cas | `is_solution_paid` | Abonnement | Jetons | Résultat |
|-----|-------------------|------------|--------|----------|
| Solution gratuite | `false` | peu importe | peu importe | ✅ 200 |
| Abonné Pro | `true` | actif | peu importe | ✅ 200, 0 jeton déduit |
| Token user, première fois | `true` | inactif | ≥ 2 | ✅ 200, −2 jetons |
| Token user, déjà acheté | `true` | inactif | peu importe | ✅ 200, 0 jeton déduit |
| Token user, 1ère fois, solde insuffisant | `true` | inactif | < 2 | ❌ 402 |
| Aucun accès | `true` | inactif | 0 | ❌ 402 |

---

## Flux complet étudiant

```
1. GET /api/v1/exam-library?course_id=...&session=winter&academic_year=2024
   → liste les épreuves

2. GET /api/v1/exam-library/{id}/download
   → télécharge le fichier épreuve (PDF, gratuit pour tout utilisateur connecté)

3. Bouton "Voir le corrigé" cliqué :
   a. fetch GET /api/v1/exam-library/{id}/solution  { credentials: 'include' }
   b. 200 → blob URL → afficher dans PDF viewer (sans bouton download)
   c. 402 → vérifier solde → modale achat jetons ou upgrade abonnement
```
