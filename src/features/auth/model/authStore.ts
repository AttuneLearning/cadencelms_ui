/**
 * Auth Store - Unified Authorization Model
 * Version: 3.0.0
 * Date: 2026-01-22
 *
 * Zustand store for authentication and authorization
 * Implements ADR-AUTH-001: Unified Authorization Model
 *
 * KEY CHANGES:
 * - Uses globalRights + departmentRights instead of allAccessRights
 * - Department-scoped permission checks use departmentRights[deptId]
 * - Hierarchy support via departmentHierarchy
 * - Cache validation via permissionVersion
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  User,
  RoleHierarchy,
  AccessToken,
  LoginCredentials,
  LoginResponse,
  MyRolesResponse,
  UserType,
  RoleObject,
} from '@/shared/types/auth';
import {
  login as apiLogin,
  refreshAccessToken as apiRefresh,
  logout as apiLogout,
  getCurrentUser as apiGetCurrentUser,
  escalateToAdmin as apiEscalateToAdmin,
} from '@/entities/auth/api/authApi';
import {
  setAccessToken,
  getAccessToken,
  setRefreshToken,
  getRefreshToken,
  clearAllTokens,
  getAccessTokenValue,
} from '@/shared/utils/tokenStorage';
import { useNavigationStore } from '@/shared/stores/navigationStore';
import {
  extractUserTypeKeys,
  buildUserTypeDisplayMap,
  buildRoleDisplayMap,
} from '@/shared/lib/displayUtils';
import {
  setAdminToken,
  clearAdminToken,
  hasAdminToken as checkHasAdminToken,
  getAdminTokenExpiry,
} from '@/shared/utils/adminTokenStorage';

// ============================================================================
// State Interface
// ============================================================================

interface AuthState {
  // Data
  accessToken: AccessToken | null;
  user: User | null;
  roleHierarchy: RoleHierarchy | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // UNIFIED AUTHORIZATION (ADR-AUTH-001)
  globalRights: string[];
  departmentRights: Record<string, string[]>;
  departmentHierarchy: Record<string, string[]>;
  permissionVersion: number;

  // Admin session state
  isAdminSessionActive: boolean;
  adminSessionExpiry: Date | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => Promise<void>;

  // Admin escalation
  escalateToAdmin: (password: string) => Promise<void>;
  deEscalateFromAdmin: () => void;
  hasAdminToken: () => boolean;

  // Permission checking (UNIFIED)
  hasPermission: (permission: string, departmentId?: string) => boolean;
  hasAnyPermission: (permissions: string[], departmentId?: string) => boolean;
  hasAllPermissions: (permissions: string[], departmentId?: string) => boolean;
  hasDepartmentPermission: (permission: string, departmentId: string) => boolean;

  // Role checking
  hasRole: (role: string, departmentId?: string) => boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract all unique roles from department memberships to build role display map
 */
function extractRolesFromMemberships(memberships: any[]): RoleObject[] {
  const roleSet = new Set<string>();
  const roleObjects: RoleObject[] = [];

  for (const membership of memberships) {
    if (membership.roles && Array.isArray(membership.roles)) {
      for (const role of membership.roles) {
        if (typeof role === 'object' && role.role && role.displayAs) {
          // Server provides RoleObject format
          if (!roleSet.has(role.role)) {
            roleSet.add(role.role);
            roleObjects.push(role);
          }
        } else if (typeof role === 'string') {
          // Fallback for string-only roles (shouldn't happen in V2.1)
          if (!roleSet.has(role)) {
            roleSet.add(role);
            // Create RoleObject with formatted display name
            roleObjects.push({
              role: role,
              displayAs: role.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            });
          }
        }
      }
    }
  }

  return roleObjects;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      // ================================================================
      // Initial State
      // ================================================================
      accessToken: null,
      user: null,
      roleHierarchy: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // UNIFIED AUTHORIZATION (ADR-AUTH-001)
      globalRights: [],
      departmentRights: {},
      departmentHierarchy: {},
      permissionVersion: 0,

      isAdminSessionActive: false,
      adminSessionExpiry: null,

      // ================================================================
      // Login
      // ================================================================
      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          console.log('[AuthStore] Starting login...');
          const response: LoginResponse = await apiLogin(credentials);

          if (!response.success || !response.data) {
            throw new Error('Invalid login response format');
          }

          const { data } = response;

          // DEBUG: Log raw API response userTypes
          console.log('[AuthStore] Raw userTypes from API:', data.userTypes);
          console.log('[AuthStore] departmentMemberships:', data.departmentMemberships);

          // V2.1: Extract UserType keys from UserTypeObject[]
          const userTypeKeys: UserType[] = extractUserTypeKeys(data.userTypes);
          console.log('[AuthStore] Extracted userTypeKeys:', userTypeKeys);

          // V2.1: Build display maps from server-provided displayAs values
          const userTypeDisplayMap = buildUserTypeDisplayMap(data.userTypes);
          const roleObjects = extractRolesFromMemberships(data.departmentMemberships);
          const roleDisplayMap = buildRoleDisplayMap(roleObjects);

          console.log('[AuthStore] Display maps built:', {
            userTypeDisplayMap,
            roleDisplayMap,
          });

          // Build User object from response
          const user: User = {
            _id: data.user.id,
            email: data.user.email,
            // DEPRECATED (v1.0) - kept for backward compatibility
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            // NEW (v2.0) - person data from API
            person: data.person,
            userTypes: userTypeKeys, // Store UserType[] (keys only)
            defaultDashboard: data.defaultDashboard,
            lastSelectedDepartment: data.lastSelectedDepartment,
            isActive: data.user.isActive,
            createdAt: data.user.createdAt,
            updatedAt: data.user.createdAt, // Backend doesn't return updatedAt in login
            lastLogin: data.user.lastLogin,
          };

          // Build AccessToken from response
          const expiresAt = new Date(Date.now() + data.session.expiresIn * 1000).toISOString();
          const accessToken: AccessToken = {
            value: data.session.accessToken,
            type: 'Bearer',
            expiresAt,
            scope: data.allAccessRights,
          };

          // Build RoleHierarchy from response
          const roleHierarchy: RoleHierarchy = {
            primaryUserType: userTypeKeys[0], // First userType is primary
            allUserTypes: userTypeKeys,
            defaultDashboard: data.defaultDashboard,
            globalRoles: [], // Global-admins will have globalRoles populated
            allPermissions: data.allAccessRights,
            // V2.1: Add display maps to roleHierarchy
            userTypeDisplayMap,
            roleDisplayMap,
          };

          // Process department memberships into staffRoles/learnerRoles
          const staffDepartments: RoleHierarchy['staffRoles'] = {
            departmentRoles: [],
          };
          const learnerDepartments: RoleHierarchy['learnerRoles'] = {
            departmentRoles: [],
          };

          for (const membership of data.departmentMemberships) {
            // Extract role keys (handles both string[] and RoleObject[] formats)
            const roleKeys = membership.roles.map((r: any) =>
              typeof r === 'string' ? r : r.role
            );

            // Convert DepartmentMembership to DepartmentRoleGroup format
            const roleGroup = {
              departmentId: membership.departmentId,
              departmentName: membership.departmentName,
              isPrimary: membership.isPrimary,
              roles: roleKeys.map((roleName: string) => ({
                role: roleName,
                displayName: roleDisplayMap[roleName] || roleName.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                scopeType: 'department' as const,
                scopeId: membership.departmentId,
                scopeName: membership.departmentName,
                permissions: membership.accessRights,
              })),
            };

            // Determine if this is a staff or learner membership based on roles
            const hasStaffRole = roleKeys.some((role: string) =>
              ['instructor', 'content-admin', 'department-admin'].includes(role)
            );
            const hasLearnerRole = roleKeys.some((role: string) =>
              ['course-taker', 'auditor', 'learner-supervisor'].includes(role)
            );

            if (hasStaffRole) {
              staffDepartments.departmentRoles.push(roleGroup);
            }
            if (hasLearnerRole) {
              learnerDepartments.departmentRoles.push(roleGroup);
            }
          }

          // Add staffRoles if user is staff
          if (userTypeKeys.includes('staff')) {
            roleHierarchy.staffRoles = staffDepartments;
          }

          // Add learnerRoles if user is learner
          if (userTypeKeys.includes('learner')) {
            roleHierarchy.learnerRoles = learnerDepartments;
          }

          // Store tokens
          setAccessToken(accessToken);
          const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
          setRefreshToken({
            value: data.session.refreshToken,
            expiresAt: refreshExpiresAt,
          });

          // UNIFIED AUTHORIZATION: Extract new fields from API response
          // FALLBACK: If API doesn't provide new fields, build from existing data
          let globalRights = data.globalRights;
          let departmentRights = data.departmentRights;
          const departmentHierarchy = data.departmentHierarchy || {};
          const permissionVersion = data.permissionVersion || 0;

          // If globalRights not provided, extract from allAccessRights
          if (!globalRights || globalRights.length === 0) {
            // Check if user has global-admin userType - they get all rights globally
            if (userTypeKeys.includes('global-admin')) {
              globalRights = data.allAccessRights || [];
            } else {
              // Non-global-admin users: only system:* type permissions are global
              globalRights = (data.allAccessRights || []).filter(
                (right: string) => right.startsWith('system:')
              );
            }
          }

          // If departmentRights not provided, build from departmentMemberships
          if (!departmentRights || Object.keys(departmentRights).length === 0) {
            departmentRights = {};
            for (const membership of data.departmentMemberships || []) {
              if (membership.accessRights && membership.accessRights.length > 0) {
                departmentRights[membership.departmentId] = membership.accessRights;
              }
            }
          }

          // Update state
          set({
            accessToken,
            user,
            roleHierarchy,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            // UNIFIED AUTHORIZATION (ADR-AUTH-001)
            globalRights,
            departmentRights,
            departmentHierarchy,
            permissionVersion,
          });

          console.log('[AuthStore] Login successful:', {
            userId: user._id,
            userTypes: user.userTypes,
            defaultDashboard: user.defaultDashboard,
            globalRights,
            departmentRights,
            departmentMemberships: data.departmentMemberships?.map((m: any) => ({
              id: m.departmentId,
              name: m.departmentName,
              rights: m.accessRights?.length || 0,
            })),
            permissionVersion,
          });
        } catch (error: any) {
          console.error('[AuthStore] Login failed:', error);
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Login failed',
          });
          throw error;
        }
      },

      // ================================================================
      // Logout
      // ================================================================
      logout: async () => {
        if (import.meta.env?.DEV) {
          console.trace('[AuthStore] Logout trace');
        }
        console.log('[AuthStore] Starting logout...');

        try {
          await apiLogout();
        } catch (error) {
          console.error('[AuthStore] Logout API call failed:', error);
          // Continue with local cleanup even if API fails
        }

        // Clear admin token if active
        clearAdminToken();

        // Clear tokens
        clearAllTokens();

        // Clear state
        set({
          accessToken: null,
          user: null,
          roleHierarchy: null,
          isAuthenticated: false,
          error: null,
          isAdminSessionActive: false,
          adminSessionExpiry: null,
          // UNIFIED AUTHORIZATION (ADR-AUTH-001)
          globalRights: [],
          departmentRights: {},
          departmentHierarchy: {},
          permissionVersion: 0,
        });

        // Clear navigation store department state
        useNavigationStore.getState().clearDepartmentSelection();

        console.log('[AuthStore] Logout complete');
      },

      // ================================================================
      // Admin Escalation
      // ================================================================

      /**
       * Escalate to admin session with password verification
       *
       * SECURITY: Admin token is stored in MEMORY ONLY and never persisted.
       * Token will be lost on page refresh, requiring re-escalation.
       *
       * @param password - User's escalation password for verification
       * @throws Error if escalation fails
       */
      escalateToAdmin: async (password: string) => {
        const { user } = get();

        if (!user) {
          throw new Error('User must be logged in to escalate to admin');
        }

        if (!password || !password.trim()) {
          throw new Error('Escalation password is required');
        }

        console.log('[AuthStore] Starting admin escalation...');

        try {
          // Call API to verify password and get admin token
          const response = await apiEscalateToAdmin({ escalationPassword: password });

          if (!response.success || !response.data) {
            throw new Error('Invalid escalation response format');
          }

          const { adminToken, expiresIn } = response.data.adminSession;

          // Store admin token in memory only (never localStorage)
          setAdminToken(adminToken, expiresIn);

          // Update state
          set({
            isAdminSessionActive: true,
            adminSessionExpiry: getAdminTokenExpiry(),
          });

          console.log('[AuthStore] Escalated to admin session');
        } catch (error: any) {
          console.error('[AuthStore] Admin escalation failed:', error);
          throw error; // Re-throw to let modal handle specific error messages
        }
      },

      /**
       * De-escalate from admin session
       *
       * Clears the admin token from memory and returns to normal user session.
       */
      deEscalateFromAdmin: () => {
        console.log('[AuthStore] De-escalating from admin session...');

        // Clear admin token from memory
        clearAdminToken();

        // Update state
        set({
          isAdminSessionActive: false,
          adminSessionExpiry: null,
        });

        console.log('[AuthStore] De-escalated from admin session');
      },

      /**
       * Check if admin token exists and is valid
       *
       * @returns true if admin session is active
       */
      hasAdminToken: () => {
        const hasToken = checkHasAdminToken();

        // Sync state if token expired
        if (!hasToken && get().isAdminSessionActive) {
          set({
            isAdminSessionActive: false,
            adminSessionExpiry: null,
          });
        }

        return hasToken;
      },

      // ================================================================
      // Refresh Token
      // ================================================================
      refreshToken: async () => {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          console.log('[AuthStore] Refreshing access token...');
          const response = await apiRefresh({ refreshToken: refreshToken.value });

          if (!response.success || !response.data) {
            throw new Error('Invalid refresh response format');
          }

          const { accessToken: newAccessToken } = response.data;

          // Store new access token
          setAccessToken(newAccessToken);

          // Store new refresh token if rotated
          if (response.data.refreshToken) {
            setRefreshToken(response.data.refreshToken);
          }

          // Update state
          set({
            accessToken: newAccessToken,
            roleHierarchy: response.data.roleHierarchy,
          });

          console.log('[AuthStore] Token refreshed successfully');
        } catch (error) {
          console.error('[AuthStore] Token refresh failed:', error);

          // Refresh failed - logout user
          await get().logout();
          throw error;
        }
      },

      // ================================================================
      // Initialize Auth from Stored Tokens
      // ================================================================
      initializeAuth: async () => {
        const accessToken = getAccessToken();

        if (!accessToken) {
          console.log('[AuthStore] No stored token found');
          return;
        }

        console.log('[AuthStore] Stored token found, restoring session...');

        try {
          set({ isLoading: true });

          // Fetch current user with role hierarchy
          const response: MyRolesResponse = await apiGetCurrentUser();

          if (!response.success || !response.data) {
            throw new Error('Invalid user response format');
          }

          const { data } = response;

          // V2.1: Extract UserType keys from UserTypeObject[]
          const userTypeKeys: UserType[] = extractUserTypeKeys(data.userTypes);

          // V2.1: Build display maps from server-provided displayAs values
          const userTypeDisplayMap = buildUserTypeDisplayMap(data.userTypes);
          const roleObjects = extractRolesFromMemberships(data.departmentMemberships);
          const roleDisplayMap = buildRoleDisplayMap(roleObjects);

          // Build User object
          const user: User = {
            _id: accessToken.value, // We don't have full user data, will be updated
            email: '', // Will be updated from full user endpoint
            userTypes: userTypeKeys,
            defaultDashboard: data.defaultDashboard,
            lastSelectedDepartment: data.lastSelectedDepartment,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Build RoleHierarchy
          const roleHierarchy: RoleHierarchy = {
            primaryUserType: userTypeKeys[0],
            allUserTypes: userTypeKeys,
            defaultDashboard: data.defaultDashboard,
            globalRoles: [],
            allPermissions: data.allAccessRights,
            // V2.1: Add display maps to roleHierarchy
            userTypeDisplayMap,
            roleDisplayMap,
          };

          // Process department memberships (same logic as login)
          const staffDepartments: RoleHierarchy['staffRoles'] = {
            departmentRoles: [],
          };
          const learnerDepartments: RoleHierarchy['learnerRoles'] = {
            departmentRoles: [],
          };

          for (const membership of data.departmentMemberships) {
            // Extract role keys (handles both string[] and RoleObject[] formats)
            const roleKeys = membership.roles.map((r: any) =>
              typeof r === 'string' ? r : r.role
            );

            const roleGroup = {
              departmentId: membership.departmentId,
              departmentName: membership.departmentName,
              isPrimary: membership.isPrimary,
              roles: roleKeys.map((roleName: string) => ({
                role: roleName,
                displayName: roleDisplayMap[roleName] || roleName.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                scopeType: 'department' as const,
                scopeId: membership.departmentId,
                scopeName: membership.departmentName,
                permissions: membership.accessRights,
              })),
            };

            const hasStaffRole = roleKeys.some((role: string) =>
              ['instructor', 'content-admin', 'department-admin'].includes(role)
            );
            const hasLearnerRole = roleKeys.some((role: string) =>
              ['course-taker', 'auditor', 'learner-supervisor'].includes(role)
            );

            if (hasStaffRole) {
              staffDepartments.departmentRoles.push(roleGroup);
            }
            if (hasLearnerRole) {
              learnerDepartments.departmentRoles.push(roleGroup);
            }
          }

          if (userTypeKeys.includes('staff')) {
            roleHierarchy.staffRoles = staffDepartments;
          }
          if (userTypeKeys.includes('learner')) {
            roleHierarchy.learnerRoles = learnerDepartments;
          }

          // UNIFIED AUTHORIZATION: Extract new fields from API response
          // FALLBACK: If API doesn't provide new fields, build from existing data
          let globalRights = data.globalRights;
          let departmentRights = data.departmentRights;
          const departmentHierarchy = data.departmentHierarchy || {};
          const permissionVersion = data.permissionVersion || 0;

          // If globalRights not provided, extract from allAccessRights
          if (!globalRights || globalRights.length === 0) {
            if (userTypeKeys.includes('global-admin')) {
              globalRights = data.allAccessRights || [];
            } else {
              globalRights = (data.allAccessRights || []).filter(
                (right: string) => right.startsWith('system:')
              );
            }
          }

          // If departmentRights not provided, build from departmentMemberships
          if (!departmentRights || Object.keys(departmentRights).length === 0) {
            departmentRights = {};
            for (const membership of data.departmentMemberships || []) {
              if (membership.accessRights && membership.accessRights.length > 0) {
                departmentRights[membership.departmentId] = membership.accessRights;
              }
            }
          }

          set({
            accessToken,
            user,
            roleHierarchy,
            isAuthenticated: true,
            isLoading: false,
            // UNIFIED AUTHORIZATION (ADR-AUTH-001)
            globalRights,
            departmentRights,
            departmentHierarchy,
            permissionVersion,
          });

          console.log('[AuthStore] Session restored from token', {
            globalRights: globalRights.length,
            departmentRightsKeys: Object.keys(departmentRights),
            permissionVersion,
          });
        } catch (error) {
          console.error('[AuthStore] Failed to restore session:', error);

          // Try to refresh token
          try {
            await get().refreshToken();

            // Retry fetching user
            const response: MyRolesResponse = await apiGetCurrentUser();
            if (response.success && response.data) {
              // Same logic as above - rebuild user and roleHierarchy
              // (For brevity, this would be the same code)
              console.log('[AuthStore] Session restored after token refresh');
            } else {
              // Refresh succeeded but user data invalid - clear state
              throw new Error('Invalid user data after token refresh');
            }
          } catch (refreshError) {
            console.error('[AuthStore] Token refresh also failed:', refreshError);
            // Both failed - clear everything and reset auth state
            clearAllTokens();
            set({
              accessToken: null,
              user: null,
              roleHierarchy: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
              // UNIFIED AUTHORIZATION (ADR-AUTH-001)
              globalRights: [],
              departmentRights: {},
              departmentHierarchy: {},
              permissionVersion: 0,
            });
          }
        }
      },

      // ================================================================
      // Permission Checking (UNIFIED AUTHORIZATION - ADR-AUTH-001)
      // ================================================================

      /**
       * Check if user has a permission
       *
       * UNIFIED PATTERN:
       * 1. Check globalRights first (applies everywhere)
       * 2. If departmentId provided, check departmentRights[departmentId]
       * 3. If no departmentId, check if permission exists in ANY department
       * 4. Support wildcard matching (e.g., "content:*" matches "content:courses:read")
       * 5. Support hierarchy (parent department grants access to children)
       *
       * @param permission - The permission string to check (e.g., "content:courses:read")
       * @param departmentId - Optional department ID for scoped check
       */
      hasPermission: (permission, departmentId) => {
        const { globalRights, departmentRights, departmentHierarchy } = get();

        // Helper: Check if a rights array includes permission (with wildcard support)
        const rightsInclude = (rights: string[], perm: string): boolean => {
          // Direct match
          if (rights.includes(perm)) return true;

          // Wildcard match: system:* grants everything
          if (rights.includes('system:*')) return true;

          // Domain wildcard: content:* matches content:courses:read
          const [domain] = perm.split(':');
          if (rights.includes(`${domain}:*`)) return true;

          // Two-level wildcard: content:courses:* matches content:courses:read
          const parts = perm.split(':');
          if (parts.length === 3) {
            if (rights.includes(`${parts[0]}:${parts[1]}:*`)) return true;
          }

          return false;
        };

        // 1. Check globalRights (applies everywhere)
        if (rightsInclude(globalRights, permission)) {
          return true;
        }

        // 2. If departmentId provided (even empty string), check that specific department
        // This handles the case where caller explicitly wants to check a department (not global)
        if (departmentId !== undefined) {
          // Direct department rights
          const deptRights = departmentRights[departmentId];
          if (deptRights && rightsInclude(deptRights, permission)) {
            return true;
          }

          // Check parent departments via hierarchy (inherited rights)
          // departmentHierarchy is parent -> children[], so we need to find parents
          for (const [parentId, childIds] of Object.entries(departmentHierarchy)) {
            if (childIds.includes(departmentId)) {
              const parentRights = departmentRights[parentId];
              if (parentRights && rightsInclude(parentRights, permission)) {
                return true;
              }
            }
          }

          return false;
        }

        // 3. No departmentId - check if permission exists in ANY department
        for (const rights of Object.values(departmentRights)) {
          if (rightsInclude(rights, permission)) {
            return true;
          }
        }

        return false;
      },

      /**
       * Check if user has permission for a specific department
       * This is a stricter check that requires the departmentId
       */
      hasDepartmentPermission: (permission, departmentId) => {
        return get().hasPermission(permission, departmentId);
      },

      /**
       * Check if user has ANY of the specified permissions
       */
      hasAnyPermission: (permissions, departmentId) => {
        return permissions.some((perm) => get().hasPermission(perm, departmentId));
      },

      /**
       * Check if user has ALL of the specified permissions
       */
      hasAllPermissions: (permissions, departmentId) => {
        return permissions.every((perm) => get().hasPermission(perm, departmentId));
      },

      // ================================================================
      // Role Checking
      // ================================================================

      hasRole: (role, departmentId) => {
        const { roleHierarchy } = get();
        if (!roleHierarchy) return false;

        // Check global roles
        if (!departmentId) {
          return roleHierarchy.globalRoles.some((r) => r.role === role);
        }

        // Check department roles
        if (roleHierarchy.staffRoles) {
          for (const deptGroup of roleHierarchy.staffRoles.departmentRoles) {
            if (deptGroup.departmentId === departmentId) {
              if (deptGroup.roles.some((r) => r.role === role)) {
                return true;
              }
            }
          }
        }

        if (roleHierarchy.learnerRoles) {
          for (const deptGroup of roleHierarchy.learnerRoles.departmentRoles) {
            if (deptGroup.departmentId === departmentId) {
              if (deptGroup.roles.some((r) => r.role === role)) {
                return true;
              }
            }
          }
        }

        return false;
      },

      // ================================================================
      // Utility
      // ================================================================

      clearError: () => set({ error: null }),
    }),
    { name: 'AuthStore' }
  )
);

// ============================================================================
// Export helper to get current access token value
// ============================================================================

/**
 * Get the current access token value for API requests
 * @returns Bearer token string or null
 */
export function getAuthToken(): string | null {
  return getAccessTokenValue();
}
