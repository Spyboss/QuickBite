/**
 * PayHere Payment Service
 *
 * This service handles PayHere payment processing, verification, and webhook handling.
 * It provides functions for generating payment hashes, verifying signatures, and processing
 * payment notifications.
 */

const crypto = require('crypto');
const dotenv = require('dotenv');
const { supabase } = require('../supabaseClient');

dotenv.config();

// PayHere credentials from environment variables
const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID;
const APP_ID = process.env.PAYHERE_APP_ID;
const APP_SECRET = process.env.PAYHERE_APP_SECRET;
const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET;

// Check if required environment variables are set
if (!MERCHANT_ID || !APP_ID || !APP_SECRET || !MERCHANT_SECRET) {
  console.error('PayHere credentials are not properly configured in environment variables.');
  console.error('Please set PAYHERE_MERCHANT_ID, PAYHERE_APP_ID, PAYHERE_APP_SECRET, and PAYHERE_MERCHANT_SECRET.');
  console.error('Current values:');
  console.error('- MERCHANT_ID:', MERCHANT_ID);
  console.error('- APP_ID:', APP_ID);
  console.error('- APP_SECRET:', APP_SECRET ? 'Set (not shown for security)' : 'Not set');
  console.error('- MERCHANT_SECRET:', MERCHANT_SECRET ? 'Set (not shown for security)' : 'Not set');
}

/**
 * Generate a hash for PayHere payment request
 *
 * @param {Object} paymentData - Payment data including order_id, items, currency, amount
 * @returns {string} - The generated hash
 */
function generatePaymentHash(paymentData) {
  try {
    // According to PayHere docs, the hash is generated as:
    // hash = strtoupper(md5(merchant_id + order_id + amount + currency + strtoupper(md5(merchant_secret))))

    console.log('=== PayHere Hash Generation ===');
    console.log('Merchant ID:', MERCHANT_ID);
    console.log('Order ID:', paymentData.order_id);
    console.log('Amount:', paymentData.amount);
    console.log('Currency:', paymentData.currency);
    console.log('Merchant Secret (first 10 chars):', MERCHANT_SECRET.substring(0, 10) + '...');

    // Format amount to have 2 decimal places with no thousands separator
    const formattedAmount = Number(paymentData.amount).toFixed(2);
    console.log('Formatted Amount:', formattedAmount);

    // Generate MD5 hash of merchant secret and convert to uppercase
    const hashedSecret = crypto.createHash('md5')
      .update(MERCHANT_SECRET)
      .digest('hex')
      .toUpperCase();
    console.log('Hashed Secret:', hashedSecret);

    // Generate the final hash
    const stringToHash =
      MERCHANT_ID +
      paymentData.order_id +
      formattedAmount +
      paymentData.currency +
      hashedSecret;
    console.log('String to Hash:', MERCHANT_ID + paymentData.order_id + formattedAmount + paymentData.currency + hashedSecret);

    // Return the final hash in uppercase
    const hash = crypto.createHash('md5')
      .update(stringToHash)
      .digest('hex')
      .toUpperCase();
    console.log('Generated Hash:', hash);
    console.log('=== End PayHere Hash Generation ===');

    return hash;
  } catch (error) {
    console.error('Error generating PayHere payment hash:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    throw new Error('Failed to generate payment hash: ' + error.message);
  }
}

/**
 * Verify PayHere webhook signature
 *
 * @param {Object} webhookData - Data received from PayHere webhook
 * @returns {boolean} - Whether the signature is valid
 */
function verifyWebhookSignature(webhookData) {
  try {
    const {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig
    } = webhookData;

    console.log('=== PayHere Webhook Signature Verification ===');
    console.log('Received webhook data:');
    console.log('- merchant_id:', merchant_id);
    console.log('- order_id:', order_id);
    console.log('- payhere_amount:', payhere_amount);
    console.log('- payhere_currency:', payhere_currency);
    console.log('- status_code:', status_code);
    console.log('- md5sig:', md5sig);

    // According to PayHere docs:
    // strtoupper(md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + strtoupper(md5(app_secret))))
    const secretHash = crypto.createHash('md5').update(APP_SECRET).digest('hex').toUpperCase();
    console.log('- APP_SECRET hash:', secretHash);

    const stringToHash =
      merchant_id +
      order_id +
      payhere_amount +
      payhere_currency +
      status_code +
      secretHash;
    console.log('- String to hash:', stringToHash);

    const generatedSignature = crypto.createHash('md5').update(stringToHash).digest('hex').toUpperCase();
    console.log('- Generated signature:', generatedSignature);
    console.log('- Received signature:', md5sig);
    console.log('- Signatures match:', generatedSignature === md5sig);
    console.log('=== End PayHere Webhook Signature Verification ===');

    return generatedSignature === md5sig;
  } catch (error) {
    console.error('Error verifying PayHere webhook signature:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

/**
 * Process PayHere payment notification
 *
 * @param {Object} webhookData - Data received from PayHere webhook
 * @returns {Object} - Result of processing the notification
 */
async function processPaymentNotification(webhookData) {
  try {
    const { order_id, status_code, payment_id } = webhookData;

    // Map PayHere status codes to our order statuses
    let newOrderStatus;
    switch (status_code) {
      case '2': // Payment successful
        newOrderStatus = 'paid';
        break;
      case '0': // Payment pending
        newOrderStatus = 'pending_payment';
        break;
      case '-1': // Payment canceled
        newOrderStatus = 'cancelled';
        break;
      case '-2': // Payment failed
        newOrderStatus = 'payment_failed';
        break;
      case '-3': // Chargedback
        newOrderStatus = 'charged_back';
        break;
      default:
        console.warn(`Unknown PayHere status_code: ${status_code} for order_id: ${order_id}`);
        return { success: false, message: 'Unknown payment status code' };
    }

    // Update order status in database
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: newOrderStatus,
        payment_id: payment_id || null,
        payment_updated_at: new Date().toISOString()
      })
      .eq('id', order_id)
      .select();

    if (error) {
      console.error(`Error updating order ${order_id} in Supabase:`, error);
      return { success: false, message: 'Database error', error };
    }

    if (!data || data.length === 0) {
      return { success: false, message: 'Order not found' };
    }

    return {
      success: true,
      message: `Order ${order_id} status updated to ${newOrderStatus}`,
      order: data[0]
    };
  } catch (error) {
    console.error('Error processing PayHere payment notification:', error);
    return { success: false, message: 'Error processing payment notification', error };
  }
}

module.exports = {
  generatePaymentHash,
  verifyWebhookSignature,
  processPaymentNotification
};
