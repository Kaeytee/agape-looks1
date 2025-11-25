# Media API Integration Guide

This document provides the API endpoints, request/response formats, and integration details for the Media service using Cloudinary.

## Base URL
```
/api/v1/media
```

## Endpoints

### 1. Generate Upload URL
**Endpoint:** `GET /upload-url`

**Description:** Generate a signed upload URL for direct upload to Cloudinary (Admin only).

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**
- `folder`: Target folder in Cloudinary (optional)
- `public_id`: Desired public ID (optional)
- `transformation`: Image transformation string (optional)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "uploadUrl": "https://api.cloudinary.com/v1_1/your_cloud/upload",
    "formData": {
      "signature": "signed_string",
      "timestamp": "1640995200",
      "api_key": "your_api_key",
      "folder": "products",
      "public_id": "custom_id"
    }
  }
}
```

### 2. Upload Media
**Endpoint:** `POST /upload`

**Description:** Upload media file through the API (Admin only).

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `file`: Media file (image/video)
- `options[folder]`: Target folder (optional)
- `options[public_id]`: Custom public ID (optional)
- `options[transformation]`: Transformation string (optional)

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Media uploaded successfully",
  "data": {
    "public_id": "products/image_123",
    "url": "https://res.cloudinary.com/your_cloud/image/upload/v1640995200/products/image_123.jpg",
    "secure_url": "https://res.cloudinary.com/your_cloud/image/upload/v1640995200/products/image_123.jpg",
    "format": "jpg",
    "width": 1920,
    "height": 1080,
    "bytes": 245760,
    "created_at": "2024-01-01T10:00:00.000Z"
  }
}
```

### 3. Delete Media
**Endpoint:** `DELETE /:publicId`

**Description:** Delete media file from Cloudinary (Admin only).

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
```

**URL Parameters:**
- `publicId`: Cloudinary public ID of the media to delete

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Media deleted successfully"
}
```

## Upload Methods

### Direct Upload (Recommended)

1. **Generate Upload URL** from `GET /upload-url`
2. **Upload directly to Cloudinary** using the signed URL
3. **Store returned URL** in your application

### API Upload

1. **Send file to API** via `POST /upload`
2. **Receive Cloudinary response** with media details

## Cloudinary Integration

The media service integrates with Cloudinary for:
- Image and video storage
- Automatic format optimization
- CDN delivery
- Image transformations

## Supported File Types

- **Images**: JPG, PNG, GIF, WebP, SVG
- **Videos**: MP4, WebM, MOV
- **Raw files**: PDF, DOC, etc.

## File Size Limits

- Default limit: 10MB per file
- Configurable via environment variables

## Security

- All uploads require admin authentication
- Signed URLs prevent unauthorized uploads
- Files are validated for type and size

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
- `400 Bad Request`: Invalid file or parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions (non-admin)
- `413 Payload Too Large`: File too large
- `422 Unprocessable Entity`: Invalid file type
- `500 Internal Server Error`: Server error

## Rate Limiting

Media endpoints have rate limiting applied:
- Upload URL generation: 10 requests per minute per admin
- Direct upload: 20 requests per minute per admin
- Delete: 30 requests per minute per admin

## Data Types

- **Public ID**: Cloudinary unique identifier (string)
- **URL**: Full Cloudinary delivery URL (string)
- **Format**: File format/extension (string)
- **Dimensions**: Width and height in pixels (integers)
- **Size**: File size in bytes (integer)
- **Timestamp**: ISO 8601 format (string)

## Usage Examples

### Frontend Direct Upload

```javascript
// 1. Get signed upload URL
const response = await fetch('/api/v1/media/upload-url?folder=products');
const { data } = await response.json();

// 2. Upload directly to Cloudinary
const formData = new FormData();
Object.entries(data.formData).forEach(([key, value]) => {
  formData.append(key, value);
});
formData.append('file', selectedFile);

const uploadResponse = await fetch(data.uploadUrl, {
  method: 'POST',
  body: formData
});

const result = await uploadResponse.json();

// 3. Use the returned URL
console.log(result.secure_url);
```

### Backend API Upload

```javascript
const formData = new FormData();
formData.append('file', fileBuffer);
formData.append('options[folder]', 'products');

const response = await fetch('/api/v1/media/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  },
  body: formData
});

const { data } = await response.json();
```
