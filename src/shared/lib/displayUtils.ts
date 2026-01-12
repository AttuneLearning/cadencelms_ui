/**
 * Display Utilities for Role System V2.1
 *
 * Utilities for getting human-readable display labels for user types and roles.
 * Uses server-provided displayAs values from lookup values with client-side fallbacks.
 *
 * Version: 1.0.0
 * Date: 2026-01-11
 */

import { UserType, UserTypeObject, RoleObject } from '../types/auth';

// ============================================================================
// Client-side Fallback Mappings
// ============================================================================

/**
 * Client-side fallback display labels for user types
 * Only used when server displayAs is not available
 */
const USER_TYPE_FALLBACK: Record<UserType, string> = {
  'learner': 'Learner',
  'staff': 'Staff',
  'global-admin': 'System Admin',
};

/**
 * Client-side fallback display labels for common roles
 * Only used when server displayAs is not available
 */
const ROLE_FALLBACK: Record<string, string> = {
  // Staff Roles
  'instructor': 'Instructor',
  'department-admin': 'Department Admin',
  'content-admin': 'Content Admin',
  'billing-admin': 'Billing Admin',

  // Learner Roles
  'course-taker': 'Course Taker',
  'auditor': 'Auditor',
  'learner-supervisor': 'Learner Supervisor',

  // GlobalAdmin Roles
  'system-admin': 'System Admin',
  'enrollment-admin': 'Enrollment Admin',
  'course-admin': 'Course Admin',
  'theme-admin': 'Theme Admin',
  'financial-admin': 'Financial Admin',
};

// ============================================================================
// Display Label Functions
// ============================================================================

/**
 * Get display label for a user type
 *
 * Priority:
 * 1. Server-provided displayMap (from roleHierarchy)
 * 2. Client-side fallback
 * 3. Raw userType value (capitalized)
 *
 * @param userType - The user type key
 * @param displayMap - Optional display map from server (roleHierarchy.userTypeDisplayMap)
 * @returns Human-readable display label
 *
 * @example
 * getUserTypeDisplayLabel('staff', { staff: 'Staff Member' }) // 'Staff Member'
 * getUserTypeDisplayLabel('staff') // 'Staff'
 */
export function getUserTypeDisplayLabel(
  userType: UserType | null | undefined,
  displayMap?: Record<UserType, string>
): string {
  if (!userType) return 'User';

  // Priority 1: Server-provided display label
  if (displayMap?.[userType]) {
    return displayMap[userType];
  }

  // Priority 2: Client-side fallback
  if (USER_TYPE_FALLBACK[userType]) {
    return USER_TYPE_FALLBACK[userType];
  }

  // Priority 3: Capitalize the raw value
  return capitalizeFirst(userType);
}

/**
 * Get display label for a role
 *
 * Priority:
 * 1. Server-provided displayMap (from roleHierarchy)
 * 2. Client-side fallback
 * 3. Raw role value (formatted)
 *
 * @param role - The role key
 * @param displayMap - Optional display map from server (roleHierarchy.roleDisplayMap)
 * @returns Human-readable display label
 *
 * @example
 * getRoleDisplayLabel('instructor', { instructor: 'Course Instructor' }) // 'Course Instructor'
 * getRoleDisplayLabel('instructor') // 'Instructor'
 */
export function getRoleDisplayLabel(
  role: string | null | undefined,
  displayMap?: Record<string, string>
): string {
  if (!role) return 'Role';

  // Priority 1: Server-provided display label
  if (displayMap?.[role]) {
    return displayMap[role];
  }

  // Priority 2: Client-side fallback
  if (ROLE_FALLBACK[role]) {
    return ROLE_FALLBACK[role];
  }

  // Priority 3: Format the raw value (replace hyphens with spaces, capitalize words)
  return formatRoleKey(role);
}

/**
 * Convert UserTypeObject array to display map
 *
 * @param userTypes - Array of UserTypeObject from server
 * @returns Record mapping userType keys to display labels
 *
 * @example
 * const userTypes = [{ _id: 'staff', displayAs: 'Staff Member' }];
 * buildUserTypeDisplayMap(userTypes) // { staff: 'Staff Member' }
 */
export function buildUserTypeDisplayMap(
  userTypes: UserTypeObject[]
): Record<UserType, string> {
  const map: Partial<Record<UserType, string>> = {};

  for (const ut of userTypes) {
    map[ut._id] = ut.displayAs;
  }

  return map as Record<UserType, string>;
}

/**
 * Convert RoleObject array to display map
 *
 * @param roles - Array of RoleObject from server
 * @returns Record mapping role keys to display labels
 *
 * @example
 * const roles = [{ role: 'instructor', displayAs: 'Course Instructor' }];
 * buildRoleDisplayMap(roles) // { instructor: 'Course Instructor' }
 */
export function buildRoleDisplayMap(
  roles: RoleObject[]
): Record<string, string> {
  const map: Record<string, string> = {};

  for (const role of roles) {
    map[role.role] = role.displayAs;
  }

  return map;
}

/**
 * Extract user type keys from UserTypeObject array
 *
 * @param userTypes - Array of UserTypeObject from server
 * @returns Array of user type keys only
 *
 * @example
 * extractUserTypeKeys([{ _id: 'staff', displayAs: 'Staff' }]) // ['staff']
 */
export function extractUserTypeKeys(
  userTypes: UserTypeObject[]
): UserType[] {
  return userTypes.map(ut => ut._id);
}

/**
 * Convert user type keys to UserTypeObject array using fallback labels
 * Useful for backward compatibility or testing
 *
 * @param userTypes - Array of user type keys
 * @returns Array of UserTypeObject with fallback display labels
 *
 * @example
 * toUserTypeObjects(['staff', 'learner'])
 * // [{ _id: 'staff', displayAs: 'Staff' }, { _id: 'learner', displayAs: 'Learner' }]
 */
export function toUserTypeObjects(
  userTypes: UserType[]
): UserTypeObject[] {
  return userTypes.map(ut => ({
    _id: ut,
    displayAs: USER_TYPE_FALLBACK[ut] || capitalizeFirst(ut),
  }));
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Capitalize first letter of a string
 */
function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a role key into human-readable text
 * Converts 'department-admin' to 'Department Admin'
 */
function formatRoleKey(roleKey: string): string {
  return roleKey
    .split('-')
    .map(word => capitalizeFirst(word))
    .join(' ');
}
