# Entity Layer V2 Implementation - Role System
**Author:** entity-agent (Track D)
**Date:** 2026-01-10
**Status:** ✅ Complete
**Version:** 2.0.0

## Overview

This document details the implementation of the Entity Layer updates for Role System V2, aligning frontend entity types with the backend's new role and permission structure.

## Key Changes Summary

### 1. **Created Shared Auth Types** (`src/shared/types/auth.ts`)

- **UserType**: `'learner' | 'staff' | 'global-admin'` - matches backend exactly
- **DashboardType**: `'learner' | 'staff' | 'admin'`
- **DepartmentMembership**: Unified structure used by both staff and learner profiles
  - Includes: `departmentId`, `departmentName`, `departmentSlug`, `roles[]`, `accessRights[]`, `isPrimary`, `isActive`, `joinedAt`
  - Supports child departments for hierarchical access
- **User, StaffProfile, LearnerProfile**: V2 profile interfaces aligned with backend
- **API Response Types**: `LoginResponse`, `EscalateResponse`, `SwitchDepartmentResponse`, `MyRolesResponse`
- **GNAP Token Structures**: `AccessToken`, `RefreshToken`, `TokenGrant`, `RoleHierarchy`
- **PermissionScope**: Context for department-scoped permission checks

### 2. **Updated User Entity** (`src/entities/user/model/types.ts`)

#### Changes:
- Added `userTypes: UserType[]` (V2) - replaces single role
- Added `defaultDashboard: DashboardType` (V2) - determines login destination
- Added `lastSelectedDepartment: string | null` (V2) - UX persistence
- Kept `roles?: Role[]` as deprecated for backward compatibility
- Updated `UserListItem` and `UserFormData` with V2 fields
- Updated `UserFilters` to support `userType` filtering

#### Migration Strategy:
- V2 fields are primary
- Legacy `roles` field marked as deprecated
- Both fields present during migration period

### 3. **Updated Staff Entity** (`src/entities/staff/model/types.ts`)

#### Changes:
- Imported `DepartmentMembership` from shared types
- Created **`StaffProfile`** interface aligned with backend model:
  - `userId`, `employeeId`, `title`
  - `departmentMemberships: DepartmentMembership[]` with roles and access rights
- Updated `Staff` interface to use V2 `DepartmentMembership`
- Updated `StaffListItem` with V2 fields
- Created `LegacyDepartmentMembership` for backward compatibility

#### Key Features:
- Staff can have memberships in multiple departments
- Each membership includes specific roles and computed access rights
- Primary department marked with `isPrimary: true`
- Child department access for hierarchical management

### 4. **Updated Learner Entity** (`src/entities/learner/model/types.ts`)

#### Changes:
- Imported `DepartmentMembership` from shared types
- Created **`LearnerProfile`** interface aligned with backend model:
  - `userId`, `studentId`
  - `departmentMemberships: DepartmentMembership[]` with roles and access rights
  - `globalLearnerRole?: string` for system-wide learner role
- Updated `Learner` interface to optionally include `departmentMemberships`
- Updated `LearnerListItem` and `LearnerFormData` with V2 fields

#### Key Features:
- Learners can enroll in courses across multiple departments
- Department-specific roles (e.g., `course-taker`, `auditor`, `learner-supervisor`)
- Support for global learner role (optional)

### 5. **Verified Department Entity** (`src/entities/department/model/types.ts`)

#### Status: ✅ Already Complete
- All required fields present: `id`, `name`, `code`, `description`, `parentId`, `status`, `level`, `hasChildren`
- Hierarchy support with `ancestors`, `children`, `parent` relationships
- Metadata fields for staff, programs, courses, enrollments
- No changes required

### 6. **Created Access Rights Utilities** (`src/shared/lib/accessRights.ts`)

Comprehensive utility functions for working with access rights following the `domain:resource:action` pattern.

#### Core Functions:

**Permission Checking:**
- `hasAccessRight(userRights, required, scope?)` - Check single right with wildcard support
- `hasAnyAccessRight(userRights, required[], scope?)` - Check if has ANY of required
- `hasAllAccessRights(userRights, required[], scope?)` - Check if has ALL of required

**Parsing & Validation:**
- `parseAccessRight(accessRight)` - Parse into `{domain, resource, action}`
- `isValidAccessRight(accessRight)` - Validate format
- `validateAccessRights(accessRights[])` - Batch validation

**Filtering & Analysis:**
- `filterAccessRightsByDomain(accessRights, domain)` - Get rights for specific domain
- `getDomainsFromAccessRights(accessRights)` - Extract unique domains

**Special Rights:**
- `isFERPAProtectedRight(accessRight)` - Check if FERPA-protected (student data)
- `hasFERPAProtectedAccess(userRights)` - Check if user has any FERPA rights
- `isBillingProtectedRight(accessRight)` - Check if billing-related
- `hasBillingAccess(userRights)` - Check if user has billing access

**Display:**
- `formatAccessRight(accessRight)` - Format for UI display

#### Examples:

```typescript
// Check single permission
hasAccessRight(['content:courses:read'], 'content:courses:read')
// Returns: true

// Wildcard support
hasAccessRight(['content:*'], 'content:courses:manage')
// Returns: true (domain wildcard)

// System admin check
hasAccessRight(['system:*'], 'any:thing:here')
// Returns: true (system wildcard grants all)

// Check multiple permissions
hasAnyAccessRight(
  ['content:courses:read'],
  ['content:courses:read', 'content:courses:manage']
)
// Returns: true

// FERPA check
isFERPAProtectedRight('learner:pii:read')
// Returns: true

// Format for display
formatAccessRight('content:courses:read')
// Returns: "Content: Courses - Read"
```

### 7. **Updated Entity Index Exports**

Updated all entity index files to export new V2 types:

- **`src/entities/user/index.ts`**: Exports `UserType`, `DashboardType` from shared types
- **`src/entities/staff/index.ts`**: Exports `StaffProfile`, `LegacyDepartmentMembership`
- **`src/entities/learner/index.ts`**: Exports `LearnerProfile`
- **`src/shared/types/index.ts`**: Created centralized export for all shared types

## File Structure

```
src/
├── shared/
│   ├── types/
│   │   ├── auth.ts           # ✨ NEW - Core auth & role types
│   │   └── index.ts          # ✨ NEW - Shared types exports
│   └── lib/
│       └── accessRights.ts   # ✨ NEW - Access rights utilities
└── entities/
    ├── user/
    │   ├── model/
    │   │   └── types.ts      # ✅ UPDATED - V2 fields added
    │   └── index.ts          # ✅ UPDATED - Exports V2 types
    ├── staff/
    │   ├── model/
    │   │   └── types.ts      # ✅ UPDATED - StaffProfile, V2 DepartmentMembership
    │   └── index.ts          # ✅ UPDATED - Exports StaffProfile
    ├── learner/
    │   ├── model/
    │   │   └── types.ts      # ✅ UPDATED - LearnerProfile, V2 DepartmentMembership
    │   └── index.ts          # ✅ UPDATED - Exports LearnerProfile
    └── department/
        └── model/
            └── types.ts      # ✅ VERIFIED - Already complete
```

## Contract Alignment

All implementations strictly follow the contracts defined in:

- `/contracts/UI_ROLE_SYSTEM_CONTRACTS.md` - Section 2 (Role Definitions)
- `/contracts/UI_ROLE_SYSTEM_CONTRACTS.md` - Section 3 (Access Rights Pattern)
- `/contracts/UI_ROLE_SYSTEM_CONTRACTS.md` - Section 4 (API Endpoint Contracts)
- `devdocs/UI_Implementation_Plan_v2.md` - Section 2 (Type Definitions)

### Backend Field Naming

All field names match the backend exactly:

| Backend Field | Frontend Type | Used In |
|--------------|---------------|---------|
| `userTypes[]` | `UserType[]` | User |
| `defaultDashboard` | `DashboardType` | User |
| `lastSelectedDepartment` | `string \| null` | User |
| `departmentMemberships[]` | `DepartmentMembership[]` | StaffProfile, LearnerProfile |
| `accessRights[]` | `string[]` | DepartmentMembership |
| `isPrimary` | `boolean` | DepartmentMembership |

## Access Rights Pattern

Following the `domain:resource:action` format:

### Domains
- `content` - Courses, programs, lessons, SCORM
- `enrollment` - Enrollments, class enrollments
- `staff` - Staff management
- `learner` - Learner management
- `reports` - Analytics and reporting
- `system` - System settings
- `billing` - Financial operations
- `audit` - Audit logs
- `grades` - Grading operations
- `settings` - Settings management
- `department` - Department operations
- `dashboard` - Dashboard access

### Examples
```typescript
// Content domain
'content:courses:read'        // View courses
'content:courses:manage'      // Full control over courses
'content:lessons:create'      // Create lessons

// Grades domain
'grades:own-classes:manage'   // Grade your own classes
'grades:view-department'      // View grades in department

// Wildcards
'content:*'                   // All content rights
'system:*'                    // All system rights (admin)
```

## Usage Examples

### 1. Checking User Type
```typescript
import { User } from '@/entities/user';

function getUserDashboard(user: User) {
  // V2 approach
  if (user.userTypes.includes('learner') && user.userTypes.length === 1) {
    return '/learner/dashboard';
  }

  if (user.userTypes.includes('staff') || user.userTypes.includes('global-admin')) {
    return '/staff/dashboard';
  }

  // Or use the pre-computed field
  return `/${user.defaultDashboard}/dashboard`;
}
```

### 2. Accessing Department Memberships
```typescript
import { StaffProfile } from '@/entities/staff';
import { hasAccessRight } from '@/shared/lib/accessRights';

function canCreateCourse(staff: StaffProfile, departmentId: string): boolean {
  const membership = staff.departmentMemberships.find(
    m => m.departmentId === departmentId && m.isActive
  );

  if (!membership) return false;

  return hasAccessRight(
    membership.accessRights,
    'content:courses:create'
  );
}
```

### 3. Display User's Roles
```typescript
import { StaffProfile } from '@/entities/staff';

function displayStaffRoles(staff: StaffProfile) {
  const primary = staff.departmentMemberships.find(m => m.isPrimary);

  return (
    <div>
      <h3>Primary Department: {primary?.departmentName}</h3>
      <ul>
        {primary?.roles.map(role => (
          <li key={role}>{role}</li>
        ))}
      </ul>

      {staff.departmentMemberships.length > 1 && (
        <>
          <h4>Additional Departments:</h4>
          {staff.departmentMemberships
            .filter(m => !m.isPrimary)
            .map(m => (
              <div key={m.departmentId}>
                <strong>{m.departmentName}:</strong> {m.roles.join(', ')}
              </div>
            ))}
        </>
      )}
    </div>
  );
}
```

### 4. Using Access Rights Utilities
```typescript
import {
  hasAccessRight,
  hasAnyAccessRight,
  isFERPAProtectedRight,
  formatAccessRight
} from '@/shared/lib/accessRights';

// Check single permission
if (hasAccessRight(userRights, 'content:courses:create')) {
  // Show "Create Course" button
}

// Check multiple permissions (need any)
if (hasAnyAccessRight(userRights, [
  'grades:edit-department',
  'grades:view-others-department'
])) {
  // Show grading section
}

// Check for sensitive data access
if (isFERPAProtectedRight('learner:pii:read')) {
  // Show FERPA warning
  console.log('⚠️ This action accesses FERPA-protected student data');
}

// Display access right in UI
const displayName = formatAccessRight('content:courses:read');
// Returns: "Content: Courses - Read"
```

## Backward Compatibility

To support gradual migration:

1. **User Entity**: Keeps deprecated `roles` field alongside new `userTypes`
2. **Staff/Learner**: Old code can still access basic fields; V2 code uses `departmentMemberships`
3. **Type Exports**: Legacy types remain exported for existing code

## Next Steps for Other Agents

### For feature-agent (Track E):
- Use `@/shared/types/auth` for all auth-related types
- Import `hasAccessRight`, `hasAnyAccessRight`, etc. from `@/shared/lib/accessRights`
- Check `user.userTypes` instead of `user.roles`
- Use `departmentMemberships[].accessRights` for permission checks

### For ui-agent (Track F):
- Update forms to use `userTypes` multi-select instead of single role
- Display department memberships in staff/learner profile cards
- Show primary department badge (`isPrimary: true`)
- Use `formatAccessRight()` for displaying permissions

### For integration-agent (Track G):
- Update API calls to expect V2 response structure
- Handle `departmentMemberships[]` in API responses
- Map `accessRights[]` from backend responses
- Test permission checking with various access right combinations

## Testing Considerations

### Unit Tests Needed:
- Access rights utility functions (wildcard matching, domain filtering)
- Permission scope checking
- FERPA/billing right detection
- Access right formatting

### Integration Tests Needed:
- User entity with V2 fields serialization/deserialization
- Staff/Learner profiles with department memberships
- Department membership access rights validation

### E2E Tests Needed:
- Login with different userTypes (learner-only, staff, global-admin)
- Department selection and context switching
- Permission-based UI element visibility
- Multi-department role management

## TypeScript Validation

All files compile successfully with no TypeScript errors:
- ✅ `src/shared/types/auth.ts`
- ✅ `src/shared/lib/accessRights.ts`
- ✅ `src/entities/user/model/types.ts`
- ✅ `src/entities/staff/model/types.ts`
- ✅ `src/entities/learner/model/types.ts`
- ✅ All entity index files

## References

- **Backend Contracts**: `/contracts/UI_ROLE_SYSTEM_CONTRACTS.md`
- **UI Implementation Plan**: `devdocs/UI_Implementation_Plan_v2.md`
- **Backend Role System**: `devdocs/Role_System_API_Model_Plan_V2.md`

## Conclusion

✅ All entity layer updates for Role System V2 are complete and ready for integration with authentication and feature layers. The implementation strictly follows backend contracts and provides a solid foundation for the role-based permission system.
