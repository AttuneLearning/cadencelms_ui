# Report System 2.0 - Parallel Optimized Implementation Plan

**Version:** 1.0.0
**Created:** 2026-01-15
**Status:** Ready for Implementation
**Working Directory:** `/home/adam/github/cadencelms_ui` (STRICTLY ENFORCED)
**API Coordination:** Parallel development to same spec
**Approach:** Breaking changes preferred over backwards compatibility

---

## Executive Summary

This plan implements the Report System 2.0 across 17 issues (UI-ISS-022 through UI-ISS-038) organized into 4 phases with maximum parallelization. Each phase includes comprehensive testing and concludes with an implementation report.

**Total Estimated Time:**
- **Sequential:** ~120 hours (3 weeks)
- **With Parallelization:** ~68 hours (1.7 weeks)
- **Efficiency Gain:** 43% reduction

**UI-ISS-023 Strategy:** Paused - will be automatically resolved by UI-ISS-028 or addressed at end if still present.

---

## Phase Structure

```
Phase 1: Foundation (Sequential)          │ 20 hours │ Week 1
Phase 2: Core UI (3-way parallel)         │ 24 hours │ Week 1-2
Phase 3: Advanced Features (2-way parallel)│ 32 hours │ Week 2-3
Phase 4: Polish & Testing (2-way parallel) │ 24 hours │ Week 3
```

---

## Phase 1: Foundation - Types, API, Hooks

**Duration:** 20 hours (Sequential - dependencies require serial execution)
**Team:** Single agent (foundation-builder)
**Parallelization:** None (each issue depends on previous)

### Issues

| Issue | Title | Hours | Depends On | Tests Required |
|-------|-------|-------|------------|----------------|
| UI-ISS-024 | API Contract Review | 2 | - | Contract alignment check |
| UI-ISS-025 | Create Report Entity Types | 6 | UI-ISS-024 | Type validation tests |
| UI-ISS-026 | Create Report API Functions | 6 | UI-ISS-025 | API client tests with MSW |
| UI-ISS-027 | Create React Query Hooks | 6 | UI-ISS-026 | Hook tests with React Query testing |

### Deliverables

**UI-ISS-024: API Contract Review**
- [ ] Review all API contract files in `./api/contracts/api/`
- [ ] Verify kebab-case conventions aligned
- [ ] Document any mismatches in implementation report
- [ ] Create checklist of endpoints to implement

**UI-ISS-025: Create Report Entity Types**
```
src/entities/report-job/
├── model/
│   ├── types.ts
│   ├── reportJobKeys.ts
│   └── __tests__/types.test.ts
└── index.ts

src/entities/report-template/
├── model/
│   ├── types.ts
│   ├── reportTemplateKeys.ts
│   └── __tests__/types.test.ts
└── index.ts

src/entities/report-schedule/
├── model/
│   ├── types.ts
│   ├── reportScheduleKeys.ts
│   └── __tests__/types.test.ts
└── index.ts

src/shared/types/
└── report-builder.ts (CustomReportDefinition and all builder types)
```

**UI-ISS-026: Create Report API Functions**
```
src/entities/report-job/api/
├── reportJobApi.ts
└── __tests__/reportJobApi.test.ts

src/entities/report-template/api/
├── reportTemplateApi.ts
└── __tests__/reportTemplateApi.test.ts

src/entities/report-schedule/api/
├── reportScheduleApi.ts
└── __tests__/reportScheduleApi.test.ts
```

**UI-ISS-027: Create React Query Hooks**
```
src/entities/report-job/hooks/
├── useReportJobs.ts
├── useReportJob.ts
├── useReportJobPolling.ts
├── useCreateReportJob.ts
├── useCancelReportJob.ts
├── useDeleteReportJob.ts
├── index.ts
└── __tests__/
    ├── useReportJobs.test.ts
    └── useReportJobPolling.test.ts

src/entities/report-template/hooks/
├── useReportTemplates.ts
├── useMyReportTemplates.ts
├── useSystemReportTemplates.ts
├── useCreateReportTemplate.ts
├── useCreateTemplateFromJob.ts
├── index.ts
└── __tests__/useReportTemplates.test.ts

src/entities/report-schedule/hooks/
├── useReportSchedules.ts
├── useCreateReportSchedule.ts
├── usePauseReportSchedule.ts
├── useResumeReportSchedule.ts
├── index.ts
└── __tests__/useReportSchedules.test.ts
```

### Testing Requirements

**Type Tests (UI-ISS-025):**
- Validate all types match API contracts
- Test type guards if any
- Ensure proper exports from index files

**API Tests (UI-ISS-026):**
- Mock API responses with MSW
- Test success scenarios
- Test error handling (404, 401, 500)
- Test request payload formatting
- Verify correct endpoints called

**Hook Tests (UI-ISS-027):**
- Test query hooks with React Query testing utilities
- Test mutation hooks (create, update, delete)
- Test polling behavior (start, stop, complete states)
- Test cache invalidation after mutations
- Test loading/error states

### Breaking Changes

**Remove Old Report Implementation:**
- Delete `src/entities/report/` (old implementation)
- Remove report routes from `src/app/router/index.tsx` temporarily
- Comment out report nav items in sidebar config
- Document removed routes in implementation report

### Test Execution

```bash
# After each issue completion
npm run test -- src/entities/report-job --coverage
npm run test -- src/entities/report-template --coverage
npm run test -- src/entities/report-schedule --coverage

# Phase 1 complete - run all entity tests
npm run test -- src/entities/report-* --coverage
```

**Acceptance Criteria:**
- [ ] All tests passing
- [ ] Coverage >80% for entities
- [ ] No TypeScript errors
- [ ] All types use kebab-case
- [ ] Hooks work with mocked API

---

## Phase 2: Core UI - Job Queue, Templates, Dashboard

**Duration:** 24 hours (8 hours per agent with 3-way parallelization)
**Team:** 3 agents working in parallel
- Agent A: ui-jobs-specialist (UI-ISS-028 + UI-ISS-033)
- Agent B: ui-templates-specialist (UI-ISS-029)
- Agent C: ui-dashboard-specialist (UI-ISS-030 + UI-ISS-034)

**Parallelization Strategy:** All 3 issues depend only on Phase 1, no inter-dependencies

### Issues

| Issue | Title | Hours | Agent | Depends On | Tests |
|-------|-------|-------|-------|------------|-------|
| UI-ISS-028 | Build Report Job Queue UI | 12 | A | Phase 1 | Component + integration |
| UI-ISS-029 | Build Report Templates UI | 10 | B | Phase 1 | Component + integration |
| UI-ISS-030 | Build Report Schedules UI | 10 | C | Phase 1 | Component + integration |

### Deliverables

**UI-ISS-028: Report Job Queue UI (Agent A)**
```
src/pages/admin/reports/
├── ReportJobsPage.tsx (list view)
├── ReportJobDetailPage.tsx (detail view)
└── __tests__/
    ├── ReportJobsPage.test.tsx
    └── ReportJobDetailPage.test.tsx

src/features/report-jobs/
└── ui/
    ├── ReportJobsTable.tsx
    ├── ReportJobCard.tsx
    ├── JobStatusBadge.tsx
    ├── JobProgressBar.tsx
    ├── JobActionsMenu.tsx
    ├── CreateReportJobDialog.tsx
    └── __tests__/
        ├── ReportJobsTable.test.tsx
        └── CreateReportJobDialog.test.tsx
```

**Features:**
- List all report jobs with status/progress
- Real-time status polling for active jobs
- Download button when ready
- Retry/cancel/delete actions
- Create new report job dialog

**UI-ISS-029: Report Templates UI (Agent B)**
```
src/pages/admin/reports/
├── ReportTemplatesPage.tsx
├── ReportTemplateDetailPage.tsx
└── __tests__/
    ├── ReportTemplatesPage.test.tsx
    └── ReportTemplateDetailPage.test.tsx

src/features/report-templates/
└── ui/
    ├── TemplateCard.tsx
    ├── TemplateGrid.tsx
    ├── TemplateFilters.tsx
    ├── CreateTemplateDialog.tsx
    ├── UseTemplateDialog.tsx
    └── __tests__/
        ├── TemplateCard.test.tsx
        └── CreateTemplateDialog.test.tsx
```

**Features:**
- Browse system templates
- Browse user templates
- Filter by category/tags
- Create template from job
- Use template to generate report

**UI-ISS-030: Report Schedules UI (Agent C)**
```
src/pages/admin/reports/
├── ReportSchedulesPage.tsx
├── ReportScheduleDetailPage.tsx
└── __tests__/
    ├── ReportSchedulesPage.test.tsx
    └── ReportScheduleDetailPage.test.tsx

src/features/report-schedules/
└── ui/
    ├── SchedulesList.tsx
    ├── ScheduleCard.tsx
    ├── CreateScheduleDialog.tsx
    ├── ScheduleForm.tsx
    ├── CronBuilder.tsx
    └── __tests__/
        ├── ScheduleCard.test.tsx
        └── CreateScheduleDialog.test.tsx
```

**Features:**
- List scheduled reports
- Create/edit/delete schedules
- Pause/resume schedules
- Run schedule now
- View next run time

### Routing Changes (All Agents)

**Remove old routes, add new ones:**

```typescript
// src/app/router/index.tsx

// REMOVE these old routes (breaking change):
// <Route path="/admin/reports" element={<ReportsPage />} />
// <Route path="/admin/reports/:id" element={<ReportViewerPage />} />
// <Route path="/admin/reports/builder" element={<ReportBuilderPage />} />

// ADD these new routes:
<Route path="/admin/reports" element={<ReportJobsPage />} />
<Route path="/admin/reports/jobs/:id" element={<ReportJobDetailPage />} />
<Route path="/admin/reports/templates" element={<ReportTemplatesPage />} />
<Route path="/admin/reports/templates/:id" element={<ReportTemplateDetailPage />} />
<Route path="/admin/reports/schedules" element={<ReportSchedulesPage />} />
<Route path="/admin/reports/schedules/:id" element={<ReportScheduleDetailPage />} />
<Route path="/admin/reports/builder" element={<CustomReportBuilderPage />} /> // Phase 3
```

### Sidebar Navigation Updates

```typescript
// src/widgets/sidebar/config/navItems.ts

// ADMIN_CONTEXT_NAV - Update reports section
{
  id: 'reports',
  label: 'Reports',
  icon: BarChart3,
  path: '/admin/reports',
  permission: 'reports:read'
},
{
  id: 'report-templates',
  label: 'Report Templates',
  icon: FileText,
  path: '/admin/reports/templates',
  permission: 'reports:read'
},
{
  id: 'report-schedules',
  label: 'Scheduled Reports',
  icon: Calendar,
  path: '/admin/reports/schedules',
  permission: 'reports:read'
},
{
  id: 'report-builder',
  label: 'Custom Report Builder',
  icon: Wrench,
  path: '/admin/reports/builder',
  permission: 'reports:create'
}
```

### Testing Requirements

**Component Tests:**
- Each component has unit tests
- Test user interactions (click, input, form submission)
- Test loading/error states
- Test permission-based rendering

**Integration Tests:**
- Full page rendering with mocked API
- Test navigation between pages
- Test form submission flows
- Test job status polling

**Test Execution:**
```bash
# Agent A
npm run test -- src/pages/admin/reports/ReportJobs*.test.tsx --coverage
npm run test -- src/features/report-jobs/ --coverage

# Agent B
npm run test -- src/pages/admin/reports/ReportTemplates*.test.tsx --coverage
npm run test -- src/features/report-templates/ --coverage

# Agent C
npm run test -- src/pages/admin/reports/ReportSchedules*.test.tsx --coverage
npm run test -- src/features/report-schedules/ --coverage

# Phase 2 complete - run all UI tests
npm run test -- src/pages/admin/reports/ --coverage
npm run test -- src/features/report-* --coverage
```

**Acceptance Criteria:**
- [ ] All component tests passing
- [ ] All pages render without errors
- [ ] Forms validate correctly
- [ ] Status polling works (can mock state changes)
- [ ] Coverage >75%
- [ ] No regressions in existing tests

---

## Phase 3: Advanced Features - Custom Report Builder

**Duration:** 32 hours (16 hours per agent with 2-way parallelization)
**Team:** 2 agents working in parallel
- Agent D: builder-ui-specialist (UI-ISS-031, UI-ISS-032)
- Agent E: builder-logic-specialist (UI-ISS-033, UI-ISS-034)

### Issues

| Issue | Title | Hours | Agent | Depends On | Tests |
|-------|-------|-------|-------|------------|-------|
| UI-ISS-031 | Custom Report Builder - Phase 1 (Foundations) | 12 | D | Phase 2 | Component tests |
| UI-ISS-032 | Custom Report Builder - Phase 2 (UI Polish) | 10 | D | UI-ISS-031 | Component tests |
| UI-ISS-033 | Report Job Status Polling | 4 | E | Phase 2 | Integration tests |
| UI-ISS-034 | Report File Download Logic | 6 | E | Phase 2 | Integration tests |

### Deliverables

**UI-ISS-031 & UI-ISS-032: Custom Report Builder (Agent D)**
```
src/pages/admin/reports/builder/
├── CustomReportBuilderPage.tsx
└── __tests__/
    └── CustomReportBuilderPage.test.tsx

src/features/report-builder/
├── lib/
│   ├── useReportBuilder.ts (state management)
│   ├── reportDefinitionSchema.ts (zod validation)
│   └── __tests__/
│       ├── useReportBuilder.test.ts
│       └── reportDefinitionSchema.test.ts
└── ui/
    ├── FieldPalette.tsx
    ├── ReportCanvas.tsx
    ├── DimensionSelector.tsx
    ├── MeasureSelector.tsx
    ├── SlicerSelector.tsx
    ├── GroupSelector.tsx
    ├── FilterPanel.tsx
    ├── FilterRow.tsx
    ├── ReportPreview.tsx
    ├── ExportOptions.tsx
    ├── SaveTemplateDialog.tsx
    └── __tests__/
        ├── FieldPalette.test.tsx
        ├── ReportCanvas.test.tsx
        ├── DimensionSelector.test.tsx
        └── ReportPreview.test.tsx
```

**Features:**
- Drag-and-drop field palette
- Canvas with drop zones (rows, columns, values, groups)
- Dimension/measure/slicer selection
- Filter configuration panel
- Live preview with sample data
- Export options (PDF, Excel, CSV, JSON)
- Save as template
- Validation with error messages

**UI-ISS-033: Report Job Status Polling (Agent E)**
```
src/features/report-jobs/
└── lib/
    ├── useJobPolling.ts
    ├── pollingUtils.ts
    └── __tests__/
        └── useJobPolling.test.ts
```

**Features:**
- Start/stop polling based on job state
- Poll every 2 seconds for active jobs
- Stop polling when job complete/failed
- Update UI in real-time
- Handle connection errors gracefully

**UI-ISS-034: Report File Download Logic (Agent E)**
```
src/features/report-jobs/
└── lib/
    ├── useReportDownload.ts
    ├── downloadUtils.ts
    └── __tests__/
        └── useReportDownload.test.ts
```

**Features:**
- Generate signed download URL
- Trigger browser download
- Track download count
- Handle expired URLs
- Show download progress if possible

### Testing Requirements

**Builder Tests (Agent D):**
- Test field palette rendering
- Test drag-and-drop (mock DnD events)
- Test dimension/measure selection
- Test filter configuration
- Test preview data rendering
- Test validation (Zod schema)
- Test save template flow

**Polling Tests (Agent E):**
- Test polling start/stop
- Test interval timing (mock timers)
- Test state transition handling
- Test error recovery

**Download Tests (Agent E):**
- Test URL generation
- Test browser download trigger
- Test error handling (expired URL, network error)

**Test Execution:**
```bash
# Agent D
npm run test -- src/pages/admin/reports/builder/ --coverage
npm run test -- src/features/report-builder/ --coverage

# Agent E
npm run test -- src/features/report-jobs/lib/ --coverage

# Phase 3 complete
npm run test -- src/features/report-builder/ --coverage
npm run test -- src/features/report-jobs/ --coverage
```

**Acceptance Criteria:**
- [ ] Custom report builder functional
- [ ] Can build report definition visually
- [ ] Preview shows sample data
- [ ] Validation prevents invalid definitions
- [ ] Polling works for job status updates
- [ ] Downloads work with signed URLs
- [ ] Coverage >75%

---

## Phase 4: Polish, Testing & Completion

**Duration:** 24 hours (12 hours per agent with 2-way parallelization)
**Team:** 2 agents working in parallel
- Agent F: polish-specialist (UI-ISS-035, UI-ISS-036)
- Agent G: qa-specialist (UI-ISS-037, UI-ISS-038)

### Issues

| Issue | Title | Hours | Agent | Depends On | Tests |
|-------|-------|-------|-------|------------|-------|
| UI-ISS-035 | Report Notifications | 6 | F | Phase 3 | Integration tests |
| UI-ISS-036 | Report Sharing & Permissions | 8 | F | Phase 3 | Integration tests |
| UI-ISS-037 | Report System Tests | 10 | G | Phase 3 | All test types |
| UI-ISS-038 | Testing & Polish | 16 | G | Phase 3 | E2E + accessibility |

### Deliverables

**UI-ISS-035: Report Notifications (Agent F)**
```
src/features/report-notifications/
└── ui/
    ├── NotificationSettings.tsx
    ├── EmailNotificationForm.tsx
    └── __tests__/
        └── NotificationSettings.test.tsx
```

**Features:**
- Configure email notifications
- In-app notification on job complete
- Notification preferences per report
- Test notification delivery

**UI-ISS-036: Report Sharing & Permissions (Agent F)**
```
src/features/report-sharing/
└── ui/
    ├── ShareReportDialog.tsx
    ├── VisibilitySelector.tsx
    ├── UserShareList.tsx
    └── __tests__/
        └── ShareReportDialog.test.tsx
```

**Features:**
- Set report visibility (private/team/department/organization)
- Share with specific users
- Permission checks (canViewReport, canEditReport)
- Access denied messaging

**UI-ISS-037 & UI-ISS-038: Comprehensive Testing (Agent G)**

**Test Categories:**
1. **Unit Tests** - All missing unit tests
2. **Integration Tests** - Full feature flows
3. **E2E Tests** - Critical user journeys
4. **Accessibility Tests** - WCAG compliance
5. **Performance Tests** - Bundle size, render time
6. **Regression Tests** - Ensure nothing broke

**E2E Test Scenarios:**
```typescript
// tests/e2e/reports/report-builder.spec.ts
describe('Report System E2E', () => {
  it('creates custom report from scratch', async () => {
    // Navigate to builder
    // Add dimension (learner)
    // Add measure (count)
    // Add filter (date range)
    // Generate report
    // Verify job created
    // Wait for completion
    // Download report
  });

  it('uses template to generate report', async () => {
    // Browse templates
    // Select "Enrollment Summary"
    // Customize date range
    // Generate
    // Verify job
  });

  it('creates scheduled report', async () => {
    // Select template
    // Create schedule (weekly)
    // Verify in schedules list
    // Pause schedule
    // Resume schedule
  });
});
```

**Accessibility Audit:**
- Screen reader compatibility
- Keyboard navigation
- Focus management
- Color contrast
- ARIA labels
- Form validation announcements

**Performance Checks:**
- Lighthouse score >80
- Bundle size <500KB for report feature
- Initial render <1s
- Job list renders <500ms

### Testing Requirements

**Phase 4 Full Test Suite:**
```bash
# Unit tests - all features
npm run test -- src/entities/report-* --coverage
npm run test -- src/features/report-* --coverage
npm run test -- src/pages/admin/reports/ --coverage

# Integration tests
npm run test:integration -- report-system

# E2E tests (if Playwright/Cypress setup exists)
npm run test:e2e -- reports

# Accessibility
npm run test:a11y -- admin/reports

# Performance
npm run build
npm run analyze
```

**Coverage Requirements:**
- Overall: >80%
- Entities: >85%
- Features: >80%
- Pages: >70%
- Critical paths: >90%

**Acceptance Criteria:**
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] E2E tests covering critical flows
- [ ] No accessibility violations
- [ ] Lighthouse score >80
- [ ] All known bugs fixed
- [ ] Implementation reports complete

---

## Breaking Changes Summary

### Removed (No Backwards Compatibility)

1. **Old Report Entity:**
   - `src/entities/report/` - Deleted entirely

2. **Old Report Pages:**
   - `src/pages/admin/reports/ReportsPage.tsx` (old version)
   - `src/pages/admin/reports/ReportViewerPage.tsx`
   - `src/pages/admin/reports/ReportBuilderPage.tsx` (old version)

3. **Old Report Routes:**
   - `/admin/reports` (old behavior - caused auth failure)
   - `/admin/reports/:id` (old viewer)

4. **Old Report API:**
   - `src/entities/report/api/reportsApi.ts` (GET /reports, etc.)

### Added (New Implementation)

1. **New Entities:**
   - `src/entities/report-job/`
   - `src/entities/report-template/`
   - `src/entities/report-schedule/`

2. **New Routes:**
   - `/admin/reports` → ReportJobsPage (list)
   - `/admin/reports/jobs/:id` → ReportJobDetailPage
   - `/admin/reports/templates` → ReportTemplatesPage
   - `/admin/reports/templates/:id` → ReportTemplateDetailPage
   - `/admin/reports/schedules` → ReportSchedulesPage
   - `/admin/reports/schedules/:id` → ReportScheduleDetailPage
   - `/admin/reports/builder` → CustomReportBuilderPage (new)

3. **New API Endpoints:**
   - `POST /api/v2/report-jobs`
   - `GET /api/v2/report-jobs`
   - `GET /api/v2/report-jobs/:id`
   - `GET /api/v2/report-jobs/:id/download`
   - Similar for templates and schedules

### Migration Notes

**There is no migration** - this is a complete replacement. Users will:
- Lose access to old reports (non-functional anyway)
- Need to recreate any saved reports as templates
- Benefit from queue-based system immediately

---

## Implementation Reports

### Report Requirements

After **each phase completion**, create an implementation report:

**Location:** `docs/impl_reports/REPORT_SYSTEM_PHASE_X_COMPLETION.md`

**Template:**
```markdown
# Report System Phase X - Implementation Report

**Phase:** [1/2/3/4]
**Completed:** YYYY-MM-DD
**Duration:** [Actual hours]
**Team:** [Agent names]

## Issues Completed

- [x] UI-ISS-XXX: [Title] - [Completion status]

## Deliverables

### Files Created
- `path/to/file.ts` - Description

### Files Modified
- `path/to/file.ts` - What changed

### Tests Added
- Test coverage: X%
- Test files: [list]

## Breaking Changes

[List any breaking changes introduced]

## Known Issues

[List any issues discovered but not blocking]

## Next Phase Dependencies

[What next phase needs from this phase]

## Test Results

```bash
# Test command output
```

## Performance Metrics

- Build time: X seconds
- Bundle size change: +X KB
- Test execution time: X seconds

## Notes

[Any additional context]
```

---

## Test Execution Summary

### Per-Phase Testing

**Phase 1:**
```bash
npm run test -- src/entities/report-*/model --coverage
npm run test -- src/entities/report-*/api --coverage
npm run test -- src/entities/report-*/hooks --coverage
```

**Phase 2:**
```bash
npm run test -- src/pages/admin/reports/ --coverage
npm run test -- src/features/report-jobs/ --coverage
npm run test -- src/features/report-templates/ --coverage
npm run test -- src/features/report-schedules/ --coverage
```

**Phase 3:**
```bash
npm run test -- src/features/report-builder/ --coverage
npm run test -- src/features/report-jobs/lib/ --coverage
```

**Phase 4:**
```bash
npm run test -- src/features/report-notifications/ --coverage
npm run test -- src/features/report-sharing/ --coverage
npm run test:integration
npm run test:e2e -- reports
```

### Final Test Run (Before Declaring Complete)

```bash
# Full test suite
npm run test --coverage

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Type check
npm run typecheck

# Lint
npm run lint

# Build
npm run build

# Accessibility audit (manual)
axe DevTools on all report pages
```

**Success Criteria:**
- [ ] All tests passing
- [ ] Coverage >80%
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] Build succeeds
- [ ] No accessibility violations

---

## Coordination with API Team

### Message Protocol

When API endpoints needed:
1. Check `./api/contracts/api/` for contract files
2. If endpoint missing, create coordination message:
   - `./api/agent_coms/messages/YYYY-MM-DD_HHMMSS_ui_request_UI-ISS-XXX.md`
3. Follow COORDINATION_STANDARD.md template
4. Continue with mocked endpoint
5. Update when API delivers

### Mocking Strategy

Use MSW (Mock Service Worker) for all API mocks:

```typescript
// src/mocks/handlers/reportHandlers.ts
import { http, HttpResponse } from 'msw';

export const reportHandlers = [
  http.get('/api/v2/report-jobs', () => {
    return HttpResponse.json({
      success: true,
      data: {
        jobs: mockReportJobs,
        pagination: mockPagination
      }
    });
  }),
  // ... other handlers
];
```

---

## Success Criteria - Final

### Phase 1 Complete ✅
- [ ] All types created with kebab-case
- [ ] API client functional with mocks
- [ ] Hooks work correctly
- [ ] Tests >80% coverage
- [ ] No TypeScript errors
- [ ] Implementation report published

### Phase 2 Complete ✅
- [ ] Report jobs page functional
- [ ] Templates page functional
- [ ] Schedules page functional
- [ ] Routes updated (old routes removed)
- [ ] Sidebar navigation updated
- [ ] Tests >75% coverage
- [ ] Implementation report published

### Phase 3 Complete ✅
- [ ] Custom report builder works
- [ ] Can build reports visually
- [ ] Preview shows data
- [ ] Polling works
- [ ] Downloads work
- [ ] Tests >75% coverage
- [ ] Implementation report published

### Phase 4 Complete ✅
- [ ] Notifications integrated
- [ ] Sharing/permissions work
- [ ] All tests passing (unit, integration, E2E)
- [ ] Accessibility compliant
- [ ] Performance acceptable
- [ ] Implementation report published
- [ ] UI-ISS-023 verified resolved (or fixed if still present)

---

## Timeline Estimate

| Week | Phase | Agent Work | Hours | Calendar Days |
|------|-------|------------|-------|---------------|
| Week 1 | Phase 1 | foundation-builder (solo) | 20 | 2.5 days |
| Week 1-2 | Phase 2 | 3 agents parallel | 24 (8 ea) | 1 day |
| Week 2-3 | Phase 3 | 2 agents parallel | 32 (16 ea) | 2 days |
| Week 3 | Phase 4 | 2 agents parallel | 24 (12 ea) | 1.5 days |
| **TOTAL** | | | **~68 hours** | **7 days** |

**With sequential execution:** 120 hours = 15 days
**With parallelization:** 68 hours = 7 days
**Efficiency gain:** 43% faster

---

## Working Directory Enforcement

**CRITICAL:** All work MUST occur in `/home/adam/github/cadencelms_ui/`

**Prohibited:**
- ❌ `/home/adam/github/cadencelms_api/`
- ❌ `/home/adam/github/lms_ui/`
- ❌ Any parent directories
- ❌ Any sibling projects

**Verification:**
```bash
# Verify current directory
pwd
# Should output: /home/adam/github/cadencelms_ui

# All file operations must use paths within this directory
```

---

## Next Steps

1. ✅ Review this plan
2. ⏳ Create team configuration for Report System
3. ⏳ Begin Phase 1 implementation
4. ⏳ Create implementation report after Phase 1
5. ⏳ Begin Phase 2 (3-way parallel)
6. ⏳ Continue through Phase 4
7. ⏳ Verify UI-ISS-023 resolved
8. ⏳ Final QA and deployment preparation

---

**Document Status:** Ready for Implementation
**Approval Required:** User approval to proceed
**Estimated Completion:** 7 calendar days with parallelization
