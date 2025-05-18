/**
 * Notification controller
 */
const admin = require('firebase-admin');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Register a FCM token for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const registerToken = async (req, res) => {
  try {
    const { token } = req.body;
    const user_id = req.user.id;
    
    // Check if Firebase Admin SDK is initialized
    if (!admin.apps.length) {
      return res.status(500).json({
        error: {
          code: 'SERVER_ERROR',
          message: 'Firebase Admin SDK not initialized'
        }
      });
    }
    
    // Store token in database
    const { data, error } = await supabase
      .from('fcm_tokens')
      .upsert([
        {
          user_id,
          token,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (error) {
      console.error('Error registering FCM token:', error);
      return res.status(500).json({
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to register FCM token'
        }
      });
    }
    
    // Return success message
    return res.status(200).json({
      message: 'Token registered successfully'
    });
  } catch (error) {
    console.error('Error in registerToken:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while registering token'
      }
    });
  }
};

/**
 * Unregister a FCM token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const unregisterToken = async (req, res) => {
  try {
    const { token } = req.body;
    const user_id = req.user.id;
    
    // Delete token from database
    const { error } = await supabase
      .from('fcm_tokens')
      .delete()
      .eq('user_id', user_id)
      .eq('token', token);
    
    if (error) {
      console.error('Error unregistering FCM token:', error);
      return res.status(500).json({
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to unregister FCM token'
        }
      });
    }
    
    // Return success message
    return res.status(200).json({
      message: 'Token unregistered successfully'
    });
  } catch (error) {
    console.error('Error in unregisterToken:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while unregistering token'
      }
    });
  }
};

/**
 * Send a test notification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendTestNotification = async (req, res) => {
  try {
    const { title, body, token } = req.body;
    
    // Check if Firebase Admin SDK is initialized
    if (!admin.apps.length) {
      return res.status(500).json({
        error: {
          code: 'SERVER_ERROR',
          message: 'Firebase Admin SDK not initialized'
        }
      });
    }
    
    // Create notification message
    const message = {
      notification: {
        title,
        body
      },
      token
    };
    
    // Send notification
    const response = await admin.messaging().send(message);
    
    // Return success message
    return res.status(200).json({
      message: 'Notification sent successfully',
      response
    });
  } catch (error) {
    console.error('Error in sendTestNotification:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while sending notification'
      }
    });
  }
};

module.exports = {
  registerToken,
  unregisterToken,
  sendTestNotification
};
