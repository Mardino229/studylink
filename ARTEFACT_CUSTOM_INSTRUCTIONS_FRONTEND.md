# Instructions personnalisées + fiabilité — Génération d'artefacts IA (Frontend)

## 1. Nouveau champ `custom_instructions`

Les 4 endpoints de génération acceptent désormais un champ optionnel dans le body :

```
POST /api/v1/notebooks/{notebook_id}/artefacts/summaries
POST /api/v1/notebooks/{notebook_id}/artefacts/flashcards
POST /api/v1/notebooks/{notebook_id}/artefacts/quizzes
POST /api/v1/notebooks/{notebook_id}/artefacts/podcasts
```
```ts
{
  title?: string;
  language: string;          // inchangé
  count?: number;            // flashcards/quiz uniquement, inchangé
  custom_instructions?: string;   // NOUVEAU — max 1000 caractères
  source_ids: string[];
  theme_ids: string[];
}
```

C'est un champ de texte libre où l'utilisateur précise ce qu'il veut de **cette génération précise** — ex. "concentre-toi sur le chapitre 3", "rends les questions plus difficiles", "explique comme à un débutant", "utilise des exemples sportifs". Recommandé : un simple `<textarea>` optionnel sur l'écran de génération de chaque artefact, avec un compteur de caractères (max 1000) et un placeholder du type *"Des précisions sur ce que tu veux ? (optionnel)"*.

**Important — ce champ ne peut pas outrepasser les réglages structurels déjà présents dans le formulaire** : `language`, `count` (nombre de flashcards/questions), et le format de sortie (le podcast reste toujours à 2 hôtes, un quiz reste toujours 4 options). Si l'utilisateur écrit "réponds en anglais" dans le champ alors que `language="fr"` est sélectionné ailleurs, la sortie reste en français — c'est volontaire, pour éviter une incohérence entre ce que l'UI affiche/stocke et ce qui est réellement généré. **Vaut la peine d'un texte d'aide sous le champ**, ex. *"Pour la langue ou le nombre de questions, utilise les réglages ci-dessus — ce champ sert au contenu, au ton et au focus."*

## 2. Nouveau cas d'erreur — `502` sur flashcards/quiz

`POST /flashcards` et `POST /quizzes` peuvent désormais renvoyer :

```
502 { "detail": "AI service returned malformed output. Please try again." }
```

C'est distinct du `500` déjà existant ("Error generating ... via AI", panne de communication avec le provider IA) : le `502` signifie que l'IA a répondu, mais avec une structure invalide (ex. un quiz avec 3 options au lieu de 4, ou une réponse correcte qui ne correspond à aucune option) — détecté et bloqué **avant** toute sauvegarde et **avant** tout débit de jeton. Aucun jeton n'est perdu dans ce cas, contrairement à ce qui pouvait arriver avant ce correctif. Traiter ce cas comme un échec transitoire : afficher un message du type *"La génération a échoué, réessaie"* avec un bouton retry — pas besoin de distinguer 500/502 dans l'UI au-delà du message, les deux sont des échecs de génération sans impact sur le solde de jetons.

## 3. Ce qui ne change pas

- Tous les autres champs/comportements des 4 endpoints de génération sont inchangés.
- Le format de sortie de chaque artefact (structure JSON flashcards/quiz, markdown du résumé, format "Host 1:/Host 2:" du podcast) est inchangé — juste plus fiable côté serveur.
