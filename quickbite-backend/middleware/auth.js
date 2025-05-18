/**
 * Authentication middleware
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Middleware to check if user is authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isAuthenticated = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication required. Please log in.'
        }
      });
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ 
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Invalid or expired token. Please log in again.'
        }
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      error: {
        code: 'SERVER_ERROR',
        message: 'Server error during authentication.'
      }
    });
  }
};

/**
 * Middleware to check if user is an admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isAdmin = async (req, res, next) => {
  try {
    // Check if user exists in request (should be added by isAuthenticated middleware)
    if (!req.user) {
      return res.status(401).json({ 
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication required. Please log in.'
        }
      });
    }

    // Check if user has admin role
    // This assumes you have a custom claim or metadata field for role
    const isUserAdmin = req.user.app_metadata?.role === 'admin';
    
    if (!isUserAdmin) {
      return res.status(403).json({ 
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Admin access required for this operation.'
        }
      });
    }

    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    return res.status(500).json({ 
      error: {
        code: 'SERVER_ERROR',
        message: 'Server error during authorization.'
      }
    });
  }
};

module.exports = {
  isAuthenticated,
  isAdmin
};
