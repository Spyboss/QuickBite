# PayHere "Unauthorized payment request" Troubleshooting Guide

This guide provides step-by-step instructions for resolving the "Unauthorized payment request" error when using PayHere with QuickBite.

## Common Causes

The "Unauthorized payment request" error typically occurs due to one of the following reasons:

1. **Incorrect Merchant Credentials**: Mismatch between the merchant ID used in the code and the one registered with PayHere.
2. **Invalid Hash**: The hash generation is incorrect or the merchant secret is invalid.
3. **Domain Not Whitelisted**: The domain used for the payment request is not added to the allowed domains in the PayHere merchant portal.
4. **Missing API Permissions**: Required API permissions are not enabled in the PayHere merchant portal.
5. **Inaccessible Notify URL**: The notify URL is not accessible from PayHere's servers.

## Step-by-Step Resolution

### 1. Verify Merchant Credentials

1. Log into the [PayHere Merchant Portal](https://www.payhere.lk/merchant/login)
2. Go to Settings > API & Webhooks
3. Verify the Merchant ID (should be `1230461`)
4. Update all code to use this Merchant ID consistently:
   - Frontend environment variables
   - Backend environment variables
   - Test HTML files

### 2. Set Up Environment Variables Correctly

#### Backend (.env file)

```
PAYHERE_MERCHANT_ID=1230461
PAYHERE_APP_ID=4OVxzHIaKTw4JFnJZw4KUy3Td
PAYHERE_APP_SECRET=4Oa4BqwAnKB4DuWMdivYCk4ZHlDrMRrKD8MNDCShWQL7
PAYHERE_MERCHANT_SECRET=MjkyNjMwODIxMTMzMTE2MjYwNzczNjkzOTM4NDI2Mjg1MzI5NjYxOA==
```

#### Frontend (.env file)

```
VITE_PAYHERE_MERCHANT_ID=1230461
VITE_PAYHERE_APP_ID=4OVxzHIaKTw4JFnJZw4KUy3Td
```

### 3. Configure PayHere Merchant Portal

1. Log into the [PayHere Merchant Portal](https://www.payhere.lk/merchant/login)
2. Go to Settings > API & Webhooks
3. Configure the following:
   - **Allowed Domains**: Add `http://localhost:5173` for development
   - **API Permissions**: Enable both "Payment Retrieval API" and "Payment Capture API"

### 4. Set Up ngrok for Development

For the PayHere webhook (notify_url) to work in development:

1. Install dependencies: `cd quickbite-backend && npm install`
2. Run the backend server: `npm run dev`
3. In a separate terminal, run: `npm run setup-ngrok`
4. Copy the ngrok URL displayed in the terminal
5. Add the ngrok domain to the PayHere merchant portal's allowed domains

### 5. Test the Integration

1. Make sure both frontend and backend are running:
   ```
   # Terminal 1 (Backend)
   cd quickbite-backend
   npm run dev
   
   # Terminal 2 (ngrok)
   cd quickbite-backend
   npm run setup-ngrok
   
   # Terminal 3 (Frontend)
   cd quickbite-app
   npm run dev
   ```

2. Open the app in your browser and place an order with PayHere payment
3. Use a test card from the [PayHere documentation](https://support.payhere.lk/knowledge-base/sandbox-testing/)

## Debugging Tips

### Check Hash Generation

The hash should be generated using:

```
hash = strtoupper(md5(merchant_id + order_id + amount + currency + strtoupper(md5(merchant_secret))))
```

Verify that:
- The merchant secret is correct
- The amount is formatted with exactly 2 decimal places
- The order ID is correctly formatted

### Check Browser Console

Look for errors in the browser console related to:
- Hash generation
- Domain issues
- Form submission

### Check Backend Logs

Look for errors in the backend logs related to:
- Hash generation
- Webhook verification

## Still Having Issues?

If you're still experiencing the "Unauthorized payment request" error after following these steps, contact PayHere support at:

- Phone: 0115 339 339
- Email: support@payhere.lk
- Web: https://support.payhere.lk/

Provide them with:
- Your Merchant ID
- The exact error message
- Screenshots of the error
- Logs from your browser console and backend server
