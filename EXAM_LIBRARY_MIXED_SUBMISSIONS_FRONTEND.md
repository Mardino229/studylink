# Épreuves / corrigés dissociés — Frontend

Jusqu'ici, une entrée de la bibliothèque d'épreuves (`exam_library`) exigeait **toujours** un fichier épreuve — le corrigé était optionnel. Ce n'était pas suffisant : on veut aussi pouvoir soumettre **un corrigé seul** (la plateforme n'a pas encore l'épreuve correspondante), et permettre à un autre utilisateur de **compléter l'épreuve manquante** plus tard.

## 0. Schéma complet `ExamLibraryRead`

Référence à jour de la ressource principale — tout le reste du document ne fait qu'expliquer ces champs en détail.

```ts
{
  id: string;
  name: string;                         // toujours rempli (jamais null en sortie) — voir section 2
  course_id?: string;
  program_id?: string;
  study_level_id?: string;
  academic_year?: number;
  session?: "fall" | "winter" | "summer";
  exam_type?: "Mi-session" | "Final" | "Quiz" | "Devoir" | "Pratique" | "DGD" | "Autre";
  type_number?: number;                 // 1 à 20 — voir section 2
  section?: string;                     // ex "A" — normalisé en majuscules par le backend
  is_exam_paid: boolean;
  is_solution_paid: boolean;

  creation_date: string;                // ISO datetime
  creator_user_id: string;
  exam_file_url?: string;               // null = épreuve manquante — voir section 1
  solution_file_url?: string;           // null = corrigé manquant
  solution_creator_user_id?: string;
  submission_status: "pending" | "validated" | "rejected";
  admin_note?: string;
  course?: {
    id: string;
    code_fr?: string; name_fr?: string;   // absents si le cours n'existe qu'en anglais
    code_en?: string; name_en?: string;   // absents si le cours n'existe qu'en français
    faculty_id?: string;
  };

  has_exam_access: boolean;             // voir section 0bis
  has_solution_access: boolean;
}
```

**Cours bilingues — `code`/`name` remplacés par `code_fr`/`code_en`/`name_fr`/`name_en`.** Le catalogue UdO utilise des codes différents en français et en anglais pour un même cours (ex: `ADM1500` fr / `ADM1100` en) — un seul champ `code` ne pouvait pas représenter les deux. Un cours a **toujours au moins une paire complète** (`code_fr`+`name_fr` ou `code_en`+`name_en`), mais parfois une seule (cours offert dans une seule langue, ou catalogues FR/EN qui n'ont pas pu être appariés de façon fiable à l'import). Côté affichage : afficher la paire dans la langue de l'utilisateur si présente, sinon retomber sur l'autre — ne jamais supposer que les deux sont renseignées. Mêmes champs sur `CourseSummary` (utilisé dans `ExamSummary.course`, cf. section 5).

## 0ter. Sélecteur de cours — `GET /courses` (catalogue complet, ~4950 cours)

Le catalogue est passé de ~27 cours (liste manuelle) à **la totalité du catalogue UdO (~4950 cours, toutes facultés)**. Un `<select>` non filtré n'est plus utilisable — l'endpoint expose maintenant recherche + pagination, **à utiliser obligatoirement** pour tout picker de cours (création d'exam, filtres de liste, etc.) :

```
GET /api/v1/courses?search=ADM15&faculty_id=...&skip=0&limit=50
→ StandardResponse<CourseRead[]>
```
- `search` (optionnel) : préfixe sur `code_fr`/`code_en` (ex. `"ADM15"` matche `ADM1500`, `ADM1501`…) **ou** sous-chaîne insensible à la casse sur `name_fr`/`name_en` (ex. `"gestion"` matche "Introduction à la gestion"). Un seul paramètre couvre recherche par code et par titre.
- `faculty_id` (optionnel, inchangé) : limite à une faculté.
- `skip`/`limit` (nouveau, défaut `limit=50`) : pagination — ne pas appeler sans `search` ni `limit` explicite si l'intention est d'afficher un dropdown complet, ça ne renverra que les 50 premiers résultats triés par code.

Pattern recommandé côté front : champ de recherche avec debounce (300ms) → `GET /courses?search=<saisie>&limit=20`, pas de chargement de la liste complète au montage du composant.

Si un écran admin permet de créer/modifier un cours manuellement (`POST`/`PATCH /courses`), le payload suit le même schéma bilingue :
```ts
{ code_fr?: string; name_fr?: string; code_en?: string; name_en?: string; faculty_id?: string }
```
Contrainte serveur : au moins une paire complète (`code_fr`+`name_fr` ou `code_en`+`name_en`) requise, sinon `400`. Les deux paires peuvent coexister ou être renseignées séparément (ex. corriger juste la traduction anglaise d'un cours existant).

## 0bis. `has_exam_access` / `has_solution_access`

Indique si **l'utilisateur courant** peut consulter le fichier correspondant sans (re)payer de jetons — abonnement actif, contenu gratuit (`is_exam_paid`/`is_solution_paid = false`), ou accès déjà acheté précédemment. Sert à afficher "déjà débloqué" vs "coûte 1 jeton" dans la liste, sans devoir tenter l'accès pour le savoir.

Calculés uniquement sur ces 5 endpoints (les seuls qui connaissent l'utilisateur courant) :
- `GET /exam-library`
- `GET /exam-library/{exam_id}`
- `GET /exam-library/my-submissions`
- `GET /exam-library/missing-solution`
- `GET /exam-library/missing-exam`

Ailleurs (réponses de création/validation/rejet, soumissions de corrigé/épreuve), ces deux champs sont absents du calcul et retombent sur leur défaut `false` — ne pas s'y fier en dehors des 5 endpoints ci-dessus.

Logique exacte : `has_exam_access = abonnement actif OU is_exam_paid=false OU déjà acheté` (idem pour `has_solution_access`). Le fichier peut malgré tout être absent (`exam_file_url = null`) même si `has_exam_access = true` — ces deux notions sont indépendantes, toujours vérifier les deux avant d'afficher un bouton "Télécharger".

## 1. Les 3 états possibles d'une entrée

Une entrée `ExamLibrary` peut maintenant se trouver dans un des trois états suivants (visibles via `exam_file_url` / `solution_file_url`, tous les deux `Optional<string>` désormais) :

| État | `exam_file_url` | `solution_file_url` | Signification |
|---|---|---|---|
| Épreuve seule | rempli | `null` | Comme avant — l'épreuve existe, pas encore de corrigé |
| **Corrigé seul (nouveau)** | `null` | rempli | La plateforme a le corrigé, pas l'épreuve |
| Complète | rempli | rempli | Les deux sont disponibles |

Contrainte serveur : les deux ne peuvent jamais être `null` en même temps (une entrée a toujours au moins un des deux fichiers).

**Important — `exam_file_url` n'est plus garanti non-null.** Si ton code front faisait `exam.exam_file_url` sans vérifier, il faut désormais gérer le cas `null` (bouton "Télécharger l'épreuve" à masquer/désactiver, afficher plutôt un badge "épreuve manquante — proposer un fichier").

## 2. Création — `POST /exam-library` (modifié)

`exam_file` est désormais **optionnel** (`solution_file` l'était déjà). Il faut fournir **au moins un des deux**, sinon `400 Bad Request`.

`name` est aussi devenu **optionnel**. S'il est omis, le backend génère automatiquement un label au format `cours_sessionannée_type{n}_section` (composants manquants simplement omis), ex. `"IFT1015_Fall2026_Quiz3_A"`. Dans tous les cas, `name` est **toujours rempli en sortie** (jamais `null` sur `ExamLibraryRead`) — le champ front peut rester un simple input optionnel.

**`name` est unique en base.** Si le label (fourni ou auto-généré) existe déjà, le backend ajoute automatiquement un suffixe `" (2)"`, `" (3)"`… — jamais d'erreur, mais **si le front affiche ce suffixe tel quel dans une liste, c'est un signal à faire remonter à l'utilisateur/admin** : ça veut dire qu'une entrée avec ce nom exact existe déjà, potentiellement un doublon de soumission.

```
POST /api/v1/exam-library  (multipart/form-data)
- name: string (optionnel — généré automatiquement si absent)
- course_id, program_id, study_level_id, academic_year, session : optionnels
- exam_type: "Mi-session" | "Final" | "Quiz" | "Devoir" | "Pratique" | "DGD" | "Autre" (optionnel)
- type_number: int, 1 à 20 (voir règle ci-dessous)
- section: string, ex. "A", "B" (optionnel — normalisé en majuscules par le backend)
- exam_file: file (optionnel)
- solution_file: file (optionnel)
```

Comportement selon ce qui est fourni :
- **Épreuve seule** : comme avant.
- **Corrigé seul** : crée une entrée avec `exam_file_url = null`, `solution_file_url` rempli directement. Modération identique aux épreuves classiques : `pending` pour un utilisateur normal (visible après validation admin via les endpoints `/{exam_id}/validate` et `/{exam_id}/reject`, inchangés), auto-`validated` pour un admin.
- **Épreuve + corrigé ensemble** : comportement inchangé (le corrigé passe par la queue de modération séparée `ExamSolutionSubmission`, comme avant).

### `exam_type` / `type_number` — un cours peut avoir plusieurs entrées du même type

Un cours a typiquement plusieurs Quiz, Devoirs, DGD, etc. sur une session — `type_number` (1 à 20) sert à les distinguer (Quiz 1, Quiz 2, …). **Règle : `type_number` est obligatoire dès que `exam_type` est fourni, sauf pour `"Final"`** (un cours n'a normalement qu'un seul examen final). Envoyer `type_number` sans `exam_type` est aussi rejeté (`400`).

```
exam_type="Quiz", type_number absent        → 400 "type_number is required for this exam type..."
exam_type="Final", type_number absent       → OK
type_number=3, exam_type absent             → 400 "type_number requires exam_type to be set"
exam_type="Quiz", type_number=3             → OK, apparaît comme "Quiz3" dans le nom généré
```

Cette même règle s'applique aussi sur `PUT /{exam_id}/resubmit` et `PATCH /{exam_id}` (admin) si `exam_type`/`type_number` font partie des champs modifiés.

## 3. Nouveau flux symétrique : compléter l'épreuve manquante

Exactement le même principe que "soumettre un corrigé pour une épreuve qui n'en a pas" (`missing-solution` / `/{exam_id}/solution/submit`), mais inversé pour le fichier épreuve.

### Lister les entrées "corrigé seul" à compléter

```
GET /api/v1/exam-library/missing-exam
→ StandardResponse<ExamLibraryRead[]>
```
Retourne les entrées `submission_status = validated` avec `exam_file_url = null`. Utilise-le pour l'écran "Aide-nous à compléter la bibliothèque" (pendant équivalent de l'écran existant pour `missing-solution`).

### Proposer un fichier épreuve

```
POST /api/v1/exam-library/{exam_id}/exam-file/submit  (multipart/form-data: exam_file)
→ 201, StandardResponse<ExamFileSubmissionRead>
```
- `exam_id` doit correspondre à une entrée `validated` avec `exam_file_url` encore `null` (sinon `400`).
- Plusieurs utilisateurs peuvent proposer un fichier pour le même exam — un admin en valide un seul.
- Ne modifie **pas** `exam_library.exam_file_url` immédiatement : reste `pending` tant qu'un admin n'a pas validé.

### Mes soumissions de fichier épreuve

```
GET /api/v1/exam-library/my-exam-file-submissions
→ StandardResponse<ExamFileSubmissionRead[]>
```
Pendant de `my-solution-submissions` — pour un écran "Mes contributions".

### Re-soumettre après refus

```
PUT /api/v1/exam-library/exam-file-submissions/{submission_id}/resubmit  (multipart/form-data: exam_file)
→ StandardResponse<ExamFileSubmissionRead>
```
Uniquement si la soumission est `rejected`.

### Supprimer ma soumission

```
DELETE /api/v1/exam-library/exam-file-submissions/my-submissions/{submission_id}
→ StandardResponse
```
Uniquement si `pending` ou `rejected` (pas `validated`).

## 4. Modération admin (nouveaux endpoints, miroir de la modération des corrigés)

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/exam-library/admin/exam-file-submissions/pending` | Toutes les soumissions de fichier épreuve en attente |
| GET | `/exam-library/{exam_id}/exam-file-submissions` | Toutes les soumissions pour un exam donné |
| GET | `/exam-library/exam-file-submissions/{submission_id}/file` | Afficher le fichier brut (streaming PDF, avant validation) |
| POST | `/exam-library/exam-file-submissions/{submission_id}/validate` | Valide — copie `exam_file_url` sur l'entrée, rejette les autres soumissions pending pour le même exam, crédite 0.5 coin au soumetteur |
| POST | `/exam-library/exam-file-submissions/{submission_id}/reject` (body: `{ admin_note?: string }`) | Refuse |

Toutes retournent `StandardResponse<ExamFileSubmissionRead>` (sauf le fichier, qui est un stream `application/pdf`). Réutilise le même écran de modération que celui des corrigés, juste sur une ressource différente.

## 5. Schéma `ExamFileSubmissionRead`

```ts
{
  id: string;
  exam_id: string;
  exam?: { id, name, academic_year, session, exam_type, type_number, section, submission_status, course? }; // résumé
  submitter_user_id: string;
  exam_file_url: string;
  submission_status: "pending" | "validated" | "rejected";
  admin_note?: string;
  coins_rewarded: boolean;
  submitted_at: string; // ISO datetime
  reviewed_at?: string;
}
```
Identique à `ExamSolutionSubmissionRead`, juste `solution_file_url` → `exam_file_url`.

## 6. Ce qui ne change PAS

- `GET /exam-library/{exam_id}/download` (consultation payante de l'épreuve) : si `exam_file_url` est `null`, renvoie maintenant `404` explicite au lieu de planter — gère ce cas dans l'UI (affiche "épreuve pas encore disponible" plutôt qu'une erreur générique).
- `GET /exam-library/{exam_id}/solution` (consultation du corrigé) : inchangé, gère déjà l'absence de corrigé.
- Tout le flux "corrigé pour une épreuve qui n'en a pas" (`missing-solution`, `/{exam_id}/solution/submit`, etc.) : inchangé.
- `has_exam_access` / `has_solution_access` : voir section 0bis pour le détail complet (quels endpoints, quelle logique).

## 7. Anti-doublon : filtres de liste + vue admin des entrées similaires

`GET /exam-library` accepte maintenant deux filtres supplémentaires en query params :

```
GET /api/v1/exam-library?course_id=...&exam_type=Quiz&type_number=3
```
- `type_number` : int, 1 à 20.
- `section` : string — comparé après normalisation (`" a "` et `"A"` matchent la même entrée).

### Vue admin — entrées similaires déjà validées

```
GET /api/v1/exam-library/{exam_id}/similar   (admin uniquement)
→ StandardResponse<ExamLibraryRead[]>
```
Retourne les entrées déjà `validated` du **même cours + même `exam_type`** (filtré aussi par `session`/`academic_year` si l'entrée consultée les a renseignés), triées par `type_number`. Vide si l'entrée n'a ni `course_id` ni `exam_type` (rien de pertinent à comparer).

À utiliser sur l'écran de modération d'une soumission `pending` : appeler cet endpoint avec l'`id` de la soumission en cours de revue, afficher la liste retournée à côté (avec liens vers leurs fichiers) pour que l'admin puisse comparer visuellement avant de valider ou refuser. C'est le complément direct du suffixe `(n)` mentionné en section 2 — celui-ci prévient qu'un nom identique existe déjà, `/similar` montre concrètement quoi comparer.
