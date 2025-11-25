# Authentication API Integration Guide

This document provides the API endpoints, request/response formats, and integration details for the Authentication service.

## Base URL
```
/api/v1/auth
```

## Endpoints

### 1. Register User
**Endpoint:** `POST /register`

**Description:** Register a new user account with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "phone": "+1234567890"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "customer",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "jwt.access.token"
  }
}
```

**Cookies Set:**
- `refresh_token`: HTTPOnly cookie containing refresh token

### 2. Verify Email
**Endpoint:** `POST /verify-email`

**Description:** Verify user email using verification token sent via email.

**Request Body:**
```json
{
  "token": "verification_token_string"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Email verified successfully"
}
```

### 3. Login
**Endpoint:** `POST /login`

**Description:** Authenticate user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "accessToken": "jwt.access.token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "customer",
      "verified": true
    }
  }
}
```

**Cookies Set:**
- `refresh_token`: HTTPOnly cookie containing refresh token

### 4. Refresh Access Token
**Endpoint:** `POST /refresh`

**Description:** Refresh expired access token using refresh token from cookie or body.

**Request Body (optional):**
```json
{
  "refreshToken": "refresh_token_string"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "accessToken": "new_jwt.access.token"
  }
}
```

### 5. Logout
**Endpoint:** `POST /logout` (Requires Authentication)

**Description:** Logout user by revoking their refresh token session.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

**Cookies Cleared:**
- `refresh_token`: Cookie is cleared

### 6. Get User Sessions
**Endpoint:** `GET /sessions` (Requires Authentication)

**Description:** Get all active sessions for the authenticated user.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "sessions": [
      {
        "id": "uuid",
        "device_info": {
          "ip": "192.168.1.1",
          "userAgent": "Mozilla/5.0..."
        },
        "ip_address": "192.168.1.1",
        "created_at": "2024-01-01T00:00:00.000Z",
        "expires_at": "2024-01-02T00:00:00.000Z"
      }
    ]
  }
}
```

### 7. Revoke Session
**Endpoint:** `DELETE /sessions/:sessionId` (Requires Authentication)

**Description:** Revoke a specific user session.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `sessionId`: UUID of the session to revoke

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Session revoked successfully"
}
```

### 8. Request Password Reset
**Endpoint:** `POST /password-reset-request`

**Description:** Request a password reset token to be sent to user's email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "If the email exists, a password reset link has been sent"
}
```

### 9. Reset Password
**Endpoint:** `POST /password-reset`

**Description:** Reset user password using reset token.

**Request Body:**
```json
{
  "token": "reset_token_string",
  "password": "NewSecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Password reset successfully"
}
```

### 10. Change Password
**Endpoint:** `POST /change-password` (Requires Authentication)

**Description:** Change the authenticated user's password.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "currentPassword": "CurrentPass123!",
  "newPassword": "NewSecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Password changed successfully"
}
```

### 11. Enable 2FA
**Endpoint:** `POST /2fa/enable` (Requires Authentication)

**Description:** Enable two-factor authentication for the user account.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Scan the QR code with your authenticator app",
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
}
```

### 12. Verify 2FA
**Endpoint:** `POST /2fa/verify` (Requires Authentication)

**Description:** Verify and activate 2FA using token from authenticator app.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "token": "123456"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "2FA enabled successfully"
}
```

### 13. Disable 2FA
**Endpoint:** `POST /2fa/disable` (Requires Authentication)

**Description:** Disable two-factor authentication for the user account.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "2FA disabled successfully"
}
```

## Error Responses

All endpoints may return the following error format:

```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {} // Optional additional error details
}
```

## Common HTTP Status Codes

- `200 OK`: Successful operation
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or invalid credentials
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., email already exists)
- `422 Unprocessable Entity`: Validation error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Authentication

Protected endpoints require a JWT access token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

Access tokens expire after 15 minutes by default. Use the `/refresh` endpoint to get new access tokens.

## Rate Limiting

Authentication endpoints have rate limiting applied:
- Registration and login: 5 requests per minute per IP
- Password reset request: 3 requests per hour per IP

## Validation Rules

- **Email**: Valid email format required
- **Password**: Minimum 8 characters, must contain uppercase, lowercase, number, and special character
- **Name**: 2-255 characters
- **Phone**: Optional, valid phone number format
- **2FA Token**: 6-digit numeric code

## Data Types

- **UUID**: Universally unique identifier (string)
- **Timestamp**: ISO 8601 format (string)
- **JWT Token**: JSON Web Token (string)
