# Session: 2026-02-05 - Navigation & Dashboard Redesign Plan

**Date:** 2026-02-05
**Duration:** Planning session
**Tags:** #session #navigation #dashboard #redesign #planning

## Objective

Complete redesign of the navigation architecture across Staff, Learner, and Admin dashboards to eliminate duplicate links, implement task-based organization, and introduce breadcrumb-style department/subdepartment navigation.

## Current State Problems

| Issue | Impact |
|-------|--------|
| **Duplicate links** | "Analytics" appears 3x on staff dashboard |
| **Mixed mental models** | Global vs personal vs department-scoped confuses users |
| **Learner items shown to staff** | BASE_NAV shows disabled learner-only items |
| **Nested department accordions** | 4-5 clicks to reach common actions |
| **Hardcoded dashboard data** | LearnerDashboardPage shows all zeros |
| **Missing page implementations** | Department-scoped learner routes don't exist |
| **Redundant Quick Actions** | Every link duplicates sidebar |

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Task-based navigation sections | Group by what users DO, not data types |
| Breadcrumb department selector | Flat navigation, 1-2 clicks instead of 4-5 |
| Remove BASE_NAV_ITEMS | Role-specific sections, no disabled items for wrong roles |
| Contextual quick actions | Verbs with real data, not navigation duplicates |
| Universal section structure | Consistent patterns across all dashboards |

## Design: Universal Section Structure

```
OVERVIEW           -> Dashboard, Calendar (always)
PRIMARY WORKFLOW   -> Role's main tasks
SECONDARY WORKFLOW -> Supporting tasks
INSIGHTS           -> Analytics/Reports
DEPARTMENT         -> Breadcrumb selector + flat action list
FOOTER             -> Profile, Settings
```

## Implementation Phases

### Phase 1: Navigation Config Restructure
- Create `STAFF_SECTIONS`, `LEARNER_SECTIONS`, `ADMIN_SECTIONS` configs
- Remove `BASE_NAV_ITEMS` (distribute to sections)
- Create `FOOTER_NAV_ITEMS` for Profile/Settings

### Phase 2: Department Breadcrumb Selector
- Build `DepartmentBreadcrumbSelector` component
- Add subdepartment path state to navigation store
- Update URL patterns for subdepartments

### Phase 3: Dashboard Quick Actions
- Remove duplicate navigation Quick Actions
- Create `useQuickActions(role)` hook with real data
- Add contextual action components

### Phase 4: Dashboard Data Integration
- Connect LearnerDashboardPage to real API hooks
- Add loading states and empty states

### Phase 5: Missing Route Implementations
- Implement `DepartmentCoursesPage`, `DepartmentEnrollmentsPage`, `DepartmentProgressPage` for learners

## Files to Create

| File | Purpose |
|------|---------|
| `src/widgets/sidebar/ui/DepartmentBreadcrumbSelector.tsx` | Breadcrumb department selector |
| `src/widgets/sidebar/config/sectionConfig.ts` | Section-based nav configuration |
| `src/pages/learner/departments/DepartmentCoursesPage.tsx` | Learner dept courses |
| `src/pages/learner/departments/DepartmentEnrollmentsPage.tsx` | Learner dept enrollments |
| `src/pages/learner/departments/DepartmentProgressPage.tsx` | Learner dept progress |

## Files to Modify

| File | Changes |
|------|---------|
| `src/widgets/sidebar/config/navItems.ts` | Restructure to sections, remove BASE_NAV |
| `src/widgets/sidebar/Sidebar.tsx` | Section-based rendering, breadcrumb integration |
| `src/shared/stores/navigationStore.ts` | Add subdepartment path state |
| `src/app/router/index.tsx` | Add subdepartment routes, learner dept routes |
| `src/pages/staff/dashboard/StaffDashboardPage.tsx` | Contextual quick actions |
| `src/pages/learner/dashboard/LearnerDashboardPage.tsx` | Real data + contextual actions |
| `src/pages/admin/dashboard/AdminDashboardPage.tsx` | Contextual quick actions |

## API Support Confirmed

The backend fully supports department hierarchy via `departments.contract.ts`:

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v2/departments/:id/hierarchy` | Returns `ancestors[]`, `current`, `children[]` |
| `GET /api/v2/departments?parentId=X` | Filter by parent |
| Department fields | `parentId`, `level` (1-5), `hasChildren`, `childCount` |

## Success Criteria

- [ ] Zero duplicate links on any dashboard
- [ ] Department actions reachable in 1-2 clicks (down from 4-5)
- [ ] No disabled items for wrong user roles
- [ ] All quick actions are contextual verbs
- [ ] LearnerDashboardPage shows real data
- [ ] Subdepartment navigation works with breadcrumbs
- [ ] All existing tests pass

## Open Items

- [x] Implement Phase 1: Navigation Config Restructure (COMPLETED 2026-02-05)
- [x] Implement Phase 2: Department Breadcrumb Selector (COMPLETED 2026-02-05)
- [x] Implement Phase 3: Dashboard Quick Actions (COMPLETED 2026-02-05)
- [x] Implement Phase 4: Dashboard Data Integration (COMPLETED 2026-02-05)
- [x] Implement Phase 5: Missing Route Implementations (COMPLETED 2026-02-05)
- [x] Create formal ADR after implementation (ADR-UI-003)

## Phase 1 Completion Notes

**Files Created:**
- `src/widgets/sidebar/config/sectionConfig.ts` - New section-based nav configuration

**Files Modified:**
- `src/widgets/sidebar/Sidebar.tsx` - Refactored to use section-based rendering
- `src/widgets/sidebar/index.ts` - Added new exports, kept legacy for backward compatibility

**Key Changes:**
- Created `STAFF_SECTIONS`, `LEARNER_SECTIONS`, `ADMIN_SECTIONS` configs
- Universal section structure: Overview, Primary, Secondary, Insights, Department, Footer
- Removed BASE_NAV_ITEMS usage (distributed to appropriate sections)
- Department actions now flat list (no more nested accordion groups)
- Footer section with Profile/Settings fixed at bottom

## Phase 2 Completion Notes

**Files Created:**
- `src/widgets/sidebar/ui/DepartmentBreadcrumbSelector.tsx` - Breadcrumb navigation component

**Files Modified:**
- `src/shared/stores/navigationStore.ts` - Added breadcrumb state and actions
- `src/widgets/sidebar/Sidebar.tsx` - Integrated breadcrumb selector

**Key Changes:**
- Added `departmentPath[]` and `isBreadcrumbMode` state to navigation store
- Added `navigateToDepartment`, `navigateUp`, `clearDepartmentPath` actions
- DepartmentBreadcrumbSelector uses `useDepartmentHierarchy` hook for hierarchy data
- Shows ancestors trail + children for drill-down navigation
- Replaces nested accordions with flat 1-2 click navigation

## Phase 3 Completion Notes

**Files Created:**
- `src/features/quick-actions/hooks/useQuickActions.ts` - Hook for contextual quick actions
- `src/features/quick-actions/ui/QuickActionsCard.tsx` - Card component for displaying actions
- `src/features/quick-actions/index.ts` - Feature index

**Files Modified:**
- `src/pages/staff/dashboard/StaffDashboardPage.tsx` - Now uses QuickActionsCard

**Key Changes:**
- Created `useQuickActions(role)` hook that provides verb-based contextual actions
- Actions are tasks (e.g., "Grade 5 pending submissions"), NOT navigation duplicates
- Actions show counts and urgency levels (urgent/normal/low)
- Supports staff, learner, and admin roles
- Uses real enrollment data for learners, mock data for staff/admin (ready for API hooks)

## Phase 4 Completion Notes

**Files Modified:**
- `src/pages/learner/dashboard/LearnerDashboardPage.tsx` - Complete rewrite with real API data

**Key Changes:**
- LearnerDashboardPage now uses `useMyEnrollments` and `useCertificates` hooks
- Stats (Active Courses, Completed, Certificates, Average Progress) from real data
- "Continue Learning" section shows in-progress courses with progress bars
- "Recent Activity" section shows enrollments sorted by last activity
- Added loading states with skeletons
- Added error handling for API failures
- Integrated QuickActionsCard component

## Phase 5 Completion Notes

**Files Created:**
- `src/pages/learner/departments/LearnerDepartmentCoursesPage.tsx` - Browse dept courses
- `src/pages/learner/departments/LearnerDepartmentEnrollmentsPage.tsx` - View enrollments
- `src/pages/learner/departments/LearnerDepartmentProgressPage.tsx` - Progress overview
- `src/pages/learner/departments/index.ts` - Exports

**Files Modified:**
- `src/app/router/index.tsx` - Added learner department routes

**Key Changes:**
- Created 3 learner department pages following staff page patterns
- All pages use `useDepartmentContext` for department switching
- Pages include breadcrumb navigation, loading states, error handling
- Routes: `/learner/departments/:deptId/courses`, `/enrollments`, `/progress`

## Implementation Complete

All 5 phases of the Navigation Redesign are complete:
1. Section-based navigation config
2. Breadcrumb department selector
3. Contextual quick actions
4. Learner dashboard with real API data
5. Learner department pages

**Next Steps:**
- Create formal ADR documenting the new navigation architecture
- Run full test suite to ensure no regressions
- Manual testing of all new routes and components

## Related

- ADR Suggestion: [[../../dev_communication/architecture/suggestions/2026-02-05_ui_navigation-architecture-redesign]]

## Links

- Memory log: [[../memory-log]]
