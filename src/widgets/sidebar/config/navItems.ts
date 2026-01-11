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
    path: '/learner/profile',
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
    path: '/staff/profile',
    icon: User,
    userTypes: ['staff'],
  },
  {
    label: 'My Classes',
    path: '/staff/classes',
    icon: Calendar,
    userTypes: ['staff'],
    requiredPermission: 'class:view-own',
  },
  {
    label: 'Analytics',
    path: '/staff/analytics',
    icon: BarChart,
    userTypes: ['staff'],
    requiredPermission: 'dashboard:view-department-overview',
  },
  {
    label: 'Reports',
    path: '/staff/reports',
    icon: FileText,
    userTypes: ['staff'],
    requiredPermission: 'report:view-own-classes',
  },
  {
    label: 'Grading',
    path: '/staff/grading',
    icon: FileText,
    userTypes: ['staff'],
    requiredPermission: 'grade:edit-department',
  },

  // ============================================================
  // GLOBAL ADMIN Navigation
  // ============================================================
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: Home,
    userTypes: ['global-admin'],
  },
  {
    label: 'User Management',
    path: '/admin/users',
    icon: Users,
    userTypes: ['global-admin'],
    requiredPermission: 'user:view',
  },
  {
    label: 'Department Management',
    path: '/admin/departments',
    icon: Building,
    userTypes: ['global-admin'],
    requiredPermission: 'department:view',
  },
  {
    label: 'System Settings',
    path: '/admin/settings',
    icon: Settings,
    userTypes: ['global-admin'],
    requiredPermission: 'settings:view',
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
  },
  {
    label: 'Manage Courses',
    pathTemplate: '/staff/departments/:deptId/courses',
    icon: BookOpen,
    requiredPermission: 'course:view-department',
    userTypes: ['staff'],
  },
  {
    label: 'Manage Classes',
    pathTemplate: '/staff/departments/:deptId/classes',
    icon: Calendar,
    requiredPermission: 'class:view-department',
    userTypes: ['staff'],
  },
  {
    label: 'Student Progress',
    pathTemplate: '/staff/departments/:deptId/students',
    icon: Users,
    requiredPermission: 'student:view-department',
    userTypes: ['staff'],
  },
  {
    label: 'Department Reports',
    pathTemplate: '/staff/departments/:deptId/reports',
    icon: FileText,
    requiredPermission: 'report:view-department-all',
    userTypes: ['staff'],
  },
  {
    label: 'Department Settings',
    pathTemplate: '/staff/departments/:deptId/settings',
    icon: Settings,
    requiredPermission: 'department:edit',
    userTypes: ['staff'],
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
  },
  {
    label: 'My Enrollments',
    pathTemplate: '/learner/departments/:deptId/enrollments',
    icon: BookOpen,
    requiredPermission: 'course:enroll-department',
    userTypes: ['learner'],
  },
  {
    label: 'Department Progress',
    pathTemplate: '/learner/departments/:deptId/progress',
    icon: TrendingUp,
    requiredPermission: 'dashboard:view-my-progress',
    userTypes: ['learner'],
  },
];
