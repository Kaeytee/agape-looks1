# Products API Integration Guide

This document provides the API endpoints, request/response formats, and integration details for the Products service.

## Base URL
```
/api/v1/products
```

## Endpoints

### 1. List Products
**Endpoint:** `GET /`

**Description:** Get a paginated list of active products with optional filtering.

**Query Parameters:**
- `categoryId`: Filter by category UUID
- `search`: Search in product title and description
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `isFeatured`: Filter featured products (boolean)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sortBy`: Sort field (`created_at`, `price`, `title`) (default: `created_at`)
- `sortOrder`: Sort order (`asc`, `desc`) (default: `desc`)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "products": [
      {
        "id": "uuid",
        "sku": "PROD-001",
        "title": "Sample Product",
        "description": "Product description",
        "price": 25000.00,
        "currency": "NGN",
        "weight": 1.5,
        "dimensions": {
          "length": 10,
          "width": 5,
          "height": 2
        },
        "category_id": "uuid",
        "category_name": "Electronics",
        "is_active": true,
        "metadata": {
          "is_featured": true
        },
        "thumbnail": "https://example.com/image.jpg",
        "created_at": "2024-01-01T10:00:00.000Z",
        "updated_at": "2024-01-01T10:00:00.000Z"
      }
    ]
  }
}
```

### 2. Search Products
**Endpoint:** `GET /search`

**Description:** Full-text search across product titles and descriptions.

**Query Parameters:**
- `q`: Search query (required)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "products": [
      {
        "id": "uuid",
        "sku": "PROD-001",
        "title": "Sample Product",
        "description": "Product description",
        "price": 25000.00,
        "currency": "NGN",
        "category_name": "Electronics",
        "rank": 0.075,
        "thumbnail": "https://example.com/image.jpg"
      }
    ]
  }
}
```

### 3. Get Product Details
**Endpoint:** `GET /:id`

**Description:** Get detailed information about a specific product including variants and images.

**URL Parameters:**
- `id`: Product UUID

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "product": {
      "id": "uuid",
      "sku": "PROD-001",
      "title": "Sample Product",
      "description": "Detailed product description",
      "price": 25000.00,
      "currency": "NGN",
      "weight": 1.5,
      "dimensions": {
        "length": 10,
        "width": 5,
        "height": 2
      },
      "category_id": "uuid",
      "category_name": "Electronics",
      "is_active": true,
      "metadata": {
        "is_featured": true,
        "tags": ["electronics", "gadgets"]
      },
      "variants": [
        {
          "id": "uuid",
          "product_id": "uuid",
          "variant_name": "Red, Large",
          "sku": "PROD-001-RED-L",
          "price_delta": 5000.00,
          "stock": 10,
          "metadata": {
            "color": "red",
            "size": "large"
          }
        }
      ],
      "images": [
        {
          "id": "uuid",
          "product_id": "uuid",
          "url": "https://example.com/image1.jpg",
          "public_id": "cloudinary_id_1",
          "alt_text": "Sample Product Front View",
          "position": 0
        }
      ],
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T10:00:00.000Z"
    }
  }
}
```

### 4. Get Categories
**Endpoint:** `GET /categories`

**Description:** Get all product categories.

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Electronics",
        "description": "Electronic devices and accessories",
        "created_at": "2024-01-01T10:00:00.000Z"
      }
    ]
  }
}
```

### 5. Create Product (Admin Only)
**Endpoint:** `POST /`

**Description:** Create a new product (Admin only).

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Request Body:**
```json
{
  "sku": "PROD-001",
  "title": "Sample Product",
  "description": "Product description",
  "price": 25000.00,
  "currency": "NGN",
  "categoryId": "uuid",
  "weight": 1.5,
  "dimensions": {
    "length": 10,
    "width": 5,
    "height": 2
  },
  "variants": [
    {
      "variantName": "Red, Large",
      "sku": "PROD-001-RED-L",
      "priceDelta": 5000.00,
      "stock": 10,
      "metadata": {
        "color": "red",
        "size": "large"
      }
    }
  ],
  "images": [
    {
      "url": "https://example.com/image1.jpg",
      "publicId": "cloudinary_id_1",
      "altText": "Sample Product Front View"
    }
  ],
  "metadata": {
    "is_featured": true,
    "tags": ["electronics", "gadgets"]
  }
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Product created successfully",
  "data": {
    "product": {
      "id": "uuid",
      "sku": "PROD-001",
      "title": "Sample Product",
      "variants": [
        {
          "id": "uuid",
          "variant_name": "Red, Large",
          "sku": "PROD-001-RED-L",
          "price_delta": 5000.00,
          "stock": 10,
          "metadata": {}
        }
      ],
      "images": [
        {
          "id": "uuid",
          "url": "https://example.com/image1.jpg",
          "public_id": "cloudinary_id_1",
          "alt_text": "Sample Product Front View",
          "position": 0
        }
      ]
    }
  }
}
```

### 6. Update Product (Admin Only)
**Endpoint:** `PATCH /:id`

**Description:** Update an existing product (Admin only).

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**URL Parameters:**
- `id`: Product UUID

**Request Body:**
```json
{
  "title": "Updated Product Title",
  "price": 27500.00,
  "is_active": true,
  "metadata": {
    "is_featured": true
  }
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Product updated successfully",
  "data": {
    "product": {
      "id": "uuid",
      "title": "Updated Product Title",
      "price": 27500.00,
      "is_active": true
    }
  }
}
```

### 7. Delete Product (Admin Only)
**Endpoint:** `DELETE /:id`

**Description:** Soft delete a product (Admin only).

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**URL Parameters:**
- `id`: Product UUID

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Product deleted successfully"
}
```

## Product Variants

Products can have multiple variants with different attributes (size, color, etc.). Each variant:

- Has its own SKU and stock level
- Can have a price delta from the base product price
- Includes metadata for variant-specific attributes

## Product Images

Products support multiple images with:
- Cloud storage URLs
- Public IDs for cloud services
- Alt text for accessibility
- Position ordering

## Caching

- Product details are cached for 15 minutes
- Categories are cached for 1 hour
- Cache invalidation occurs on product updates

## Search Features

- Full-text search using PostgreSQL's tsvector
- Search across title and description
- Relevance ranking based on search terms

## Data Types

- **UUID**: Universally unique identifier (string)
- **Price**: Decimal number with 2 decimal places
- **Weight**: Decimal number (kilograms)
- **Dimensions**: Object with length, width, height (centimeters)
- **Stock**: Integer (quantity available)
- **Currency**: 3-letter currency code (string)
- **SKU**: Unique product identifier (string)

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
- `201 Created`: Product created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions (non-admin)
- `404 Not Found`: Product not found
- `422 Unprocessable Entity`: Validation error (duplicate SKU, etc.)
- `500 Internal Server Error`: Server error

## Rate Limiting

Product endpoints have rate limiting applied:
- Public endpoints: 100 requests per minute per IP
- Admin endpoints: 30 requests per minute per user

## Validation Rules

- **SKU**: Required, unique, string
- **Title**: 3-500 characters
- **Price**: Positive decimal number
- **Weight**: Positive decimal number (optional)
- **Variant SKU**: Required for each variant, unique
- **Stock**: Non-negative integer
- **Images**: Valid URLs required
