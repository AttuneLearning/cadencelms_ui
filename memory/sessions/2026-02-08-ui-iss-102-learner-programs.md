# UI-ISS-102: Learning Paths & Programs — Learner View

**Date:** 2026-02-08
**Status:** Complete
**Issue:** UI-ISS-102

## Overview

Implemented learner-facing pages for Programs/Learning Paths. Previously, programs only had staff management features with no learner experience.

## What Was Built

### 1. API Layer (`src/entities/program/api/learnerProgramApi.ts`)

Created learner-specific API client with endpoints:
- `GET /enrollments/my/programs` - List learner's enrolled programs with progress
- `GET /programs/:id/learner` - Get program detail for learner with course list and progress

**Key Types:**
- `LearnerProgram` - Program list item with enrollment and progress
- `LearnerProgramDetail` - Full program details with courses, certificate info, statistics
- `ProgramCourseItem` - Course within a program showing status (completed, in-progress, locked, available)

### 2. React Query Hooks (`src/entities/program/hooks/useLearnerPrograms.ts`)

Created learner-specific hooks:
- `useMyPrograms()` - Fetches list of enrolled programs with pagination
- `useProgramForLearner(id)` - Fetches program detail with course sequence and progress

Added query keys to `programKeys`:
- `myPrograms(params)` - Key for learner's program list
- `learnerDetail(id)` - Key for learner's program detail view

### 3. MyProgramsPage (`src/pages/learner/programs/MyProgramsPage.tsx`)

**Features:**
- Grid layout of program cards showing:
  - Program name, description, credential type (certificate/diploma/degree)
  - Department and duration
  - Overall progress bar with percentage
  - Course completion stats (X of Y courses completed)
  - Certificate availability indicator
  - Status badge (active/completed/withdrawn)
  - "Continue Learning" or "View Details" button
- Loading skeletons
- Empty state with link to course catalog
- Error handling
- Pagination support

### 4. ProgramDetailPage (`src/pages/learner/programs/ProgramDetailPage.tsx`)

**Features:**
- Program header with title and description
- Info cards showing:
  - Department
  - Credential type
  - Duration
- Overall progress card with:
  - Percentage and progress bar
  - Course completion count
  - "Continue to [next course]" button
- Certificate card showing:
  - Availability upon completion (if not yet issued)
  - Certificate title and progress toward completion
  - Link to view certificate (if issued)
  - Completion badge
- Course sequence section displaying all courses with:
  - Course title, code, description
  - Level information
  - Status icon and badge:
    - ✓ Completed (green)
    - → In Progress (blue)
    - ○ Available (gray)
    - 🔒 Locked (gray, with prerequisite message)
  - Progress bar for enrolled courses
  - "Continue", "Review", or "Start Course" buttons
- Error handling and loading states

### 5. Routes (`src/app/router/index.tsx`)

Added learner-only routes:
- `/learner/programs` → MyProgramsPage
- `/learner/programs/:programId` → ProgramDetailPage

### 6. Sidebar Navigation (`src/widgets/sidebar/config/navItems.ts`)

Added "My Programs" link to learner context navigation using Award icon.

### 7. Tests

**MyProgramsPage Tests** (8 tests):
- Loading state rendering
- Program list display
- Progress display for active programs
- Completed program badges
- Certificate availability messages
- Empty state
- Error state
- Credential badge rendering

**ProgramDetailPage Tests** (10 tests):
- Loading state rendering
- Program detail display
- Info card display
- Overall progress display
- Course status display (completed, in-progress, available, locked)
- Continue button functionality
- Certificate information for uncompleted programs
- Issued certificate message for completed programs
- Error handling
- Locked course prerequisite messages

## Architecture Decisions

### API Design
- Learner-specific endpoints follow the pattern `/enrollments/my/*` for user-owned data
- Program detail endpoint includes computed `status` field for each course (completed/in-progress/locked/available)
- Progress is denormalized at program level for performance

### Component Structure
- Followed FSD (Feature-Sliced Design) architecture
- Entity layer handles API and hooks
- Page layer handles UI and composition
- Separated concerns: API → Hooks → Pages

### UX Decisions
- Course sequence shows all courses upfront (no hidden levels)
- Status icons provide quick visual feedback
- Locked courses explain prerequisites
- Next incomplete course is highlighted in "Continue" CTA
- Certificate information is prominent to motivate completion

## Testing

All tests passing:
```
✓ MyProgramsPage.test.tsx (8 tests)
✓ ProgramDetailPage.test.tsx (10 tests)
Total: 18 tests passed
```

TypeScript compilation: 0 errors in program-related code

## Files Created

- `src/entities/program/api/learnerProgramApi.ts`
- `src/entities/program/hooks/useLearnerPrograms.ts`
- `src/pages/learner/programs/MyProgramsPage.tsx`
- `src/pages/learner/programs/ProgramDetailPage.tsx`
- `src/pages/learner/programs/index.ts`
- `src/pages/learner/programs/__tests__/MyProgramsPage.test.tsx`
- `src/pages/learner/programs/__tests__/ProgramDetailPage.test.tsx`

## Files Modified

- `src/entities/program/model/programKeys.ts` - Added learner query keys
- `src/entities/program/hooks/index.ts` - Exported learner hooks
- `src/entities/program/index.ts` - Exported learner hooks
- `src/app/router/index.tsx` - Added program routes
- `src/widgets/sidebar/config/navItems.ts` - Added "My Programs" nav item

## Future Enhancements

Potential improvements for future iterations:
1. Add filtering/sorting on MyProgramsPage (by status, completion, etc.)
2. Add search functionality for programs
3. Implement program recommendations
4. Add detailed analytics (time spent, estimated completion date)
5. Add social features (cohort view, peer progress)
6. Implement prerequisite visualization graph
7. Add program-level achievements/badges

## Notes

- Certificate issuance is handled by the backend when program is completed
- Course status calculation (locked/available) is done server-side based on prerequisites
- Progress calculation is atomic (based on actual course completion, not subjective assessment)
- Program enrollment is managed separately from course enrollments
