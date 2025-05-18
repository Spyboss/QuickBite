/**
 * Order controller
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Create a new order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createOrder = async (req, res) => {
  try {
    const { items, total, customer_name, customer_phone, payment_method } = req.body;
    
    // Get user ID if authenticated
    let user_id = null;
    if (req.user) {
      user_id = req.user.id;
    }
    
    // Create order in database
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          items,
          total,
          status: 'pending',
          customer_name,
          customer_phone,
          payment_method,
          user_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (error) {
      console.error('Error creating order:', error);
      return res.status(500).json({
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to create order'
        }
      });
    }
    
    // Return created order
    return res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error in createOrder:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while creating order'
      }
    });
  }
};

/**
 * Get all orders for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserOrders = async (req, res) => {
  try {
    // Get user ID from authenticated user
    const user_id = req.user.id;
    
    // Get orders from database
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user orders:', error);
      return res.status(500).json({
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch orders'
        }
      });
    }
    
    // Return orders
    return res.status(200).json({
      orders: data
    });
  } catch (error) {
    console.error('Error in getUserOrders:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while fetching orders'
      }
    });
  }
};

/**
 * Get an order by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get order from database
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
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
    
    if (!data) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found'
        }
      });
    }
    
    // Check if user is authorized to view this order
    if (data.user_id && data.user_id !== req.user.id && req.user.app_metadata?.role !== 'admin') {
      return res.status(403).json({
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'You are not authorized to view this order'
        }
      });
    }
    
    // Return order
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in getOrderById:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while fetching order'
      }
    });
  }
};

/**
 * Update an order's status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Update order status in database
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating order status:', error);
      return res.status(500).json({
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update order status'
        }
      });
    }
    
    if (data.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found'
        }
      });
    }
    
    // Return updated order
    return res.status(200).json({
      id: data[0].id,
      status: data[0].status,
      updated_at: data[0].updated_at
    });
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while updating order status'
      }
    });
  }
};

/**
 * Get all orders (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllOrders = async (req, res) => {
  try {
    // Get query parameters for pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    // Get orders from database with pagination
    const { data, error, count } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) {
      console.error('Error fetching all orders:', error);
      return res.status(500).json({
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch orders'
        }
      });
    }
    
    // Return orders with pagination metadata
    return res.status(200).json({
      orders: data,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while fetching orders'
      }
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders
};
