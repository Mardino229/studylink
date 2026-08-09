# Épreuves / corrigés dissociés — Frontend

Jusqu'ici, une entrée de la bibliothèque d'épreuves (`exam_library`) exigeait **toujours** un fichier épreuve — le corrigé était optionnel. Ce n'était pas suffisant : on veut aussi pouvoir soumettre **un corrigé seul** (la plateforme n'a pas encore l'épreuve correspondante), et permettre à un autre utilisateur de **compléter l'épreuve manquante** plus tard.

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

```
POST /api/v1/exam-library  (multipart/form-data)
- name: string (requis)
- course_id, program_id, study_level_id, academic_year, session, exam_type : optionnels
- exam_file: file (optionnel désormais)
- solution_file: file (optionnel, inchangé)
```

Comportement selon ce qui est fourni :
- **Épreuve seule** : comme avant.
- **Corrigé seul** : crée une entrée avec `exam_file_url = null`, `solution_file_url` rempli directement. Modération identique aux épreuves classiques : `pending` pour un utilisateur normal (visible après validation admin via les endpoints `/{exam_id}/validate` et `/{exam_id}/reject`, inchangés), auto-`validated` pour un admin.
- **Épreuve + corrigé ensemble** : comportement inchangé (le corrigé passe par la queue de modération séparée `ExamSolutionSubmission`, comme avant).

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
  exam?: { id, name, academic_year, session, exam_type, submission_status, course? }; // résumé
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
- `has_exam_access` / `has_solution_access` sur `ExamLibraryRead` (ajoutés précédemment) : toujours là, calculés indépendamment de la présence du fichier — vérifie `exam_file_url`/`solution_file_url` non-null en complément pour savoir si le fichier existe tout court.
