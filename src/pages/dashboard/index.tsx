/**
 * Dashboard Page - Role-based redirect
 * Redirects users to appropriate dashboard based on their role
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/model/useAuth';

export const DashboardPage = () => {
  const { role } = useAuth();

  // Redirect to role-specific dashboard
  switch (role) {
    case 'learner':
      return <Navigate to="/learner/dashboard" replace />;
    case 'staff':
      return <Navigate to="/staff/dashboard" replace />;
    case 'global-admin':
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};
