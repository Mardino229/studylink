# Pré-production — Correctifs sécurité : ce qui change côté frontend

Ce document couvre tous les correctifs Critical + High + Medium issus de l'audit pré-déploiement. La plupart sont invisibles pour le frontend (durcissement backend pur), mais **plusieurs points ci-dessous demandent une action concrète**. Ils sont classés par urgence.

---

## 🔴 Action immédiate requise

### 1. Tous les utilisateurs vont être déconnectés une fois (à prévoir au déploiement)

Deux changements invalident tous les tokens JWT actuellement en circulation :
- Le `SECRET_KEY` de signature a été régénéré (l'ancien était une valeur faible).
- Les tokens contiennent désormais un claim `"type"` (`access`/`refresh`/`reset`) que le backend vérifie strictement. Les anciens tokens ne l'ont pas et seront rejetés.

**Conséquence** : au déploiement, `access_token`/`refresh_token` existants renverront `401` partout, y compris sur `/auth/refresh`. Assure-toi que le frontend gère déjà un `401` global en redirigeant proprement vers `/login` (intercepteur axios/fetch), plutôt que de boucler ou d'afficher une erreur brute. Aucun changement de contrat n'est nécessaire si c'est déjà le cas — c'est un événement ponctuel au déploiement, pas un changement de comportement permanent.

### 2. Gérer le nouveau statut `429 Too Many Requests`

Un rate limiting a été ajouté sur les endpoints d'auth. Réponse type :

```json
{ "error": "Rate limit exceeded: 10 per 1 minute" }
```

Limites appliquées :

| Endpoint | Limite |
|---|---|
| `POST /auth/register` | 5 / heure |
| `POST /auth/login` | 10 / minute |
| `POST /auth/verify-otp` | 10 / heure |
| `POST /auth/resend-otp` | 5 / heure |
| `POST /auth/request-password-reset` | 5 / heure |
| `POST /auth/reset-password` | 10 / heure |

Il faut intercepter le `429` sur ces 6 appels et afficher un message du type *"Trop de tentatives, réessaie dans quelques minutes"* au lieu de l'erreur générique actuelle. Le corps n'a pas la forme standard `{success, message, data}` — c'est `{"error": "..."}`, à gérer comme un cas à part.

### 3. OTP : 6 chiffres, plus 5

Le code OTP (inscription, changement de mot de passe) fait maintenant **6 chiffres** (il en faisait 5 par erreur — le backend disait déjà "6 digits" mais générait 5). Si le champ de saisie OTP a 5 cases/`maxLength={5}` en dur, il faut le passer à 6.

### 4. Upload de sources : extensions restreintes

`POST /notebooks/{notebook_id}/sources` valide maintenant l'extension du fichier **avant** de l'accepter. Extensions autorisées :

```
.pdf .txt .pptx .ppt .jpg .jpeg .png .webp .gif
```

Un fichier hors de cette liste renvoie **400** :

```json
{ "detail": "Unsupported file type '.exe'. Allowed: .gif, .jpeg, .jpg, .pdf, .png, .ppt, .pptx, .txt, .webp" }
```

Aligne l'attribut `accept` de l'`<input type="file">` sur cette liste (probablement déjà proche si les images ont été ajoutées récemment), et affiche `detail` tel quel si un 400 arrive malgré tout — les utilisateurs comprennent "type de fichier non supporté".

⚠️ Notez que `.docx` **n'est pas** dans la liste (jamais supporté côté extraction, seul `exam_library` l'accepte pour les épreuves/corrigés — ne pas confondre les deux features).

---

## 🟠 À vérifier / ajuster

### 5. `GET /user/{user_id}` est désormais admin-only

Cet endpoint ne doit plus être appelé par un utilisateur normal (c'était une faille IDOR — n'importe quel utilisateur connecté pouvait lire le profil de n'importe qui). Si une page du frontend l'utilisait pour autre chose que l'admin, elle recevra un `403` — utilise `GET /user/me` pour le profil de l'utilisateur courant.

### 6. `resend-otp` et `request-password-reset` ne renvoient plus jamais 404

Avant : un email inconnu renvoyait `404 { "detail": "User not found" }`, ce qui permettait de deviner quels emails sont enregistrés (énumération de comptes). Maintenant, ces deux endpoints renvoient **toujours** `200` avec un message générique, que l'email existe ou non :

```json
{ "success": true, "message": "If this email is registered and not yet activated, a new OTP has been sent.", "data": null }
{ "success": true, "message": "If this email is registered, a password reset link has been sent.", "data": null }
```

**Si le frontend affichait un message différencié selon 404 vs 200** ("cet email n'existe pas" / "email envoyé"), il faut retirer cette branche et toujours afficher le message générique renvoyé par l'API.

### 7. Verrouillage OTP après 5 échecs

`POST /auth/verify-otp` renvoie désormais `429` après 5 codes erronés consécutifs, même si le 6e essai est le bon code :

```json
{ "detail": "Too many failed attempts. Please request a new OTP." }
```

Il faut orienter l'utilisateur vers "Renvoyer un code" (`/auth/resend-otp`) dans ce cas précis — le compteur d'échecs est remis à zéro à chaque renvoi.

### 8. Suppression d'un dossier ("Folder") : les notebooks ne sont plus supprimés

Bug corrigé : supprimer un dossier supprimait aussi tous les notebooks qu'il contenait (cascade non voulue). Maintenant, les notebooks sont conservés et simplement détachés (`folder_id = null`) — ils réapparaissent dans la vue "sans dossier"/racine. Si une modale de confirmation dit *"Cette action supprimera aussi les notebooks à l'intérieur"*, il faut corriger le texte : les notebooks sont préservés, seul le dossier disparaît.

### 9. Nombre de flashcards/questions de quiz : bornes ajoutées

`POST /notebooks/{notebook_id}/artefacts/flashcards` (`count`) et `.../quizzes` (`count`) rejettent maintenant les valeurs hors bornes avec un `422` standard FastAPI (`{"detail": [{"loc": [...], "msg": "..."}]}`) :

| Artefact | Min | Max | Défaut |
|---|---|---|---|
| Flashcards | 1 | 50 | 10 |
| Quiz | 1 | 30 | 5 |

Si l'UI propose un slider/input libre pour `count`, cappe-le côté client à ces valeurs pour éviter un 422 inutile.

### 10. Flux de streaming SSE (`/sources/{id}/stream`) exige maintenant l'authentification

Cet endpoint (utilisé après upload d'une source pour suivre l'extraction en temps réel) n'était pas protégé avant — n'importe qui connaissant l'URL pouvait s'y connecter. Il exige maintenant la session (cookies `access_token`). Si ce flux est ouvert via `new EventSource(url)`, **il faut passer `{ withCredentials: true }`**, sinon les cookies ne sont pas envoyés et l'appel échouera en `401` :

```js
new EventSource(url, { withCredentials: true })
```

Si le flux est déjà géré via `fetch` + lecture manuelle du stream (`credentials: 'include'`), aucun changement requis.

### 11. Changement de mot de passe / reset : la session actuelle est maintenant vraiment invalidée

Nouveau mécanisme de révocation côté serveur (avant, le logout ne faisait qu'effacer les cookies — un token volé restait valide jusqu'à expiration naturelle).

Concrètement :

- **`POST /auth/logout`** : comportement inchangé pour toi (toujours un simple appel, toujours `200`), mais en plus il invalide vraiment le token côté serveur.
- **`POST /user/change-password`** et **`POST /auth/reset-password`** : en cas de succès, **toutes** les sessions de l'utilisateur (y compris celle en cours) sont invalidées côté serveur. L'access token actuellement en mémoire/cookie devient immédiatement invalide (`401` au prochain appel), même s'il n'est pas encore expiré.

**Action requise** : après un succès sur ces deux endpoints, redirige systématiquement vers `/login` (ne pas supposer que la session en cours reste utilisable). Si ce n'est pas déjà le comportement actuel, il faut l'ajouter — sinon l'utilisateur verra des `401` inattendus sur son prochain appel API après avoir changé son mot de passe.

### 12. `PATCH /user/me` (update profile) : email dupliqué renvoie maintenant un 400 propre

Avant, envoyer un email déjà utilisé par un autre compte provoquait un `500` brut (erreur DB non gérée). Maintenant :

```json
{ "detail": "Email already registered" }
```

`400 Bad Request` — à afficher comme n'importe quelle autre erreur de validation de formulaire.

### 13. Pagination : bornes ajoutées partout (`per_page`/`limit`)

Tous les endpoints de liste (notebooks, dossiers, sources, résumés, flashcards, quiz, podcasts, sessions de chat, thèmes, récompenses, épreuves, facultés/programmes) rejettent maintenant les valeurs hors bornes avec un `422` standard FastAPI, au lieu d'accepter n'importe quelle valeur. Bornes typiques : `page ≥ 1`, `per_page`/`limit` entre 1 et 100–200 selon l'endpoint. Si l'UI ne demande jamais plus de ~100 éléments par page, il n'y a rien à changer ; sinon, cappe la valeur envoyée côté client.

---

## 🟢 Coordination infra (pas de code frontend, mais à savoir)

- **CORS** : l'origine autorisée n'est plus codée en dur (`localhost:5173`) mais lue depuis la variable d'env backend `CORS_ORIGINS`. Au déploiement, il faudra que l'infra/DevOps ajoute l'URL de prod du frontend à cette variable, sinon les requêtes seront bloquées par CORS.
- **Aucun changement de contrat** sur : génération de résumé/flashcards/quiz/podcast, jetons, coins, abonnements Stripe. Le comportement de facturation a été durci (on ne débite plus si l'IA échoue), mais la forme des réponses est identique.

---

## Pas d'action nécessaire (pour information)

- Fuite `hashed_password`/`otp_code` dans les réponses `/user/*` : corrigée côté backend, la forme de `UserRead` était déjà correcte (le frontend n'a jamais dû lire ces champs).
- IDOR sur les listes de résumés/flashcards/quiz/podcasts : renforcement d'autorisation invisible pour un usage normal.
- Race condition conversion coins→jetons : correction purement backend.
