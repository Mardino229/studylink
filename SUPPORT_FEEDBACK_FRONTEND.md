# Support, Feedback & Feature Requests — Frontend Integration

This document explains how to let users report bugs, ask for help, suggest features, or leave general feedback — all through the same endpoint (extended from the existing support ticket system).

## What changed

- New ticket type: **`feedback`** — for general comments/feedback about the app, distinct from `feature_request` (a specific suggestion).
- The submit endpoint now works **both logged-in and anonymously** — if the user is logged in, their account is linked automatically and `email` no longer needs to be typed in.
- Tickets now have a **`status`** (`new` / `seen` / `handled`) for admin triage.

## Endpoint

`POST /api/v1/support/`

### Request body

```json
{
  "email": "user@example.com",
  "message": "It would be great to export flashcards as PDF.",
  "type": "feature_request"
}
```

- `type`: one of `"report_issue"`, `"feature_request"`, `"get_help"`, `"feedback"`.
- `email`: **optional if the user is logged in** (the backend reads the session cookie and fills it in automatically). **Required if not logged in** — omitting it while logged out returns a `400`.
- `message`: required, free text.

This endpoint reads the auth session from the same cookie (`access_token`) as the rest of the app — if the user is already logged in in the browser, you don't need to do anything extra to link the ticket to their account. If they're not logged in, just make sure your form asks for an email.

### Response

```json
{
  "success": true,
  "message": "Your request has been submitted successfully.",
  "data": {
    "id": "b4b6f3f8-6c1e-4f4d-9e70-4e0e3b7c9f2a",
    "user_id": "e7c2f3fb-d3c3-4cf7-ae31-58270c578721",
    "email": "user@example.com",
    "message": "It would be great to export flashcards as PDF.",
    "type": "feature_request",
    "status": "new",
    "created_at": "2026-07-14T09:36:00Z"
  }
}
```

`user_id` is `null` for anonymous submissions.

### Error response

`400 Bad Request` if not logged in and no `email` was provided:

```json
{
  "detail": "Email is required when not logged in."
}
```

Show your email field's validation error here — don't let the user submit without an email unless they're authenticated.

## Trigger example

```javascript
async function submitFeedback({ email, message, type }) {
  const response = await fetch("/api/v1/support/", {
    method: "POST",
    credentials: "include", // send the session cookie if logged in
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, message, type }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.detail ?? "Unable to submit your request");
  }

  return payload.data;
}
```

`credentials: "include"` matters here — without it, the browser won't send the `access_token` cookie, and the ticket will be treated as anonymous even for a logged-in user.

## UI suggestion (submission form)

- If you have the user's logged-in state available client-side, hide the email field entirely when logged in (it's not needed) and show it only for anonymous visitors.
- Use a simple type picker: "Report a bug" / "Request a feature" / "Get help" / "Give feedback" mapped to the 4 `type` values.
- On success, show a simple confirmation — there's no ticket detail/reply view for end users yet (see limitation below).

## Known limitation — no reply/tracking view for users

There is currently no endpoint for a user to see their own submitted tickets or any admin reply. This is a one-way form: submit and forget. If you want a "my feedback" history page or in-app replies, that's new scope — flag it if needed.

---

## Admin panel

If you're also building the admin side, two endpoints matter here.

### List tickets

`GET /api/v1/admin/support-tickets?skip=0&limit=100`

Admin-only (requires the admin role). Returns tickets newest-first, same shape as above, including `status` and `user_id`.

### Update status

`PATCH /api/v1/admin/support-tickets/{ticket_id}/status`

```json
{ "status": "seen" }
```

`status` is one of `"new"`, `"seen"`, `"handled"`. Use this to mark a ticket as triaged/resolved from the admin dashboard.

```json
{
  "success": true,
  "message": "Support ticket status updated successfully.",
  "data": {
    "id": "b4b6f3f8-6c1e-4f4d-9e70-4e0e3b7c9f2a",
    "status": "seen",
    "...": "..."
  }
}
```

### Admin UI suggestion

- Show a badge/column per status (`new` = highlighted/unread, `seen` = neutral, `handled` = greyed out/done).
- Filter/sort by `type` to separate bug reports from feature requests and general feedback — three very different triage flows in practice.
- Show `user_id` (resolve to a user profile link) vs anonymous (`null`) tickets differently, since anonymous ones can't be followed up with beyond the given `email`.
