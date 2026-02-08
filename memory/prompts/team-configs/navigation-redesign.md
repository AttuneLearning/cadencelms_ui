# Team Config: Navigation & Dashboard Redesign

**Created:** 2026-02-05
**Status:** Active
**Tags:** #team-config #navigation #dashboard #redesign

## Overview

Configuration for the navigation architecture redesign across Staff, Learner, and Admin dashboards. Implements task-based navigation, breadcrumb department selector, and contextual quick actions.

## Context to Load

### Session Plan
- [[../../sessions/2026-02-05-navigation-dashboard-redesign]] - Full implementation plan

### Relevant ADRs
- **ADR-UI-001-FSD-ARCHITECTURE** - Layer rules (widgets, pages, shared)
- **ADR-UI-002-ERROR-HANDLING** - Error patterns for new components
- **ADR-UI-FORM-001-STANDARDIZED-FORM-PATTERN** - If forms needed in settings

### Pending Decisions
- `dev_communication/architecture/suggestions/2026-02-05_ui_navigation-architecture-redesign.md`

## Key Files

### Primary Targets
```
src/widgets/sidebar/
├── Sidebar.tsx                    # Main component - section rendering
├── config/navItems.ts             # RESTRUCTURE: section-based config
├── config/sectionConfig.ts        # NEW: section definitions
└── ui/DepartmentBreadcrumbSelector.tsx  # NEW: breadcrumb component

src/pages/
├── staff/dashboard/StaffDashboardPage.tsx
├── learner/dashboard/LearnerDashboardPage.tsx
├── admin/dashboard/AdminDashboardPage.tsx
└── learner/departments/           # NEW: 3 department pages
```

### Supporting Files
```
src/shared/stores/navigationStore.ts  # Add subdepartment state
src/app/router/index.tsx              # Add new routes
src/shared/contexts/DepartmentContext.tsx
```

## Implementation Phases

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Navigation Config Restructure | **COMPLETED** |
| 2 | Department Breadcrumb Selector | **COMPLETED** |
| 3 | Dashboard Quick Actions | **COMPLETED** |
| 4 | Dashboard Data Integration | **COMPLETED** |
| 5 | Missing Route Implementations | In Progress |

## API Endpoints (Already Available)

```
GET /api/v2/departments/:id/hierarchy  # ancestors[], current, children[]
GET /api/v2/departments?parentId=X     # Filter by parent
```

## API Team Coordination

The API team is polling for messages. If an API change is needed during implementation:

1. **Submit a message** via `/comms send` describing the required change
2. **Check for new contracts** in `cadencelms_api` after API team responds
3. **Check for released blocks** that may provide new hooks or types

This is a UI-only implementation by design, but if gaps are discovered, use this workflow.

## Design Principles

1. **Task-based organization** - Group by what users DO, not data types
2. **Flat department navigation** - Breadcrumb drill-down, no nested accordions
3. **Role-specific base nav** - Don't show disabled items for other roles
4. **Contextual quick actions** - Verbs (actions) not nouns (destinations)

## Section Structure (All Dashboards)

```
OVERVIEW           -> Dashboard, Calendar
PRIMARY WORKFLOW   -> Role's main tasks
SECONDARY WORKFLOW -> Supporting tasks
INSIGHTS           -> Analytics/Reports
DEPARTMENT         -> Breadcrumb selector + flat actions
FOOTER             -> Profile, Settings
```

## Success Criteria

- [ ] Zero duplicate links on any dashboard
- [ ] Department actions reachable in 1-2 clicks
- [ ] No disabled items for wrong user roles
- [ ] All quick actions are contextual verbs
- [ ] LearnerDashboardPage shows real data
- [ ] Subdepartment navigation works with breadcrumbs

## Session Commands

```bash
# Start of session
/recall navigation redesign

# Check architecture status
/adr

# After completing a phase
/reflect

# If new pattern discovered
/adr suggest

# Update session progress
/memory
```

## Links

- Memory log: [[../../memory-log]]
- Prompt registry: [[../prompt-registry]]
