/**
 * Order routes
 */
const express = require('express');
const router = express.Router();

// Import controllers
// Note: These controllers will be created later
const orderController = require('../controllers/orderController');

// Import middleware
const { validateRequest } = require('../middleware/validation');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

/**
 * @route POST /orders
 * @desc Create a new order
 * @access Public (for guest checkout) or Private (for authenticated users)
 */
router.post('/', validateRequest, orderController.createOrder);

/**
 * @route GET /orders
 * @desc Get all orders for the authenticated user
 * @access Private
 */
router.get('/', isAuthenticated, orderController.getUserOrders);

/**
 * @route GET /orders/:id
 * @desc Get an order by ID
 * @access Private (user can only access their own orders)
 */
router.get('/:id', isAuthenticated, orderController.getOrderById);

/**
 * @route PATCH /orders/:id/status
 * @desc Update an order's status
 * @access Private (Admin only)
 */
router.patch('/:id/status', isAuthenticated, isAdmin, validateRequest, orderController.updateOrderStatus);

/**
 * @route GET /orders/admin/all
 * @desc Get all orders (admin only)
 * @access Private (Admin only)
 */
router.get('/admin/all', isAuthenticated, isAdmin, orderController.getAllOrders);

module.exports = router;
