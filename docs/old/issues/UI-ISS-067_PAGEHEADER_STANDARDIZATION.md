# UI-ISS-067: Standardize Page Headers to Use PageHeader Component

**Status**: Completed
**Created**: 2026-01-22
**Completed**: 2026-01-22

## Summary

Replace inline `<h1>` headers across all pages with the standardized `PageHeader` component from `@/shared/ui/page-header`.

## Problem

Multiple pages were using inconsistent inline header patterns:
- Different class combinations for title styling
- Inconsistent description text positioning
- Duplicate styling code across pages

## Solution

Use the shared `PageHeader` component which provides:
- Consistent title styling (`text-3xl font-bold tracking-tight`)
- Optional description text
- Support for action buttons via `children` prop
- Support for back navigation via `backButton` prop

## Pages Updated

### Admin Pages (5)
- `src/pages/admin/audit/AuditLogsPage.tsx`
- `src/pages/admin/audit/AuditLogDetailPage.tsx`
- `src/pages/admin/settings/AppearanceSettingsPage.tsx`
- `src/pages/admin/settings/NotificationSettingsPage.tsx`
- `src/pages/admin/settings/SecuritySettingsPage.tsx`

### Learner Pages (6)
- `src/pages/learner/catalog/CourseCatalogPage.tsx`
- `src/pages/learner/certificates/CertificatesPage.tsx`
- `src/pages/learner/courses/MyCoursesPage.tsx`
- `src/pages/learner/dashboard/LearnerDashboardPage.tsx`
- `src/pages/learner/learning/MyLearningPage.tsx`
- `src/pages/learner/progress/ProgressDashboardPage.tsx`

### Staff Pages (1)
- `src/pages/staff/courses/ModuleEditorPage.tsx`

### Profile Pages (2)
- `src/pages/profile/ProfilePage.tsx`
- `src/pages/profile/ProfilePageV2.tsx`

**Total: 14 pages updated**

## Pages Intentionally Skipped

The following pages were reviewed but not updated due to specialized layouts:

### Dynamic Title Pages
- Course preview/detail pages with course names in titles
- Department pages with dynamic badges/indicators
- User detail pages with dynamic user names

### Specialized Layouts
- `CertificateVerificationPage.tsx` - Public page with centered header design
- Pages with conditional/complex header rendering

## PageHeader Component Usage

```tsx
import { PageHeader } from '@/shared/ui/page-header';

// Basic usage
<PageHeader
  title="Page Title"
  description="Optional description text"
/>

// With action buttons
<PageHeader
  title="My Profile"
  description="View and manage your personal information"
>
  <Button onClick={handleAction}>
    Action
  </Button>
</PageHeader>

// With back button
<PageHeader
  title="Module Editor"
  description="Organize lessons and configure completion settings"
  backButton={
    <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back
    </Button>
  }
/>
```

## Related Issues
- UI-ISS-066: StaffReportsPage missing PageHeader import (fixed)
