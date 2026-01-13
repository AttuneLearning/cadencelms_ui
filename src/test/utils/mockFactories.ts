/**
 * Mock Data Factories - Phase 3
 * Version: 1.0.0
 * Date: 2026-01-13
 *
 * Factory functions for creating consistent mock data across tests
 */

import type {
  User,
  RoleHierarchy,
  AccessToken,
  UserType,
  DepartmentRoleGroup,
  RoleAssignment,
} from '@/shared/types/auth';

// ============================================================================
// User Mocks
// ============================================================================

export interface MockUserOptions {
  _id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  userTypes?: UserType[];
  defaultDashboard?: string;
  lastSelectedDepartment?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}

/**
 * Create a mock User object
 */
export function createMockUser(overrides: MockUserOptions = {}): User {
  return {
    _id: overrides._id ?? 'user-123',
    email: overrides.email ?? 'test@example.com',
    firstName: overrides.firstName ?? 'Test',
    lastName: overrides.lastName ?? 'User',
    userTypes: overrides.userTypes ?? ['staff'],
    defaultDashboard: overrides.defaultDashboard ?? '/dashboard',
    lastSelectedDepartment: overrides.lastSelectedDepartment ?? 'dept-123',
    isActive: overrides.isActive ?? true,
    createdAt: overrides.createdAt ?? '2024-01-01T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2024-01-01T00:00:00.000Z',
    lastLogin: overrides.lastLogin ?? '2024-01-13T00:00:00.000Z',
  };
}

// ============================================================================
// AccessToken Mocks
// ============================================================================

export interface MockAccessTokenOptions {
  value?: string;
  type?: 'Bearer';
  expiresAt?: string;
  scope?: string[];
}

/**
 * Create a mock AccessToken object
 */
export function createMockAccessToken(overrides: MockAccessTokenOptions = {}): AccessToken {
  return {
    value: overrides.value ?? 'mock-access-token',
    type: overrides.type ?? 'Bearer',
    expiresAt: overrides.expiresAt ?? new Date(Date.now() + 3600000).toISOString(), // 1 hour
    scope: overrides.scope ?? ['content:courses:read', 'content:courses:edit'],
  };
}

// ============================================================================
// RoleHierarchy Mocks
// ============================================================================

export interface MockRoleHierarchyOptions {
  primaryUserType?: UserType;
  allUserTypes?: UserType[];
  defaultDashboard?: string;
  globalRoles?: RoleAssignment[];
  allPermissions?: string[];
  staffRoles?: { departmentRoles: DepartmentRoleGroup[] };
  learnerRoles?: { departmentRoles: DepartmentRoleGroup[] };
  userTypeDisplayMap?: Record<string, string>;
  roleDisplayMap?: Record<string, string>;
}

/**
 * Create a mock RoleHierarchy object
 */
export function createMockRoleHierarchy(
  overrides: MockRoleHierarchyOptions = {}
): RoleHierarchy {
  return {
    primaryUserType: overrides.primaryUserType ?? 'staff',
    allUserTypes: overrides.allUserTypes ?? ['staff'],
    defaultDashboard: overrides.defaultDashboard ?? '/dashboard',
    globalRoles: overrides.globalRoles ?? [],
    allPermissions: overrides.allPermissions ?? [
      'content:courses:read',
      'content:courses:edit',
    ],
    staffRoles: overrides.staffRoles,
    learnerRoles: overrides.learnerRoles,
    userTypeDisplayMap: overrides.userTypeDisplayMap ?? {
      staff: 'Staff',
      learner: 'Learner',
      'global-admin': 'Global Admin',
    },
    roleDisplayMap: overrides.roleDisplayMap ?? {
      instructor: 'Instructor',
      'course-creator': 'Course Creator',
      'department-admin': 'Department Admin',
      'course-taker': 'Course Taker',
    },
  };
}

// ============================================================================
// Department Role Group Mocks
// ============================================================================

export interface MockDepartmentRoleGroupOptions {
  departmentId?: string;
  departmentName?: string;
  isPrimary?: boolean;
  roles?: RoleAssignment[];
}

/**
 * Create a mock DepartmentRoleGroup object
 */
export function createMockDepartmentRoleGroup(
  overrides: MockDepartmentRoleGroupOptions = {}
): DepartmentRoleGroup {
  return {
    departmentId: overrides.departmentId ?? 'dept-123',
    departmentName: overrides.departmentName ?? 'Engineering Department',
    isPrimary: overrides.isPrimary ?? true,
    roles: overrides.roles ?? [
      createMockRoleAssignment({
        role: 'instructor',
        scopeId: overrides.departmentId ?? 'dept-123',
        scopeName: overrides.departmentName ?? 'Engineering Department',
      }),
    ],
  };
}

// ============================================================================
// Role Assignment Mocks
// ============================================================================

export interface MockRoleAssignmentOptions {
  role?: string;
  displayName?: string;
  scopeType?: 'global' | 'department';
  scopeId?: string | null;
  scopeName?: string | null;
  permissions?: string[];
}

/**
 * Create a mock RoleAssignment object
 */
export function createMockRoleAssignment(
  overrides: MockRoleAssignmentOptions = {}
): RoleAssignment {
  return {
    role: overrides.role ?? 'instructor',
    displayName: overrides.displayName ?? 'Instructor',
    scopeType: overrides.scopeType ?? 'department',
    scopeId: overrides.scopeId ?? 'dept-123',
    scopeName: overrides.scopeName ?? 'Engineering Department',
    permissions: overrides.permissions ?? [
      'content:courses:read',
      'content:courses:edit',
    ],
  };
}

// ============================================================================
// AuthStore State Mocks
// ============================================================================

export interface MockAuthStoreOptions {
  isAuthenticated?: boolean;
  user?: User | null;
  roleHierarchy?: RoleHierarchy | null;
  accessToken?: AccessToken | null;
  isLoading?: boolean;
  error?: string | null;
  isAdminSessionActive?: boolean;
  adminSessionExpiry?: Date | null;
}

/**
 * Create a mock auth store state
 * Used for mocking useAuthStore hook
 */
export function createMockAuthStore(overrides: MockAuthStoreOptions = {}) {
  const user = overrides.user !== undefined ? overrides.user : createMockUser();
  const roleHierarchy =
    overrides.roleHierarchy !== undefined
      ? overrides.roleHierarchy
      : createMockRoleHierarchy();
  const accessToken =
    overrides.accessToken !== undefined
      ? overrides.accessToken
      : createMockAccessToken();

  return {
    // State
    isAuthenticated: overrides.isAuthenticated ?? true,
    user,
    roleHierarchy,
    accessToken,
    isLoading: overrides.isLoading ?? false,
    error: overrides.error ?? null,
    isAdminSessionActive: overrides.isAdminSessionActive ?? false,
    adminSessionExpiry: overrides.adminSessionExpiry ?? null,

    // Action mocks
    login: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
    refreshToken: vi.fn().mockResolvedValue(undefined),
    clearError: vi.fn(),
    initializeAuth: vi.fn().mockResolvedValue(undefined),
    escalateToAdmin: vi.fn().mockResolvedValue(undefined),
    deEscalateFromAdmin: vi.fn(),
    hasAdminToken: vi.fn().mockReturnValue(false),
    hasPermission: vi.fn().mockReturnValue(true),
    hasAnyPermission: vi.fn().mockReturnValue(true),
    hasAllPermissions: vi.fn().mockReturnValue(true),
    hasRole: vi.fn().mockReturnValue(true),
  };
}

// ============================================================================
// Navigation Mocks
// ============================================================================

export interface MockNavigationOptions {
  isSidebarOpen?: boolean;
  toggleSidebar?: ReturnType<typeof vi.fn>;
  setSidebarOpen?: ReturnType<typeof vi.fn>;
}

/**
 * Create a mock navigation object
 * Used for mocking useNavigation hook
 */
export function createMockNavigation(overrides: MockNavigationOptions = {}) {
  return {
    isSidebarOpen: overrides.isSidebarOpen ?? false,
    toggleSidebar: overrides.toggleSidebar ?? vi.fn(),
    setSidebarOpen: overrides.setSidebarOpen ?? vi.fn(),
  };
}

// ============================================================================
// Department Context Mocks
// ============================================================================

export interface MockDepartmentContextOptions {
  currentDepartmentId?: string | null;
  currentDepartmentName?: string | null;
  currentDepartmentRoles?: string[];
  currentDepartmentAccessRights?: string[];
  hasPermission?: ReturnType<typeof vi.fn>;
  hasAnyPermission?: ReturnType<typeof vi.fn>;
  hasAllPermissions?: ReturnType<typeof vi.fn>;
  hasRole?: ReturnType<typeof vi.fn>;
  switchDepartment?: ReturnType<typeof vi.fn>;
  isSwitching?: boolean;
  switchError?: string | null;
}

/**
 * Create a mock department context
 * Used for mocking useDepartmentContext hook
 */
export function createMockDepartmentContext(
  overrides: MockDepartmentContextOptions = {}
) {
  return {
    currentDepartmentId: overrides.currentDepartmentId ?? 'dept-123',
    currentDepartmentName: overrides.currentDepartmentName ?? 'Engineering Department',
    currentDepartmentRoles: overrides.currentDepartmentRoles ?? ['instructor', 'course-creator'],
    currentDepartmentAccessRights: overrides.currentDepartmentAccessRights ?? [
      'content:courses:read',
      'content:courses:edit',
    ],
    hasPermission: overrides.hasPermission ?? vi.fn(() => true),
    hasAnyPermission: overrides.hasAnyPermission ?? vi.fn(() => true),
    hasAllPermissions: overrides.hasAllPermissions ?? vi.fn(() => true),
    hasRole: overrides.hasRole ?? vi.fn(() => true),
    switchDepartment: overrides.switchDepartment ?? vi.fn(),
    isSwitching: overrides.isSwitching ?? false,
    switchError: overrides.switchError ?? null,
  };
}

// ============================================================================
// Preset Configurations
// ============================================================================

/**
 * Create a staff user with typical permissions
 */
export function createMockStaffUser(overrides: Partial<MockUserOptions> = {}): User {
  return createMockUser({
    userTypes: ['staff'],
    defaultDashboard: '/dashboard',
    ...overrides,
  });
}

/**
 * Create a learner user with typical permissions
 */
export function createMockLearnerUser(overrides: Partial<MockUserOptions> = {}): User {
  return createMockUser({
    userTypes: ['learner'],
    defaultDashboard: '/learner/dashboard',
    ...overrides,
  });
}

/**
 * Create a global admin user with all permissions
 */
export function createMockGlobalAdminUser(overrides: Partial<MockUserOptions> = {}): User {
  return createMockUser({
    userTypes: ['global-admin'],
    defaultDashboard: '/admin',
    ...overrides,
  });
}

/**
 * Create a staff role hierarchy with department roles
 */
export function createMockStaffRoleHierarchy(
  overrides: Partial<MockRoleHierarchyOptions> = {}
): RoleHierarchy {
  return createMockRoleHierarchy({
    primaryUserType: 'staff',
    allUserTypes: ['staff'],
    allPermissions: [
      'content:courses:read',
      'content:courses:edit',
      'content:courses:create',
      'learners:enrollments:read',
    ],
    staffRoles: {
      departmentRoles: [
        createMockDepartmentRoleGroup({
          roles: [
            createMockRoleAssignment({ role: 'instructor' }),
            createMockRoleAssignment({ role: 'course-creator' }),
          ],
        }),
      ],
    },
    ...overrides,
  });
}

/**
 * Create a global admin role hierarchy with system permissions
 */
export function createMockGlobalAdminRoleHierarchy(
  overrides: Partial<MockRoleHierarchyOptions> = {}
): RoleHierarchy {
  return createMockRoleHierarchy({
    primaryUserType: 'global-admin',
    allUserTypes: ['global-admin'],
    allPermissions: ['system:*'],
    globalRoles: [
      createMockRoleAssignment({
        role: 'system-administrator',
        displayName: 'System Administrator',
        scopeType: 'global',
        scopeId: null,
        scopeName: null,
        permissions: ['system:*'],
      }),
    ],
    ...overrides,
  });
}
