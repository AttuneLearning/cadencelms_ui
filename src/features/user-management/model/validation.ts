/**
 * User Form Validation Schema
 */

import { z } from 'zod';

/**
 * Staff department roles - roles for staff members within departments
 */
export const STAFF_DEPARTMENT_ROLES = [
  { key: 'instructor', displayAs: 'Instructor' },
  { key: 'department-admin', displayAs: 'Department Admin' },
  { key: 'content-admin', displayAs: 'Content Admin' },
  { key: 'billing-admin', displayAs: 'Billing Admin' },
  { key: 'reporting-analyst', displayAs: 'Reporting Analyst' },
] as const;

/**
 * Learner department roles - roles for learners within departments
 */
export const LEARNER_DEPARTMENT_ROLES = [
  { key: 'course-taker', displayAs: 'Course Taker' },
  { key: 'auditor', displayAs: 'Auditor' },
  { key: 'supervisor', displayAs: 'Supervisor' },
] as const;

/**
 * Combined department roles (for backward compatibility)
 * @deprecated Use STAFF_DEPARTMENT_ROLES or LEARNER_DEPARTMENT_ROLES instead
 */
export const DEPARTMENT_ROLES = [
  ...STAFF_DEPARTMENT_ROLES,
  ...LEARNER_DEPARTMENT_ROLES,
] as const;

export type StaffDepartmentRoleKey = typeof STAFF_DEPARTMENT_ROLES[number]['key'];
export type LearnerDepartmentRoleKey = typeof LEARNER_DEPARTMENT_ROLES[number]['key'];
export type DepartmentRoleKey = typeof DEPARTMENT_ROLES[number]['key'];

// Department membership schema for multi-select
export const departmentMembershipSchema = z.object({
  departmentId: z.string().min(1, 'Department ID is required'),
  departmentName: z.string().min(1, 'Department name is required'),
  isPrimary: z.boolean(),
  roles: z.array(z.string()).default([]),
});

export type DepartmentMembershipFormValue = z.infer<typeof departmentMembershipSchema>;

export const userFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .optional()
    .or(z.literal('')),
  roles: z.array(z.enum(['learner', 'staff', 'global-admin'])).min(1, 'At least one role is required'),
  status: z.enum(['active', 'inactive', 'suspended']),
  phoneNumber: z.string().optional(),
  // Legacy single department field (deprecated)
  department: z.string().optional(),
  // Staff department memberships (shown when user has 'staff' role)
  staffDepartmentMemberships: z.array(departmentMembershipSchema).optional(),
  // Learner department memberships (shown when user has 'learner' role)
  learnerDepartmentMemberships: z.array(departmentMembershipSchema).optional(),
  // Legacy combined field (deprecated - use staffDepartmentMemberships/learnerDepartmentMemberships)
  departmentMemberships: z.array(departmentMembershipSchema).optional(),
  jobTitle: z.string().optional(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
