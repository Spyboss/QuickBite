# PayHere Troubleshooting Guide for QuickBite

This guide provides step-by-step instructions for troubleshooting and resolving common issues with the PayHere payment integration in the QuickBite application.

## "Unauthorized payment request" Error

If you're seeing an "Unauthorized payment request" error when trying to make a payment through PayHere, follow these steps to resolve the issue:

### Step 1: Verify API Credentials

1. Check that you're using the correct Merchant ID and Merchant Secret:
   ```
   Merchant ID: 1230461
   Merchant Secret: MjkyNjMwODIxMTMzMTE2MjYwNzczNjkzOTM4NDI2Mjg1MzI5NjYxOA==
   ```

2. Verify these values in your environment files:
   - Backend: `.env` file in the `quickbite-backend` directory
   - Frontend: `.env` file in the `quickbite-app` directory

3. Make sure there are no typos or extra spaces in the credentials.

### Step 2: Enable Required API Permissions

1. Log into the [PayHere Merchant Portal](https://sandbox.payhere.lk/merchant/login) (Sandbox Mode)
2. Go to Settings > API & Webhooks
3. Find the API key for QuickBite (App ID: `4OVxzHIaKTw4JFnJZw4KUy3Td`)
4. Make sure both "Payment Retrieval API" and "Payment Capture API" permissions are enabled
5. Save the changes

### Step 3: Set Up ngrok for Webhook Callbacks

For the PayHere webhook (notify_url) to work in development:

1. Make sure ngrok is installed:
   ```
   cd quickbite-backend
   npm run install-ngrok
   ```

2. Run the backend server:
   ```
   cd quickbite-backend
   npm run dev
   ```

3. In a separate terminal, set up ngrok:
   ```
   cd quickbite-backend
   npm run setup-ngrok
   ```

4. If the automatic setup fails, you can set up ngrok manually:
   - Run ngrok directly: `ngrok http 3001`
   - Copy the HTTPS URL provided by ngrok (e.g., `https://abcd1234.ngrok.io`)
   - Create the ngrok info file: `node create-ngrok-info.js https://abcd1234.ngrok.io`

5. Add the ngrok domain to the PayHere merchant portal's allowed domains list:
   - Log into the [PayHere Merchant Portal](https://sandbox.payhere.lk/merchant/login) (Sandbox Mode)
   - Go to Settings > API & Webhooks
   - Add the domain (e.g., `abcd1234.ngrok.io`) to the allowed domains list

The application will automatically use the ngrok URL for the notify_url parameter.

For more detailed instructions, see the `ngrok-manual-setup.md` file in the `quickbite-backend` directory.

### Step 4: Verify Hash Generation

The hash is generated using the following formula:
```
hash = strtoupper(md5(merchant_id + order_id + amount + currency + strtoupper(md5(merchant_secret))))
```

Check the backend logs to see if the hash is being generated correctly:
1. Look for logs starting with `=== PayHere Hash Generation ===`
2. Verify that the correct Merchant ID, Order ID, Amount, Currency, and Merchant Secret are being used
3. Check that the hash is being generated correctly

### Step 5: Test with Sandbox Test Cards

Use these test cards for testing in the PayHere sandbox:

| Card Number       | Expiry | CVV | Result                |
|-------------------|--------|-----|------------------------|
| 4111111111111111  | 12/25  | 123 | Successful payment    |
| 4012001037141112  | 12/25  | 123 | Failed payment        |
| 4012001037167778  | 12/25  | 123 | Payment requires OTP  |

## Common Issues and Solutions

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

## Testing End-to-End

To test the PayHere integration end-to-end:

1. Start the backend server: `cd quickbite-backend && npm run dev`
2. Set up ngrok: `cd quickbite-backend && node setup-ngrok.bat`
3. Start the frontend: `cd quickbite-app && npm run dev`
4. Add items to the cart and proceed to checkout
5. Select "PayHere (Online Payment)" and place the order
6. Complete the payment using a test card
7. Verify that the order status updates correctly

## Debugging Tools

### Backend Logs

The backend includes detailed logging for PayHere integration:
- Hash generation logs
- Webhook verification logs
- Payment notification processing logs

### Frontend Console

The frontend includes detailed logging in the browser console:
- Payment data preparation
- Hash retrieval
- Form submission details

## Contact Support

If you continue to experience issues after following this guide, contact PayHere support:
- Phone: 0115 339 339
- Email: support@payhere.lk
- Facebook Messenger: [PayHere Facebook Page](https://www.facebook.com/payhereOnline/)

Provide them with:
- Your Merchant ID
- The specific error message
- Screenshots of the issue
- Relevant logs from your application
