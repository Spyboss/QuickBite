# PayHere Integration Guide for QuickBite

This document provides instructions for setting up and troubleshooting the PayHere payment gateway integration with QuickBite.

## Setup Instructions

### 1. Environment Variables

#### Backend (.env file in quickbite-backend)
```
PAYHERE_MERCHANT_ID="1230461"
PAYHERE_APP_ID="4OVxzHIaKTw4JFnJZw4KUy3Td"
PAYHERE_APP_SECRET="4Oa4BqwAnKB4DuWMdivYCk4ZHlDrMRrKD8MNDCShWQL7"
PAYHERE_MERCHANT_SECRET="MjkyNjMwODIxMTMzMTE2MjYwNzczNjkzOTM4NDI2Mjg1MzI5NjYxOA=="
```

#### Frontend (.env file in quickbite-app)
```
VITE_PAYHERE_MERCHANT_ID="1230461"
VITE_PAYHERE_APP_ID="4OVxzHIaKTw4JFnJZw4KUy3Td"
```

### 2. PayHere Merchant Portal Configuration

1. Log into the [PayHere Merchant Portal](https://www.payhere.lk/merchant/login)
2. Go to Settings > API & Webhooks
3. Configure the following:
   - **Allowed Domains**: Add `http://localhost:5173` for development and your production domain
   - **API Permissions**: Enable both "Payment Retrieval API" and "Payment Capture API"

### 3. Local Development Setup

For local development, the application is configured to use a direct localhost URL for the PayHere webhook:

1. Run your backend server: `cd quickbite-backend && npm run dev`
2. Run your frontend: `cd quickbite-app && npm run dev`
3. The application will use the following notify URL for local development:

```javascript
// In Checkout.tsx
const notifyUrl = isDevelopment
  ? `http://localhost:3001/payhere-notify`
  : `https://quickbite-backend.vercel.app/payhere-notify`;
```

Note: For local testing, you'll need to use the PayHere sandbox environment, which allows localhost URLs for development purposes.

## Troubleshooting

### "Unauthorized payment request" Error

This error typically occurs due to one of the following reasons:

1. **Incorrect Merchant ID**: Ensure you're using the correct merchant ID (1230461) consistently across all files.

2. **Invalid Hash**: The hash generation might be incorrect. Check that:
   - The merchant secret is correctly set in the backend .env file
   - The hash generation follows PayHere's formula exactly
   - The amount is formatted with exactly 2 decimal places

3. **Domain Not Whitelisted**: Make sure your domain (including protocol and port) is added to the allowed domains in the PayHere merchant portal.

4. **Missing API Permissions**: Ensure both "Payment Retrieval API" and "Payment Capture API" permissions are enabled in the PayHere merchant portal.

### Testing the Integration

1. Use the PayHere sandbox environment for testing
2. Use test cards from the [PayHere documentation](https://support.payhere.lk/knowledge-base/sandbox-testing/)
3. For a quick test, use the test pages in the `public` folder:
   - `payhere-test.html`: Basic test with hash generation
   - `payhere-final-test.html`: Complete test with all parameters

## Hash Generation

The hash is generated using the following formula:

```
hash = strtoupper(md5(merchant_id + order_id + amount + currency + strtoupper(md5(merchant_secret))))
```

Example:
```javascript
const crypto = require('crypto');
function generateHash(merchantId, orderId, amount, currency, merchantSecret) {
  const formattedAmount = Number(amount).toFixed(2);
  const hashedSecret = crypto.createHash('md5')
    .update(merchantSecret)
    .digest('hex')
    .toUpperCase();
  const stringToHash = merchantId + orderId + formattedAmount + currency + hashedSecret;
  return crypto.createHash('md5')
    .update(stringToHash)
    .digest('hex')
    .toUpperCase();
}
```

## References

- [PayHere Documentation](https://support.payhere.lk/api-&-mobile-sdk/payhere-checkout)
- [PayHere Sandbox Testing](https://support.payhere.lk/knowledge-base/sandbox-testing/)
