# Test Suite Resolution Plan

**Date**: 2026-01-13
**Status**: In Progress
**Current**: 649 failures | 3,185 passing (3,835 total tests)
**Goal**: Resolve all test failures in 6 phases

---

## Failure Analysis

### Test Failure Distribution

| Category | Count | % of Total |
|----------|-------|------------|
| API Tests (MSW handlers) | 223 | 34.4% |
| Form Validation Tests | 80 | 12.3% |
| Component Rendering Tests | 150 | 23.1% |
| Hook Integration Tests | 80 | 12.3% |
| Auto-save/Timing Tests | 50 | 7.7% |
| Complex Integration Tests | 66 | 10.2% |
| **Total** | **649** | **100%** |

### Top Failing Test Files

| File | Failures | Category |
|------|----------|----------|
| `entities/class/api/__tests__/classApi.test.ts` | 38 | API/MSW |
| `entities/question/ui/__tests__/QuestionForm.test.tsx` | 32 | Form Validation |
| `pages/admin/reports/__tests__/ReportViewerPage.test.tsx` | 31 | Component |
| `entities/content/api/__tests__/contentApi.test.ts` | 26 | API/MSW |
| `pages/learner/catalog/__tests__/CourseCatalogPage.test.tsx` | 21 | Component |
| `pages/admin/audit-logs/__tests__/AuditLogDetailPage.test.tsx` | 20 | Component |
| `entities/course-segment/api/__tests__/courseSegmentApi.test.ts` | 20 | API/MSW |
| `entities/content-attempt/api/__tests__/contentAttemptApi.test.ts` | 19 | API/MSW |
| `pages/staff/classes/__tests__/ClassDetailsPage.test.tsx` | 18 | Component |
| `entities/learning-event/api/__tests__/learningEventApi.test.ts` | 18 | API/MSW |

---

## Phase 1: MSW Mock Handler Setup (Priority: Critical)

**Failures**: 223 (34.4%)
**Complexity**: Medium
**Estimated Time**: 2-3 hours
**Dependencies**: None

### Root Cause
API tests are failing with `ApiClientError: Not found` because MSW mock handlers are not set up for many endpoints. The test infrastructure exists, but handlers are incomplete.

### Affected Files
- `entities/class/api/__tests__/classApi.test.ts` (38 failures)
- `entities/content/api/__tests__/contentApi.test.ts` (26 failures)
- `entities/course-segment/api/__tests__/courseSegmentApi.test.ts` (20 failures)
- `entities/content-attempt/api/__tests__/contentAttemptApi.test.ts` (19 failures)
- `entities/learning-event/api/__tests__/learningEventApi.test.ts` (18 failures)
- `entities/enrollment/api/__tests__/enrollmentApi.test.ts` (17 failures)
- `entities/question/api/__tests__/questionApi.test.ts` (15 failures)
- `entities/exam-attempt/api/__tests__/examAttemptApi.test.ts` (14 failures)
- `entities/template/api/__tests__/templateApi.test.ts` (13 failures)
- `entities/exercise/api/__tests__/exerciseApi.test.ts` (12 failures)
- `entities/progress/api/__tests__/progressApi.test.ts` (11 failures)
- `entities/course/api/__tests__/courseApi.test.ts` (11 failures)
- Others (29 failures across remaining API files)

### Solution Strategy

1. **Audit MSW Handlers** (`src/test/mocks/handlers.ts`)
   - List all registered handlers
   - Compare against failing API test endpoints

2. **Create Missing Handlers** (Batch approach)
   - Group handlers by entity (class, content, enrollment, etc.)
   - Create RESTful handler patterns for each entity:
     - `GET /api/entity` → List
     - `GET /api/entity/:id` → Get single
     - `POST /api/entity` → Create
     - `PUT /api/entity/:id` → Update
     - `DELETE /api/entity/:id` → Delete

3. **Use Fixtures for Mock Data**
   - Create fixtures in `src/test/fixtures/` for each entity
   - Handlers return fixture data

4. **Verify Handler Registration**
   - Ensure all handlers are exported from `handlers.ts`
   - Verify MSW server setup in `setupTests.ts`

### Acceptance Criteria
- ✅ All API test files have corresponding MSW handlers
- ✅ 223 API test failures resolved
- ✅ No "Not found" errors in test output
- ✅ Handlers use realistic fixture data

---

## Phase 2: Form Validation Edge Cases (Priority: High)

**Failures**: 80 (12.3%)
**Complexity**: Low-Medium
**Estimated Time**: 1-2 hours
**Dependencies**: None

### Root Cause
Form validation tests are failing for edge cases like maximum character limits, special characters, and boundary conditions.

### Affected Files
- `entities/question/ui/__tests__/QuestionForm.test.tsx` (32 failures)
- `entities/course-segment/ui/__tests__/CourseSegmentForm.test.tsx` (15 failures)
- `features/grading/ui/__tests__/GradingForm.test.tsx` (10 failures)
- Other form tests (23 failures)

### Common Issues
1. **Max length validation not enforced**
   - Question text: 2000 character limit
   - Explanation: 1000 character limit
   - Description: varies by entity

2. **Validation error messages not displayed**
   - Form doesn't show error text
   - Error styling not applied

3. **Auto-save timing issues**
   - Debounced save not triggered properly
   - Timing conflicts with Vitest 4.x

### Solution Strategy

1. **Add Max Length Validation**
   - Update form schemas (Zod/Yup) with `.max()` constraints
   - Add character counter UI components

2. **Fix Error Display**
   - Ensure error messages render correctly
   - Verify error styling applies (red border, error text)

3. **Fix Auto-Save Tests**
   - Use `vi.useFakeTimers()` correctly for Vitest 4.x
   - Advance timers properly with `vi.advanceTimersByTime()`

### Acceptance Criteria
- ✅ All max length validations enforced
- ✅ Error messages display correctly
- ✅ Auto-save tests pass with proper timer handling
- ✅ 80 form validation test failures resolved

---

## Phase 3: Component Rendering Issues (Priority: High)

**Failures**: 150 (23.1%)
**Complexity**: Medium-High
**Estimated Time**: 3-4 hours
**Dependencies**: Phase 1 (some components depend on API)

### Root Cause
Page components are failing to render due to missing data, incomplete mocks, or context issues.

### Affected Files
- `pages/admin/reports/__tests__/ReportViewerPage.test.tsx` (31 failures)
- `pages/learner/catalog/__tests__/CourseCatalogPage.test.tsx` (21 failures)
- `pages/admin/audit-logs/__tests__/AuditLogDetailPage.test.tsx` (20 failures)
- `pages/staff/classes/__tests__/ClassDetailsPage.test.tsx` (18 failures)
- `pages/admin/reports/__tests__/ReportTemplatesPage.test.tsx` (17 failures)
- `pages/admin/audit-logs/__tests__/AuditLogsPage.test.tsx` (16 failures)
- `widgets/header/__tests__/Header.test.tsx` (15 failures)
- `pages/staff/reports/__tests__/StaffReportsPage.test.tsx` (15 failures)
- `pages/learner/courses/__tests__/MyCoursesPage.test.tsx` (15 failures)
- Others (remaining component test files)

### Common Issues
1. **Missing React Query data**
   - Components expect API data that's not mocked
   - Loading states not handled properly

2. **Missing context providers**
   - Auth context not provided in tests
   - Department context missing
   - Navigation context missing

3. **Incorrect mock setup**
   - useAuthStore returns undefined
   - useDepartmentContext returns incomplete data
   - useNavigation hook not mocked

### Solution Strategy

1. **Create Test Wrapper Utility**
   ```typescript
   // src/test/utils/testWrapper.tsx
   export function createTestWrapper(options?) {
     return ({ children }) => (
       <QueryClientProvider client={testQueryClient}>
         <MemoryRouter>
           <AuthContext.Provider value={mockAuthValue}>
             {children}
           </AuthContext.Provider>
         </MemoryRouter>
       </QueryClientProvider>
     );
   }
   ```

2. **Fix Store Mocks**
   - Ensure `useAuthStore` mock returns complete `AuthState`
   - Ensure `useDepartmentContext` mock returns all required fields
   - Ensure `useNavigation` mock returns all required methods

3. **Add Loading State Tests**
   - Test components during loading state
   - Test components with empty data
   - Test components with error state

4. **Fix Header Component Tests**
   - Mock `useDepartmentContext` properly
   - Mock `useNavigation` properly
   - Ensure user data is complete

### Acceptance Criteria
- ✅ All page components render successfully
- ✅ Context providers work in tests
- ✅ Loading/empty/error states tested
- ✅ 150 component test failures resolved

---

## Phase 4: Hook Integration Tests (Priority: Medium)

**Failures**: 80 (12.3%)
**Complexity**: Medium
**Estimated Time**: 2 hours
**Dependencies**: Phase 1 (hooks depend on API)

### Root Cause
React Query hooks are failing due to MSW handler issues and incomplete mock setups.

### Affected Files
- `entities/enrollment/hooks/__tests__/useEnrollments.test.tsx` (12 failures)
- Various hook test files (68 failures across multiple files)

### Common Issues
1. **MSW handlers incomplete** (covered in Phase 1)
2. **Query client not reset between tests**
3. **Stale cache data affecting tests**

### Solution Strategy

1. **Fix Query Client Setup**
   ```typescript
   beforeEach(() => {
     queryClient.clear(); // Clear all queries
   });
   ```

2. **Wrap Hooks in QueryClientProvider**
   ```typescript
   const { result } = renderHook(() => useEnrollments(), {
     wrapper: createTestWrapper(),
   });
   ```

3. **Wait for Async Updates**
   ```typescript
   await waitFor(() => {
     expect(result.current.isLoading).toBe(false);
   });
   ```

### Acceptance Criteria
- ✅ All hook tests pass
- ✅ Query client properly reset between tests
- ✅ Async updates handled correctly
- ✅ 80 hook test failures resolved

---

## Phase 5: Auto-Save & Timing Tests (Priority: Low)

**Failures**: 50 (7.7%)
**Complexity**: Medium
**Estimated Time**: 1-2 hours
**Dependencies**: Phase 2 (form tests)

### Root Cause
Auto-save tests are failing due to timing issues with Vitest 4.x fake timers.

### Affected Files
- Various form components with auto-save functionality
- `features/grading/ui/__tests__/GradingForm.test.tsx`
- Form components with debounced inputs

### Common Issues
1. **Vitest 4.x timer API changes**
   - `vi.advanceTimersByTime()` behaves differently
   - Need to call `vi.runOnlyPendingTimers()` in some cases

2. **Debounce timing not configured for tests**
   - Production: 2-minute debounce
   - Tests: Should use shorter debounce

### Solution Strategy

1. **Update Timer Usage**
   ```typescript
   beforeEach(() => {
     vi.useFakeTimers();
   });

   afterEach(() => {
     vi.runOnlyPendingTimers();
     vi.useRealTimers();
   });

   test('auto-save', async () => {
     // Trigger change
     await userEvent.type(input, 'text');

     // Advance timers
     vi.advanceTimersByTime(120000);

     // Wait for async updates
     await waitFor(() => {
       expect(saveFn).toHaveBeenCalled();
     });
   });
   ```

2. **Make Debounce Configurable**
   ```typescript
   export function useAutoSave(debounceMs = import.meta.env.TEST ? 100 : 120000) {
     // ...
   }
   ```

### Acceptance Criteria
- ✅ All auto-save tests pass
- ✅ Timers properly managed
- ✅ Debounce timing configurable for tests
- ✅ 50 timing test failures resolved

---

## Phase 6: Complex Integration Tests (Priority: Low)

**Failures**: 66 (10.2%)
**Complexity**: High
**Estimated Time**: 2-3 hours
**Dependencies**: All previous phases

### Root Cause
Complex integration tests involving multiple steps, state changes, or user flows.

### Affected Files
- Various integration test files
- Multi-step workflow tests

### Solution Strategy
1. Address after completing Phases 1-5
2. Many may be resolved by earlier phases
3. Fix remaining issues case-by-case

---

## Implementation Order

### Sprint 1: Critical Foundations (Phases 1-3)
1. **Phase 1**: MSW Mock Handler Setup (223 failures)
2. **Phase 2**: Form Validation Edge Cases (80 failures)
3. **Phase 3**: Component Rendering Issues (150 failures)

**Total**: 453 failures (69.8% of all failures)

### Sprint 2: Refinement (Phases 4-6)
4. **Phase 4**: Hook Integration Tests (80 failures)
5. **Phase 5**: Auto-Save & Timing Tests (50 failures)
6. **Phase 6**: Complex Integration Tests (66 failures)

**Total**: 196 failures (30.2% of all failures)

---

## Success Metrics

### Per-Phase Goals
- Phase 1: 426 remaining (223 resolved)
- Phase 2: 346 remaining (80 resolved)
- Phase 3: 196 remaining (150 resolved)
- Phase 4: 116 remaining (80 resolved)
- Phase 5: 66 remaining (50 resolved)
- Phase 6: 0 remaining (66 resolved)

### Final Goal
- ✅ 0 test failures
- ✅ 3,835 tests passing
- ✅ No skipped tests (except intentionally skipped)
- ✅ All test files green
- ✅ Clean test output (no warnings)

---

## Risk Mitigation

### Potential Issues
1. **Test interdependencies**: Some failures may cascade from earlier failures
2. **Mock data consistency**: Fixtures must match API contracts
3. **Timing issues**: Real async operations may need longer waits
4. **CI/CD differences**: Tests may behave differently in CI environment

### Mitigation Strategies
1. Fix phases in order to handle cascading failures
2. Use TypeScript types to ensure fixture consistency
3. Use generous timeouts in tests (`waitFor` with 5s timeout)
4. Run tests locally and in CI frequently

---

**Last Updated**: 2026-01-13
**Next Review**: After Phase 3 completion
