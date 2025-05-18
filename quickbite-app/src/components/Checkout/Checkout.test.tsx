import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Checkout from './Checkout';
import { CartProvider } from '../../context/CartContext';
import { AuthProvider } from '../../context/AuthContext';
import * as payhereService from '../../services/payhereService';

// Mock the payhereService
vi.mock('../../services/payhereService', () => ({
  initiatePayment: vi.fn(),
  generatePaymentHash: vi.fn().mockResolvedValue('mock-hash'),
  MERCHANT_ID: '1230461',
  API_BASE_URL: 'http://localhost:3001',
  default: {
    initiatePayment: vi.fn(),
    generatePaymentHash: vi.fn().mockResolvedValue('mock-hash'),
    MERCHANT_ID: '1230461',
    API_BASE_URL: 'http://localhost:3001',
  }
}));

// Mock the supabase client
vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 123, status: 'pending' },
            error: null
          })
        })
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: { id: 123, status: 'processing' },
          error: null
        })
      })
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: null
      })
    }
  }
}));

// Mock the useCart hook
vi.mock('../../hooks/useCart', () => ({
  useCart: () => ({
    cartItems: [
      { id: 1, name: 'Burger', price: 500, quantity: 2 },
      { id: 2, name: 'Fries', price: 200, quantity: 1 }
    ],
    total: 1200,
    clearCart: vi.fn()
  })
}));

// Mock the useAuth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false
  })
}));

describe('Checkout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders checkout form correctly', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Checkout />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    // Check if the component renders correctly
    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getByText('Burger')).toBeInTheDocument();
    expect(screen.getByText('Fries')).toBeInTheDocument();
    expect(screen.getByText('Payment Method')).toBeInTheDocument();
    expect(screen.getByLabelText('Cash on Pickup')).toBeInTheDocument();
    expect(screen.getByLabelText('PayHere (Online Payment)')).toBeInTheDocument();
  });

  test('allows guest checkout with name and phone', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Checkout />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    // Fill in guest checkout details
    fireEvent.change(screen.getByLabelText('Your Name'), {
      target: { value: 'John Doe' }
    });
    
    fireEvent.change(screen.getByLabelText('Phone Number'), {
      target: { value: '0771234567' }
    });

    // Select cash on pickup
    fireEvent.click(screen.getByLabelText('Cash on Pickup'));

    // Place order
    fireEvent.click(screen.getByText('Place Order'));

    // Wait for order confirmation
    await waitFor(() => {
      expect(screen.getByText('Order Confirmed')).toBeInTheDocument();
    });
  });

  test('initiates PayHere payment when selected', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Checkout />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    // Fill in guest checkout details
    fireEvent.change(screen.getByLabelText('Your Name'), {
      target: { value: 'John Doe' }
    });
    
    fireEvent.change(screen.getByLabelText('Phone Number'), {
      target: { value: '0771234567' }
    });

    // Select PayHere
    fireEvent.click(screen.getByLabelText('PayHere (Online Payment)'));

    // Place order
    fireEvent.click(screen.getByText('Place Order'));

    // Wait for PayHere payment to be initiated
    await waitFor(() => {
      expect(payhereService.default.initiatePayment).toHaveBeenCalled();
    });
  });
});
