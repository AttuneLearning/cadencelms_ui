/**
 * Dashboard Page - Phase 6 Update
 * Version: 2.0.0
 * Date: 2026-01-10
 *
 * Redirects users to appropriate dashboard based on V2 defaultDashboard
 * Uses roleHierarchy from V2 authStore
 */

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/model';

export const DashboardPage = () => {
  const { isAuthenticated, roleHierarchy } = useAuthStore();

  // If not authenticated, redirect to auth-error page for debugging
  if (!isAuthenticated || !roleHierarchy) {
    return (
      <Navigate
        to="/auth-error"
        state={{
          reason: !isAuthenticated ? 'no-auth' : 'no-role-hierarchy',
          from: '/dashboard',
        }}
        replace
      />
    );
  }

  // Use V2 defaultDashboard to determine redirect
  const dashboardMap: Record<string, string> = {
    learner: '/learner/dashboard',
    staff: '/staff/dashboard',
    admin: '/admin/dashboard',
  };

  const destination = dashboardMap[roleHierarchy.defaultDashboard] || '/learner/dashboard';

  return <Navigate to={destination} replace />;
};
