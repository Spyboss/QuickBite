/**
 * Authentication routes
 */
const express = require('express');
const router = express.Router();

// Import controllers
// Note: These controllers will be created later
const authController = require('../controllers/authController');

// Import middleware
const { validateRequest } = require('../middleware/validation');

/**
 * @route POST /auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', validateRequest, authController.register);

/**
 * @route POST /auth/login
 * @desc Login a user
 * @access Public
 */
router.post('/login', validateRequest, authController.login);

/**
 * @route POST /auth/logout
 * @desc Logout a user
 * @access Private
 */
router.post('/logout', authController.logout);

/**
 * @route GET /auth/me
 * @desc Get current user info
 * @access Private
 */
router.get('/me', authController.getCurrentUser);

module.exports = router;
