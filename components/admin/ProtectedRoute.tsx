import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-ivory">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Not authenticated - redirect to login with return path
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Authenticated but not Admin - redirect to unauthorized
  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Authenticated and Admin - render children
  return <>{children}</>;
};

export default ProtectedRoute;
