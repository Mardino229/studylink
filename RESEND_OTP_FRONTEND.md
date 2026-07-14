# Resend OTP — Frontend Integration

This document explains how the frontend should let a user request a new email verification code, if the original one expired or was never received.

## What the endpoint does

- Generates a brand new OTP code, replacing any previous one.
- Resets the expiration window to **15 minutes** from the moment of the call.
- Sends it by email, exactly like `POST /auth/register` does on signup.
- If the account is already verified/active, it does nothing (no email sent) and just confirms that.

## Endpoint

`POST /api/v1/auth/resend-otp`

### Request body

```json
{
  "email": "user@example.com"
}
```

### Response — new code sent

```json
{
  "success": true,
  "message": "A new OTP has been sent. Please check your email.",
  "data": null
}
```

### Response — account already activated

```json
{
  "success": true,
  "message": "Account already activated",
  "data": null
}
```

Same `200`/`success: true` shape as the "sent" case — check the `message` text to distinguish, and route the user to login instead of the OTP screen if you want to handle this case specially.

### Error response

`404 Not Found` if the email doesn't match any account:

```json
{
  "detail": "User not found"
}
```

## When to call this

- On the OTP verification screen (the one shown right after `/auth/register`), add a "Didn't receive a code? / Code expired?" link/button that calls this endpoint with the same email used to register.
- If `verify-otp` returns `"OTP expired"`, that's your cue to prompt the user toward this action instead of letting them keep retrying the old code.

## Trigger example

```javascript
async function resendOtp({ email }) {
  const response = await fetch("/api/v1/auth/resend-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.detail ?? "Unable to resend the code");
  }

  return payload.message; // "A new OTP has been sent..." or "Account already activated"
}
```

## UI suggestion

- Disable the "resend" button for a short cooldown after a successful call (e.g. 30–60s) to avoid accidental double-clicks — there's currently no rate-limiting on the backend, so this is purely a frontend nicety, not a required safeguard.
- On success, reset/clear whatever the user had typed in the OTP input field, since the old code is now invalid.
- If the response message is `"Account already activated"`, redirect straight to login rather than keeping them on the OTP screen.
