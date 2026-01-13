/**
 * ProtectedRoute Component - Phase 4 Implementation
 * Version: 2.0.0
 * Date: 2026-01-10
 *
 * V2-compatible route protection with:
 * - UserType-based access control
 * - Permission-based access control
 * - Department context requirements
 * - Integration with Phase 2 authStore
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/model';
import { useNavigationStore } from '@/shared/stores';
import type { UserType } from '@/shared/types/auth';

// ============================================================================
// Type Definitions
// ============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode;

  // User type requirements (V2)
  userTypes?: UserType[];
  requireAllUserTypes?: boolean;

  // Permission requirements (V2)
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAllPermissions?: boolean;

  // Department context requirements
  requireDepartment?: boolean;
  departmentTypes?: ('staff' | 'learner')[];

  // Redirect configuration
  redirectTo?: string;
  redirectToDashboard?: boolean; // Redirect to user's default dashboard
}

// ============================================================================
// ProtectedRoute Component
// ============================================================================

/**
 * ProtectedRoute Component
 *
 * Wraps routes that require authentication and/or authorization.
 * Supports V2 role system with UserTypes, permissions, and department context.
 *
 * @example Basic authentication
 * <ProtectedRoute>
 *   <ProfilePage />
 * </ProtectedRoute>
 *
 * @example User type protection
 * <ProtectedRoute userTypes={['staff']}>
 *   <StaffDashboard />
 * </ProtectedRoute>
 *
 * @example Permission-based protection
 * <ProtectedRoute requiredPermission="content:courses:create">
 *   <CourseCreatePage />
 * </ProtectedRoute>
 *
 * @example Department context requirement
 * <ProtectedRoute requireDepartment departmentTypes={['staff']}>
 *   <DepartmentCoursesPage />
 * </ProtectedRoute>
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  userTypes,
  requireAllUserTypes = false,
  requiredPermission,
  requiredPermissions,
  requireAllPermissions = false,
  requireDepartment = false,
  departmentTypes,
  redirectTo,
  redirectToDashboard = false,
}) => {
  const {
    isAuthenticated,
    roleHierarchy,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  } = useAuthStore();
  const { selectedDepartmentId } = useNavigationStore();
  const location = useLocation();

  // Prevent infinite redirect loops (use sessionStorage to survive React.StrictMode)
  const loopKey = `redirectLoop_${location.pathname}`;
  const loopData = sessionStorage.getItem(loopKey);
  const { count = 0, timestamp = Date.now() } = loopData ? JSON.parse(loopData) : {};

  // Reset counter if more than 1 second has passed
  const timeSinceLastCheck = Date.now() - timestamp;
  const currentCount = timeSinceLastCheck > 1000 ? 1 : count + 1;

  sessionStorage.setItem(loopKey, JSON.stringify({ count: currentCount, timestamp: Date.now() }));

  if (currentCount > 10) {
    console.error('[ProtectedRoute] Too many redirects detected! Breaking loop.', {
      path: location.pathname,
      count: currentCount,
      userTypes,
      allUserTypes: roleHierarchy?.allUserTypes,
    });

    // Clear the loop counter
    sessionStorage.removeItem(loopKey);

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Redirect Loop Detected</h1>
          <p className="text-muted-foreground mb-4">
            Cannot access {location.pathname}<br />
            {userTypes && `Required: ${userTypes.join(', ')}`}<br />
            {roleHierarchy && `You have: ${roleHierarchy.allUserTypes.join(', ')}`}
          </p>
          <a href="/login" className="text-primary hover:underline">
            Return to Login
          </a>
        </div>
      </div>
    );
  }

  // ================================================================
  // 1. Check Authentication
  // ================================================================
  if (!isAuthenticated || !roleHierarchy) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ================================================================
  // 2. Check UserType Requirements
  // ================================================================
  if (userTypes && userTypes.length > 0) {
    const hasRequiredUserType = requireAllUserTypes
      ? // User must have ALL specified user types
        userTypes.every((type) => roleHierarchy.allUserTypes.includes(type))
      : // User must have ANY of the specified user types
        userTypes.some((type) => roleHierarchy.allUserTypes.includes(type));

    console.log('[ProtectedRoute] UserType check:', {
      requiredUserTypes: userTypes,
      userAllTypes: roleHierarchy.allUserTypes,
      hasRequiredUserType,
      currentPath: location.pathname,
      willRedirect: !hasRequiredUserType,
    });

    if (!hasRequiredUserType) {
      if (redirectToDashboard) {
        const defaultDashboard = roleHierarchy.defaultDashboard;
        console.log('[ProtectedRoute] Redirecting to default dashboard:', `/${defaultDashboard}/dashboard`);
        return <Navigate to={`/${defaultDashboard}/dashboard`} replace />;
      }
      return <Navigate to={redirectTo || '/unauthorized'} replace />;
    }
  }

  // ================================================================
  // 3. Check Permission Requirements
  // ================================================================

  // Single permission check
  if (requiredPermission) {
    if (!hasPermission(requiredPermission)) {
      if (redirectToDashboard) {
        const defaultDashboard = roleHierarchy.defaultDashboard;
        return <Navigate to={`/${defaultDashboard}/dashboard`} replace />;
      }
      return <Navigate to={redirectTo || '/unauthorized'} replace />;
    }
  }

  // Multiple permissions check
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAllPermissions
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasRequiredPermissions) {
      if (redirectToDashboard) {
        const defaultDashboard = roleHierarchy.defaultDashboard;
        return <Navigate to={`/${defaultDashboard}/dashboard`} replace />;
      }
      return <Navigate to={redirectTo || '/unauthorized'} replace />;
    }
  }

  // ================================================================
  // 4. Check Department Context Requirements
  // ================================================================
  if (requireDepartment) {
    // Check if user has selected a department
    if (!selectedDepartmentId) {
      // User needs to select a department first
      return (
        <Navigate
          to="/select-department"
          state={{ from: location, requireDepartment: true }}
          replace
        />
      );
    }

    // Check if user has appropriate department membership type
    if (departmentTypes && departmentTypes.length > 0) {
      let hasRequiredDepartmentType = false;

      // Check staff membership
      if (departmentTypes.includes('staff') && roleHierarchy.staffRoles) {
        const hasStaffMembership = roleHierarchy.staffRoles.departmentRoles.some(
          (dept) => dept.departmentId === selectedDepartmentId
        );
        if (hasStaffMembership) {
          hasRequiredDepartmentType = true;
        }
      }

      // Check learner membership
      if (departmentTypes.includes('learner') && roleHierarchy.learnerRoles) {
        const hasLearnerMembership = roleHierarchy.learnerRoles.departmentRoles.some(
          (dept) => dept.departmentId === selectedDepartmentId
        );
        if (hasLearnerMembership) {
          hasRequiredDepartmentType = true;
        }
      }

      if (!hasRequiredDepartmentType) {
        if (redirectToDashboard) {
          const defaultDashboard = roleHierarchy.defaultDashboard;
          return <Navigate to={`/${defaultDashboard}/dashboard`} replace />;
        }
        return <Navigate to={redirectTo || '/unauthorized'} replace />;
      }
    }
  }

  // ================================================================
  // All checks passed - render protected content
  // ================================================================
  return <>{children}</>;
};

// ============================================================================
// Convenience Wrapper Components
// ============================================================================

/**
 * StaffOnlyRoute - Convenience wrapper for staff-only routes
 */
export const StaffOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute userTypes={['staff']} redirectToDashboard>
    {children}
  </ProtectedRoute>
);

/**
 * LearnerOnlyRoute - Convenience wrapper for learner-only routes
 */
export const LearnerOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute userTypes={['learner']} redirectToDashboard>
    {children}
  </ProtectedRoute>
);

/**
 * AdminOnlyRoute - Convenience wrapper for global-admin-only routes
 */
export const AdminOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute userTypes={['global-admin']} redirectToDashboard>
    {children}
  </ProtectedRoute>
);

/**
 * DepartmentRoute - Convenience wrapper for department-context routes
 */
interface DepartmentRouteProps {
  children: React.ReactNode;
  departmentTypes?: ('staff' | 'learner')[];
}

export const DepartmentRoute: React.FC<DepartmentRouteProps> = ({
  children,
  departmentTypes,
}) => (
  <ProtectedRoute requireDepartment departmentTypes={departmentTypes} redirectToDashboard>
    {children}
  </ProtectedRoute>
);
