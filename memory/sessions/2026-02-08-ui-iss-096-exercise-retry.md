# Session: UI-ISS-096 Exercise Retry Flow with Configurable Attempt Limits

**Date:** 2026-02-08
**Issue:** UI-ISS-096 - Exercise Retry Flow with Configurable Attempt Limits
**Status:** COMPLETE

## Summary

Implemented the learner-side exercise retry flow with configurable attempt limits. Added retry button to exam results page, attempt counter badge, attempt history table, and "no attempts remaining" message. Staff-side settings (max attempts dropdown on quiz editor) deferred to future issue.

## Files Created

| File | Description |
|------|-------------|
| `src/entities/exam-attempt/ui/AttemptHistory.tsx` | Table component showing attempt history (attempt #, date, score, %, pass/fail, time) |
| `src/pages/learner/exercises/__tests__/ExerciseResultsPage.retry.test.tsx` | 12 unit tests for retry flow |

## Files Modified

| File | Change |
|------|--------|
| `src/entities/exam-attempt/model/types.ts` | Added `maxAttempts: number \| null` and `attemptsUsed: number` to `ExamResult` |
| `src/entities/exam-attempt/ui/index.ts` | Exported `AttemptHistory` component |
| `src/entities/exam-attempt/index.ts` | Exported `AttemptHistory` component |
| `src/pages/learner/exercises/ExerciseResultsPage.tsx` | Added retry button, attempt badge, attempt history, no-attempts-remaining message |
| `src/test/mocks/data/examAttempts.ts` | Added `maxAttempts: 3` and `attemptsUsed: 2` to mock data |

## Features

- Retry button: Shown when learner failed AND attempts remain (or unlimited)
- Attempt badge: "Attempt X of Y" or "Attempt X - Unlimited" for null maxAttempts
- Attempt history: Table with previous attempts showing date, score percentage, pass/fail status, time spent
- No attempts remaining: Warning message when all attempts exhausted
- Retry action: Calls `useStartExamAttempt` mutation, navigates back to exercise player

## Tests

- 12 unit tests for retry flow covering:
  - Retry button visibility (failed + attempts remaining)
  - Retry button hidden when passed
  - Retry button hidden when attempts exhausted
  - Unlimited attempts (null maxAttempts)
  - Attempt badge display
  - No attempts remaining message
  - Attempt history rendering
  - All 99 existing exam-attempt entity tests still passing

## Patterns Used

- Entity-level UI component for AttemptHistory
- Derived state for canRetry and attemptsExhausted
- Conditional rendering based on exam result state

## Verification

- TypeScript: No errors
- Tests: 12 new tests passing, 99 existing tests passing, no regressions

## Related

- UI-ISS-094, UI-ISS-095 (implemented in same session)
- Staff-side max attempts settings deferred to future issue
