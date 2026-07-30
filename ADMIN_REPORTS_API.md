# Admin Reports — Frontend Integration

This document describes the 3 endpoints backing the **Admin > Reports** page (`/admin/reports`), replacing the mock data in `adminMock.ts`.

## Important — standard envelope, not the original spec's flat shape

These endpoints use the app's **standard response envelope** (`{success, message, data}`), same as every other endpoint in the API — including standard 403 errors (`{"detail": "Admin access required"}`). If you had started building against a flatter `{"data": [...], "total_cad": ...}` shape, update your parsing to read from `response.data.data.months` etc. as shown below.

## Common query param

All period-based endpoints accept:

| Param | Type | Accepted values | Default |
|---|---|---|---|
| `period` | string | `"3m"` \| `"6m"` \| `"12m"` | `"12m"` |

Data is aggregated by month, going back that many months from today.

## Auth

All 3 endpoints require the caller to be logged in **and** have the `admin` role (same `require_admin` dependency used everywhere else in `/admin/*`). Non-admins get:

```json
{ "detail": "Admin access required" }
```

`403 Forbidden` — same shape as every other admin-only endpoint in the API, so your existing 403 handling already covers this.

## 1. Monthly revenue

`GET /api/v1/admin/reports/revenue?period=12m`

```json
{
  "success": true,
  "message": "Revenue report retrieved successfully",
  "data": {
    "months": [
      { "month": "Aug 2025", "revenue_cad": 0.0 },
      { "month": "Sep 2025", "revenue_cad": 0.0 },
      { "month": "Jun 2026", "revenue_cad": 24.93 },
      { "month": "Jul 2026", "revenue_cad": 32.95 }
    ],
    "total_cad": 57.88,
    "currency": "CAD"
  }
}
```

- `month`: English 3-letter abbreviation + year (`"Jan 2025"`), regardless of server locale.
- `revenue_cad`: sum of **completed** payments (subscriptions + token packs both included) for that month. Refunded/failed transactions are excluded.
- `total_cad`: sum across the whole requested period.
- Months with no revenue are still present with `0.0` — don't filter them out, the chart should show gaps.

## 2. New subscriptions per month

`GET /api/v1/admin/reports/subscriptions?period=12m`

```json
{
  "success": true,
  "message": "Subscriptions report retrieved successfully",
  "data": {
    "months": [
      { "month": "Jun 2026", "new_subscriptions": 1 },
      { "month": "Jul 2026", "new_subscriptions": 3 }
    ],
    "total_new": 4,
    "active_count": 4,
    "canceled_count": 0
  }
}
```

- `new_subscriptions`: count of subscriptions **created** that month (any plan, any status at creation time).
- `total_new`: sum across the requested period.
- `active_count`: subscriptions currently active, **right now** — not period-scoped, same number regardless of `period`.
- `canceled_count`: subscriptions currently in `canceled` status whose last update falls within the requested period. This is an approximation (there's no dedicated "canceled on" timestamp) — treat it as indicative, not perfectly precise, if you need exact cancellation dates flag it and we'll add a proper timestamp.

## 3. Summary KPIs (page header)

`GET /api/v1/admin/reports/summary` — no `period` param, always a real-time snapshot.

```json
{
  "success": true,
  "message": "Reports summary retrieved successfully",
  "data": {
    "total_users": 312,
    "active_subscriptions": 38,
    "mrr_cad": 267.62,
    "revenue_this_month_cad": 89.94,
    "revenue_last_month_cad": 74.88,
    "token_packs_sold_this_month": 14
  }
}
```

- `mrr_cad`: Monthly Recurring Revenue — sum over all currently active subscriptions of (monthly price if billed monthly, or annual price ÷ 12 if billed annually).
- `revenue_this_month_cad` / `revenue_last_month_cad`: completed payments strictly within each calendar month (for the "vs last month" comparison chip).
- `token_packs_sold_this_month`: count of completed token-pack purchases since the 1st of the current month.

## Trigger examples

```javascript
async function getRevenueReport({ period = "12m" }) {
  const response = await fetch(`/api/v1/admin/reports/revenue?period=${period}`, {
    credentials: "include",
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.detail ?? "Unable to load revenue report");
  return payload.data; // { months, total_cad, currency }
}

async function getSubscriptionsReport({ period = "12m" }) {
  const response = await fetch(`/api/v1/admin/reports/subscriptions?period=${period}`, {
    credentials: "include",
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.detail ?? "Unable to load subscriptions report");
  return payload.data; // { months, total_new, active_count, canceled_count }
}

async function getReportsSummary() {
  const response = await fetch(`/api/v1/admin/reports/summary`, { credentials: "include" });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.detail ?? "Unable to load reports summary");
  return payload.data; // flat object of KPIs
}
```

## UI suggestion

- Area chart (revenue): `data.months.map(m => ({ x: m.month, y: m.revenue_cad }))`.
- Bar chart (subscriptions): `data.months.map(m => ({ x: m.month, y: m.new_subscriptions }))`.
- Period selector (3m/6m/12m) re-fetches both charts with the new `period` value — they share the same param, so a single selector can drive both requests.
- Summary KPIs are independent of the period selector — fetch once on page load (or on a manual refresh), not on every period change.
