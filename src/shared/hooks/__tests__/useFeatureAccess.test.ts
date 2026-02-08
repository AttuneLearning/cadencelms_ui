/**
 * Tests for useFeatureAccess Hook
 * Coverage target: >85%
 */

import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFeatureAccess } from '../useFeatureAccess';
import * as _authStoreModule from '@/features/auth/model/authStore';
import * as _departmentContextModule from '../useDepartmentContext';

// ============================================================================
// Mock Setup
// ============================================================================

// Mock useAuthStore
const mockUseAuthStore = vi.fn();
vi.mock('@/features/auth/model/authStore', () => ({
  useAuthStore: (selector: any) => mockUseAuthStore(selector),
}));

// Mock useDepartmentContext
const mockUseDepartmentContext = vi.fn();
vi.mock('../useDepartmentContext', () => ({
  useDepartmentContext: () => mockUseDepartmentContext(),
}));

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Create a mock role hierarchy with specified permissions
 */
function createMockRoleHierarchy(
  userTypes: string[] = ['staff'],
  permissions: string[] = []
) {
  return {
    primaryUserType: userTypes[0] as any,
    allUserTypes: userTypes as any[],
    defaultDashboard: 'staff' as any,
    globalRoles: [],
    allPermissions: permissions,
    userTypeDisplayMap: {},
    roleDisplayMap: {},
  };
}

/**
 * Create a mock department context with specified permissions
 */
function createMockDepartmentContext(
  departmentId: string | null = 'dept-123',
  permissions: string[] = []
) {
  const hasPermission = (perm: string) => {
    // Check for exact match
    if (permissions.includes(perm)) {
      return true;
    }

    // Check for wildcard patterns (e.g., "content:*" matches "content:courses:read")
    const [domain] = perm.split(':');
    if (permissions.includes(`${domain}:*`)) {
      return true;
    }

    // Check for system-wide wildcard
    if (permissions.includes('system:*')) {
      return true;
    }

    return false;
  };

  const hasAnyPermission = (perms: string[]) => {
    return perms.some((perm) => hasPermission(perm));
  };

  return {
    currentDepartmentId: departmentId,
    currentDepartmentRoles: [],
    currentDepartmentAccessRights: permissions,
    currentDepartmentName: 'Test Department',
    hasPermission,
    hasAnyPermission,
    hasAllPermissions: (perms: string[]) => perms.every(hasPermission),
    hasRole: () => false,
    switchDepartment: vi.fn(),
    isSwitching: false,
    switchError: null,
  };
}

/**
 * Setup mock stores with specified state
 */
function setupMocks(
  userTypes: string[] = ['staff'],
  permissions: string[] = [],
  isAuthenticated: boolean = true,
  isAdminSessionActive: boolean = false,
  departmentId: string | null = 'dept-123'
) {
  const roleHierarchy = createMockRoleHierarchy(userTypes, permissions);
  const departmentContext = createMockDepartmentContext(departmentId, permissions);

  // Mock useAuthStore selector
  mockUseAuthStore.mockImplementation((selector: any) => {
    const state = {
      roleHierarchy,
      isAdminSessionActive,
      isAuthenticated,
    };
    return selector(state);
  });

  // Mock useDepartmentContext
  mockUseDepartmentContext.mockReturnValue(departmentContext);
}

// ============================================================================
// Tests
// ============================================================================

describe('useFeatureAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // ==========================================================================
  // Unauthenticated State Tests
  // ==========================================================================

  describe('Unauthenticated State', () => {
    it('should return all false flags when not authenticated', () => {
      setupMocks([], [], false);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.isLearner).toBe(false);
      expect(result.current.isStaff).toBe(false);
      expect(result.current.canViewCourses).toBe(false);
      expect(result.current.canManageCourses).toBe(false);
      expect(result.current.canAccessAdminPanel).toBe(false);
    });

    it('should return all false flags when roleHierarchy is null', () => {
      mockUseAuthStore.mockImplementation((selector: any) => {
        const state = {
          roleHierarchy: null,
          isAdminSessionActive: false,
          isAuthenticated: true,
        };
        return selector(state);
      });

      mockUseDepartmentContext.mockReturnValue(
        createMockDepartmentContext('dept-123', [])
      );

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.isStaff).toBe(false);
      expect(result.current.canManageCourses).toBe(false);
    });
  });

  // ==========================================================================
  // User Type Flags Tests
  // ==========================================================================

  describe('User Type Flags', () => {
    it('should correctly identify learner user type', () => {
      setupMocks(['learner'], []);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.isLearner).toBe(true);
      expect(result.current.isStaff).toBe(false);
      expect(result.current.isGlobalAdmin).toBe(false);
    });

    it('should correctly identify staff user type', () => {
      setupMocks(['staff'], []);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.isLearner).toBe(false);
      expect(result.current.isStaff).toBe(true);
      expect(result.current.isGlobalAdmin).toBe(false);
    });

    it('should correctly identify global-admin user type', () => {
      setupMocks(['global-admin'], []);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.isLearner).toBe(false);
      expect(result.current.isStaff).toBe(false);
      expect(result.current.isGlobalAdmin).toBe(true);
    });

    it('should handle multiple user types', () => {
      setupMocks(['learner', 'staff'], []);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.isLearner).toBe(true);
      expect(result.current.isStaff).toBe(true);
      expect(result.current.isGlobalAdmin).toBe(false);
    });

    it('should correctly identify active admin session', () => {
      setupMocks(['staff'], [], true, true);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.isAdminActive).toBe(true);
    });
  });

  // ==========================================================================
  // Department Context Tests
  // ==========================================================================

  describe('Department Context', () => {
    it('should detect when department is selected', () => {
      setupMocks(['staff'], [], true, false, 'dept-123');

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.hasDepartmentSelected).toBe(true);
    });

    it('should detect when no department is selected', () => {
      setupMocks(['staff'], [], true, false, null);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.hasDepartmentSelected).toBe(false);
    });
  });

  // ==========================================================================
  // System Administration Tests
  // ==========================================================================

  describe('System Administration Flags', () => {
    it('should grant admin panel access with system:admin permission', () => {
      setupMocks(['staff'], ['system:admin']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canAccessAdminPanel).toBe(true);
    });

    it('should grant admin panel access with system:support permission', () => {
      setupMocks(['staff'], ['system:support']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canAccessAdminPanel).toBe(true);
    });

    it('should grant admin panel access with system:* wildcard', () => {
      setupMocks(['staff'], ['system:*']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canAccessAdminPanel).toBe(true);
    });

    it('should grant admin panel access to global-admin user type', () => {
      setupMocks(['global-admin'], []);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canAccessAdminPanel).toBe(true);
    });

    it('should grant user management with system:users:write', () => {
      setupMocks(['staff'], ['system:users:write']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canManageUsers).toBe(true);
    });

    it('should grant system settings management with system:settings:write', () => {
      setupMocks(['staff'], ['system:settings:write']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canManageSystemSettings).toBe(true);
    });

    it('should grant system settings management with system:settings:manage', () => {
      setupMocks(['staff'], ['system:settings:manage']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canManageSystemSettings).toBe(true);
    });

    it('should grant audit log access with audit:logs:read', () => {
      setupMocks(['staff'], ['audit:logs:read']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canViewAuditLogs).toBe(true);
    });
  });

  // ==========================================================================
  // Content Management Tests
  // ==========================================================================

  describe('Content Management Flags', () => {
    it('should grant course management with content:courses:manage', () => {
      setupMocks(['staff'], ['content:courses:manage']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canManageCourses).toBe(true);
      expect(result.current.canViewCourses).toBe(true); // manage implies view
    });

    it('should grant course viewing with content:courses:read', () => {
      setupMocks(['staff'], ['content:courses:read']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canViewCourses).toBe(true);
      expect(result.current.canManageCourses).toBe(false);
    });

    it('should grant all content permissions with content:* wildcard', () => {
      setupMocks(['staff'], ['content:*']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canManageCourses).toBe(true);
      expect(result.current.canViewCourses).toBe(true);
      expect(result.current.canManageLessons).toBe(true);
      expect(result.current.canViewLessons).toBe(true);
      expect(result.current.canManageResources).toBe(true);
    });

    it('should grant lesson management with content:lessons:manage', () => {
      setupMocks(['staff'], ['content:lessons:manage']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canManageLessons).toBe(true);
      expect(result.current.canViewLessons).toBe(true);
    });

    it('should grant resource management with content:resources:manage', () => {
      setupMocks(['staff'], ['content:resources:manage']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canManageResources).toBe(true);
    });
  });

  // ==========================================================================
  // Learner Management Tests
  // ==========================================================================

  describe('Learner Management Flags', () => {
    it('should grant learner management with learner:department:manage', () => {
      setupMocks(['staff'], ['learner:department:manage']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canManageLearners).toBe(true);
      expect(result.current.canViewLearners).toBe(true); // manage implies read
    });

    it('should grant learner viewing with learner:department:read', () => {
      setupMocks(['staff'], ['learner:department:read']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canViewLearners).toBe(true);
      expect(result.current.canManageLearners).toBe(false);
    });

    it('should grant all learner permissions with learner:* wildcard', () => {
      setupMocks(['staff'], ['learner:*']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canManageLearners).toBe(true);
      expect(result.current.canViewLearners).toBe(true);
      expect(result.current.canViewTranscripts).toBe(true);
      expect(result.current.canViewPII).toBe(true);
      expect(result.current.canViewLearnerProgress).toBe(true);
    });

    it('should grant enrollment management with enrollment:department:manage', () => {
      setupMocks(['staff'], ['enrollment:department:manage']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canManageEnrollments).toBe(true);
    });

    it('should grant grade viewing with grades:department:read', () => {
      setupMocks(['staff'], ['grades:department:read']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canManageGrades).toBe(true);
      expect(result.current.canViewGrades).toBe(true);
    });
  });

  // ==========================================================================
  // Department Management Tests
  // ==========================================================================

  describe('Department Management Flags', () => {
    it('should grant department role management with staff:department:manage', () => {
      setupMocks(['staff'], ['staff:department:manage']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canManageDepartmentRoles).toBe(true);
    });

    it('should grant department staff management with staff:department:manage', () => {
      setupMocks(['staff'], ['staff:department:manage']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canManageDepartmentStaff).toBe(true);
      expect(result.current.canViewDepartmentStaff).toBe(true);
    });

    it('should grant all department permissions with staff:* wildcard', () => {
      setupMocks(['staff'], ['staff:*']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canManageDepartmentRoles).toBe(true);
      expect(result.current.canManageDepartmentStaff).toBe(true);
      expect(result.current.canViewDepartmentStaff).toBe(true);
    });
  });

  // ==========================================================================
  // Billing & Finance Tests
  // ==========================================================================

  describe('Billing & Finance Flags', () => {
    it('should grant billing management with billing:department:manage', () => {
      setupMocks(['staff'], ['billing:department:manage']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canManageBilling).toBe(true);
      expect(result.current.canViewBilling).toBe(false); // manage does not imply read
    });

    it('should grant billing viewing with billing:department:read', () => {
      setupMocks(['staff'], ['billing:department:read']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canViewBilling).toBe(true);
      expect(result.current.canManageBilling).toBe(false);
    });

    it('should grant all billing permissions with billing:* wildcard', () => {
      setupMocks(['staff'], ['billing:*']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canManageBilling).toBe(true);
      expect(result.current.canViewBilling).toBe(true);
    });
  });

  // ==========================================================================
  // Reports & Analytics Tests
  // ==========================================================================

  describe('Reports & Analytics Flags', () => {
    it('should grant report viewing with reports:* wildcard', () => {
      setupMocks(['staff'], ['reports:*']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canViewReports).toBe(true);
      expect(result.current.canExportData).toBe(true);
      expect(result.current.canViewDepartmentReports).toBe(true);
    });

    it('should grant report viewing with system:admin', () => {
      setupMocks(['staff'], ['system:admin']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canViewReports).toBe(true);
      expect(result.current.canExportData).toBe(false); // system:admin doesn't grant export, only system:*
    });

    it('should grant report viewing with reports:department:read', () => {
      setupMocks(['staff'], ['reports:department:read']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canViewReports).toBe(true);
      expect(result.current.canViewDepartmentReports).toBe(true);
    });

    it('should grant data export with reports:department:export', () => {
      setupMocks(['staff'], ['reports:department:export']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canExportData).toBe(true);
    });
  });

  // ==========================================================================
  // Class Management Tests
  // ==========================================================================

  describe('Class Management Flags', () => {
    it('should grant own class viewing with content:classes:read', () => {
      setupMocks(['staff'], ['content:classes:read']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canViewOwnClasses).toBe(true);
      expect(result.current.canViewAllClasses).toBe(true);
      expect(result.current.canManageOwnClasses).toBe(false);
    });

    it('should grant own class management with content:classes:manage-own', () => {
      setupMocks(['staff'], ['content:classes:manage-own']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canViewOwnClasses).toBe(true);
      expect(result.current.canManageOwnClasses).toBe(true);
    });

    it('should grant all class viewing with content:classes:manage', () => {
      setupMocks(['staff'], ['content:classes:manage']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canViewAllClasses).toBe(true);
      expect(result.current.canManageOwnClasses).toBe(true);
    });

    it('should grant all class permissions with content:* wildcard', () => {
      setupMocks(['staff'], ['content:*']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canViewOwnClasses).toBe(true);
      expect(result.current.canManageOwnClasses).toBe(true);
      expect(result.current.canViewAllClasses).toBe(true);
    });
  });

  // ==========================================================================
  // Grading Tests
  // ==========================================================================

  describe('Grading Flags', () => {
    it('should grant own class grading with grades:own-classes:manage', () => {
      setupMocks(['staff'], ['grades:own-classes:manage']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canGradeOwnClasses).toBe(true);
    });

    it('should grant own grade viewing with grades:department:read', () => {
      setupMocks(['learner'], ['grades:department:read']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canViewOwnGrades).toBe(true);
    });

    it('should grant all grade management with grades:own-classes:manage', () => {
      setupMocks(['staff'], ['grades:own-classes:manage']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canManageAllGrades).toBe(true);
      expect(result.current.canGradeOwnClasses).toBe(true);
    });

    it('should grant all grading permissions with grades:* wildcard', () => {
      setupMocks(['staff'], ['grades:*']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canGradeOwnClasses).toBe(true);
      expect(result.current.canViewOwnGrades).toBe(true);
      expect(result.current.canManageAllGrades).toBe(true);
    });
  });

  // ==========================================================================
  // FERPA-Protected Data Tests
  // ==========================================================================

  describe('FERPA-Protected Data Flags', () => {
    it('should grant transcript viewing with learner:department:read', () => {
      setupMocks(['staff'], ['learner:department:read']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canViewTranscripts).toBe(true);
    });

    it('should grant PII viewing with learner:department:read', () => {
      setupMocks(['staff'], ['learner:department:read']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canViewPII).toBe(true);
    });

    it('should grant learner progress viewing with learner:department:read', () => {
      setupMocks(['staff'], ['learner:department:read']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canViewLearnerProgress).toBe(true);
    });

    it('should grant all FERPA data access with learner:* wildcard', () => {
      setupMocks(['staff'], ['learner:*']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canViewTranscripts).toBe(true);
      expect(result.current.canViewPII).toBe(true);
      expect(result.current.canViewLearnerProgress).toBe(true);
    });
  });

  // ==========================================================================
  // Settings Tests
  // ==========================================================================

  describe('Settings Flags', () => {
    it('should grant department settings management with settings:department:manage', () => {
      setupMocks(['staff'], ['settings:department:manage']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canManageDepartmentSettings).toBe(true);
      expect(result.current.canViewDepartmentSettings).toBe(true);
    });

    it('should grant department settings viewing with settings:department:manage', () => {
      setupMocks(['staff'], ['settings:department:manage']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canViewDepartmentSettings).toBe(true);
      expect(result.current.canManageDepartmentSettings).toBe(true);
    });

    it('should grant all settings permissions with settings:* wildcard', () => {
      setupMocks(['staff'], ['settings:*']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canManageDepartmentSettings).toBe(true);
      expect(result.current.canViewDepartmentSettings).toBe(true);
    });
  });

  // ==========================================================================
  // Wildcard Permission Tests
  // ==========================================================================

  describe('Wildcard Permissions', () => {
    it('should grant all permissions with system:* wildcard', () => {
      setupMocks(['staff'], ['system:*']);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canAccessAdminPanel).toBe(true);
      expect(result.current.canManageUsers).toBe(true);
      expect(result.current.canManageSystemSettings).toBe(true);
      expect(result.current.canViewAuditLogs).toBe(true);
      expect(result.current.canViewReports).toBe(true);
      expect(result.current.canExportData).toBe(true);
      expect(result.current.canViewDepartmentReports).toBe(true);
    });

    it('should handle multiple wildcard permissions', () => {
      setupMocks(['staff'], ['content:*', 'learner:*', 'reports:*']);

      const { result } = renderHook(() => useFeatureAccess());

      // Content permissions
      expect(result.current.canManageCourses).toBe(true);
      expect(result.current.canManageLessons).toBe(true);
      expect(result.current.canManageResources).toBe(true);

      // Learner permissions
      expect(result.current.canManageLearners).toBe(true);
      expect(result.current.canViewTranscripts).toBe(true);
      expect(result.current.canViewPII).toBe(true);

      // Report permissions
      expect(result.current.canViewReports).toBe(true);
      expect(result.current.canExportData).toBe(true);
    });
  });

  // ==========================================================================
  // Memoization Tests
  // ==========================================================================

  describe('Memoization', () => {
    it('should return the same object reference when dependencies do not change', () => {
      setupMocks(['staff'], ['content:courses:read']);

      const { result, rerender } = renderHook(() => useFeatureAccess());
      const firstResult = result.current;

      rerender();
      const secondResult = result.current;

      expect(firstResult).toBe(secondResult);
    });

    it('should return new object when permissions change', () => {
      setupMocks(['staff'], ['content:courses:read']);

      const { result, rerender } = renderHook(() => useFeatureAccess());
      const firstResult = result.current;

      // Change permissions
      setupMocks(['staff'], ['content:courses:read', 'content:courses:manage']);
      rerender();
      const secondResult = result.current;

      expect(firstResult).not.toBe(secondResult);
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle empty permissions array', () => {
      setupMocks(['staff'], []);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canManageCourses).toBe(false);
      expect(result.current.canViewCourses).toBe(false);
      expect(result.current.canAccessAdminPanel).toBe(false);
    });

    it('should handle mixed specific and wildcard permissions', () => {
      setupMocks(['staff'], [
        'content:courses:read',
        'learner:*',
        'billing:department:read',
      ]);

      const { result } = renderHook(() => useFeatureAccess());

      expect(result.current.canViewCourses).toBe(true);
      expect(result.current.canManageCourses).toBe(false);
      expect(result.current.canManageLearners).toBe(true);
      expect(result.current.canViewLearners).toBe(true);
      expect(result.current.canViewBilling).toBe(true);
      expect(result.current.canManageBilling).toBe(false);
    });
  });
});
