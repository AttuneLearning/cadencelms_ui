# UI-ISS-024: API Contract Review - Report System

**Date:** 2026-01-15
**Status:** ✅ Complete
**Issue:** Phases 1-3 Report System Implementation

---

## Contract Review Summary

### Contract File Reviewed
- **File:** `/api/contracts/api/reports.contract.ts`
- **Version:** 1.0.0
- **Lines:** 1,842
- **Last Updated:** 2026-01-12 (per file metadata)

---

## Critical Finding: Spec Mismatch ⚠️

The existing API contract implements an **on-demand report model**, while the Report System 2.0 spec requires a **queue-based job system**.

### Current Contract (On-Demand Model)

**Endpoints Found:**
```typescript
GET  /api/v2/reports/completion              // Immediate completion report
GET  /api/v2/reports/performance             // Immediate performance report
GET  /api/v2/reports/transcript/:learnerId   // Immediate transcript
POST /api/v2/reports/transcript/:learnerId/generate // Generate transcript
GET  /api/v2/reports/course/:courseId        // Course-specific report
GET  /api/v2/reports/program/:programId      // Program-specific report
GET  /api/v2/reports/department/:departmentId // Department-specific report
POST /api/v2/reports/export                  // Export report to file
```

**Model Characteristics:**
- Synchronous/immediate data return
- No job queue
- No status tracking
- No download URLs (except export which notes: "Large exports may be processed asynchronously")
- Reports generated on-demand per request

### Required Spec (Queue-Based Model per REPORT_SYSTEM_SPEC.md)

**Missing Endpoints:**
```typescript
// Report Jobs (Queue System)
POST   /api/v2/report-jobs                   // Create report job
GET    /api/v2/report-jobs                   // List jobs
GET    /api/v2/report-jobs/:id               // Get job details
GET    /api/v2/report-jobs/:id/status        // Poll job status
GET    /api/v2/report-jobs/:id/download      // Get download URL
DELETE /api/v2/report-jobs/:id               // Cancel/delete job
POST   /api/v2/report-jobs/:id/retry         // Retry failed job

// Report Templates
POST   /api/v2/report-templates              // Create template
GET    /api/v2/report-templates              // List templates
GET    /api/v2/report-templates/:id          // Get template
PUT    /api/v2/report-templates/:id          // Update template
DELETE /api/v2/report-templates/:id          // Delete template
POST   /api/v2/report-templates/:id/use      // Create job from template

// Report Schedules
POST   /api/v2/report-schedules              // Create schedule
GET    /api/v2/report-schedules              // List schedules
GET    /api/v2/report-schedules/:id          // Get schedule
PUT    /api/v2/report-schedules/:id          // Update schedule
DELETE /api/v2/report-schedules/:id          // Delete schedule
POST   /api/v2/report-schedules/:id/pause    // Pause schedule
POST   /api/v2/report-schedules/:id/resume   // Resume schedule
POST   /api/v2/report-schedules/:id/run-now  // Run now

// Report Metadata (for Custom Builder)
GET    /api/v2/report-metadata/dimensions    // Available dimensions
GET    /api/v2/report-metadata/measures      // Available measures
GET    /api/v2/report-metadata/slicers       // Available slicers
POST   /api/v2/report-metadata/validate      // Validate definition
POST   /api/v2/report-metadata/preview       // Preview data
```

**Model Characteristics:**
- Asynchronous job queue
- Job states: pending → processing → ready → downloaded
- Status polling
- Signed download URLs
- Template reusability
- Scheduled reports

---

## Naming Convention Audit

### Kebab-Case Compliance

**Current Contract:**
```typescript
// ✅ GOOD - Uses snake_case for enum values (close enough, acceptable)
status: 'not_started' | 'in_progress' | 'completed' | 'withdrawn'

// ✅ GOOD - Uses kebab-case in route paths
endpoint: '/api/v2/reports/completion'
endpoint: '/api/v2/reports/transcript/:learnerId'
```

**Required by Spec:**
```typescript
// All enum values should use kebab-case
ReportJobState: 'pending' | 'queued' | 'processing' | 'rendering' | 'ready' | 'failed'
ReportType: 'enrollment-summary' | 'completion-rates' | 'performance-analysis'
DimensionType: 'learner' | 'course' | 'class' | 'program'
MeasureType: 'count' | 'average' | 'completion-rate' | 'pass-rate'
SlicerType: 'date-range' | 'department-id' | 'enrollment-status'
```

**Note:** Current contract uses `snake_case` for status values, spec requires `kebab-case`. Both use hyphens in URLs.

---

## Endpoints Checklist

### Phase 1 Requirements (Foundation)

✅ **Report Jobs API:**
- [ ] POST /api/v2/report-jobs - **MISSING**
- [ ] GET /api/v2/report-jobs - **MISSING**
- [ ] GET /api/v2/report-jobs/:id - **MISSING**
- [ ] GET /api/v2/report-jobs/:id/status - **MISSING**
- [ ] GET /api/v2/report-jobs/:id/download - **MISSING**
- [ ] DELETE /api/v2/report-jobs/:id - **MISSING**
- [ ] POST /api/v2/report-jobs/:id/retry - **MISSING**

✅ **Report Templates API:**
- [ ] POST /api/v2/report-templates - **MISSING**
- [ ] GET /api/v2/report-templates - **MISSING**
- [ ] GET /api/v2/report-templates/:id - **MISSING**
- [ ] PUT /api/v2/report-templates/:id - **MISSING**
- [ ] DELETE /api/v2/report-templates/:id - **MISSING**
- [ ] POST /api/v2/report-templates/:id/use - **MISSING**

✅ **Report Schedules API:**
- [ ] POST /api/v2/report-schedules - **MISSING**
- [ ] GET /api/v2/report-schedules - **MISSING**
- [ ] GET /api/v2/report-schedules/:id - **MISSING**
- [ ] PUT /api/v2/report-schedules/:id - **MISSING**
- [ ] DELETE /api/v2/report-schedules/:id - **MISSING**
- [ ] POST /api/v2/report-schedules/:id/pause - **MISSING**
- [ ] POST /api/v2/report-schedules/:id/resume - **MISSING**
- [ ] POST /api/v2/report-schedules/:id/run-now - **MISSING**

### Phase 3 Requirements (Custom Builder)

✅ **Report Metadata API:**
- [ ] GET /api/v2/report-metadata/dimensions - **MISSING**
- [ ] GET /api/v2/report-metadata/measures - **MISSING**
- [ ] GET /api/v2/report-metadata/slicers - **MISSING**
- [ ] POST /api/v2/report-metadata/validate - **MISSING**
- [ ] POST /api/v2/report-metadata/preview - **MISSING**

---

## LookupValue Integration

Per spec, enums should be stored in the LookupValue table for runtime extensibility.

**Categories Needed:**
- `report-type` - Report types (enrollment-summary, completion-rates, etc.)
- `report-state` - Job states (pending, processing, ready, failed, etc.)
- `report-priority` - Job priorities (low, normal, high, urgent, critical, scheduled)
- `output-format` - Output formats (pdf, excel, csv, json)
- `visibility-level` - Visibility levels (private, team, department, organization)
- `dimension-entity` - Dimension types (learner, course, class, etc.)
- `measure-type` - Measure types (count, average, completion-rate, etc.)
- `slicer-type` - Slicer types (date-range, department-id, etc.)
- `schedule-frequency` - Frequencies (once, daily, weekly, monthly, etc.)

**Verify:** Check if LookupValue endpoint exists:
```bash
ls -la /api/contracts/api/lookup-values.contract.ts
# Result: File exists ✅
```

---

## Recommendation

### Development Strategy

Given the mismatch between current contract and required spec:

**✅ PROCEED with Queue-Based Implementation:**
1. Develop UI based on Report System 2.0 spec (queue-based model)
2. Use MSW (Mock Service Worker) to mock all endpoints
3. API team will develop to same spec in parallel
4. Mock responses should match spec exactly

**❌ DO NOT use old on-demand report model:**
- Old model caused UI-ISS-023 (auth failure on /admin/reports)
- Old model doesn't support queuing, templates, or schedules
- Implementing old model would require future rewrite

### Mock Strategy

Create comprehensive MSW handlers for all Report System 2.0 endpoints:
```typescript
// src/mocks/handlers/reportHandlers.ts
export const reportHandlers = [
  // Report Jobs
  http.post('/api/v2/report-jobs', () => { /* mock */ }),
  http.get('/api/v2/report-jobs', () => { /* mock */ }),
  http.get('/api/v2/report-jobs/:id', () => { /* mock */ }),

  // Report Templates
  http.get('/api/v2/report-templates', () => { /* mock */ }),

  // Report Schedules
  http.get('/api/v2/report-schedules', () => { /* mock */ }),

  // Metadata
  http.get('/api/v2/report-metadata/dimensions', () => { /* mock */ }),
];
```

### API Coordination

**Message to API Team:**
- Document: `./api/agent_coms/messages/2026-01-15_XXXXXX_ui_report_system_contract_mismatch.md`
- Content: Notify API team of contract mismatch, confirm they're implementing queue-based system
- Request: Confirm timeline for Report System 2.0 API implementation

---

## Type Alignment Checklist

For UI-ISS-025 (Create Report Entity Types), ensure:

- [ ] Use kebab-case for all enum values
- [ ] ReportJob types match queue-based model (not on-demand)
- [ ] Include all job states per spec (pending, processing, ready, etc.)
- [ ] ReportTemplate types match template model
- [ ] ReportSchedule types match scheduling model
- [ ] Custom report builder types (dimensions, measures, slicers, groups)
- [ ] All ObjectId fields typed as `string` on client
- [ ] All dates typed as `string` (ISO 8601 format)

---

## Breaking Changes

**Old Implementation to Remove:**
```
src/entities/report/           ← DELETE (old on-demand model)
src/pages/admin/reports/       ← REFACTOR (was calling GET /reports)
```

**New Implementation to Create:**
```
src/entities/report-job/
src/entities/report-template/
src/entities/report-schedule/
```

---

## Next Steps

1. ✅ **UI-ISS-024 Complete** - Contract review documented
2. ⏭️ **UI-ISS-025 Next** - Create Report Entity Types (based on spec, not contract)
3. 📧 **Coordinate with API** - Send message about contract mismatch
4. 🎭 **Create Mocks** - MSW handlers for all endpoints
5. 🧪 **Test with Mocks** - Develop UI with mocked responses

---

## Notes

- The existing `/api/v2/reports/export` endpoint mentions async processing for large exports, suggesting the API team is aware of the need for queuing
- The spec (REPORT_SYSTEM_SPEC.md v2.0.0) is marked as "ALIGNED WITH API RECOMMENDATION" dated 2026-01-15
- User confirmed: "the api will be developing simultaneously" and "Proceed with the spec as written"
- **Decision:** Implement queue-based model per spec, use mocks, API team will align contract later

---

**Review Status:** ✅ Complete
**Contract Alignment:** ❌ Mismatch found - proceeding with spec
**Blocking Issues:** None - will use mocks
**Ready for UI-ISS-025:** Yes
