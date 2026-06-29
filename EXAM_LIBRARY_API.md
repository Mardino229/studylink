# Exam Library — Documentation API

Base URL : `POST /api/v1/exam-library`

---

## Authentification

Toutes les routes nécessitent un cookie `access_token` valide, posé automatiquement par le serveur à la connexion. Le frontend n'a rien à faire manuellement — le cookie est envoyé automatiquement par le navigateur à chaque requête.

```
Cookie: access_token=<jwt>
```

> Assure-toi que les requêtes sont envoyées avec `credentials: "include"` (fetch) ou `withCredentials: true` (axios).

---

## Niveaux d'accès

| Rôle | Permissions |
|---|---|
| **Admin** | Créer / modifier / supprimer cours et épreuves, uploader les corrigés, valider les épreuves |
| **Utilisateur connecté** | Parcourir et télécharger les épreuves validées |
| **Utilisateur abonné** | Accéder aux corrigés payants (abonnement actif requis) |

---

## Enums disponibles

### `session`
```
fall | winter | summer
```

### `exam_type`
```
midterm | final | quiz | other
```

---

## Cours (`/courses`)

### Lister les cours
```
GET /api/v1/exam-library/courses
```
**Accès :** Utilisateur connecté

**Query params :**
| Param | Type | Description |
|---|---|---|
| `faculty_id` | UUID (optionnel) | Filtrer par faculté |

**Réponse 200 :**
```json
{
  "data": [
    {
      "id": "uuid",
      "code": "CSI2120",
      "name": "Paradigmes de programmation",
      "faculty_id": "uuid"
    }
  ]
}
```

---

### Créer un cours
```
POST /api/v1/exam-library/courses
```
**Accès :** Admin uniquement

**Body (JSON) :**
```json
{
  "code": "CSI2120",
  "name": "Paradigmes de programmation",
  "faculty_id": "uuid (optionnel)"
}
```

**Réponse 201 :**
```json
{
  "data": {
    "id": "uuid",
    "code": "CSI2120",
    "name": "Paradigmes de programmation",
    "faculty_id": "uuid"
  }
}
```

> Le code est automatiquement converti en majuscules. Renvoie `400` si le code existe déjà.

---

### Modifier un cours
```
PATCH /api/v1/exam-library/courses/{course_id}
```
**Accès :** Admin uniquement

**Body (JSON, tous les champs optionnels) :**
```json
{
  "code": "CSI2130",
  "name": "Nouveau nom",
  "faculty_id": "uuid"
}
```

---

### Supprimer un cours
```
DELETE /api/v1/exam-library/courses/{course_id}
```
**Accès :** Admin uniquement

---

## Épreuves (`/`)

### Rechercher des épreuves
```
GET /api/v1/exam-library
```
**Accès :** Utilisateur connecté

**Query params :**
| Param | Type | Description |
|---|---|---|
| `faculty_id` | UUID | Filtrer par faculté |
| `program_id` | UUID | Filtrer par programme |
| `course_id` | UUID | Filtrer par cours |
| `study_level_id` | UUID | Filtrer par niveau (undergrad/grad) |
| `academic_year` | int | Ex : `2024` |
| `session` | enum | `fall` / `winter` / `summer` |
| `exam_type` | enum | `midterm` / `final` / `quiz` / `other` |
| `is_validated` | bool | `true` pour n'afficher que les épreuves validées |
| `skip` | int | Pagination (défaut : 0) |
| `limit` | int | Nombre de résultats (défaut : 100) |

**Réponse 200 :**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Examen final hiver 2024",
      "course_id": "uuid",
      "course": {
        "id": "uuid",
        "code": "CSI2120",
        "name": "Paradigmes de programmation",
        "faculty_id": "uuid"
      },
      "program_id": "uuid",
      "study_level_id": "uuid",
      "academic_year": 2024,
      "session": "winter",
      "exam_type": "final",
      "is_solution_paid": true,
      "exam_file_url": "uploads/exams/xxx.pdf",
      "solution_file_url": null,
      "is_validated": true,
      "creation_date": "2026-06-27T00:00:00",
      "creator_user_id": "uuid"
    }
  ]
}
```

> Par défaut tous les examens (validés ou non) sont retournés. Utilise `is_validated=true` pour n'afficher que les épreuves publiées aux étudiants.

---

### Détail d'une épreuve
```
GET /api/v1/exam-library/{exam_id}
```
**Accès :** Utilisateur connecté

**Réponse 200 :** même structure qu'un élément de la liste ci-dessus.

---

### Télécharger le fichier de l'épreuve
```
GET /api/v1/exam-library/{exam_id}/download
```
**Accès :** Utilisateur connecté

**Réponse :** Fichier PDF en streaming (`application/pdf`).

> Renvoie `403` si l'épreuve n'est pas encore validée par un admin.

---

### Accéder au corrigé
```
GET /api/v1/exam-library/{exam_id}/solution
```
**Accès :** Utilisateur connecté + **abonnement actif** (si `is_solution_paid = true`)

**Réponse :** Fichier PDF en streaming (`application/pdf`).

**Codes d'erreur :**
| Code | Raison |
|---|---|
| `404` | Aucun corrigé disponible pour cette épreuve |
| `402` | Abonnement actif requis (`is_solution_paid = true` et pas d'abonnement) |

> Si `is_solution_paid = false`, n'importe quel utilisateur connecté peut y accéder.

---

### Uploader une épreuve
```
POST /api/v1/exam-library
```
**Accès :** Admin uniquement

**Body (multipart/form-data) :**
| Champ | Type | Requis | Description |
|---|---|---|---|
| `name` | string | ✅ | Nom de l'épreuve |
| `exam_file` | file | ✅ | Fichier PDF / DOCX / PPTX |
| `course_id` | UUID | — | Cours concerné |
| `program_id` | UUID | — | Programme concerné |
| `study_level_id` | UUID | — | Niveau d'études |
| `academic_year` | int | — | Ex : `2024` |
| `session` | enum | — | `fall` / `winter` / `summer` |
| `exam_type` | enum | — | `midterm` / `final` / `quiz` / `other` |
| `is_solution_paid` | bool | — | Défaut : `true` |

**Réponse 201 :** objet épreuve créée (non validée par défaut).

---

### Uploader le corrigé
```
POST /api/v1/exam-library/{exam_id}/solution
```
**Accès :** Admin uniquement

**Body (multipart/form-data) :**
| Champ | Type | Requis |
|---|---|---|
| `solution_file` | file | ✅ |

**Réponse 200 :** objet épreuve mis à jour avec `solution_file_url` rempli.

> Si un corrigé existait déjà, il est remplacé.

---

### Valider une épreuve
```
POST /api/v1/exam-library/{exam_id}/validate
```
**Accès :** Admin uniquement

Passe `is_validated` à `true` — l'épreuve devient visible et téléchargeable par les étudiants.

**Réponse 200 :** objet épreuve mis à jour.

---

### Modifier les métadonnées d'une épreuve
```
PATCH /api/v1/exam-library/{exam_id}
```
**Accès :** Admin uniquement

**Body (JSON, tous les champs optionnels) :**
```json
{
  "name": "Nouveau titre",
  "academic_year": 2025,
  "session": "fall",
  "exam_type": "midterm",
  "is_solution_paid": false,
  "is_validated": true
}
```

---

### Supprimer une épreuve
```
DELETE /api/v1/exam-library/{exam_id}
```
**Accès :** Admin uniquement

Supprime l'épreuve **et ses fichiers** (épreuve + corrigé) du serveur.

---

## Flux typiques

### Flux admin — ajouter une épreuve complète

```
1. POST /api/v1/exam-library/courses          → créer le cours si inexistant
2. POST /api/v1/exam-library                  → uploader l'épreuve (multipart)
3. POST /api/v1/exam-library/{id}/solution    → uploader le corrigé (multipart)
4. POST /api/v1/exam-library/{id}/validate    → publier l'épreuve
```

### Flux étudiant — accéder à un corrigé

```
1. GET /api/v1/exam-library?course_id=...&academic_year=2024&session=winter
   → trouver l'épreuve

2. GET /api/v1/exam-library/{id}/download
   → télécharger l'épreuve (gratuit)

3. GET /api/v1/exam-library/{id}/solution
   → télécharger le corrigé
   → si is_solution_paid = true et pas d'abonnement actif → 402
```

---

## Codes d'erreur communs

| Code | Signification |
|---|---|
| `401` | Token manquant ou invalide |
| `402` | Abonnement requis pour le corrigé |
| `403` | Rôle admin requis / épreuve non validée |
| `404` | Ressource introuvable |
| `400` | Données invalides (ex : code cours en doublon, format fichier non supporté) |

**Formats de fichiers acceptés :** `.pdf`, `.docx`, `.pptx`, `.ppt`
