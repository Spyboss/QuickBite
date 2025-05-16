// Mock Firebase Admin SDK and Supabase before requiring the app
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
  messaging: () => ({
    send: jest.fn().mockResolvedValue('message-id'),
  }),
}));

// Create a chainable mock structure
const mockSupabaseFrom = jest.fn();

// Mock the supabaseClient module
jest.mock('../supabaseClient', () => ({
  supabase: {
    from: mockSupabaseFrom,
  },
}));

// Now require the app after mocking dependencies
const request = require('supertest');
const app = require('../index');


describe('QuickBite API Endpoints', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /menu', () => {
    it('should return a list of menu items', async () => {
      const mockMenuItems = [
        { id: 1, name: 'Test Burger', description: 'Tasty', price: 500 },
        { id: 2, name: 'Test Pizza', description: 'Delicious', price: 1200 },
      ];

      // Setup the mock to return our test data
      mockSupabaseFrom.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnValue({
          data: mockMenuItems,
          error: null
        })
      }));

      const response = await request(app).get('/menu');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockMenuItems);
      expect(mockSupabaseFrom).toHaveBeenCalledWith('menu');
    });

    it('should return 500 if there is a database error', async () => {
      // Setup the mock to return an error
      mockSupabaseFrom.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnValue({
          data: null,
          error: { message: 'DB Error' }
        })
      }));

      const response = await request(app).get('/menu');

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: 'Error fetching menu', details: 'DB Error' });
    });
  });

  describe('POST /orders', () => {
    it('should create a new order and return it', async () => {
      const newOrderPayload = {
        user_id: 'test-user-id',
        items: [{ id: 1, name: 'Test Burger', quantity: 2, price: 500 }],
        total: 1000,
        payment_method: 'cash',
        status: 'pending',
      };
      const mockCreatedOrder = { ...newOrderPayload, id: 123, created_at: new Date().toISOString() };

      // Setup the mock for the insert chain
      mockSupabaseFrom.mockImplementationOnce(() => ({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            data: [mockCreatedOrder],
            error: null
          })
        })
      }));

      const response = await request(app)
        .post('/orders')
        .send(newOrderPayload);

      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual(mockCreatedOrder);
      expect(mockSupabaseFrom).toHaveBeenCalledWith('orders');
    });

    it('should return 500 if there is a database error during order creation', async () => {
      const newOrderPayload = { user_id: 'test-user', items: [], total: 0, payment_method: 'cash' };

      // Setup the mock to return an error
      mockSupabaseFrom.mockImplementationOnce(() => ({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            data: null,
            error: { message: 'DB Insert Error' }
          })
        })
      }));

      const response = await request(app)
        .post('/orders')
        .send(newOrderPayload);

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: 'Error creating order', details: 'DB Insert Error' });
    });
  });

  // Basic test for the root endpoint
  describe('GET /', () => {
    it('should return a welcome message', async () => {
      const response = await request(app).get('/');
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('QuickBite Backend is running!');
    });
  });
});