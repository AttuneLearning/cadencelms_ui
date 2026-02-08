# Session: UI-ISS-093 Wire Up "Hours Studied" Dashboard Stat

**Date:** 2026-02-07
**Issue:** UI-ISS-093 - Wire Up "Hours Studied" Dashboard Stat
**Status:** COMPLETE

## Summary
Replaced hardcoded `hoursStudied: 0` in LearnerDashboardPage with real data from `useLearnerProgress` hook. Converts `totalTimeSpent` (seconds) to hours for display.

## Files Modified
| File | Change |
|------|--------|
| `src/pages/learner/dashboard/LearnerDashboardPage.tsx` | Added `useLearnerProgress` import, computed hoursStudied from progress API, replaced "Average Progress" stat card with "Hours Studied" |

## Features
- Hours studied stat reflects actual learner time data from progress API
- Displays formatted hours (1 decimal place)
- Falls back to 0 gracefully when no data available

## Tests
- No existing test file for LearnerDashboardPage
- TypeScript: 0 errors

## Patterns Used
- `useLearnerProgress(learnerId)` hook from `@/entities/progress`
- `LearnerProgress.summary.totalTimeSpent` field (in seconds)

## Verification
- TypeScript: 0 errors
- No regressions

## Related
- Progress entity `useLearnerProgress` from `src/entities/progress/hooks/useProgress.ts`
- API: `GET /api/v2/progress/learner/{learnerId}`

## Team Review
- **Preset selected:** solo
- **Preset ideal:** solo
- **Rationale:** Single-file data wiring with existing hook
