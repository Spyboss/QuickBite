/**
 * Global error handling middleware
 */

/**
 * Not found middleware - handles 404 errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Error handler middleware - handles all errors
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Set status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }
  
  // Determine error code
  let errorCode = 'SERVER_ERROR';
  if (statusCode === 404) errorCode = 'NOT_FOUND';
  if (err.name === 'ValidationError') errorCode = 'VALIDATION_ERROR';
  if (err.name === 'UnauthorizedError') errorCode = 'AUTHENTICATION_ERROR';
  
  // Send error response
  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: err.message || 'An unexpected error occurred',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
};

module.exports = {
  notFound,
  errorHandler
};
