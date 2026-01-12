# Pre-Existing Issues Remediation Plan

**Date:** 2026-01-11
**Status:** 📋 PLANNING
**Priority:** MEDIUM
**Target Completion:** Phase-based rollout

---

## Executive Summary

This plan addresses 4 categories of pre-existing issues discovered during the Contract Alignment Sprint code path verification. Issues range from incomplete stub implementations to architectural limitations. All issues are **non-blocking for current deployment** but should be addressed for feature completeness.

---

## Issue Registry

### Priority 1: Architectural Improvements

#### Issue #1: ProtectedLink Multiple Permission Limitation
- **File:** `src/shared/ui/ProtectedLink.tsx`
- **Lines:** 192-201
- **Severity:** LOW (documented, workaround available)
- **Impact:** Limits complex permission scenarios in navigation
- **Current Workaround:** Use permission hooks directly
- **Estimated Effort:** 4-6 hours
- **Dependencies:** None
- **Tests Required:** 15+ tests

#### Issue #2: TypeScript Errors (152 pre-existing)
- **Locations:** Various files across codebase
- **Severity:** MEDIUM (code compiles but has warnings)
- **Impact:** Development experience, potential runtime issues
- **Types:**
  - Unused variables (TS6133): ~80 errors
  - Type mismatches (TS2339, TS2345): ~40 errors
  - Missing properties (TS2741): ~20 errors
  - Other: ~12 errors
- **Estimated Effort:** 12-16 hours
- **Dependencies:** None
- **Tests Required:** Verify existing tests still pass

---

### Priority 2: Missing API Implementations

#### Issue #3: Progress API Stub Methods
- **File:** `src/entities/progress/api/progressApi.ts`
- **Lines:** 170-178
- **Severity:** MEDIUM (blocks lesson progress tracking)
- **Methods:**
  1. `startLesson(courseId, lessonId)` - Initialize lesson attempt
  2. `updateLessonProgress(courseId, lessonId, data)` - Update during lesson
  3. `completeLesson(courseId, lessonId, data)` - Mark lesson complete
- **Impact:** Cannot track granular lesson-level progress
- **Estimated Effort:** 8-12 hours (including backend contract review)
- **Dependencies:** Backend API endpoints must exist
- **Tests Required:** 20+ tests (unit + integration)

---

### Priority 3: UI Feature Gaps

#### Issue #4: CoursePlayerPage TODOs
- **File:** `src/pages/learner/player/CoursePlayerPage.tsx`
- **Lines:** 89-90
- **Severity:** MEDIUM (affects learner experience)
- **Missing Features:**
  1. Lesson completion status display
  2. Prerequisite checking for locked lessons
- **Impact:** Learners can't see which lessons are complete or why lessons are locked
- **Estimated Effort:** 6-8 hours
- **Dependencies:**
  - Issue #3 (Progress API) for completion status
  - Prerequisite logic in course structure
- **Tests Required:** 12+ tests

#### Issue #5: Certificate Download/Verify Placeholders
- **File:** `src/pages/learner/certificates/CertificatesPage.tsx`
- **Lines:** 56, 86
- **Severity:** LOW (nice-to-have features)
- **Missing Features:**
  1. Download certificate as PDF
  2. Verify certificate authenticity
- **Impact:** Learners cannot download or verify certificates
- **Estimated Effort:** 10-14 hours
- **Dependencies:**
  - Backend PDF generation endpoint
  - Certificate verification service
- **Tests Required:** 15+ tests

---

### Priority 4: Test Infrastructure

#### Issue #6: Pre-existing Test Failures (648 failing)
- **Locations:** Various test files
- **Severity:** HIGH (test suite unreliable)
- **Categories:**
  - Missing MSW handlers: ~400 failures
  - Stale mocks: ~150 failures
  - Type mismatches: ~50 failures
  - Other: ~48 failures
- **Impact:** Cannot trust test suite for regressions
- **Estimated Effort:** 20-30 hours
- **Dependencies:** None
- **Tests Required:** Fix 648 failing tests

---

## Phased Implementation Plan

### Phase 1: Quick Wins (Week 1)
**Goal:** Address highest ROI issues with minimal effort

**Duration:** 3-5 days
**Effort:** 16-24 hours

#### Tasks:

1. **Enhance ProtectedLink Component**
   - **Effort:** 4-6 hours
   - **Owner:** Frontend UI Developer
   - **Deliverables:**
     - Update ProtectedLink to properly handle multiple permissions
     - Support both `requireAll` and `requireAny` logic
     - Maintain backward compatibility
     - Write 15 additional tests

   **Implementation Approach:**
   ```typescript
   // Option A: Use multiple hook calls (simple)
   const permissions = permissionsToCheck.map(p =>
     usePermission(p, departmentId)
   );

   // Option B: Create batch permission hook (better performance)
   const { hasAll, hasAny } = usePermissions(
     permissionsToCheck,
     { departmentId }
   );
   ```

2. **Fix Critical TypeScript Errors**
   - **Effort:** 6-8 hours
   - **Owner:** Any developer
   - **Focus:** Fix errors that could cause runtime issues
   - **Deliverables:**
     - Fix all TS2339 (property does not exist) errors
     - Fix all TS2345 (argument type mismatch) errors
     - Fix all TS2741 (missing property) errors
   - **Target:** Reduce from 152 to ~80 errors

3. **Update CoursePlayerPage with Available Data**
   - **Effort:** 6-8 hours
   - **Owner:** Learner Experience Developer
   - **Deliverables:**
     - Show completion status from existing progress data
     - Display lock icons for prerequisite lessons
     - Show prerequisite names in tooltip
     - Basic prerequisite checking logic
   - **Note:** Full progress tracking waits for Phase 2

4. **Documentation Update**
   - **Effort:** 2 hours
   - **Deliverables:**
     - Document ProtectedLink enhancement
     - Update KNOWN_ISSUES.md
     - Create migration guide for TS error fixes

**Phase 1 Success Criteria:**
- ✅ ProtectedLink handles multiple permissions correctly
- ✅ Critical TS errors reduced by 50%
- ✅ CoursePlayerPage shows basic completion/lock status
- ✅ All new code has >85% test coverage

---

### Phase 2: Progress Tracking Infrastructure (Week 2-3)
**Goal:** Implement complete lesson-level progress tracking

**Duration:** 1-2 weeks
**Effort:** 30-40 hours

#### Tasks:

1. **Backend Contract Review**
   - **Effort:** 2-4 hours
   - **Owner:** Backend Integration Lead
   - **Deliverables:**
     - Review V2 progress API contracts
     - Verify endpoints exist for all 3 methods
     - Document request/response formats
     - Identify any contract gaps

2. **Implement Progress API Methods**
   - **Effort:** 8-12 hours
   - **Owner:** API Integration Developer
   - **Deliverables:**
     - Implement `startLesson(courseId, lessonId)`
     - Implement `updateLessonProgress(courseId, lessonId, data)`
     - Implement `completeLesson(courseId, lessonId, data)`
     - Error handling for all scenarios
     - Loading states
     - 20+ comprehensive unit tests

   **Implementation Details:**
   ```typescript
   // src/entities/progress/api/progressApi.ts

   export const progressApi = {
     // ... existing methods

     /**
      * Start a lesson - creates initial progress record
      */
     startLesson: async (
       courseId: string,
       lessonId: string
     ): Promise<LessonProgressResponse> => {
       const response = await client.post<LessonProgressResponse>(
         `/progress/courses/${courseId}/lessons/${lessonId}/start`,
         {
           startedAt: new Date().toISOString(),
         }
       );
       return response.data;
     },

     /**
      * Update lesson progress (called periodically during lesson)
      */
     updateLessonProgress: async (
       courseId: string,
       lessonId: string,
       data: UpdateLessonProgressData
     ): Promise<LessonProgressResponse> => {
       const response = await client.patch<LessonProgressResponse>(
         `/progress/courses/${courseId}/lessons/${lessonId}`,
         data
       );
       return response.data;
     },

     /**
      * Mark lesson as complete
      */
     completeLesson: async (
       courseId: string,
       lessonId: string,
       data: CompleteLessonData
     ): Promise<LessonProgressResponse> => {
       const response = await client.post<LessonProgressResponse>(
         `/progress/courses/${courseId}/lessons/${lessonId}/complete`,
         {
           completedAt: new Date().toISOString(),
           score: data.score,
           timeSpent: data.timeSpent,
           ...data,
         }
       );
       return response.data;
     },
   };
   ```

3. **Create Lesson Progress Hooks**
   - **Effort:** 6-8 hours
   - **Owner:** Frontend Developer
   - **Deliverables:**
     - `useLessonProgress(courseId, lessonId)` hook
     - `useStartLesson()` mutation hook
     - `useUpdateLessonProgress()` mutation hook
     - `useCompleteLesson()` mutation hook
     - React Query integration
     - Optimistic updates
     - 15+ tests

4. **Update CoursePlayerPage**
   - **Effort:** 8-10 hours
   - **Owner:** Learner Experience Developer
   - **Deliverables:**
     - Replace TODO comments with real implementations
     - Call startLesson on lesson load
     - Call updateLessonProgress periodically
     - Call completeLesson on completion
     - Show real-time progress updates
     - Handle errors gracefully
     - 12+ tests

5. **Integration Testing**
   - **Effort:** 4-6 hours
   - **Owner:** QA Engineer
   - **Deliverables:**
     - End-to-end progress tracking flow tests
     - Edge case testing (network errors, timeouts)
     - Performance testing (multiple rapid updates)
     - Manual smoke testing

**Phase 2 Success Criteria:**
- ✅ All 3 progress API methods implemented
- ✅ Lesson-level progress tracked end-to-end
- ✅ CoursePlayerPage shows real-time progress
- ✅ No TODOs remaining in CoursePlayerPage
- ✅ 100% test coverage for new APIs

---

### Phase 3: Test Infrastructure Stabilization (Week 4-5)
**Goal:** Achieve reliable, passing test suite

**Duration:** 2 weeks
**Effort:** 30-40 hours

#### Strategy:

**Triage & Categorization** (Day 1-2)
- Run full test suite with verbose output
- Categorize all 648 failures by root cause
- Create spreadsheet tracking each failure
- Prioritize by impact and ease of fix

**Fix by Category** (Day 3-10)

1. **Missing MSW Handlers (~400 failures)**
   - **Effort:** 12-16 hours
   - **Approach:**
     - Identify all unhandled endpoints
     - Add MSW handlers to test setup
     - Use existing handler patterns
     - Test isolation - ensure handlers don't conflict

   **Example:**
   ```typescript
   // src/test/mocks/handlers/progress.ts
   export const progressHandlers = [
     rest.post('/progress/courses/:courseId/lessons/:lessonId/start', (req, res, ctx) => {
       return res(
         ctx.status(200),
         ctx.json({
           success: true,
           data: {
             lessonId: req.params.lessonId,
             progress: 0,
             startedAt: new Date().toISOString(),
           },
         })
       );
     }),
     // ... more handlers
   ];
   ```

2. **Stale Mocks (~150 failures)**
   - **Effort:** 8-10 hours
   - **Approach:**
     - Update mock data to match current types
     - Use factory functions for consistency
     - Replace hardcoded mocks with test utilities

   **Example:**
   ```typescript
   // Update from:
   const mockUser = { id: '1', name: 'Test' };

   // To:
   import { createMockUser } from '@/test/factories/user';
   const mockUser = createMockUser({
     userTypes: [{ _id: 'learner', displayAs: 'Learner' }], // V2.1 format
   });
   ```

3. **Type Mismatches (~50 failures)**
   - **Effort:** 6-8 hours
   - **Approach:**
     - Fix test type assertions
     - Update to match V2.1 contracts
     - Use proper TypeScript types in tests

4. **Other (~48 failures)**
   - **Effort:** 4-6 hours
   - **Approach:** Case-by-case fixes

**Verification** (Day 11-12)
- Run full test suite
- Verify 0 failures
- Check test coverage hasn't decreased
- Update CI/CD to enforce 0 failures

**Phase 3 Success Criteria:**
- ✅ 0 test failures in full suite
- ✅ All MSW handlers added
- ✅ All mocks updated to V2.1 format
- ✅ Test coverage maintained or improved
- ✅ CI/CD enforces test quality

---

### Phase 4: Remaining TypeScript Cleanup (Week 6)
**Goal:** Zero TypeScript errors

**Duration:** 1 week
**Effort:** 10-14 hours

#### Tasks:

1. **Fix Unused Variable Warnings (TS6133)**
   - **Effort:** 4-6 hours
   - **Count:** ~80 errors
   - **Approach:**
     - Remove truly unused variables
     - Prefix with underscore if intentionally unused: `_variable`
     - Fix function parameters with `// eslint-disable-next-line @typescript-eslint/no-unused-vars`

2. **Fix Remaining Type Errors**
   - **Effort:** 4-6 hours
   - **Count:** ~40 errors
   - **Approach:** Case-by-case fixes

3. **Fix Miscellaneous Errors**
   - **Effort:** 2-4 hours
   - **Count:** ~12 errors

4. **Enable Strict Mode (Optional)**
   - **Effort:** Variable (could be large)
   - **Decision Point:** Evaluate if worth the effort
   - **Benefit:** Catch more errors at compile time

**Phase 4 Success Criteria:**
- ✅ 0 TypeScript errors
- ✅ `npx tsc --noEmit` passes cleanly
- ✅ CI/CD enforces TypeScript strictness

---

### Phase 5: Certificate Features (Week 7-8)
**Goal:** Complete certificate management features

**Duration:** 2 weeks
**Effort:** 20-28 hours

#### Tasks:

1. **Backend Integration Planning**
   - **Effort:** 2-4 hours
   - **Owner:** Backend Integration Lead
   - **Deliverables:**
     - Review certificate API contracts
     - Confirm PDF generation endpoint
     - Confirm verification endpoint
     - Document authentication requirements

2. **Implement Certificate Download**
   - **Effort:** 6-8 hours
   - **Owner:** Frontend Developer
   - **Deliverables:**
     - API call to fetch certificate PDF
     - Trigger browser download
     - Loading state during generation
     - Error handling (certificate not ready, etc.)
     - 8+ tests

   **Implementation:**
   ```typescript
   const downloadCertificate = async (certificateId: string) => {
     try {
       setDownloading(true);

       // Fetch PDF as blob
       const response = await certificateApi.downloadPDF(certificateId);

       // Create download link
       const blob = new Blob([response.data], { type: 'application/pdf' });
       const url = window.URL.createObjectURL(blob);
       const link = document.createElement('a');
       link.href = url;
       link.download = `certificate-${certificateId}.pdf`;
       link.click();

       // Cleanup
       window.URL.revokeObjectURL(url);

       setDownloading(false);
     } catch (error) {
       console.error('Download failed:', error);
       setError('Failed to download certificate');
       setDownloading(false);
     }
   };
   ```

3. **Implement Certificate Verification**
   - **Effort:** 6-8 hours
   - **Owner:** Frontend Developer
   - **Deliverables:**
     - Public verification page (no auth required)
     - Certificate lookup by ID or code
     - Display verification status
     - Show certificate details if valid
     - Handle expired/revoked certificates
     - 8+ tests

   **Implementation:**
   ```typescript
   // New page: /verify-certificate/:id

   const VerifyCertificatePage = () => {
     const { id } = useParams();
     const { data, isLoading, error } = useQuery(
       ['verify-certificate', id],
       () => certificateApi.verify(id)
     );

     if (isLoading) return <LoadingSpinner />;
     if (error) return <InvalidCertificate />;

     return (
       <div>
         <VerificationBadge status={data.status} />
         <CertificateDetails certificate={data.certificate} />
         <IssuerInfo issuer={data.issuer} />
       </div>
     );
   };
   ```

4. **Update CertificatesPage**
   - **Effort:** 4-6 hours
   - **Owner:** Learner Experience Developer
   - **Deliverables:**
     - Replace placeholder functions with real implementations
     - Wire up download button
     - Wire up verify button
     - Add share functionality (optional)
     - 6+ tests

5. **Certificate Email Notifications (Optional Enhancement)**
   - **Effort:** 6-8 hours
   - **Owner:** Full-stack Developer
   - **Deliverables:**
     - Email learner when certificate issued
     - Include download link
     - Include verification link

**Phase 5 Success Criteria:**
- ✅ Certificates can be downloaded as PDF
- ✅ Certificates can be verified via public page
- ✅ No placeholders remaining in CertificatesPage
- ✅ 100% test coverage for new features

---

## Implementation Guidelines

### Development Standards

**Code Quality:**
- Maintain >85% test coverage for all new code
- Follow existing patterns and conventions
- Write comprehensive JSDoc comments
- Use TypeScript strict mode
- No `any` types without justification

**Testing Strategy:**
- Unit tests for all new functions
- Integration tests for API interactions
- Component tests for UI changes
- E2E tests for critical user flows
- MSW handlers for all API mocks

**Review Process:**
- All changes require PR review
- At least one approval from senior developer
- CI/CD must pass (tests, lint, type check)
- Manual testing for UI changes

### Risk Management

**Potential Blockers:**

1. **Backend API Not Ready**
   - **Risk:** Medium
   - **Mitigation:** Verify endpoints exist before Phase 2 starts
   - **Fallback:** Implement frontend with MSW mocks, integrate later

2. **Test Fixes More Complex Than Expected**
   - **Risk:** Medium
   - **Mitigation:** Timebox each category, escalate if stuck
   - **Fallback:** Skip low-priority tests, focus on critical paths

3. **Certificate Generation Requires New Infrastructure**
   - **Risk:** Low
   - **Mitigation:** Validate with backend team in Phase 5 planning
   - **Fallback:** Defer to future sprint if complex

4. **Resource Availability**
   - **Risk:** Medium
   - **Mitigation:** Phases can run independently, distribute across team
   - **Fallback:** Extend timeline, prioritize Phases 1-3

---

## Resource Allocation

### Team Requirements

**Phase 1 (Week 1):**
- 1 Frontend Developer (full-time)
- 1 QA Engineer (part-time)

**Phase 2 (Week 2-3):**
- 1 Backend Integration Lead (part-time)
- 1 API Integration Developer (full-time)
- 1 Frontend Developer (full-time)
- 1 QA Engineer (part-time)

**Phase 3 (Week 4-5):**
- 2 Developers (full-time) - can be any skill level
- 1 QA Engineer (full-time)

**Phase 4 (Week 6):**
- 1 Developer (full-time)

**Phase 5 (Week 7-8):**
- 1 Backend Integration Lead (part-time)
- 1 Frontend Developer (full-time)
- 1 Full-stack Developer (optional, for email notifications)
- 1 QA Engineer (part-time)

### Total Effort Estimate

| Phase | Duration | Effort (hours) | Team Size |
|-------|----------|----------------|-----------|
| Phase 1 | 1 week | 16-24 | 1-2 people |
| Phase 2 | 2 weeks | 30-40 | 2-3 people |
| Phase 3 | 2 weeks | 30-40 | 2-3 people |
| Phase 4 | 1 week | 10-14 | 1 person |
| Phase 5 | 2 weeks | 20-28 | 2-3 people |
| **Total** | **8 weeks** | **106-146 hours** | **2-3 people avg** |

**Parallelization Opportunities:**
- Phases 1 & 2 can overlap (different areas of codebase)
- Phase 3 can run parallel to Phase 2 (different focus)
- Phase 4 can be ongoing during other phases

**Realistic Timeline with Parallelization:** 5-6 weeks

---

## Success Metrics

### Key Performance Indicators (KPIs)

**Code Quality:**
- ✅ TypeScript errors: 152 → 0 (100% reduction)
- ✅ Test failures: 648 → 0 (100% passing)
- ✅ Test coverage: Maintain >85%
- ✅ Code duplication: No increase

**Feature Completeness:**
- ✅ All TODO comments resolved
- ✅ All placeholder functions implemented
- ✅ All stub API methods implemented
- ✅ ProtectedLink fully functional

**User Experience:**
- ✅ Learners can track lesson-level progress
- ✅ Learners can download certificates
- ✅ Certificates can be publicly verified
- ✅ Clear prerequisite display in course player

**Developer Experience:**
- ✅ CI/CD builds pass consistently
- ✅ Test suite reliable for regression detection
- ✅ TypeScript provides helpful errors
- ✅ No cryptic error messages from stale mocks

---

## Dependencies & Prerequisites

### Before Starting:

**Phase 1:**
- ✅ Current Contract Alignment Sprint complete (DONE)
- ✅ Code path verification complete (DONE)
- ✅ Development environment setup

**Phase 2:**
- ✅ Backend progress API endpoints verified
- ✅ API contracts documented
- ⚠️ Backend team coordination scheduled

**Phase 3:**
- ✅ Test infrastructure setup (MSW, testing-library)
- ✅ Access to CI/CD logs

**Phase 4:**
- ✅ Phase 3 complete (clean test suite makes TS errors easier to spot)

**Phase 5:**
- ✅ Backend certificate API verified
- ✅ PDF generation service available
- ⚠️ Decision on certificate verification approach

---

## Alternative Approaches Considered

### Approach A: Big Bang (All at Once)
**Pros:**
- Fastest calendar time if well-coordinated
- All issues resolved together

**Cons:**
- High risk of conflicts
- Requires large team
- Difficult to track progress
- High cognitive load

**Decision:** ❌ Rejected - Too risky

### Approach B: Priority-Based (High to Low)
**Pros:**
- Focuses on highest impact first
- Early wins build momentum

**Cons:**
- Some low-priority items may never get done
- Dependencies make strict priority difficult

**Decision:** ✅ SELECTED (with phases grouping related work)

### Approach C: Area-Based (By Feature/Module)
**Pros:**
- Clear ownership
- Minimal conflicts between workstreams

**Cons:**
- Doesn't address cross-cutting concerns (tests, TS errors)
- Uneven effort distribution

**Decision:** ❌ Rejected - Doesn't fit issue types

---

## Appendix

### A. Quick Reference - Issue Locations

| Issue | File | Lines | Type |
|-------|------|-------|------|
| ProtectedLink multiple permissions | src/shared/ui/ProtectedLink.tsx | 192-201 | Limitation |
| Progress API stubs | src/entities/progress/api/progressApi.ts | 170-178 | Missing Implementation |
| CoursePlayer TODOs | src/pages/learner/player/CoursePlayerPage.tsx | 89-90 | Missing Implementation |
| Certificate placeholders | src/pages/learner/certificates/CertificatesPage.tsx | 56, 86 | Missing Implementation |
| TypeScript errors | Various | N/A | Type Errors |
| Test failures | Various | N/A | Test Failures |

### B. Related Documentation

- **Contract Alignment Sprint Report:** `devdocs/impl_reports/integration/CONTRACT_ALIGNMENT_FINAL_INTEGRATION.md`
- **Code Path Verification:** `devdocs/impl_reports/integration/CODE_PATH_VERIFICATION.md`
- **Team Coordination:** `devdocs/team_coordination.md`
- **V2 API Contracts:** (Backend repo reference needed)

### C. Communication Plan

**Kickoff Meeting:**
- Review this plan with full team
- Assign phase owners
- Establish communication channels
- Set up progress tracking

**Weekly Sync:**
- Monday: Week planning, assign tasks
- Wednesday: Mid-week checkpoint
- Friday: Week review, blocker discussion

**Phase Completion:**
- Demo completed work
- Update documentation
- Retrospective (what went well, what to improve)
- Handoff to next phase owner

**Issue Tracking:**
- Create JIRA/GitHub issues for each task
- Link to this plan document
- Update status daily
- Flag blockers immediately

---

## Conclusion

This remediation plan provides a clear, phased approach to addressing all pre-existing issues found during code verification. The plan is:

- ✅ **Pragmatic:** Prioritizes high-impact, low-effort wins first
- ✅ **Achievable:** Realistic timelines and resource estimates
- ✅ **Flexible:** Phases can run independently or in parallel
- ✅ **Comprehensive:** Addresses all identified issues
- ✅ **Measurable:** Clear success criteria for each phase

**Recommended Next Steps:**
1. Review this plan with engineering leadership
2. Allocate resources for Phase 1 (Week 1)
3. Schedule backend coordination for Phase 2
4. Create tracking issues in project management system
5. Kick off Phase 1 implementation

**Total Investment:**
- **5-6 weeks** calendar time (with parallelization)
- **106-146 hours** total effort
- **2-3 developers** average at any time

**Expected Outcome:**
- Zero technical debt from pre-existing issues
- Reliable test suite
- Complete feature implementation
- Improved developer experience
- Better learner experience

---

**Document Version:** 1.0
**Created:** 2026-01-11
**Owner:** Engineering Leadership
**Status:** 📋 Awaiting Approval

**Approved By:** _________________
**Start Date:** _________________

---

**End of Plan**
