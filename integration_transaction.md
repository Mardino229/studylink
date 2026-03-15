# Transactions API — Frontend Integration Guide

> Base URL : `https://your-api.com/api/v1`  
> All endpoints require a **Bearer token** in the `Authorization` header.  
> Admin endpoints additionally require the authenticated user to have the `admin` role.

---

## Endpoints Overview

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/subscriptions/transactions` | `GET` | User | My transaction history |
| `/admin/transactions` | `GET` | Admin | All platform transactions |
| `/admin/transactions/stats` | `GET` | Admin | Platform payment statistics |

---

## 1. My Transactions (User)

Returns the transaction history of the currently authenticated user.

### Request

```http
GET /api/v1/subscriptions/transactions?skip=0&limit=20
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `skip` | `integer` | `0` | Number of records to skip (pagination) |
| `limit` | `integer` | `50` | Max records to return (max `200`) |

### Response `200`

```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": {
    "items": [
      {
        "id": 42,
        "user_id": 3,
        "plan_id": 1,
        "billing_type": "monthly",
        "amount": "9.99",
        "currency": "eur",
        "status": "completed",
        "stripe_session_id": "cs_live_xxxxx",
        "stripe_payment_intent_id": "pi_xxxxx",
        "subscription_id": 7,
        "payment_date": "2026-03-08T14:05:00Z",
        "created_at": "2026-03-08T14:00:00Z",
        "updated_at": "2026-03-08T14:05:00Z"
      }
    ],
    "total": 1,
    "skip": 0,
    "limit": 50
  }
}
```

### Transaction statuses

| `status` | Meaning |
|---|---|
| `pending` | Checkout initiated, payment not yet confirmed |
| `completed` | Payment confirmed by Stripe webhook — subscription active |
| `failed` | Payment failed or Stripe session expired |
| `refunded` | Payment was refunded |

---

## 2. All Platform Transactions (Admin)

Returns a paginated and filterable list of all transactions across the platform.

### Request

```http
GET /api/v1/admin/transactions?skip=0&limit=50&status=completed&user_id=3
Authorization: Bearer <admin_token>
```

### Query Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `skip` | `integer` | `0` | Number of records to skip |
| `limit` | `integer` | `50` | Max records to return (max `200`) |
| `status` | `string` | *(all)* | Filter by status: `pending`, `completed`, `failed`, `refunded` |
| `user_id` | `integer` | *(all)* | Filter by a specific user's ID |

### Response `200`

```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": {
    "items": [
      {
        "id": 42,
        "user_id": 3,
        "user_first_name": "Alice",
        "user_last_name": "Dupont",
        "user_email": "alice@example.com",
        "plan_id": 1,
        "billing_type": "monthly",
        "amount": "9.99",
        "currency": "eur",
        "status": "completed",
        "stripe_session_id": "cs_live_xxxxx",
        "stripe_payment_intent_id": "pi_xxxxx",
        "subscription_id": 7,
        "payment_date": "2026-03-08T14:05:00Z",
        "created_at": "2026-03-08T14:00:00Z",
        "updated_at": "2026-03-08T14:05:00Z"
      },
      {
        "id": 41,
        "user_id": 5,
        "user_first_name": "Bob",
        "user_last_name": "Martin",
        "user_email": "bob@example.com",
        "plan_id": 2,
        "billing_type": "annual",
        "amount": "199.00",
        "currency": "eur",
        "status": "failed",
        "stripe_session_id": "cs_live_yyyyy",
        "stripe_payment_intent_id": null,
        "subscription_id": null,
        "payment_date": null,
        "created_at": "2026-03-08T13:00:00Z",
        "updated_at": "2026-03-08T13:10:00Z"
      }
    ],
    "total": 128,
    "skip": 0,
    "limit": 50
  }
}
```

### Pagination

Use `total`, `skip` and `limit` to build your pagination UI:

```js
const totalPages = Math.ceil(data.total / data.limit);
const currentPage = Math.floor(data.skip / data.limit) + 1;

// Next page
const nextSkip = data.skip + data.limit;

// Previous page
const prevSkip = Math.max(0, data.skip - data.limit);
```

---

## 3. Transaction Statistics (Admin)

Returns aggregated platform-wide payment statistics.

### Request

```http
GET /api/v1/admin/transactions/stats
Authorization: Bearer <admin_token>
```

### Response `200`

```json
{
  "success": true,
  "message": "Transaction statistics retrieved successfully",
  "data": {
    "total_revenue": "2847.63",
    "completed_count": 214,
    "failed_count": 18,
    "pending_count": 3,
    "total_count": 235
  }
}
```

### Fields

| Field | Type | Description |
|---|---|---|
| `total_revenue` | `decimal string` | Sum of all **completed** transactions (in EUR) |
| `completed_count` | `integer` | Number of successful payments |
| `failed_count` | `integer` | Number of failed/expired payments |
| `pending_count` | `integer` | Number of payments currently in progress |
| `total_count` | `integer` | Total number of transactions (all statuses) |

### Usage example — Dashboard card

```js
const res = await api.get('/admin/transactions/stats');
const stats = res.data;

// Revenue card
`€${parseFloat(stats.total_revenue).toFixed(2)}`  // "€2847.63"

// Success rate
const successRate = ((stats.completed_count / stats.total_count) * 100).toFixed(1);
`${successRate}%`  // "91.1%"
```

---

## Error Reference

| HTTP Code | Cause | What to do |
|---|---|---|
| `401` | Missing or expired token | Redirect to login |
| `403` | User does not have admin role | Hide admin UI for non-admins |
| `422` | Invalid query parameter (e.g. unknown status value) | Use valid enum values |
