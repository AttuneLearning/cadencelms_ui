# V2 Role System - Comprehensive Usage Guide
**Version:** 2.0.0
**Date:** 2026-01-10
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [Getting Started](#getting-started)
4. [Authentication](#authentication)
5. [Route Protection](#route-protection)
6. [Component-Level Protection](#component-level-protection)
7. [Permission Checking](#permission-checking)
8. [Department Context](#department-context)
9. [Common Patterns](#common-patterns)
10. [Migration from V1](#migration-from-v1)
11. [API Reference](#api-reference)
12. [Troubleshooting](#troubleshooting)

---

## Overview

The V2 Role System replaces the V1 role-based system with a more flexible permission-based model that supports:

- **UserTypes**: Three primary user types (`learner`, `staff`, `global-admin`)
- **Permissions**: Fine-grained access control (e.g., `content:courses:create`)
- **Department Scoping**: Roles and permissions scoped to departments
- **Hierarchical Roles**: Role hierarchies within departments

### Key Improvements Over V1

| Feature | V1 | V2 |
|---------|----|----|
| User Classification | Many specific roles | 3 UserTypes |
| Access Control | Role-based | Permission-based |
| Department Support | Limited | Full scoping |
| Flexibility | Rigid | Highly flexible |
| Performance | Multiple queries | Single hierarchy |

---

## Core Concepts

### UserType

Three primary user types in the system:

```typescript
type UserType = 'learner' | 'staff' | 'global-admin';
```

- **`learner`**: Students, course takers
- **`staff`**: Instructors, content admins, department admins
- **`global-admin`**: System administrators

### Permissions

Permissions follow the pattern: `domain:resource:action`

```typescript
'content:courses:create'  // Can create courses
'content:courses:read'    // Can view courses
'content:courses:edit'    // Can edit courses
'content:courses:delete'  // Can delete courses
```

Wildcards supported:
```typescript
'system:*'        // All system permissions
'content:*'       // All content permissions
'content:courses:*' // All course permissions
```

### RoleHierarchy

Central data structure containing all user access information:

```typescript
interface RoleHierarchy {
  primaryUserType: UserType;           // Main user type
  allUserTypes: UserType[];            // All user types
  defaultDashboard: DashboardType;     // Where to redirect after login
  globalRoles: RoleAssignment[];       // System-wide roles
  staffRoles?: StaffRoleGroup;         // Staff department roles
  learnerRoles?: LearnerRoleGroup;     // Learner department roles
  allPermissions: string[];            // All permissions (flattened)
}
```

### Department Scoping

Permissions can be checked globally or within a department:

```typescript
// Global check
hasPermission('content:courses:read')

// Department-scoped check
hasPermission('content:courses:create', {
  type: 'department',
  id: 'dept-123'
})
```

---

## Getting Started

### 1. Import What You Need

```typescript
// Authentication store
import { useAuthStore } from '@/features/auth/model';

// Navigation store
import { useNavigationStore } from '@/shared/stores';

// Route protection
import {
  ProtectedRoute,
  StaffOnlyRoute,
  LearnerOnlyRoute,
  AdminOnlyRoute,
} from '@/app/router/ProtectedRoute';

// Component protection
import {
  PermissionGate,
  StaffGate,
  LearnerGate,
  AdminGate,
} from '@/shared/components';

// Department context
import { DepartmentProvider, useDepartment } from '@/shared/contexts';

// Permission hooks
import {
  usePermission,
  usePermissions,
  useUserType,
  useRole,
  useAccess,
} from '@/shared/hooks';
```

### 2. Basic Usage

```typescript
function MyComponent() {
  // Get auth state
  const { isAuthenticated, roleHierarchy, hasPermission } = useAuthStore();

  // Check user type
  const { isStaff, isLearner, isAdmin } = useUserType();

  // Check permission
  const canCreate = usePermission('content:courses:create');

  return (
    <div>
      {isAuthenticated && <p>Welcome!</p>}
      {isStaff && <StaffTools />}
      {canCreate && <CreateButton />}
    </div>
  );
}
```

---

## Authentication

### Login Flow

```typescript
import { useAuthStore } from '@/features/auth/model';

function LoginPage() {
  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      // User is now authenticated
      // Navigation happens automatically
    } catch (err) {
      // Error is stored in authStore.error
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Form fields */}
      {error && <div className="error">{error}</div>}
      <button disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  );
}
```

### Logout

```typescript
function LogoutButton() {
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    // User is logged out, tokens cleared
    // Redirected to login page
  };

  return <button onClick={handleLogout}>Log Out</button>;
}
```

### Session Restoration

Session restoration happens automatically via `AuthInitializer`:

```typescript
// In src/app/index.tsx
<AuthInitializer>
  <App />
</AuthInitializer>
```

No additional code needed - sessions restore on page load if tokens are valid.

---

## Route Protection

### Basic Protected Route

```typescript
<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  }
/>
```

### UserType-Based Protection

```typescript
// Staff only
<Route
  path="/staff/dashboard"
  element={
    <StaffOnlyRoute>
      <StaffDashboard />
    </StaffOnlyRoute>
  }
/>

// Learner only
<Route
  path="/learner/dashboard"
  element={
    <LearnerOnlyRoute>
      <LearnerDashboard />
    </LearnerOnlyRoute>
  }
/>

// Admin only
<Route
  path="/admin/dashboard"
  element={
    <AdminOnlyRoute>
      <AdminDashboard />
    </AdminOnlyRoute>
  }
/>
```

### Permission-Based Protection

```typescript
<Route
  path="/admin/settings"
  element={
    <ProtectedRoute requiredPermission="system:settings:manage">
      <SettingsPage />
    </ProtectedRoute>
  }
/>
```

### Multiple Permissions

```typescript
<Route
  path="/secure-area"
  element={
    <ProtectedRoute
      requiredPermissions={['data:pii:view', 'data:financial:view']}
      requireAllPermissions // Must have ALL permissions
    >
      <SecureDataPage />
    </ProtectedRoute>
  }
/>
```

### Department Context Required

```typescript
<Route
  path="/staff/departments/:deptId/courses"
  element={
    <ProtectedRoute
      requireDepartment
      departmentTypes={['staff']}
    >
      <DepartmentCoursesPage />
    </ProtectedRoute>
  }
/>
```

---

## Component-Level Protection

### Hide Components Based on Permissions

```typescript
function CourseCard({ course }) {
  return (
    <Card>
      <CardHeader>{course.title}</CardHeader>
      <CardContent>{course.description}</CardContent>
      <CardFooter>
        {/* Everyone can view */}
        <ViewButton />

        {/* Only if can edit */}
        <PermissionGate requiredPermission="content:courses:edit">
          <EditButton />
        </PermissionGate>

        {/* Only if can delete */}
        <PermissionGate requiredPermission="content:courses:delete">
          <DeleteButton />
        </PermissionGate>
      </CardFooter>
    </Card>
  );
}
```

### UserType-Based Rendering

```typescript
function Dashboard() {
  return (
    <div>
      <StaffGate>
        <StaffDashboard />
      </StaffGate>

      <LearnerGate>
        <LearnerDashboard />
      </LearnerGate>

      <AdminGate>
        <AdminDashboard />
      </AdminGate>
    </div>
  );
}
```

### Fallback Content

```typescript
<PermissionGate
  requiredPermission="content:courses:manage"
  fallback={<p>You don't have permission to manage courses.</p>}
>
  <CourseManagement />
</PermissionGate>
```

### Render Props Pattern

```typescript
<PermissionGate
  requiredPermission="content:courses:delete"
  render={(hasAccess) => (
    <Button
      disabled={!hasAccess}
      className={hasAccess ? 'destructive' : 'disabled'}
    >
      {hasAccess ? 'Delete' : 'No Permission'}
    </Button>
  )}
/>
```

---

## Permission Checking

### Single Permission

```typescript
function CreateCourseButton() {
  const canCreate = usePermission('content:courses:create');

  if (!canCreate) return null;

  return <Button onClick={handleCreate}>Create Course</Button>;
}
```

### Multiple Permissions

```typescript
function AdvancedFeatures() {
  const { hasAll, hasAny, permissions } = usePermissions([
    'content:courses:create',
    'content:courses:publish',
    'content:courses:archive',
  ]);

  return (
    <div>
      {/* Show if has ANY permission */}
      {hasAny && <BasicTools />}

      {/* Show if has ALL permissions */}
      {hasAll && <AdvancedTools />}

      {/* Check individual permissions */}
      {permissions['content:courses:create'] && <CreateTool />}
      {permissions['content:courses:publish'] && <PublishTool />}
      {permissions['content:courses:archive'] && <ArchiveTool />}
    </div>
  );
}
```

### Direct Check

```typescript
function MyComponent() {
  const { hasPermission } = useAuthStore();

  const handleAction = () => {
    if (!hasPermission('content:courses:edit')) {
      alert('No permission');
      return;
    }

    // Proceed with action
  };

  // ...
}
```

### User Type Checking

```typescript
function RoleSpecificUI() {
  const {
    isStaff,
    isLearner,
    isAdmin,
    primaryType,
    hasType,
  } = useUserType();

  return (
    <div>
      {isStaff && <p>You are staff</p>}
      {isLearner && <p>You are a learner</p>}
      {isAdmin && <p>You are an admin</p>}
      <p>Primary type: {primaryType}</p>
      {hasType('staff') && <StaffBadge />}
    </div>
  );
}
```

---

## Department Context

### Wrap with DepartmentProvider

```typescript
function DepartmentPage({ departmentId }) {
  return (
    <DepartmentProvider departmentId={departmentId}>
      <DepartmentContent />
    </DepartmentProvider>
  );
}
```

### Use Department Context

```typescript
function DepartmentContent() {
  const {
    department,
    hasPermission,
    hasRole,
    isStaffDepartment,
    isLearnerDepartment,
  } = useDepartment();

  if (!department) {
    return <p>No department selected</p>;
  }

  return (
    <div>
      <h1>{department.name}</h1>
      <p>Type: {department.type}</p>
      <p>Primary: {department.isPrimary ? 'Yes' : 'No'}</p>

      {/* Automatically scoped to current department */}
      {hasPermission('content:courses:create') && (
        <CreateCourseButton />
      )}

      {hasRole('instructor') && <InstructorPanel />}

      {isStaffDepartment && <StaffTools />}
      {isLearnerDepartment && <LearnerView />}
    </div>
  );
}
```

### Department Selection

```typescript
function DepartmentSelector() {
  const { selectedDepartmentId, setSelectedDepartment } = useNavigationStore();
  const { roleHierarchy } = useAuthStore();

  // Extract departments from roleHierarchy
  const departments = extractUserDepartments(roleHierarchy);

  return (
    <select
      value={selectedDepartmentId || ''}
      onChange={(e) => setSelectedDepartment(e.target.value)}
    >
      <option value="">Select Department</option>
      {departments.map((dept) => (
        <option key={dept.id} value={dept.id}>
          {dept.name}
        </option>
      ))}
    </select>
  );
}
```

---

## Common Patterns

### Pattern 1: Conditional Form Fields

```typescript
function CourseForm() {
  const canPublish = usePermission('content:courses:publish');
  const canSetPrice = usePermission('billing:courses:set-price');

  return (
    <form>
      <Input name="title" label="Title" />
      <Textarea name="description" label="Description" />

      {/* Only show publish checkbox if user can publish */}
      {canPublish && (
        <Checkbox name="isPublished" label="Publish immediately" />
      )}

      {/* Only show pricing if user can set prices */}
      {canSetPrice && (
        <Input name="price" label="Price" type="number" />
      )}

      <Button type="submit">Save</Button>
    </form>
  );
}
```

### Pattern 2: Feature Flags with Permissions

```typescript
function AdvancedEditor() {
  const access = useAccess();

  const features = {
    aiAssist: access.hasPermission('content:ai-assist:use'),
    bulkImport: access.hasPermission('content:bulk-import:use'),
    templates: access.hasPermission('content:templates:use'),
    analytics: access.hasPermission('analytics:advanced:view'),
  };

  return (
    <Editor>
      {features.aiAssist && <AIAssistPanel />}
      {features.bulkImport && <BulkImportButton />}
      {features.templates && <TemplateSelector />}
      {features.analytics && <AnalyticsDashboard />}
    </Editor>
  );
}
```

### Pattern 3: Multi-Level Menus

```typescript
function ContextMenu({ item }) {
  const { permissions } = usePermissions([
    'content:courses:edit',
    'content:courses:duplicate',
    'content:courses:archive',
    'content:courses:delete',
  ]);

  return (
    <Menu>
      {/* Always available */}
      <MenuItem onClick={handleView}>View</MenuItem>

      {/* Conditional items */}
      {permissions['content:courses:edit'] && (
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
      )}

      {permissions['content:courses:duplicate'] && (
        <MenuItem onClick={handleDuplicate}>Duplicate</MenuItem>
      )}

      <MenuSeparator />

      {permissions['content:courses:archive'] && (
        <MenuItem onClick={handleArchive}>Archive</MenuItem>
      )}

      {permissions['content:courses:delete'] && (
        <MenuItem onClick={handleDelete} className="destructive">
          Delete
        </MenuItem>
      )}
    </Menu>
  );
}
```

### Pattern 4: Progressive Disclosure

```typescript
function CourseSettings() {
  const { hasAll, permissions } = usePermissions([
    'content:courses:edit',
    'content:courses:configure-advanced',
    'content:courses:manage-permissions',
  ]);

  return (
    <Tabs>
      {/* Basic tab - always visible */}
      <Tab value="basic">
        <BasicSettings />
      </Tab>

      {/* Advanced tab - only if can configure */}
      {permissions['content:courses:configure-advanced'] && (
        <Tab value="advanced">
          <AdvancedSettings />
        </Tab>
      )}

      {/* Permissions tab - only if can manage */}
      {permissions['content:courses:manage-permissions'] && (
        <Tab value="permissions">
          <PermissionsManager />
        </Tab>
      )}

      {/* Admin tab - only if has all permissions */}
      {hasAll && (
        <Tab value="admin">
          <AdminSettings />
        </Tab>
      )}
    </Tabs>
  );
}
```

---

## Migration from V1

### Old Role Checks → New UserType Checks

```typescript
// V1
const { role } = useAuth();
if (role === 'instructor') {
  // ...
}

// V2
const { isStaff } = useUserType();
if (isStaff) {
  // ...
}
```

### Old Role Arrays → New Permission Checks

```typescript
// V1
const { roles } = useAuth();
if (roles.includes('content-admin')) {
  // ...
}

// V2
const canManage = usePermission('content:courses:manage');
if (canManage) {
  // ...
}
```

### Old ProtectedRoute → New ProtectedRoute

```typescript
// V1
<ProtectedRoute roles={['instructor', 'content-admin']}>
  <CoursePage />
</ProtectedRoute>

// V2
<ProtectedRoute userTypes={['staff']}>
  <CoursePage />
</ProtectedRoute>

// Or even better - use permission
<ProtectedRoute requiredPermission="content:courses:view">
  <CoursePage />
</ProtectedRoute>
```

---

## API Reference

### useAuthStore()

```typescript
const {
  // State
  accessToken: AccessToken | null;
  user: User | null;
  roleHierarchy: RoleHierarchy | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;

  // Permission checking
  hasPermission: (permission: string, scope?: PermissionScope) => boolean;
  hasAnyPermission: (permissions: string[], scope?: PermissionScope) => boolean;
  hasAllPermissions: (permissions: string[], scope?: PermissionScope) => boolean;

  // Role checking
  hasRole: (role: string, departmentId?: string) => boolean;
} = useAuthStore();
```

### useNavigationStore()

```typescript
const {
  selectedDepartmentId: string | null;
  lastAccessedDepartments: Record<string, string>;
  isSidebarOpen: boolean;

  setSelectedDepartment: (deptId: string | null) => void;
  rememberDepartment: (userId: string, deptId: string) => void;
  clearDepartmentSelection: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
} = useNavigationStore();
```

### usePermission()

```typescript
const canCreate = usePermission('content:courses:create', scope?);
```

### usePermissions()

```typescript
const {
  permissions: Record<string, boolean>;
  hasAll: boolean;
  hasAny: boolean;
} = usePermissions(
  ['permission1', 'permission2'],
  { scope?, requireAll? }
);
```

### useUserType()

```typescript
const {
  isStaff: boolean;
  isLearner: boolean;
  isAdmin: boolean;
  isGlobalAdmin: boolean;
  primaryType: UserType | null;
  allTypes: UserType[];
  hasType: (type: UserType) => boolean;
} = useUserType();
```

### useAccess()

```typescript
const {
  // User type info
  isStaff: boolean;
  isLearner: boolean;
  // ... all useUserType() returns

  // Permission methods
  hasPermission: (permission: string, scope?) => boolean;
  hasAnyPermission: (permissions: string[], scope?) => boolean;
  hasAllPermissions: (permissions: string[], scope?) => boolean;
  hasRole: (role: string, departmentId?) => boolean;
} = useAccess();
```

---

## Troubleshooting

### Issue: Permission Always Returns False

**Problem**: `hasPermission()` always returns false even though user should have access.

**Solutions**:
1. Check if user is authenticated: `isAuthenticated === true`
2. Verify permission string is correct (check for typos)
3. Check if permission exists in `roleHierarchy.allPermissions`
4. For department-scoped checks, verify department ID is correct
5. Check backend is returning correct permissions in login response

```typescript
// Debug permission check
const { roleHierarchy, hasPermission } = useAuthStore();
console.log('All permissions:', roleHierarchy?.allPermissions);
console.log('Has permission:', hasPermission('content:courses:create'));
```

### Issue: Session Not Restored on Page Reload

**Problem**: User has to login again after page refresh.

**Solutions**:
1. Verify `AuthInitializer` wraps your app
2. Check browser console for initialization errors
3. Verify tokens are in storage (sessionStorage for access, localStorage for refresh)
4. Check if tokens have expired
5. Verify `/auth/me` endpoint is accessible

```typescript
// Debug session restoration
import { getAccessToken, getRefreshToken } from '@/shared/utils/tokenStorage';

console.log('Access token:', getAccessToken());
console.log('Refresh token:', getRefreshToken());
```

### Issue: Department Context Not Working

**Problem**: `useDepartment()` throws error or returns null department.

**Solutions**:
1. Ensure component is wrapped in `<DepartmentProvider>`
2. Verify `selectedDepartmentId` is set in navigationStore
3. Check if user has membership in the selected department
4. Verify department exists in `roleHierarchy.staffRoles` or `roleHierarchy.learnerRoles`

```typescript
// Debug department context
const { selectedDepartmentId } = useNavigationStore();
const { roleHierarchy } = useAuthStore();

console.log('Selected dept:', selectedDepartmentId);
console.log('Staff depts:', roleHierarchy?.staffRoles?.departmentRoles);
console.log('Learner depts:', roleHierarchy?.learnerRoles?.departmentRoles);
```

### Issue: ProtectedRoute Not Redirecting

**Problem**: User can access protected routes without proper permissions.

**Solutions**:
1. Verify `ProtectedRoute` is wrapping the component
2. Check if route is using old V1 guards
3. Verify permission/userType parameters are correct
4. Check if `isAuthenticated` is being set correctly
5. Look for typos in permission strings

### Issue: TypeScript Errors with Permission Strings

**Problem**: TypeScript complains about permission string literals.

**Solution**: Permissions are just strings, but you can create a constants file:

```typescript
// src/shared/constants/permissions.ts
export const PERMISSIONS = {
  COURSES: {
    CREATE: 'content:courses:create',
    READ: 'content:courses:read',
    EDIT: 'content:courses:edit',
    DELETE: 'content:courses:delete',
  },
  // ... more permissions
} as const;

// Usage
import { PERMISSIONS } from '@/shared/constants/permissions';

const canCreate = usePermission(PERMISSIONS.COURSES.CREATE);
```

---

## Best Practices

1. **Use Hooks Over Direct Store Access**: Prefer `usePermission()` over `useAuthStore().hasPermission()`
2. **Use Convenience Wrappers**: Use `StaffGate` instead of `PermissionGate userTypes={['staff']}`
3. **Check Permissions, Not Roles**: Check permissions (`content:courses:create`) not roles (`instructor`)
4. **Fail Secure**: Default to denying access if uncertain
5. **Provide Feedback**: Show clear messages when access is denied
6. **Test Edge Cases**: Test with different user types and permission combinations
7. **Use Department Context**: For department-scoped pages, wrap with `DepartmentProvider`
8. **Cache Permission Checks**: Use hooks that memoize results for performance

---

## Additional Resources

- [Phase 1 Report](./PHASE_1_COMPLETION_REPORT.md) - Core Infrastructure
- [Phase 2 Report](./PHASE_2_STATE_MANAGEMENT_REPORT.md) - State Management
- [Phase 3 Report](./PHASE_3_NAVIGATION_COMPONENTS_REPORT.md) - Navigation
- [Phase 4 Report](./PHASE_4_ROUTING_PROTECTION_REPORT.md) - Routing
- [Phase 5 Report](./PHASE_5_HELPER_COMPONENTS_REPORT.md) - Helpers
- [Phase 6 Report](./PHASE_6_LOGIN_SESSION_REPORT.md) - Login & Session

---

**Document Version:** 1.0
**Last Updated:** 2026-01-10
**Authors:** Claude Code Development Team
