import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PasswordResetFormData, PasswordResetRequestFormData } from '../types';

/**
 * Password reset component
 * Handles both requesting a password reset and resetting the password
 */
const PasswordReset: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { requestPasswordReset, resetPassword, isLoading, error } = useAuth();
  
  const [requestForm, setRequestForm] = useState<PasswordResetRequestFormData>({
    email: ''
  });
  
  const [resetForm, setResetForm] = useState<PasswordResetFormData>({
    token: token || '',
    password: '',
    confirmPassword: ''
  });
  
  const [success, setSuccess] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleRequestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequestForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setValidationError(null);
    setSuccess(null);
  };

  const handleResetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResetForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setValidationError(null);
    setSuccess(null);
  };

  const validateResetForm = (): boolean => {
    if (resetForm.password !== resetForm.confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }
    
    if (resetForm.password.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return false;
    }
    
    return true;
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccess(null);
    
    const success = await requestPasswordReset(requestForm);
    if (success) {
      setSuccess('Password reset email has been sent. Please check your inbox.');
      setRequestForm({ email: '' });
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccess(null);
    
    if (!validateResetForm()) {
      return;
    }
    
    const success = await resetPassword(resetForm);
    if (success) {
      setSuccess('Your password has been reset successfully. You can now login with your new password.');
      setResetForm({ token: '', password: '', confirmPassword: '' });
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow-md p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {token ? 'Reset Your Password' : 'Forgot Password'}
        </h1>
        <p className="mt-2 text-gray-600">
          {token 
            ? 'Enter your new password below' 
            : 'Enter your email and we will send you a password reset link'}
        </p>
      </div>
      
      {(error || validationError) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {validationError || error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {token ? (
        // Reset password form
        <form onSubmit={handleResetSubmit} className="space-y-6">
          <input 
            type="hidden" 
            name="token" 
            value={resetForm.token} 
          />
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={resetForm.password}
              onChange={handleResetChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isLoading}
            />
            <p className="mt-1 text-sm text-gray-500">
              Must be at least 8 characters
            </p>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={resetForm.confirmPassword}
              onChange={handleResetChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </div>
        </form>
      ) : (
        // Password reset request form
        <form onSubmit={handleRequestSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={requestForm.email}
              onChange={handleRequestChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Sending Email...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
      )}
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Remembered your password?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default PasswordReset; 