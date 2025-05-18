import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom';
// import React from 'react'; // Removed duplicate
import { BrowserRouter } from 'react-router-dom';
// import { AuthProvider } from '../../context/AuthContext'; // Not used when useCart is fully mocked
import { useCart } from '../../hooks/useCart'; // Import useCart hook
// import { CartProvider } from '../../context/CartContext'; // Not used when useCart is fully mocked
import type { CartContextType } from '../../context/CartContext'; // Type-only import for CartContextType
import Cart from './Cart';
import { supabase } from '../../supabaseClient'; // For AuthProvider dependency

// Mock supabase for AuthProvider
jest.mock('../../supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
  },
}));

// Mock useCart hook
jest.mock('../../hooks/useCart', () => ({
  ...jest.requireActual('../../hooks/useCart'), // Import and retain actual CartProvider
  useCart: jest.fn(),
}));

const mockUseCart = useCart as jest.Mock;

describe('Cart Component', () => {
  beforeEach(() => {
    // Reset mocks
    mockUseCart.mockClear();
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null }, error: null });
  });

  // renderCart function is not used, renderCartWithCustomHookState is preferred for these tests.
  // const renderCart = () => {
  //   return render(
  //     <BrowserRouter>
  //       <AuthProvider>
  //         <CartProvider>
  //           <Cart />
  //         </CartProvider>
  //       </AuthProvider>
  //     </BrowserRouter>
  //   );
  // };

  const renderCartWithCustomHookState = (cartState: CartContextType) => { // Typed cartState
    mockUseCart.mockReturnValue(cartState);
    return render(
      <BrowserRouter>
        {/*
          If Cart component itself relies on being wrapped by CartProvider to function
          (even if useCart is mocked), we might need to wrap it.
          However, since useCart is fully mocked, the provider's actual state isn't used by Cart directly.
          Let's assume this is fine. If not, we'd wrap with <CartProvider> here too.
        */}
        <Cart />
      </BrowserRouter>
    );
  }


  test('renders empty cart message', () => {
    const mockCartState = {
      cartItems: [],
      total: 0,
      removeItemFromCart: jest.fn(),
      addItemToCart: jest.fn(),
      updateItemQuantity: jest.fn(),
      clearCart: jest.fn(),
    };
    mockUseCart.mockReturnValue(mockCartState);
    renderCartWithCustomHookState(mockCartState);
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
  });

  test('renders cart items and total', () => {
    const mockItems = [
      { id: 1, name: 'Test Burger', price: 500, quantity: 2 },
      { id: 2, name: 'Test Pizza', price: 1200, quantity: 1 },
    ];
    const mockTotal = 2200;
    const mockCartState = {
      cartItems: mockItems,
      total: mockTotal,
      removeItemFromCart: jest.fn(),
      addItemToCart: jest.fn(),
      updateItemQuantity: jest.fn(),
      clearCart: jest.fn(),
    };
    mockUseCart.mockReturnValue(mockCartState);
    renderCartWithCustomHookState(mockCartState);

    expect(screen.getByText('Test Burger')).toBeInTheDocument();
    expect(screen.getByText('LKR 500.00 each')).toBeInTheDocument();
    expect(screen.getByText('Test Pizza')).toBeInTheDocument();
    expect(screen.getByText('LKR 1200.00 each')).toBeInTheDocument();
    expect(screen.getByText(`Total: LKR ${mockTotal.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /PROCEED TO CHECKOUT/i })).toBeInTheDocument();
  });

  test('calls removeItemFromCart when remove button is clicked', () => {
    const mockRemoveItem = jest.fn();
    const mockItems = [{ id: 1, name: 'Test Burger', price: 500, quantity: 1 }];
    const mockCartState = {
      cartItems: mockItems,
      total: 500,
      removeItemFromCart: mockRemoveItem,
      addItemToCart: jest.fn(),
      updateItemQuantity: jest.fn(),
      clearCart: jest.fn(),
    };
    mockUseCart.mockReturnValue(mockCartState);
    renderCartWithCustomHookState(mockCartState);

    const removeButtons = screen.getAllByRole('button', { name: /delete/i }); // MUI IconButton for delete
    fireEvent.click(removeButtons[0]);
    expect(mockRemoveItem).toHaveBeenCalledWith(1);
  });

  test('calls updateItemQuantity when quantity buttons are clicked', () => {
    const mockUpdateQuantity = jest.fn();
    const mockItems = [{ id: 1, name: 'Test Burger', price: 500, quantity: 2 }];
    const mockCartState = {
      cartItems: mockItems,
      total: 1000,
      removeItemFromCart: jest.fn(),
      addItemToCart: jest.fn(),
      updateItemQuantity: mockUpdateQuantity,
      clearCart: jest.fn(),
    };
    mockUseCart.mockReturnValue(mockCartState);
    renderCartWithCustomHookState(mockCartState);

    // Test increase quantity
    const increaseButton = screen.getByRole('button', { name: /increase quantity/i });
    fireEvent.click(increaseButton);
    expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 3);

    // Test decrease quantity
    const decreaseButton = screen.getByRole('button', { name: /decrease quantity/i });
    fireEvent.click(decreaseButton);
    expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 1);
  });
});