/**
 * useFeatureAccess Hook - Track 2C Implementation
 * Version: 1.0.0
 * Date: 2026-01-11
 *
 * Provides centralized feature flags based on permissions.
 * Reduces code duplication and improves developer experience.
 *
 * Features:
 * - 20+ boolean feature flags covering all major domains
 * - Memoized for performance (no unnecessary re-renders)
 * - Handles department-scoped permissions correctly
 * - Handles global permissions and wildcards
 * - Returns typed object with all flags
 *
 * Dependencies:
 * - authStore: for user types and global permissions
 * - useDepartmentContext: for department-scoped permission checking
 *
 * @example
 * ```tsx
 * function CoursesPage() {
 *   const features = useFeatureAccess();
 *
 *   return (
 *     <div>
 *       {features.canManageCourses && (
 *         <Button onClick={() => navigate('/courses/create')}>
 *           Create Course
 *         </Button>
 *       )}
 *       {features.canViewCourses ? (
 *         <CourseList />
 *       ) : (
 *         <AccessDenied />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */

import { useMemo } from 'react';
import { useAuthStore } from '@/features/auth/model/authStore';
import { useDepartmentContext } from './useDepartmentContext';

// ============================================================================
// Types
// ============================================================================

/**
 * Complete feature access flags covering all major domains
 */
export interface FeatureAccessFlags {
  // ============================================================
  // User Type Flags
  // ============================================================
  /** Is the user a learner? */
  isLearner: boolean;

  /** Is the user a staff member? */
  isStaff: boolean;

  /** Is the user a global admin? */
  isGlobalAdmin: boolean;

  /** Is an admin session currently active (escalated)? */
  isAdminActive: boolean;

  // ============================================================
  // Department Context
  // ============================================================
  /** Has the user selected a department? */
  hasDepartmentSelected: boolean;

  // ============================================================
  // System Administration (4 flags)
  // ============================================================
  /** Can access admin panel (system:admin OR system:support) */
  canAccessAdminPanel: boolean;

  /** Can manage users (system:users:write) */
  canManageUsers: boolean;

  /** Can manage system settings (system:settings:write OR system:settings:manage) */
  canManageSystemSettings: boolean;

  /** Can view audit logs (audit:logs:read) */
  canViewAuditLogs: boolean;

  // ============================================================
  // Content Management (5 flags)
  // ============================================================
  /** Can manage courses - create/edit/delete (content:courses:manage) */
  canManageCourses: boolean;

  /** Can view courses (content:courses:read) */
  canViewCourses: boolean;

  /** Can manage lessons - create/edit/delete (content:lessons:manage) */
  canManageLessons: boolean;

  /** Can view lessons (content:lessons:read) */
  canViewLessons: boolean;

  /** Can manage learning resources (content:resources:manage) */
  canManageResources: boolean;

  // ============================================================
  // Learner Management (5 flags)
  // ============================================================
  /** Can manage learner profiles - create/edit (learners:profiles:write) */
  canManageLearners: boolean;

  /** Can view learner profiles (learners:profiles:read) */
  canViewLearners: boolean;

  /** Can manage enrollments (learners:enrollments:write) */
  canManageEnrollments: boolean;

  /** Can edit grades (learners:grades:write) */
  canManageGrades: boolean;

  /** Can view grades (learners:grades:read) */
  canViewGrades: boolean;

  // ============================================================
  // Department Management (3 flags)
  // ============================================================
  /** Can manage department roles (department:roles:write) */
  canManageDepartmentRoles: boolean;

  /** Can manage department staff (department:staff:write) */
  canManageDepartmentStaff: boolean;

  /** Can view department staff (department:staff:read) */
  canViewDepartmentStaff: boolean;

  // ============================================================
  // Billing & Finance (2 flags)
  // ============================================================
  /** Can manage billing/invoices (billing:invoices:write) */
  canManageBilling: boolean;

  /** Can view billing/invoices (billing:invoices:read) */
  canViewBilling: boolean;

  // ============================================================
  // Reports & Analytics (3 flags)
  // ============================================================
  /** Can view reports (reports:* OR system:admin) */
  canViewReports: boolean;

  /** Can export data (reports:export OR system:admin) */
  canExportData: boolean;

  /** Can view department reports (reports:department:read) */
  canViewDepartmentReports: boolean;

  // ============================================================
  // Class Management (3 flags)
  // ============================================================
  /** Can view own classes (class:own:read) */
  canViewOwnClasses: boolean;

  /** Can manage own classes (class:own:manage) */
  canManageOwnClasses: boolean;

  /** Can view all classes in department (class:all:read) */
  canViewAllClasses: boolean;

  // ============================================================
  // Grading (4 flags)
  // ============================================================
  /** Can grade own classes (grades:own-classes:manage) */
  canGradeOwnClasses: boolean;

  /** Can view own grades (grades:own:read) */
  canViewOwnGrades: boolean;

  /** Can manage all grades in department (grades:all:manage) */
  canManageAllGrades: boolean;

  /** Can override student grades with audit logging (academic:grades:override) */
  canOverrideGrades: boolean;

  // ============================================================
  // FERPA-Protected Data (3 flags)
  // ============================================================
  /** Can view learner transcripts (learner:transcripts:read) */
  canViewTranscripts: boolean;

  /** Can view PII (learner:pii:read) */
  canViewPII: boolean;

  /** Can view learner progress (learner:progress:read) */
  canViewLearnerProgress: boolean;

  // ============================================================
  // Settings (2 flags)
  // ============================================================
  /** Can manage department settings (settings:department:manage) */
  canManageDepartmentSettings: boolean;

  /** Can view department settings (settings:department:read) */
  canViewDepartmentSettings: boolean;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook to get centralized feature access flags
 *
 * Returns memoized boolean flags for all major features in the system.
 * Checks permissions from both global scope and department scope.
 *
 * Performance: Uses useMemo to prevent unnecessary recalculations.
 * Only recomputes when hasPermission, userTypes, or isAuthenticated changes.
 *
 * @returns Complete feature access flags
 *
 * @example
 * ```tsx
 * function NavigationMenu() {
 *   const features = useFeatureAccess();
 *
 *   return (
 *     <nav>
 *       {features.canViewCourses && <NavLink to="/courses">Courses</NavLink>}
 *       {features.canViewLearners && <NavLink to="/learners">Learners</NavLink>}
 *       {features.canViewBilling && <NavLink to="/billing">Billing</NavLink>}
 *       {features.canAccessAdminPanel && <NavLink to="/admin">Admin</NavLink>}
 *     </nav>
 *   );
 * }
 * ```
 */
export function useFeatureAccess(): FeatureAccessFlags {
  // Get department context for scoped permission checking
  const {
    hasPermission,
    hasAnyPermission,
    currentDepartmentId,
  } = useDepartmentContext();

  // Get auth state for user types and admin session
  const roleHierarchy = useAuthStore((state) => state.roleHierarchy);
  const isAdminSessionActive = useAuthStore((state) => state.isAdminSessionActive);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Memoize all feature flags to prevent unnecessary re-renders
  return useMemo(() => {
    // If not authenticated or no role hierarchy, return all false
    if (!isAuthenticated || !roleHierarchy || !roleHierarchy.allUserTypes) {
      return createEmptyFlags();
    }

    const userTypes = roleHierarchy.allUserTypes;

    return {
      // ============================================================
      // User Type Flags
      // ============================================================
      isLearner: userTypes.includes('learner'),
      isStaff: userTypes.includes('staff'),
      isGlobalAdmin: userTypes.includes('global-admin'),
      isAdminActive: isAdminSessionActive,

      // ============================================================
      // Department Context
      // ============================================================
      hasDepartmentSelected: !!currentDepartmentId,

      // ============================================================
      // System Administration
      // ============================================================
      canAccessAdminPanel:
        hasAnyPermission(['system:admin', 'system:support', 'system:*']) ||
        userTypes.includes('global-admin'),

      canManageUsers:
        hasPermission('system:users:write') ||
        hasPermission('system:*'),

      canManageSystemSettings:
        hasAnyPermission(['system:settings:write', 'system:settings:manage', 'system:*']),

      canViewAuditLogs:
        hasPermission('audit:logs:read') ||
        hasPermission('audit:*') ||
        hasPermission('system:*'),

      // ============================================================
      // Content Management
      // ============================================================
      canManageCourses:
        hasPermission('content:courses:manage') ||
        hasPermission('content:*'),

      canViewCourses:
        hasPermission('content:courses:read') ||
        hasPermission('content:courses:manage') ||
        hasPermission('content:*'),

      canManageLessons:
        hasPermission('content:lessons:manage') ||
        hasPermission('content:*'),

      canViewLessons:
        hasPermission('content:lessons:read') ||
        hasPermission('content:lessons:manage') ||
        hasPermission('content:*'),

      canManageResources:
        hasPermission('content:resources:manage') ||
        hasPermission('content:*'),

      // ============================================================
      // Learner Management
      // ============================================================
      canManageLearners:
        hasPermission('learners:profiles:write') ||
        hasPermission('learners:*'),

      canViewLearners:
        hasPermission('learners:profiles:read') ||
        hasPermission('learners:profiles:write') ||
        hasPermission('learners:*'),

      canManageEnrollments:
        hasPermission('learners:enrollments:write') ||
        hasPermission('learners:*'),

      canManageGrades:
        hasPermission('learners:grades:write') ||
        hasPermission('learners:*') ||
        hasPermission('grades:all:manage'),

      canViewGrades:
        hasPermission('learners:grades:read') ||
        hasPermission('learners:grades:write') ||
        hasPermission('learners:*'),

      // ============================================================
      // Department Management
      // ============================================================
      canManageDepartmentRoles:
        hasPermission('department:roles:write') ||
        hasPermission('department:*'),

      canManageDepartmentStaff:
        hasPermission('department:staff:write') ||
        hasPermission('department:*'),

      canViewDepartmentStaff:
        hasPermission('department:staff:read') ||
        hasPermission('department:staff:write') ||
        hasPermission('department:*'),

      // ============================================================
      // Billing & Finance
      // ============================================================
      canManageBilling:
        hasPermission('billing:invoices:write') ||
        hasPermission('billing:*'),

      canViewBilling:
        hasPermission('billing:invoices:read') ||
        hasPermission('billing:invoices:write') ||
        hasPermission('billing:*'),

      // ============================================================
      // Reports & Analytics
      // ============================================================
      canViewReports:
        hasAnyPermission(['reports:*', 'system:admin', 'system:*']) ||
        hasPermission('reports:department:read') ||
        hasPermission('reports:own-classes:read') ||
        hasPermission('reports:own:read'),

      canExportData:
        hasAnyPermission(['reports:export', 'reports:*', 'system:admin', 'system:*']),

      canViewDepartmentReports:
        hasPermission('reports:department:read') ||
        hasPermission('reports:*') ||
        hasPermission('system:*'),

      // ============================================================
      // Class Management
      // ============================================================
      canViewOwnClasses:
        hasPermission('class:own:read') ||
        hasPermission('class:own:manage') ||
        hasPermission('class:*'),

      canManageOwnClasses:
        hasPermission('class:own:manage') ||
        hasPermission('class:*'),

      canViewAllClasses:
        hasPermission('class:all:read') ||
        hasPermission('class:*'),

      // ============================================================
      // Grading
      // ============================================================
      canGradeOwnClasses:
        hasPermission('grades:own-classes:manage') ||
        hasPermission('grades:all:manage') ||
        hasPermission('grades:*'),

      canViewOwnGrades:
        hasPermission('grades:own:read') ||
        hasPermission('grades:*'),

      canManageAllGrades:
        hasPermission('grades:all:manage') ||
        hasPermission('grades:*'),

      canOverrideGrades:
        hasPermission('academic:grades:override') ||
        hasPermission('academic:*') ||
        hasPermission('grades:*'),

      // ============================================================
      // FERPA-Protected Data
      // ============================================================
      canViewTranscripts:
        hasPermission('learner:transcripts:read') ||
        hasPermission('learner:*'),

      canViewPII:
        hasPermission('learner:pii:read') ||
        hasPermission('learner:*'),

      canViewLearnerProgress:
        hasPermission('learner:progress:read') ||
        hasPermission('learner:*'),

      // ============================================================
      // Settings
      // ============================================================
      canManageDepartmentSettings:
        hasPermission('settings:department:manage') ||
        hasPermission('settings:*'),

      canViewDepartmentSettings:
        hasPermission('settings:department:read') ||
        hasPermission('settings:department:manage') ||
        hasPermission('settings:*'),
    };
  }, [
    hasPermission,
    hasAnyPermission,
    currentDepartmentId,
    roleHierarchy,
    isAdminSessionActive,
    isAuthenticated,
  ]);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create empty flags object (all false) for unauthenticated state
 */
function createEmptyFlags(): FeatureAccessFlags {
  return {
    // User Type Flags
    isLearner: false,
    isStaff: false,
    isGlobalAdmin: false,
    isAdminActive: false,

    // Department Context
    hasDepartmentSelected: false,

    // System Administration
    canAccessAdminPanel: false,
    canManageUsers: false,
    canManageSystemSettings: false,
    canViewAuditLogs: false,

    // Content Management
    canManageCourses: false,
    canViewCourses: false,
    canManageLessons: false,
    canViewLessons: false,
    canManageResources: false,

    // Learner Management
    canManageLearners: false,
    canViewLearners: false,
    canManageEnrollments: false,
    canManageGrades: false,
    canViewGrades: false,

    // Department Management
    canManageDepartmentRoles: false,
    canManageDepartmentStaff: false,
    canViewDepartmentStaff: false,

    // Billing & Finance
    canManageBilling: false,
    canViewBilling: false,

    // Reports & Analytics
    canViewReports: false,
    canExportData: false,
    canViewDepartmentReports: false,

    // Class Management
    canViewOwnClasses: false,
    canManageOwnClasses: false,
    canViewAllClasses: false,

    // Grading
    canGradeOwnClasses: false,
    canViewOwnGrades: false,
    canManageAllGrades: false,
    canOverrideGrades: false,

    // FERPA-Protected Data
    canViewTranscripts: false,
    canViewPII: false,
    canViewLearnerProgress: false,

    // Settings
    canManageDepartmentSettings: false,
    canViewDepartmentSettings: false,
  };
}
