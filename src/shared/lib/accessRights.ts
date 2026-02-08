/**
 * Access Rights Utility Functions for Role System V2
 * Version: 2.0.0
 * Date: 2026-01-10
 *
 * Based on: /contracts/UI_ROLE_SYSTEM_CONTRACTS.md Section 3
 *
 * Access rights follow the pattern: {domain}:{resource}:{action}
 * Examples:
 *   - content:courses:read
 *   - content:courses:manage
 *   - grades:own-classes:manage
 *   - system:* (wildcard - grants all system access)
 */

import type { PermissionScope } from '@/shared/types/auth';

// ============================================================================
// Access Right Domains
// ============================================================================

/**
 * Available access right domains
 */
export const ACCESS_RIGHT_DOMAINS = {
  CONTENT: 'content',
  ENROLLMENT: 'enrollment',
  STAFF: 'staff',
  LEARNER: 'learner',
  REPORTS: 'reports',
  SYSTEM: 'system',
  BILLING: 'billing',
  AUDIT: 'audit',
  GRADES: 'grades',
  SETTINGS: 'settings',
  DEPARTMENT: 'department',
  DASHBOARD: 'dashboard',
} as const;

// ============================================================================
// Parse Access Right
// ============================================================================

/**
 * Parse an access right string into its components
 *
 * @param accessRight - Access right string (e.g., "content:courses:read")
 * @returns Parsed components or null if invalid
 */
export function parseAccessRight(accessRight: string): {
  domain: string;
  resource: string;
  action: string;
} | null {
  const parts = accessRight.split(':');

  if (parts.length !== 3) {
    return null;
  }

  const [domain, resource, action] = parts;

  if (!domain || !resource || !action) {
    return null;
  }

  return { domain, resource, action };
}

// ============================================================================
// Check Access Right (Single)
// ============================================================================

/**
 * Check if user has a specific access right
 *
 * Supports wildcard matching:
 *   - If user has "system:*", grants all system rights
 *   - If user has "content:*", grants all content rights
 *
 * @param userRights - Array of access rights the user has
 * @param required - Required access right to check
 * @param scope - Optional scope context (department ID, etc.)
 * @returns True if user has the required access right
 *
 * @example
 * hasAccessRight(['content:courses:read', 'content:courses:manage'], 'content:courses:read')
 * // Returns: true
 *
 * @example
 * hasAccessRight(['content:*'], 'content:courses:manage')
 * // Returns: true (wildcard match)
 *
 * @example
 * hasAccessRight(['content:courses:read'], 'content:courses:manage')
 * // Returns: false
 */
export function hasAccessRight(
  userRights: string[],
  required: string,
  _scope?: PermissionScope
): boolean {
  // Direct match
  if (userRights.includes(required)) {
    return true;
  }

  // Parse the required right to check for wildcard
  const parsed = parseAccessRight(required);
  if (!parsed) {
    console.warn('[accessRights] Invalid access right format:', required);
    return false;
  }

  const { domain } = parsed;

  // Check for domain wildcard (e.g., "content:*" grants all content rights)
  if (userRights.includes(`${domain}:*`)) {
    return true;
  }

  // Check for system wildcard (e.g., "system:*" grants all system rights)
  if (userRights.includes('system:*')) {
    return true;
  }

  return false;
}

// ============================================================================
// Check Access Rights (Multiple)
// ============================================================================

/**
 * Check if user has ANY of the specified access rights
 *
 * @param userRights - Array of access rights the user has
 * @param required - Array of required access rights (need ANY)
 * @param scope - Optional scope context
 * @returns True if user has at least one of the required rights
 *
 * @example
 * hasAnyAccessRight(['content:courses:read'], ['content:courses:read', 'content:courses:manage'])
 * // Returns: true
 */
export function hasAnyAccessRight(
  userRights: string[],
  required: string[],
  scope?: PermissionScope
): boolean {
  return required.some((right) => hasAccessRight(userRights, right, scope));
}

/**
 * Check if user has ALL of the specified access rights
 *
 * @param userRights - Array of access rights the user has
 * @param required - Array of required access rights (need ALL)
 * @param scope - Optional scope context
 * @returns True if user has all required rights
 *
 * @example
 * hasAllAccessRights(['content:courses:read', 'content:courses:manage'], ['content:courses:read', 'content:courses:manage'])
 * // Returns: true
 */
export function hasAllAccessRights(
  userRights: string[],
  required: string[],
  scope?: PermissionScope
): boolean {
  return required.every((right) => hasAccessRight(userRights, right, scope));
}

// ============================================================================
// Access Right Validation
// ============================================================================

/**
 * Validate if an access right string is properly formatted
 *
 * @param accessRight - Access right string to validate
 * @returns True if valid format
 *
 * @example
 * isValidAccessRight('content:courses:read')
 * // Returns: true
 *
 * @example
 * isValidAccessRight('invalid')
 * // Returns: false
 */
export function isValidAccessRight(accessRight: string): boolean {
  // Check for wildcard
  if (accessRight.endsWith(':*')) {
    const domain = accessRight.slice(0, -2);
    return domain.length > 0 && !domain.includes(':');
  }

  // Check for normal format
  const parsed = parseAccessRight(accessRight);
  return parsed !== null;
}

/**
 * Validate an array of access rights
 *
 * @param accessRights - Array of access rights to validate
 * @returns Object with validation results
 */
export function validateAccessRights(accessRights: string[]): {
  valid: boolean;
  invalidRights: string[];
} {
  const invalidRights = accessRights.filter((right) => !isValidAccessRight(right));

  return {
    valid: invalidRights.length === 0,
    invalidRights,
  };
}

// ============================================================================
// Access Right Filtering
// ============================================================================

/**
 * Filter access rights by domain
 *
 * @param accessRights - Array of access rights to filter
 * @param domain - Domain to filter by
 * @returns Filtered access rights
 *
 * @example
 * filterAccessRightsByDomain(['content:courses:read', 'enrollment:classes:read'], 'content')
 * // Returns: ['content:courses:read']
 */
export function filterAccessRightsByDomain(
  accessRights: string[],
  domain: string
): string[] {
  return accessRights.filter((right) => {
    const parsed = parseAccessRight(right);
    return parsed && parsed.domain === domain;
  });
}

/**
 * Get all domains from access rights
 *
 * @param accessRights - Array of access rights
 * @returns Array of unique domains
 *
 * @example
 * getDomainsFromAccessRights(['content:courses:read', 'enrollment:classes:read'])
 * // Returns: ['content', 'enrollment']
 */
export function getDomainsFromAccessRights(accessRights: string[]): string[] {
  const domains = new Set<string>();

  for (const right of accessRights) {
    const parsed = parseAccessRight(right);
    if (parsed) {
      domains.add(parsed.domain);
    }
  }

  return Array.from(domains);
}

// ============================================================================
// Scope-Based Access Rights
// ============================================================================

/**
 * Check if access right applies to a specific scope
 *
 * @param accessRight - Access right to check
 * @param scope - Scope to check against
 * @returns True if access right applies to scope
 */
export function accessRightAppliestoScope(
  _accessRight: string,
  _scope: PermissionScope
): boolean {
  // For now, all access rights apply to all scopes
  // In the future, we may add scope-specific logic
  // Example: "department:123:*" only applies to department 123
  return true;
}

// ============================================================================
// FERPA-Protected Access Rights
// ============================================================================

/**
 * Access rights that grant access to FERPA-protected student data
 * These require special handling and audit logging
 */
export const FERPA_PROTECTED_RIGHTS = [
  'learner:pii:read',
  'learner:grades:read',
  'learner:transcripts:read',
  'learner:transcripts:export',
  'reports:learner-detail:read',
] as const;

/**
 * Check if an access right is FERPA-protected
 *
 * @param accessRight - Access right to check
 * @returns True if access right is FERPA-protected
 */
export function isFERPAProtectedRight(accessRight: string): boolean {
  return (FERPA_PROTECTED_RIGHTS as readonly string[]).includes(accessRight);
}

/**
 * Check if user has any FERPA-protected access rights
 *
 * @param userRights - Array of access rights the user has
 * @returns True if user has any FERPA-protected rights
 */
export function hasFERPAProtectedAccess(userRights: string[]): boolean {
  return userRights.some((right) => isFERPAProtectedRight(right));
}

// ============================================================================
// Billing/Financial Access Rights
// ============================================================================

/**
 * Access rights that grant access to billing/financial data
 * These require special confirmation dialogs
 */
export const BILLING_PROTECTED_RIGHTS = [
  'billing:payments:read',
  'billing:payments:process',
  'billing:refunds:manage',
  'billing:financial-reports:read',
] as const;

/**
 * Check if an access right is billing-related
 *
 * @param accessRight - Access right to check
 * @returns True if access right is billing-related
 */
export function isBillingProtectedRight(accessRight: string): boolean {
  return (BILLING_PROTECTED_RIGHTS as readonly string[]).includes(accessRight);
}

/**
 * Check if user has any billing access rights
 *
 * @param userRights - Array of access rights the user has
 * @returns True if user has any billing rights
 */
export function hasBillingAccess(userRights: string[]): boolean {
  return userRights.some((right) => isBillingProtectedRight(right));
}

// ============================================================================
// Access Right Formatting
// ============================================================================

/**
 * Format an access right for display
 *
 * @param accessRight - Access right to format
 * @returns Formatted string
 *
 * @example
 * formatAccessRight('content:courses:read')
 * // Returns: 'Content: Courses - Read'
 */
export function formatAccessRight(accessRight: string): string {
  const parsed = parseAccessRight(accessRight);

  if (!parsed) {
    return accessRight;
  }

  const { domain, resource, action } = parsed;

  // Capitalize and format
  const formattedDomain = domain.charAt(0).toUpperCase() + domain.slice(1);
  const formattedResource = resource
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  const formattedAction = action.charAt(0).toUpperCase() + action.slice(1);

  return `${formattedDomain}: ${formattedResource} - ${formattedAction}`;
}

// ============================================================================
// Exports
// ============================================================================

export default {
  hasAccessRight,
  hasAnyAccessRight,
  hasAllAccessRights,
  parseAccessRight,
  isValidAccessRight,
  validateAccessRights,
  filterAccessRightsByDomain,
  getDomainsFromAccessRights,
  accessRightAppliestoScope,
  isFERPAProtectedRight,
  hasFERPAProtectedAccess,
  isBillingProtectedRight,
  hasBillingAccess,
  formatAccessRight,
  ACCESS_RIGHT_DOMAINS,
  FERPA_PROTECTED_RIGHTS,
  BILLING_PROTECTED_RIGHTS,
};
