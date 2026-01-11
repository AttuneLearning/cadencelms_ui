# Role System V2 - UI Implementation Plan
**Version:** 1.0.0  
**Date:** 2026-01-10  
**Status:** Ready for Parallel Implementation  
**Duration:** 4 weeks (with parallelization)

---

## Related Documents (Source of Truth)

| Document | Location | Purpose |
|----------|----------|---------|
| API Model Plan V2 | `lms_node/devdocs/Role_System_API_Model_Plan_V2.md` | Complete backend specification |
| UI Contracts | `lms_node/contracts/UI_ROLE_SYSTEM_CONTRACTS.md` | API contracts for UI team |
| UI Plan (Details) | `lms_ui/devdocs/Role_System_UI_Plan.md` | Component specifications |
| Architecture Plan | `lms_ui/devdocs/Role_System_Architecture_Plan.md` | System architecture overview |

---

## Executive Summary

This plan coordinates the parallel implementation of the Role System V2 on the frontend. The work is divided into **5 parallel tracks** that can be executed simultaneously by different agents, with clear dependencies and sync points.

### Key Changes from V1
1. **UserTypes Array** - Replace single role with `userTypes: UserType[]`
2. **Three Dashboards** - Learner, Staff, Admin (via escalation)
3. **Department-Scoped Roles** - All roles tied to departments
4. **Access Rights Pattern** - `domain:resource:action` permissions
5. **Admin Escalation** - Separate password for admin access
6. **Two-Section Sidebar** - Global nav + department-scoped actions

---

## Parallel Work Tracks

### Track Overview

```
Week 1-2:
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  TRACK A    │ │  TRACK B    │ │  TRACK C    │ │  TRACK D    │
│  Auth/Types │ │  Navigation │ │  Components │ │  Entities   │
│  (Agent 1)  │ │  (Agent 2)  │ │  (Agent 3)  │ │  (Agent 4)  │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
       │               │               │               │
       └───────────────┼───────────────┼───────────────┘
                       │               │
                       ▼               ▼
Week 3:          ┌─────────────────────────┐
                 │       INTEGRATION       │
                 │       (All Agents)      │
                 └───────────┬─────────────┘
                             │
Week 4:                      ▼
                 ┌─────────────────────────┐
                 │    TESTING & POLISH     │
                 │       (QA Agent)        │
                 └─────────────────────────┘
```

---

## Track A: Auth Store & Types (Agent: auth-agent)

**Owner:** Auth Agent  
**Duration:** Week 1-2  
**Dependencies:** None (can start immediately)

### Tasks

#### A.1 - Type Definitions (Day 1)
**File:** `src/entities/auth/model/types.ts`

```typescript
// Core types to implement
export type UserType = 'learner' | 'staff' | 'global-admin';
export type DashboardType = 'learner' | 'staff';

export interface DepartmentMembership {
  departmentId: string;
  departmentName: string;
  departmentSlug: string;
  roles: string[];
  accessRights: string[];
  isPrimary: boolean;
  isActive: boolean;
  joinedAt: string;
  childDepartments?: ChildDepartment[];
}

export interface ChildDepartment {
  departmentId: string;
  departmentName: string;
  roles: string[];
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    session: SessionData;
    userTypes: UserType[];
    defaultDashboard: DashboardType;
    canEscalateToAdmin: boolean;
    departmentMemberships: DepartmentMembership[];
    allAccessRights: string[];
    lastSelectedDepartment: string | null;
  };
}

export interface EscalateResponse {
  success: boolean;
  data: {
    adminSession: AdminSession;
    sessionTimeoutMinutes: number;
  };
}

export interface AdminSession {
  adminToken: string;
  expiresIn: number;
  adminRoles: string[];
  adminAccessRights: string[];
}
```

#### A.2 - Auth Store Update (Day 2-3)
**File:** `src/features/auth/model/authStore.ts`

Update the store to include:
- `userTypes: UserType[]`
- `defaultDashboard: DashboardType`
- `canEscalateToAdmin: boolean`
- `departmentMemberships: DepartmentMembership[]`
- `allAccessRights: string[]`
- `currentDepartmentId: string | null`
- `currentDepartmentRoles: string[]`
- `currentDepartmentAccessRights: string[]`
- `isAdminSessionActive: boolean`
- `adminToken: string | null` (MEMORY ONLY)
- `adminSessionExpiresAt: Date | null`
- `adminRoles: string[]`
- `adminAccessRights: string[]`

Actions to implement:
- `login(credentials)` - Updated for V2 response
- `logout()` - Clear all including admin session
- `hasAccessRight(right, scope?)` - Check permissions
- `hasAnyAccessRight(rights, scope?)` - Check any permission
- `hasAllAccessRights(rights, scope?)` - Check all permissions
- `escalateToAdmin(password)` - Admin escalation
- `endAdminSession()` - End admin session
- `switchDepartment(deptId)` - Update department context

#### A.3 - Navigation Store (Day 3-4)
**File:** `src/shared/stores/navigationStore.ts`

```typescript
interface NavigationState {
  selectedDepartmentId: string | null;
  lastAccessedDepartments: Record<string, string>;
  isSidebarOpen: boolean;
  
  // Actions
  setSelectedDepartment: (deptId: string | null) => void;
  rememberDepartment: (userId: string, deptId: string) => void;
  clearDepartmentSelection: () => void;
  toggleSidebar: () => void;
}
```

#### A.4 - Auth API Client (Day 4-5)
**File:** `src/entities/auth/api/authApi.ts`

Endpoints to implement:
- `POST /api/v2/auth/login`
- `POST /api/v2/auth/refresh`
- `POST /api/v2/auth/logout`
- `POST /api/v2/auth/escalate`
- `POST /api/v2/auth/switch-department`
- `GET /api/v2/roles/me`

#### A.5 - Token Management (Day 5-6)
**File:** `src/shared/api/interceptors.ts`

- Axios interceptor for token refresh
- Separate handling for admin token (memory only)
- 401 handling with refresh attempt

#### A.6 - Admin Session Timer (Day 6)
**File:** `src/features/auth/lib/adminSessionTimer.ts`

- Track activity timestamps
- 15-minute timeout check
- Warning at 2 minutes remaining
- Auto-logout on timeout

### Deliverables
- [ ] Type definitions for auth V2
- [ ] Updated auth store with V2 fields
- [ ] Navigation store for department selection
- [ ] Auth API client for V2 endpoints
- [ ] Token management with refresh
- [ ] Admin session timeout handling

---

## Track B: Navigation & Routing (Agent: nav-agent)

**Owner:** Navigation Agent  
**Duration:** Week 1-2  
**Dependencies:** Track A types (can mock initially)

### Tasks

#### B.1 - Navigation Item Definitions (Day 1-2)
**File:** `src/widgets/sidebar/config/navItems.ts`

```typescript
// Global navigation items (always visible)
export const GLOBAL_NAV_ITEMS: GlobalNavItem[] = [
  // Learner items
  { label: 'Dashboard', path: '/learner/dashboard', icon: Home, userTypes: ['learner'] },
  { label: 'My Profile', path: '/learner/profile', icon: User, userTypes: ['learner'] },
  { label: 'My Progress', path: '/learner/progress', icon: TrendingUp, userTypes: ['learner'] },
  { label: 'Certificates', path: '/learner/certificates', icon: Award, userTypes: ['learner'], 
    requiredRight: 'learner:certificates:read' },
  
  // Staff items
  { label: 'Dashboard', path: '/staff/dashboard', icon: Home, userTypes: ['staff'] },
  { label: 'My Classes', path: '/staff/classes', icon: Calendar, userTypes: ['staff'],
    requiredRight: 'content:classes:read' },
  { label: 'Analytics', path: '/staff/analytics', icon: BarChart, userTypes: ['staff'],
    requiredRight: 'reports:class:read' },
];

// Department-scoped navigation items
export const DEPARTMENT_NAV_ITEMS: DepartmentNavItem[] = [
  { label: 'Course Library', pathTemplate: '/staff/departments/:deptId/courses',
    icon: BookOpen, requiredRight: 'content:courses:read', userTypes: ['staff'] },
  { label: 'Create Course', pathTemplate: '/staff/departments/:deptId/courses/create',
    icon: Plus, requiredRight: 'content:courses:manage', userTypes: ['staff'] },
  // ... more items
];

// Admin navigation items
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: 'System Settings', path: '/admin/settings', icon: Settings, 
    requiredRole: 'system-admin' },
  { label: 'User Management', path: '/admin/users', icon: Users,
    requiredRole: 'system-admin' },
  // ... more items
];
```

#### B.2 - Route Definitions (Day 2-3)
**File:** `src/app/router/routes.ts`

Define route configurations:
- Public routes (login, forgot password)
- Learner routes with permissions
- Staff routes with permissions
- Admin routes with escalation check
- Department-scoped routes

#### B.3 - ProtectedRoute Component (Day 3-4)
**File:** `src/app/router/ProtectedRoute.tsx`

Props:
- `requiredRight?: string`
- `requireAllRights?: string[]`
- `requireAnyRight?: string[]`
- `requiredDepartment?: boolean`
- `requiredAdminSession?: boolean`

Features:
- Redirect to login if not authenticated
- Redirect to unauthorized if missing permissions
- Show department selection prompt if needed
- Check admin session for admin routes

#### B.4 - Dashboard Router (Day 4-5)
**File:** `src/app/router/DashboardRouter.tsx`

Routing logic:
```typescript
function DashboardRouter() {
  const { userTypes, defaultDashboard } = useAuthStore();
  
  // Learner-only → Learner Dashboard
  if (userTypes.length === 1 && userTypes[0] === 'learner') {
    return <Navigate to="/learner/dashboard" />;
  }
  
  // Has staff or global-admin → Staff Dashboard
  return <Navigate to="/staff/dashboard" />;
}
```

#### B.5 - Route Guards (Day 5-6)
**File:** `src/app/router/guards/`

Create guards for:
- `AuthGuard` - Must be authenticated
- `GuestGuard` - Must NOT be authenticated  
- `DepartmentGuard` - Must have department selected
- `AdminGuard` - Must have active admin session
- `PermissionGuard` - Must have specific access rights

### Deliverables
- [ ] Navigation item configuration
- [ ] Route definitions for all dashboards
- [ ] ProtectedRoute component
- [ ] Dashboard router with userType logic
- [ ] Route guards for each scenario

---

## Track C: UI Components (Agent: ui-agent)

**Owner:** UI Agent  
**Duration:** Week 1-2  
**Dependencies:** None (can work with mock data)

### Tasks

#### C.1 - Two-Section Sidebar (Day 1-3)
**File:** `src/widgets/sidebar/ui/Sidebar.tsx`

Structure:
```
┌─────────────────────────────────┐
│ Section 1: Global Navigation    │
│ • Dashboard                     │
│ • My Profile                    │
│ • My Classes                    │
├─────────────────────────────────┤
│ Section 2: My Departments       │
│ ▶ Cognitive Therapy (Primary)   │
│ ▷ Behavioral Psychology         │
├─────────────────────────────────┤
│ Section 3: Department Actions   │
│ (when department selected)      │
│ • Course Library                │
│ • Create Course                 │
│ • Department Settings           │
└─────────────────────────────────┘
```

#### C.2 - Department Selector (Day 2-3)
**File:** `src/widgets/sidebar/ui/DepartmentSelector.tsx`

Features:
- List all user departments
- Show primary badge
- Click to select/deselect
- Show child departments indented
- Visual indicator for selected

#### C.3 - PermissionGate Component (Day 3-4)
**File:** `src/shared/ui/PermissionGate.tsx`

```typescript
interface PermissionGateProps {
  right: string;
  departmentScoped?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}
```

#### C.4 - AdminEscalationModal (Day 4-5)
**File:** `src/features/auth/ui/AdminEscalationModal.tsx`

Features:
- Password input with show/hide
- Error message display
- Loading state during API call
- Success transitions to Admin Dashboard

#### C.5 - AdminSessionIndicator (Day 5)
**File:** `src/widgets/header/ui/AdminSessionIndicator.tsx`

Features:
- Show remaining time
- Warning color at 2 min
- "End Admin Session" button
- Countdown timer

#### C.6 - DepartmentRequiredPrompt (Day 5-6)
**File:** `src/shared/ui/DepartmentRequiredPrompt.tsx`

Show when user tries to access department-scoped page without selection.

#### C.7 - Login Form Update (Day 6)
**File:** `src/features/auth/ui/LoginForm.tsx`

Update to:
- Handle V2 login response
- Navigate based on defaultDashboard
- Show appropriate error messages

### Deliverables
- [ ] Two-section sidebar component
- [ ] Department selector UI
- [ ] PermissionGate component
- [ ] Admin escalation modal
- [ ] Admin session indicator
- [ ] Department required prompt
- [ ] Updated login form

---

## Track D: Entity Layer (Agent: entity-agent)

**Owner:** Entity Agent  
**Duration:** Week 1-2  
**Dependencies:** Track A types

### Tasks

#### D.1 - Role Entity (Day 1-2)
**File:** `src/entities/role/`

```
role/
├── api/
│   └── roleApi.ts      # GET /api/v2/roles, /roles/:name
├── model/
│   └── types.ts        # IRoleDefinition, IAccessRight
└── index.ts
```

#### D.2 - Department Entity Updates (Day 2-3)
**File:** `src/entities/department/`

Add:
- `getDepartmentWithRoles(id)` - Get department + user's roles there
- Types for child departments
- Membership status types

#### D.3 - User Entity Updates (Day 3-4)
**File:** `src/entities/user/`

Update types:
- Add `userTypes: UserType[]`
- Add `defaultDashboard: DashboardType`
- Add `lastSelectedDepartment?: string`

#### D.4 - Staff Entity Updates (Day 4-5)
**File:** `src/entities/staff/`

Update types:
- `departmentMemberships: DepartmentMembership[]`
- Remove any legacy `globalStaffRoles`

#### D.5 - Learner Entity Updates (Day 5)
**File:** `src/entities/learner/`

Update types:
- Rename `departmentEnrollments` → `departmentMemberships`
- Match schema from API contract

#### D.6 - Access Rights Utilities (Day 5-6)
**File:** `src/shared/lib/accessRights.ts`

```typescript
export function hasAccessRight(userRights: string[], required: string): boolean;
export function hasAnyAccessRight(userRights: string[], required: string[]): boolean;
export function hasAllAccessRights(userRights: string[], required: string[]): boolean;
export function isWildcardMatch(userRights: string[], required: string): boolean;

// Domain constants
export const ACCESS_RIGHT_DOMAINS = ['content', 'enrollment', 'staff', 'learner', 
  'reports', 'system', 'billing', 'audit', 'grades'] as const;

// Sensitive rights
export const FERPA_RIGHTS = [...];
export const BILLING_RIGHTS = [...];
```

### Deliverables
- [ ] Role entity with API client
- [ ] Updated department entity
- [ ] Updated user entity types
- [ ] Updated staff entity types
- [ ] Updated learner entity types
- [ ] Access rights utility functions

---

## Track E: Integration & Testing (Agent: qa-agent)

**Owner:** QA Agent  
**Duration:** Week 3-4  
**Dependencies:** Tracks A, B, C, D complete

### Tasks

#### E.1 - Integration Testing (Week 3)

**Auth Flow Tests:**
- [ ] Login with learner-only → Learner Dashboard
- [ ] Login with staff → Staff Dashboard
- [ ] Login with global-admin → Staff Dashboard + escalation button
- [ ] Login preserves lastSelectedDepartment
- [ ] Logout clears all state

**Department Tests:**
- [ ] Department selector shows all memberships
- [ ] Switching updates accessRights
- [ ] Child departments visible
- [ ] Links hide when missing rights

**Admin Escalation Tests:**
- [ ] Button only visible if canEscalateToAdmin
- [ ] Wrong password shows error
- [ ] Correct password → Admin Dashboard
- [ ] 15-minute timeout works
- [ ] Timeout redirects to Staff

**Permission Tests:**
- [ ] PermissionGate hides unauthorized content
- [ ] ProtectedRoute redirects correctly
- [ ] Wildcard rights work
- [ ] Department-scoped checks work

#### E.2 - E2E Testing (Week 3-4)

**Flows to test:**
- [ ] Full login → department select → action flow
- [ ] Department switching preserves route context
- [ ] Admin escalation → timeout → return to staff
- [ ] Multi-department user with different roles
- [ ] Token refresh during session

#### E.3 - Accessibility Testing (Week 4)
- [ ] Keyboard navigation through sidebar
- [ ] Screen reader announcements
- [ ] Focus management on modals
- [ ] Color contrast for indicators

#### E.4 - Mobile Testing (Week 4)
- [ ] Sidebar slide-in/out
- [ ] Department selector touch targets
- [ ] Admin modal on small screens
- [ ] Session indicator positioning

### Deliverables
- [ ] Unit tests for all new stores
- [ ] Unit tests for access right utilities
- [ ] Integration tests for auth flows
- [ ] E2E tests for critical paths
- [ ] Accessibility audit passed
- [ ] Mobile testing complete

---

## Sync Points

### Sync Point 1: End of Day 2
**Attendees:** All agents
**Purpose:** Type alignment check

- Auth agent shares type definitions
- All agents validate their work aligns
- Resolve any type conflicts

### Sync Point 2: End of Week 1
**Attendees:** All agents
**Purpose:** Mock data alignment

- Confirm mock data structure
- Test basic integration points
- Identify blockers

### Sync Point 3: End of Week 2
**Attendees:** All agents + QA
**Purpose:** Integration readiness

- All tracks deliver initial versions
- QA begins integration testing
- Identify integration issues

### Sync Point 4: End of Week 3
**Attendees:** All agents
**Purpose:** Bug fixes

- QA reports issues
- Agents fix assigned bugs
- Re-test fixed areas

---

## File Change Summary

### New Files to Create
```
src/entities/auth/model/types.ts (update)
src/entities/role/api/roleApi.ts (new)
src/entities/role/model/types.ts (new)
src/entities/role/index.ts (new)
src/features/auth/model/authStore.ts (update)
src/features/auth/lib/adminSessionTimer.ts (new)
src/features/auth/ui/AdminEscalationModal.tsx (new)
src/shared/stores/navigationStore.ts (new)
src/shared/lib/accessRights.ts (new)
src/shared/ui/PermissionGate.tsx (new)
src/shared/ui/DepartmentRequiredPrompt.tsx (new)
src/widgets/sidebar/config/navItems.ts (new)
src/widgets/sidebar/ui/Sidebar.tsx (update)
src/widgets/sidebar/ui/DepartmentSelector.tsx (new)
src/widgets/header/ui/AdminSessionIndicator.tsx (new)
src/app/router/ProtectedRoute.tsx (update)
src/app/router/routes.ts (update)
src/app/router/DashboardRouter.tsx (new)
src/app/router/guards/*.ts (new)
```

### Files to Update
```
src/entities/user/model/types.ts
src/entities/staff/model/types.ts
src/entities/learner/model/types.ts
src/entities/department/model/types.ts
src/features/auth/ui/LoginForm.tsx
src/shared/api/interceptors.ts
```

---

## Success Criteria

1. **Authentication:** V2 login works with all userType combinations
2. **Navigation:** Sidebar shows correct items based on userType + department
3. **Permissions:** Access rights check works globally and per-department
4. **Admin:** Escalation flow works with proper timeout
5. **State:** Department selection persists across sessions
6. **Mobile:** Responsive sidebar with touch-friendly targets
7. **Tests:** 80%+ coverage on new code
8. **Accessibility:** WCAG 2.1 AA compliance

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| API not ready | Use MSW mocks based on contracts |
| Type misalignment | Sync point 1 catches early |
| Complex integration | Dedicated integration week |
| Mobile issues | Early mobile testing in Track C |

---

## Timeline Summary

| Week | Track A | Track B | Track C | Track D | Track E |
|------|---------|---------|---------|---------|---------|
| 1 | Types, Store | Nav Items, Routes | Sidebar, Selector | Role, Dept entities | - |
| 2 | API, Tokens, Timer | Protected Routes, Guards | Modal, Indicator, Form | User, Staff, Learner, Utils | - |
| 3 | Bug fixes | Bug fixes | Bug fixes | Bug fixes | Integration testing |
| 4 | Polish | Polish | Polish | Polish | E2E, A11y, Mobile |

---

## Appendix: Mock Data for Development

See `lms_node/contracts/UI_ROLE_SYSTEM_CONTRACTS.md` Appendix A for example login response to use for mocking during development.
