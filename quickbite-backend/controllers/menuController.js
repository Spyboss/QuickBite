/**
 * Menu controller
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get all menu items
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllItems = async (req, res) => {
  try {
    // Get query parameters
    const { category, search } = req.query;
    
    // Build query
    let query = supabase.from('menu').select('*');
    
    // Apply filters if provided
    if (category) {
      query = query.eq('category', category);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    // Execute query
    const { data, error } = await query.order('category', { ascending: true });
    
    if (error) {
      console.error('Error fetching menu items:', error);
      return res.status(500).json({
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch menu items'
        }
      });
    }
    
    // Return menu items
    return res.status(200).json({
      items: data
    });
  } catch (error) {
    console.error('Error in getAllItems:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while fetching menu items'
      }
    });
  }
};

/**
 * Get a menu item by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get menu item from database
    const { data, error } = await supabase
      .from('menu')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching menu item:', error);
      return res.status(500).json({
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch menu item'
        }
      });
    }
    
    if (!data) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Menu item not found'
        }
      });
    }
    
    // Return menu item
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in getItemById:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while fetching menu item'
      }
    });
  }
};

/**
 * Create a new menu item
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createItem = async (req, res) => {
  try {
    const { name, description, price, category, image_url } = req.body;
    
    // Create menu item in database
    const { data, error } = await supabase
      .from('menu')
      .insert([
        {
          name,
          description,
          price,
          category,
          image_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (error) {
      console.error('Error creating menu item:', error);
      return res.status(500).json({
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to create menu item'
        }
      });
    }
    
    // Return created menu item
    return res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error in createItem:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while creating menu item'
      }
    });
  }
};

/**
 * Update a menu item
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image_url } = req.body;
    
    // Update menu item in database
    const { data, error } = await supabase
      .from('menu')
      .update({
        name,
        description,
        price,
        category,
        image_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating menu item:', error);
      return res.status(500).json({
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update menu item'
        }
      });
    }
    
    if (data.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Menu item not found'
        }
      });
    }
    
    // Return updated menu item
    return res.status(200).json(data[0]);
  } catch (error) {
    console.error('Error in updateItem:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while updating menu item'
      }
    });
  }
};

/**
 * Delete a menu item
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete menu item from database
    const { error } = await supabase
      .from('menu')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting menu item:', error);
      return res.status(500).json({
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to delete menu item'
        }
      });
    }
    
    // Return success message
    return res.status(200).json({
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteItem:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while deleting menu item'
      }
    });
  }
};

/**
 * Get all menu categories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCategories = async (req, res) => {
  try {
    // Get distinct categories from database
    const { data, error } = await supabase
      .from('menu')
      .select('category')
      .order('category', { ascending: true });
    
    if (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch categories'
        }
      });
    }
    
    // Extract unique categories
    const categories = [...new Set(data.map(item => item.category))];
    
    // Return categories
    return res.status(200).json({
      categories
    });
  } catch (error) {
    console.error('Error in getCategories:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while fetching categories'
      }
    });
  }
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getCategories
};
