/**
 * Payment routes
 */
const express = require('express');
const router = express.Router();

// Import controllers
// Note: These controllers will be created later
const paymentController = require('../controllers/paymentController');

// Import middleware
const { validateRequest } = require('../middleware/validation');
const { isAuthenticated } = require('../middleware/auth');

/**
 * @route POST /payments/generate-hash
 * @desc Generate a hash for PayHere payment
 * @access Public (but should be rate-limited)
 */
router.post('/generate-hash', validateRequest, paymentController.generateHash);

/**
 * @route POST /payments/notify
 * @desc Webhook endpoint for PayHere payment notifications
 * @access Public (but verified using hash)
 */
router.post('/notify', paymentController.handlePaymentNotification);

/**
 * @route GET /payments/:orderId
 * @desc Get payment status for an order
 * @access Private
 */
router.get('/:orderId', isAuthenticated, paymentController.getPaymentStatus);

/**
 * @route POST /payments/verify
 * @desc Manually verify a payment (admin function)
 * @access Private (Admin only)
 */
router.post('/verify', isAuthenticated, validateRequest, paymentController.verifyPayment);

module.exports = router;
