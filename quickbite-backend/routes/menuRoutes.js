/**
 * Menu routes
 */
const express = require('express');
const router = express.Router();

// Import controllers
// Note: These controllers will be created later
const menuController = require('../controllers/menuController');

// Import middleware
const { validateRequest } = require('../middleware/validation');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

/**
 * @route GET /menu
 * @desc Get all menu items
 * @access Public
 */
router.get('/', menuController.getAllItems);

/**
 * @route GET /menu/:id
 * @desc Get a menu item by ID
 * @access Public
 */
router.get('/:id', menuController.getItemById);

/**
 * @route POST /menu
 * @desc Create a new menu item
 * @access Private (Admin only)
 */
router.post('/', isAuthenticated, isAdmin, validateRequest, menuController.createItem);

/**
 * @route PUT /menu/:id
 * @desc Update a menu item
 * @access Private (Admin only)
 */
router.put('/:id', isAuthenticated, isAdmin, validateRequest, menuController.updateItem);

/**
 * @route DELETE /menu/:id
 * @desc Delete a menu item
 * @access Private (Admin only)
 */
router.delete('/:id', isAuthenticated, isAdmin, menuController.deleteItem);

/**
 * @route GET /menu/categories
 * @desc Get all menu categories
 * @access Public
 */
router.get('/categories', menuController.getCategories);

module.exports = router;
