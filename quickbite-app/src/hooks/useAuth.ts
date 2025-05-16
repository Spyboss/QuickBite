import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Assuming AuthContext is exported from AuthContext.tsx
import type { AuthContextType } from '../context/AuthContext'; // Assuming AuthContextType is exported

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};