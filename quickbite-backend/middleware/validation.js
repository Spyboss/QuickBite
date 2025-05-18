/**
 * Request validation middleware
 */

/**
 * Middleware to validate request data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateRequest = (req, res, next) => {
  // Simple validation for now
  if (!req.body) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request body is required',
        details: { body: 'Request body is required' }
      }
    });
  }

  next();
};

/**
 * Validation rules for user registration
 */
const registerValidation = [];

/**
 * Validation rules for user login
 */
const loginValidation = [];

/**
 * Validation rules for creating a menu item
 */
const menuItemValidation = [];

/**
 * Validation rules for creating an order
 */
const orderValidation = [];

/**
 * Validation rules for updating order status
 */
const orderStatusValidation = [];

/**
 * Validation rules for generating payment hash
 */
const paymentHashValidation = [];

/**
 * Validation rules for FCM token registration
 */
const fcmTokenValidation = [];

module.exports = {
  validateRequest,
  registerValidation,
  loginValidation,
  menuItemValidation,
  orderValidation,
  orderStatusValidation,
  paymentHashValidation,
  fcmTokenValidation
};
