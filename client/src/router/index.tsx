import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Pages
import HomePage from '../pages/HomePage';
import Dashboard from '../pages/Dashboard';
import NotFoundPage from '../pages/NotFoundPage';
import ChurchListPage from '../pages/ChurchListPage';
import ChurchDetailsPage from '../pages/ChurchDetailsPage';
import ChurchEditPage from '../pages/ChurchEditPage';
import ChurchCreatePage from '../pages/ChurchCreatePage';
import ChurchMembersPage from '../pages/ChurchMembersPage';

// Auth components
import { LoginForm, RegisterForm, PasswordReset } from '../features/auth';
import ProtectedRoute from './ProtectedRoute';

/**
 * Application Router
 */
const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes with MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* Auth routes with AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/reset-password" element={<PasswordReset />} />
        </Route>
        
        {/* Protected routes with MainLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/churches" element={<ChurchListPage />} />
            <Route path="/churches/new" element={<ChurchCreatePage />} />
            <Route path="/churches/:churchId" element={<ChurchDetailsPage />} />
            <Route path="/churches/:churchId/edit" element={<ChurchEditPage />} />
            <Route path="/churches/:churchId/members" element={<ChurchMembersPage />} />
          </Route>
        </Route>
        
        {/* 404 route */}
        <Route path="/404" element={<NotFoundPage />} />
        
        {/* Catch-all redirect to 404 */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter; 