# Payments API Integration Guide

This document provides the API endpoints, request/response formats, and integration details for the Payments service using Paystack as the payment gateway.

## Base URL
```
/api/v1/payments
```

## Endpoints

### 1. Initialize Payment
**Endpoint:** `POST /initialize`

**Description:** Initialize a payment transaction for an order. Creates a payment record and returns Paystack authorization URL.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "orderId": "uuid",
  "amount": 25000.50,
  "metadata": {
    "custom_field": "value"
  }
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Payment initialized successfully",
  "data": {
    "paymentId": "uuid",
    "reference": "paystack_reference_string",
    "authorizationUrl": "https://checkout.paystack.com/...",
    "accessCode": "access_code_string",
    "amount": 25000.50,
    "currency": "NGN"
  }
}
```

### 2. Verify Payment
**Endpoint:** `GET /verify/:reference`

**Description:** Verify a completed payment transaction and update order status.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `reference`: Paystack payment reference string

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Payment verified successfully",
  "data": {
    "paymentId": "uuid",
    "orderId": "uuid",
    "status": "success",
    "amount": 25000.50,
    "paidAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 3. Get Payment Details
**Endpoint:** `GET /:id`

**Description:** Get detailed information about a specific payment.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `id`: Payment UUID

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "payment": {
      "id": "uuid",
      "order_id": "uuid",
      "gateway": "paystack",
      "gateway_ref": "paystack_reference",
      "amount": 25000.50,
      "currency": "NGN",
      "status": "paid",
      "settled_at": "2024-01-01T12:00:00.000Z",
      "created_at": "2024-01-01T11:45:00.000Z",
      "raw_response": {},
      "order_number": "ORD-2024001"
    }
  }
}
```

### 4. List Payments
**Endpoint:** `GET /`

**Description:** List payments with optional filtering. Customers see only their payments, admins see all.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status`: Filter by payment status (`initialized`, `paid`, `failed`, `refunded`)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "payments": [
      {
        "id": "uuid",
        "order_id": "uuid",
        "gateway": "paystack",
        "gateway_ref": "paystack_reference",
        "amount": 25000.50,
        "currency": "NGN",
        "status": "paid",
        "settled_at": "2024-01-01T12:00:00.000Z",
        "created_at": "2024-01-01T11:45:00.000Z",
        "order_number": "ORD-2024001",
        "total": 25000.50
      }
    ]
  }
}
```

### 5. Process Webhook
**Endpoint:** `POST /webhook`

**Description:** Paystack webhook endpoint for payment status updates. No authentication required.

**Request Headers:**
```
Content-Type: application/json
x-paystack-signature: signature_string
```

**Request Body:** (Paystack webhook payload)
```json
{
  "event": "charge.success",
  "data": {
    "id": 123456789,
    "reference": "paystack_reference",
    "amount": 2500000,
    "currency": "NGN",
    "status": "success",
    "paid_at": "2024-01-01T12:00:00.000Z"
  }
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "webhookId": "uuid",
    "result": {
      "paymentId": "uuid",
      "orderId": "uuid"
    }
  }
}
```

### 6. Refund Payment (Admin Only)
**Endpoint:** `POST /:id/refund`

**Description:** Initiate a refund for a payment (Admin only).

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**URL Parameters:**
- `id`: Payment UUID

**Request Body:**
```json
{
  "amount": 25000.50,
  "reason": "Customer requested refund"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Refund initiated successfully",
  "data": {
    "refundId": "uuid",
    "paymentId": "uuid",
    "orderId": "uuid",
    "amount": 25000.50,
    "status": "requested"
  }
}
```

## Payment Flow

### Standard Payment Flow

1. **Initialize Payment**
   - Frontend calls `POST /initialize` with order details
   - Backend creates payment record and returns Paystack authorization URL
   - Frontend redirects user to Paystack checkout

2. **Payment Completion**
   - User completes payment on Paystack
   - Paystack redirects to callback URL or sends webhook

3. **Payment Verification**
   - Frontend calls `GET /verify/:reference` to confirm payment
   - Backend verifies with Paystack and updates order status

### Webhook-Based Verification (Recommended)

1. **Initialize Payment** (same as above)
2. **Webhook Processing**
   - Paystack sends webhook to `POST /webhook`
   - Backend automatically updates payment and order status
   - No manual verification needed

## Payment Statuses

- `initialized`: Payment record created, waiting for user action
- `paid`: Payment successfully completed
- `failed`: Payment failed or was declined
- `refunded`: Payment fully refunded

## Order Status Updates

Payments automatically update order status:
- `paid`: When payment succeeds
- `payment_failed`: When payment fails
- `refunded`: When full refund is processed
- `partially_refunded`: When partial refund is processed

## Currency and Amounts

- **Currency**: NGN (Nigerian Naira)
- **Amount Format**: Decimal with 2 decimal places
- **Paystack Amounts**: Amounts are converted to kobo (multiply by 100) for Paystack API

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
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Payment not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

## Rate Limiting

Payment endpoints have rate limiting applied:
- Initialize payment: 10 requests per minute per user
- Verify payment: 30 requests per minute per user

## Webhook Security

- Webhooks are verified using Paystack signature validation
- Duplicate webhook events are automatically detected and ignored
- All webhook events are logged and stored for audit purposes

## Idempotency

- Payment verification is idempotent (can be called multiple times safely)
- Webhook processing handles duplicate events automatically

## Data Types

- **UUID**: Universally unique identifier (string)
- **Amount**: Decimal number with 2 decimal places
- **Timestamp**: ISO 8601 format (string)
- **Currency**: 3-letter currency code (string)
