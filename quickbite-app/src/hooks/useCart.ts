import { useContext } from 'react';
import { CartContext } from '../context/CartContext'; // Assuming CartContext is exported
import type { CartContextType } from '../context/CartContext'; // Assuming CartContextType is exported

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};