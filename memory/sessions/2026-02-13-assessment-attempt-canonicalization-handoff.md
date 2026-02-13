# Session: Assessment Attempt Canonicalization Handoff

**Date:** 2026-02-13
**Issue:** UI-ISS-149 - No Questions Shown for Course Assessments
**Status:** IN PROGRESS

## Summary

Captured cross-team alignment for assessment delivery and moved the UI implementation to the canonical assessment-attempt contract. Documented product-owner direction to skip compatibility windows and prefer ideal RESTful structure and optimization.

## Work Completed

- Checked frontend comms and confirmed API contract update:
  - `assessmentId` is canonical for attempts.
  - `learningUnitId` is optional provenance metadata.
  - `learningUnit.contentId` must point to the `Assessment._id` for assessment LUs.
  - Legacy `exam-attempts` contract is deprecated for new work.
- Sent backend guidance in comms with product-owner direction:
  - no legacy window required,
  - immediate move to canonical route/contracts,
  - no response needed.
- Moved UI issue to active:
  - `dev_communication/frontend/issues/active/UI-ISS-149_no-questions-shown-for-any-course.md`
- Started frontend migration from `exam-attempt` to `assessment-attempt` route/hook usage.

## Files Modified

- `src/shared/api/endpoints.ts` - Added canonical `assessmentAttempts` endpoint map.
- `src/entities/assessment-attempt/api/assessmentAttemptApi.ts` - New canonical attempt API client.
- `src/entities/assessment-attempt/hooks/useAssessmentAttempts.ts` - New query/mutation hooks.
- `src/entities/assessment-attempt/index.ts` - Entity exports for new hooks/api.
- `src/pages/learner/exercises/ExerciseTakingPage.tsx` - Switched to canonical attempt flow and launch context query params.
- `src/pages/learner/exercises/ExerciseResultsPage.tsx` - Switched history/retry calls to canonical attempt flow.
- `src/pages/learner/player/CoursePlayerPage.tsx` - Launches assessment units via `learningUnit.contentId` as `assessmentId`.

## Verification

- `npm run -s typecheck` passed.
- Targeted lint on changed assessment-attempt and exercise files passed.
- Existing exercise tests still need updates for new endpoint/mocks/query-context assumptions.

## Open Items

- [ ] Update exercise page tests and MSW handlers from `exam-attempts` to `assessment-attempts`.
- [ ] Remove remaining legacy `exam-attempt` references in learner assessment flow.
- [ ] Validate full learner assessment flow end-to-end once backend deployment reflects canonical contract.

## Related

- `dev_communication/frontend/inbox/2026-02-13_assessmentid-contracts-source-of-truth-update.md`
- `dev_communication/backend/inbox/2026-02-13_assessment-attempt-compatibility-window-direction.md`
- `dev_communication/shared/architecture/suggestions/2026-02-13_api_assessment-attempt-identifier-canonicalization.md`
