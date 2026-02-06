# Session: UI-ISS-072 Matching Game Page Implementation

**Date:** 2026-02-06
**Issue:** UI-ISS-072 - Missing Create Matching Game Page
**Status:** REVIEW (ready for merge)

## Summary

Implemented the matching-builder feature for module-level matching exercise authoring.

## Files Created

### Feature: matching-builder

| File | Description |
|------|-------------|
| `src/features/matching-builder/api/matchingBuilderApi.ts` | API client for module-level CRUD |
| `src/features/matching-builder/model/useMatchingBuilder.ts` | React Query hooks with optimistic updates |
| `src/features/matching-builder/ui/MatchingPairEditor.tsx` | Modal editor with hints support |
| `src/features/matching-builder/ui/MatchingPairList.tsx` | Sortable drag-drop list |
| `src/features/matching-builder/ui/MatchingBulkImport.tsx` | CSV import with preview |
| `src/features/matching-builder/ui/__tests__/MatchingPairList.test.tsx` | Unit tests (7 passing) |
| `src/features/matching-builder/index.ts` | Feature exports |

### Page

| File | Description |
|------|-------------|
| `src/pages/staff/courses/MatchingGamePage.tsx` | Full page component with create/edit modes |

### Router

| File | Change |
|------|--------|
| `src/app/router/index.tsx` | Added import and route for MatchingGamePage |

## API Endpoints Used

- `GET/POST /api/v2/modules/:moduleId/matching-exercises`
- `GET/PUT/DELETE /api/v2/modules/:moduleId/matching-exercises/:exerciseId`
- `PUT /api/v2/modules/:moduleId/matching-exercises/:exerciseId/pairs`
- `POST /api/v2/modules/:moduleId/matching-exercises/:exerciseId/pairs/bulk`
- `PATCH /api/v2/modules/:moduleId/matching-exercises/:exerciseId/pairs/reorder`

## Route

`/staff/courses/:courseId/modules/:moduleId/matching`

## Patterns Used

- FSD (Feature-Sliced Design) architecture
- React Query with optimistic updates for reordering
- @dnd-kit for drag-drop sortable lists
- shadcn/ui components with react-hook-form
- Zod validation

## Features

- Drag-drop pair reordering with optimistic updates
- Hints support for left-side (prompt) items
- Explanations for right-side (answer) items
- CSV bulk import with preview and validation
- Advanced settings (time limit, attempts, points, shuffle, feedback)
- Create mode (local state) and Edit mode (API-connected)

## Tests

- 7 MatchingPairList tests passing

## Verification

- TypeScript: No new errors (pre-existing errors in codebase)
- Tests: 7 passing

## Next Steps

1. Commit the changes
2. Add "Create Matching Game" CTA to module editor
3. Test API integration when endpoints are deployed

## Related

- API-ISS-009, API-ISS-011 (API implementation)
- UI-ISS-071 (Flashcard Deck Page - same pattern)
- `src/features/matching-player/` (Existing learner player)
- `src/pages/staff/MatchGameBuilderPage.tsx` (Existing standalone builder)
