import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppRouter from './router';
import { AuthProvider } from './features/auth/context/AuthContext';

/**
 * Main Application Component
 */
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRouter />
      <ToastContainer position="bottom-right" />
    </AuthProvider>
  );
};

export default App;
