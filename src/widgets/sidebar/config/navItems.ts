/**
 * Navigation Items Configuration
 * Defines global navigation and department-scoped navigation items
 * Version: 2.0.0
 * Date: 2026-01-10
 */

import type { LucideIcon } from 'lucide-react';
import {
  Home,
  User,
  TrendingUp,
  Award,
  Calendar,
  BarChart,
  FileText,
  Users,
  Building,
  Settings,
  Plus,
  BookOpen,
  Search,
} from 'lucide-react';
import type { UserType } from '@/shared/types/auth';

// ============================================================================
// Global Navigation Items
// ============================================================================

export interface GlobalNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  requiredPermission?: string;
  userTypes: UserType[];
  /** If true, check permission in currently selected department only */
  departmentScoped?: boolean;
}

export const GLOBAL_NAV_ITEMS: GlobalNavItem[] = [
  // ============================================================
  // LEARNER Navigation
  // ============================================================
  {
    label: 'Dashboard',
    path: '/learner/dashboard',
    icon: Home,
    userTypes: ['learner'],
  },
  {
    label: 'My Profile',
    path: '/profile',
    icon: User,
    userTypes: ['learner'],
  },
  {
    label: 'My Progress',
    path: '/learner/progress',
    icon: TrendingUp,
    userTypes: ['learner'],
    requiredPermission: 'dashboard:view-my-progress',
  },
  {
    label: 'Certificates',
    path: '/learner/certificates',
    icon: Award,
    userTypes: ['learner'],
    requiredPermission: 'certificate:view-own-department',
  },

  // ============================================================
  // STAFF Navigation
  // ============================================================
  {
    label: 'Dashboard',
    path: '/staff/dashboard',
    icon: Home,
    userTypes: ['staff'],
  },
  {
    label: 'My Profile',
    path: '/profile',
    icon: User,
    userTypes: ['staff'],
  },
  {
    label: 'My Classes',
    path: '/staff/classes',
    icon: Calendar,
    userTypes: ['staff'],
    requiredPermission: 'class:view-own',
    departmentScoped: true, // Check in current department only
  },
  {
    label: 'Analytics',
    path: '/staff/analytics',
    icon: BarChart,
    userTypes: ['staff'],
    requiredPermission: 'dashboard:view-department-overview',
    departmentScoped: true, // Check in current department only
  },
  {
    label: 'Reports',
    path: '/staff/reports',
    icon: FileText,
    userTypes: ['staff'],
    requiredPermission: 'report:view-own-classes',
    departmentScoped: true, // Check in current department only
  },
  {
    label: 'Grading',
    path: '/staff/grading',
    icon: FileText,
    userTypes: ['staff'],
    requiredPermission: 'grade:edit-department',
    departmentScoped: true, // Check in current department only
  },

  // ============================================================
  // GLOBAL ADMIN Navigation
  // ============================================================
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: Home,
    userTypes: ['global-admin'],
    departmentScoped: false, // Global admin permissions (not department-specific)
  },
  {
    label: 'User Management',
    path: '/admin/users',
    icon: Users,
    userTypes: ['global-admin'],
    requiredPermission: 'user:view',
    departmentScoped: false, // Global admin permissions (not department-specific)
  },
  {
    label: 'Department Management',
    path: '/admin/departments',
    icon: Building,
    userTypes: ['global-admin'],
    requiredPermission: 'department:view',
    departmentScoped: false, // Global admin permissions (not department-specific)
  },
  {
    label: 'System Settings',
    path: '/admin/settings',
    icon: Settings,
    userTypes: ['global-admin'],
    requiredPermission: 'settings:view',
    departmentScoped: false, // Global admin permissions (not department-specific)
  },
];

// ============================================================================
// Department-Scoped Navigation Items
// ============================================================================

export interface DepartmentNavItem {
  label: string;
  pathTemplate: string; // e.g., '/staff/departments/:deptId/courses'
  icon: LucideIcon;
  requiredPermission: string; // Must have in selected department
  userTypes: UserType[];
  /** Always true for department items - permission must exist in the specific department */
  departmentScoped: true;
}

export const DEPARTMENT_NAV_ITEMS: DepartmentNavItem[] = [
  // ============================================================
  // STAFF Department Actions
  // ============================================================
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

  // ============================================================
  // LEARNER Department Actions
  // ============================================================
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
