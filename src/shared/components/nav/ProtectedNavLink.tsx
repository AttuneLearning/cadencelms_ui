/**
 * ProtectedNavLink Component - Track 2B Implementation
 * Version: 1.0.0
 * Date: 2026-01-11
 *
 * A NavLink component that respects permissions and only renders if user has access.
 * Wraps React Router's NavLink with permission checking capabilities.
 *
 * Features:
 * - All ProtectedLink permission checking features
 * - Active state styling (activeClassName, activeStyle)
 * - Supports NavLink's isActive function
 * - Single or multiple permission requirements
 * - requireAll (AND) vs requireAny (OR) logic
 * - Department-scoped permission checking
 * - Fallback component when no access
 * - Standard NavLink props passthrough
 */

import React from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/model/authStore';
import { useDepartmentContext } from '@/shared/hooks/useDepartmentContext';

// ============================================================================
// Types
// ============================================================================

export interface ProtectedNavLinkProps extends Omit<NavLinkProps, 'to'> {
  /** Link destination */
  to: string;

  /** Single permission requirement */
  requiredPermission?: string;

  /** Multiple permission requirements */
  requiredPermissions?: string[];

  /** If true, user must have ALL permissions. If false, user needs ANY permission. Default: false */
  requireAll?: boolean;

  /** If true, check permissions in currently selected department. Default: false */
  departmentScoped?: boolean;

  /** Optional: Specific department ID to check (overrides departmentScoped) */
  departmentId?: string;

  /** Component to render when user lacks permission. Default: null */
  fallback?: React.ReactNode;

  /** Link content */
  children?: React.ReactNode;

  /** Optional className for styling */
  className?: string | ((props: { isActive: boolean }) => string);
}

// ============================================================================
// Component
// ============================================================================

/**
 * ProtectedNavLink - Permission-aware navigation link with active state
 *
 * @example Basic usage with single permission
 * ```tsx
 * <ProtectedNavLink
 *   to="/courses"
 *   requiredPermission="content:courses:read"
 *   className={({ isActive }) => isActive ? "bg-blue-600 text-white" : "text-gray-600"}
 * >
 *   Courses
 * </ProtectedNavLink>
 * ```
 *
 * @example Multiple permissions (any)
 * ```tsx
 * <ProtectedNavLink
 *   to="/courses"
 *   requiredPermissions={['content:courses:read', 'content:courses:manage']}
 * >
 *   View Courses
 * </ProtectedNavLink>
 * ```
 *
 * @example Multiple permissions (all required)
 * ```tsx
 * <ProtectedNavLink
 *   to="/courses/advanced"
 *   requiredPermissions={['content:courses:read', 'content:advanced:access']}
 *   requireAll={true}
 * >
 *   Advanced Courses
 * </ProtectedNavLink>
 * ```
 *
 * @example Department-scoped (current department)
 * ```tsx
 * <ProtectedNavLink
 *   to="/department/courses"
 *   requiredPermission="content:courses:read"
 *   departmentScoped={true}
 * >
 *   Department Courses
 * </ProtectedNavLink>
 * ```
 *
 * @example Sidebar navigation with active styling
 * ```tsx
 * <nav>
 *   <ProtectedNavLink
 *     to="/dashboard"
 *     requiredPermission="system:dashboard:view"
 *     className={({ isActive }) =>
 *       `px-4 py-2 rounded ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`
 *     }
 *   >
 *     Dashboard
 *   </ProtectedNavLink>
 * </nav>
 * ```
 *
 * @example With fallback
 * ```tsx
 * <ProtectedNavLink
 *   to="/admin/settings"
 *   requiredPermission="system:settings:manage"
 *   fallback={<span className="text-gray-400">Settings (No Access)</span>}
 * >
 *   Settings
 * </ProtectedNavLink>
 * ```
 */
export const ProtectedNavLink: React.FC<ProtectedNavLinkProps> = ({
  to,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
  departmentScoped = false,
  departmentId,
  fallback = null,
  children,
  className,
  ...navLinkProps
}) => {
  // ============================================================================
  // Permission Checking Logic
  // ============================================================================

  // Get permission checking functions from authStore
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuthStore();

  // Get department context for scoped permission checking
  const {
    hasPermission: hasDeptPermission,
    hasAnyPermission: hasAnyDeptPermission,
    hasAllPermissions: hasAllDeptPermissions,
    currentDepartmentId,
  } = useDepartmentContext();

  // Determine which permissions to check
  const permissionsToCheck: string[] = React.useMemo(() => {
    if (requiredPermissions && requiredPermissions.length > 0) {
      return requiredPermissions;
    }
    if (requiredPermission) {
      return [requiredPermission];
    }
    // No permissions required - always show link
    return [];
  }, [requiredPermission, requiredPermissions]);

  // If no permissions required, always show link
  if (permissionsToCheck.length === 0) {
    return (
      <NavLink to={to} className={className} {...navLinkProps}>
        {children}
      </NavLink>
    );
  }

  // Determine final access based on permission checking strategy
  const hasAccess = React.useMemo(() => {
    if (permissionsToCheck.length === 0) {
      return true;
    }

    // Strategy 1: Specific department ID provided (highest priority)
    if (departmentId) {
      if (permissionsToCheck.length === 1) {
        // Single permission: use hasPermission with departmentId
        return hasPermission(permissionsToCheck[0], { type: 'department', id: departmentId });
      } else {
        // Multiple permissions: use requireAll to determine AND vs OR logic
        if (requireAll) {
          // AND logic: user must have ALL permissions in this department
          return permissionsToCheck.every((perm) =>
            hasPermission(perm, { type: 'department', id: departmentId })
          );
        } else {
          // OR logic: user needs AT LEAST ONE permission in this department
          return permissionsToCheck.some((perm) =>
            hasPermission(perm, { type: 'department', id: departmentId })
          );
        }
      }
    }

    // Strategy 2: Department-scoped (use current department context)
    if (departmentScoped && currentDepartmentId) {
      if (permissionsToCheck.length === 1) {
        // Single permission in current department
        return hasDeptPermission(permissionsToCheck[0]);
      } else {
        // Multiple permissions in current department
        return requireAll
          ? hasAllDeptPermissions(permissionsToCheck)
          : hasAnyDeptPermission(permissionsToCheck);
      }
    }

    // Strategy 3: Global permissions (no department scope)
    if (permissionsToCheck.length === 1) {
      // Single permission globally
      return hasPermission(permissionsToCheck[0]);
    } else {
      // Multiple permissions globally
      return requireAll
        ? hasAllPermissions(permissionsToCheck)
        : hasAnyPermission(permissionsToCheck);
    }
  }, [
    permissionsToCheck,
    departmentId,
    departmentScoped,
    currentDepartmentId,
    requireAll,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasDeptPermission,
    hasAnyDeptPermission,
    hasAllDeptPermissions,
  ]);

  // ============================================================================
  // Render
  // ============================================================================

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return (
    <NavLink to={to} className={className} {...navLinkProps}>
      {children}
    </NavLink>
  );
};
