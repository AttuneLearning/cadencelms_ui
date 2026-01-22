# UI <-> Backend Compatibility Verification
**Date:** 2026-01-10
**UI Plan:** UI_Implementation_Plan_v2.md
**Backend Plan:** /home/adam/github/cadencelms_api/devdocs/Role_System_API_Model_Plan_V2.md
**Backend Contracts:** /home/adam/github/cadencelms_api/contracts/UI_ROLE_SYSTEM_CONTRACTS.md

---

## ✅ Compatibility Status: ALIGNED

All UI type definitions now match the implemented backend API.

---

## UserType Definitions

| Aspect | Backend Implementation | UI Plan v2.0 | Status |
|--------|----------------------|--------------|--------|
| Type Definition | `'learner' \| 'staff' \| 'global-admin'` | `'learner' \| 'staff' \| 'global-admin'` | ✅ Match |
| User Model Field | `userTypes: UserType[]` | `userTypes: UserType[]` | ✅ Match |
| Dashboard Type | `'learner' \| 'staff'` | `'learner' \| 'staff' \| 'admin'` | ⚠️ Minor diff* |

*Note: Backend uses 'staff' dashboard for global-admin userType, UI navigates to /admin/* routes via escalation. This is intentional UX difference, not a breaking change.

---

## User Model Schema

| Field | Backend | UI | Status |
|-------|---------|-----|--------|
| `_id` | `ObjectId` | `string` | ✅ Match (serialized) |
| `email` | `string` | `string` | ✅ Match |
| `userTypes` | `UserType[]` | `UserType[]` | ✅ Match |
| `defaultDashboard` | `'learner' \| 'staff'` | `DashboardType` | ✅ Match |
| `lastSelectedDepartment` | `ObjectId?` | `string?` | ✅ Match (serialized) |
| `globalRoles` | ❌ Removed in V2 | ❌ Removed | ✅ Match |
| `isActive` | `boolean` | `boolean` | ✅ Match |
| `createdAt` | `Date` | `string` | ✅ Match (ISO 8601) |
| `updatedAt` | `Date` | `string` | ✅ Match (ISO 8601) |

---

## Department Membership Structure

### Backend Schema
```typescript
interface DepartmentMembership {
  departmentId: ObjectId;
  departmentName: string;
  roles: string[];  // Array of role names
  isPrimary: boolean;
  joinedAt: Date;
  isActive: boolean;
}
```

### UI Interface
```typescript
export interface DepartmentMembership {
  departmentId: string;        // ✅ ObjectId serialized to string
  departmentName: string;       // ✅ Match
  roles: string[];              // ✅ Match
  isPrimary: boolean;           // ✅ Match
  joinedAt: string;             // ✅ Date serialized to ISO 8601
  isActive: boolean;            // ✅ Match
}
```

**Status:** ✅ Fully Compatible

---

## Role Definitions

### Learner Roles

| Backend | UI | Status |
|---------|-----|--------|
| `course-taker` | `course-taker` | ✅ Match |
| `auditor` | `auditor` | ✅ Match |
| `learner-supervisor` | `learner-supervisor` | ✅ Match |

### Staff Roles

| Backend | UI | Status |
|---------|-----|--------|
| `instructor` | `instructor` | ✅ Match |
| `content-admin` | `content-admin` | ✅ Match |
| `department-admin` | `department-admin` | ✅ Match |
| `billing-admin` | `billing-admin` | ✅ Match |

### GlobalAdmin Roles

| Backend | UI | Status |
|---------|-----|--------|
| `system-admin` | `system-admin` | ✅ Match |
| `enrollment-admin` | `enrollment-admin` | ✅ Match |
| `course-admin` | `course-admin` | ✅ Match |
| `theme-admin` | `theme-admin` | ✅ Match |
| `financial-admin` | `financial-admin` | ✅ Match |

---

## GNAP Token Structure

### Backend Response (Login)
```typescript
{
  grant: {
    accessToken: {
      value: string;
      type: 'Bearer';
      expiresAt: string;
    };
    refreshToken?: {
      value: string;
      expiresAt: string;
    };
    user: IUser;
    roleHierarchy: RoleHierarchy;
  }
}
```

### UI Expected Structure
```typescript
interface TokenGrant {
  accessToken: AccessToken;
  refreshToken?: {
    value: string;
    expiresAt: string;
  };
  user: User;
  roleHierarchy: RoleHierarchy;
}
```

**Status:** ✅ Fully Compatible

---

## Access Rights Pattern

### Backend Convention
```
{domain}:{resource}:{action}
```

### UI Convention
```
{domain}:{resource}:{action}
```

**Examples:**
- `content:courses:read` ✅
- `content:courses:manage` ✅
- `grades:own-classes:manage` ✅
- `system:*` ✅

**Status:** ✅ Fully Compatible

---

## Role Hierarchy Response

### Backend Structure
```typescript
interface RoleHierarchy {
  primaryUserType: UserType;
  allUserTypes: UserType[];
  defaultDashboard: DashboardType;
  globalRoles: RoleAssignment[];
  staffRoles?: StaffRoleGroup;
  learnerRoles?: LearnerRoleGroup;
  allPermissions: string[];
}
```

### UI Structure
```typescript
interface RoleHierarchy {
  primaryUserType: UserType;
  allUserTypes: UserType[];
  defaultDashboard: DashboardType;
  globalRoles: RoleAssignment[];
  staffRoles?: { departmentRoles: Array<...> };
  learnerRoles?: { departmentRoles: Array<...> };
  allPermissions: string[];
}
```

**Status:** ✅ Fully Compatible

---

## Authentication Endpoints

| Endpoint | Backend | UI Expected | Status |
|----------|---------|------------|--------|
| `POST /auth/login` | Returns TokenGrant | Expects TokenGrant | ✅ Match |
| `POST /auth/refresh` | Returns new tokens + roleHierarchy | Expects new tokens + roleHierarchy | ✅ Match |
| `POST /auth/logout` | Invalidates tokens | Calls endpoint | ✅ Match |
| `GET /auth/me` | Returns user + roleHierarchy | Expects user + roleHierarchy | ✅ Match |
| `POST /auth/escalate` | Validates admin password | Not yet implemented in UI | ⚠️ TODO |

---

## Dashboard Routing Logic

### Backend Calculation
```typescript
function determineDefaultDashboard(userTypes: UserType[]): DashboardType {
  if (userTypes.length === 1 && userTypes[0] === 'learner') {
    return 'learner';
  }
  return 'staff';
}
```

### UI Implementation
```typescript
const USER_TYPE_DASHBOARD_MAP: Record<UserType, DashboardType> = {
  'learner': 'learner',
  'staff': 'staff',
  'global-admin': 'admin',  // Routes to /admin/* via escalation
};
```

### Routing Flow
1. Backend sets `defaultDashboard` on User model
2. UI reads `user.defaultDashboard` from login response
3. UI navigates to dashboard route based on `defaultDashboard`
4. For global-admin, UI starts at staff dashboard
5. "Login as Admin" button triggers escalation flow

**Status:** ✅ Compatible (different approaches, same outcome)

---

## Permission Checking

### Backend Method
```typescript
UserSchema.methods.hasAccessRight = function(
  accessRight: string,
  departmentId?: ObjectId
): boolean {
  // Check in roleHierarchy.allPermissions
}
```

### UI Method
```typescript
useAuthStore.hasPermission = (
  permission: string,
  scope?: { type: 'department'; id: string }
): boolean {
  // Check in roleHierarchy.allPermissions
  // If scope provided, check department-specific roles
}
```

**Status:** ✅ Compatible

---

## Navigation Structure

### Backend Provides
- User profile with `userTypes[]`
- Department memberships with `roles[]`
- Role hierarchy with flattened `allPermissions[]`

### UI Implements
- Two-section sidebar (Global Nav + Department Nav)
- Permission-based link filtering
- Department selection state management
- Auto-restore last selected department

**Status:** ✅ Backend provides all data needed by UI

---

## Known Differences (Intentional)

| Aspect | Backend | UI | Reason |
|--------|---------|-----|--------|
| Date Format | `Date` objects | ISO 8601 strings | JSON serialization |
| ObjectId Format | MongoDB `ObjectId` | Hex strings | JSON serialization |
| Dashboard enum | `'learner' \| 'staff'` | `'learner' \| 'staff' \| 'admin'` | UI routing needs |
| Admin Access | Via escalation endpoint | Via escalation flow + /admin/* routes | UX implementation |

None of these differences cause compatibility issues.

---

## Migration Checklist

### ✅ Completed
- [x] UserType definitions aligned
- [x] User model schema aligned
- [x] DepartmentMembership structure aligned
- [x] Role names aligned
- [x] Access rights pattern aligned
- [x] GNAP token structure aligned
- [x] RoleHierarchy structure aligned

### ⚠️ Pending UI Implementation
- [ ] Implement auth escalation flow for admin access
- [ ] Add `POST /auth/escalate` endpoint call
- [ ] Test token refresh with role changes
- [ ] Verify department selection persistence

---

## Conclusion

**The UI Implementation Plan v2.0 is now fully compatible with the backend implementation.**

All critical type definitions, data structures, and API contracts are aligned. The UI can be implemented directly from the plan without any breaking changes to the backend.

### Next Steps
1. Begin Phase 1 implementation (Core Infrastructure)
2. Use backend contracts as source of truth for API responses
3. Implement admin escalation flow as part of Phase 6
4. Run integration tests against live backend API

---

**Verification Date:** 2026-01-10
**Verified By:** Claude Code
**Status:** ✅ Ready for Implementation
