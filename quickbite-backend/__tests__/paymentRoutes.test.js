const request = require('supertest');
const express = require('express');
const paymentRoutes = require('../routes/paymentRoutes');
const paymentController = require('../controllers/paymentController');

// Mock the payment controller
jest.mock('../controllers/paymentController', () => ({
  generatePaymentHash: jest.fn((req, res) => {
    res.json({ hash: 'mock-hash-value' });
  }),
  handlePaymentNotification: jest.fn((req, res) => {
    res.status(200).send('Payment notification received');
  }),
  getPaymentStatus: jest.fn((req, res) => {
    res.json({ status: 'success', data: { status: 'completed' } });
  }),
  verifyPayment: jest.fn((req, res) => {
    res.json({ status: 'success', message: 'Payment verified' });
  })
}));

// Mock the authentication middleware
jest.mock('../middleware/auth', () => ({
  isAuthenticated: (req, res, next) => next(),
  isAdmin: (req, res, next) => next()
}));

// Mock the validation middleware
jest.mock('../middleware/validation', () => ({
  validateRequest: (req, res, next) => next()
}));

// Create a test app
const app = express();
app.use(express.json());
app.use('/payments', paymentRoutes);

describe('Payment Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /payments/generate-hash', () => {
    it('should generate a payment hash', async () => {
      const response = await request(app)
        .post('/payments/generate-hash')
        .send({
          order_id: '123',
          amount: '1000.00',
          currency: 'LKR'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('hash', 'mock-hash-value');
      expect(paymentController.generatePaymentHash).toHaveBeenCalled();
    });
  });

  describe('POST /payments/notify', () => {
    it('should handle payment notifications', async () => {
      const response = await request(app)
        .post('/payments/notify')
        .send({
          merchant_id: '1230461',
          order_id: '123',
          payment_id: 'pay_123',
          payhere_amount: '1000.00',
          payhere_currency: 'LKR',
          status_code: '2',
          md5sig: 'mock-signature'
        });

      expect(response.status).toBe(200);
      expect(response.text).toBe('Payment notification received');
      expect(paymentController.handlePaymentNotification).toHaveBeenCalled();
    });
  });

  describe('GET /payments/:orderId', () => {
    it('should get payment status for an order', async () => {
      const response = await request(app)
        .get('/payments/123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('status', 'completed');
      expect(paymentController.getPaymentStatus).toHaveBeenCalled();
    });
  });

  describe('POST /payments/verify', () => {
    it('should verify a payment', async () => {
      const response = await request(app)
        .post('/payments/verify')
        .send({
          order_id: '123',
          payment_id: 'pay_123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'Payment verified');
      expect(paymentController.verifyPayment).toHaveBeenCalled();
    });
  });
});
