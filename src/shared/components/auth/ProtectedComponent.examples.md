# ProtectedComponent Usage Examples

This document provides comprehensive usage examples for the `ProtectedComponent` and its convenience wrappers.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Single Permission](#single-permission)
3. [Multiple Permissions (AND Logic)](#multiple-permissions-and-logic)
4. [Multiple Permissions (OR Logic)](#multiple-permissions-or-logic)
5. [User Type Restrictions](#user-type-restrictions)
6. [Department Context](#department-context)
7. [Fallback UI](#fallback-ui)
8. [Convenience Wrappers](#convenience-wrappers)
9. [Combined Restrictions](#combined-restrictions)
10. [Real-World Examples](#real-world-examples)

---

## Basic Usage

The simplest usage - just checks authentication:

```tsx
import { ProtectedComponent } from '@/shared/components/auth';

function MyComponent() {
  return (
    <ProtectedComponent>
      <div>This content is only visible to authenticated users</div>
    </ProtectedComponent>
  );
}
```

---

## Single Permission

Show content only to users with a specific permission:

```tsx
import { ProtectedComponent } from '@/shared/components/auth';

function CourseManagementButtons() {
  return (
    <ProtectedComponent requiredRights="content:courses:manage">
      <button>Create Course</button>
      <button>Edit Course</button>
      <button>Delete Course</button>
    </ProtectedComponent>
  );
}
```

---

## Multiple Permissions (AND Logic)

User must have ALL specified permissions:

```tsx
import { ProtectedComponent } from '@/shared/components/auth';

function AdvancedSettings() {
  return (
    <ProtectedComponent
      requiredRights={['content:courses:manage', 'department:staff:write']}
      requireAll={true}
    >
      <div>Advanced course settings panel</div>
    </ProtectedComponent>
  );
}
```

---

## Multiple Permissions (OR Logic)

User needs ANY of the specified permissions:

```tsx
import { ProtectedComponent } from '@/shared/components/auth';

function CourseAccess() {
  return (
    <ProtectedComponent
      requiredRights={['content:courses:manage', 'content:courses:read']}
      requireAll={false}
    >
      <div>Course library access</div>
    </ProtectedComponent>
  );
}
```

---

## User Type Restrictions

Restrict content to specific user types:

```tsx
import { ProtectedComponent } from '@/shared/components/auth';

// Staff only
function StaffWidget() {
  return (
    <ProtectedComponent allowedUserTypes={['staff']}>
      <div>Staff-specific dashboard widget</div>
    </ProtectedComponent>
  );
}

// Learners only
function LearnerWidget() {
  return (
    <ProtectedComponent allowedUserTypes={['learner']}>
      <div>Your enrolled courses</div>
    </ProtectedComponent>
  );
}

// Staff or Admin
function AdminPanel() {
  return (
    <ProtectedComponent allowedUserTypes={['staff', 'global-admin']}>
      <div>Administrative functions</div>
    </ProtectedComponent>
  );
}
```

---

## Department Context

Require a department to be selected:

```tsx
import { ProtectedComponent } from '@/shared/components/auth';

function DepartmentCourses() {
  return (
    <ProtectedComponent
      requiredRights="content:courses:read"
      requireDepartmentContext={true}
    >
      <div>Courses in this department</div>
    </ProtectedComponent>
  );
}
```

---

## Fallback UI

Show custom message when access is denied:

```tsx
import { ProtectedComponent } from '@/shared/components/auth';

function BillingDashboard() {
  return (
    <ProtectedComponent
      requiredRights="billing:invoices:read"
      fallback={
        <div className="text-center p-8 text-gray-500">
          <p>You don't have access to billing information.</p>
          <p className="text-sm">Contact your department administrator for access.</p>
        </div>
      }
    >
      <div>Billing dashboard content</div>
    </ProtectedComponent>
  );
}
```

---

## Convenience Wrappers

Use pre-configured wrappers for common cases:

### StaffOnly

```tsx
import { StaffOnly } from '@/shared/components/auth';

function StaffDashboard() {
  return (
    <StaffOnly>
      <div>Staff dashboard widgets</div>
      <div>Teaching schedule</div>
      <div>Class roster</div>
    </StaffOnly>
  );
}
```

### LearnerOnly

```tsx
import { LearnerOnly } from '@/shared/components/auth';

function LearnerDashboard() {
  return (
    <LearnerOnly>
      <div>My courses</div>
      <div>Progress tracker</div>
      <div>Grades</div>
    </LearnerOnly>
  );
}
```

### AdminOnly

```tsx
import { AdminOnly } from '@/shared/components/auth';

function SystemSettings() {
  return (
    <AdminOnly>
      <div>System configuration</div>
      <div>Global settings</div>
      <div>User management</div>
    </AdminOnly>
  );
}
```

### With Additional Props

Convenience wrappers can be combined with permission checks:

```tsx
import { StaffOnly } from '@/shared/components/auth';

function GradebookAccess() {
  return (
    <StaffOnly
      requiredRights="grades:own-classes:manage"
      fallback={<div>Gradebook access requires additional permissions</div>}
    >
      <GradebookComponent />
    </StaffOnly>
  );
}
```

---

## Combined Restrictions

Combine multiple restriction types for fine-grained control:

```tsx
import { ProtectedComponent } from '@/shared/components/auth';

function DepartmentGradebook() {
  return (
    <ProtectedComponent
      allowedUserTypes={['staff']}
      requiredRights="grades:own-classes:manage"
      requireDepartmentContext={true}
      fallback={<div>You don't have gradebook access in this department</div>}
    >
      <div>Gradebook for current department</div>
    </ProtectedComponent>
  );
}
```

---

## Real-World Examples

### Navigation Menu with Progressive Disclosure

```tsx
import { ProtectedComponent, StaffOnly, LearnerOnly } from '@/shared/components/auth';

function Sidebar() {
  return (
    <nav className="sidebar">
      {/* Always visible */}
      <NavLink to="/dashboard">Dashboard</NavLink>
      <NavLink to="/profile">My Profile</NavLink>

      {/* Staff-only section */}
      <StaffOnly>
        <div className="nav-section">
          <h3>Teaching</h3>
          <ProtectedComponent requiredRights="content:courses:read">
            <NavLink to="/courses">Course Library</NavLink>
          </ProtectedComponent>
          <ProtectedComponent requiredRights="content:courses:manage">
            <NavLink to="/courses/create">Create Course</NavLink>
          </ProtectedComponent>
          <ProtectedComponent requiredRights="grades:own-classes:manage">
            <NavLink to="/gradebook">Gradebook</NavLink>
          </ProtectedComponent>
        </div>
      </StaffOnly>

      {/* Learner-only section */}
      <LearnerOnly>
        <div className="nav-section">
          <h3>Learning</h3>
          <NavLink to="/my-courses">My Courses</NavLink>
          <NavLink to="/progress">My Progress</NavLink>
          <ProtectedComponent requiredRights="grades:own:read">
            <NavLink to="/my-grades">My Grades</NavLink>
          </ProtectedComponent>
        </div>
      </LearnerOnly>

      {/* Admin section */}
      <ProtectedComponent allowedUserTypes={['global-admin']}>
        <div className="nav-section">
          <h3>Administration</h3>
          <NavLink to="/admin/users">User Management</NavLink>
          <NavLink to="/admin/departments">Departments</NavLink>
          <NavLink to="/admin/reports">Reports</NavLink>
        </div>
      </ProtectedComponent>
    </nav>
  );
}
```

### Course Card with Conditional Actions

```tsx
import { ProtectedComponent } from '@/shared/components/auth';

function CourseCard({ course }) {
  return (
    <div className="course-card">
      {/* Basic info visible to all */}
      <h3>{course.name}</h3>
      <p>{course.description}</p>

      {/* Enrollment button for learners */}
      <ProtectedComponent allowedUserTypes={['learner']}>
        <button onClick={() => enrollInCourse(course.id)}>
          Enroll
        </button>
      </ProtectedComponent>

      {/* Edit button for content managers */}
      <ProtectedComponent requiredRights="content:courses:manage">
        <button onClick={() => editCourse(course.id)}>
          Edit Course
        </button>
      </ProtectedComponent>

      {/* Delete button with multiple permissions */}
      <ProtectedComponent
        requiredRights={['content:courses:manage', 'department:staff:write']}
        requireAll={true}
      >
        <button
          onClick={() => deleteCourse(course.id)}
          className="btn-danger"
        >
          Delete Course
        </button>
      </ProtectedComponent>
    </div>
  );
}
```

### Department Dashboard with Context

```tsx
import { ProtectedComponent, StaffOnly } from '@/shared/components/auth';
import { useDepartmentContext } from '@/shared/hooks/useDepartmentContext';

function DepartmentDashboard() {
  const { currentDepartmentId, currentDepartmentName } = useDepartmentContext();

  if (!currentDepartmentId) {
    return <div>Please select a department</div>;
  }

  return (
    <div className="department-dashboard">
      <h1>Dashboard: {currentDepartmentName}</h1>

      {/* Department-scoped widgets */}
      <StaffOnly requireDepartmentContext>
        <div className="dashboard-grid">
          <ProtectedComponent requiredRights="content:courses:read">
            <CourseStatisticsWidget />
          </ProtectedComponent>

          <ProtectedComponent requiredRights="learners:enrollment:read">
            <EnrollmentStatisticsWidget />
          </ProtectedComponent>

          <ProtectedComponent requiredRights="grades:own-classes:manage">
            <GradingQueueWidget />
          </ProtectedComponent>

          <ProtectedComponent
            requiredRights="reports:department:read"
            fallback={<div>Reports not available</div>}
          >
            <ReportsWidget />
          </ProtectedComponent>
        </div>
      </StaffOnly>
    </div>
  );
}
```

### Loading State Example

```tsx
import { ProtectedComponent } from '@/shared/components/auth';

function DataTable() {
  return (
    <ProtectedComponent
      requiredRights="reports:department:read"
      showLoading={true}
      fallback={<div>You don't have access to reports</div>}
    >
      <div>Report data table</div>
    </ProtectedComponent>
  );
}
```

### Nested Protection

```tsx
import { StaffOnly, ProtectedComponent } from '@/shared/components/auth';

function AdvancedCourseSettings() {
  return (
    <StaffOnly fallback={<div>Staff access required</div>}>
      <div className="course-settings">
        <h2>Course Settings</h2>

        {/* Basic settings for all staff */}
        <BasicSettingsPanel />

        {/* Advanced settings require additional permission */}
        <ProtectedComponent
          requiredRights="content:courses:advanced-settings"
          fallback={<div>Advanced settings require additional permissions</div>}
        >
          <AdvancedSettingsPanel />
        </ProtectedComponent>

        {/* Danger zone requires multiple permissions */}
        <ProtectedComponent
          requiredRights={[
            'content:courses:manage',
            'content:courses:delete',
          ]}
          requireAll={true}
        >
          <DangerZonePanel />
        </ProtectedComponent>
      </div>
    </StaffOnly>
  );
}
```

---

## Best Practices

1. **Use convenience wrappers** for common cases (StaffOnly, LearnerOnly, AdminOnly)
2. **Provide fallback UI** for better user experience when showing why access is denied
3. **Use requireDepartmentContext** for features that need department selection
4. **Combine with routing** - use both ProtectedRoute and ProtectedComponent for defense in depth
5. **Keep permission checks close to UI** - wrap individual buttons/sections rather than entire pages
6. **Use debugLabel** during development to troubleshoot permission issues
7. **Remember: client-side checks are for UX only** - always validate on the backend

---

## Performance Tips

1. The component uses `useMemo` internally for performance optimization
2. Permission checks are cached in `useDepartmentContext`
3. Avoid wrapping large component trees - wrap specific elements instead
4. Use `showLoading={false}` (default) unless you specifically need loading UI

---

## Debugging

Enable debug logging in development:

```tsx
<ProtectedComponent
  requiredRights="content:courses:manage"
  debugLabel="CourseManagementButtons"
>
  <button>Create Course</button>
</ProtectedComponent>
```

This will log permission check failures to the console in development mode.
