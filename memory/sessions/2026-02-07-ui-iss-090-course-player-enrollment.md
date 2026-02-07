# Session: UI-ISS-090 Course Player Fetches Wrong Enrollment

**Date:** 2026-02-07
**Issue:** UI-ISS-090 - Course Player Fetches Wrong Enrollment
**Status:** COMPLETE

## Summary
CoursePlayerPage called `useEnrollments({ limit: 1 })` which returned a random enrollment instead of the one for the current course. Replaced with `useEnrollmentStatus(courseId)` which filters by the URL's courseId param.

## Files Modified
| File | Change |
|------|--------|
| `src/pages/learner/player/CoursePlayerPage.tsx` | Replaced `useEnrollments({ limit: 1 })` with `useEnrollmentStatus(courseId)` |

## Route
`/learner/courses/:courseId/player` - Course player interface

## Features
- Enrollment now correctly scoped to the current course from URL params
- Content attempts record against the correct enrollment
- Multi-enrolled learners get the right enrollment

## Tests
- No existing test files for CoursePlayerPage
- TypeScript: 0 new errors

## Patterns Used
- Reused existing `useEnrollmentStatus` hook which already implemented the `course` filter pattern
- API confirmed: `GET /api/v2/enrollments?course={courseId}&limit=1` (api-to-ui message 2026-02-07)

## Verification
- TypeScript: No new errors
- Grep: Import changed from `useEnrollments` to `useEnrollmentStatus`

## Related
- UI-ISS-089 (fixed /play → /player route, same player flow)
- API message: `2026-02-07_learner-course-player-api-verification-response.md`
