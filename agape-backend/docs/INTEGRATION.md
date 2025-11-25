# API Integration Guide

This document contains machine-friendly request and response examples for every public API endpoint in the Agape Looks backend. Use these snippets to implement frontend integration quickly.

General notes
- Base URL (development): http://localhost:3000/api/v1
- Authentication: Bearer JWT (RS256). Include `Authorization: Bearer <access_token>` header for protected endpoints.
- Content-Type: application/json for JSON payloads. File uploads use multipart/form-data.
- Error format (JSON):

```
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Invalid email format",
  "userMessage": "Please provide a valid email address",
  "timestamp": "2025-10-25T12:00:00Z",
  "requestId": "req_abc123",
  "details": []
}
```

Use-case conventions in examples
- All request bodies are JSON unless stated.
- UUID placeholders are written as `<uuid>`.
- Timestamps are ISO 8601.

---

## Authentication

### Register
- Method: POST
- Path: /auth/register
- Public

Request

```
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "S3cureP@ssw0rd",
  "name": "Jane Doe",
  "phone": "+2348012345678"
}
```

Success response (201)

```
{
  "status": "success",
  "data": {
    "id": "<uuid>",
    "email": "jane@example.com",
    "name": "Jane Doe",
    "verified": false,
    "createdAt": "2025-10-25T12:00:00Z"
  }
}
```

Errors: 400 validation error, 409 email exists.

---

### Verify Email
- Method: POST
- Path: /auth/verify-email

Request

```
POST /api/v1/auth/verify-email
Content-Type: application/json

{ "token": "<verification_token>" }
```

Success (200)

```
{ "status":"success", "message":"Email verified" }
```

---

### Login
- Method: POST
- Path: /auth/login

Request

```
POST /api/v1/auth/login
Content-Type: application/json

{ "email": "jane@example.com", "password": "S3cureP@ssw0rd" }
```

Success (200)

```
{
  "status": "success",
  "data": {
    "accessToken": "<jwt_access_token>",
    "refreshToken": "<refresh_token>",
    "expiresIn": 900,
    "user": { "id": "<uuid>", "email": "jane@example.com", "name": "Jane Doe" }
  }
}
```

Notes: Save refresh token securely (httpOnly cookie recommended). Use access token for Authorization.

---

### Refresh Token
- Method: POST
- Path: /auth/refresh

Request (send refresh token in body or cookie depending on app policy)

```
POST /api/v1/auth/refresh
Content-Type: application/json

{ "refreshToken": "<refresh_token>" }
```

Success (200): returns new accessToken and refreshToken.

---

### Logout
- Method: POST
- Path: /auth/logout
- Protected

Request

```
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

Success (200)

```
{ "status":"success", "message":"Logged out" }
```

---

## Products

### List products
- Method: GET
- Path: /products
- Query params: page, limit, search, categoryId, minPrice, maxPrice, isFeatured, sortBy, sortOrder

Request example

```
GET /api/v1/products?page=1&limit=20&search=shirt
```

Success (200)

```
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": "<uuid>",
        "sku": "SHIRT-001",
        "title": "Classic Tee",
        "price": 2500,
        "currency": "NGN",
        "isActive": true,
        "images": [{"url":"https://...","publicId":"abc","altText":"Classic Tee"}],
        "metadata": {}
      }
    ],
    "meta": { "page": 1, "limit": 20, "total": 123 }
  }
}
```

### Get product
- Method: GET
- Path: /products/:id

Success (200): product object (same shape as list items).

### Search
- Method: GET
- Path: /products/search?q=

Response: same shape as list.

### Create product (admin)
- Method: POST
- Path: /products
- Protected (admin)

Request example

```
POST /api/v1/products
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "sku":"SHIRT-002",
  "title":"Premium Tee",
  "description":"Soft cotton",
  "price":3500,
  "currency":"NGN",
  "images":[{"url":"https://...","publicId":"p1"}]
}
```

Success (201): created product object.

Errors: 401 if not admin, 400 validation errors.

---

## Cart

### Get cart
- Method: GET
- Path: /cart
- Auth optional (guest or user)

Request

```
GET /api/v1/cart
Cookie: sessionId=<guest_session_id>  (optional)
Authorization: Bearer <access_token>  (optional)
```

Success (200)

```
{
  "status":"success",
  "data": {
    "items": [
      { "itemId":"<uuid>", "productId":"<uuid>", "variantId":null, "quantity":2, "price":2500 }
    ],
    "totals": { "subtotal":5000, "shipping":500, "tax":0, "grandTotal":5500 }
  }
}
```

### Add item
- Method: POST
- Path: /cart/items

Request

```
POST /api/v1/cart/items
Content-Type: application/json

{ "productId":"<uuid>", "variantId":null, "quantity":2 }
```

Success (201)

```
{ "status":"success", "data": { "itemId":"<uuid>", "quantity":2 } }
```

### Update item quantity
- PATCH /cart/items/:itemId

Request

```
PATCH /api/v1/cart/items/<itemId>
Content-Type: application/json

{ "quantity": 3 }
```

Success (200) returns updated item.

### Remove item
- DELETE /cart/items/:itemId

Success (204) or (200 with data).

### Clear cart
- DELETE /cart

Success (200)

### Merge cart (on login)
- POST /cart/merge
- Protected (user)

Request

```
{ "sessionId": "<guest_session_id>" }
```

Success (200) returns merged cart.

---

## Orders

### Create order
- POST /orders
- Protected

Request body (matches createOrderSchema)

```
POST /api/v1/orders
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "items": [ { "productId":"<uuid>", "quantity":2 } ],
  "shippingAddress": {
    "fullName":"Jane Doe",
    "phone":"+2348012345678",
    "address":"123 Street",
    "city":"Lagos",
    "state":"Lagos",
    "country":"NG",
    "postalCode":"100001"
  },
  "metadata": {}
}
```

Success (201)

```
{
  "status":"success",
  "data": {
    "orderId":"<uuid>",
    "status":"pending",
    "amount":5500,
    "currency":"NGN",
    "createdAt":"2025-10-25T12:00:00Z"
  }
}
```

### Get order
- GET /orders/:id (protected) returns order detail.

### List orders
- GET /orders?page=1&limit=20

### Cancel order
- POST /orders/:id/cancel
- Body: { reason?: string }

Success (200) returns updated order status.

---

## Payments

### Initialize payment
- POST /payments/initialize
- Protected

Request

```
POST /api/v1/payments/initialize
Authorization: Bearer <access_token>
Content-Type: application/json

{ "orderId":"<uuid>", "amount":5500 }
```

Success (200)

```
{
  "status":"success",
  "data": { "reference":"<pay_ref>", "authorizationUrl":"https://paystack.co/checkout/<ref>" }
}
```

### Verify payment
- GET /payments/verify/:reference

Success (200) returns payment status: initialized/paid/failed.

### Webhook
- POST /payments/webhook
- Public endpoint used by Paystack. Verify signature in controller.

Example webhook payload: vendor-specific — frontend doesn't call this.

### Refund (admin)
- POST /payments/:id/refund
- Protected & admin

Request

```
{ "amount": 5000, "reason": "Customer returned item" }
```

Success: 200 with refund object.

---

## Wishlist

All wishlist endpoints require user authentication.

### Get wishlist
- GET /wishlist

Success (200): list of favorite products.

### Add to wishlist
- POST /wishlist

Request

```
{ "productId": "<uuid>" }
```

Success (201)

### Remove from wishlist
- DELETE /wishlist/:id

Success (204)

### Check product in wishlist
- GET /wishlist/check/:productId

Success (200): { "inWishlist": true }

---

## Media

### Get upload URL (admin)
- GET /media/upload-url
- Protected & admin

Success (200): { "uploadUrl": "https://...", "fields": {} }

### Upload (admin)
- POST /media/upload (multipart/form-data)

Form fields: file

Success (201): returns media metadata { publicId, url, secureUrl, folder }

### Delete media (admin)
- DELETE /media/:publicId

Success (200)

---

## GDPR

### Export user data
- GET /gdpr/export
- Protected

Success (200): returns URL to download user data or JSON payload with data.

### Delete account
- DELETE /gdpr/account
- Body: { password: string }

Success (200): { "status":"success", "message":"Account deleted" }

### Record consent
- POST /gdpr/consent
- Body: { consentType: "marketing", granted: true }

Success (200)

---

## Admin endpoints (summary)

All admin endpoints require Authorization and admin role.

- GET /admin/dashboard/stats — returns summary metrics
- GET /admin/dashboard/trends?period=daily — returns time series
- GET /admin/inventory/low-stock — returns low stock alerts
- PATCH /admin/inventory/:variantId/stock — body: { quantity, operation }
- GET /admin/orders — list all orders
- PATCH /admin/orders/:id/status — update order status (body: { status, notes })
- PATCH /admin/orders/:id/tracking — update tracking number
- GET /admin/users — list users
- PATCH /admin/users/:id/role — change user role

Each responds with standard { status, data, meta } shapes. See product/order examples for shapes.

---

## Frontend integration examples

Axios example: login and store tokens

```javascript
import axios from 'axios';

async function login(email, password){
  const res = await axios.post('/api/v1/auth/login', { email, password });
  const { accessToken, refreshToken } = res.data.data;
  // store tokens securely
  localStorage.setItem('accessToken', accessToken);
}
```

Fetch example: authorized request

```javascript
const token = localStorage.getItem('accessToken');
const res = await fetch('/api/v1/orders', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

If you'd like, I can:
- expand each endpoint with full response schemas (OpenAPI-style),
- generate an OpenAPI spec from the route files, or
- create per-service `integration.md` files (one per service folder) instead of this single combined document.

For now, I added `docs/INTEGRATION.md` with request/response examples for all main endpoints.
