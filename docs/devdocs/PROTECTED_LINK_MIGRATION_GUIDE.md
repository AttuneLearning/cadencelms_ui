# ProtectedLink Enhancement Migration Guide

**Version:** 2.0.0
**Date:** 2026-01-11
**Track:** Phase 2B - Protected Link Enhancements
**Status:** Production Ready

---

## Overview

This guide covers the fixes and enhancements made to `ProtectedLink` and the introduction of `ProtectedNavLink` in Track 2B. The primary fix addresses a documented limitation where `ProtectedLink` only checked the first permission when multiple permissions were provided.

### What Changed

1. **ProtectedLink v2.0.0**: Fixed multiple permission checking to properly implement AND/OR logic
2. **ProtectedNavLink v1.0.0**: New component wrapping React Router's NavLink with permission checking
3. **100% Backward Compatible**: All existing ProtectedLink usage continues to work without changes

---

## Critical Fix: Multiple Permission Checking

### The Problem (v1.0.0)

In the previous version, `ProtectedLink` only checked the **first permission** when an array was provided:

```typescript
// BROKEN in v1.0.0 - Only checked first permission!
<ProtectedLink
  to="/courses/advanced"
  requiredPermissions={['content:courses:read', 'content:advanced:access']}
  requireAll={true}
>
  Advanced Courses
</ProtectedLink>
// This incorrectly only checked 'content:courses:read'
```

### The Solution (v2.0.0)

Version 2.0.0 now properly checks **all permissions** using the appropriate logic:

```typescript
// FIXED in v2.0.0 - Checks all permissions with AND logic
<ProtectedLink
  to="/courses/advanced"
  requiredPermissions={['content:courses:read', 'content:advanced:access']}
  requireAll={true}
>
  Advanced Courses
</ProtectedLink>
// Now correctly requires BOTH permissions

// OR logic (default)
<ProtectedLink
  to="/admin"
  requiredPermissions={['system:admin', 'system:support']}
  requireAll={false}  // or omit, defaults to false
>
  Admin Panel
</ProtectedLink>
// Now correctly requires AT LEAST ONE permission
```

---

## Migration Scenarios

### Scenario 1: Single Permission (No Changes Needed)

If you're using single permissions, **no migration is needed**. Everything works exactly the same:

```typescript
// ✅ Works the same in both v1.0.0 and v2.0.0
<ProtectedLink
  to="/courses"
  requiredPermission="content:courses:read"
>
  Courses
</ProtectedLink>
```

### Scenario 2: Multiple Permissions with requireAll (Needs Review)

If you were using multiple permissions with `requireAll={true}`, you need to **verify the behavior**:

**Before (v1.0.0 - BROKEN):**
```typescript
// This was INCORRECTLY only checking the first permission
<ProtectedLink
  to="/courses/manage"
  requiredPermissions={['content:courses:read', 'content:courses:manage']}
  requireAll={true}
>
  Manage Courses
</ProtectedLink>
```

**After (v2.0.0 - FIXED):**
```typescript
// This now CORRECTLY checks both permissions
<ProtectedLink
  to="/courses/manage"
  requiredPermissions={['content:courses:read', 'content:courses:manage']}
  requireAll={true}
>
  Manage Courses
</ProtectedLink>
```

**Action Required:** Test your UI to ensure users with only one of the permissions no longer see the link (as intended).

### Scenario 3: Multiple Permissions with OR Logic (Needs Review)

If you were using multiple permissions without `requireAll` (OR logic), verify the behavior:

**Before (v1.0.0 - BROKEN):**
```typescript
// This was INCORRECTLY only checking the first permission
<ProtectedLink
  to="/admin"
  requiredPermissions={['system:admin', 'system:support', 'system:moderator']}
>
  Admin Panel
</ProtectedLink>
```

**After (v2.0.0 - FIXED):**
```typescript
// This now CORRECTLY checks if user has ANY of the permissions
<ProtectedLink
  to="/admin"
  requiredPermissions={['system:admin', 'system:support', 'system:moderator']}
>
  Admin Panel
</ProtectedLink>
```

**Action Required:** Test your UI to ensure users with any of the permissions can see the link.

### Scenario 4: Using ProtectedLinkMultiple (Deprecated)

If you were using `ProtectedLinkMultiple` as a workaround, migrate to the main `ProtectedLink`:

**Before (v1.0.0 - using workaround):**
```typescript
import { ProtectedLinkMultiple } from '@/shared/ui/ProtectedLink';

<ProtectedLinkMultiple
  to="/content"
  permissions={['content:courses:read', 'content:courses:create']}
  requireAll={true}
>
  Content Management
</ProtectedLinkMultiple>
```

**After (v2.0.0 - use main component):**
```typescript
import { ProtectedLink } from '@/shared/ui/ProtectedLink';

<ProtectedLink
  to="/content"
  requiredPermissions={['content:courses:read', 'content:courses:create']}
  requireAll={true}
>
  Content Management
</ProtectedLink>
```

**Note:** `ProtectedLinkMultiple` is now deprecated and will be removed in a future version.

---

## New Component: ProtectedNavLink

### What is ProtectedNavLink?

`ProtectedNavLink` is a new component that wraps React Router's `NavLink` with the same permission checking logic as `ProtectedLink`. It's specifically designed for navigation menus where you need active state styling.

### Key Features

- All permission checking features from ProtectedLink
- Active state styling via `className` function
- Supports NavLink's `end` prop for exact matching
- Perfect for sidebar navigation

### Basic Usage

```typescript
import { ProtectedNavLink } from '@/shared/components/nav';

<ProtectedNavLink
  to="/courses"
  requiredPermission="content:courses:read"
  className={({ isActive }) =>
    isActive ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
  }
>
  Courses
</ProtectedNavLink>
```

### Sidebar Navigation Example

```typescript
import { ProtectedNavLink } from '@/shared/components/nav';

function Sidebar() {
  return (
    <nav className="space-y-1">
      <ProtectedNavLink
        to="/dashboard"
        requiredPermission="system:dashboard:view"
        className={({ isActive }) =>
          `flex items-center px-4 py-2 rounded-lg ${
            isActive
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-gray-700 hover:bg-gray-100'
          }`
        }
      >
        <Home className="w-5 h-5 mr-3" />
        Dashboard
      </ProtectedNavLink>

      <ProtectedNavLink
        to="/courses"
        requiredPermission="content:courses:read"
        className={({ isActive }) =>
          `flex items-center px-4 py-2 rounded-lg ${
            isActive
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-gray-700 hover:bg-gray-100'
          }`
        }
      >
        <BookOpen className="w-5 h-5 mr-3" />
        Courses
      </ProtectedNavLink>

      <ProtectedNavLink
        to="/learners"
        requiredPermissions={['learners:profiles:read', 'learners:progress:view']}
        requireAll={false}  // Show if user has ANY permission
        className={({ isActive }) =>
          `flex items-center px-4 py-2 rounded-lg ${
            isActive
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-gray-700 hover:bg-gray-100'
          }`
        }
      >
        <Users className="w-5 h-5 mr-3" />
        Learners
      </ProtectedNavLink>
    </nav>
  );
}
```

### Multiple Permissions with ProtectedNavLink

```typescript
// OR logic (default) - show if user has ANY permission
<ProtectedNavLink
  to="/admin"
  requiredPermissions={['system:admin', 'system:support']}
  className={({ isActive }) => isActive ? 'active' : 'inactive'}
>
  Admin Panel
</ProtectedNavLink>

// AND logic - show only if user has ALL permissions
<ProtectedNavLink
  to="/courses/advanced"
  requiredPermissions={['content:courses:read', 'content:advanced:access']}
  requireAll={true}
  className={({ isActive }) => isActive ? 'active' : 'inactive'}
>
  Advanced Courses
</ProtectedNavLink>
```

### Department-Scoped Navigation

```typescript
// Current department context
<ProtectedNavLink
  to="/department/courses"
  requiredPermission="content:courses:read"
  departmentScoped={true}
  className={({ isActive }) => isActive ? 'active' : 'inactive'}
>
  Department Courses
</ProtectedNavLink>

// Specific department
<ProtectedNavLink
  to="/department/123/settings"
  requiredPermission="department:settings:manage"
  departmentId="dept-123"
  className={({ isActive }) => isActive ? 'active' : 'inactive'}
>
  Department Settings
</ProtectedNavLink>
```

---

## API Comparison

### ProtectedLink vs ProtectedNavLink

| Feature | ProtectedLink | ProtectedNavLink |
|---------|---------------|------------------|
| Base Component | React Router `Link` | React Router `NavLink` |
| Permission Checking | ✅ Yes | ✅ Yes |
| Multiple Permissions | ✅ Yes (v2.0.0) | ✅ Yes |
| AND/OR Logic | ✅ Yes (v2.0.0) | ✅ Yes |
| Department Scoped | ✅ Yes | ✅ Yes |
| Active State Styling | ❌ No | ✅ Yes |
| className Function | ❌ No | ✅ Yes |
| Use Case | General links | Navigation menus |

### Props Reference

Both components share the same permission-related props:

```typescript
interface SharedPermissionProps {
  // Single permission
  requiredPermission?: string;

  // Multiple permissions
  requiredPermissions?: string[];

  // AND vs OR logic (default: false = OR)
  requireAll?: boolean;

  // Department scoping
  departmentScoped?: boolean;
  departmentId?: string;

  // Fallback when no access
  fallback?: React.ReactNode;
}
```

**ProtectedLink specific:**
```typescript
interface ProtectedLinkProps extends SharedPermissionProps {
  to: string;
  className?: string;  // Static string only
  // ... standard Link props
}
```

**ProtectedNavLink specific:**
```typescript
interface ProtectedNavLinkProps extends SharedPermissionProps {
  to: string;
  className?: string | ((props: { isActive: boolean }) => string);  // Function or string
  // ... standard NavLink props (end, caseSensitive, etc.)
}
```

---

## Testing Your Migration

### 1. Test Multiple Permission Links

Create test users with different permission combinations and verify:

```typescript
// Test user with only 'content:courses:read'
// Should NOT see this link (requires BOTH permissions)
<ProtectedLink
  to="/courses/manage"
  requiredPermissions={['content:courses:read', 'content:courses:manage']}
  requireAll={true}
>
  Manage Courses
</ProtectedLink>

// Test user with either 'system:admin' OR 'system:support'
// SHOULD see this link (requires ANY permission)
<ProtectedLink
  to="/admin"
  requiredPermissions={['system:admin', 'system:support']}
  requireAll={false}
>
  Admin Panel
</ProtectedLink>
```

### 2. Test Active State Styling

Navigate to different routes and verify the active styles are applied correctly:

```typescript
<ProtectedNavLink
  to="/courses"
  requiredPermission="content:courses:read"
  className={({ isActive }) =>
    isActive ? "bg-blue-600 text-white" : "text-gray-600"
  }
>
  Courses
</ProtectedNavLink>
```

Visit `/courses` and verify the link has `bg-blue-600 text-white` classes.

### 3. Test Backward Compatibility

Verify all existing single-permission links still work:

```typescript
// Should work exactly as before
<ProtectedLink
  to="/dashboard"
  requiredPermission="system:dashboard:view"
>
  Dashboard
</ProtectedLink>
```

---

## Common Patterns

### Pattern 1: Admin Access (OR Logic)

Show link if user has ANY admin-related permission:

```typescript
<ProtectedLink
  to="/admin"
  requiredPermissions={['system:admin', 'system:support', 'system:moderator']}
>
  Admin Panel
</ProtectedLink>
```

### Pattern 2: Feature Gate (AND Logic)

Show link only if user has ALL required permissions:

```typescript
<ProtectedLink
  to="/courses/advanced/analytics"
  requiredPermissions={[
    'content:courses:read',
    'analytics:advanced:view',
    'content:advanced:access'
  ]}
  requireAll={true}
>
  Advanced Analytics
</ProtectedLink>
```

### Pattern 3: Conditional Navigation Menu

```typescript
function NavigationMenu() {
  return (
    <nav>
      {/* Always visible */}
      <ProtectedNavLink to="/dashboard" requiredPermission="system:dashboard:view">
        Dashboard
      </ProtectedNavLink>

      {/* OR logic - show if user can read OR manage */}
      <ProtectedNavLink
        to="/courses"
        requiredPermissions={['content:courses:read', 'content:courses:manage']}
      >
        Courses
      </ProtectedNavLink>

      {/* AND logic - show only if user has both */}
      <ProtectedNavLink
        to="/analytics"
        requiredPermissions={['analytics:view', 'reports:generate']}
        requireAll={true}
      >
        Analytics
      </ProtectedNavLink>

      {/* With fallback */}
      <ProtectedNavLink
        to="/premium"
        requiredPermission="premium:access"
        fallback={
          <span className="text-gray-400 px-4 py-2">
            Premium (Locked)
          </span>
        }
      >
        Premium Features
      </ProtectedNavLink>
    </nav>
  );
}
```

### Pattern 4: Department-Specific Navigation

```typescript
function DepartmentNav() {
  return (
    <nav>
      {/* Uses currently selected department */}
      <ProtectedNavLink
        to="/department/courses"
        requiredPermission="content:courses:read"
        departmentScoped={true}
      >
        Department Courses
      </ProtectedNavLink>

      {/* Checks specific department */}
      <ProtectedNavLink
        to="/engineering/settings"
        requiredPermission="department:settings:manage"
        departmentId="dept-engineering"
      >
        Engineering Settings
      </ProtectedNavLink>
    </nav>
  );
}
```

---

## Breaking Changes

### None - 100% Backward Compatible

There are **no breaking changes** in v2.0.0. All existing code continues to work:

- Single permission checking works identically
- Department scoping works identically
- All props are backward compatible
- Component exports haven't changed

### What DID Change (Fixes Only)

The only changes are **fixes to broken behavior**:

1. Multiple permissions with `requireAll={true}` now correctly checks ALL permissions (was only checking first)
2. Multiple permissions with `requireAll={false}` now correctly checks ANY permission (was only checking first)

**If your UI relied on the broken behavior**, you may see different results after upgrading. This is expected and correct.

---

## Deprecations

### ProtectedLinkMultiple (Deprecated)

The `ProtectedLinkMultiple` component is now deprecated and will be removed in v3.0.0. Migrate to the main `ProtectedLink` component:

```typescript
// OLD (deprecated)
import { ProtectedLinkMultiple } from '@/shared/ui/ProtectedLink';

<ProtectedLinkMultiple
  permissions={['perm1', 'perm2']}
  requireAll={true}
>
  Link
</ProtectedLinkMultiple>

// NEW (recommended)
import { ProtectedLink } from '@/shared/ui/ProtectedLink';

<ProtectedLink
  requiredPermissions={['perm1', 'perm2']}
  requireAll={true}
>
  Link
</ProtectedLink>
```

---

## Imports

### ProtectedLink

```typescript
// Named import
import { ProtectedLink } from '@/shared/ui/ProtectedLink';

// From barrel export
import { ProtectedLink } from '@/shared/ui';
```

### ProtectedNavLink

```typescript
// Named import
import { ProtectedNavLink } from '@/shared/components/nav/ProtectedNavLink';

// From barrel export (recommended)
import { ProtectedNavLink } from '@/shared/components/nav';
```

---

## Troubleshooting

### Issue: Link showing for users who shouldn't see it

**Cause:** You may be using OR logic when you need AND logic.

**Solution:** Add `requireAll={true}`:

```typescript
<ProtectedLink
  to="/advanced"
  requiredPermissions={['perm1', 'perm2']}
  requireAll={true}  // Add this
>
  Advanced
</ProtectedLink>
```

### Issue: Link hiding for users who should see it

**Cause:** You may be using AND logic when you need OR logic.

**Solution:** Set `requireAll={false}` or remove it (defaults to false):

```typescript
<ProtectedLink
  to="/admin"
  requiredPermissions={['admin:access', 'support:access']}
  requireAll={false}  // or omit entirely
>
  Admin
</ProtectedLink>
```

### Issue: Active styling not working

**Cause:** You're using `ProtectedLink` instead of `ProtectedNavLink`.

**Solution:** Use `ProtectedNavLink` for navigation menus:

```typescript
// Change from ProtectedLink
import { ProtectedLink } from '@/shared/ui';

// To ProtectedNavLink
import { ProtectedNavLink } from '@/shared/components/nav';

<ProtectedNavLink
  to="/courses"
  requiredPermission="content:courses:read"
  className={({ isActive }) => isActive ? 'active' : 'inactive'}
>
  Courses
</ProtectedNavLink>
```

### Issue: TypeScript errors after upgrade

**Cause:** Your IDE may have cached the old type definitions.

**Solution:** Restart your TypeScript server or IDE.

---

## Performance Considerations

### Both components are optimized for performance:

1. **Memoized permission checks** - Results are cached per render
2. **Efficient permission validation** - Uses authStore and departmentContext hooks
3. **Minimal re-renders** - Only re-renders when permissions or props change

### Best Practices:

```typescript
// ✅ Good - Single render when permissions change
<ProtectedNavLink
  to="/courses"
  requiredPermission="content:courses:read"
>
  Courses
</ProtectedNavLink>

// ✅ Good - Permissions array is memoized
const permissions = useMemo(() => ['perm1', 'perm2'], []);
<ProtectedLink requiredPermissions={permissions}>Link</ProtectedLink>

// ⚠️ Less ideal - Creates new array on every render
<ProtectedLink requiredPermissions={['perm1', 'perm2']}>Link</ProtectedLink>
// (Still works, but causes more memoization cache misses)
```

---

## Summary

### Key Takeaways

1. **v2.0.0 fixes the multiple permission bug** - All permissions are now checked correctly
2. **100% backward compatible** - Single permission usage unchanged
3. **ProtectedNavLink is new** - Use it for navigation menus with active styling
4. **Test multiple permission scenarios** - Verify AND/OR logic works as expected
5. **Migrate from ProtectedLinkMultiple** - It's now deprecated

### Quick Reference

```typescript
// Single permission
<ProtectedLink to="/page" requiredPermission="perm">Link</ProtectedLink>

// Multiple (OR) - user needs ANY permission
<ProtectedLink to="/page" requiredPermissions={['perm1', 'perm2']}>Link</ProtectedLink>

// Multiple (AND) - user needs ALL permissions
<ProtectedLink to="/page" requiredPermissions={['perm1', 'perm2']} requireAll={true}>
  Link
</ProtectedLink>

// Navigation with active state
<ProtectedNavLink
  to="/page"
  requiredPermission="perm"
  className={({ isActive }) => isActive ? 'active' : 'inactive'}
>
  Nav Link
</ProtectedNavLink>
```

---

## Questions or Issues?

If you encounter any issues during migration, please:

1. Check this guide's Troubleshooting section
2. Review the test cases in `ProtectedLink.test.tsx` and `ProtectedNavLink.test.tsx`
3. Consult the API contracts in `UI_AUTHORIZATION_IMPLEMENTATION_GUIDE.md`
4. Contact the UI Authorization team (Track 2B)

---

**Version:** 2.0.0
**Last Updated:** 2026-01-11
**Maintainer:** Track 2B - Navigation Engineer
