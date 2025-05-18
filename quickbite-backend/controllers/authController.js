/**
 * Authentication controller
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const register = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, phone }
    });
    
    if (authError) {
      console.error('Error creating user:', authError);
      return res.status(400).json({
        error: {
          code: 'REGISTRATION_ERROR',
          message: authError.message
        }
      });
    }
    
    // Return user data and token
    return res.status(201).json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata.name
      }
    });
  } catch (error) {
    console.error('Error in register:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred during registration'
      }
    });
  }
};

/**
 * Login a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Sign in user with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Error signing in:', error);
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Invalid email or password'
        }
      });
    }
    
    // Return user data and token
    return res.status(200).json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name
      },
      token: data.session.access_token
    });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred during login'
      }
    });
  }
};

/**
 * Logout a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logout = async (req, res) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'No token provided'
        }
      });
    }
    
    // Sign out user with Supabase Auth
    const { error } = await supabase.auth.admin.signOut(token);
    
    if (error) {
      console.error('Error signing out:', error);
      return res.status(500).json({
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred during logout'
        }
      });
    }
    
    // Return success message
    return res.status(200).json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Error in logout:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred during logout'
      }
    });
  }
};

/**
 * Get current user info
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCurrentUser = async (req, res) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication required'
        }
      });
    }
    
    // Get user from Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Error getting user:', error);
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Invalid or expired token'
        }
      });
    }
    
    // Return user data
    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name,
        phone: user.user_metadata?.phone,
        role: user.app_metadata?.role || 'user'
      }
    });
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while fetching user data'
      }
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser
};
