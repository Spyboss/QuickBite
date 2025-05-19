/**
 * QuickBite Backend Server
 */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
// Use a different approach for swagger documentation
const fs = require('fs');
const path = require('path');

// Import middleware
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Import routes
const routes = require('./routes');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Parse the service account key from the environment variable
let serviceAccountKey;
try {
  serviceAccountKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

  // Fix the private key if it's escaped incorrectly
  if (serviceAccountKey && serviceAccountKey.private_key) {
    serviceAccountKey.private_key = serviceAccountKey.private_key.replace(/\\n/g, '\n');
  }

  // Initialize Firebase Admin SDK
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
  });
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  console.warn('Push notifications will not be available');
}

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT || 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.'
    }
  }
});
app.use(limiter);

// Swagger documentation setup - using static JSON file instead of swagger-jsdoc
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'QuickBite API',
    version: '1.0.0',
    description: 'API documentation for the QuickBite application backend.',
  },
  servers: [
    {
      url: `http://localhost:${port}`,
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [{
    bearerAuth: []
  }],
  paths: {} // We'll add paths manually or from route files
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount API routes
app.use('/api/v1', routes);

// Basic route for health check
app.get('/', (req, res) => {
  res.send('QuickBite Backend is running!');
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`QuickBite Backend running on port ${port}`);
  console.log(`API Documentation available at http://localhost:${port}/api-docs`);
});

module.exports = app; // Export for testing
