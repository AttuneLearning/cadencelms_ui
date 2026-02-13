# Session 2026-02-09d: ISS-137 through ISS-143 — Inbox Triage + Implementation

## Summary
Processed 7 frontend inbox messages into issues, then implemented all 7 issues in a single session.

## Issues Completed

### UI-ISS-137: Grading Form Fix
- **Root cause**: `findIndex` returned -1 for unmatched question IDs, creating invalid Controller paths
- **Fix**: Replaced `gradeIndex` (from `findIndex`) with `index` (from `map()` iteration)
- **File**: `src/features/grading/ui/GradingForm.tsx`

### UI-ISS-138: Course Content Blocker Resolution
- API-ISS-031 (missing modules endpoint) and API-ISS-033 (double-nesting) were resolved
- Cross-referenced with UI-ISS-143 content unwrap fix

### UI-ISS-139: Assignment Entity API-ISS-029 Alignment
- Rewrote `types.ts`: `Assignment` now has `courseId, instructions, submissionType, maxScore, maxResubmissions, isPublished, createdBy`
- `AssignmentSubmission` now has flat grade fields (`grade, feedback, gradedBy, gradedAt`), `enrollmentId`, `submissionNumber`, `SubmissionFile[]`
- Rewrote `assignmentApi.ts`: paths `/assignments` + `/submissions`, new CRUD + lifecycle methods
- Rewrote `useAssignments.ts`: new hooks for full lifecycle
- Rewrote `AssignmentPlayer.tsx`: aligned with new types, removed `useMySubmissions/useUploadFile/useDeleteFile`
- Rewrote test file with new mock shapes
- **15 tests** for hooks, **16 tests** for AssignmentPlayer component

### UI-ISS-140: Calendar Pages Wired to Real API
- Swapped `useCalendarFeedPlaceholder` → `useCalendarFeed` + `getVisibleRange` in:
  - `AdminCalendarPage.tsx` (system feed)
  - `StaffCalendarPage.tsx` (staff + learner feeds)
  - `LearnerCalendarPage.tsx` (learner feed)
- Updated 3 test files to mock `useCalendarFeed` (React Query hook needs mock)
- Removed 2 placeholder-data-dependent event display tests

### UI-ISS-141: Discussion Forum Entity
- Created `src/entities/discussion/` with complete FSD structure
- `model/types.ts`: DiscussionThread, DiscussionReply, all payloads, pagination types
- `model/discussionKeys.ts`: React Query key factory
- `api/discussionApi.ts`: 13 API functions (threads + replies)
- `hooks/useDiscussions.ts`: 4 query hooks + 9 mutation hooks
- **18 key tests + 36 hook tests = 54 new tests**

### UI-ISS-142: Playlist Session Phase 5 API Persistence
- Added `LearningUnitAdaptive` type and `adaptive?` field to LU entity
- Added `CourseAdaptiveSettings` type and `adaptiveSettings?` to Course entity
- Created `playlistSessionApi.ts`: save, load (with 404→null), update
- Created `usePlaylistSession.ts`: query + 2 mutation hooks
- Fixed `useAdaptiveConfig` signature: `(courseId: string)` → `(courseAdaptiveSettings?: CourseAdaptiveSettings | null)`
- Fixed CoursePlayerPage to pass `course?.adaptiveSettings` to `useAdaptiveConfig`
- Fixed `mapToStaticLearningUnits` to pass through adaptive data
- **Bug fix**: `loadPlaylistSession` 404 catch was checking `err.response?.status` but `ApiClientError` has `status` directly
- **16 key tests + 16 hook tests = 32 new tests**

### UI-ISS-143: Content API Unwrap Fix
- Removed defensive `data.data` unwrap in `contentApi.ts` (API-ISS-033 fixed server-side)

## Verification
- `npx tsc --noEmit` — 0 errors
- `npx vitest run` — 249 test files, **4,874 tests passing**, 0 failures (16 skipped known flaky)
- Net **+68 new tests** (4,806 → 4,874)

## Bug Found & Fixed
- `loadPlaylistSession` 404 handling: was checking `err.response?.status === 404` but `ApiClientError` (from axios interceptor) has `status` as a direct property. Fixed to use `error instanceof ApiClientError && error.status === 404`.

## Files Changed (Key)
- `src/entities/assignment/model/types.ts` — rewritten for API-ISS-029
- `src/entities/assignment/api/assignmentApi.ts` — rewritten
- `src/entities/assignment/hooks/useAssignments.ts` — rewritten
- `src/features/player/ui/AssignmentPlayer.tsx` — rewritten for new types
- `src/features/player/ui/__tests__/AssignmentPlayer.test.tsx` — rewritten
- `src/entities/discussion/` — entire entity created (6 files)
- `src/entities/playlist-session/api/playlistSessionApi.ts` — created + 404 fix
- `src/entities/playlist-session/hooks/usePlaylistSession.ts` — created
- `src/entities/content/api/contentApi.ts` — removed double-nesting unwrap
- `src/features/grading/ui/GradingForm.tsx` — gradeIndex→index fix
- `src/pages/*/calendar/*.tsx` — all 3 calendar pages wired to real API
- `src/pages/learner/player/CoursePlayerPage.tsx` — useAdaptiveConfig call fix
- `src/features/playlist-engine/model/useAdaptiveConfig.ts` — new signature
- `src/features/playlist-engine/lib/mapToStaticLearningUnits.ts` — pass adaptive data
- `src/entities/learning-unit/model/types.ts` — added adaptive fields
- `src/entities/course/model/types.ts` — added adaptive settings
