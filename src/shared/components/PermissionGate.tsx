/**
 * PermissionGate Component - Phase 5 Implementation
 * Version: 2.0.0
 * Date: 2026-01-10
 *
 * Conditional rendering based on permissions
 * Integrates with Phase 2 authStore for permission checking
 */

import React from 'react';
import { useAuthStore } from '@/features/auth/model';
import type { UserType, PermissionScope } from '@/shared/types/auth';

// ============================================================================
// Type Definitions
// ============================================================================

interface PermissionGateProps {
  children: React.ReactNode;

  // User type requirements
  userTypes?: UserType[];
  requireAllUserTypes?: boolean;

  // Permission requirements
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAllPermissions?: boolean;

  // Permission scope
  scope?: PermissionScope;

  // Fallback content
  fallback?: React.ReactNode;

  // Render props pattern
  render?: (hasAccess: boolean) => React.ReactNode;
}

// ============================================================================
// PermissionGate Component
// ============================================================================

/**
 * PermissionGate Component
 *
 * Conditionally renders children based on user permissions and types.
 * Can be used to show/hide UI elements based on access control.
 *
 * @example Show button only if user has permission
 * <PermissionGate requiredPermission="content:courses:create">
 *   <CreateCourseButton />
 * </PermissionGate>
 *
 * @example Show content for staff users only
 * <PermissionGate userTypes={['staff']}>
 *   <StaffOnlyContent />
 * </PermissionGate>
 *
 * @example Show fallback if no access
 * <PermissionGate
 *   requiredPermission="content:courses:edit"
 *   fallback={<p>You don't have permission to edit courses.</p>}
 * >
 *   <CourseEditor />
 * </PermissionGate>
 *
 * @example Use render props for custom rendering
 * <PermissionGate
 *   requiredPermission="content:courses:delete"
 *   render={(hasAccess) => (
 *     <Button disabled={!hasAccess}>
 *       {hasAccess ? 'Delete' : 'No Permission'}
 *     </Button>
 *   )}
 * />
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  userTypes,
  requireAllUserTypes = false,
  requiredPermission,
  requiredPermissions,
  requireAllPermissions = false,
  scope,
  fallback = null,
  render,
}) => {
  const {
    isAuthenticated,
    roleHierarchy,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions: checkAllPermissions,
  } = useAuthStore();

  // ================================================================
  // Access Check Logic
  // ================================================================

  // Not authenticated - no access
  if (!isAuthenticated || !roleHierarchy) {
    return render ? <>{render(false)}</> : <>{fallback}</>;
  }

  let hasAccess = true;

  // Check UserType requirements
  if (userTypes && userTypes.length > 0) {
    const hasRequiredUserType = requireAllUserTypes
      ? userTypes.every((type) => roleHierarchy.allUserTypes.includes(type))
      : userTypes.some((type) => roleHierarchy.allUserTypes.includes(type));

    if (!hasRequiredUserType) {
      hasAccess = false;
    }
  }

  // Check single permission requirement
  if (hasAccess && requiredPermission) {
    if (!hasPermission(requiredPermission, scope)) {
      hasAccess = false;
    }
  }

  // Check multiple permissions requirement
  if (hasAccess && requiredPermissions && requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAllPermissions
      ? checkAllPermissions(requiredPermissions, scope)
      : hasAnyPermission(requiredPermissions, scope);

    if (!hasRequiredPermissions) {
      hasAccess = false;
    }
  }

  // ================================================================
  // Render based on access
  // ================================================================

  // Use render props if provided
  if (render) {
    return <>{render(hasAccess)}</>;
  }

  // Otherwise show children or fallback
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// ============================================================================
// Convenience Wrapper Components
// ============================================================================

/**
 * StaffGate - Shows content only for staff users
 */
export const StaffGate: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <PermissionGate userTypes={['staff']} fallback={fallback}>
    {children}
  </PermissionGate>
);

/**
 * LearnerGate - Shows content only for learner users
 */
export const LearnerGate: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <PermissionGate userTypes={['learner']} fallback={fallback}>
    {children}
  </PermissionGate>
);

/**
 * AdminGate - Shows content only for global-admin users
 */
export const AdminGate: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <PermissionGate userTypes={['global-admin']} fallback={fallback}>
    {children}
  </PermissionGate>
);

// ============================================================================
// Export
// ============================================================================

export default PermissionGate;
