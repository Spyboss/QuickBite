/**
 * Payment controller
 */
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// PayHere credentials from environment variables
const merchantId = process.env.PAYHERE_MERCHANT_ID;
const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

/**
 * Generate a hash for PayHere payment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateHash = async (req, res) => {
  try {
    const { order_id, amount, currency } = req.body;
    
    // Format amount to 2 decimal places
    const formattedAmount = Number(amount).toFixed(2);
    
    // Generate hash according to PayHere documentation
    console.log('=== PayHere Hash Generation ===');
    console.log(`Merchant ID: ${merchantId}`);
    console.log(`Order ID: ${order_id}`);
    console.log(`Amount: ${formattedAmount}`);
    console.log(`Currency: ${currency}`);
    
    // Hash the merchant secret first
    const hashedSecret = crypto.createHash('md5')
      .update(merchantSecret)
      .digest('hex')
      .toUpperCase();
    
    // Create the string to hash
    const stringToHash = merchantId + order_id + formattedAmount + currency + hashedSecret;
    
    // Generate the final hash
    const hash = crypto.createHash('md5')
      .update(stringToHash)
      .digest('hex')
      .toUpperCase();
    
    console.log(`Generated Hash: ${hash}`);
    
    // Return the hash and merchant ID
    return res.status(200).json({
      merchant_id: merchantId,
      hash
    });
  } catch (error) {
    console.error('Error generating hash:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to generate payment hash'
      }
    });
  }
};

/**
 * Handle PayHere payment notification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handlePaymentNotification = async (req, res) => {
  try {
    console.log('=== PayHere Notification Received ===');
    console.log('Notification Data:', req.body);
    
    // Extract data from the notification
    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig
    } = req.body;
    
    // Verify the merchant ID
    if (merchant_id !== merchantId) {
      console.error('Invalid merchant ID in notification');
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid merchant ID'
        }
      });
    }
    
    // Verify the hash signature
    const hashedSecret = crypto.createHash('md5')
      .update(merchantSecret)
      .digest('hex')
      .toUpperCase();
    
    const stringToHash = merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret;
    
    const calculatedHash = crypto.createHash('md5')
      .update(stringToHash)
      .digest('hex')
      .toUpperCase();
    
    if (calculatedHash !== md5sig) {
      console.error('Invalid hash signature in notification');
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid hash signature'
        }
      });
    }
    
    // Update the order status in the database
    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_id,
        status: status_code === '2' ? 'confirmed' : 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id)
      .select();
    
    if (error) {
      console.error('Error updating order:', error);
      return res.status(500).json({
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update order status'
        }
      });
    }
    
    console.log(`Order ${order_id} updated with payment ID ${payment_id} and status ${status_code}`);
    
    // Return success response
    return res.status(200).json({
      status: 'success',
      message: 'Payment notification processed successfully'
    });
  } catch (error) {
    console.error('Error processing payment notification:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to process payment notification'
      }
    });
  }
};

/**
 * Get payment status for an order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Get the order from the database
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, status, payment_id, payment_method, total, created_at, updated_at')
      .eq('id', orderId)
      .single();
    
    if (error) {
      console.error('Error fetching order:', error);
      return res.status(500).json({
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch order'
        }
      });
    }
    
    if (!order) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found'
        }
      });
    }
    
    // Return the payment status
    return res.status(200).json({
      order_id: order.id,
      status: order.status,
      payment_id: order.payment_id,
      payment_method: order.payment_method,
      total: order.total,
      created_at: order.created_at,
      updated_at: order.updated_at
    });
  } catch (error) {
    console.error('Error getting payment status:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to get payment status'
      }
    });
  }
};

/**
 * Manually verify a payment (admin function)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyPayment = async (req, res) => {
  try {
    const { order_id, payment_id } = req.body;
    
    // Update the order status in the database
    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_id,
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id)
      .select();
    
    if (error) {
      console.error('Error updating order:', error);
      return res.status(500).json({
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update order status'
        }
      });
    }
    
    console.log(`Order ${order_id} manually verified with payment ID ${payment_id}`);
    
    // Return success response
    return res.status(200).json({
      status: 'success',
      message: 'Payment verified successfully',
      order: data[0]
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to verify payment'
      }
    });
  }
};

module.exports = {
  generateHash,
  handlePaymentNotification,
  getPaymentStatus,
  verifyPayment
};
