# Change Plan (Upgrade / Downgrade / Cancel) — Frontend Integration

This document explains how the frontend should let a subscribed user switch between **Pro** and **Ultra**, or cancel their subscription entirely.

## What the endpoint does

- **Upgrade** (switching to a more expensive plan, e.g. Pro → Ultra): applied **immediately** on Stripe with proration — the unused time on the old plan is credited, and the difference is charged right away. The user gets the new plan's benefits instantly.
- **Downgrade** (switching to a cheaper plan, e.g. Ultra → Pro): **not immediate**. It's scheduled to take effect at the end of the period the user already paid for. No charge or refund happens now. The user keeps their current plan's benefits (including free audio, if on Ultra) until that date.

Which one happens is decided automatically by the backend (by comparing plan prices) — the frontend doesn't need to know in advance which case it is, just handle both possible response shapes (see below).

## Endpoint

`POST /api/v1/subscriptions/change-plan`

### Request body

```json
{
  "new_plan_id": "6a1f3c2e-...-ultra-plan-id",
  "billing_type": "monthly"
}
```

- `new_plan_id`: required, the target plan's `id` (from `GET /api/v1/admin/subscription-plans`).
- `billing_type`: optional, `"monthly"` or `"annual"`. Omit to keep the user's current billing type and only change the plan tier.

### Response — upgrade (immediate)

```json
{
  "success": true,
  "message": "Plan change processed successfully",
  "data": {
    "id": "...",
    "user_id": "...",
    "plan_id": "6a1f3c2e-...-ultra-plan-id",
    "billing_type": "monthly",
    "status": "active",
    "start_date": "2026-06-01T00:00:00Z",
    "end_date": "2026-07-01T00:00:00Z",
    "pending_plan_id": null,
    "pending_billing_type": null
  }
}
```

`plan_id` already reflects the new plan — refresh the UI immediately (unlock audio/podcast features, update the plan badge, etc.). `end_date` is unchanged (the billing cycle boundary doesn't move for an upgrade).

### Response — downgrade (scheduled)

```json
{
  "success": true,
  "message": "Plan change processed successfully",
  "data": {
    "id": "...",
    "user_id": "...",
    "plan_id": "9f2b8a1d-...-ultra-plan-id",
    "billing_type": "monthly",
    "status": "active",
    "start_date": "2026-06-01T00:00:00Z",
    "end_date": "2026-07-01T00:00:00Z",
    "pending_plan_id": "6a1f3c2e-...-pro-plan-id",
    "pending_billing_type": "monthly"
  }
}
```

Note `plan_id` **still points at the old (current) plan** — the user is not switched yet. `pending_plan_id` tells you what they're switching to, and `end_date` tells you when. **Don't unlock/lock any feature based on this call** — the user keeps their current plan's benefits until `end_date`.

### Error responses

`400 Bad Request` with a `detail` message:

| Situation | `detail` |
|---|---|
| User has no active subscription | `"No active subscription — use /checkout to subscribe first."` |
| User already on the requested plan/billing combo | `"You are already on this plan."` |
| Target plan has no Stripe price configured | `"This plan has no Stripe price configured. Contact support."` |
| Subscription predates Stripe linking (edge case) | `"This subscription isn't linked to Stripe and can't be changed automatically. Contact support."` |

For the first case, redirect to the pricing/checkout flow instead — this endpoint is only for users who already have an active subscription.

`402 Payment Required` — **only possible on an upgrade** (downgrades never charge anything, so they can't fail this way):

| Situation | `detail` |
| --- | --- |
| The card on file was declined/failed when charging the prorated upgrade amount | `"Payment for the plan upgrade failed. Please update your payment method and try again."` |

An upgrade charges the payment method already on file for the subscription automatically — there's no new checkout page. If that charge fails (expired/declined card), the plan is **not** switched (the user stays on their current plan) and this `402` is returned. Point the user to a "update payment method" flow before letting them retry.

## Displaying a scheduled downgrade

Since a downgrade doesn't apply immediately, the frontend needs to show it as **pending** anywhere the user's plan is displayed — not just right after they click the button, but also on later visits (e.g. account settings page load).

Fetch `GET /api/v1/subscriptions/active` and check `pending_plan_id`:

```javascript
async function getSubscriptionDisplayState({ token }) {
  const response = await fetch("/api/v1/subscriptions/active", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { data: sub } = await response.json();

  if (sub.pending_plan_id) {
    return {
      currentPlanId: sub.plan_id,
      pendingPlanId: sub.pending_plan_id,
      pendingSince: sub.end_date, // when the switch actually happens
    };
  }

  return { currentPlanId: sub.plan_id, pendingPlanId: null };
}
```

Suggested copy: *"Your plan will change to Pro on July 1, 2026. You keep Ultra benefits until then."* Optionally, don't offer the "downgrade to Pro" button again while a downgrade is already pending — there's currently no "cancel pending downgrade" endpoint, so avoid implying the user can undo it from the UI yet.

## Trigger example

```javascript
async function changePlan({ newPlanId, billingType, token }) {
  const response = await fetch("/api/v1/subscriptions/change-plan", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ new_plan_id: newPlanId, billing_type: billingType }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.detail ?? "Unable to change plan");
  }

  const sub = payload.data;
  const isImmediate = sub.plan_id === newPlanId;

  return { subscription: sub, isImmediate };
}
```

## UI suggestion (change plan)

- On the plan comparison page, show the button as "Upgrade to Ultra" or "Switch to Pro" depending on direction, but let the backend decide the actual behavior — don't hardcode which one is "immediate" in the frontend, just branch on the response shape (`isImmediate` in the example above).
- After an immediate upgrade: show a success confirmation and refresh any feature-gated UI (audio/podcast cost badges, etc. — see [AUDIO_PRICING_FRONTEND_CHANGES.md](AUDIO_PRICING_FRONTEND_CHANGES.md)).
- After a scheduled downgrade: show a confirmation that's clearly non-immediate ("scheduled for \<date\>"), not a generic success toast — the user shouldn't think they lost Ultra access right away.

## Canceling a subscription

### What the cancel endpoint does

Same "no immediate cutoff" principle as a downgrade: canceling **does not** revoke access right away. It just tells Stripe not to renew at the next billing date. The user keeps their current plan's benefits (Pro or Ultra) until `end_date` — no partial refund, no immediate loss of access.

### Cancel endpoint

`PATCH /api/v1/subscriptions/{subscription_id}/cancel`

No request body.

### Cancel response

```json
{
  "success": true,
  "message": "Subscription canceled successfully",
  "data": {
    "id": "...",
    "user_id": "...",
    "plan_id": "6a1f3c2e-...-ultra-plan-id",
    "billing_type": "monthly",
    "status": "active",
    "start_date": "2026-06-01T00:00:00Z",
    "end_date": "2026-07-01T00:00:00Z",
    "cancel_at_period_end": true
  }
}
```

Note `status` is still `"active"` — the subscription only flips to `"canceled"` once Stripe confirms the period has actually ended (asynchronously, on the backend). `cancel_at_period_end: true` is the flag to check to know a cancellation is scheduled.

### Cancel error responses

`400 Bad Request`:

| Situation | `detail` |
| --- | --- |
| Subscription already fully canceled (period already ended) | `"Subscription is already canceled."` |
| Cancellation already scheduled | `"Cancellation is already scheduled for the end of the current period."` |

`403 Forbidden` if the subscription doesn't belong to the calling user.

### Displaying a scheduled cancellation

Same pattern as the pending-downgrade case — check this on every load of the account page via `GET /api/v1/subscriptions/active`, not just right after the button click:

```javascript
if (sub.cancel_at_period_end) {
  // "Your subscription is canceled and will end on July 1, 2026. You can use Ultra until then."
}
```

### Undoing a scheduled cancellation

If a user cancels and then changes their mind **before `end_date`**, call:

`PATCH /api/v1/subscriptions/{subscription_id}/undo-cancel`

No request body. The subscription resumes renewing normally — same payment method, same price, no new checkout needed.

```json
{
  "success": true,
  "message": "Cancellation undone successfully",
  "data": {
    "id": "...",
    "plan_id": "6a1f3c2e-...-ultra-plan-id",
    "status": "active",
    "end_date": "2026-07-01T00:00:00Z",
    "cancel_at_period_end": false
  }
}
```

`cancel_at_period_end` flips back to `false` — use this to hide the "cancellation scheduled" banner and restore the normal active-plan UI.

**Undo error responses** — `400 Bad Request`:

| Situation | `detail` |
| --- | --- |
| No cancellation was scheduled (nothing to undo) | `"No cancellation is scheduled for this subscription."` |
| The period already ended (subscription is fully `canceled`, not just pending) | `"This subscription has already ended and can't be reactivated this way."` |

`403 Forbidden` if the subscription doesn't belong to the calling user. For the second case, the user needs to subscribe again from scratch via checkout — there's no reactivating a subscription whose period has truly ended.

Only show the "undo cancellation" button while `cancel_at_period_end` is `true` **and** `status` is still `"active"` — once `status` becomes `"canceled"`, this endpoint won't work anymore.

### UI suggestion (cancel)

- Don't say "your account is canceled" immediately — say when access ends, and that they can keep using the app until then.
- While `cancel_at_period_end` is true, show an "Undo cancellation" action next to the "canceled" banner.
- Show a distinct state (e.g. a banner: "Cancellation scheduled") anywhere you'd normally show the active plan badge.
