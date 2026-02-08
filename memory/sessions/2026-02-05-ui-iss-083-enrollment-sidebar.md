# Session: UI-ISS-083 - Department Enrollment Page Sidebar Link

**Date:** 2026-02-05
**Issue:** UI-ISS-083 - Department Enrollment Page Not Visible in Sidebar
**Status:** COMPLETE

---

## Summary

Added the "Course Enrollments" link to the sidebar's department actions section, making the enrollment management page (`/staff/departments/:deptId/enrollments`) accessible to staff with appropriate permissions.

---

## Files Modified

| File | Change |
|------|--------|
| `src/widgets/sidebar/config/sectionConfig.ts` | Added `UserPlus` icon import; added `dept-enrollments` entry to `DEPARTMENT_ACTIONS` array |
| `src/widgets/sidebar/__tests__/Sidebar.test.tsx` | Added 2 unit tests for enrollment link visibility |

---

## Configuration Added

```typescript
{
  id: 'dept-enrollments',
  label: 'Course Enrollments',
  pathTemplate: '/staff/departments/:deptId/enrollments',
  icon: UserPlus,
  requiredPermission: 'enrollment:department:manage',
  dashboards: ['staff'],
}
```

---

## Tests Written

1. `should show Course Enrollments link for users with enrollment:department:manage permission`
2. `should hide Course Enrollments link for users without enrollment:department:manage permission`

---

## Verification

- **TypeScript:** No errors in modified files
- **Unit Tests:** 78 tests pass (76 existing + 2 new)
- **All acceptance criteria met**

---

## Related

- **UI-ISS-082:** Course Enrollment Pages (parent feature)
- **API Response:** `2026-02-05_bulk-course-enrollment-response.md` - Bulk enrollment endpoint ready

---

## Patterns Used

- Section-based navigation configuration via `DEPARTMENT_ACTIONS` array
- Permission-controlled visibility via `requiredPermission` field
- Dashboard-scoped actions via `dashboards` array
