/**
 * Route guards for authentication and authorization
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/model/useAuth';
import type { Role } from '@/features/auth/model/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: Role[];
  requireAll?: boolean; // If true, user must have ALL specified roles
  redirectTo?: string; // Custom redirect path for unauthorized users
}

/**
 * ProtectedRoute component
 * Wraps routes that require authentication
 * Supports multiple role checks with flexible authorization logic
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles,
  requireAll = false,
  redirectTo,
}) => {
  const { isAuthenticated, role, roles: userRoles } = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required, check authorization
  if (roles && roles.length > 0) {
    const hasAccess = requireAll
      ? // Check if user has ALL required roles
        roles.every((requiredRole) => userRoles.includes(requiredRole))
      : // Check if user has ANY of the required roles
        role && roles.includes(role);

    if (!hasAccess) {
      return <Navigate to={redirectTo || '/unauthorized'} replace />;
    }
  }

  return <>{children}</>;
};

/**
 * RoleBasedRoute component
 * Wrapper for routes that should only be accessible to specific roles
 */
interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  fallbackPath?: string;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles,
  fallbackPath = '/dashboard',
}) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
