# LMS UI Implementation Plan v2.0
**Version:** 2.0
**Date:** 2026-01-10
**Status:** Implementation Ready
**Target:** React + TypeScript + Zustand + React Router v6

## Executive Summary

This document provides a complete, ready-to-implement UI architecture for the LMS role system with:

- **Backend-Compatible UserTypes**: `learner`, `staff`, `global-admin` (matches backend implementation)
- **Unified Role Structure**: Both staff and learner profiles use `departmentMemberships` with roles
- **GNAP-Compatible Auth**: Token-based authorization following Grant Negotiation and Authorization Protocol principles
- **Two-Section Navigation**: Global nav + Department selector + Department-scoped actions
- **Complete Component Code**: Fully implemented Sidebar, Auth Store, Navigation Store
- **Permission-Based Access**: All UI elements controlled by granular permissions

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Type Definitions](#2-type-definitions)
3. [GNAP-Compatible Authentication](#3-gnap-compatible-authentication)
4. [State Management](#4-state-management)
5. [Sidebar Implementation](#5-sidebar-implementation)
6. [Protected Routes](#6-protected-routes)
7. [Helper Components](#7-helper-components)
8. [Implementation Checklist](#8-implementation-checklist)

---

## 1. Architecture Overview

### UserType Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                      USER TYPES                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  learner                                                     │
│  ├─ Department memberships with roles                       │
│  ├─ Roles: course-taker, auditor, learner-supervisor        │
│  └─ Dashboard: /learner/* routes                            │
│                                                               │
│  staff                                                       │
│  ├─ Department memberships with roles                       │
│  ├─ Roles: instructor, content-admin, department-admin      │
│  └─ Dashboard: /staff/* routes                              │
│                                                               │
│  global-admin                                                │
│  ├─ GlobalAdmin profile with master department roles        │
│  ├─ Roles: system-admin, enrollment-admin, course-admin     │
│  └─ Dashboard: /admin/* routes (via escalation)             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Login Request
    ↓
GNAP-Compatible Token Grant
    ↓
Backend Returns:
  - Access Token
  - Refresh Token
  - User Profile
  - Role Hierarchy (computed)
    ↓
Frontend Stores:
  - authStore (user + roles + permissions)
  - navigationStore (department selection)
    ↓
Sidebar Renders:
  - Global Nav (userType-based)
  - Department Selector
  - Department Actions (role-based)
    ↓
User Interacts:
  - Select Department → Update navigationStore
  - Click Action → Route to department-scoped page
  - Pages check permissions via hasPermission()
```

### Key Principles

1. **Unified Membership Structure**: Both learner and staff use `departmentMemberships[]`
2. **Permission-Based UI**: Show/hide elements based on permissions, not role names
3. **Department Context**: Operations always scoped to selected department
4. **Token Security**: Access tokens short-lived, refresh tokens HttpOnly cookies
5. **Optimistic UI**: UI reflects state immediately, rolls back on error

---

## 2. Type Definitions

### Location: `src/shared/types/auth.ts`

```typescript
/**
 * Core type definitions for authentication and authorization
 */

// ============================================================================
// User Types
// ============================================================================

/**
 * Available user types in the system
 * Note: Matches backend implementation (singular forms)
 */
export type UserType = 'learner' | 'staff' | 'global-admin';

/**
 * Constants for user types
 */
export const UserTypes = {
  LEARNER: 'learner' as const,
  STAFF: 'staff' as const,
  GLOBAL_ADMIN: 'global-admin' as const,
} as const;

/**
 * Dashboard types corresponding to user types
 */
export type DashboardType = 'learner' | 'staff' | 'admin';

/**
 * Mapping from userType to dashboard route base
 */
export const USER_TYPE_DASHBOARD_MAP: Record<UserType, DashboardType> = {
  'learner': 'learner',
  'staff': 'staff',
  'global-admin': 'admin',
};

// ============================================================================
// User Profile
// ============================================================================

export interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;

  /** User types this user has (can have multiple) */
  userTypes: UserType[];

  /** Which dashboard to show by default on login */
  defaultDashboard: DashboardType;

  /** Last selected department (persisted for UX) */
  lastSelectedDepartment?: string;

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Department Memberships (Unified Structure)
// ============================================================================

/**
 * Department membership with roles
 * Used by BOTH learner and staff
 */
export interface DepartmentMembership {
  departmentId: string;
  departmentName: string;

  /** Roles within this department */
  roles: string[];

  /** Is this the user's primary department? */
  isPrimary: boolean;

  /** When they joined this department */
  joinedAt: string;

  isActive: boolean;
}

/**
 * Staff-specific profile
 */
export interface StaffProfile {
  _id: string;  // Same as User._id
  employeeId?: string;
  title?: string;

  /** Department memberships with roles */
  departmentMemberships: DepartmentMembership[];
}

/**
 * Learner-specific profile
 */
export interface LearnerProfile {
  _id: string;  // Same as User._id
  studentId?: string;

  /** Department memberships with roles */
  departmentMemberships: DepartmentMembership[];

  /** Global learner role (optional) */
  globalLearnerRole?: string;
}

// ============================================================================
// Role Hierarchy (Computed by Backend)
// ============================================================================

/**
 * Single role assignment with context
 */
export interface RoleAssignment {
  /** Role identifier (e.g., 'course-taker', 'instructor') */
  role: string;

  /** Human-readable name */
  displayName: string;

  /** Scope type */
  scopeType: 'none' | 'department' | 'system-setting-group';

  /** Scope ID if scoped */
  scopeId?: string;

  /** Scope name for display */
  scopeName?: string;

  /** Permissions granted by this role */
  permissions: string[];
}

/**
 * Complete role hierarchy returned by backend
 * This is computed server-side and sent on login
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
    departmentRoles: Array<{
      departmentId: string;
      departmentName: string;
      isPrimary: boolean;
      roles: RoleAssignment[];
    }>;
  };

  /** Learner department roles (if user has 'learner' type) */
  learnerRoles?: {
    departmentRoles: Array<{
      departmentId: string;
      departmentName: string;
      roles: RoleAssignment[];
    }>;
    globalRole?: RoleAssignment;
  };

  /** Flattened array of ALL permissions across all roles */
  allPermissions: string[];
}

// ============================================================================
// GNAP Token Structures
// ============================================================================

/**
 * GNAP-compatible access token structure
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
 * GNAP grant structure
 */
export interface TokenGrant {
  /** Access token for API requests */
  accessToken: AccessToken;

  /** Refresh token (if granted) */
  refreshToken?: {
    value: string;
    expiresAt: string;
  };

  /** User profile */
  user: User;

  /** Computed role hierarchy */
  roleHierarchy: RoleHierarchy;

  /** Grant continuation handle (for GNAP continuation) */
  continue?: {
    uri: string;
    wait: number;
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
```

---

## 3. GNAP-Compatible Authentication

### What is GNAP?

**GNAP (Grant Negotiation and Authorization Protocol)** is a modern alternative to OAuth 2.0 that provides:
- More flexible grant negotiation
- Better support for modern authentication patterns
- Stronger security guarantees
- Support for multiple access tokens with different scopes

### GNAP Compatibility Principles

Our implementation follows GNAP principles:

1. **Token Structure**: Explicit token metadata (type, expiration, scope)
2. **Grant Continuation**: Support for multi-step authorization flows
3. **Scope Negotiation**: Permissions explicitly included in grant
4. **Refresh Pattern**: Explicit refresh token handling with rotation

### Auth API Contract

#### Location: `src/entities/auth/api/authApi.ts`

```typescript
/**
 * GNAP-compatible authentication API
 */

export interface LoginRequest {
  email: string;
  password: string;

  /** Optional: Request specific scopes/permissions */
  requestedScopes?: string[];
}

export interface LoginResponse {
  /** GNAP token grant */
  grant: TokenGrant;
}

export interface RefreshRequest {
  /** Refresh token value */
  refreshToken: string;
}

export interface RefreshResponse {
  /** New access token */
  accessToken: AccessToken;

  /** Updated role hierarchy (in case roles changed) */
  roleHierarchy: RoleHierarchy;

  /** Optional: New refresh token (if rotated) */
  refreshToken?: {
    value: string;
    expiresAt: string;
  };
}

/**
 * Login endpoint
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await api.post('/auth/login', credentials);
  return response.data;
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(
  request: RefreshRequest
): Promise<RefreshResponse> {
  const response = await api.post('/auth/refresh', request);
  return response.data;
}

/**
 * Logout endpoint
 */
export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

/**
 * Verify token validity
 */
export async function verifyToken(): Promise<{ valid: boolean }> {
  const response = await api.get('/auth/verify');
  return response.data;
}
```

### Token Storage Strategy

```typescript
/**
 * Token storage utilities
 * Location: src/shared/utils/tokenStorage.ts
 */

const ACCESS_TOKEN_KEY = 'lms_access_token';
const REFRESH_TOKEN_KEY = 'lms_refresh_token';

/**
 * Store access token in memory + sessionStorage
 * (NOT localStorage for security)
 */
export function setAccessToken(token: AccessToken): void {
  // Store in sessionStorage (cleared on tab close)
  sessionStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(token));
}

export function getAccessToken(): AccessToken | null {
  const stored = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  if (!stored) return null;

  const token = JSON.parse(stored) as AccessToken;

  // Check if expired
  if (new Date(token.expiresAt) <= new Date()) {
    removeAccessToken();
    return null;
  }

  return token;
}

export function removeAccessToken(): void {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

/**
 * Store refresh token in httpOnly cookie (preferred)
 * OR in localStorage if cookies not available
 */
export function setRefreshToken(token: string, expiresAt: string): void {
  // If backend sets httpOnly cookie, we don't need to do anything
  // Otherwise, store in localStorage (less secure but functional)
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
  localStorage.setItem(`${REFRESH_TOKEN_KEY}_expires`, expiresAt);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function removeRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(`${REFRESH_TOKEN_KEY}_expires`);
}
```

---

## 4. State Management

### Auth Store

#### Location: `src/features/auth/model/authStore.ts`

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  User,
  RoleHierarchy,
  AccessToken,
  PermissionScope,
  LoginRequest,
} from '@/shared/types/auth';
import {
  login as apiLogin,
  refreshAccessToken as apiRefresh,
  logout as apiLogout,
} from '@/entities/auth/api/authApi';
import {
  setAccessToken,
  getAccessToken,
  removeAccessToken,
  setRefreshToken,
  getRefreshToken,
  removeRefreshToken,
} from '@/shared/utils/tokenStorage';
import { useNavigationStore } from '@/shared/stores/navigationStore';

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

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;

  // Permission checking
  hasPermission: (
    permission: string,
    scope?: PermissionScope
  ) => boolean;

  hasAnyPermission: (
    permissions: string[],
    scope?: PermissionScope
  ) => boolean;

  hasAllPermissions: (
    permissions: string[],
    scope?: PermissionScope
  ) => boolean;

  // Role checking
  hasRole: (
    role: string,
    departmentId?: string
  ) => boolean;

  // Initialization
  initializeAuth: () => Promise<void>;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      // Initial state
      accessToken: null,
      user: null,
      roleHierarchy: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ================================================================
      // Login
      // ================================================================
      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiLogin(credentials);
          const { grant } = response;

          // Store tokens
          setAccessToken(grant.accessToken);
          if (grant.refreshToken) {
            setRefreshToken(
              grant.refreshToken.value,
              grant.refreshToken.expiresAt
            );
          }

          // Update state
          set({
            accessToken: grant.accessToken,
            user: grant.user,
            roleHierarchy: grant.roleHierarchy,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          console.log('[Auth] Login successful:', {
            userId: grant.user._id,
            userTypes: grant.user.userTypes,
            defaultDashboard: grant.user.defaultDashboard,
          });
        } catch (error: any) {
          console.error('[Auth] Login failed:', error);
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Login failed',
          });
          throw error;
        }
      },

      // ================================================================
      // Logout
      // ================================================================
      logout: async () => {
        try {
          await apiLogout();
        } catch (error) {
          console.error('[Auth] Logout API call failed:', error);
          // Continue with local cleanup even if API fails
        }

        // Clear tokens
        removeAccessToken();
        removeRefreshToken();

        // Clear state
        set({
          accessToken: null,
          user: null,
          roleHierarchy: null,
          isAuthenticated: false,
          error: null,
        });

        // Clear navigation state
        useNavigationStore.getState().clearDepartmentSelection();

        console.log('[Auth] Logout complete');
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
          const response = await apiRefresh({ refreshToken });

          // Store new access token
          setAccessToken(response.accessToken);

          // Store new refresh token if rotated
          if (response.refreshToken) {
            setRefreshToken(
              response.refreshToken.value,
              response.refreshToken.expiresAt
            );
          }

          // Update state
          set({
            accessToken: response.accessToken,
            roleHierarchy: response.roleHierarchy,
          });

          console.log('[Auth] Token refreshed successfully');
        } catch (error) {
          console.error('[Auth] Token refresh failed:', error);

          // Refresh failed - logout user
          get().logout();
          throw error;
        }
      },

      // ================================================================
      // Permission Checking
      // ================================================================

      hasPermission: (permission, scope) => {
        const { roleHierarchy } = get();
        if (!roleHierarchy) return false;

        // Check for wildcard permission
        if (roleHierarchy.allPermissions.includes('system:*')) {
          return true;
        }

        // No scope - check if permission exists anywhere
        if (!scope) {
          return roleHierarchy.allPermissions.includes(permission);
        }

        // Check department-scoped permissions
        if (scope.type === 'department') {
          // Check staff roles in this department
          if (roleHierarchy.staffRoles) {
            for (const deptGroup of roleHierarchy.staffRoles.departmentRoles) {
              if (deptGroup.departmentId === scope.id) {
                // Check if any role in this department has the permission
                for (const roleAssignment of deptGroup.roles) {
                  if (roleAssignment.permissions.includes(permission)) {
                    return true;
                  }
                }
              }
            }
          }

          // Check learner roles in this department
          if (roleHierarchy.learnerRoles) {
            for (const deptGroup of roleHierarchy.learnerRoles.departmentRoles) {
              if (deptGroup.departmentId === scope.id) {
                // Check if any role in this department has the permission
                for (const roleAssignment of deptGroup.roles) {
                  if (roleAssignment.permissions.includes(permission)) {
                    return true;
                  }
                }
              }
            }
          }
        }

        return false;
      },

      hasAnyPermission: (permissions, scope) => {
        return permissions.some((perm) => get().hasPermission(perm, scope));
      },

      hasAllPermissions: (permissions, scope) => {
        return permissions.every((perm) => get().hasPermission(perm, scope));
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
      // Initialize Auth from Stored Tokens
      // ================================================================

      initializeAuth: async () => {
        const accessToken = getAccessToken();

        if (!accessToken) {
          console.log('[Auth] No stored token found');
          return;
        }

        // Token exists and is valid
        // We need to fetch user profile and role hierarchy
        // This requires a backend endpoint like GET /auth/me
        try {
          set({ isLoading: true });

          // Assuming we have an endpoint to get current user
          const response = await api.get('/auth/me');
          const { user, roleHierarchy } = response.data;

          set({
            accessToken,
            user,
            roleHierarchy,
            isAuthenticated: true,
            isLoading: false,
          });

          console.log('[Auth] Session restored from token');
        } catch (error) {
          console.error('[Auth] Failed to restore session:', error);

          // Try to refresh token
          try {
            await get().refreshToken();

            // Retry fetching user
            const response = await api.get('/auth/me');
            const { user, roleHierarchy } = response.data;

            set({
              accessToken: getAccessToken(),
              user,
              roleHierarchy,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (refreshError) {
            // Both failed - clear everything
            removeAccessToken();
            removeRefreshToken();
            set({ isLoading: false });
          }
        }
      },

      // ================================================================
      // Utility
      // ================================================================

      clearError: () => set({ error: null }),
    }),
    { name: 'AuthStore' }
  )
);
```

### Navigation Store

#### Location: `src/shared/stores/navigationStore.ts`

```typescript
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// ============================================================================
// State Interface
// ============================================================================

interface NavigationState {
  /** Currently selected department ID (null = no department selected) */
  selectedDepartmentId: string | null;

  /** Map of userId to their last accessed department ID */
  lastAccessedDepartments: Record<string, string>;

  /** Mobile sidebar open state */
  isSidebarOpen: boolean;

  // Actions
  setSelectedDepartment: (deptId: string | null) => void;
  rememberDepartment: (userId: string, deptId: string) => void;
  clearDepartmentSelection: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useNavigationStore = create<NavigationState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        selectedDepartmentId: null,
        lastAccessedDepartments: {},
        isSidebarOpen: false,

        // Actions
        setSelectedDepartment: (deptId) => {
          set({ selectedDepartmentId: deptId });
          console.log('[Navigation] Department selected:', deptId);
        },

        rememberDepartment: (userId, deptId) => {
          set((state) => ({
            lastAccessedDepartments: {
              ...state.lastAccessedDepartments,
              [userId]: deptId,
            },
          }));
          console.log('[Navigation] Remembered department for user:', { userId, deptId });
        },

        clearDepartmentSelection: () => {
          set({ selectedDepartmentId: null });
          console.log('[Navigation] Department selection cleared');
        },

        toggleSidebar: () => {
          set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
        },

        setSidebarOpen: (open) => {
          set({ isSidebarOpen: open });
        },
      }),
      {
        name: 'navigation-storage',
        // Only persist department selections, not sidebar state
        partialize: (state) => ({
          lastAccessedDepartments: state.lastAccessedDepartments,
        }),
      }
    ),
    { name: 'NavigationStore' }
  )
);
```

---

## 5. Sidebar Implementation

### Navigation Item Definitions

#### Location: `src/widgets/sidebar/config/navItems.ts`

```typescript
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
  pathTemplate: string;  // e.g., '/staff/departments/:deptId/courses'
  icon: LucideIcon;
  requiredPermission: string;  // Must have in selected department
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
```

### Sidebar Component

#### Location: `src/widgets/sidebar/Sidebar.tsx`

```typescript
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  AlertCircle,
  Settings,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/model/authStore';
import { useNavigationStore } from '@/shared/stores/navigationStore';
import { GLOBAL_NAV_ITEMS, DEPARTMENT_NAV_ITEMS } from './config/navItems';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';
import type { GlobalNavItem, DepartmentNavItem } from './config/navItems';

// ============================================================================
// Types
// ============================================================================

interface UserDepartment {
  id: string;
  name: string;
  isPrimary: boolean;
  type: 'staff' | 'learner';
}

interface ProcessedDepartmentNavItem extends Omit<DepartmentNavItem, 'pathTemplate'> {
  path: string;
}

// ============================================================================
// Sidebar Component
// ============================================================================

export const Sidebar: React.FC = () => {
  const { roleHierarchy, user, hasPermission } = useAuthStore();
  const {
    selectedDepartmentId,
    setSelectedDepartment,
    rememberDepartment,
    lastAccessedDepartments,
    isSidebarOpen,
    setSidebarOpen,
  } = useNavigationStore();

  // Guard: Must have auth data
  if (!roleHierarchy || !user) {
    return null;
  }

  const primaryUserType = roleHierarchy.primaryUserType;

  // ================================================================
  // Filter Global Nav Items
  // ================================================================

  const globalNavItems = GLOBAL_NAV_ITEMS.filter((item) => {
    // Check if this item applies to current userType
    if (!item.userTypes.includes(primaryUserType)) {
      return false;
    }

    // Check permission if required
    if (item.requiredPermission) {
      return hasPermission(item.requiredPermission);
    }

    return true;
  });

  // ================================================================
  // Get User's Departments
  // ================================================================

  const userDepartments: UserDepartment[] = React.useMemo(() => {
    const departments: UserDepartment[] = [];

    // Add staff departments
    if (roleHierarchy.staffRoles) {
      for (const deptGroup of roleHierarchy.staffRoles.departmentRoles) {
        departments.push({
          id: deptGroup.departmentId,
          name: deptGroup.departmentName,
          isPrimary: deptGroup.isPrimary,
          type: 'staff',
        });
      }
    }

    // Add learner departments
    if (roleHierarchy.learnerRoles) {
      for (const deptGroup of roleHierarchy.learnerRoles.departmentRoles) {
        departments.push({
          id: deptGroup.departmentId,
          name: deptGroup.departmentName,
          isPrimary: false,
          type: 'learner',
        });
      }
    }

    return departments;
  }, [roleHierarchy]);

  // ================================================================
  // Auto-Select Last Accessed Department
  // ================================================================

  React.useEffect(() => {
    if (!user || userDepartments.length === 0) return;
    if (selectedDepartmentId) return; // Already selected

    // Try to restore last accessed department
    const lastDept = lastAccessedDepartments[user._id];

    if (lastDept && userDepartments.some((d) => d.id === lastDept)) {
      setSelectedDepartment(lastDept);
      console.log('[Sidebar] Restored last department:', lastDept);
    }

    // Otherwise, default to NO department selected
    // User must explicitly choose
  }, [
    user?._id,
    userDepartments.length,
    selectedDepartmentId,
    lastAccessedDepartments,
    setSelectedDepartment,
  ]);

  // ================================================================
  // Handle Department Selection
  // ================================================================

  const handleDepartmentClick = (deptId: string) => {
    // Toggle: clicking selected department deselects it
    const newSelection = selectedDepartmentId === deptId ? null : deptId;

    setSelectedDepartment(newSelection);

    // Remember this selection for next time
    if (user && newSelection) {
      rememberDepartment(user._id, newSelection);
    }
  };

  // ================================================================
  // Get Department-Specific Nav Items
  // ================================================================

  const departmentNavItems: ProcessedDepartmentNavItem[] = React.useMemo(() => {
    if (!selectedDepartmentId) return [];

    return DEPARTMENT_NAV_ITEMS.filter((item) => {
      // Check if this item applies to current userType
      if (!item.userTypes.includes(primaryUserType)) {
        return false;
      }

      // Check if user has permission in THIS department
      return hasPermission(item.requiredPermission, {
        type: 'department',
        id: selectedDepartmentId,
      });
    }).map((item) => ({
      ...item,
      path: item.pathTemplate.replace(':deptId', selectedDepartmentId),
    }));
  }, [selectedDepartmentId, primaryUserType, hasPermission]);

  // ================================================================
  // Render
  // ================================================================

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] border-r bg-background',
          'lg:sticky lg:top-14 lg:z-30',
          'w-64 transition-transform duration-300 flex flex-col',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Mobile Close Button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b">
          <span className="font-semibold">Navigation</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 hover:bg-accent rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Section 1: Global Navigation */}
        <div className="flex-shrink-0 border-b">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Navigation
          </div>
          <nav className="space-y-1 px-2 pb-4">
            {globalNavItems.map((item) => (
              <NavLink
                key={item.path}
                label={item.label}
                path={item.path}
                icon={item.icon}
                onClick={() => setSidebarOpen(false)}
              />
            ))}
          </nav>
        </div>

        {/* Section 2: Department Selector */}
        {userDepartments.length > 0 && (
          <div className="flex-shrink-0 border-b">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              My Departments
            </div>
            <div className="space-y-1 px-2 pb-4">
              {userDepartments.map((dept) => {
                const isSelected = selectedDepartmentId === dept.id;

                return (
                  <button
                    key={dept.id}
                    onClick={() => handleDepartmentClick(dept.id)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent text-muted-foreground'
                    )}
                  >
                    {isSelected ? (
                      <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0" />
                    )}
                    <Folder className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 text-left truncate">{dept.name}</span>
                    {dept.isPrimary && (
                      <Badge variant="secondary" className="text-xs">
                        Primary
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 3: Department-Specific Actions */}
        {userDepartments.length > 0 && (
          <div className="flex-1 overflow-y-auto border-b">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Department Actions
            </div>

            {/* No Department Selected */}
            {!selectedDepartmentId && (
              <div className="px-4 py-8 text-center">
                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Select a department above to see available actions
                </p>
              </div>
            )}

            {/* No Actions Available */}
            {selectedDepartmentId && departmentNavItems.length === 0 && (
              <div className="px-4 py-8 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No actions available for this department
                </p>
              </div>
            )}

            {/* Department Actions */}
            {selectedDepartmentId && departmentNavItems.length > 0 && (
              <nav className="space-y-1 px-2 pb-4">
                {departmentNavItems.map((item) => (
                  <NavLink
                    key={item.path}
                    label={item.label}
                    path={item.path}
                    icon={item.icon}
                    onClick={() => setSidebarOpen(false)}
                  />
                ))}
              </nav>
            )}
          </div>
        )}

        {/* Settings Footer */}
        <div className="flex-shrink-0 p-2 border-t">
          <NavLink
            label="Settings"
            path="/settings"
            icon={Settings}
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      </aside>
    </>
  );
};

// ============================================================================
// NavLink Component
// ============================================================================

interface NavLinkProps {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ label, path, icon: Icon, onClick }) => {
  const location = useLocation();
  const isActive =
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <Link
      to={path}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground'
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
};
```

---

## 6. Protected Routes

### ProtectedRoute Component

#### Location: `src/app/router/ProtectedRoute.tsx`

```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/model/authStore';
import { useNavigationStore } from '@/shared/stores/navigationStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';

// ============================================================================
// Props Interface
// ============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode;

  /** Single required permission */
  requiredPermission?: string;

  /** Requires ALL of these permissions */
  requireAllPermissions?: string[];

  /** Requires ANY of these permissions */
  requireAnyPermissions?: string[];

  /** Requires a department to be selected */
  requireDepartment?: boolean;

  /** Custom fallback component */
  fallback?: React.ReactNode;
}

// ============================================================================
// Component
// ============================================================================

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requireAllPermissions,
  requireAnyPermissions,
  requireDepartment,
  fallback,
}) => {
  const { isAuthenticated, roleHierarchy, hasPermission, hasAnyPermission, hasAllPermissions } =
    useAuthStore();
  const { selectedDepartmentId } = useNavigationStore();

  // ================================================================
  // Not Authenticated
  // ================================================================

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ================================================================
  // Loading Role Hierarchy
  // ================================================================

  if (!roleHierarchy) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading permissions...</p>
        </div>
      </div>
    );
  }

  // ================================================================
  // Department Selection Required
  // ================================================================

  if (requireDepartment && !selectedDepartmentId) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center h-screen p-4">
        <Card className="max-w-md">
          <CardHeader>
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <CardTitle>Department Selection Required</CardTitle>
            <CardDescription>
              This page requires you to select a department from the sidebar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.history.back()} variant="outline">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ================================================================
  // Permission Checks
  // ================================================================

  // Build scope if department required
  const scope = requireDepartment && selectedDepartmentId
    ? { type: 'department' as const, id: selectedDepartmentId }
    : undefined;

  // Check single permission
  if (requiredPermission && !hasPermission(requiredPermission, scope)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check all permissions
  if (requireAllPermissions && !hasAllPermissions(requireAllPermissions, scope)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check any permission
  if (requireAnyPermissions && !hasAnyPermission(requireAnyPermissions, scope)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ================================================================
  // Authorized
  // ================================================================

  return <>{children}</>;
};
```

### Router Configuration

#### Location: `src/app/router/index.tsx`

```typescript
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '@/app/layouts/AppLayout';

// Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { UnauthorizedPage } from '@/pages/errors/UnauthorizedPage';

// Learner Pages
import { LearnerDashboard } from '@/pages/learner/LearnerDashboard';
import { LearnerProfile } from '@/pages/learner/LearnerProfile';
import { DepartmentCoursesPage } from '@/pages/learner/DepartmentCoursesPage';

// Staff Pages
import { StaffDashboard } from '@/pages/staff/StaffDashboard';
import { StaffProfile } from '@/pages/staff/StaffProfile';
import { StaffReportsPage } from '@/pages/staff/reports/StaffReportsPage';
import { GradingPage } from '@/pages/staff/grading/GradingPage';
import { CreateCoursePage } from '@/pages/staff/CreateCoursePage';

// Admin Pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected Routes with Layout */}
      <Route path="/" element={<AppLayout />}>
        {/* Root redirect */}
        <Route index element={<Navigate to="/login" replace />} />

        {/* ============================================ */}
        {/* LEARNER ROUTES */}
        {/* ============================================ */}
        <Route path="learner">
          <Route
            path="dashboard"
            element={
              <ProtectedRoute requiredPermission="dashboard:view-my-courses">
                <LearnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <LearnerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="departments/:deptId/courses"
            element={
              <ProtectedRoute
                requiredPermission="course:view-department"
                requireDepartment
              >
                <DepartmentCoursesPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ============================================ */}
        {/* STAFF ROUTES */}
        {/* ============================================ */}
        <Route path="staff">
          <Route
            path="dashboard"
            element={
              <ProtectedRoute requiredPermission="dashboard:view-my-classes">
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <StaffProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute requiredPermission="report:view-own-classes">
                <StaffReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="grading"
            element={
              <ProtectedRoute
                requireAnyPermissions={['grade:edit-department', 'grade:view-others-department']}
              >
                <GradingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="departments/:deptId/courses/create"
            element={
              <ProtectedRoute
                requiredPermission="course:create-department"
                requireDepartment
              >
                <CreateCoursePage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ============================================ */}
        {/* ADMIN ROUTES */}
        {/* ============================================ */}
        <Route path="admin">
          <Route
            path="dashboard"
            element={
              <ProtectedRoute requiredPermission="dashboard:view-system-overview">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
```

---

## 7. Helper Components

### Permission Gate

#### Location: `src/shared/components/PermissionGate.tsx`

```typescript
import React from 'react';
import { useAuthStore } from '@/features/auth/model/authStore';
import { useNavigationStore } from '@/shared/stores/navigationStore';
import type { PermissionScope } from '@/shared/types/auth';

// ============================================================================
// Props Interface
// ============================================================================

interface PermissionGateProps {
  /** Required permission */
  permission: string;

  /** Multiple permissions (requires ALL) */
  permissions?: string[];

  /** Is this permission department-scoped? */
  departmentScoped?: boolean;

  /** Custom scope (overrides departmentScoped) */
  scope?: PermissionScope;

  /** Fallback component if permission denied */
  fallback?: React.ReactNode;

  /** Children to render if permission granted */
  children: React.ReactNode;
}

// ============================================================================
// Component
// ============================================================================

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  permissions,
  departmentScoped = false,
  scope,
  fallback = null,
  children,
}) => {
  const { hasPermission, hasAllPermissions } = useAuthStore();
  const { selectedDepartmentId } = useNavigationStore();

  // Determine scope
  const effectiveScope = React.useMemo(() => {
    if (scope) return scope;

    if (departmentScoped && selectedDepartmentId) {
      return { type: 'department' as const, id: selectedDepartmentId };
    }

    return undefined;
  }, [scope, departmentScoped, selectedDepartmentId]);

  // Check permissions
  const hasAccess = React.useMemo(() => {
    if (permissions && permissions.length > 0) {
      return hasAllPermissions(permissions, effectiveScope);
    }

    return hasPermission(permission, effectiveScope);
  }, [permission, permissions, effectiveScope, hasPermission, hasAllPermissions]);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Usage Examples:
 *
 * // Simple permission check
 * <PermissionGate permission="course:create-department">
 *   <Button>Create Course</Button>
 * </PermissionGate>
 *
 * // Department-scoped check
 * <PermissionGate permission="course:create-department" departmentScoped>
 *   <Button>Create Course</Button>
 * </PermissionGate>
 *
 * // Multiple permissions (ALL required)
 * <PermissionGate permissions={['course:create', 'course:publish']}>
 *   <Button>Publish Course</Button>
 * </PermissionGate>
 *
 * // With fallback
 * <PermissionGate
 *   permission="course:delete"
 *   fallback={<p className="text-muted-foreground">No permission</p>}
 * >
 *   <Button variant="destructive">Delete Course</Button>
 * </PermissionGate>
 */
```

### Department Context Provider

#### Location: `src/shared/contexts/DepartmentContext.tsx`

```typescript
import React, { createContext, useContext, useMemo } from 'react';
import { useAuthStore } from '@/features/auth/model/authStore';
import { useNavigationStore } from '@/shared/stores/navigationStore';

// ============================================================================
// Context Value Interface
// ============================================================================

interface DepartmentContextValue {
  /** Currently selected department ID */
  departmentId: string | null;

  /** Department display name */
  departmentName: string | null;

  /** Check if user has permission in this department */
  hasPermission: (permission: string) => boolean;

  /** Check if user has role in this department */
  hasRole: (role: string) => boolean;
}

// ============================================================================
// Context
// ============================================================================

const DepartmentContext = createContext<DepartmentContextValue | null>(null);

// ============================================================================
// Provider Component
// ============================================================================

export const DepartmentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { selectedDepartmentId } = useNavigationStore();
  const { roleHierarchy, hasPermission: authHasPermission, hasRole: authHasRole } =
    useAuthStore();

  // Get department name
  const departmentName = useMemo(() => {
    if (!selectedDepartmentId || !roleHierarchy) return null;

    // Check staff departments
    const staffDept = roleHierarchy.staffRoles?.departmentRoles.find(
      (d) => d.departmentId === selectedDepartmentId
    );
    if (staffDept) return staffDept.departmentName;

    // Check learner departments
    const learnerDept = roleHierarchy.learnerRoles?.departmentRoles.find(
      (d) => d.departmentId === selectedDepartmentId
    );
    if (learnerDept) return learnerDept.departmentName;

    return null;
  }, [selectedDepartmentId, roleHierarchy]);

  // Permission checking scoped to this department
  const hasPermission = React.useCallback(
    (permission: string) => {
      if (!selectedDepartmentId) return false;

      return authHasPermission(permission, {
        type: 'department',
        id: selectedDepartmentId,
      });
    },
    [selectedDepartmentId, authHasPermission]
  );

  // Role checking scoped to this department
  const hasRole = React.useCallback(
    (role: string) => {
      if (!selectedDepartmentId) return false;
      return authHasRole(role, selectedDepartmentId);
    },
    [selectedDepartmentId, authHasRole]
  );

  const value: DepartmentContextValue = {
    departmentId: selectedDepartmentId,
    departmentName,
    hasPermission,
    hasRole,
  };

  return (
    <DepartmentContext.Provider value={value}>
      {children}
    </DepartmentContext.Provider>
  );
};

// ============================================================================
// Hook
// ============================================================================

export const useDepartmentContext = () => {
  const context = useContext(DepartmentContext);

  if (!context) {
    throw new Error(
      'useDepartmentContext must be used within DepartmentProvider'
    );
  }

  return context;
};

/**
 * Usage Example:
 *
 * function CreateCourseButton() {
 *   const { departmentId, departmentName, hasPermission } = useDepartmentContext();
 *
 *   if (!hasPermission('course:create-department')) {
 *     return null;
 *   }
 *
 *   return (
 *     <Button onClick={() => createCourse(departmentId)}>
 *       Create Course in {departmentName}
 *     </Button>
 *   );
 * }
 */
```

---

## 8. Implementation Checklist

### Phase 1: Core Infrastructure (Week 1)

- [ ] **Type Definitions**
  - [ ] Create `src/shared/types/auth.ts` with all type definitions
  - [ ] Update existing types to use new UserType convention
  - [ ] Add GNAP token structures
  - [ ] Create permission scope types

- [ ] **Token Management**
  - [ ] Create `src/shared/utils/tokenStorage.ts`
  - [ ] Implement access token storage (sessionStorage)
  - [ ] Implement refresh token storage (localStorage)
  - [ ] Add token expiration checking

- [ ] **Auth API**
  - [ ] Create `src/entities/auth/api/authApi.ts`
  - [ ] Implement login endpoint with GNAP response
  - [ ] Implement refresh token endpoint
  - [ ] Implement logout endpoint
  - [ ] Implement verify token endpoint

### Phase 2: State Management (Week 1-2)

- [ ] **Auth Store**
  - [ ] Create `src/features/auth/model/authStore.ts`
  - [ ] Implement login action with token storage
  - [ ] Implement logout action with cleanup
  - [ ] Implement refresh token action
  - [ ] Implement hasPermission method
  - [ ] Implement hasRole method
  - [ ] Implement initializeAuth for session restoration
  - [ ] Add error handling and loading states

- [ ] **Navigation Store**
  - [ ] Create `src/shared/stores/navigationStore.ts`
  - [ ] Implement department selection state
  - [ ] Implement last accessed department persistence
  - [ ] Implement sidebar open/close state
  - [ ] Add localStorage persistence

### Phase 3: Navigation Components (Week 2-3)

- [ ] **Navigation Items**
  - [ ] Create `src/widgets/sidebar/config/navItems.ts`
  - [ ] Define GLOBAL_NAV_ITEMS with all three userTypes
  - [ ] Define DEPARTMENT_NAV_ITEMS for staff and learners
  - [ ] Add proper icons and permissions

- [ ] **Sidebar Component**
  - [ ] Create `src/widgets/sidebar/Sidebar.tsx`
  - [ ] Implement Section 1: Global Navigation
  - [ ] Implement Section 2: Department Selector
  - [ ] Implement Section 3: Department Actions
  - [ ] Add auto-restore last department
  - [ ] Add mobile responsive behavior
  - [ ] Add empty states

### Phase 4: Routing & Protection (Week 3)

- [ ] **Protected Routes**
  - [ ] Create `src/app/router/ProtectedRoute.tsx`
  - [ ] Implement authentication check
  - [ ] Implement permission checking
  - [ ] Implement department selection check
  - [ ] Add loading and error states

- [ ] **Router Configuration**
  - [ ] Update `src/app/router/index.tsx`
  - [ ] Add learner routes with protection
  - [ ] Add staff routes with protection
  - [ ] Add admin routes with protection
  - [ ] Add unauthorized page

### Phase 5: Helper Components (Week 3-4)

- [ ] **Permission Gate**
  - [ ] Create `src/shared/components/PermissionGate.tsx`
  - [ ] Implement single permission check
  - [ ] Implement multiple permissions check
  - [ ] Support department scoping
  - [ ] Add fallback rendering

- [ ] **Department Context**
  - [ ] Create `src/shared/contexts/DepartmentContext.tsx`
  - [ ] Implement department provider
  - [ ] Add scoped permission checking
  - [ ] Add scoped role checking
  - [ ] Create useDepartmentContext hook

### Phase 6: Login & Session (Week 4)

- [ ] **Login Form**
  - [ ] Update login form to use new auth store
  - [ ] Navigate to defaultDashboard on success
  - [ ] Handle GNAP token grant
  - [ ] Add error handling

- [ ] **Session Management**
  - [ ] Initialize auth on app load
  - [ ] Implement token refresh interceptor
  - [ ] Handle token expiration
  - [ ] Clear state on logout

### Phase 7: Testing & Polish (Week 4)

- [ ] **Unit Tests**
  - [ ] Test auth store actions
  - [ ] Test navigation store
  - [ ] Test permission checking logic
  - [ ] Test token storage utilities

- [ ] **Integration Tests**
  - [ ] Test login → dashboard flow
  - [ ] Test department selection → actions
  - [ ] Test protected route access
  - [ ] Test permission gate rendering

- [ ] **E2E Tests**
  - [ ] Test complete login flow
  - [ ] Test department switching
  - [ ] Test role-based navigation
  - [ ] Test mobile sidebar behavior

- [ ] **Documentation**
  - [ ] Document permission naming conventions
  - [ ] Create component usage examples
  - [ ] Document GNAP token flow
  - [ ] Update developer onboarding

---

## Estimated Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1: Core Infrastructure | 3 days | Types, token storage, auth API |
| Phase 2: State Management | 4 days | Auth store, navigation store |
| Phase 3: Navigation Components | 5 days | Sidebar, nav items, mobile support |
| Phase 4: Routing & Protection | 3 days | Protected routes, router config |
| Phase 5: Helper Components | 3 days | Permission gate, department context |
| Phase 6: Login & Session | 2 days | Login form, session management |
| Phase 7: Testing & Polish | 4 days | Tests, docs, bug fixes |

**Total: 24 days (~5 weeks)**

---

## Migration Strategy

### From Current System

1. **Add new types alongside old types** - Don't break existing code
2. **Implement new auth store** - Keep old store until migration complete
3. **Create feature flags** - Enable new system per route
4. **Gradual rollout** - Migrate one dashboard at a time (learner → staff → admin)
5. **Data migration** - Update user documents with new structure
6. **Remove old code** - After all routes migrated and tested

### Backward Compatibility

```typescript
// Example: Support both old and new role formats
function normalizeUserType(oldRole: string): UserType {
  const mapping: Record<string, UserType> = {
    'learner': 'learner',
    'staff': 'staff',
    'instructor': 'staff',
    'content-admin': 'staff',
    'admin': 'global-admin',
    'system-admin': 'global-admin',
  };

  return mapping[oldRole] || 'learner';
}
```

---

## Security Considerations

### GNAP Token Security

1. **Access Token**: Short-lived (15 minutes), stored in sessionStorage
2. **Refresh Token**: Long-lived (7 days), stored in httpOnly cookie (preferred) or localStorage
3. **Token Rotation**: New refresh token on each refresh
4. **Scope Restriction**: Tokens include explicit permission scopes
5. **XSS Protection**: Avoid storing sensitive data in localStorage
6. **CSRF Protection**: Use CSRF tokens for refresh endpoint

### Permission Enforcement

1. **Server-side validation**: Frontend checks are for UX only, backend enforces
2. **Department scope validation**: Always verify department access on backend
3. **Role changes**: Frontend polls or uses WebSocket for real-time updates
4. **Audit logging**: Log all permission checks and failures

---

## Appendix: GNAP Resources

- [GNAP Specification (RFC 9635)](https://datatracker.ietf.org/doc/html/rfc9635)
- [GNAP vs OAuth 2.0](https://oauth.net/gnap/)
- [Grant Negotiation Patterns](https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-20.html)

---

**End of Document**
