# API Frontend Contract

Cette documentation décrit le contrat réel exposé par l’API `StudyLink` sous `/api/v1`.

Règle importante : les réponses synchrones utilisent le wrapper standard suivant.

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Pour les listes paginées, `data` contient toujours :

```json
{
  "items": [],
  "pagination": {
    "total": 0,
    "page": 1,
    "per_page": 20,
    "total_pages": 0
  }
}
```

Les réponses SSE ne sont pas enveloppées par ce wrapper. Elles arrivent sous forme de flux JSON bruts.

## 1. Folders

Base path : `/api/v1/folders`

### `GET /folders?page=1&per_page=20`
Retourne la liste paginée des dossiers de l’utilisateur connecté.

```json
{
  "success": true,
  "message": "Folders retrieved successfully",
  "data": {
    "items": [
      {
        "id": "e292c10a-3453-4876-90ea-44a80693a1e1",
        "name": "Semestre 1",
        "description": "Cours et partiels de fin d'année",
        "user_id": "c1f2b3...",
        "created_at": "2026-05-23T10:00:00.000",
        "updated_at": "2026-05-23T10:00:00.000"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "per_page": 20,
      "total_pages": 1
    }
  }
}
```

### `POST /folders`
```json
{
  "name": "Semestre 1",
  "description": "Cours et partiels de fin d'année"
}
```

Réponse :

```json
{
  "success": true,
  "message": "Folder created successfully",
  "data": {
    "id": "e292c10a-3453-4876-90ea-44a80693a1e1",
    "name": "Semestre 1",
    "description": "Cours et partiels de fin d'année",
    "user_id": "c1f2b3...",
    "created_at": "2026-05-23T10:00:00.000",
    "updated_at": "2026-05-23T10:00:00.000"
  }
}
```

### `PUT /folders/{folder_id}`
```json
{
  "name": "Semestre 2",
  "description": "Mise à jour"
}
```

### `DELETE /folders/{folder_id}`
Réponse standard sans `data`.

```json
{
  "success": true,
  "message": "Folder deleted successfully"
}
```

## 2. Notebooks

Base path : `/api/v1/notebooks`

### `GET /notebooks?page=1&per_page=20&folder_id=...`
Liste paginée des notebooks de l’utilisateur.

```json
{
  "success": true,
  "message": "Notebooks retrieved successfully",
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Droit Pénal",
        "description": "Révisions",
        "folder_id": "e292c10a-3453-4876-90ea-44a80693a1e1",
        "user_id": "c1f2b3...",
        "created_at": "2026-05-23T10:05:00.000",
        "updated_at": "2026-05-23T10:05:00.000"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "per_page": 20,
      "total_pages": 1
    }
  }
}
```

### `POST /notebooks`
```json
{
  "name": "Droit Pénal",
  "description": "Révisions",
  "folder_id": "e292c10a-3453-4876-90ea-44a80693a1e1"
}
```

### `GET /notebooks/{notebook_id}`
Retourne un notebook unitaire dans le wrapper standard.

### `PATCH /notebooks/{notebook_id}`
Mise à jour partielle du notebook.

### `DELETE /notebooks/{notebook_id}`
Supprime le notebook.

## 3. Sources

Base path : `/api/v1/notebooks/{notebook_id}/sources`

### `POST /sources`
Format : `multipart/form-data`

Champ attendu : `file`

Réponse :

```json
{
  "success": true,
  "message": "Source uploaded successfully",
  "data": {
    "id": "abc12345-6789-...",
    "notebook_id": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "Chapitre_1.pdf",
    "file_type": "pdf",
    "status": "pending",
    "storage_url": "uploads/...",
    "created_at": "2026-05-23T10:10:00.000",
    "updated_at": ""
  }
}
```

### `GET /sources?page=1&per_page=20`
Liste paginée des documents déposés dans le notebook.

### `GET /sources/{source_id}/stream`
Flux SSE de traitement du document. Exemple d’événements :

```json
{"status":"processing","message":"Starting extraction for Chapitre_1.pdf...","progress":10}
{"status":"processing","message":"Extracted 45 paragraphs. Starting vectorization...","progress":40}
{"status":"processing","message":"Embedded chunk 15/45...","progress":56}
{"status":"processing","message":"Extracting notebook themes...","progress":95}
{"status":"processing","message":"Detected 5 themes for this notebook.","progress":98}
{"status":"completed","message":"Vectorization and indexing complete! Ready for Chat.","progress":100}
```

### `DELETE /sources/{source_id}`
Supprime le fichier source et ses vecteurs.

## 4. Themes

Base path : `/api/v1/notebooks/{notebook_id}/themes`

Les thèmes sont dédupliqués au niveau du notebook. Si plusieurs sources d’un même notebook font ressortir la même idée, un seul thème canonique est conservé et relié à plusieurs documents.

### `GET /themes?page=1&per_page=20`
Liste paginée des thèmes déjà détectés dans le notebook.

```json
{
  "success": true,
  "message": "Themes retrieved successfully",
  "data": {
    "items": [
      {
        "id": "theme-uuid-1",
        "notebook_id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Responsabilité pénale",
        "normalized_name": "responsabilite penale",
        "description": "Theme extracted from multiple documents about criminal liability.",
        "confidence": 0.91,
        "created_at": "2026-05-25T10:00:00.000",
        "updated_at": "2026-05-25T10:01:00.000"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "per_page": 20,
      "total_pages": 1
    }
  }
}
```

## 5. Chats

Base path : `/api/v1/notebooks/{notebook_id}/chats`

### `GET /chats?page=1&per_page=20`
Liste paginée des sessions de chat.

### `POST /chats`
```json
{ "title": "Session Révision" }
```

Réponse :

```json
{
  "success": true,
  "message": "Chat session created successfully",
  "data": {
    "id": "chat-session-uuid",
    "notebook_id": "...",
    "title": "Session Révision",
    "created_at": "..."
  }
}
```

### `POST /chats/{session_id}/messages`
Message synchrone avec réponse standardisée.

```json
{
  "content": "Quel est la définition de l'infraction ?"
}
```

### `POST /chats/{session_id}/messages/stream`
Streaming SSE de la réponse du modèle.

```json
{"type":"citations","citations":[{"source_id":"...","filename":"Chapitre_1.pdf","content_snippet":"L'infraction pénale se définit comme..."}]}
{"type":"token","text":"Selon "}
{"type":"token","text":"le "}
{"type":"token","text":"Chapitre 1, l'infraction est..."}
{"type":"done","message_id":"uuid-du-message-sauvegarde-en-bdd"}
```

## 6. Artefacts générés

Base path : `/api/v1/notebooks/{notebook_id}/artefacts`

### 6.1 Summaries

#### `POST /summaries`
Génère un résumé à la demande.

Corps de requête requis:

- `title`: titre du résumé généré

Paramètres optionnels de ciblage:

- `source_ids`: une ou plusieurs sources du notebook
- `theme_ids`: un ou plusieurs thèmes du notebook

Si aucun filtre n’est fourni, le résumé est construit à partir de tout le notebook.

Corps de requête requis:

- `title`: titre du résumé généré
- `source_ids`: liste optionnelle d'UUID de sources
- `theme_ids`: liste optionnelle d'UUID de thèmes

Exemples:

- `POST /summaries`

#### `GET /summaries?page=1&per_page=20`
Liste paginée des résumés.

#### `GET /summaries/{summary_id}`
Récupère un résumé par ID.

#### `DELETE /summaries/{summary_id}`
Supprime un résumé.

### 6.2 Flashcards

#### `POST /flashcards?count=10`
Génère une liste de flashcards à la demande.

Corps de requête requis:

- `title`: titre du lot de flashcards généré
- `source_ids`: liste optionnelle d'UUID de sources
- `theme_ids`: liste optionnelle d'UUID de thèmes

Les mêmes paramètres optionnels `source_ids` et `theme_ids` sont supportés pour cibler un sous-ensemble du notebook.

Réponse :

```json
{
  "success": true,
  "message": "Flashcards generated successfully",
  "data": [
    {
      "id": "flash-uuid-1",
      "front": "Citez les trois éléments constitutifs de l'infraction.",
      "back": "L'élément légal, matériel et moral."
    }
  ]
}
```

#### `GET /flashcards?page=1&per_page=20`
Liste paginée des flashcards déjà générées.

#### `GET /flashcards/{flashcard_id}`
Récupère une flashcard par ID.

#### `DELETE /flashcards/{flashcard_id}`
Supprime une flashcard.

### 6.3 Quizzes

#### `POST /quizzes?count=5`
Génère un quiz à choix multiple à la demande.

Corps de requête requis:

- `title`: titre du quiz généré
- `source_ids`: liste optionnelle d'UUID de sources
- `theme_ids`: liste optionnelle d'UUID de thèmes

Les mêmes paramètres optionnels `source_ids` et `theme_ids` sont supportés.

#### `GET /quizzes?page=1&per_page=20`
Liste paginée des quiz.

#### `GET /quizzes/{quiz_id}`
Récupère un quiz par ID.

#### `DELETE /quizzes/{quiz_id}`
Supprime un quiz et ses questions.

### 6.4 Podcasts

#### `POST /podcasts`
Génère un transcript de podcast / briefing audio à la demande.

Corps de requête requis:

- `title`: titre du podcast généré
- `source_ids`: liste optionnelle d'UUID de sources
- `theme_ids`: liste optionnelle d'UUID de thèmes

Les mêmes paramètres optionnels `source_ids` et `theme_ids` sont supportés.

#### `GET /podcasts?page=1&per_page=20`
Liste paginée des podcasts générés.

#### `GET /podcasts/{podcast_id}`
Récupère un podcast par ID.

#### `DELETE /podcasts/{podcast_id}`
Supprime un podcast.

## 7. Cycle de vie des artefacts

- Les artefacts ne deviennent pas obsolètes quand une nouvelle source arrive.
- Chaque génération crée un nouvel artefact enregistré dans la liste de l’utilisateur.
- L’utilisateur peut donc garder un historique de plusieurs résumés, flashcards, quiz ou podcasts pour un même notebook.
- La génération est déclenchée uniquement à la demande, sur tout le notebook ou sur une sélection de sources / thèmes.

## 8. Contrat Frontend

Règle pratique :

- Pour les réponses synchrones, lire `response.data`.
- Pour les listes paginées, lire `response.data.items` et `response.data.pagination`.
- Pour le SSE, écouter le flux brut et réagir à `status`, `type`, `progress`, `token` ou `done` selon l’endpoint.
