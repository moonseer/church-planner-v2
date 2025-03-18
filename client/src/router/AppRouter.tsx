import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Auth pages
import { LoginForm, RegisterForm, PasswordReset } from '../features/auth';

// Church pages
import { 
  ChurchListPage, 
  ChurchDetailPage, 
  CreateChurchPage, 
  EditChurchPage,
  ChurchMembersPage
} from '../features/church';

// Other pages
import HomePage from '../pages/HomePage';
import NotFoundPage from '../pages/NotFoundPage';
import Dashboard from '../pages/Dashboard';

// Protected route wrapper
const ProtectedRoute: React.FC<{element: React.ReactNode}> = ({ element }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return user ? <>{element}</> : <Navigate to="/login" />;
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes with auth layout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/reset-password" element={<PasswordReset />} />
        </Route>
        
        {/* Public routes with main layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>
        
        {/* Protected routes with main layout */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          
          {/* Church routes */}
          <Route path="/churches" element={<ProtectedRoute element={<ChurchListPage />} />} />
          <Route path="/churches/new" element={<ProtectedRoute element={<CreateChurchPage />} />} />
          <Route path="/churches/:id" element={<ProtectedRoute element={<ChurchDetailPage />} />} />
          <Route path="/churches/:id/edit" element={<ProtectedRoute element={<EditChurchPage />} />} />
          <Route path="/churches/:id/members" element={<ProtectedRoute element={<ChurchMembersPage />} />} />
        </Route>
        
        {/* Not found route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter; 