# Exams are no longer free — frontend integration guide

Viewing an exam paper (`épreuve`) now costs **1 token**, the same way the corrigé already does. This document explains what changed and how the frontend needs to adapt.

## Summary

| | Before | Now |
|---|---|---|
| Viewing/downloading an exam | Free for any authenticated user | Costs 1 token (unless subscribed or already unlocked) |
| Download behavior | Real file download (`FileResponse`) | Streamed inline for viewing only — no more "download" semantics |
| Exam file storage | Publicly reachable at `/uploads/exams/...` | Private, only reachable through the authenticated endpoint |

The endpoint URL and method **did not change** — it's still `GET /{exam_id}/download` — but its behavior did.

## Endpoint

`GET /api/v1/exams/{exam_id}/download`

### Behavior

- **Admin**: always free, even for exams still `pending`.
- **Regular user**:
  - Exam must be `validated`, otherwise `403 Exam not yet validated`.
  - If `exam.is_exam_paid` is `true` (default for all exams):
    - Active subscribers → free, no token deducted.
    - If the user already unlocked this exam before → free (permanent access, no re-charge).
    - Otherwise → 1 token is deducted from the user's balance and access is unlocked **permanently** for that exam/user pair.
  - If the balance is insufficient → `402 Payment Required`.

### Success response

Same as before — a raw PDF stream, not the standard JSON envelope:

```
Content-Type: application/pdf
Content-Disposition: inline
Cache-Control: no-store
X-Content-Type-Options: nosniff
```

Render it the same way you already render `/{exam_id}/solution` (e.g. in an `<iframe>` or a PDF viewer component) — **do not** trigger a `download` attribute or "Save As" flow, since the intent is view-only.

### Error response — insufficient tokens

```json
{
  "detail": "Insufficient tokens. Viewing an exam costs 1 token."
}
```

HTTP status `402 Payment Required`. Handle this the same way the corrigé purchase flow already does: show the "buy tokens" modal / redirect to the token packs screen.

### Error response — not validated

```json
{
  "detail": "Exam not yet validated"
}
```

HTTP status `403`.

## Data model changes

`ExamLibraryRead` (returned by `GET /exams`, `GET /exams/{exam_id}`, `GET /exams/my-submissions`, etc.) has a new field:

```json
{
  "id": "...",
  "name": "...",
  "is_exam_paid": true,
  "is_solution_paid": true,
  "exam_file_url": "...",
  "solution_file_url": null,
  "submission_status": "validated"
}
```

- `is_exam_paid` (`bool`, default `true`): mirrors `is_solution_paid`. Use it to decide whether to show a token cost / lock icon on the exam card before the user opens it. If an admin sets it to `false` for a specific exam, viewing that exam stays free even for non-subscribers.
- `exam_file_url` / `solution_file_url`: these are **internal storage paths now, not public URLs**. They no longer resolve under `/uploads/...` and should not be used directly as a link `href` or `<iframe src>`. Always go through the dedicated endpoints (`/{exam_id}/download`, `/{exam_id}/solution`) — the same rule that already applied to the corrigé.

## Suggested UI flow

1. On the exam list/detail screen, if `is_exam_paid` is `true` and the user isn't a subscriber, show a token cost badge ("1 jeton") on the exam card — same visual language as the corrigé's "2 jetons" badge.
2. On click, call `GET /{exam_id}/download` directly (no need to pre-check the balance — the backend enforces it).
3. On `200`, render the PDF stream inline (viewer, not a download link).
4. On `402`, open the token purchase flow (same handler you already use for the corrigé 402).
5. Once a user has successfully opened a given exam, subsequent opens are free — no need to show the cost badge again for that exam/user pair. (Nothing to track client-side: the backend just won't charge again.)

## Checking balance / buying tokens (existing, unchanged)

These endpoints are unchanged and are what you already use for the corrigé flow — reuse them for the exam flow too:

- `GET /api/v1/tokens/balance` — current balance
- `GET /api/v1/tokens/packs` — available packs
- `POST /api/v1/tokens/packs/{pack_id}/checkout` — Stripe checkout session
- `GET /api/v1/tokens/transactions` — history (now also includes `"type": "exam"` entries)
- `GET /api/v1/tokens/stats` — consumption breakdown, now also includes an `"exam"` key alongside `"artefact"`, `"corrige"`, `"chat"`

## Migration note

Existing exams in the database are marked `is_exam_paid: true` by default — every exam that used to be free is now paid unless an admin explicitly flips it back to free per exam via the admin update endpoint.
