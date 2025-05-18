# QuickBite Architecture

This document outlines the architecture of the QuickBite application, including component interactions, data flow, and integration points.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                           CLIENT (Browser/PWA)                          │
│                                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────────┐ │
│  │             │    │             │    │             │    │          │ │
│  │  React UI   │    │  Context    │    │  Services   │    │  Utils   │ │
│  │ Components  │◄──►│   API       │◄──►│  (API)      │◄──►│          │ │
│  │             │    │             │    │             │    │          │ │
│  └─────────────┘    └─────────────┘    └──────┬──────┘    └──────────┘ │
│                                                │                        │
└────────────────────────────────────────────────┼────────────────────────┘
                                                 │
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                           EXPRESS BACKEND                               │
│                                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────────┐ │
│  │             │    │             │    │             │    │          │ │
│  │   Routes    │◄──►│ Controllers │◄──►│  Services   │◄──►│  Utils   │ │
│  │             │    │             │    │             │    │          │ │
│  └─────────────┘    └─────────────┘    └──────┬──────┘    └──────────┘ │
│                                                │                        │
└────────────────────────────────────────────────┼────────────────────────┘
                                                 │
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                        EXTERNAL SERVICES                                │
│                                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │             │    │             │    │             │                 │
│  │  Supabase   │    │  PayHere    │    │  Firebase   │                 │
│  │ (Database)  │    │ (Payments)  │    │    (FCM)    │                 │
│  │             │    │             │    │             │                 │
│  └─────────────┘    └─────────────┘    └─────────────┘                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### Frontend (React/TypeScript)

1. **Components**
   - **Auth**: User authentication components (login, register, profile)
   - **Menu**: Food menu display and filtering
   - **Cart**: Shopping cart management
   - **Checkout**: Order placement and payment
   - **Payment**: Payment success and failure handling
   - **OrderStatus**: Order tracking and status display

2. **Context API**
   - **AuthContext**: User authentication state
   - **CartContext**: Shopping cart state
   - **NotificationContext**: Push notification handling

3. **Services**
   - **authService**: Authentication API calls
   - **menuService**: Menu item API calls
   - **orderService**: Order management API calls
   - **payhereService**: Payment processing

4. **Utils**
   - **apiUtils**: API request helpers
   - **validationUtils**: Form validation
   - **formatUtils**: Data formatting

### Backend (Node.js/Express)

1. **Routes**
   - **authRoutes**: Authentication endpoints
   - **menuRoutes**: Menu item endpoints
   - **orderRoutes**: Order management endpoints
   - **paymentRoutes**: Payment processing endpoints
   - **webhookRoutes**: External service webhook handlers

2. **Controllers**
   - **authController**: Authentication logic
   - **menuController**: Menu item logic
   - **orderController**: Order management logic
   - **paymentController**: Payment processing logic
   - **webhookController**: Webhook handling logic

3. **Services**
   - **authService**: User authentication
   - **menuService**: Menu item management
   - **orderService**: Order processing
   - **payhereService**: Payment gateway integration
   - **notificationService**: Push notification sending

4. **Utils**
   - **hashUtils**: Hash generation for payments
   - **validationUtils**: Input validation
   - **errorUtils**: Error handling

## Data Flow

### User Authentication Flow

1. User enters credentials in the Auth component
2. AuthContext calls authService.login()
3. authService makes API request to backend
4. Backend authController validates credentials
5. Backend generates JWT token
6. Token is returned to frontend
7. AuthContext stores token and user info

### Order Placement Flow

1. User adds items to cart via Menu component
2. CartContext updates cart state
3. User proceeds to checkout
4. Checkout component collects delivery info
5. User selects payment method
6. If PayHere:
   a. Frontend requests hash from backend
   b. Backend generates hash using merchant secret
   c. Frontend submits form to PayHere
   d. User completes payment on PayHere
   e. PayHere sends notification to backend webhook
   f. Backend verifies payment and updates order
   g. User is redirected to success/failure page
7. If Cash on Pickup:
   a. Order is created with "pending" status
   b. User is redirected to success page

## Integration Points

### Supabase Integration

- **Authentication**: User registration and login
- **Database**: Storing menu items, orders, and user data
- **Storage**: Storing menu item images
- **Row Level Security**: Ensuring users can only access their own data

### PayHere Integration

- **Checkout**: Initiating payments
- **Webhooks**: Receiving payment notifications
- **API**: Verifying payment status

### Firebase Cloud Messaging (FCM) Integration

- **Push Notifications**: Sending order status updates
- **Service Worker**: Handling background notifications

## Deployment Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Cloudflare     │     │    Railway      │     │    Supabase     │
│    Pages        │     │                 │     │                 │
│  (Frontend)     │     │   (Backend)     │     │   (Database)    │
│                 │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                         End Users                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Security Considerations

1. **Authentication**
   - JWT tokens with appropriate expiration
   - Secure password storage with bcrypt
   - HTTPS for all communications

2. **Database Security**
   - Row Level Security (RLS) policies in Supabase
   - Service role key only used in backend
   - Anon key with limited permissions for frontend

3. **Payment Security**
   - Hash generation only on backend
   - Merchant secret never exposed to frontend
   - HTTPS for all payment communications

4. **API Security**
   - Input validation on all endpoints
   - Rate limiting to prevent abuse
   - CORS configuration to restrict access

## Performance Considerations

1. **Frontend**
   - Code splitting for faster initial load
   - Image optimization for menu items
   - Caching strategies for offline support

2. **Backend**
   - Connection pooling for database
   - Efficient query design with proper indexes
   - Stateless design for horizontal scaling

3. **Database**
   - Proper indexing on frequently queried fields
   - Efficient data modeling
   - Regular performance monitoring
