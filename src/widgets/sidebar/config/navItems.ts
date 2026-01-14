/**
 * Navigation Items Configuration
 * Three-section navigation structure (ISS-007, ISS-014)
 * Version: 4.0.0
 * Date: 2026-01-13
 *
 * Section 1: BASE_NAV_ITEMS - Always visible for all users
 * Section 2: CONTEXT_NAV_ITEMS - Changes based on current dashboard
 * Section 3: DEPARTMENT_NAV_ITEMS - Department-specific actions
 *
 * ISS-014 Updates:
 * - Added System Analytics and System Reports to Admin dashboard
 * - Added My Classes (teaching) to Staff dashboard
 * - Added Course Catalog to Learner dashboard
 * - Added Calendar view to all three dashboards
 */

import type { LucideIcon } from 'lucide-react';
import {
  Home,
  User,
  TrendingUp,
  Award,
  Calendar,
  CalendarDays,
  BarChart,
  FileText,
  Users,
  Building,
  Settings,
  Plus,
  BookOpen,
  Search,
  CheckSquare,
} from 'lucide-react';
import type { UserType } from '@/shared/types/auth';

// ============================================================================
// Navigation Item Types
// ============================================================================

export type DashboardContext = 'learner' | 'staff' | 'admin' | '';

export interface BaseNavItem {
  label: string;
  path: string | ((primaryUserType: UserType, currentDashboard?: DashboardContext) => string);
  icon: LucideIcon;
  requiredPermission?: string;
  userTypes?: UserType[]; // If specified, disabled if user doesn't have userType
  showDisabled?: boolean; // Show grayed out when user lacks userType
  departmentScoped?: boolean;
}

export interface ContextNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  requiredPermission?: string;
  departmentScoped?: boolean;
}

export interface DepartmentNavItem {
  label: string;
  pathTemplate: string; // e.g., '/staff/departments/:deptId/courses'
  icon: LucideIcon;
  requiredPermission: string;
  userTypes: UserType[];
  departmentScoped: true;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get current dashboard path based on the current dashboard context
 * Used for Dashboard nav item to keep user in their current context
 */
export const getCurrentDashboardPath = (currentDashboard?: DashboardContext): string => {
  switch (currentDashboard) {
    case 'learner':
      return '/learner/dashboard';
    case 'staff':
      return '/staff/dashboard';
    case 'admin':
      return '/admin/dashboard';
    default:
      return '/staff/dashboard'; // Default fallback
  }
};

/**
 * Get default dashboard path based on user's userTypes
 * Used for login redirect and initial load
 * Priority: staff > global-admin (→staff) > learner
 */
export const getDefaultDashboardPath = (userTypes: UserType[]): string => {
  // Priority order: staff > global-admin > learner
  if (userTypes.includes('staff')) return '/staff/dashboard';
  if (userTypes.includes('global-admin')) return '/staff/dashboard'; // Admin requires escalation (ISS-013)
  if (userTypes.includes('learner')) return '/learner/dashboard';
  return '/staff/dashboard'; // Fallback
};

/**
 * @deprecated Use getCurrentDashboardPath or getDefaultDashboardPath instead
 * Get primary dashboard path based on user's primaryUserType
 */
export const getPrimaryDashboardPath = (
  primaryUserType: UserType,
  _currentDashboard?: DashboardContext
): string => {
  switch (primaryUserType) {
    case 'learner':
      return '/learner/dashboard';
    case 'staff':
      return '/staff/dashboard';
    case 'global-admin':
      return '/staff/dashboard'; // Fixed: Admin requires escalation (ISS-013)
    default:
      return '/staff/dashboard'; // Fixed: Default to staff, not learner
  }
};

// ============================================================================
// SECTION 1: Base Navigation (Always Visible)
// ============================================================================

export const BASE_NAV_ITEMS: BaseNavItem[] = [
  {
    label: 'Dashboard',
    path: (_primaryUserType, currentDashboard) => getCurrentDashboardPath(currentDashboard),
    icon: Home,
  },
  {
    label: 'My Profile',
    path: (_primaryUserType, currentDashboard) => {
      if (currentDashboard === 'staff') return '/staff/profile';
      if (currentDashboard === 'learner') return '/learner/profile';
      return '/profile';
    },
    icon: User,
  },
  {
    label: 'Certificates',
    path: '/learner/certificates',
    icon: Award,
  },
  {
    label: 'Test Page',
    path: '/learner/test-page',
    icon: Search,
    userTypes: ['learner'],
    showDisabled: true,
  },
  {
    label: 'My Progress',
    path: '/learner/progress',
    icon: TrendingUp,
    userTypes: ['learner'],
    showDisabled: true,
    requiredPermission: 'dashboard:view-my-progress',
  },
  // TEMPORARILY DISABLED FOR ISS-008 DEBUG
  // {
  //   label: 'Certificates',
  //   path: '/learner/certificates',
  //   icon: Award,
  //   userTypes: ['learner'],
  //   showDisabled: true,
  //   requiredPermission: 'certificate:view-own-department',
  // },
];

// ============================================================================
// SECTION 2: Context-Specific Navigation (Dashboard-Dependent)
// ============================================================================

export const LEARNER_CONTEXT_NAV: ContextNavItem[] = [
  {
    label: 'My Classes',
    path: '/learner/classes',
    icon: Calendar,
  },
  {
    label: 'Calendar',
    path: '/learner/calendar',
    icon: CalendarDays,
  },
  {
    label: 'Course Catalog',
    path: '/learner/catalog',
    icon: BookOpen,
    requiredPermission: 'course:view-catalog',
  },
];

export const STAFF_CONTEXT_NAV: ContextNavItem[] = [
  {
    label: 'My Courses',
    path: '/staff/courses',
    icon: BookOpen,
    requiredPermission: 'content:courses:read',
    departmentScoped: false,
  },
  {
    label: 'My Classes',
    path: '/staff/classes',
    icon: Calendar,
    requiredPermission: 'class:view-own',
    departmentScoped: false,
  },
  {
    label: 'Calendar',
    path: '/staff/calendar',
    icon: CalendarDays,
  },
  {
    label: 'Analytics',
    path: '/staff/analytics',
    icon: BarChart,
    requiredPermission: 'dashboard:view-department-overview',
    departmentScoped: true,
  },
  {
    label: 'Reports',
    path: '/staff/reports',
    icon: FileText,
    requiredPermission: 'report:view-own-classes',
    departmentScoped: true,
  },
  {
    label: 'Grading',
    path: '/staff/grading',
    icon: CheckSquare,
    requiredPermission: 'grade:edit-department',
    departmentScoped: true,
  },
];

export const ADMIN_CONTEXT_NAV: ContextNavItem[] = [
  {
    label: 'System Analytics',
    path: '/admin/analytics',
    icon: BarChart,
    requiredPermission: 'dashboard:view-system-overview',
    departmentScoped: false,
  },
  {
    label: 'System Reports',
    path: '/admin/reports',
    icon: FileText,
    requiredPermission: 'report:view-all',
    departmentScoped: false,
  },
  {
    label: 'System Calendar',
    path: '/admin/calendar',
    icon: CalendarDays,
  },
  {
    label: 'User Management',
    path: '/admin/users',
    icon: Users,
    requiredPermission: 'user:view',
    departmentScoped: false,
  },
  {
    label: 'Department Management',
    path: '/admin/departments',
    icon: Building,
    requiredPermission: 'department:view',
    departmentScoped: false,
  },
  {
    label: 'System Settings',
    path: '/admin/settings',
    icon: Settings,
    requiredPermission: 'settings:view',
    departmentScoped: false,
  },
];

// ============================================================================
// SECTION 3: Department-Scoped Navigation Items
// ============================================================================

export const DEPARTMENT_NAV_ITEMS: DepartmentNavItem[] = [
  // STAFF Department Actions
  {
    label: 'Create Course',
    pathTemplate: '/staff/departments/:deptId/courses/create',
    icon: Plus,
    requiredPermission: 'course:create-department',
    userTypes: ['staff'],
    departmentScoped: true,
  },
  {
    label: 'Manage Courses',
    pathTemplate: '/staff/departments/:deptId/courses',
    icon: BookOpen,
    requiredPermission: 'course:view-department',
    userTypes: ['staff'],
    departmentScoped: true,
  },
  {
    label: 'Manage Classes',
    pathTemplate: '/staff/departments/:deptId/classes',
    icon: Calendar,
    requiredPermission: 'class:view-department',
    userTypes: ['staff'],
    departmentScoped: true,
  },
  {
    label: 'Student Progress',
    pathTemplate: '/staff/departments/:deptId/students',
    icon: Users,
    requiredPermission: 'student:view-department',
    userTypes: ['staff'],
    departmentScoped: true,
  },
  {
    label: 'Department Reports',
    pathTemplate: '/staff/departments/:deptId/reports',
    icon: FileText,
    requiredPermission: 'report:view-department-all',
    userTypes: ['staff'],
    departmentScoped: true,
  },
  {
    label: 'Department Settings',
    pathTemplate: '/staff/departments/:deptId/settings',
    icon: Settings,
    requiredPermission: 'department:edit',
    userTypes: ['staff'],
    departmentScoped: true,
  },

  // LEARNER Department Actions
  {
    label: 'Browse Courses',
    pathTemplate: '/learner/departments/:deptId/courses',
    icon: Search,
    requiredPermission: 'course:view-department',
    userTypes: ['learner'],
    departmentScoped: true,
  },
  {
    label: 'My Enrollments',
    pathTemplate: '/learner/departments/:deptId/enrollments',
    icon: BookOpen,
    requiredPermission: 'course:enroll-department',
    userTypes: ['learner'],
    departmentScoped: true,
  },
  {
    label: 'Department Progress',
    pathTemplate: '/learner/departments/:deptId/progress',
    icon: TrendingUp,
    requiredPermission: 'dashboard:view-my-progress',
    userTypes: ['learner'],
    departmentScoped: true,
  },
];
