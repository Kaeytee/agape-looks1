# AGAPE LOOKS API Contract

**Version:** v1  
**Base URL:** `https://api.agapelooks.com/api/v1`  
**Authentication:** Bearer JWT Token

---

## Authentication Endpoints

### POST /auth/register
**Description:** Register a new user  
**Authentication:** None  
**Rate Limit:** 5 requests/minute

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass@123",
  "name": "John Doe",
  "phone": "+2348012345678"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "customer"
    }
  }
}
```

### POST /auth/login
**Description:** User login  
**Rate Limit:** 5 requests/minute

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass@123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "customer",
      "verified": true
    }
  }
}
```

---

## Products Endpoints

### GET /products
**Description:** List products with filters  
**Authentication:** Optional

**Query Parameters:**
- `categoryId` (uuid) - Filter by category
- `search` (string) - Search term
- `minPrice` (number) - Minimum price
- `maxPrice` (number) - Maximum price
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 20, max: 100)
- `sortBy` (string) - Sort field (created_at, price, title)
- `sortOrder` (string) - asc or desc

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "products": [
      {
        "id": "uuid",
        "sku": "AGP-001",
        "title": "Traditional Aso-Oke Fabric",
        "description": "Handwoven traditional fabric...",
        "price": 45000,
        "currency": "NGN",
        "category_name": "Fabrics",
        "thumbnail": "https://res.cloudinary.com/..."
      }
    ]
  }
}
```

### GET /products/:id
**Description:** Get product details

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "product": {
      "id": "uuid",
      "sku": "AGP-001",
      "title": "Traditional Aso-Oke Fabric",
      "description": "...",
      "price": 45000,
      "variants": [
        {
          "id": "uuid",
          "variant_name": "Blue Pattern",
          "sku": "AGP-001-BLU",
          "stock": 25
        }
      ],
      "images": [
        {
          "url": "https://res.cloudinary.com/...",
          "alt_text": "Product image"
        }
      ]
    }
  }
}
```

---

## Cart Endpoints

### GET /cart
**Description:** Get user cart  
**Authentication:** Optional (user or session)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "cart": {
      "id": "uuid",
      "items": [
        {
          "id": "uuid",
          "productId": "uuid",
          "variantId": "uuid",
          "quantity": 2,
          "price": 45000,
          "productTitle": "Traditional Aso-Oke Fabric"
        }
      ]
    }
  }
}
```

### POST /cart/items
**Description:** Add item to cart

**Request Body:**
```json
{
  "productId": "uuid",
  "variantId": "uuid",
  "quantity": 2
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Item added to cart",
  "data": { "cart": {...} }
}
```

---

## Orders Endpoints

### POST /orders
**Description:** Create new order  
**Authentication:** Required

**Request Body:**
```json
{
  "items": [
    {
      "productId": "uuid",
      "variantId": "uuid",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "+2348012345678",
    "address": "123 Main St",
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria",
    "postalCode": "100001"
  },
  "billingAddress": {...},
  "couponCode": "SAVE20"
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "order": {
      "id": "uuid",
      "order_number": "AGP202501131234ABCD",
      "status": "pending",
      "subtotal": 90000,
      "tax": 0,
      "shipping": 2500,
      "total": 92500,
      "currency": "NGN"
    }
  }
}
```

### GET /orders/:id
**Description:** Get order details

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "order": {
      "id": "uuid",
      "order_number": "AGP202501131234ABCD",
      "status": "paid",
      "total": 92500,
      "items": [...]
    }
  }
}
```

---

## Payments Endpoints

### POST /payments/initialize
**Description:** Initialize payment  
**Authentication:** Required  
**Idempotency:** Supported via order_id

**Request Body:**
```json
{
  "orderId": "uuid",
  "amount": 92500
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "paymentId": "uuid",
    "reference": "TXN_1705152000_ABC123",
    "authorizationUrl": "https://checkout.paystack.com/...",
    "accessCode": "abc123xyz",
    "amount": 92500,
    "currency": "NGN"
  }
}
```

### GET /payments/verify/:reference
**Description:** Verify payment after completion

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "paymentId": "uuid",
    "orderId": "uuid",
    "status": "success",
    "amount": 92500,
    "paidAt": "2025-01-13T10:30:00Z"
  }
}
```

### POST /payments/webhook
**Description:** Paystack webhook receiver  
**Authentication:** Signature verification  
**Idempotency:** Event ID based

**Headers:**
- `x-paystack-signature`: HMAC signature

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "webhookId": "uuid",
    "status": "success"
  }
}
```

---

## Admin Endpoints

### GET /admin/dashboard/stats
**Description:** Dashboard statistics  
**Authentication:** Required (Admin)

**Query Parameters:**
- `from` (ISO date) - Start date
- `to` (ISO date) - End date

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "orders": {
      "total_orders": 1250,
      "delivered_orders": 980,
      "total_revenue": 45000000,
      "average_order_value": 36000
    },
    "users": {
      "total_users": 3500
    },
    "products": {
      "total_products": 120
    }
  }
}
```

### GET /admin/dashboard/trends
**Description:** Sales trends

**Query Parameters:**
- `period` (string) - daily, weekly, monthly
- `limit` (number) - Number of periods

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "trends": [
      {
        "period": "2025-01-13",
        "order_count": 45,
        "revenue": 1620000
      }
    ]
  }
}
```

### PATCH /admin/inventory/:variantId/stock
**Description:** Update stock levels

**Request Body:**
```json
{
  "quantity": 50,
  "operation": "set"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Invalid email format",
  "userMessage": "Please provide a valid email address",
  "timestamp": "2025-01-13T10:30:00Z",
  "requestId": "req_abc123",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Error Codes
- `VALIDATION_ERROR` (400) - Invalid input
- `AUTHENTICATION_ERROR` (401) - Auth failed
- `AUTHORIZATION_ERROR` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Resource conflict
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `PAYMENT_ERROR` (402) - Payment processing failed
- `EXTERNAL_SERVICE_ERROR` (503) - External service unavailable
- `INTERNAL_ERROR` (500) - Server error

---

## Rate Limits

- **Auth endpoints:** 5 requests/minute
- **Public endpoints:** 100 requests/minute
- **Admin endpoints:** 200 requests/minute

**Headers:**
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time (ISO 8601)

---

## Idempotency

For idempotent operations, include header:
```
Idempotency-Key: unique-key-here
```

Supported on:
- POST /orders
- POST /payments/initialize
- POST /payments/webhook

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page` (number) - Page number (1-indexed)
- `limit` (number) - Items per page

**Response includes:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```
