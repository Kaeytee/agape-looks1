# Admin API Integration Guide

This document provides the API endpoints, request/response formats, and integration details for the Admin service.

## Base URL
```
/api/v1/admin
```

## Overview

The admin service provides administrative functionality including dashboard statistics, inventory management, order management, user management, and audit logging. All endpoints require admin authentication.

## Endpoints

### Dashboard Endpoints

#### 1. Get Dashboard Statistics
**Endpoint:** `GET /dashboard/stats`

**Description:** Get comprehensive dashboard statistics including orders, users, and products.

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**
- `from`: Start date (ISO 8601 format)
- `to`: End date (ISO 8601 format)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "orders": {
      "total_orders": 1250,
      "delivered_orders": 1180,
      "total_revenue": 2500000.00,
      "average_order_value": 2000.00
    },
    "users": {
      "total_users": 5000
    },
    "products": {
      "total_products": 150
    }
  }
}
```

#### 2. Get Sales Trends
**Endpoint:** `GET /dashboard/trends`

**Description:** Get sales trends over time periods.

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**
- `period`: Time period (`daily`, `weekly`, `monthly`) (default: `daily`)
- `limit`: Number of periods to return (default: 30, max: 365)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "trends": [
      {
        "period": "2024-01-01",
        "order_count": 45,
        "revenue": 90000.00
      }
    ]
  }
}
```

#### 3. Get Top Products
**Endpoint:** `GET /dashboard/top-products`

**Description:** Get best-selling products by quantity sold.

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**
- `limit`: Number of products to return (default: 10)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "products": [
      {
        "id": "uuid",
        "title": "Best Selling Product",
        "price": 25000.00,
        "order_count": 150,
        "total_sold": 200,
        "revenue": 5000000.00
      }
    ]
  }
}
```

### Inventory Management Endpoints

#### 4. Get Low Stock Alerts
**Endpoint:** `GET /inventory/low-stock`

**Description:** Get product variants with low stock levels.

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "variants": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "variant_name": "Red, Large",
        "sku": "PROD-001-RED-L",
        "stock": 5,
        "threshold": 10
      }
    ]
  }
}
```

#### 5. Get Inventory Statistics
**Endpoint:** `GET /inventory/stats`

**Description:** Get overall inventory statistics.

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "total_variants": 500,
    "in_stock": 450,
    "low_stock": 25,
    "out_of_stock": 25,
    "total_value": 15000000.00
  }
}
```

#### 6. Update Stock
**Endpoint:** `PATCH /inventory/:variantId/stock`

**Description:** Update stock quantity for a product variant.

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**URL Parameters:**
- `variantId`: Product variant UUID

**Request Body:**
```json
{
  "quantity": 50,
  "operation": "set"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Stock updated successfully",
  "data": {
    "variant_id": "uuid",
    "old_stock": 10,
    "new_stock": 50,
    "operation": "set"
  }
}
```

### Order Management Endpoints

#### 7. List All Orders
**Endpoint:** `GET /orders`

**Description:** Get all orders (admin view).

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**
- `status`: Filter by order status
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "order_number": "ORD-2024001001ABCD",
      "user_id": "uuid",
      "status": "processing",
      "total": 25000.00,
      "created_at": "2024-01-01T10:00:00.000Z",
      "item_count": 2
    }
  ]
}
```

#### 8. Update Order Status
**Endpoint:** `PATCH /orders/:id/status`

**Description:** Update the status of an order.

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**URL Parameters:**
- `id`: Order UUID

**Request Body:**
```json
{
  "status": "shipped",
  "notes": "Order shipped via DHL"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Order status updated successfully",
  "data": {
    "orderId": "uuid",
    "oldStatus": "processing",
    "newStatus": "shipped"
  }
}
```

#### 9. Update Tracking Number
**Endpoint:** `PATCH /orders/:id/tracking`

**Description:** Add or update tracking number for an order.

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**URL Parameters:**
- `id`: Order UUID

**Request Body:**
```json
{
  "trackingNumber": "TRK123456789"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Tracking number updated successfully",
  "data": {
    "order": {
      "id": "uuid",
      "tracking_number": "TRK123456789"
    }
  }
}
```

### User Management Endpoints

#### 10. Get User Statistics
**Endpoint:** `GET /users/stats`

**Description:** Get user statistics.

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "total_users": 5000,
    "active_users": 4500,
    "admin_users": 5,
    "new_users_today": 25
  }
}
```

#### 11. Get User by ID
**Endpoint:** `GET /users/:id`

**Description:** Get detailed information about a specific user.

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**URL Parameters:**
- `id`: User UUID

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "customer",
      "verified": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "last_login": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

#### 12. List Users
**Endpoint:** `GET /users`

**Description:** List users with filtering and pagination.

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**
- `role`: Filter by user role (`customer`, `admin`)
- `search`: Search in user email or name
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "name": "John Doe",
        "role": "customer",
        "verified": true,
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 5000,
    "page": 1,
    "limit": 20
  }
}
```

#### 13. Update User Role
**Endpoint:** `PATCH /users/:id/role`

**Description:** Update a user's role.

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**URL Parameters:**
- `id`: User UUID

**Request Body:**
```json
{
  "role": "admin"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "User role updated successfully"
}
```

### Audit and Reporting Endpoints

#### 14. Get Audit Logs
**Endpoint:** `GET /audit-logs`

**Description:** Get audit logs for system activities.

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**
- `entity`: Filter by entity type
- `entityId`: Filter by specific entity ID
- `actorId`: Filter by actor user ID
- `limit`: Number of logs to return (default: 50)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "logs": [
      {
        "id": "uuid",
        "actor_id": "uuid",
        "actor_email": "admin@example.com",
        "action": "order_status_updated",
        "entity": "order",
        "entity_id": "uuid",
        "changes": {
          "from": "processing",
          "to": "shipped"
        },
        "created_at": "2024-01-01T10:00:00.000Z"
      }
    ]
  }
}
```

#### 15. Export Sales Data
**Endpoint:** `GET /reports/sales/export`

**Description:** Export sales data as CSV file.

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**
- `from`: Start date (ISO 8601 format)
- `to`: End date (ISO 8601 format)

**Response (200 OK):**
```
Content-Type: text/csv
Content-Disposition: attachment; filename=sales_export.csv

Order Number,Date,Status,Total,Customer Email,Customer Name
ORD-2024001001ABCD,2024-01-01T10:00:00.000Z,delivered,25000.00,user@example.com,John Doe
```

## Stock Operations

The `operation` parameter in stock updates supports:
- `set`: Set stock to exact quantity
- `increment`: Add to current stock
- `decrement`: Subtract from current stock

## Order Status Flow

```
pending → pending_payment → paid → processing → shipped → delivered
    ↓         ↓              ↓       ↓         ↓        ↓
cancelled  cancelled     payment_failed  cancelled  cancelled
```

## Data Types

- **UUID**: Universally unique identifier (string)
- **Amount**: Decimal number with 2 decimal places
- **Count**: Integer quantity
- **Date**: ISO 8601 format (string)
- **Role**: User role (`customer`, `admin`)
- **Status**: Various status enums

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
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Admin access required
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

## Rate Limiting

Admin endpoints have rate limiting applied:
- Dashboard endpoints: 30 requests per minute per admin
- Management endpoints: 60 requests per minute per admin
- Export endpoints: 10 requests per minute per admin

## Security

- All admin endpoints require authentication and admin role
- All actions are logged in audit logs
- Sensitive operations require explicit confirmation

## Usage Examples

### Update Order Status

```javascript
const response = await fetch('/api/v1/admin/orders/order-uuid/status', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'shipped',
    notes: 'Shipped via DHL Express'
  })
});

const result = await response.json();
```

### Export Sales Data

```javascript
const response = await fetch('/api/v1/admin/reports/sales/export?from=2024-01-01&to=2024-01-31', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

// Handle CSV download
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'sales_export.csv';
a.click();
```
