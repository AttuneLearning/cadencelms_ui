# UI Role System V2 - Change Implementation Guide

**Date**: 2026-01-11  
**Status**: Active - Aligning UI with API V2 Contracts  
**Reference**: `api_contracts/UI_ROLE_SYSTEM_CONTRACTS.md`

---

## Executive Summary

This document tracks the differences between the current UI implementation and the target V2 API contracts. Since this is a greenfield application (no production deployment), we can make breaking changes freely.

---

## Table of Contents

1. [Contract Comparison Matrix](#1-contract-comparison-matrix)
2. [Login Response Changes](#2-login-response-changes)
3. [Auth State Alignment](#3-auth-state-alignment)
4. [Token Storage Strategy](#4-token-storage-strategy)
5. [Navigation Store Updates](#5-navigation-store-updates)
6. [Department Switching](#6-department-switching)
7. [Admin Escalation](#7-admin-escalation)
8. [Permission Checking](#8-permission-checking)
9. [Implementation Tasks](#9-implementation-tasks)

---

## 1. Contract Comparison Matrix

### 1.1 Current UI State vs. Contract Target

| Feature | Current UI State | Contract Target | Gap |
|---------|------------------|-----------------|-----|
| **Login Response** | ✅ Aligned | V2 Format | Minor field names |
| **Token Storage** | ✅ Fixed | sessionStorage/memory | - |
| **Admin Escalation** | ✅ Working | `/auth/escalate` | - |
| **Department Switching** | ⚠️ Partial | `/auth/switch-department` | Need API call |
| **RoleHierarchy** | ✅ Aligned | Computed server-side | - |
| **Refresh Token** | ✅ Working | Returns new RoleHierarchy | - |
| **CurrentDepartment State** | ❌ Missing | Track current dept context | **Needs Work** |
| **DisplayAs Labels** | ⚠️ Client-side | Server-side via `UserTypeObject` | **Needs Work** |

### 1.2 Endpoint Status

| Endpoint | Contract | UI Implementation | Status |
|----------|----------|-------------------|--------|
| `POST /auth/login` | V2 | ✅ Implemented | Working |
| `POST /auth/logout` | V2 | ✅ Implemented | Working |
| `POST /auth/refresh` | V2 | ✅ Implemented | Working |
| `POST /auth/escalate` | V2 | ✅ Implemented | Working |
| `POST /auth/switch-department` | V2 | ❌ Not Calling | **Needs Work** |
| `GET /auth/me` | V2 | ✅ Implemented | Working |
| `GET /roles/me` | V2 | ❌ Not Used | Consider for refresh |

---

## 2. Login Response Changes

### 2.1 Contract Structure (Target)

```typescript
interface LoginResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      isActive: boolean;
      lastLogin: string | null;
      createdAt: string;
    };
    session: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      tokenType: 'Bearer';
    };
    userTypes: UserType[];
    defaultDashboard: 'learner' | 'staff';
    canEscalateToAdmin: boolean;
    departmentMemberships: DepartmentMembership[];
    allAccessRights: string[];
    lastSelectedDepartment: string | null;
  };
}
```

### 2.2 Current UI Handling ✅

The current `authStore.ts` correctly handles this response format (lines 113-205).

### 2.3 Potential Improvements

| Change | Priority | Notes |
|--------|----------|-------|
| Add `user.preferredName` support | Low | For display name customization |
| Add `user.avatarUrl` support | Low | For avatar display |
| Use `UserTypeObject.displayAs` | ⚡ High | Server-side display labels |

---

## 2A. UserType DisplayAs Alignment

### 2A.1 Contract Specification (Target)

The API contracts have been updated to return `userTypes` as objects with `displayAs`:

```typescript
// From api_contracts/api/lookup-values.contract.ts
export interface UserTypeObject {
  _id: 'learner' | 'staff' | 'global-admin';
  displayAs: string;  // "Learner", "Staff", "System Admin"
}

// Login response now returns:
userTypes: [
  { _id: 'staff', displayAs: 'Staff' },
  { _id: 'global-admin', displayAs: 'System Admin' }
]
```

### 2A.2 Current UI Implementation ❌ Not Aligned

The UI currently:
1. **Expects `userTypes` as `string[]`** - not `UserTypeObject[]`
2. **Hardcodes display labels** in `Header.tsx`:

```typescript
// Current hardcoded implementation in Header.tsx
const getDisplayAsLabel = (userType: string | null): string => {
  switch (userType) {
    case 'staff': return 'Staff';
    case 'learner': return 'Learner';
    case 'global-admin': return 'System Admin';
    default: return 'User';
  }
};
```

### 2A.3 Gap Analysis

| Aspect | Current UI | Contract Target | Gap |
|--------|------------|-----------------|-----|
| `userTypes` type | `UserType[]` (strings) | `UserTypeObject[]` | **Breaking** |
| Display labels | Hardcoded client-side | Server `displayAs` | **Needs Update** |
| Role display names | Hardcoded | `RoleObject.displayAs` | **Needs Update** |
| Localization ready | No | Yes (via lookup values) | **Foundation** |

### 2A.4 Required Changes

#### A. Update Type Definitions

```typescript
// src/shared/types/auth.ts

// NEW: UserType can be string or object (for backward compatibility)
export type UserType = 'learner' | 'staff' | 'global-admin';

// NEW: UserTypeObject for V2.1 responses
export interface UserTypeObject {
  _id: UserType;
  displayAs: string;
}

// Update LoginResponse
export interface LoginResponse {
  success: boolean;
  data: {
    // ... existing fields ...
    
    // CHANGED: from UserType[] to UserTypeObject[]
    userTypes: UserTypeObject[];
    
    // ... rest of fields ...
  };
}
```

#### B. Update authStore Login Handler

```typescript
// src/features/auth/model/authStore.ts

// Extract user types handling
const userTypeStrings = data.userTypes.map(ut => 
  typeof ut === 'string' ? ut : ut._id
);

const userTypeDisplayMap: Record<string, string> = {};
data.userTypes.forEach(ut => {
  if (typeof ut === 'object') {
    userTypeDisplayMap[ut._id] = ut.displayAs;
  }
});

// Store display map in roleHierarchy or new state field
```

#### C. Add Display Map to RoleHierarchy

```typescript
// src/shared/types/auth.ts
export interface RoleHierarchy {
  // ... existing fields ...
  
  // NEW: Display mappings from server
  userTypeDisplayMap?: Record<UserType, string>;
  roleDisplayMap?: Record<string, string>;
}
```

#### D. Update Header to Use Server Labels

```typescript
// src/widgets/header/Header.tsx

const getDisplayAsLabel = (userType: string | null): string => {
  if (!userType) return 'User';
  
  // Use server-provided display label
  const serverLabel = roleHierarchy?.userTypeDisplayMap?.[userType];
  if (serverLabel) return serverLabel;
  
  // Fallback to hardcoded (for backward compatibility)
  switch (userType) {
    case 'staff': return 'Staff';
    case 'learner': return 'Learner';
    case 'global-admin': return 'System Admin';
    default: return 'User';
  }
};
```

### 2A.5 Lookup Values API Integration

The API provides a dedicated endpoint for lookup values:

```typescript
// GET /api/v2/lookup-values?category=userType
// Returns all user types with display labels

// GET /api/v2/lookup-values?category=role
// Returns all roles with display labels

// GET /api/v2/lookup-values/user-types
// Convenience endpoint returning UserTypeObject[]
```

#### Option A: Use Login Response (Recommended)
Display labels come with login response, no extra API call needed.

#### Option B: Pre-fetch Lookups on App Init
Call `/api/v2/lookup-values` once on app initialization and cache.

#### Option C: Lazy Load on First Use
Fetch lookup values when first needed.

**Recommendation**: Option A (already included in V2.1 login response)

### 2A.6 Localization Foundation

Using server-side `displayAs` values enables future localization:

1. **Phase 1** (Current): `displayAs` returns en-US labels
2. **Phase 2** (Future): Add `Accept-Language` header support
3. **Phase 3** (Future): API returns localized `displayAs` based on user preference

```typescript
// Future: API returns localized labels
// Accept-Language: es-ES
userTypes: [
  { _id: 'staff', displayAs: 'Personal' },
  { _id: 'learner', displayAs: 'Estudiante' }
]
```

### 2A.7 Implementation Tasks

| Task | Priority | Status |
|------|----------|--------|
| Add `UserTypeObject` interface to types | ⚡ High | 🔲 TODO |
| Update `LoginResponse.userTypes` type | ⚡ High | 🔲 TODO |
| Update authStore to extract displayAs | ⚡ High | 🔲 TODO |
| Add `userTypeDisplayMap` to RoleHierarchy | ⚡ High | 🔲 TODO |
| Update Header to use server labels | ⚡ High | 🔲 TODO |
| Add `RoleObject` interface | 🔹 Medium | 🔲 TODO |
| Update role display in Header badges | 🔹 Medium | 🔲 TODO |
| Create `useLookupValues` hook | 🔸 Low | 🔲 TODO |

---

## 3. Auth State Alignment

### 3.1 Contract Recommended State

```typescript
interface AuthState {
  // Session
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
  
  // User
  user: User | null;
  userTypes: UserType[];
  defaultDashboard: 'learner' | 'staff' | null;
  
  // Department Context  <-- NEEDS WORK
  departmentMemberships: DepartmentMembership[];
  currentDepartmentId: string | null;
  currentDepartmentRoles: string[];
  currentDepartmentAccessRights: string[];
  
  // Admin Session
  canEscalateToAdmin: boolean;
  isAdminSessionActive: boolean;
  adminToken: string | null;
  adminSessionExpiresAt: Date | null;
  adminRoles: string[];
  adminAccessRights: string[];
}
```

### 3.2 Current UI State

The current authStore has most of this, but is **missing**:

| Missing Field | Purpose | Action |
|---------------|---------|--------|
| `departmentMemberships` | Direct access to memberships | Add to store |
| `currentDepartmentId` | Currently selected dept | Use navigationStore |
| `currentDepartmentRoles` | Roles in current dept | Compute from selection |
| `currentDepartmentAccessRights` | Rights in current dept | Compute from selection |

### 3.3 Recommended Approach

**Option A**: Add missing fields to `authStore`
**Option B**: Keep department context in `navigationStore` and add computed getters

**Recommendation**: Option B (already partially implemented) - keep stores focused:
- `authStore`: Authentication, tokens, user, roleHierarchy
- `navigationStore`: Department selection, sidebar state

Add a hook that combines both:

```typescript
// src/shared/hooks/useDepartmentContext.ts
export function useDepartmentContext() {
  const { roleHierarchy } = useAuthStore();
  const { selectedDepartmentId } = useNavigationStore();
  
  const currentDepartment = useMemo(() => {
    if (!selectedDepartmentId || !roleHierarchy) return null;
    
    // Find membership in staff or learner roles
    const staffDept = roleHierarchy.staffRoles?.departmentRoles.find(
      d => d.departmentId === selectedDepartmentId
    );
    const learnerDept = roleHierarchy.learnerRoles?.departmentRoles.find(
      d => d.departmentId === selectedDepartmentId
    );
    
    return staffDept || learnerDept || null;
  }, [roleHierarchy, selectedDepartmentId]);
  
  return {
    currentDepartmentId: selectedDepartmentId,
    currentDepartmentRoles: currentDepartment?.roles.map(r => r.role) || [],
    currentDepartmentAccessRights: currentDepartment?.roles.flatMap(r => r.permissions) || [],
    currentDepartmentName: currentDepartment?.departmentName || null,
  };
}
```

---

## 4. Token Storage Strategy

### 4.1 Contract Specification

| Token | Storage Location | Current State |
|-------|------------------|---------------|
| `accessToken` | sessionStorage | ✅ Correct |
| `refreshToken` | localStorage | ✅ Correct |
| `adminToken` | Memory ONLY | ✅ Correct |

**Status**: ✅ Fully Aligned (fixed 2026-01-11)

---

## 5. Navigation Store Updates

### 5.1 Current State

```typescript
interface NavigationState {
  selectedDepartmentId: string | null;
  lastAccessedDepartments: Record<string, string>;
  isSidebarOpen: boolean;
  setSelectedDepartment: (deptId: string | null) => void;
  rememberDepartment: (userId: string, deptId: string) => void;
  clearDepartmentSelection: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}
```

### 5.2 Needed Additions

| Field/Action | Purpose | Priority |
|--------------|---------|----------|
| `switchDepartment(deptId)` | Call API + update state | ⚡ High |
| `currentDepartmentRoles` | Cached from API response | ⚡ High |
| `currentDepartmentAccessRights` | Cached from API response | ⚡ High |

### 5.3 Proposed Enhancement

```typescript
interface NavigationState {
  // Existing...
  selectedDepartmentId: string | null;
  
  // NEW: Cached department context
  currentDepartmentRoles: string[];
  currentDepartmentAccessRights: string[];
  currentDepartmentName: string | null;
  
  // NEW: API-connected action
  switchDepartment: (deptId: string) => Promise<void>;
}
```

---

## 6. Department Switching

### 6.1 Contract Endpoint

```typescript
// POST /api/v2/auth/switch-department
// Body: { departmentId: string }

interface SwitchDepartmentResponse {
  success: boolean;
  data: {
    currentDepartment: {
      departmentId: string;
      departmentName: string;
      departmentSlug: string;
      roles: string[];
      accessRights: string[];
    };
    childDepartments: { ... }[];
    isDirectMember: boolean;
    inheritedFrom: string | null;
  };
}
```

### 6.2 Current Implementation Gap

**Current**: UI selects department locally, no API call
**Target**: Call `/auth/switch-department` which:
1. Validates user has access
2. Updates `lastSelectedDepartment` on user record
3. Returns fresh roles/rights for that department

### 6.3 Implementation Steps

1. Add `switchDepartment` to `authApi.ts`
2. Add action to `navigationStore`
3. Update department selector to call new action
4. Cache response in navigation state

---

## 7. Admin Escalation

### 7.1 Contract Endpoint

```typescript
// POST /api/v2/auth/escalate
// Body: { escalationPassword: string }

interface EscalateResponse {
  success: boolean;
  data: {
    adminSession: {
      adminToken: string;
      expiresIn: number;
      adminRoles: string[];
      adminAccessRights: string[];
    };
    sessionTimeoutMinutes: number;
  };
}
```

### 7.2 Current State ✅

**Status**: Fully implemented and working

- `authStore.escalateToAdmin()` - calls API
- `authStore.endAdminSession()` - clears admin token
- `AdminEscalationModal` - UI for password entry
- Token stored in memory only

### 7.3 Potential Improvements

| Enhancement | Priority | Notes |
|-------------|----------|-------|
| Session timeout warning | Low | Toast at 2 min remaining |
| Activity tracking | Low | Reset timer on activity |
| Inactivity logout | Medium | Auto-logout after 15 min |

---

## 8. Permission Checking

### 8.1 Contract Pattern

```typescript
// Access right format: domain:resource:action
// Examples:
// - content:courses:read
// - grades:own-classes:manage
// - system:* (wildcard)

function hasAccessRight(userRights: string[], required: string): boolean {
  if (userRights.includes(required)) return true;
  const [domain] = required.split(':');
  if (userRights.includes(`${domain}:*`)) return true;
  return false;
}
```

### 8.2 Current Implementation ✅

**Status**: Fully implemented in `authStore.hasPermission()`

```typescript
hasPermission: (permission, scope) => {
  const state = get();
  if (!state.roleHierarchy) return false;
  const permissions = state.roleHierarchy.allPermissions || [];
  
  // Direct match
  if (permissions.includes(permission)) return true;
  
  // Wildcard match
  const [domain] = permission.split(':');
  if (permissions.includes(`${domain}:*`)) return true;
  
  return false;
}
```

### 8.3 Gap: Department-Scoped Checking

**Current**: Checks all permissions globally
**Target**: Should check department-specific permissions when scope provided

```typescript
// Target behavior
hasPermission('content:courses:manage', { 
  type: 'department', 
  id: 'dept-123' 
})
// Should check permissions for that specific department, not all
```

**Implementation**: Use `useDepartmentContext` hook for scoped checks

---

## 9. Implementation Tasks

### 9.1 Priority 1: Department Switching (High)

| Task | File | Status |
|------|------|--------|
| Add `switchDepartment` API call | `entities/auth/api/authApi.ts` | 🔲 TODO |
| Add `SwitchDepartmentResponse` type | `shared/types/auth.ts` | ✅ Done |
| Add `switchDepartment` action | `shared/stores/navigationStore.ts` | 🔲 TODO |
| Update department selector | `widgets/sidebar/DepartmentSelector.tsx` | 🔲 TODO |
| Cache current dept roles/rights | `navigationStore` | 🔲 TODO |

### 9.2 Priority 2: Department Context Hook (High)

| Task | File | Status |
|------|------|--------|
| Create `useDepartmentContext` hook | `shared/hooks/useDepartmentContext.ts` | 🔲 TODO |
| Export from hooks index | `shared/hooks/index.ts` | 🔲 TODO |
| Update Header to use hook | `widgets/header/Header.tsx` | 🔲 TODO |
| Update Sidebar to use hook | `widgets/sidebar/Sidebar.tsx` | 🔲 TODO |

### 9.3 Priority 3: UserType DisplayAs Integration (High)

| Task | File | Status |
|------|------|--------|
| Add `UserTypeObject` interface | `shared/types/auth.ts` | 🔲 TODO |
| Add `RoleObject` interface | `shared/types/auth.ts` | 🔲 TODO |
| Update `LoginResponse.userTypes` type | `shared/types/auth.ts` | 🔲 TODO |
| Update authStore to handle object userTypes | `features/auth/model/authStore.ts` | 🔲 TODO |
| Add `userTypeDisplayMap` to RoleHierarchy | `shared/types/auth.ts` | 🔲 TODO |
| Add `roleDisplayMap` to RoleHierarchy | `shared/types/auth.ts` | 🔲 TODO |
| Update Header to use server displayAs | `widgets/header/Header.tsx` | 🔲 TODO |
| Update role badge display | `widgets/header/Header.tsx` | 🔲 TODO |

### 9.4 Priority 4: Scoped Permission Checking (Medium)

| Task | File | Status |
|------|------|--------|
| Enhance `hasPermission` for scope | `features/auth/model/authStore.ts` | 🔲 TODO |
| Update `usePermission` hooks | `shared/hooks/usePermission.ts` | 🔲 TODO |
| Add department-aware `ProtectedLink` | `shared/ui/ProtectedLink.tsx` | 🔲 TODO |

### 9.5 Priority 5: Optional Enhancements (Low)

| Task | File | Status |
|------|------|--------|
| Add admin session timeout warning | `features/auth/ui/AdminTimeoutWarning.tsx` | 🔲 TODO |
| Add activity tracking for admin session | `authStore` | 🔲 TODO |
| Create `useLookupValues` hook | `shared/hooks/useLookupValues.ts` | 🔲 TODO |

---

## 10. Testing Checklist

Once changes are implemented:

### 10.1 Department Switching
- [ ] Selecting a department calls `/auth/switch-department`
- [ ] Response roles/rights cached in navigation store
- [ ] UI updates to show department-specific links
- [ ] Switching departments updates permission context
- [ ] `lastSelectedDepartment` persisted on backend

### 10.2 Permission Checking
- [ ] Global permissions work (no scope)
- [ ] Department-scoped permissions check correct dept
- [ ] Wildcard permissions (`system:*`) work
- [ ] Links hide when user lacks permission

### 10.3 Header Display
- [ ] Context label shows correct dashboard context
- [ ] Role badges reflect current department
- [ ] Admin badge shows when escalated

---

## Appendix A: File Locations

| Purpose | Path |
|---------|------|
| Auth store | `src/features/auth/model/authStore.ts` |
| Auth types | `src/shared/types/auth.ts` |
| Auth API | `src/entities/auth/api/authApi.ts` |
| Navigation store | `src/shared/stores/navigationStore.ts` |
| Permission hooks | `src/shared/hooks/usePermission.ts` |
| Token storage | `src/shared/utils/tokenStorage.ts` |
| Header | `src/widgets/header/Header.tsx` |
| Sidebar | `src/widgets/sidebar/Sidebar.tsx` |

---

## Appendix B: Contract File References

| Contract | Path |
|----------|------|
| Role System V2 Contracts | `api_contracts/UI_ROLE_SYSTEM_CONTRACTS.md` |
| Auth Contract | `api_contracts/api/auth.contract.ts` |
| Roles Contract | `api_contracts/api/roles.contract.ts` |
| Pending Status | `api_contracts/PENDING.md` |
