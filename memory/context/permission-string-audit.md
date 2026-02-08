# Context: Permission String Audit

**Created:** 2026-02-05
**Tags:** #context #permissions #audit #api-mismatch

## Summary

Comprehensive audit of UI permission strings compared against API seed data.
Many permission strings in the UI do not match the actual permissions defined in the API.

## API Source of Truth

From `cadencelms_api/scripts/seed-role-definitions.ts`:

### Staff Roles

**instructor:**
- `content:courses:read`
- `content:lessons:read`
- `content:classes:read`
- `content:classes:manage-own`
- `enrollment:department:read`
- `learner:department:read`
- `reports:class:read`
- `reports:class:export`
- `grades:department:read`
- `grades:own-classes:manage`

**content-admin:**
- `content:courses:manage`
- `content:programs:manage`
- `content:lessons:manage`
- `content:exams:manage`
- `content:scorm:manage`
- `reports:content:read`
- `analytics:courses:read`
- `analytics:courses:export`

**department-admin:**
- `content:courses:read`
- `content:classes:manage`
- `staff:department:manage`
- `learner:department:manage`
- `enrollment:department:manage`
- `reports:department:read`
- `reports:department:export`
- `settings:department:manage`
- `analytics:courses:read`
- `analytics:courses:export`

**billing-admin:**
- `billing:department:read`
- `billing:department:manage`
- `billing:invoices:manage`
- `billing:payments:read`
- `reports:billing-department:read`

### Global-Admin Roles

**system-admin:**
- `system:*`, `content:*`, `enrollment:*`, `staff:*`, `learner:*`, `reports:*`, `billing:*`, `audit:*`

---

## Inaccurate Permissions Found

### 1. QuestionBankPage.tsx (Line 80)

| Current | Should Be | Status |
|---------|-----------|--------|
| `question:manage-department` | `content:questions:manage` or similar | **WRONG FORMAT** |

**File:** `src/pages/staff/QuestionBankPage.tsx:80`

---

### 2. useFeatureAccess.ts - Multiple Issues

#### System/Admin Section (Lines 283-293)

| Current | Should Be | Issue |
|---------|-----------|-------|
| `system:users:write` | `system:*` (for system-admin) | Not defined in API |
| `audit:logs:read` | `audit:*` (for system-admin) | Not specific in API |

#### Learner Management Section (Lines 323-344)

| Current | Should Be | Issue |
|---------|-----------|-------|
| `learners:profiles:write` | `learner:department:manage` | Wrong domain (`learners` vs `learner`) |
| `learners:profiles:read` | `learner:department:read` | Wrong domain |
| `learners:enrollments:write` | `enrollment:department:manage` | Wrong domain, different structure |
| `learners:grades:write` | `grades:own-classes:manage` | Wrong domain |
| `learners:grades:read` | `grades:department:read` | Wrong domain |
| `learners:*` | `learner:*` | Typo: plural vs singular |

#### Department Management Section (Lines 349-360)

| Current | Should Be | Issue |
|---------|-----------|-------|
| `department:roles:write` | `staff:department:manage` | Wrong domain structure |
| `department:staff:write` | `staff:department:manage` | Wrong domain structure |
| `department:staff:read` | `staff:department:manage` (no read-only) | Not in API |
| `department:*` | `staff:*` | Wrong domain |

#### Billing Section (Lines 365-372)

| Current | Should Be | Issue |
|---------|-----------|-------|
| `billing:invoices:write` | `billing:invoices:manage` | Should be `manage` not `write` |
| `billing:invoices:read` | `billing:department:read` | Different resource |

#### Class Management Section (Lines 394-405)

| Current | Should Be | Issue |
|---------|-----------|-------|
| `class:own:read` | `content:classes:read` | Wrong domain (should be under `content`) |
| `class:own:manage` | `content:classes:manage-own` | Wrong domain |
| `class:all:read` | `content:classes:read` | Wrong domain |
| `class:*` | `content:classes:*` | Wrong domain |

#### Grading Section (Lines 410-426)

| Current | Should Be | Issue |
|---------|-----------|-------|
| `grades:own:read` | `grades:department:read` | Not in API |
| `grades:all:manage` | `grades:own-classes:manage` | Different scope |
| `academic:grades:override` | Not defined | Does not exist in API |
| `academic:*` | Not defined | Does not exist in API |

#### FERPA/Learner Section (Lines 431-441)

| Current | Should Be | Issue |
|---------|-----------|-------|
| `learner:transcripts:read` | Not defined | Does not exist in API |
| `learner:pii:read` | Not defined | Does not exist in API |
| `learner:progress:read` | `learner:department:read` | Different resource |

#### Reports Section (Lines 377-389)

| Current | Should Be | Issue |
|---------|-----------|-------|
| `reports:export` | `reports:department:export` | Missing scope |
| `reports:own-classes:read` | `reports:class:read` | Different naming |
| `reports:own:read` | Not defined | Does not exist in API |

#### Settings Section (Lines 446-453)

| Current | Should Be | Issue |
|---------|-----------|-------|
| `settings:department:read` | `settings:department:manage` | Read-only not defined |

#### Content Section (Lines 316-318)

| Current | Should Be | Issue |
|---------|-----------|-------|
| `content:resources:manage` | Not defined | Does not exist in API |

---

### 3. INTEGRATION_GUIDE.md (Line 345)

| Current | Should Be | Issue |
|---------|-----------|-------|
| `content:create` | `content:courses:manage` | Two-part (missing resource) |

---

## Files Requiring Updates

| File | Lines | Priority |
|------|-------|----------|
| `src/shared/hooks/useFeatureAccess.ts` | 283-453 | **HIGH** |
| `src/pages/staff/QuestionBankPage.tsx` | 80 | **HIGH** |
| `src/pages/staff/courses/INTEGRATION_GUIDE.md` | 345 | LOW (docs) |

---

## Test Files (Lower Priority)

These files use arbitrary permissions for testing - they work because tests mock the permission system:

- `src/shared/hooks/__tests__/useDepartmentContext.test.ts`
- `src/features/auth/model/__tests__/authStore.permissions.test.ts`
- `src/features/auth/model/authStore.test.ts`

---

## Fixes Applied (2026-02-05)

### QuestionBankPage.tsx - FIXED
- Changed `question:manage-department` → `content:assessments:manage`

### useFeatureAccess.ts - FIXED
All sections updated to match API seed data:

| Section | Changes Made |
|---------|--------------|
| Learner Management | `learners:*` → `learner:*` format |
| Department Management | `department:*` → `staff:department:manage` |
| Billing | `billing:invoices:write/read` → `billing:invoices:manage`, `billing:department:read` |
| Reports | `reports:own-classes:read` → `reports:class:read`, `reports:export` → `reports:department:export` |
| Class Management | `class:*` → `content:classes:*` format |
| Grading | Removed `academic:grades:override`, `grades:all:manage` - using `grades:own-classes:manage` |
| FERPA | All mapped to `learner:department:read/manage` (pending API granular perms) |
| Settings | Removed non-existent `settings:department:read` |

---

## API Response Received (2026-02-05)

Per `api-to-ui/2026-02-05_permission-string-alignment-response.md`:

| Question | Answer | Action |
|----------|--------|--------|
| Learner self-enrollment | `enrollment:own:manage` added to `course-taker` role | UI can use this for self-enrollment |
| FERPA permissions | Keep using `learner:department:read` for now; granular FERPA permissions deferred | No UI changes needed |
| Grade override | `grades:department:manage` added to `department-admin` role | Updated `canOverrideGrades` in useFeatureAccess.ts |

**New permissions added to API seed data:**
- `content:assessments:manage` (content-admin)
- `enrollment:own:manage` (course-taker)
- `grades:department:read` (department-admin)
- `grades:department:manage` (department-admin)

---

## Links

- Pattern: [[../patterns/permission-string-debugging]]
- Memory log: [[../memory-log]]
