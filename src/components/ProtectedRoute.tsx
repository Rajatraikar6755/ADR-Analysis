
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'patient' | 'doctor';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-healthcare-600"></div>
      </div>
    );
  }

  // If no user is logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required but user doesn't have it
  if (requiredRole && user.role !== requiredRole) {
    return (
      <Navigate 
        to={user.role === 'patient' ? '/patient-dashboard' : '/doctor-dashboard'} 
        replace 
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
