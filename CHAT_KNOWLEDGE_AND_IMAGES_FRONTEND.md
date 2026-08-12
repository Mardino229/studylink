# Chat notebook : réponses hors-sources + images — Frontend

## 1. Le chat ne refuse plus de répondre hors des documents

Avant, si la réponse n'était pas dans les documents uploadés, le chat répondait un truc du type *"je n'ai pas assez d'information dans les documents"*. Ce n'est plus le cas : il répond maintenant avec ses connaissances générales quand les documents ne couvrent pas la question, **en le signalant explicitement** dans sa réponse (ex. *"Ce n'est pas couvert par tes documents, mais..."*). Aucun changement de schéma ni d'endpoint pour ça — juste un comportement différent. Si l'UI affichait un badge/état spécial pour "pas trouvé dans les sources", il ne se déclenchera plus de la même façon — à vérifier si un tel affichage existe côté front.

`citations` (déjà existant sur `ChatMessage`) reste basé sur les chunks effectivement récupérés par la recherche — sur une réponse hors-sources, il peut être vide ou peu pertinent, c'est normal.

## 2. ⚠️ Changement cassant — envoi de message en `multipart/form-data`

`POST /api/v1/notebooks/{notebook_id}/chats/{session_id}/messages` et `.../messages/stream` **n'acceptent plus de JSON**. Il faut désormais envoyer un `FormData`, même pour un message texte seul :

```
POST /api/v1/notebooks/{notebook_id}/chats/{session_id}/messages
Content-Type: multipart/form-data

content: string          (requis)
images: file[]            (optionnel — jusqu'à 5, jpg/jpeg/png/webp/gif, max 10 Mo chacune)
```

Exemple front (`fetch`) — plusieurs fichiers sous le **même** nom de champ `images` :
```js
const form = new FormData();
form.append("content", text);
for (const file of imageFiles) form.append("images", file); // 0 à 5 fichiers
await fetch(`/api/v1/notebooks/${notebookId}/chats/${sessionId}/messages`, {
  method: "POST",
  body: form, // pas de Content-Type manuel, le navigateur le fixe avec le boundary
});
```
Même chose pour `/messages/stream` (SSE, inchangé sinon).

Erreurs possibles sur `images` : `400` si extension non supportée, une image > 10 Mo, ou plus de 5 images dans le même message (rien n'est sauvegardé si une seule image du lot est invalide — tout ou rien). Sur `/messages/stream`, ces erreurs remontent comme un événement SSE `{"type": "error", "text": "..."}` (pas un vrai code HTTP, la connexion SSE est déjà ouverte en 200) — les distinguer d'une vraie panne IA n'est pas nécessaire, le texte de l'erreur est déjà explicite.

## 3. Nouveau champ `image_urls` sur `ChatMessage`

```ts
{
  id: string;
  session_id: string;
  role: "user" | "model" | "system";
  content: string;
  citations?: Record<string, any>;
  image_urls?: string[];   // NOUVEAU — liste (0 à 5), présence = images jointes à ce message
  created_at: string;
}
```

**`image_urls` ne contient pas des URL directement fetchables** — ce sont des chemins serveur internes, jamais exposés publiquement (même logique que les fichiers d'épreuves : privé par design). Pour afficher la N-ième image d'un message, appeler :

```
GET /api/v1/notebooks/{notebook_id}/chats/{session_id}/messages/{message_id}/images/{image_index}
```
`image_index` = position dans le tableau `image_urls` (0-based). Réponse : le fichier image en streaming (`Content-Type` correct selon l'extension). Utiliser ça comme `src` d'un `<img>` (avec les credentials/auth nécessaires, endpoint authentifié comme tous les autres). `404` si le message n'a pas d'image à cet index, ou n'appartient pas à la session/notebook indiqués.

## 4. Comportement à connaître — les images ne sont "vues" qu'une fois

Le modèle ne reçoit les images que **le tour où elles sont envoyées**. Si l'utilisateur continue la conversation ensuite, le modèle ne "revoit" plus ces images (juste le texte du message original) — c'est voulu, pour garder un coût/latence stables même sur une longue conversation. Si l'UI veut que l'utilisateur puisse "reposer une question sur les mêmes images" plus tard, il faut les rejoindre à nouveau (`images` sur un nouveau message).

## 5. Ce qui ne change pas
- `GET .../messages` (historique paginé) : `image_urls` remonte automatiquement, rien d'autre ne change.
- Facturation : envoyer des images ne coûte pas plus cher qu'un message texte, quel que soit le nombre.
- Le chat reste sur Gemini (pas de changement de provider).
