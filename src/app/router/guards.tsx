/**
 * Route guards for authentication and authorization
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/model/useAuth';
import type { Role } from '@/features/auth/model/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: Role[];
}

/**
 * ProtectedRoute component
 * Wraps routes that require authentication
 * Optionally checks for specific roles
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && role && !roles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
