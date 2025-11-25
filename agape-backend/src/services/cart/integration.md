# Cart API Integration Guide

This document provides the API endpoints, request/response formats, and integration details for the Cart service.

## Base URL
```
/api/v1/cart
```

## Overview

The cart service supports both authenticated users and guest sessions. Cart data is stored in Redis for fast access and persisted to PostgreSQL for authenticated users.

## Endpoints

### 1. Get Cart
**Endpoint:** `GET /`

**Description:** Get the current user's cart or guest cart.

**Request Headers (optional):**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "cart": {
      "id": "uuid",
      "user_id": "uuid",
      "items": [
        {
          "id": "uuid",
          "productId": "uuid",
          "variantId": "uuid",
          "quantity": 2,
          "price": 25000.00,
          "productTitle": "Sample Product",
          "addedAt": "2024-01-01T10:00:00.000Z"
        }
      ],
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T10:00:00.000Z"
    }
  }
}
```

### 2. Get Cart Totals
**Endpoint:** `GET /totals`

**Description:** Get cart summary with totals and item count.

**Request Headers (optional):**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "subtotal": 50000.00,
    "itemCount": 3,
    "items": [
      {
        "id": "uuid",
        "productId": "uuid",
        "variantId": "uuid",
        "quantity": 2,
        "price": 25000.00,
        "productTitle": "Sample Product",
        "addedAt": "2024-01-01T10:00:00.000Z"
      }
    ]
  }
}
```

### 3. Add Item to Cart
**Endpoint:** `POST /items`

**Description:** Add a product or variant to the cart.

**Request Headers (optional):**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "productId": "uuid",
  "variantId": "uuid",
  "quantity": 2
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Item added to cart",
  "data": {
    "cart": {
      "id": "uuid",
      "user_id": "uuid",
      "items": [
        {
          "id": "uuid",
          "productId": "uuid",
          "variantId": "uuid",
          "quantity": 2,
          "price": 25000.00,
          "productTitle": "Sample Product",
          "addedAt": "2024-01-01T10:00:00.000Z"
        }
      ],
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T10:00:00.000Z"
    }
  }
}
```

### 4. Update Cart Item
**Endpoint:** `PATCH /items/:itemId`

**Description:** Update the quantity of a cart item.

**Request Headers (optional):**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `itemId`: Cart item UUID

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Cart updated",
  "data": {
    "cart": {
      "id": "uuid",
      "user_id": "uuid",
      "items": [
        {
          "id": "uuid",
          "productId": "uuid",
          "variantId": "uuid",
          "quantity": 3,
          "price": 25000.00,
          "productTitle": "Sample Product",
          "addedAt": "2024-01-01T10:00:00.000Z"
        }
      ],
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T10:00:00.000Z"
    }
  }
}
```

### 5. Remove Item from Cart
**Endpoint:** `DELETE /items/:itemId`

**Description:** Remove an item from the cart.

**Request Headers (optional):**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `itemId`: Cart item UUID

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Item removed",
  "data": {
    "cart": {
      "id": "uuid",
      "user_id": "uuid",
      "items": [],
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T10:00:00.000Z"
    }
  }
}
```

### 6. Clear Cart
**Endpoint:** `DELETE /`

**Description:** Remove all items from the cart.

**Request Headers (optional):**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Cart cleared",
  "data": {
    "cart": {
      "id": "uuid",
      "user_id": "uuid",
      "items": [],
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T10:00:00.000Z"
    }
  }
}
```

### 7. Merge Cart
**Endpoint:** `POST /merge`

**Description:** Merge guest cart with user cart after login.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "sessionId": "express_session_id_string"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Cart merged successfully",
  "data": {
    "cart": {
      "id": "uuid",
      "user_id": "uuid",
      "items": [
        {
          "id": "uuid",
          "productId": "uuid",
          "variantId": "uuid",
          "quantity": 2,
          "price": 25000.00,
          "productTitle": "Sample Product",
          "addedAt": "2024-01-01T10:00:00.000Z"
        }
      ],
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T10:00:00.000Z"
    }
  }
}
```

## Cart Behavior

### Guest vs Authenticated Users

- **Guest carts**: Stored in Redis using session ID, expire after configured hours
- **User carts**: Stored in both Redis and PostgreSQL, persist across sessions

### Stock Validation

- Items are validated for availability when added to cart
- Stock checks are performed in real-time
- Out-of-stock items cannot be added

### Quantity Limits

- Maximum quantity per item: Configurable (default: 99)
- Maximum total items per cart: Configurable

### Cart Merging

When a user logs in:
1. Guest cart items are merged with user cart
2. Quantities are combined for identical items
3. Guest cart is cleared after successful merge

### Price Snapshots

- Product prices are captured when items are added to cart
- Price changes after adding don't affect existing cart items
- Ensures consistent pricing throughout checkout

## Data Types

- **UUID**: Universally unique identifier (string)
- **Quantity**: Positive integer (1-99)
- **Price**: Decimal number with 2 decimal places
- **Timestamp**: ISO 8601 format (string)

## Error Responses

All endpoints may return the following error format:

```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Common HTTP Status Codes

- `200 OK`: Successful operation
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Cart item not found
- `422 Unprocessable Entity`: Validation error (insufficient stock, quantity limits)
- `500 Internal Server Error`: Server error

## Rate Limiting

Cart endpoints have rate limiting applied:
- All endpoints: 60 requests per minute per IP/session

## Caching

- Cart data cached in Redis with configurable TTL (default: 24 hours)
- Authenticated user carts persisted to PostgreSQL
- Cache invalidation on cart updates

## Validation Rules

- **Product ID**: Must exist and be active
- **Variant ID**: Optional, must exist if provided
- **Quantity**: 1 to maximum configured limit
- **Stock**: Must be available for the requested quantity
