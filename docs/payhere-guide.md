# PayHere Integration Guide for QuickBite

This comprehensive guide covers the setup, integration, and troubleshooting of the PayHere payment gateway with the QuickBite application.

## Table of Contents

- [Setup Instructions](#setup-instructions)
  - [Environment Variables](#environment-variables)
  - [PayHere Merchant Portal Configuration](#payhere-merchant-portal-configuration)
  - [Setting Up ngrok for Development](#setting-up-ngrok-for-development)
- [Integration Details](#integration-details)
  - [Hash Generation](#hash-generation)
  - [Payment Flow](#payment-flow)
  - [Webhook Handling](#webhook-handling)
- [Troubleshooting](#troubleshooting)
  - ["Unauthorized payment request" Error](#unauthorized-payment-request-error)
  - [Payment Window Closes Prematurely](#payment-window-closes-prematurely)
  - [Webhook Not Receiving Callbacks](#webhook-not-receiving-callbacks)
  - [Hash Verification Fails](#hash-verification-fails)
- [Testing](#testing)
  - [Sandbox Test Cards](#sandbox-test-cards)
  - [End-to-End Testing](#end-to-end-testing)
- [References](#references)

## Setup Instructions

### Environment Variables

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

### PayHere Merchant Portal Configuration

1. Log into the [PayHere Merchant Portal](https://www.payhere.lk/merchant/login) (use Sandbox for testing)
2. Go to Settings > API & Webhooks
3. Configure the following:
   - **Allowed Domains**: Add `http://localhost:5173` for development and your production domain
   - **API Permissions**: Enable both "Payment Retrieval API" and "Payment Capture API"

### Setting Up ngrok for Development

For the PayHere webhook (notify_url) to work in development, you need to expose your local server using ngrok:

1. Install dependencies:
   ```bash
   cd quickbite-backend
   npm install
   ```

2. Run the backend server:
   ```bash
   npm run dev
   ```

3. In a separate terminal, set up ngrok:
   ```bash
   npm run setup-ngrok
   ```

4. If the automatic setup fails, you can set up ngrok manually:
   - Run ngrok directly: `ngrok http 3001`
   - Copy the HTTPS URL provided by ngrok (e.g., `https://abcd1234.ngrok.io`)
   - Create the ngrok info file: `node create-ngrok-info.js https://abcd1234.ngrok.io`

5. Add the ngrok domain to the PayHere merchant portal's allowed domains list

## Integration Details

### Hash Generation

The hash is generated using the following formula:

```
hash = strtoupper(md5(merchant_id + order_id + amount + currency + strtoupper(md5(merchant_secret))))
```

Example implementation in JavaScript:
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

### Payment Flow

1. **Frontend**: User adds items to cart and proceeds to checkout
2. **Frontend**: User selects PayHere as payment method and submits order
3. **Backend**: Order is created in the database with status "pending"
4. **Backend**: Hash is generated for the payment
5. **Frontend**: Payment form is submitted to PayHere
6. **PayHere**: User completes payment on PayHere's platform
7. **PayHere**: PayHere sends a notification to the webhook URL
8. **Backend**: Webhook handler verifies the payment and updates the order status
9. **Frontend**: User is redirected to success or failure page

### Webhook Handling

The backend includes a webhook handler at `/payhere-notify` that:
1. Verifies the payment notification
2. Updates the order status in the database
3. Sends a notification to the user (optional)

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

### Payment Window Closes Prematurely

**Issue:** The PayHere payment window opens but closes immediately without completing the payment.

**Solutions:**
1. Make sure you're not using `form.target = '_blank'` in the `initiatePayment` function, as it can trigger popup blockers
2. Check browser console for any JavaScript errors
3. Verify that all required payment parameters are being sent correctly
4. Make sure the domain is whitelisted in the PayHere merchant portal

### Webhook Not Receiving Callbacks

**Issue:** The payment completes, but the order status doesn't update automatically.

**Solutions:**
1. Make sure ngrok is running and the URL is correct
2. Check that the ngrok domain is added to the allowed domains in the PayHere merchant portal
3. Verify that the notify_url parameter is correct in the payment data
4. Check the backend logs for any errors in the webhook handler

### Hash Verification Fails

**Issue:** The payment is initiated, but PayHere returns an error about invalid hash.

**Solutions:**
1. Make sure the Merchant Secret is correct
2. Verify that the amount is formatted correctly with 2 decimal places
3. Check that the order_id, amount, and currency match exactly between the hash generation and the payment data
4. Look for any character encoding issues in the hash generation

## Testing

### Sandbox Test Cards

Use these test cards for testing in the PayHere sandbox:

| Card Number       | Expiry | CVV | Result                |
|-------------------|--------|-----|------------------------|
| 4111111111111111  | 12/25  | 123 | Successful payment    |
| 4012001037141112  | 12/25  | 123 | Failed payment        |
| 4012001037167778  | 12/25  | 123 | Payment requires OTP  |

### End-to-End Testing

To test the PayHere integration end-to-end:

1. Start the backend server: `cd quickbite-backend && npm run dev`
2. Set up ngrok: `cd quickbite-backend && npm run setup-ngrok`
3. Start the frontend: `cd quickbite-app && npm run dev`
4. Add items to the cart and proceed to checkout
5. Select "PayHere (Online Payment)" and place the order
6. Complete the payment using a test card
7. Verify that the order status updates correctly

## References

- [PayHere Documentation](https://support.payhere.lk/api-&-mobile-sdk/payhere-checkout)
- [PayHere Sandbox Testing](https://support.payhere.lk/knowledge-base/sandbox-testing/)
- [PayHere API Reference](https://support.payhere.lk/api-&-mobile-sdk/payhere-retrieval)
