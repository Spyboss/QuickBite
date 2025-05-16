const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const crypto = require('crypto'); // For MD5 hashing
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { supabase } = require('./supabaseClient'); // Import Supabase client from separate file

dotenv.config();

// Parse the service account key from the environment variable
const serviceAccountKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

// Fix the private key if it's escaped incorrectly
if (serviceAccountKey && serviceAccountKey.private_key) {
  // Replace escaped newlines with actual newlines if needed
  serviceAccountKey.private_key = serviceAccountKey.private_key.replace(/\\n/g, '\n');
}

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

// Supabase client is now imported from supabaseClient.js

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Swagger Definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'QuickBite API',
      version: '1.0.0',
      description: 'API documentation for the QuickBite application backend.',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./index.js'], // Path to the API docs (this file)
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Basic route
/**
 * @swagger
 * /:
 *   get:
 *     summary: Basic health check endpoint
 *     description: Returns a simple message indicating the backend is running.
 *     responses:
 *       200:
 *         description: Backend is running
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: QuickBite Backend is running!
 */
app.get('/', (req, res) => {
  res.send('QuickBite Backend is running!');
});

// API endpoint to send push notifications
/**
 * @swagger
 * /send-notification:
 *   post:
 *     summary: Send a push notification
 *     description: Sends a push notification to a specific FCM token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The FCM registration token of the target device.
 *                 example: "cXV...GZQ"
 *               title:
 *                 type: string
 *                 description: The title of the notification.
 *                 example: "Order Update"
 *               body:
 *                 type: string
 *                 description: The body/message of the notification.
 *                 example: "Your order is ready for pickup!"
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 messageId:
 *                   type: string
 *                   example: "projects/quickbite-adfa4/messages/0:168..."
 *       400:
 *         description: Missing token, title, or body
 *       500:
 *         description: Error sending notification
 */
app.post('/send-notification', async (req, res) => {
  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ error: 'Missing token, title, or body' });
  }

  const message = {
    token: token,
    notification: {
      title: title,
      body: body,
    },
    // Optional: Add data payload for custom handling in the client
    // data: {
    //   orderId: '123',
    // },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    res.status(200).json({ success: true, messageId: response });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Error sending notification', details: error.message });
  }
});

// API endpoint to get menu items
/**
 * @swagger
 * /menu:
 *   get:
 *     summary: Retrieve the menu
 *     description: Fetches all items available on the menu from the database.
 *     responses:
 *       200:
 *         description: A list of menu items.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Classic Burger"
 *                   description:
 *                     type: string
 *                     example: "A delicious classic beef burger."
 *                   price:
 *                     type: number
 *                     format: float
 *                     example: 550.00
 *                   image_url:
 *                     type: string
 *                     nullable: true
 *                     example: "https://example.com/burger.jpg"
 *       500:
 *         description: Error fetching menu
 */
app.get('/menu', async (req, res) => {
  try {
    const { data, error } = await supabase.from('menu').select('*');
    if (error) {
      throw error;
    }
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Error fetching menu', details: error.message });
  }
});

// API endpoint to create a new order
/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     description: Saves a new order to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 nullable: true
 *                 description: UUID of the registered user, or null for guest.
 *                 example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer # or string, depending on menu item ID type
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Classic Burger"
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *                     price:
 *                       type: number
 *                       format: float
 *                       example: 550.00
 *                 description: Array of items in the order.
 *               total:
 *                 type: number
 *                 format: float
 *                 example: 1100.00
 *               payment_method:
 *                 type: string
 *                 enum: [cash, payhere]
 *                 example: "cash"
 *               status:
 *                 type: string
 *                 description: Initial status of the order (e.g., pending, pending_payment).
 *                 example: "pending"
 *               customer_name:
 *                 type: string
 *                 nullable: true
 *                 example: "John Doe"
 *               customer_phone:
 *                 type: string
 *                 nullable: true
 *                 example: "0771234567"
 *     responses:
 *       201:
 *         description: Order created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               # Define the response schema for a created order (similar to request but with id, created_at etc.)
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer # or string, depending on your DB schema for order ID
 *                   example: 101
 *                 # ... include other fields from the order table
 *       500:
 *         description: Error creating order
 */
app.post('/orders', async (req, res) => {
  const orderData = req.body;
  try {
    const { data, error } = await supabase.from('orders').insert([orderData]).select();
    if (error) {
      throw error;
    }
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Error creating order', details: error.message });
  }
});

// API endpoint to get orders
/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Retrieve all orders
 *     description: Fetches all orders from the database, ordered by creation date.
 *     responses:
 *       200:
 *         description: A list of orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Error fetching orders
 */
app.get('/orders', async (req, res) => {
  try {
    // For now, fetching all orders. Filtering by user_id can be added later if needed.
    // This endpoint should be protected in a real application.
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) {
      throw error;
    }
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Error fetching orders', details: error.message });
  }
});


// API endpoint to handle PayHere webhooks
/**
 * @swagger
 * /payhere-notify:
 *   post:
 *     summary: PayHere payment notification webhook
 *     description: Endpoint for PayHere to send payment status updates.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded: # PayHere sends data as form-urlencoded
 *           schema:
 *             type: object
 *             properties:
 *               merchant_id:
 *                 type: string
 *               order_id:
 *                 type: string # Order ID from your system
 *               payment_id:
 *                 type: string # PayHere's payment ID
 *               payhere_amount:
 *                 type: string # Amount in LKR
 *               payhere_currency:
 *                 type: string # Currency (LKR)
 *               status_code:
 *                 type: string # PayHere status code (2=success, 0=pending, -1=canceled, -2=failed)
 *               md5sig:
 *                 type: string # MD5 signature for verification
 *               # ... other fields PayHere might send
 *     responses:
 *       200:
 *         description: Webhook received and processed (or status unchanged).
 *       400:
 *         description: Missing required data in webhook payload.
 *       401:
 *         description: Webhook verification failed (invalid signature).
 *       404:
 *         description: Order not found.
 *       500:
 *         description: Internal server error during webhook processing.
 */
app.post('/payhere-notify', async (req, res) => {
  // PayHere sends data as x-www-form-urlencoded, Express's express.json() might not parse it.
  // If issues, ensure express.urlencoded({ extended: true }) is also used: app.use(express.urlencoded({ extended: true }));
  // For now, assuming req.body is populated correctly.
  const {
    merchant_id,
    order_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig, // The signature sent by PayHere
    // ... other fields sent by PayHere (method, status_message, card_holder_name, etc.)
  } = req.body;

  console.log('Received PayHere webhook for order_id:', order_id, 'status_code:', status_code);
  console.log('Full payload:', req.body);


  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

  if (!merchantSecret) {
    console.error('PAYHERE_MERCHANT_SECRET is not set in environment variables.');
    return res.status(500).send('Webhook processing configuration error.');
  }

  // Construct the string for MD5 signature verification
  // According to PayHere docs:
  // strtoupper(md5( merchant_id + order_id + payhere_amount + payhere_currency + status_code + strtoupper(md5(merchant_secret)) ))
  const secretHash = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
  const stringToHash =
    merchant_id +
    order_id +
    payhere_amount +
    payhere_currency +
    status_code +
    secretHash;

  const generatedSignature = crypto.createHash('md5').update(stringToHash).digest('hex').toUpperCase();

  if (generatedSignature !== md5sig) {
    console.warn('PayHere webhook verification failed: Invalid signature.');
    console.warn(`Received md5sig: ${md5sig}`);
    console.warn(`Generated md5sig: ${generatedSignature}`);
    console.warn(`String hashed: ${stringToHash.replace(secretHash, 'SECRET_HASH_HERE')}`); // Avoid logging the actual secret hash directly
    return res.status(401).send('Webhook verification failed: Invalid signature.');
  }

  console.log('PayHere webhook signature verified successfully for order_id:', order_id);

  let newOrderStatus;
  switch (status_code) {
    case '2': // Payment successful
      newOrderStatus = 'paid';
      break;
    case '0': // Payment pending
      newOrderStatus = 'pending_payment'; // Or keep as 'pending' if that's your initial state
      break;
    case '-1': // Payment canceled
      newOrderStatus = 'cancelled';
      break;
    case '-2': // Payment failed
      newOrderStatus = 'failed';
      break;
    case '-3': // Chargedback
      newOrderStatus = 'charged_back'; // You might need to add this status
      break;
    default:
      console.warn(`Unknown PayHere status_code: ${status_code} for order_id: ${order_id}`);
      // Optionally, do not update status or set to a generic 'unknown_payment_status'
      return res.status(200).send('Webhook received, but status_code not processed.');
  }

  if (!newOrderStatus) {
    console.log(`No status update for order_id: ${order_id} with status_code: ${status_code}`);
    return res.status(200).send('Webhook received, status unchanged.');
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: newOrderStatus, payment_id: req.body.payment_id || null }) // Store PayHere payment_id if available
      .eq('id', order_id)
      .select();

    if (error) {
      console.error(`Error updating order ${order_id} in Supabase:`, error);
      throw error; // Let global error handler catch or handle specifically
    }

    if (data && data.length > 0) {
      console.log(`Order ${order_id} status successfully updated to ${newOrderStatus} in Supabase.`);
      // TODO: If newOrderStatus is 'paid', you might trigger other actions like sending an order confirmation email/notification.
      // If newOrderStatus is 'paid' and the order was for a digital good, grant access, etc.
      // If newOrderStatus is 'paid', and status was 'ready', you might send a "Payment Confirmed, Order Ready" notification.
      res.status(200).send('Webhook received and processed successfully.');
    } else {
      console.warn(`Order ${order_id} not found in Supabase during webhook processing.`);
      res.status(404).send('Order not found.');
    }
  } catch (dbError) {
    console.error('Database error processing PayHere webhook for order_id:', order_id, dbError);
    res.status(500).send('Error processing webhook due to database issue.');
  }
});


app.listen(port, () => {
  console.log(`QuickBite backend listening at http://localhost:${port}`);
});

// Export the app for testing
module.exports = app;
