# Intégration — Changement de mot de passe avec OTP

Ce document explique comment intégrer la fonctionnalité de changement de mot de passe sécurisé par OTP depuis le frontend.

---

## Vue d'ensemble du flux

```
[Utilisateur clique "Changer mon mot de passe"]
        │
        ▼
[1] POST /api/v1/user/request-change-password-otp
        │  ← L'utilisateur doit être connecté (JWT)
        │  → Un OTP à 5 chiffres est envoyé à son adresse email
        │
        ▼
[Afficher un formulaire : mot de passe actuel + nouveau mot de passe + champ OTP]
        │
        ▼
[2] POST /api/v1/user/change-password
        │  ← Corps JSON : current_password, new_password, confirm_new_password, otp_code
        │  → Mot de passe changé, OTP invalidé
```

---

## Endpoint 1 — Demander l'OTP

### Requête

```
POST /api/v1/user/request-change-password-otp
Authorization: Bearer <access_token>
```

Pas de corps (body). L'utilisateur est identifié via le token JWT.

### Réponse — succès `200 OK`

```json
{
  "success": true,
  "message": "OTP sent to your email. Please use it to confirm your password change.",
  "data": null
}
```

### Comportement attendu côté frontend

- Appeler cet endpoint au moment où l'utilisateur souhaite changer son mot de passe.
- Afficher un message de confirmation : _"Un code OTP a été envoyé à votre adresse email."_
- Afficher le formulaire permettant de saisir le code OTP, le mot de passe actuel et le nouveau mot de passe.

---

## Endpoint 2 — Changer le mot de passe

### Requête

```
POST /api/v1/user/change-password
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Corps (JSON) :**

| Champ                  | Type     | Obligatoire | Description                           |
|------------------------|----------|-------------|---------------------------------------|
| `current_password`     | `string` | ✅           | Mot de passe actuel de l'utilisateur  |
| `new_password`         | `string` | ✅           | Nouveau mot de passe souhaité         |
| `confirm_new_password` | `string` | ✅           | Confirmation du nouveau mot de passe  |
| `otp_code`             | `string` | ✅           | Code OTP reçu par email               |

**Exemple :**

```json
{
  "current_password": "MonAncienMdp123",
  "new_password": "MonNouveauMdp456!",
  "confirm_new_password": "MonNouveauMdp456!",
  "otp_code": "84921"
}
```

### Réponse — succès `200 OK`

```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null
}
```

### Erreurs possibles

| Status | `detail`                                          | Cause                                              |
|--------|---------------------------------------------------|----------------------------------------------------|
| `400`  | `"Current password is incorrect"`                 | Le mot de passe actuel est erroné                  |
| `400`  | `"Invalid or expired OTP"`                        | L'OTP est incorrect ou l'étape 1 n'a pas été faite |
| `400`  | `"New passwords do not match"`                    | `new_password` ≠ `confirm_new_password`            |
| `400`  | `"New password must be different from the current password"` | Le nouveau mot de passe est identique à l'ancien |
| `401`  | `"Not authenticated"`                             | Token JWT absent ou expiré                         |



---

## Notes importantes

- L'OTP est à **usage unique**. Une fois le mot de passe changé, il est invalidé.
- Si l'utilisateur n'a pas reçu son OTP, il doit rappeler l'endpoint `request-change-password-otp` pour en générer un nouveau.
- Les deux endpoints nécessitent que l'utilisateur soit **authentifié** (cookie `access_token` ou header `Authorization: Bearer <token>`).
- Il n'y a pas de délai d'expiration configuré sur l'OTP côté base de données. Pour une sécurité renforcée en production, discutez avec le backend de l'ajout d'une expiration (ex. 10 minutes).
