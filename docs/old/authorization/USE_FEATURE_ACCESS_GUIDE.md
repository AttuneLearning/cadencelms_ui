# useFeatureAccess Hook - Developer Guide

**Quick Reference for Using Feature Flags**

---

## Quick Start

```tsx
import { useFeatureAccess } from '@/shared/hooks';

function MyComponent() {
  const features = useFeatureAccess();

  return (
    <div>
      {features.canManageCourses && <CreateCourseButton />}
      {features.canViewCourses && <CourseList />}
    </div>
  );
}
```

---

## All Available Flags (35 total)

### User Type Flags (5)

```tsx
features.isLearner              // Is the user a learner?
features.isStaff                // Is the user a staff member?
features.isGlobalAdmin          // Is the user a global admin?
features.isAdminActive          // Is an admin session active (escalated)?
features.hasDepartmentSelected  // Has the user selected a department?
```

### System Administration (4)

```tsx
features.canAccessAdminPanel      // Can access admin panel
features.canManageUsers           // Can manage users
features.canManageSystemSettings  // Can manage system settings
features.canViewAuditLogs         // Can view audit logs
```

### Content Management (5)

```tsx
features.canManageCourses   // Can create/edit/delete courses
features.canViewCourses     // Can view courses
features.canManageLessons   // Can create/edit/delete lessons
features.canViewLessons     // Can view lessons
features.canManageResources // Can manage learning resources
```

### Learner Management (5)

```tsx
features.canManageLearners     // Can create/edit learner profiles
features.canViewLearners       // Can view learner profiles
features.canManageEnrollments  // Can manage enrollments
features.canManageGrades       // Can edit grades
features.canViewGrades         // Can view grades
```

### Department Management (3)

```tsx
features.canManageDepartmentRoles // Can manage department roles
features.canManageDepartmentStaff // Can manage department staff
features.canViewDepartmentStaff   // Can view department staff
```

### Billing & Finance (2)

```tsx
features.canManageBilling // Can manage billing/invoices
features.canViewBilling   // Can view billing/invoices
```

### Reports & Analytics (3)

```tsx
features.canViewReports           // Can view reports
features.canExportData            // Can export data
features.canViewDepartmentReports // Can view department reports
```

### Class Management (3)

```tsx
features.canViewOwnClasses   // Can view own classes
features.canManageOwnClasses // Can manage own classes
features.canViewAllClasses   // Can view all classes in department
```

### Grading (3)

```tsx
features.canGradeOwnClasses // Can grade own classes
features.canViewOwnGrades   // Can view own grades
features.canManageAllGrades // Can manage all grades in department
```

### FERPA-Protected Data (3)

```tsx
features.canViewTranscripts      // Can view learner transcripts
features.canViewPII              // Can view PII
features.canViewLearnerProgress  // Can view learner progress
```

### Settings (2)

```tsx
features.canManageDepartmentSettings // Can manage department settings
features.canViewDepartmentSettings   // Can view department settings
```

---

## Common Patterns

### Navigation Menu

```tsx
function NavigationMenu() {
  const features = useFeatureAccess();

  return (
    <nav>
      {features.canViewCourses && <NavLink to="/courses">Courses</NavLink>}
      {features.canViewLearners && <NavLink to="/learners">Learners</NavLink>}
      {features.canViewBilling && <NavLink to="/billing">Billing</NavLink>}
      {features.canViewReports && <NavLink to="/reports">Reports</NavLink>}
      {features.canAccessAdminPanel && <NavLink to="/admin">Admin</NavLink>}
    </nav>
  );
}
```

### Action Buttons

```tsx
function CourseActions({ courseId }: { courseId: string }) {
  const features = useFeatureAccess();

  return (
    <ButtonGroup>
      <Button onClick={() => viewCourse(courseId)}>View</Button>

      {features.canManageCourses && (
        <Button onClick={() => editCourse(courseId)}>Edit</Button>
      )}

      {features.canManageCourses && (
        <Button variant="danger" onClick={() => deleteCourse(courseId)}>
          Delete
        </Button>
      )}
    </ButtonGroup>
  );
}
```

### Conditional Rendering

```tsx
function DashboardPage() {
  const features = useFeatureAccess();

  return (
    <div className="grid grid-cols-2 gap-4">
      {features.canViewCourses && (
        <DashboardCard title="My Courses">
          <CourseList />
        </DashboardCard>
      )}

      {features.canViewLearners && (
        <DashboardCard title="Learners">
          <LearnerStats />
        </DashboardCard>
      )}

      {features.canViewBilling && (
        <DashboardCard title="Revenue">
          <RevenueChart />
        </DashboardCard>
      )}

      {features.canViewReports && (
        <DashboardCard title="Reports">
          <ReportsList />
        </DashboardCard>
      )}
    </div>
  );
}
```

### Multiple Checks

```tsx
function LearnerManagement() {
  const features = useFeatureAccess();

  // Check if user can do anything in this section
  const hasAnyAccess =
    features.canViewLearners ||
    features.canManageLearners ||
    features.canManageEnrollments;

  if (!hasAnyAccess) {
    return <AccessDenied />;
  }

  return (
    <div>
      <h1>Learner Management</h1>

      {features.canManageLearners && (
        <Button onClick={createLearner}>Add Learner</Button>
      )}

      {features.canManageEnrollments && (
        <EnrollmentManager />
      )}

      {features.canViewLearners && (
        <LearnerList />
      )}
    </div>
  );
}
```

### User Type Checks

```tsx
function Header() {
  const features = useFeatureAccess();

  return (
    <header>
      <Logo />

      <nav>
        {features.isLearner && <LearnerNav />}
        {features.isStaff && <StaffNav />}
        {features.isGlobalAdmin && <AdminNav />}
      </nav>

      {features.isAdminActive && (
        <Badge variant="warning">Admin Session Active</Badge>
      )}
    </header>
  );
}
```

### Department Context

```tsx
function CourseCreator() {
  const features = useFeatureAccess();

  if (!features.hasDepartmentSelected) {
    return (
      <Alert>
        Please select a department before creating a course.
        <DepartmentSelector />
      </Alert>
    );
  }

  if (!features.canManageCourses) {
    return <AccessDenied />;
  }

  return <CourseCreationForm />;
}
```

---

## Best Practices

### ✅ DO

```tsx
// Use feature flags for UI visibility
const features = useFeatureAccess();
return features.canManageCourses ? <CreateButton /> : null;

// Combine multiple flags for complex logic
const canEditThisCourse =
  features.canManageCourses &&
  (isAuthor || features.isGlobalAdmin);

// Use user type flags for role-based UI
if (features.isLearner) {
  return <LearnerDashboard />;
}
```

### ❌ DON'T

```tsx
// Don't use inline permission checks (use useFeatureAccess instead)
const { hasPermission } = useDepartmentContext();
return hasPermission('content:courses:manage') ? <Button /> : null;

// Don't destructure all flags (use selective destructuring)
const { canManageCourses, canViewCourses, ...allOtherFlags } = useFeatureAccess();

// Don't check flags on every render (they're already memoized)
const canManage = useMemo(() => features.canManageCourses, [features]);
```

---

## Performance Notes

The hook is **highly optimized**:

- ✅ Memoized with `useMemo` - no unnecessary recalculations
- ✅ Only recomputes when auth state or permissions change
- ✅ Returns the same object reference when nothing changes
- ✅ Safe to use in multiple components without performance impact

```tsx
// This is efficient - hook is memoized
function MyComponent() {
  const features = useFeatureAccess(); // ← Memoized!

  return (
    <>
      {features.canManageCourses && <Button1 />}
      {features.canManageCourses && <Button2 />}
      {features.canManageCourses && <Button3 />}
    </>
  );
}
```

---

## When to Use vs. Other Hooks

### Use `useFeatureAccess` when:
- ✅ You need boolean flags for UI visibility
- ✅ You're building navigation menus
- ✅ You're conditionally rendering components
- ✅ You want clean, readable code

### Use `useDepartmentContext` when:
- ✅ You need to check a permission not in useFeatureAccess
- ✅ You need department context (ID, name, roles)
- ✅ You need to switch departments
- ✅ You need custom permission logic

### Use `useAuthStore` when:
- ✅ You need full role hierarchy
- ✅ You need user object details
- ✅ You're implementing auth flows (login, logout)
- ✅ You need raw permission arrays

---

## TypeScript Support

The hook has full TypeScript support:

```tsx
import { useFeatureAccess, type FeatureAccessFlags } from '@/shared/hooks';

// Type inference works automatically
const features = useFeatureAccess(); // ← Type is FeatureAccessFlags

// Autocomplete works for all 35 flags
features.can // ← Shows all available flags

// Type-safe conditional logic
const canEdit: boolean = features.canManageCourses; // ← Type-safe
```

---

## Troubleshooting

### Problem: All flags are false

**Solution:** Check if user is authenticated and has department selected

```tsx
const features = useFeatureAccess();

if (!features.hasDepartmentSelected) {
  console.log('User needs to select a department');
}
```

### Problem: Flag is false but user should have access

**Solution:** Check the underlying permission

```tsx
const features = useFeatureAccess();
const { hasPermission } = useDepartmentContext();

console.log('canManageCourses:', features.canManageCourses);
console.log('Has content:courses:manage:', hasPermission('content:courses:manage'));
console.log('Has content:*:', hasPermission('content:*'));
```

### Problem: Flags not updating when permissions change

**Solution:** The hook is memoized - check dependencies

```tsx
// The hook automatically updates when:
// - Authentication status changes
// - Role hierarchy changes
// - Department selection changes
// - Admin session state changes

// No manual action needed - it's automatic!
```

---

## Examples by Use Case

### Course Management

```tsx
function CoursePage() {
  const features = useFeatureAccess();

  return (
    <div>
      <h1>Courses</h1>

      {features.canManageCourses && (
        <CreateCourseButton />
      )}

      {features.canViewCourses ? (
        <CourseGrid />
      ) : (
        <AccessDenied message="You don't have permission to view courses" />
      )}
    </div>
  );
}
```

### Learner Management

```tsx
function LearnerPage() {
  const features = useFeatureAccess();

  return (
    <div>
      <h1>Learners</h1>

      <Tabs>
        {features.canViewLearners && (
          <Tab label="View Learners">
            <LearnerList />
          </Tab>
        )}

        {features.canManageLearners && (
          <Tab label="Manage Learners">
            <LearnerManager />
          </Tab>
        )}

        {features.canManageEnrollments && (
          <Tab label="Enrollments">
            <EnrollmentManager />
          </Tab>
        )}

        {features.canViewGrades && (
          <Tab label="Grades">
            <GradeBook />
          </Tab>
        )}
      </Tabs>
    </div>
  );
}
```

### Admin Panel

```tsx
function AdminPanel() {
  const features = useFeatureAccess();

  if (!features.canAccessAdminPanel) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div>
      <h1>Admin Panel</h1>

      <AdminGrid>
        {features.canManageUsers && (
          <AdminCard title="Users" icon="users" link="/admin/users" />
        )}

        {features.canManageSystemSettings && (
          <AdminCard title="Settings" icon="settings" link="/admin/settings" />
        )}

        {features.canViewAuditLogs && (
          <AdminCard title="Audit Logs" icon="shield" link="/admin/audit" />
        )}
      </AdminGrid>
    </div>
  );
}
```

---

## Support

For questions or issues:
1. Check the [API Contracts](../api_contracts/UI_AUTHORIZATION_IMPLEMENTATION_GUIDE.md)
2. Review the [Implementation Plan](../devdocs/impl_reports/UI_AUTH_NEW_IMPLEMENTATION_PLAN.md)
3. See the [Test Suite](../src/shared/hooks/__tests__/useFeatureAccess.test.ts) for examples

---

**Version:** 1.0.0
**Last Updated:** 2026-01-11
**Status:** Production Ready ✅
