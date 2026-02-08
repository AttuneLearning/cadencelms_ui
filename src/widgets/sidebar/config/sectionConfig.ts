/**
 * Section-Based Navigation Configuration
 * Redesign per session: 2026-02-05-navigation-dashboard-redesign
 * Version: 1.0.0
 *
 * Universal section structure across all dashboards:
 * - OVERVIEW: Dashboard, Calendar (always visible)
 * - PRIMARY_WORKFLOW: Role's main tasks
 * - SECONDARY_WORKFLOW: Supporting tasks
 * - INSIGHTS: Analytics/Reports
 * - DEPARTMENT: Breadcrumb selector + flat action list
 * - FOOTER: Profile, Settings
 *
 * Key changes from previous structure:
 * - No BASE_NAV_ITEMS (distributed to appropriate sections)
 * - No disabled items for wrong user types
 * - Task-based organization (group by what users DO)
 */

import type { LucideIcon } from 'lucide-react';
import {
  Home,
  User,
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
  FileBarChart,
  TrendingUp,
  Award,
  Building2,
  UserPlus,
  Inbox,
} from 'lucide-react';

// ============================================================================
// Section Types
// ============================================================================

export type SectionId =
  | 'overview'
  | 'primary'
  | 'secondary'
  | 'insights'
  | 'department'
  | 'footer';

export type DashboardType = 'learner' | 'staff' | 'admin';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  requiredPermission?: string;
  /** If true, path uses :deptId placeholder for department-scoped pages */
  departmentScoped?: boolean;
}

export interface NavSection {
  id: SectionId;
  label: string;
  collapsible: boolean;
  defaultExpanded: boolean;
  items: NavItem[];
}

export interface DashboardSections {
  overview: NavSection;
  primary: NavSection;
  secondary: NavSection;
  insights: NavSection;
  footer: NavSection;
}

// ============================================================================
// Helper: Get dashboard-specific path
// ============================================================================

const dashboardPath = (dashboard: DashboardType) => `/${dashboard}/dashboard`;
const calendarPath = (dashboard: DashboardType) => `/${dashboard}/calendar`;
const profilePath = (dashboard: DashboardType) => `/${dashboard}/profile`;
const settingsPath = (dashboard: DashboardType) => `/${dashboard}/settings`;

// ============================================================================
// STAFF SECTIONS
// ============================================================================

export const STAFF_SECTIONS: DashboardSections = {
  overview: {
    id: 'overview',
    label: 'Overview',
    collapsible: false,
    defaultExpanded: true,
    items: [
      {
        id: 'staff-dashboard',
        label: 'Dashboard',
        path: dashboardPath('staff'),
        icon: Home,
      },
      {
        id: 'staff-calendar',
        label: 'Calendar',
        path: calendarPath('staff'),
        icon: CalendarDays,
      },
    ],
  },
  primary: {
    id: 'primary',
    label: 'Teaching',
    collapsible: true,
    defaultExpanded: true,
    items: [
      {
        id: 'staff-courses',
        label: 'My Courses',
        path: '/staff/courses',
        icon: BookOpen,
        requiredPermission: 'content:courses:read',
      },
      {
        id: 'staff-classes',
        label: 'My Classes',
        path: '/staff/classes',
        icon: Calendar,
        requiredPermission: 'class:view-own',
      },
      {
        id: 'staff-grading',
        label: 'Grading',
        path: '/staff/grading',
        icon: CheckSquare,
        requiredPermission: 'grades:own-classes:manage',
      },
    ],
  },
  secondary: {
    id: 'secondary',
    label: 'Management',
    collapsible: true,
    defaultExpanded: false,
    items: [
      {
        id: 'staff-course-summary',
        label: 'Course Summary',
        path: '/staff/analytics/courses',
        icon: FileBarChart,
        requiredPermission: 'reports:department:read',
      },
    ],
  },
  insights: {
    id: 'insights',
    label: 'Insights',
    collapsible: true,
    defaultExpanded: false,
    items: [
      {
        id: 'staff-analytics',
        label: 'Analytics',
        path: '/staff/analytics',
        icon: BarChart,
        requiredPermission: 'reports:department:read',
      },
      {
        id: 'staff-reports',
        label: 'Reports',
        path: '/staff/reports',
        icon: FileText,
        requiredPermission: 'reports:class:read',
      },
    ],
  },
  footer: {
    id: 'footer',
    label: 'Account',
    collapsible: false,
    defaultExpanded: true,
    items: [
      {
        id: 'staff-profile',
        label: 'My Profile',
        path: profilePath('staff'),
        icon: User,
      },
      {
        id: 'staff-settings',
        label: 'Settings',
        path: settingsPath('staff'),
        icon: Settings,
      },
    ],
  },
};

// ============================================================================
// LEARNER SECTIONS
// ============================================================================

export const LEARNER_SECTIONS: DashboardSections = {
  overview: {
    id: 'overview',
    label: 'Overview',
    collapsible: false,
    defaultExpanded: true,
    items: [
      {
        id: 'learner-dashboard',
        label: 'Dashboard',
        path: dashboardPath('learner'),
        icon: Home,
      },
      {
        id: 'learner-calendar',
        label: 'Calendar',
        path: calendarPath('learner'),
        icon: CalendarDays,
      },
    ],
  },
  primary: {
    id: 'primary',
    label: 'Learning',
    collapsible: true,
    defaultExpanded: true,
    items: [
      {
        id: 'learner-inbox',
        label: 'Inbox',
        path: '/learner/inbox',
        icon: Inbox,
      },
      {
        id: 'learner-classes',
        label: 'My Classes',
        path: '/learner/classes',
        icon: Calendar,
      },
      {
        id: 'learner-catalog',
        label: 'Course Catalog',
        path: '/learner/catalog',
        icon: BookOpen,
        requiredPermission: 'course:view-catalog',
      },
    ],
  },
  secondary: {
    id: 'secondary',
    label: 'Progress',
    collapsible: true,
    defaultExpanded: true,
    items: [
      {
        id: 'learner-progress',
        label: 'My Progress',
        path: '/learner/progress',
        icon: TrendingUp,
        requiredPermission: 'dashboard:view-my-progress',
      },
      {
        id: 'learner-certificates',
        label: 'Certificates',
        path: '/learner/certificates',
        icon: Award,
      },
    ],
  },
  insights: {
    id: 'insights',
    label: 'Insights',
    collapsible: true,
    defaultExpanded: false,
    items: [], // Learners don't have analytics/reports access
  },
  footer: {
    id: 'footer',
    label: 'Account',
    collapsible: false,
    defaultExpanded: true,
    items: [
      {
        id: 'learner-profile',
        label: 'My Profile',
        path: profilePath('learner'),
        icon: User,
      },
      {
        id: 'learner-settings',
        label: 'Settings',
        path: settingsPath('learner'),
        icon: Settings,
      },
    ],
  },
};

// ============================================================================
// ADMIN SECTIONS
// ============================================================================

export const ADMIN_SECTIONS: DashboardSections = {
  overview: {
    id: 'overview',
    label: 'Overview',
    collapsible: false,
    defaultExpanded: true,
    items: [
      {
        id: 'admin-dashboard',
        label: 'Dashboard',
        path: dashboardPath('admin'),
        icon: Home,
      },
      {
        id: 'admin-calendar',
        label: 'System Calendar',
        path: calendarPath('admin'),
        icon: CalendarDays,
      },
    ],
  },
  primary: {
    id: 'primary',
    label: 'Administration',
    collapsible: true,
    defaultExpanded: true,
    items: [
      {
        id: 'admin-users',
        label: 'User Management',
        path: '/admin/users',
        icon: Users,
        requiredPermission: 'user:view',
      },
      {
        id: 'admin-departments',
        label: 'Departments',
        path: '/admin/departments',
        icon: Building,
        requiredPermission: 'department:view',
      },
    ],
  },
  secondary: {
    id: 'secondary',
    label: 'Configuration',
    collapsible: true,
    defaultExpanded: false,
    items: [
      {
        id: 'admin-system-settings',
        label: 'System Settings',
        path: '/admin/settings',
        icon: Settings,
        requiredPermission: 'settings:view',
      },
    ],
  },
  insights: {
    id: 'insights',
    label: 'Insights',
    collapsible: true,
    defaultExpanded: true,
    items: [
      {
        id: 'admin-analytics',
        label: 'System Analytics',
        path: '/admin/analytics',
        icon: BarChart,
        requiredPermission: 'dashboard:view-system-overview',
      },
      {
        id: 'admin-reports',
        label: 'System Reports',
        path: '/admin/reports',
        icon: FileText,
        requiredPermission: 'report:view-all',
      },
    ],
  },
  footer: {
    id: 'footer',
    label: 'Account',
    collapsible: false,
    defaultExpanded: true,
    items: [
      {
        id: 'admin-profile',
        label: 'My Profile',
        path: '/admin/profile',
        icon: User,
      },
      {
        id: 'admin-settings-personal',
        label: 'Settings',
        path: '/admin/settings/personal',
        icon: Settings,
      },
    ],
  },
};

// ============================================================================
// Department Action Items (Flat list, no groups)
// ============================================================================

export interface DepartmentActionItem {
  id: string;
  label: string;
  pathTemplate: string; // e.g., '/staff/departments/:deptId/courses'
  icon: LucideIcon;
  requiredPermission: string;
  dashboards: DashboardType[]; // Which dashboards show this action
}

/**
 * Flat list of department actions
 * No more nested groups - breadcrumb handles hierarchy
 */
export const DEPARTMENT_ACTIONS: DepartmentActionItem[] = [
  // Staff department actions
  {
    id: 'dept-manage-courses',
    label: 'Manage Courses',
    pathTemplate: '/staff/departments/:deptId/courses',
    icon: BookOpen,
    requiredPermission: 'content:courses:read',
    dashboards: ['staff'],
  },
  {
    id: 'dept-manage-classes',
    label: 'Manage Classes',
    pathTemplate: '/staff/departments/:deptId/classes',
    icon: Calendar,
    requiredPermission: 'content:classes:read',
    dashboards: ['staff'],
  },
  {
    id: 'dept-create-course',
    label: 'Create Course',
    pathTemplate: '/staff/departments/:deptId/courses/create',
    icon: Plus,
    requiredPermission: 'content:courses:manage',
    dashboards: ['staff'],
  },
  {
    id: 'dept-students',
    label: 'Student Progress',
    pathTemplate: '/staff/departments/:deptId/students',
    icon: Users,
    requiredPermission: 'enrollments:read',
    dashboards: ['staff'],
  },
  {
    id: 'dept-enrollments',
    label: 'Course Enrollments',
    pathTemplate: '/staff/departments/:deptId/enrollments',
    icon: UserPlus,
    requiredPermission: 'enrollment:department:manage',
    dashboards: ['staff'],
  },
  {
    id: 'dept-reports',
    label: 'Department Reports',
    pathTemplate: '/staff/departments/:deptId/reports',
    icon: FileText,
    requiredPermission: 'reports:department:read',
    dashboards: ['staff'],
  },
  {
    id: 'dept-settings',
    label: 'Department Settings',
    pathTemplate: '/staff/departments/:deptId/settings',
    icon: Settings,
    requiredPermission: 'department:settings:manage',
    dashboards: ['staff'],
  },
  {
    id: 'dept-management',
    label: 'Department Management',
    pathTemplate: '/staff/departments/:deptId/manage',
    icon: Building2,
    requiredPermission: 'content:programs:manage',
    dashboards: ['staff'],
  },

  // Learner department actions
  {
    id: 'dept-browse-courses',
    label: 'Browse Courses',
    pathTemplate: '/learner/departments/:deptId/courses',
    icon: Search,
    requiredPermission: 'content:courses:read',
    dashboards: ['learner'],
  },
  {
    id: 'dept-my-enrollments',
    label: 'My Enrollments',
    pathTemplate: '/learner/departments/:deptId/enrollments',
    icon: BookOpen,
    requiredPermission: 'enrollments:own:read',
    dashboards: ['learner'],
  },
  {
    id: 'dept-my-progress',
    label: 'My Progress',
    pathTemplate: '/learner/departments/:deptId/progress',
    icon: TrendingUp,
    requiredPermission: 'progress:own:read',
    dashboards: ['learner'],
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get sections for a specific dashboard type
 */
export function getSectionsForDashboard(dashboard: DashboardType): DashboardSections {
  switch (dashboard) {
    case 'learner':
      return LEARNER_SECTIONS;
    case 'staff':
      return STAFF_SECTIONS;
    case 'admin':
      return ADMIN_SECTIONS;
    default:
      return STAFF_SECTIONS;
  }
}

/**
 * Get department actions for a specific dashboard
 */
export function getDepartmentActionsForDashboard(
  dashboard: DashboardType
): DepartmentActionItem[] {
  return DEPARTMENT_ACTIONS.filter((action) => action.dashboards.includes(dashboard));
}

/**
 * Build department action path from template
 */
export function buildDepartmentActionPath(
  pathTemplate: string,
  departmentId: string
): string {
  return pathTemplate.replace(':deptId', departmentId);
}
