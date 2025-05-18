/**
 * Notification routes
 */
const express = require('express');
const router = express.Router();

// Import controllers
// Note: These controllers will be created later
const notificationController = require('../controllers/notificationController');

// Import middleware
const { validateRequest } = require('../middleware/validation');
const { isAuthenticated } = require('../middleware/auth');

/**
 * @route POST /notifications/register-token
 * @desc Register a FCM token for a user
 * @access Private
 */
router.post('/register-token', isAuthenticated, validateRequest, notificationController.registerToken);

/**
 * @route DELETE /notifications/unregister-token
 * @desc Unregister a FCM token
 * @access Private
 */
router.delete('/unregister-token', isAuthenticated, validateRequest, notificationController.unregisterToken);

/**
 * @route POST /notifications/send
 * @desc Send a test notification (development only)
 * @access Private (Admin only)
 */
router.post('/send', isAuthenticated, validateRequest, notificationController.sendTestNotification);

module.exports = router;
