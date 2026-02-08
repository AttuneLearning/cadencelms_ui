# Pattern: Permission String Debugging

**Category:** Architecture | Debugging
**Created:** 2026-02-05
**Tags:** #pattern #permissions #authorization #debugging #api-ui-mismatch

## Problem

UI permission checks fail silently because the permission strings used in the UI don't match the permission strings returned by the API. This leads to features appearing disabled even when the user should have access.

**Symptoms:**
- `hasPermission('some:permission')` returns `false` unexpectedly
- Edit/Create buttons are disabled when they shouldn't be
- Users with correct roles can't access features

## Root Cause

The API and UI were developed with different permission naming conventions:

| Source | Convention | Example |
|--------|------------|---------|
| **API** (correct) | `domain:resource:action` | `content:courses:manage` |
| **UI** (incorrect) | `resource:action-scope` | `course:edit-department` |

## Solution

### 1. Find the API Source of Truth

Check the API's role definitions seed file:
```
cadencelms_api/scripts/seed-role-definitions.ts
```

This file defines all roles and their access rights:
```typescript
// Example: content-admin role
{
  name: 'content-admin',
  accessRights: [
    'content:courses:manage',  // <-- Correct format
    'content:programs:manage',
    'content:lessons:manage',
    // ...
  ]
}
```

### 2. Check authStore Permission Logic

The permission check happens in `src/features/auth/model/authStore.ts`:
```typescript
hasPermission: (permission, departmentId) => {
  const { globalRights, departmentRights } = get();

  // 1. Check globalRights first
  if (rightsInclude(globalRights, permission)) return true;

  // 2. Check departmentRights[departmentId]
  if (departmentId !== undefined) {
    const deptRights = departmentRights[departmentId];
    if (deptRights && rightsInclude(deptRights, permission)) return true;
  }

  return false;
}
```

### 3. Fix the UI Permission Strings

Update UI components to use the correct API permission strings:

```typescript
// BEFORE (wrong)
const canEdit = hasPermission('course:edit-department');

// AFTER (correct)
const canEdit = hasPermission('content:courses:manage');
```

## Permission String Reference

| Action | Correct Permission | Role(s) |
|--------|-------------------|---------|
| View courses | `content:courses:read` | instructor, content-admin, dept-admin |
| Create/Edit courses | `content:courses:manage` | content-admin |
| Manage classes | `content:classes:manage` | dept-admin |
| Manage own classes | `content:classes:manage-own` | instructor |
| View enrollments | `enrollment:department:read` | instructor, dept-admin |
| Manage enrollments | `enrollment:department:manage` | dept-admin |
| Manage settings | `settings:department:manage` | dept-admin |
| View reports | `reports:department:read` | dept-admin |
| Export reports | `reports:department:export` | dept-admin |

## Debugging Checklist

1. **Add console logging** to see what's being checked:
   ```typescript
   console.log('[Page] Permission check:', {
     permission: 'content:courses:manage',
     departmentId: currentDepartmentId,
     result: hasPermission('content:courses:manage'),
   });
   ```

2. **Check the login response** in browser DevTools Network tab:
   - Look at `/api/auth/login` response
   - Check `departmentMemberships[].accessRights` array

3. **Verify department context** is set:
   - `currentDepartmentId` should not be null
   - Permission checks use `departmentRights[departmentId]`

4. **Check role assignment**:
   - Instructors can't edit courses (only content-admins can)
   - Verify user has correct role in that department

## When to Use

- Permission-gated features not working
- Buttons/actions unexpectedly disabled
- After adding new permission checks
- When migrating from old permission format

## When NOT to Use

- If the user genuinely doesn't have the role (not a bug)
- For global permissions (check `globalRights` instead)

## Related Patterns

- [[entity-action-menu]] - Uses permission checks for action visibility

## Examples in Codebase

- `src/pages/staff/departments/DepartmentCoursesPage.tsx:93-94`
- `src/pages/staff/departments/DepartmentSettingsPage.tsx:93-95`
- `src/features/auth/model/authStore.ts:755-815`

## Key Files

| File | Purpose |
|------|---------|
| `cadencelms_api/scripts/seed-role-definitions.ts` | API source of truth for permissions |
| `src/features/auth/model/authStore.ts` | Permission checking logic |
| `src/shared/hooks/useDepartmentContext.ts` | Department-scoped permission hook |

## Links

- Memory log: [[../memory-log]]
- Related: [[entity-action-menu]]
