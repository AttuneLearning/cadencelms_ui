# Pre-Existing Issues - Quick Reference

**Status:** 📋 Ready to Start
**Full Plan:** `devdocs/impl_reports/PREEXISTING_ISSUES_REMEDIATION_PLAN.md`

---

## 5-Phase Approach (5-6 weeks)

### 📊 Phase Overview

| Phase | Duration | Focus | Effort | Team Size |
|-------|----------|-------|--------|-----------|
| **Phase 1** | Week 1 | Quick wins | 16-24h | 1-2 people |
| **Phase 2** | Week 2-3 | Progress API | 30-40h | 2-3 people |
| **Phase 3** | Week 4-5 | Test fixes | 30-40h | 2-3 people |
| **Phase 4** | Week 6 | TS cleanup | 10-14h | 1 person |
| **Phase 5** | Week 7-8 | Certificates | 20-28h | 2-3 people |

**Total:** 106-146 hours over 5-6 weeks (with parallelization)

---

## Phase 1: Quick Wins (Week 1) ⚡

**Goal:** High ROI, minimal effort improvements

### Tasks:
1. ✨ **ProtectedLink Enhancement** (4-6h)
   - Fix multiple permission checking
   - Support `requireAll` and `requireAny`
   - Add 15 tests

2. 🔧 **Critical TypeScript Errors** (6-8h)
   - Fix property/type mismatches
   - Reduce from 152 → ~80 errors

3. 🎯 **CoursePlayerPage Basics** (6-8h)
   - Show completion status
   - Display locked lessons
   - Basic prerequisite logic

4. 📝 **Documentation** (2h)

**Deliverables:**
- ✅ ProtectedLink fully functional
- ✅ 50% reduction in TS errors
- ✅ Basic progress display working

---

## Phase 2: Progress API (Week 2-3) 🔄

**Goal:** Implement complete lesson-level progress tracking

### Tasks:
1. 🔍 **Backend Contract Review** (2-4h)
   - Verify endpoints exist
   - Document contracts

2. 🛠️ **Implement 3 API Methods** (8-12h)
   - `startLesson()`
   - `updateLessonProgress()`
   - `completeLesson()`
   - 20+ tests

3. 🪝 **Create Progress Hooks** (6-8h)
   - React Query integration
   - Optimistic updates

4. 🎨 **Update CoursePlayerPage** (8-10h)
   - Remove all TODOs
   - Wire up real-time tracking

5. ✅ **Integration Testing** (4-6h)

**Deliverables:**
- ✅ All 3 stub methods implemented
- ✅ End-to-end progress tracking works
- ✅ No TODOs in CoursePlayerPage

---

## Phase 3: Test Stabilization (Week 4-5) 🧪

**Goal:** 648 failing tests → 0 failures

### Strategy:
1. **Triage** (2 days) - Categorize all failures
2. **Fix Missing MSW Handlers** (~400 failures, 12-16h)
3. **Update Stale Mocks** (~150 failures, 8-10h)
4. **Fix Type Mismatches** (~50 failures, 6-8h)
5. **Fix Other Issues** (~48 failures, 4-6h)
6. **Verify** (2 days) - Confirm 0 failures

**Deliverables:**
- ✅ 100% test pass rate
- ✅ All MSW handlers complete
- ✅ All mocks updated to V2.1 format
- ✅ CI/CD enforces quality

---

## Phase 4: TypeScript Cleanup (Week 6) 🔍

**Goal:** Zero TypeScript errors

### Tasks:
1. **Fix Unused Variables** (~80 errors, 4-6h)
2. **Fix Type Errors** (~40 errors, 4-6h)
3. **Fix Miscellaneous** (~12 errors, 2-4h)

**Deliverables:**
- ✅ `npx tsc --noEmit` passes cleanly
- ✅ CI/CD enforces strictness

---

## Phase 5: Certificate Features (Week 7-8) 🎓

**Goal:** Complete certificate management

### Tasks:
1. 🔍 **Backend Integration Planning** (2-4h)
2. 📥 **Implement Download** (6-8h)
   - Fetch PDF from API
   - Trigger browser download
   - 8+ tests

3. ✔️ **Implement Verification** (6-8h)
   - Public verification page
   - Certificate lookup
   - Display validation status
   - 8+ tests

4. 🎨 **Update CertificatesPage** (4-6h)
   - Wire up download button
   - Wire up verify button

**Optional:**
- 📧 Email notifications (6-8h)

**Deliverables:**
- ✅ Certificates downloadable as PDF
- ✅ Public verification page working
- ✅ No placeholders remaining

---

## Key Metrics

### Success Criteria:
- ✅ TypeScript errors: **152 → 0** (100% reduction)
- ✅ Test failures: **648 → 0** (100% passing)
- ✅ Test coverage: **Maintain >85%**
- ✅ All TODOs resolved
- ✅ All stubs implemented

---

## Resource Requirements

| Phase | Primary Role | Support Roles |
|-------|-------------|---------------|
| Phase 1 | Frontend Dev | QA (part-time) |
| Phase 2 | API Dev | Backend Lead, Frontend Dev, QA |
| Phase 3 | Any Dev (2x) | QA |
| Phase 4 | Any Dev | - |
| Phase 5 | Frontend Dev | Backend Lead, QA |

**Team Size:** 2-3 developers average at any time

---

## Parallelization Opportunities

✅ **Phases 1 & 2 can overlap** (different code areas)
✅ **Phase 3 can run parallel to Phase 2** (different focus)
✅ **Phase 4 can be ongoing** (during other phases)

**Realistic Timeline:** 5-6 weeks (instead of 8)

---

## Risk Management

| Risk | Probability | Mitigation |
|------|------------|------------|
| Backend APIs not ready | Medium | Verify before Phase 2, use MSW mocks |
| Test fixes complex | Medium | Timebox categories, escalate blockers |
| Certificate infrastructure complex | Low | Validate early, defer if needed |
| Resource constraints | Medium | Phases run independently, extend timeline |

---

## Quick Start Checklist

### Before Phase 1:
- [ ] Review full plan with team
- [ ] Assign phase owners
- [ ] Set up tracking (JIRA/GitHub issues)
- [ ] Schedule kickoff meeting

### Before Phase 2:
- [ ] Verify backend progress endpoints exist
- [ ] Schedule backend team coordination
- [ ] Document API contracts

### Before Phase 5:
- [ ] Verify certificate API endpoints
- [ ] Confirm PDF generation service available
- [ ] Decide on verification approach

---

## Communication Plan

**Weekly Sync:**
- **Monday:** Week planning
- **Wednesday:** Checkpoint
- **Friday:** Review & retrospective

**Phase Completion:**
- Demo
- Update docs
- Retrospective
- Handoff

---

## Next Steps

1. ✅ Review plan with engineering leadership
2. ✅ Allocate resources for Phase 1
3. ✅ Create tracking issues
4. ✅ Schedule kickoff meeting
5. 🚀 **Start Phase 1**

---

**Full Details:** See `PREEXISTING_ISSUES_REMEDIATION_PLAN.md`

**Created:** 2026-01-11
**Status:** Ready to Execute
