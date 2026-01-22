/**
 * ProtectedLink Component - Track G Implementation (Enhanced for Track 2B)
 * Version: 2.0.0
 * Date: 2026-01-11
 *
 * A Link component that respects permissions and only renders if user has access.
 * Supports both global and department-scoped permission checking.
 *
 * Features:
 * - Single or multiple permission requirements
 * - requireAll (AND) vs requireAny (OR) logic
 * - Department-scoped permission checking
 * - Fallback component when no access
 * - Standard Link props passthrough
 *
 * Version 2.0.0 Changes:
 * - Fixed multiple permission checking (was only checking first permission)
 * - Now properly implements requireAll (AND) and requireAny (OR) logic
 * - Maintains 100% backward compatibility with single permission usage
 */

import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/model/authStore';
import { useDepartmentContext } from '@/shared/hooks/useDepartmentContext';

// ============================================================================
// Types
// ============================================================================

export interface ProtectedLinkProps extends Omit<LinkProps, 'to'> {
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
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * ProtectedLink - Permission-aware navigation link
 *
 * @example Basic usage with single permission
 * ```tsx
 * <ProtectedLink
 *   to="/courses/create"
 *   requiredPermission="content:courses:create"
 * >
 *   Create Course
 * </ProtectedLink>
 * ```
 *
 * @example Multiple permissions (any)
 * ```tsx
 * <ProtectedLink
 *   to="/courses"
 *   requiredPermissions={['content:courses:read', 'content:courses:manage']}
 * >
 *   View Courses
 * </ProtectedLink>
 * ```
 *
 * @example Multiple permissions (all required)
 * ```tsx
 * <ProtectedLink
 *   to="/courses/advanced"
 *   requiredPermissions={['content:courses:read', 'content:advanced:access']}
 *   requireAll={true}
 * >
 *   Advanced Courses
 * </ProtectedLink>
 * ```
 *
 * @example Department-scoped (current department)
 * ```tsx
 * <ProtectedLink
 *   to="/department/courses"
 *   requiredPermission="content:courses:read"
 *   departmentScoped={true}
 * >
 *   Department Courses
 * </ProtectedLink>
 * ```
 *
 * @example Specific department
 * ```tsx
 * <ProtectedLink
 *   to="/department/123/courses"
 *   requiredPermission="content:courses:read"
 *   departmentId="dept-123"
 * >
 *   Department 123 Courses
 * </ProtectedLink>
 * ```
 *
 * @example With fallback
 * ```tsx
 * <ProtectedLink
 *   to="/admin/settings"
 *   requiredPermission="system:settings:manage"
 *   fallback={<span className="text-gray-400">Settings (No Access)</span>}
 * >
 *   Settings
 * </ProtectedLink>
 * ```
 */
export const ProtectedLink: React.FC<ProtectedLinkProps> = ({
  to,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
  departmentScoped = false,
  departmentId,
  fallback = null,
  children,
  className,
  ...linkProps
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
      <Link to={to} className={className} {...linkProps}>
        {children}
      </Link>
    );
  }

  // Determine final access based on permission checking strategy
  const hasAccess = React.useMemo(() => {
    if (permissionsToCheck.length === 0) {
      return true;
    }

    // Strategy 1: Specific department ID provided (highest priority)
    // UNIFIED AUTHORIZATION: Pass departmentId directly (not wrapped in scope object)
    if (departmentId) {
      if (permissionsToCheck.length === 1) {
        // Single permission: use hasPermission with departmentId
        return hasPermission(permissionsToCheck[0], departmentId);
      } else {
        // Multiple permissions: use requireAll to determine AND vs OR logic
        if (requireAll) {
          // AND logic: user must have ALL permissions in this department
          return permissionsToCheck.every((perm) =>
            hasPermission(perm, departmentId)
          );
        } else {
          // OR logic: user needs AT LEAST ONE permission in this department
          return permissionsToCheck.some((perm) =>
            hasPermission(perm, departmentId)
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
    <Link to={to} className={className} {...linkProps}>
      {children}
    </Link>
  );
};

// ============================================================================
// Note on ProtectedLinkMultiple
// ============================================================================
/**
 * DEPRECATED: ProtectedLinkMultiple is no longer needed.
 *
 * The main ProtectedLink component now properly handles multiple permissions
 * with requireAll (AND) and requireAny (OR) logic.
 *
 * Migration:
 * - ProtectedLinkMultiple with requireAll=true → ProtectedLink with requireAll=true
 * - ProtectedLinkMultiple with requireAll=false → ProtectedLink with requireAll=false (default)
 * - ProtectedLinkMultiple permissions prop → ProtectedLink requiredPermissions prop
 */
