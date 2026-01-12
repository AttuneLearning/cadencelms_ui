/**
 * ProtectedComponent - Track 2A Implementation
 * Version: 1.0.0
 * Date: 2026-01-11
 *
 * Universal wrapper for UI elements with permission checking.
 * Enables progressive disclosure throughout the application.
 *
 * Features:
 * - Global and department-scoped permission checking
 * - Multiple permission logic (requireAll = AND, requireAny = OR)
 * - User type restrictions (Staff, Learner, Admin)
 * - Flexible fallback UI (null, custom component, loading spinner)
 * - Performance optimized with memoization
 *
 * Dependencies:
 * - useDepartmentContext: For permission checking
 * - useAuthStore: For user type and admin session checking
 */

import React, { useMemo } from 'react';
import { useAuthStore } from '@/features/auth/model/authStore';
import { useDepartmentContext } from '@/shared/hooks/useDepartmentContext';
import type { UserType } from '@/shared/types/auth';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Props for ProtectedComponent
 */
export interface ProtectedComponentProps {
  /** Content to render if user has access */
  children: React.ReactNode;

  // ========== Permission-based access ==========

  /**
   * Single required permission (string) or multiple permissions (string[])
   * By default uses OR logic - user needs ANY of these permissions
   * Use requireAll={true} for AND logic
   *
   * @example "content:courses:manage"
   * @example ["content:courses:manage", "content:courses:read"]
   */
  requiredRights?: string | string[];

  /**
   * If true, user must have ALL permissions in requiredRights (AND logic)
   * If false, user needs ANY permission in requiredRights (OR logic)
   * @default true
   */
  requireAll?: boolean;

  // ========== User type-based access ==========

  /**
   * Allowed user types. User must have at least one of these types.
   * @example ['staff']
   * @example ['staff', 'global-admin']
   */
  allowedUserTypes?: UserType[];

  // ========== Department scope ==========

  /**
   * If true, requires a department to be selected
   * Useful for department-scoped features
   * @default false
   */
  requireDepartmentContext?: boolean;

  // ========== Fallback UI ==========

  /**
   * Fallback to render if user lacks access
   * - null (default): render nothing
   * - React element: render this component
   * @default null
   */
  fallback?: React.ReactNode | null;

  /**
   * Show loading spinner while checking permissions
   * Useful for async permission checks
   * @default false
   */
  showLoading?: boolean;

  // ========== Debug ==========

  /**
   * Optional label for debugging
   * Will be logged if permission check fails (dev mode only)
   */
  debugLabel?: string;
}

// ============================================================================
// ProtectedComponent Implementation
// ============================================================================

/**
 * Universal wrapper component for permission-based UI rendering
 *
 * Hides/shows UI elements based on user permissions and types.
 * Uses hasPermission() from useDepartmentContext for efficient checking.
 *
 * @example Single permission
 * ```tsx
 * <ProtectedComponent requiredRights="content:courses:manage">
 *   <CreateCourseButton />
 * </ProtectedComponent>
 * ```
 *
 * @example Multiple permissions (AND logic)
 * ```tsx
 * <ProtectedComponent
 *   requiredRights={['content:courses:manage', 'department:staff:write']}
 *   requireAll={true}
 * >
 *   <AdvancedCourseSettings />
 * </ProtectedComponent>
 * ```
 *
 * @example Multiple permissions (OR logic)
 * ```tsx
 * <ProtectedComponent
 *   requiredRights={['content:courses:manage', 'system:admin']}
 *   requireAll={false}
 * >
 *   <CourseManagementPanel />
 * </ProtectedComponent>
 * ```
 *
 * @example User type restriction
 * ```tsx
 * <ProtectedComponent allowedUserTypes={['staff']}>
 *   <StaffDashboardWidget />
 * </ProtectedComponent>
 * ```
 *
 * @example With fallback UI
 * ```tsx
 * <ProtectedComponent
 *   requiredRights="billing:invoices:read"
 *   fallback={<div>You don't have access to billing information.</div>}
 * >
 *   <BillingDashboard />
 * </ProtectedComponent>
 * ```
 *
 * @example Department-scoped
 * ```tsx
 * <ProtectedComponent
 *   requiredRights="learners:grades:write"
 *   requireDepartmentContext={true}
 * >
 *   <GradeEntryForm />
 * </ProtectedComponent>
 * ```
 */
export function ProtectedComponent({
  children,
  requiredRights,
  requireAll = true,
  allowedUserTypes,
  requireDepartmentContext = false,
  fallback = null,
  showLoading = false,
  debugLabel,
}: ProtectedComponentProps): JSX.Element | null {
  // Get auth state
  const {
    isAuthenticated,
    roleHierarchy,
    isLoading: authLoading,
  } = useAuthStore();

  // Get department context
  const {
    currentDepartmentId,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSwitching,
  } = useDepartmentContext();

  // ============================================================================
  // Permission Check Logic (Memoized for performance)
  // ============================================================================

  const hasAccess = useMemo(() => {
    // 1. Check authentication
    if (!isAuthenticated || !roleHierarchy) {
      if (debugLabel && process.env.NODE_ENV === 'development') {
        console.debug(`[ProtectedComponent:${debugLabel}] Not authenticated`);
      }
      return false;
    }

    // 2. Check user type restrictions
    if (allowedUserTypes && allowedUserTypes.length > 0) {
      const hasAllowedUserType = allowedUserTypes.some((type) =>
        roleHierarchy.allUserTypes.includes(type)
      );

      if (!hasAllowedUserType) {
        if (debugLabel && process.env.NODE_ENV === 'development') {
          console.debug(
            `[ProtectedComponent:${debugLabel}] User type check failed. Required: ${allowedUserTypes.join(', ')}, Has: ${roleHierarchy.allUserTypes.join(', ')}`
          );
        }
        return false;
      }
    }

    // 3. Check department context requirement
    if (requireDepartmentContext && !currentDepartmentId) {
      if (debugLabel && process.env.NODE_ENV === 'development') {
        console.debug(
          `[ProtectedComponent:${debugLabel}] Department context required but none selected`
        );
      }
      return false;
    }

    // 4. Check permission requirements
    if (requiredRights) {
      // Normalize to array
      const rightsArray = Array.isArray(requiredRights) ? requiredRights : [requiredRights];

      if (rightsArray.length === 0) {
        // No permissions specified - allow access
        return true;
      }

      // Check permissions based on requireAll flag
      const hasRequiredPermissions = requireAll
        ? hasAllPermissions(rightsArray) // AND logic - need ALL permissions
        : hasAnyPermission(rightsArray); // OR logic - need ANY permission

      if (!hasRequiredPermissions) {
        if (debugLabel && process.env.NODE_ENV === 'development') {
          console.debug(
            `[ProtectedComponent:${debugLabel}] Permission check failed. Required (${requireAll ? 'ALL' : 'ANY'}): ${rightsArray.join(', ')}`
          );
        }
        return false;
      }
    }

    // All checks passed
    return true;
  }, [
    isAuthenticated,
    roleHierarchy,
    allowedUserTypes,
    requireDepartmentContext,
    currentDepartmentId,
    requiredRights,
    requireAll,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    debugLabel,
  ]);

  // ============================================================================
  // Render Logic
  // ============================================================================

  // Show loading state if requested
  if ((authLoading || isSwitching) && showLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Render children if user has access, otherwise render fallback
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// ============================================================================
// Convenience Wrapper Components
// ============================================================================

/**
 * Convenience wrapper for staff-only content
 *
 * @example
 * ```tsx
 * <StaffOnly>
 *   <StaffDashboardWidget />
 * </StaffOnly>
 * ```
 *
 * @example With fallback
 * ```tsx
 * <StaffOnly fallback={<div>Staff only</div>}>
 *   <StaffDashboardWidget />
 * </StaffOnly>
 * ```
 */
export function StaffOnly({
  children,
  fallback,
  ...props
}: Omit<ProtectedComponentProps, 'allowedUserTypes'>): JSX.Element | null {
  return (
    <ProtectedComponent {...props} allowedUserTypes={['staff']} fallback={fallback}>
      {children}
    </ProtectedComponent>
  );
}

/**
 * Convenience wrapper for learner-only content
 *
 * @example
 * ```tsx
 * <LearnerOnly>
 *   <LearnerDashboardWidget />
 * </LearnerOnly>
 * ```
 */
export function LearnerOnly({
  children,
  fallback,
  ...props
}: Omit<ProtectedComponentProps, 'allowedUserTypes'>): JSX.Element | null {
  return (
    <ProtectedComponent {...props} allowedUserTypes={['learner']} fallback={fallback}>
      {children}
    </ProtectedComponent>
  );
}

/**
 * Convenience wrapper for global-admin-only content
 *
 * Also checks if admin session is active (escalated privileges)
 *
 * @example
 * ```tsx
 * <AdminOnly>
 *   <SystemSettingsPanel />
 * </AdminOnly>
 * ```
 */
export function AdminOnly({
  children,
  fallback,
  ...props
}: Omit<ProtectedComponentProps, 'allowedUserTypes'>): JSX.Element | null {
  const { isAdminSessionActive } = useAuthStore();

  // Additional check: admin session must be active
  if (!isAdminSessionActive) {
    return <>{fallback}</>;
  }

  return (
    <ProtectedComponent {...props} allowedUserTypes={['global-admin']} fallback={fallback}>
      {children}
    </ProtectedComponent>
  );
}
