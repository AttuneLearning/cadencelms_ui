/**
 * Permission Hooks - Phase 5 Implementation
 * Version: 2.0.0
 * Date: 2026-01-10
 *
 * Custom hooks for permission checking
 * Provides convenient API for components
 */

import { useMemo } from 'react';
import { useAuthStore } from '@/features/auth/model';
import type { UserType } from '@/shared/types/auth';
import { useDepartmentContext } from './useDepartmentContext';

// ============================================================================
// Permission Checking Hook
// ============================================================================

/**
 * usePermission Hook
 *
 * Check if user has a specific permission
 *
 * @param permission - The permission to check (e.g., 'content:courses:create')
 * @param departmentId - Optional department ID for scoped permissions
 * @returns boolean indicating if user has the permission
 *
 * @example
 * function CreateCourseButton() {
 *   const canCreate = usePermission('content:courses:create');
 *
 *   if (!canCreate) return null;
 *
 *   return <Button>Create Course</Button>;
 * }
 *
 * @example With department scope
 * function DepartmentActions({ departmentId }) {
 *   const canManage = usePermission('content:courses:manage', departmentId);
 *
 *   return canManage ? <ManagementPanel /> : <ViewOnlyPanel />;
 * }
 */
export function usePermission(
  permission: string,
  departmentId?: string
): boolean {
  const { hasPermission } = useAuthStore();

  return useMemo(() => {
    // UNIFIED AUTHORIZATION: Pass departmentId directly (not wrapped in scope object)
    return hasPermission(permission, departmentId);
  }, [hasPermission, permission, departmentId]);
}

// ============================================================================
// Multiple Permissions Hook
// ============================================================================

/**
 * usePermissions Hook
 *
 * Check multiple permissions at once
 *
 * @param permissions - Array of permissions to check
 * @param options - Configuration options
 * @returns Object with permission check results
 *
 * @example
 * function CourseActions() {
 *   const { hasAll, hasAny, permissions } = usePermissions([
 *     'content:courses:create',
 *     'content:courses:edit',
 *     'content:courses:delete',
 *   ]);
 *
 *   return (
 *     <div>
 *       {permissions['content:courses:create'] && <CreateButton />}
 *       {permissions['content:courses:edit'] && <EditButton />}
 *       {permissions['content:courses:delete'] && <DeleteButton />}
 *       {hasAll && <AdminPanel />}
 *     </div>
 *   );
 * }
 */
export function usePermissions(
  permissionsList: string[],
  options?: {
    /** Department ID for scoped permission checks */
    departmentId?: string;
    requireAll?: boolean;
  }
) {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  } = useAuthStore();

  const departmentId = options?.departmentId;

  return useMemo(() => {
    // UNIFIED AUTHORIZATION: Pass departmentId directly
    // Create permission map
    const permissions: Record<string, boolean> = {};
    for (const perm of permissionsList) {
      permissions[perm] = hasPermission(perm, departmentId);
    }

    // Check if has all or any
    const hasAll = hasAllPermissions(permissionsList, departmentId);
    const hasAny = hasAnyPermission(permissionsList, departmentId);

    return {
      permissions,
      hasAll,
      hasAny,
    };
  }, [hasPermission, hasAnyPermission, hasAllPermissions, permissionsList, departmentId]);
}

// ============================================================================
// User Type Checking Hook
// ============================================================================

/**
 * useUserType Hook
 *
 * Check user's type and provide type-checking utilities
 *
 * @returns Object with user type information
 *
 * @example
 * function Dashboard() {
 *   const { isStaff, isLearner, isAdmin, primaryType } = useUserType();
 *
 *   if (isAdmin) return <AdminDashboard />;
 *   if (isStaff) return <StaffDashboard />;
 *   if (isLearner) return <LearnerDashboard />;
 *
 *   return <GuestView />;
 * }
 */
export function useUserType() {
  const { roleHierarchy } = useAuthStore();

  return useMemo(() => {
    if (!roleHierarchy) {
      return {
        isStaff: false,
        isLearner: false,
        isAdmin: false,
        isGlobalAdmin: false,
        primaryType: null as UserType | null,
        allTypes: [] as UserType[],
        hasType: (_type: UserType) => false,
      };
    }

    const allTypes = roleHierarchy.allUserTypes;
    const primaryType = roleHierarchy.primaryUserType;

    return {
      isStaff: allTypes.includes('staff'),
      isLearner: allTypes.includes('learner'),
      isAdmin: allTypes.includes('global-admin'),
      isGlobalAdmin: allTypes.includes('global-admin'),
      primaryType,
      allTypes,
      hasType: (type: UserType) => allTypes.includes(type),
    };
  }, [roleHierarchy]);
}

// ============================================================================
// Role Checking Hook
// ============================================================================

/**
 * useRole Hook
 *
 * Check if user has a specific role
 *
 * @param role - The role name to check (e.g., 'instructor', 'department-admin')
 * @param departmentId - Optional department ID for scoped check
 * @returns boolean indicating if user has the role
 *
 * @example
 * function InstructorPanel({ departmentId }) {
 *   const isInstructor = useRole('instructor', departmentId);
 *
 *   if (!isInstructor) return <NoAccessMessage />;
 *
 *   return <InstructorTools />;
 * }
 */
export function useRole(role: string, departmentId?: string): boolean {
  const { hasRole } = useAuthStore();

  return useMemo(() => {
    return hasRole(role, departmentId);
  }, [hasRole, role, departmentId]);
}

// ============================================================================
// Department Permissions Hook
// ============================================================================

/**
 * useDepartmentPermissions Hook
 *
 * Get all permissions for a specific department
 *
 * @param departmentId - The department ID
 * @returns Object with department permission information
 *
 * @example
 * function DepartmentInfo({ departmentId }) {
 *   const { permissions, roles, canCreate, canEdit } = useDepartmentPermissions(departmentId);
 *
 *   return (
 *     <div>
 *       <h3>Roles: {roles.join(', ')}</h3>
 *       <h3>Permissions: {permissions.length}</h3>
 *       {canCreate && <CreateButton />}
 *       {canEdit && <EditButton />}
 *     </div>
 *   );
 * }
 */
export function useDepartmentPermissions(departmentId: string) {
  const { roleHierarchy, departmentRights, hasPermission } = useAuthStore();

  return useMemo(() => {
    if (!departmentId) {
      return {
        permissions: [] as string[],
        roles: [] as string[],
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canView: false,
      };
    }

    // UNIFIED AUTHORIZATION: Get permissions directly from departmentRights
    const deptPermissions = departmentRights[departmentId] || [];

    // Find department roles from roleHierarchy (for display purposes)
    let departmentRoles: string[] = [];

    // Check staff roles
    if (roleHierarchy?.staffRoles) {
      const dept = roleHierarchy.staffRoles.departmentRoles.find(
        (d) => d.departmentId === departmentId
      );
      if (dept) {
        departmentRoles = dept.roles.map((r) => r.role);
      }
    }

    // Check learner roles
    if (roleHierarchy?.learnerRoles) {
      const dept = roleHierarchy.learnerRoles.departmentRoles.find(
        (d) => d.departmentId === departmentId
      );
      if (dept) {
        const learnerRoles = dept.roles.map((r) => r.role);
        departmentRoles = [...departmentRoles, ...learnerRoles];
      }
    }

    // UNIFIED AUTHORIZATION: Check common CRUD permissions using departmentId directly
    const canCreate = hasPermission('content:courses:create', departmentId);
    const canEdit = hasPermission('content:courses:edit', departmentId);
    const canDelete = hasPermission('content:courses:delete', departmentId);
    const canView = hasPermission('content:courses:read', departmentId);

    return {
      permissions: deptPermissions,
      roles: departmentRoles,
      canCreate,
      canEdit,
      canDelete,
      canView,
    };
  }, [roleHierarchy, departmentRights, departmentId, hasPermission]);
}

// ============================================================================
// Combined Access Hook
// ============================================================================

/**
 * useAccess Hook
 *
 * Combined hook providing all access checking utilities
 *
 * @returns Object with all access checking methods
 *
 * @example
 * function MyComponent() {
 *   const access = useAccess();
 *
 *   return (
 *     <div>
 *       {access.isStaff && <StaffPanel />}
 *       {access.hasPermission('content:courses:create') && <CreateButton />}
 *       {access.hasRole('instructor') && <InstructorTools />}
 *     </div>
 *   );
 * }
 */
export function useAccess() {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole } = useAuthStore();
  const userType = useUserType();

  return {
    ...userType,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
  };
}

// ============================================================================
// Scoped Permission Hook (Department Context)
// ============================================================================

/**
 * useScopedPermission Hook
 *
 * Check if user has a specific permission in the currently selected department
 * This is a convenience hook that automatically uses the current department context
 *
 * @param permission - The permission to check (e.g., 'content:courses:create')
 * @returns boolean indicating if user has the permission in current department
 *
 * @example
 * function CreateCourseButton() {
 *   const canCreate = useScopedPermission('content:courses:create');
 *
 *   if (!canCreate) return null;
 *
 *   return <Button>Create Course</Button>;
 * }
 */
export function useScopedPermission(permission: string): boolean {
  const { hasPermission } = useAuthStore();
  const { currentDepartmentId } = useDepartmentContext();

  return useMemo(() => {
    // UNIFIED AUTHORIZATION: Pass currentDepartmentId directly
    // If no department selected, pass undefined to check globally
    return hasPermission(permission, currentDepartmentId ?? undefined);
  }, [hasPermission, permission, currentDepartmentId]);
}
