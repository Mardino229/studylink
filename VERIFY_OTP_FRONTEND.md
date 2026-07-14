# Verify OTP — Auto-Login on Success — Frontend Integration

This document explains a contract change to the account verification endpoint: on a fresh, successful OTP verification, the user is now **automatically logged in** — no separate `/login` call needed afterward.

## What changed

Previously, `POST /auth/verify-otp` only activated the account and returned a plain message. The user then had to be redirected to a login screen and type their password again.

Now, when the OTP is valid and the account was just activated, the backend sets the **same auth cookies as `/login`** in the same response, and returns the logged-in user's data. The user goes straight from "enter code" to "inside the app" — no login screen in between.

This only happens on a **fresh** verification (account was inactive, code was valid). If the account was already active (e.g. the user re-submits an old page, or double-clicks), nothing is auto-logged-in — see below for why.

## Endpoint

`POST /api/v1/auth/verify-otp` (unchanged path/method)

### Request body (unchanged)

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Response — fresh verification (auto-login)

```json
{
  "success": true,
  "message": "Account activated successfully",
  "data": {
    "user": {
      "id": "e7c2f3fb-d3c3-4cf7-ae31-58270c578721",
      "email": "user@example.com",
      "...": "... (same shape as the /login response's user object)"
    }
  }
}
```

Auth cookies (`access_token`, `refresh_token`) are set on this response — same `httpOnly`, `secure`, `samesite: lax` cookies `/login` sets. If your request used `credentials: "include"` (or your HTTP client's cookie equivalent), the browser stores them automatically; you don't need to read them from the response body.

**Treat this response exactly like a successful `/login` response** — store `data.user` in your app state the same way, and route the user straight into the app (skip the login screen entirely).

### Response — account already active (no auto-login)

```json
{
  "success": true,
  "message": "Account already activated",
  "data": null
}
```

`data` is `null` here — **do not** treat this as a login. The user still needs to go through `/login` normally with their password. This case only happens if verification was already completed earlier (stale page, double submission, etc.), so no fresh credential was actually checked here — that's a deliberate security choice, not an oversight, so don't try to "fix" it by auto-logging-in on this path too.

### How to tell the two cases apart

Check whether `data` is present:

```javascript
const isAutoLoggedIn = payload.data !== null && payload.data?.user;
```

### Error responses (unchanged)

`400 Bad Request` — `"Invalid OTP"` or `"OTP expired"` (point the user to the resend flow, see [RESEND_OTP_FRONTEND.md](RESEND_OTP_FRONTEND.md)).
`404 Not Found` — `"User not found"`.

## Updated frontend flow

1. User submits the OTP form.
2. Call `POST /auth/verify-otp` with `credentials: "include"`.
3. If `data.user` is present: store the user, treat as logged in, redirect straight into the app (dashboard/home) — **do not** show a login screen.
4. If `data` is `null` (already active): redirect to `/login` instead, since no session was opened.
5. On `400`/`404`: show the relevant error, with a link to resend the code if it was invalid/expired.

## Trigger example

```javascript
async function verifyOtp({ email, otp }) {
  const response = await fetch("/api/v1/auth/verify-otp", {
    method: "POST",
    credentials: "include", // required to receive/store the auth cookies
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.detail ?? "Unable to verify the code");
  }

  const isAutoLoggedIn = payload.data?.user != null;
  return { user: payload.data?.user ?? null, isAutoLoggedIn };
}
```

```javascript
// In your submit handler:
const { user, isAutoLoggedIn } = await verifyOtp({ email, otp });

if (isAutoLoggedIn) {
  setCurrentUser(user);
  navigate("/dashboard");
} else {
  navigate("/login");
}
```

## UI suggestion

- Skip any "Redirecting to login..." transition screen for the auto-login case — go straight to the app, that's the whole point of this change.
- If you show a welcome/onboarding flow on first login, this is the natural place to trigger it, since this is provably the user's very first successful session.
