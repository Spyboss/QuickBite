# QuickBite API Documentation

This document provides details about the QuickBite API endpoints, request/response formats, and authentication requirements.

## Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://quickbite-api.railway.app` (example)

## Authentication

Most endpoints require authentication using a JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## API Endpoints

### Authentication

#### Register User

```
POST /auth/register
```

Request body:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "phone": "+94771234567"
}
```

Response:
```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token"
}
```

#### Login User

```
POST /auth/login
```

Request body:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token"
}
```

### Menu Items

#### Get All Menu Items

```
GET /menu
```

Query parameters:
- `category` (optional): Filter by category
- `search` (optional): Search by name or description

Response:
```json
{
  "items": [
    {
      "id": 1,
      "name": "Chicken Burger",
      "description": "Juicy chicken patty with lettuce and mayo",
      "price": 750.00,
      "image_url": "https://example.com/chicken-burger.jpg",
      "category": "Burgers"
    },
    // More items...
  ]
}
```

#### Get Menu Item by ID

```
GET /menu/:id
```

Response:
```json
{
  "id": 1,
  "name": "Chicken Burger",
  "description": "Juicy chicken patty with lettuce and mayo",
  "price": 750.00,
  "image_url": "https://example.com/chicken-burger.jpg",
  "category": "Burgers"
}
```

#### Create Menu Item (Admin only)

```
POST /menu
```

Request body:
```json
{
  "name": "Veggie Burger",
  "description": "Plant-based patty with fresh vegetables",
  "price": 650.00,
  "image_url": "https://example.com/veggie-burger.jpg",
  "category": "Burgers"
}
```

Response:
```json
{
  "id": 2,
  "name": "Veggie Burger",
  "description": "Plant-based patty with fresh vegetables",
  "price": 650.00,
  "image_url": "https://example.com/veggie-burger.jpg",
  "category": "Burgers"
}
```

#### Update Menu Item (Admin only)

```
PUT /menu/:id
```

Request body:
```json
{
  "name": "Veggie Burger Deluxe",
  "description": "Plant-based patty with premium vegetables",
  "price": 700.00,
  "image_url": "https://example.com/veggie-burger-deluxe.jpg",
  "category": "Burgers"
}
```

Response:
```json
{
  "id": 2,
  "name": "Veggie Burger Deluxe",
  "description": "Plant-based patty with premium vegetables",
  "price": 700.00,
  "image_url": "https://example.com/veggie-burger-deluxe.jpg",
  "category": "Burgers"
}
```

#### Delete Menu Item (Admin only)

```
DELETE /menu/:id
```

Response:
```json
{
  "message": "Menu item deleted successfully"
}
```

### Orders

#### Create Order

```
POST /orders
```

Request body:
```json
{
  "items": [
    {
      "id": 1,
      "name": "Chicken Burger",
      "price": 750.00,
      "quantity": 2
    }
  ],
  "total": 1500.00,
  "customer_name": "John Doe",
  "customer_phone": "+94771234567",
  "payment_method": "PayHere"
}
```

Response:
```json
{
  "id": 1001,
  "items": [
    {
      "id": 1,
      "name": "Chicken Burger",
      "price": 750.00,
      "quantity": 2
    }
  ],
  "total": 1500.00,
  "status": "pending",
  "customer_name": "John Doe",
  "customer_phone": "+94771234567",
  "payment_method": "PayHere",
  "created_at": "2025-05-18T12:00:00Z"
}
```

#### Get User Orders

```
GET /orders
```

Response:
```json
{
  "orders": [
    {
      "id": 1001,
      "items": [
        {
          "id": 1,
          "name": "Chicken Burger",
          "price": 750.00,
          "quantity": 2
        }
      ],
      "total": 1500.00,
      "status": "completed",
      "customer_name": "John Doe",
      "customer_phone": "+94771234567",
      "payment_method": "PayHere",
      "created_at": "2025-05-18T12:00:00Z"
    },
    // More orders...
  ]
}
```

#### Get Order by ID

```
GET /orders/:id
```

Response:
```json
{
  "id": 1001,
  "items": [
    {
      "id": 1,
      "name": "Chicken Burger",
      "price": 750.00,
      "quantity": 2
    }
  ],
  "total": 1500.00,
  "status": "completed",
  "customer_name": "John Doe",
  "customer_phone": "+94771234567",
  "payment_method": "PayHere",
  "payment_id": "PHR123456789",
  "created_at": "2025-05-18T12:00:00Z"
}
```

#### Update Order Status (Admin only)

```
PATCH /orders/:id/status
```

Request body:
```json
{
  "status": "preparing"
}
```

Response:
```json
{
  "id": 1001,
  "status": "preparing",
  "updated_at": "2025-05-18T12:30:00Z"
}
```

### Payments

#### Generate Payment Hash

```
POST /payments/generate-hash
```

Request body:
```json
{
  "order_id": 1001,
  "amount": 1500.00,
  "currency": "LKR"
}
```

Response:
```json
{
  "hash": "A1B2C3D4E5F6G7H8I9J0",
  "merchant_id": "1230461"
}
```

#### PayHere Notification Webhook

```
POST /payments/notify
```

This endpoint is called by PayHere after a payment is completed. It's not meant to be called directly by clients.

### Notifications

#### Register FCM Token

```
POST /notifications/register-token
```

Request body:
```json
{
  "token": "fcm-token"
}
```

Response:
```json
{
  "message": "Token registered successfully"
}
```

## Error Responses

All endpoints return standard error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Must be a valid email address"
    }
  }
}
```

Common error codes:
- `VALIDATION_ERROR`: Invalid input data
- `AUTHENTICATION_ERROR`: Authentication failed
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `SERVER_ERROR`: Internal server error

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

When rate limit is exceeded, the API returns a 429 Too Many Requests response.

## Versioning

The current API version is v1. All endpoints are prefixed with `/api/v1`.

## Pagination

List endpoints support pagination using the following query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Response includes pagination metadata:
```json
{
  "items": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```
