/**
 * DepartmentContext - Phase 5 Implementation
 * Version: 2.0.0
 * Date: 2026-01-10
 *
 * Context provider for department-scoped operations
 * Provides department information and scoped permission checking
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useAuthStore } from '@/features/auth/model';
import { useNavigationStore } from '@/shared/stores';
import type { DepartmentRoleGroup } from '@/shared/types/auth';

// ============================================================================
// Type Definitions
// ============================================================================

interface DepartmentInfo {
  id: string;
  name: string;
  type: 'staff' | 'learner' | null;
  isPrimary: boolean;
  roles: string[];
  permissions: string[];
}

interface DepartmentContextValue {
  // Current department info
  department: DepartmentInfo | null;
  departmentId: string | null;

  // Department selection
  selectDepartment: (departmentId: string) => void;
  clearDepartment: () => void;

  // Scoped permission checking
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;

  // Role checking in current department
  hasRole: (role: string) => boolean;

  // Department type checking
  isStaffDepartment: boolean;
  isLearnerDepartment: boolean;
}

// ============================================================================
// Context Creation
// ============================================================================

const DepartmentContext = createContext<DepartmentContextValue | null>(null);

// ============================================================================
// Provider Component
// ============================================================================

interface DepartmentProviderProps {
  children: React.ReactNode;
  departmentId?: string; // Optional: provide specific department ID
}

/**
 * DepartmentProvider Component
 *
 * Provides department context to child components.
 * Automatically uses selected department from navigationStore or accepts explicit departmentId.
 *
 * @example Auto-use selected department
 * <DepartmentProvider>
 *   <DepartmentSpecificContent />
 * </DepartmentProvider>
 *
 * @example Force specific department
 * <DepartmentProvider departmentId="dept-123">
 *   <DepartmentSpecificContent />
 * </DepartmentProvider>
 */
export const DepartmentProvider: React.FC<DepartmentProviderProps> = ({
  children,
  departmentId: propDepartmentId,
}) => {
  const { roleHierarchy, hasPermission: globalHasPermission, hasRole: globalHasRole } = useAuthStore();
  const {
    selectedDepartmentId,
    setSelectedDepartment,
    clearDepartmentSelection,
    rememberDepartment,
  } = useNavigationStore();
  const { user } = useAuthStore();

  // Use provided departmentId or fall back to selected department
  const departmentId = propDepartmentId || selectedDepartmentId;

  // ================================================================
  // Extract Department Information
  // ================================================================

  const departmentInfo = useMemo((): DepartmentInfo | null => {
    if (!departmentId || !roleHierarchy) return null;

    // Search in staff departments
    if (roleHierarchy.staffRoles) {
      const staffDept = roleHierarchy.staffRoles.departmentRoles.find(
        (dept) => dept.departmentId === departmentId
      );

      if (staffDept) {
        return extractDepartmentInfo(staffDept, 'staff');
      }
    }

    // Search in learner departments
    if (roleHierarchy.learnerRoles) {
      const learnerDept = roleHierarchy.learnerRoles.departmentRoles.find(
        (dept) => dept.departmentId === departmentId
      );

      if (learnerDept) {
        return extractDepartmentInfo(learnerDept, 'learner');
      }
    }

    return null;
  }, [departmentId, roleHierarchy]);

  // ================================================================
  // Department Selection Functions
  // ================================================================

  const selectDepartment = (id: string) => {
    setSelectedDepartment(id);
    if (user) {
      rememberDepartment(user._id, id);
    }
  };

  const clearDepartment = () => {
    clearDepartmentSelection();
  };

  // ================================================================
  // Scoped Permission Checking
  // ================================================================

  const hasPermission = (permission: string): boolean => {
    if (!departmentId) return false;
    return globalHasPermission(permission, {
      type: 'department',
      id: departmentId,
    });
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some((perm) => hasPermission(perm));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every((perm) => hasPermission(perm));
  };

  // ================================================================
  // Role Checking in Current Department
  // ================================================================

  const hasRole = (role: string): boolean => {
    if (!departmentId) return false;
    return globalHasRole(role, departmentId);
  };

  // ================================================================
  // Department Type Checking
  // ================================================================

  const isStaffDepartment = departmentInfo?.type === 'staff';
  const isLearnerDepartment = departmentInfo?.type === 'learner';

  // ================================================================
  // Context Value
  // ================================================================

  const value: DepartmentContextValue = {
    department: departmentInfo,
    departmentId,
    selectDepartment,
    clearDepartment,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isStaffDepartment,
    isLearnerDepartment,
  };

  return <DepartmentContext.Provider value={value}>{children}</DepartmentContext.Provider>;
};

// ============================================================================
// Hook
// ============================================================================

/**
 * useDepartment Hook
 *
 * Access department context within a DepartmentProvider
 *
 * @throws Error if used outside DepartmentProvider
 *
 * @example
 * function MyComponent() {
 *   const { department, hasPermission } = useDepartment();
 *
 *   if (!department) {
 *     return <p>No department selected</p>;
 *   }
 *
 *   return (
 *     <div>
 *       <h1>{department.name}</h1>
 *       {hasPermission('content:courses:create') && (
 *         <CreateCourseButton />
 *       )}
 *     </div>
 *   );
 * }
 */
export function useDepartment(): DepartmentContextValue {
  const context = useContext(DepartmentContext);

  if (!context) {
    throw new Error('useDepartment must be used within a DepartmentProvider');
  }

  return context;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract department information from DepartmentRoleGroup
 */
function extractDepartmentInfo(
  deptGroup: DepartmentRoleGroup,
  type: 'staff' | 'learner'
): DepartmentInfo {
  // Collect all roles
  const roles = deptGroup.roles.map((r) => r.role);

  // Collect all permissions (flatten from all roles)
  const permissions = Array.from(
    new Set(deptGroup.roles.flatMap((r) => r.permissions))
  );

  return {
    id: deptGroup.departmentId,
    name: deptGroup.departmentName,
    type,
    isPrimary: deptGroup.isPrimary,
    roles,
    permissions,
  };
}

// ============================================================================
// Export
// ============================================================================

export default DepartmentProvider;
