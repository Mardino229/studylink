# Carte mentale (Mind Map) — nouvel artefact (Frontend)

## 1. Concept

Nouveau (5ème) type d'artefact de notebook, au même niveau que résumé/flashcards/quiz/podcast : une **carte mentale**, structurée en **arbre de nœuds** (pas un graphe — chaque nœud a exactement un parent) pensée pour être affichée par un composant interactif (zoom, drag, expansion de nœuds). Le backend ne renvoie que la donnée ; toute la logique de rendu/interaction est côté front.

## 2. Endpoints

```
POST   /api/v1/notebooks/{notebook_id}/artefacts/mindmaps
GET    /api/v1/notebooks/{notebook_id}/artefacts/mindmaps            (paginé)
GET    /api/v1/notebooks/{notebook_id}/artefacts/mindmaps/{id}
DELETE /api/v1/notebooks/{notebook_id}/artefacts/mindmaps/{id}
```

Mêmes conventions que les 4 autres artefacts (`StandardResponse<T>`, pagination `{items, pagination}`, 403 si le notebook n'appartient pas à l'utilisateur).

## 3. Génération — `POST /mindmaps`

```ts
{
  title?: string;
  language: string;                 // "fr" par défaut
  max_depth?: number;                // 1 à 5, défaut 3 — voir §5
  custom_instructions?: string;      // max 1000 caractères, même sémantique que les autres artefacts
  source_ids: string[];
  theme_ids: string[];
}
```

`source_ids`/`theme_ids` filtrent le contenu source exactement comme pour les autres artefacts (union des deux si les deux sont fournis, tout le notebook si aucun n'est fourni).

Coût : **1 jeton**, comme résumé/flashcards/quiz (podcast a un coût différent, inchangé). Mêmes codes d'erreur que les autres artefacts :
- `402` — solde insuffisant
- `500` — panne de communication avec l'IA (`"Error generating Mind Map via AI."`)
- `502` — sortie IA malformée, **aucun jeton débité** dans ce cas (même garde-fou que flashcards/quiz)

## 4. Forme des données — `MindMap`

```ts
interface MindMapNode {
  id: string;
  label: string;              // court — quelques mots, le "titre" du nœud
  description: string | null; // 1 phrase de détail, peut être absent
  source_ids: string[];       // UUIDs des sources dont ce nœud est tiré (peut être vide, ex. nœud purement organisationnel)
  children: MindMapNode[];    // vide pour une feuille
}

interface MindMap {
  id: string;
  notebook_id: string;
  title: string;
  root: MindMapNode;          // un seul nœud racine — toute la carte est son sous-arbre
  created_at: string;
  updated_at: string;
}
```

`source_ids` sur un nœud fonctionne comme `Theme.source_ids` (déjà utilisé côté front) : permet par exemple d'afficher "cette branche vient de tel document" ou de faire un lien cliquable vers la source, si voulu.

## 5. `max_depth`

C'est un garde-fou de taille/coût, pas juste une préférence : le nombre de nœuds peut croître vite avec la profondeur, donc c'est **appliqué côté serveur** (l'arbre renvoyé ne dépasse jamais `max_depth` niveaux, racine comprise = niveau 1), pas seulement demandé au modèle. Recommandé : un simple slider/select 1-5 sur l'écran de génération, comme `count` pour flashcards/quiz.

## 6. Ce qui ne change pas

- Aucun impact sur les 4 autres types d'artefacts.
- Mêmes règles de `custom_instructions` que les autres artefacts (ne peut pas outrepasser `language`, `max_depth`, ou la structure de sortie).
