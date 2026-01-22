/**
 * Authentication and Authorization Types for Unified Authorization Model
 * Version: 3.0.0
 * Date: 2026-01-22
 *
 * Based on: /contracts/api/authorization.contract.ts
 * Architecture Decision: ADR-AUTH-001 (Unified Authorization)
 *
 * KEY CHANGES from v2:
 * - globalRights: Rights that apply everywhere
 * - departmentRights: Record<deptId, rights[]> for scoped permissions
 * - departmentHierarchy: Parent-to-children mapping
 * - permissionVersion: For cache validation
 * - DEPRECATED: allAccessRights (use globalRights + departmentRights)
 */

// ============================================================================
// Unified Authorization Types (ADR-AUTH-001)
// ============================================================================

/**
 * Permission scope types for authorization checks
 */
export type UnifiedPermissionScope =
  | '*'                    // Global - applies everywhere
  | `dept:${string}`       // Department-specific
  | 'own';                 // Own resources only

/**
 * User's authorization context from API
 * This is the new unified structure that replaces the old RoleHierarchy for auth checks
 */
export interface UnifiedAuthContext {
  /** User ID */
  userId: string;

  /** Global rights (scope: '*') - apply everywhere */
  globalRights: string[];

  /** Department-scoped rights - keyed by department ID */
  departmentRights: Record<string, string[]>;

  /** Department hierarchy (parent -> children[]) for inheritance */
  departmentHierarchy: Record<string, string[]>;

  /** Department memberships with roles (for role-based UI, not auth checks) */
  departmentMemberships: SimpleDepartmentMembership[];

  /** Permission version for cache validation */
  permissionVersion: number;
}

/**
 * Simplified department membership for unified auth
 */
export interface SimpleDepartmentMembership {
  departmentId: string;
  departmentName?: string;
  roles: string[];
}

/**
 * Resource context for fine-grained authorization checks
 */
export interface ResourceContext {
  type: string;
  id: string;
  departmentId?: string;
  createdBy?: string;
}

// ============================================================================
// User Types
// ============================================================================

/**
 * Available user types in the system (matches backend implementation)
 */
export type UserType = 'learner' | 'staff' | 'global-admin';

/**
 * UserType object format for API responses (V2.1)
 * This replaces string[] userTypes with object[] containing displayAs labels
 */
export interface UserTypeObject {
  /**
   * The userType key (matches UserType)
   */
  _id: UserType;

  /**
   * Human-readable display label (from server lookup values)
   * @example "Learner", "Staff", "System Admin"
   */
  displayAs: string;
}

/**
 * Role object format for department memberships and role hierarchies
 */
export interface RoleObject {
  /**
   * The role key (e.g., 'instructor', 'department-admin', 'course-taker')
   */
  role: string;

  /**
   * Human-readable display label (from server lookup values)
   * @example "Instructor", "Department Admin", "Course Taker"
   */
  displayAs: string;
}

/**
 * Dashboard types corresponding to user types
 */
export type DashboardType = 'learner' | 'staff' | 'admin';

// ============================================================================
// Department Membership (Unified Structure for Staff and Learner)
// ============================================================================

/**
 * Department membership with roles
 * Used by BOTH learner and staff profiles
 */
export interface DepartmentMembership {
  departmentId: string;
  departmentName: string;
  departmentSlug: string;

  /** Roles within this department */
  roles: string[];

  /** Access rights granted by roles in this department */
  accessRights: string[];

  /** Is this the user's primary department? */
  isPrimary: boolean;

  /** Is membership active? */
  isActive: boolean;

  /** When they joined this department */
  joinedAt: string;

  /** Child departments (for hierarchical access) */
  childDepartments?: {
    departmentId: string;
    departmentName: string;
    roles: string[];
  }[];
}

// ============================================================================
// User Profile
// ============================================================================

export interface User {
  _id: string;
  email: string;

  // DEPRECATED (v1.0) - kept for backward compatibility during migration
  firstName?: string;
  lastName?: string;

  // NEW (v2.0) - person data from Person API
  person?: import('@/shared/types/person').IPerson;

  /** User types this user has (can have multiple) */
  userTypes: UserType[];

  /** Which dashboard to show by default on login */
  defaultDashboard: DashboardType;

  /** Last selected department (persisted for UX) */
  lastSelectedDepartment?: string | null;

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string | null;
}

// ============================================================================
// Staff Profile
// ============================================================================

/**
 * Staff-specific profile with department memberships
 */
export interface StaffProfile {
  _id: string;  // Same as User._id
  userId: string;
  employeeId?: string;
  title?: string;

  /** Department memberships with roles and access rights */
  departmentMemberships: DepartmentMembership[];

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Learner Profile
// ============================================================================

/**
 * Learner-specific profile with department memberships
 */
export interface LearnerProfile {
  _id: string;  // Same as User._id
  userId: string;
  studentId?: string;

  /** Department memberships with roles and access rights */
  departmentMemberships: DepartmentMembership[];

  /** Global learner role (optional) */
  globalLearnerRole?: string;

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Login Response (V2 API Contract)
// ============================================================================

/**
 * Login response structure from /api/v2/auth/login
 */
export interface LoginResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      // DEPRECATED (v1.0) - kept for backward compatibility
      firstName: string;
      lastName: string;
      isActive: boolean;
      lastLogin: string | null;
      createdAt: string;
    };

    // NEW (v2.0) - person data nested in response
    person?: import('@/shared/types/person').IPerson;

    session: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      tokenType: 'Bearer';
    };

    // NEW IN V2.1 - userTypes now includes displayAs from server
    userTypes: UserTypeObject[];
    defaultDashboard: DashboardType;
    canEscalateToAdmin: boolean;

    departmentMemberships: DepartmentMembership[];

    // UNIFIED AUTHORIZATION (ADR-AUTH-001)
    /** Global rights that apply everywhere */
    globalRights: string[];
    /** Department-scoped rights */
    departmentRights: Record<string, string[]>;
    /** Department hierarchy for inheritance */
    departmentHierarchy: Record<string, string[]>;
    /** Permission version for cache validation */
    permissionVersion: number;

    /** @deprecated Use globalRights + departmentRights instead */
    allAccessRights: string[];
    lastSelectedDepartment: string | null;
  };
}

// ============================================================================
// Escalation Response (Admin Session)
// ============================================================================

/**
 * Escalation response structure from /api/v2/auth/escalate
 */
export interface EscalateResponse {
  success: boolean;
  data: {
    adminSession: {
      adminToken: string;      // Store in MEMORY ONLY
      expiresIn: number;       // Default: 900 (15 minutes)
      adminRoles: string[];
      adminAccessRights: string[];
    };
    sessionTimeoutMinutes: number;
  };
}

// ============================================================================
// Switch Department Response
// ============================================================================

/**
 * Switch department response structure from /api/v2/auth/switch-department
 */
export interface SwitchDepartmentResponse {
  success: boolean;
  data: {
    currentDepartment: {
      departmentId: string;
      departmentName: string;
      departmentSlug: string;
      roles: string[];
      accessRights: string[];
    };
    childDepartments: {
      departmentId: string;
      departmentName: string;
      roles: string[];
    }[];
    isDirectMember: boolean;
    inheritedFrom: string | null;
  };
}

// ============================================================================
// Get My Roles Response
// ============================================================================

/**
 * My roles response structure from /api/v2/roles/me
 */
export interface MyRolesResponse {
  success: boolean;
  data: {
    userTypes: UserTypeObject[];
    defaultDashboard: DashboardType;
    canEscalateToAdmin: boolean;
    departmentMemberships: DepartmentMembership[];

    // UNIFIED AUTHORIZATION (ADR-AUTH-001)
    /** Global rights that apply everywhere */
    globalRights: string[];
    /** Department-scoped rights */
    departmentRights: Record<string, string[]>;
    /** Department hierarchy for inheritance */
    departmentHierarchy: Record<string, string[]>;
    /** Permission version for cache validation */
    permissionVersion: number;

    /** @deprecated Use globalRights + departmentRights instead */
    allAccessRights: string[];
    lastSelectedDepartment: string | null;
    adminRoles: string[] | null;
  };
}

// ============================================================================
// Permission Scope
// ============================================================================

/**
 * Scope context for permission checking
 */
export interface PermissionScope {
  type: 'department' | 'system-setting-group';
  id: string;
}

// ============================================================================
// GNAP Token Structures
// ============================================================================

/**
 * Access token structure (GNAP-compatible)
 */
export interface AccessToken {
  /** The actual token string */
  value: string;

  /** Token type (typically 'Bearer') */
  type: 'Bearer';

  /** When the token expires (ISO 8601) */
  expiresAt: string;

  /** Scopes/permissions granted (optional) */
  scope?: string[];
}

/**
 * Refresh token structure
 */
export interface RefreshToken {
  value: string;
  expiresAt: string;
}

/**
 * GNAP token grant structure
 * This is the complete authorization grant returned on login
 */
export interface TokenGrant {
  /** Access token for API requests */
  accessToken: AccessToken;

  /** Refresh token (if granted) */
  refreshToken?: RefreshToken;

  /** User profile */
  user: User;

  /** Computed role hierarchy */
  roleHierarchy: RoleHierarchy;

  /** Grant continuation handle (for GNAP continuation flows) */
  continue?: {
    uri: string;
    wait: number;
  };
}

// ============================================================================
// Role Hierarchy (Computed by Backend)
// ============================================================================

/**
 * Single role assignment with context and permissions
 */
export interface RoleAssignment {
  /** Role identifier (e.g., 'course-taker', 'instructor', 'system-admin') */
  role: string;

  /** Human-readable name */
  displayName: string;

  /** Scope type - where this role applies */
  scopeType: 'none' | 'department' | 'system-setting-group';

  /** Scope ID if scoped */
  scopeId?: string;

  /** Scope name for display */
  scopeName?: string;

  /** Permissions granted by this role */
  permissions: string[];
}

/**
 * Department role group
 */
export interface DepartmentRoleGroup {
  departmentId: string;
  departmentName: string;
  isPrimary: boolean;
  roles: RoleAssignment[];
}

/**
 * Complete role hierarchy returned by backend
 * This is computed server-side and sent on login
 * Backend is the source of truth for all role/permission logic
 */
export interface RoleHierarchy {
  /** Primary user type (determines default dashboard) */
  primaryUserType: UserType;

  /** All user types this user has */
  allUserTypes: UserType[];

  /** Default dashboard to show */
  defaultDashboard: DashboardType;

  /** System-wide roles (global-admins only) */
  globalRoles: RoleAssignment[];

  /** Staff department roles (if user has 'staff' type) */
  staffRoles?: {
    departmentRoles: DepartmentRoleGroup[];
  };

  /** Learner department roles (if user has 'learner' type) */
  learnerRoles?: {
    departmentRoles: DepartmentRoleGroup[];
    globalRole?: RoleAssignment;
  };

  /** Flattened array of ALL permissions across all roles */
  allPermissions: string[];

  /** Display mappings for user types from server (V2.1) */
  userTypeDisplayMap?: Record<UserType, string>;

  /** Display mappings for roles from server (V2.1) */
  roleDisplayMap?: Record<string, string>;
}

// ============================================================================
// Request Types
// ============================================================================

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  requestedScopes?: string[]; // Optional: for future GNAP scope negotiation
}

/**
 * Escalation credentials
 */
export interface EscalationCredentials {
  escalationPassword: string;
}

/**
 * Department switch request
 */
export interface SwitchDepartmentRequest {
  departmentId: string;
}

/**
 * Token refresh request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Verify token response
 */
export interface VerifyTokenResponse {
  valid: boolean;
  user?: User;
  expiresAt?: string;
}

/**
 * Refresh token response
 */
export interface RefreshResponse {
  success: boolean;
  data: {
    /** New access token */
    accessToken: AccessToken;

    /** Updated role hierarchy (in case roles changed) */
    roleHierarchy: RoleHierarchy;

    /** Optional: New refresh token (if rotated) */
    refreshToken?: RefreshToken;
  };
}
