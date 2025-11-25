# Orders API Integration Guide

This document provides the API endpoints, request/response formats, and integration details for the Orders service.

## Base URL
```
/api/v1/orders
```

## Endpoints

### 1. Create Order
**Endpoint:** `POST /`

**Description:** Create a new order from cart items with shipping and billing addresses.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "items": [
    {
      "productId": "uuid",
      "variantId": "uuid",
      "quantity": 2,
      "metadata": {
        "custom_field": "value"
      }
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria",
    "postalCode": "100001"
  },
  "billingAddress": {
    "fullName": "John Doe",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria",
    "postalCode": "100001"
  },
  "couponCode": "SAVE10",
  "metadata": {
    "notes": "Handle with care",
    "shippingCost": 1500.00,
    "taxRate": 0.075
  }
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Order created successfully",
  "data": {
    "order": {
      "id": "uuid",
      "order_number": "ORD-2024001001ABCD",
      "user_id": "uuid",
      "status": "pending",
      "subtotal": 25000.00,
      "tax": 1875.00,
      "shipping": 1500.00,
      "total": 28375.00,
      "currency": "NGN",
      "shipping_address": {},
      "billing_address": {},
      "metadata": {},
      "created_at": "2024-01-01T10:00:00.000Z",
      "items": [
        {
          "productId": "uuid",
          "variantId": "uuid",
          "quantity": 2,
          "priceSnapshot": 12500.00,
          "metadata": {
            "productTitle": "Sample Product",
            "custom_field": "value"
          }
        }
      ]
    }
  }
}
```

### 2. Get Order Details
**Endpoint:** `GET /:id`

**Description:** Get detailed information about a specific order.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `id`: Order UUID

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "order": {
      "id": "uuid",
      "order_number": "ORD-2024001001ABCD",
      "user_id": "uuid",
      "status": "pending",
      "subtotal": 25000.00,
      "tax": 1875.00,
      "shipping": 1500.00,
      "total": 28375.00,
      "currency": "NGN",
      "shipping_address": {
        "fullName": "John Doe",
        "phone": "+1234567890",
        "address": "123 Main St",
        "city": "Lagos",
        "state": "Lagos",
        "country": "Nigeria",
        "postalCode": "100001"
      },
      "billing_address": {},
      "metadata": {
        "couponCode": "SAVE10",
        "discount": 2837.50
      },
      "tracking_number": null,
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T10:00:00.000Z",
      "items": [
        {
          "id": "uuid",
          "productId": "uuid",
          "variantId": "uuid",
          "quantity": 2,
          "price": 12500.00,
          "metadata": {
            "productTitle": "Sample Product"
          }
        }
      ]
    }
  }
}
```

### 3. List Orders
**Endpoint:** `GET /`

**Description:** List orders with optional filtering. Customers see only their orders, admins see all.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status`: Filter by order status (`pending`, `pending_payment`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`, `payment_failed`)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "orders": [
      {
        "id": "uuid",
        "order_number": "ORD-2024001001ABCD",
        "user_id": "uuid",
        "status": "pending",
        "subtotal": 25000.00,
        "tax": 1875.00,
        "shipping": 1500.00,
        "total": 28375.00,
        "currency": "NGN",
        "created_at": "2024-01-01T10:00:00.000Z",
        "updated_at": "2024-01-01T10:00:00.000Z",
        "item_count": 2
      }
    ]
  }
}
```

### 4. Cancel Order
**Endpoint:** `POST /:id/cancel`

**Description:** Cancel an order (only for pending/pending_payment orders).

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `id`: Order UUID

**Request Body:**
```json
{
  "reason": "Changed my mind"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Order cancelled successfully",
  "data": {
    "orderId": "uuid",
    "status": "cancelled"
  }
}
```

### 5. Get Order Statistics
**Endpoint:** `GET /stats`

**Description:** Get order statistics for the authenticated user.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `from`: Start date (ISO 8601 format)
- `to`: End date (ISO 8601 format)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "statistics": {
      "total_orders": 15,
      "delivered_orders": 12,
      "cancelled_orders": 2,
      "total_revenue": 425000.00,
      "average_order_value": 28333.33
    }
  }
}
```

## Order Status Flow

```
pending → pending_payment → paid → processing → shipped → delivered
    ↓         ↓              ↓       ↓         ↓        ↓
cancelled  cancelled     payment_failed  cancelled  cancelled
```

## Order Statuses

- `pending`: Order created, awaiting payment
- `pending_payment`: Order created, payment in progress
- `paid`: Payment received, order confirmed
- `processing`: Order being prepared for shipment
- `shipped`: Order shipped with tracking number
- `delivered`: Order delivered to customer
- `cancelled`: Order cancelled by customer or admin
- `refunded`: Order fully refunded
- `payment_failed`: Payment processing failed

## Address Format

Addresses use the following structure:

```json
{
  "fullName": "string",
  "phone": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "country": "string",
  "postalCode": "string (optional)"
}
```

## Order Items

Each order item includes:

```json
{
  "id": "uuid",
  "productId": "uuid",
  "variantId": "uuid (nullable)",
  "quantity": "integer",
  "price": "decimal",
  "metadata": {
    "productTitle": "string",
    "custom_fields": "..."
  }
}
```

## Coupon Integration

Orders support coupon codes with the following types:
- `fixed`: Fixed amount discount
- `percentage`: Percentage discount

Coupon validation includes:
- Active status check
- Expiry date validation
- Usage limit validation
- Minimum order amount requirements

## Inventory Management

- Orders reserve inventory automatically upon creation
- Reservations expire after configurable TTL (default: 30 minutes)
- Cancelled orders release reservations
- Stock validation occurs before order creation

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
- `201 Created`: Order created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Order not found
- `422 Unprocessable Entity`: Validation error (insufficient stock, invalid status)
- `500 Internal Server Error`: Server error

## Rate Limiting

Order endpoints have rate limiting applied:
- Create order: 10 requests per minute per user
- List orders: 30 requests per minute per user

## Data Types

- **UUID**: Universally unique identifier (string)
- **Amount**: Decimal number with 2 decimal places
- **Quantity**: Positive integer
- **Timestamp**: ISO 8601 format (string)
- **Currency**: 3-letter currency code (string)
- **Order Number**: Unique string identifier (e.g., "ORD-2024001001ABCD")
