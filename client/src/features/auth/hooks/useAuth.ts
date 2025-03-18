import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AuthContextState } from '../types';

/**
 * Hook for accessing authentication context
 */
export const useAuth = (): AuthContextState => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 