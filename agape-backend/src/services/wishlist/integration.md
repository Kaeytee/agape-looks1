# Wishlist API Integration Guide

This document provides the API endpoints, request/response formats, and integration details for the Wishlist service.

## Base URL
```
/api/v1/wishlist
```

## Overview

The wishlist service allows authenticated users to save products for later purchase. Wishlists are user-specific and can contain both base products and product variants.

## Endpoints

### 1. Get Wishlist
**Endpoint:** `GET /`

**Description:** Get all items in the authenticated user's wishlist.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": "uuid",
        "productId": "uuid",
        "variantId": "uuid",
        "product": {
          "title": "Sample Product",
          "sku": "PROD-001",
          "price": 25000.00,
          "currency": "NGN",
          "description": "Product description"
        },
        "variant": {
          "name": "Red, Large",
          "priceDelta": 5000.00,
          "sku": "PROD-001-RED-L",
          "stock": 10
        },
        "addedAt": "2024-01-01T10:00:00.000Z"
      }
    ],
    "count": 1
  }
}
```

### 2. Add to Wishlist
**Endpoint:** `POST /`

**Description:** Add a product or variant to the user's wishlist.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "productId": "uuid",
  "variantId": "uuid"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Item added to wishlist",
  "data": {
    "item": {
      "id": "uuid",
      "user_id": "uuid",
      "product_id": "uuid",
      "variant_id": "uuid",
      "created_at": "2024-01-01T10:00:00.000Z"
    }
  }
}
```

### 3. Remove from Wishlist
**Endpoint:** `DELETE /:id`

**Description:** Remove a specific item from the user's wishlist.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `id`: Wishlist item UUID

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Item removed from wishlist"
}
```

### 4. Clear Wishlist
**Endpoint:** `DELETE /`

**Description:** Remove all items from the user's wishlist.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Wishlist cleared",
  "data": {
    "itemsRemoved": 5
  }
}
```

### 5. Check Wishlist Status
**Endpoint:** `GET /check/:productId`

**Description:** Check if a specific product is in the user's wishlist.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `productId`: Product UUID

**Query Parameters:**
- `variantId`: Variant UUID (optional)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "inWishlist": true
  }
}
```

## Wishlist Features

### Product Variants

- Users can add specific product variants to their wishlist
- Variants are validated for existence before adding
- Variant information is included in wishlist responses

### Duplicate Prevention

- Same product/variant combination cannot be added twice
- Returns conflict error if attempting to add duplicate

### Data Enrichment

- Wishlist responses include full product details
- Variant information is included when applicable
- No additional API calls needed for product data

## Data Types

- **UUID**: Universally unique identifier (string)
- **Price**: Decimal number with 2 decimal places
- **Currency**: 3-letter currency code (string)
- **Stock**: Integer quantity available
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
- `201 Created`: Item added successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Product or wishlist item not found
- `409 Conflict`: Item already in wishlist
- `500 Internal Server Error`: Server error

## Rate Limiting

Wishlist endpoints have rate limiting applied:
- All endpoints: 60 requests per minute per user

## Validation Rules

- **Product ID**: Must exist and be valid UUID
- **Variant ID**: Optional, must exist and belong to the product if provided
- **Wishlist Item ID**: Must exist and belong to the authenticated user

## Usage Examples

### Add Product to Wishlist

```javascript
const response = await fetch('/api/v1/wishlist', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    productId: 'product-uuid',
    variantId: 'variant-uuid' // optional
  })
});

const result = await response.json();
```

### Check Wishlist Status

```javascript
const response = await fetch('/api/v1/wishlist/check/product-uuid?variantId=variant-uuid', {
  headers: {
    'Authorization': `Bearer ${userToken}`
  }
});

const { data } = await response.json();
if (data.inWishlist) {
  // Show "Remove from wishlist" button
} else {
  // Show "Add to wishlist" button
}
```

### Display Wishlist

```javascript
const response = await fetch('/api/v1/wishlist', {
  headers: {
    'Authorization': `Bearer ${userToken}`
  }
});

const { data } = await response.json();
data.items.forEach(item => {
  console.log(`${item.product.title} - ${item.variant?.name || 'Default'}`);
});
```
