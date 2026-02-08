# UI-ISS-101: Assignment Submissions Content Type

**Date:** 2026-02-08
**Status:** Completed
**Type:** Feature Implementation

## Overview

Implemented the assignment submission feature as a new content type in the course player. This allows learners to submit text and/or file-based assignments, receive grades, and optionally resubmit work.

## Implementation Details

### 1. Assignment Entity Created

**Location:** `/home/adam/github/cadencelms_ui/src/entities/assignment/`

**Structure:**
- `model/types.ts` - Type definitions for assignments and submissions
- `api/assignmentApi.ts` - API client for assignment operations
- `hooks/useAssignments.ts` - React Query hooks for data fetching and mutations

**Key Types:**
- `AssignmentType`: 'text' | 'file' | 'text_and_file'
- `SubmissionStatus`: 'draft' | 'submitted' | 'graded' | 'returned'
- `Assignment` - Assignment definition with type, file constraints, and grading settings
- `AssignmentSubmission` - Learner submission with text content, files, and grade

**API Endpoints:**
- GET `/assignments` - List assignments
- GET `/assignments/:id` - Get assignment details
- GET `/assignments/:id/my-submissions` - Get learner's submissions
- POST `/assignment-submissions` - Create submission (draft)
- PATCH `/assignment-submissions/:id` - Update submission (save draft)
- POST `/assignment-submissions/:id/submit` - Submit assignment (final)
- POST `/assignment-submissions/:id/files` - Upload file
- DELETE `/assignment-submissions/:id/files/:fileId` - Delete file
- POST `/assignment-submissions/:id/grade` - Grade submission (instructor)

### 2. AssignmentPlayer Component

**Location:** `/home/adam/github/cadencelms_ui/src/features/player/ui/AssignmentPlayer.tsx`

**Features:**
- Displays assignment description and instructions
- Text submission area for 'text' and 'text_and_file' assignments
- File upload with drag-and-drop for 'file' and 'text_and_file' assignments
- File validation (size, type, max files)
- Draft saving functionality
- Submit confirmation dialog
- Grade display with feedback
- Resubmission support (when enabled)
- Submitted content display (read-only after submission)

**Props:**
```typescript
interface AssignmentPlayerProps {
  attemptId: string;
  assignment: Assignment;
  onComplete?: () => void;
  onError?: (error: string) => void;
}
```

### 3. Course Player Integration

**Location:** `/home/adam/github/cadencelms_ui/src/pages/learner/player/CoursePlayerPage.tsx`

Added assignment routing in the `renderPlayer()` function:
- Checks for `contentType === 'assignment'`
- Extracts assignment data from content attempt
- Renders AssignmentPlayer component
- Handles completion callback to mark attempt as complete

### 4. Content Type Enum

**Location:** `/home/adam/github/cadencelms_ui/src/entities/content-attempt/model/types.ts`

Confirmed that 'assignment' was already included in the ContentType enum:
```typescript
export type ContentType = 'scorm' | 'video' | 'audio' | 'document' | 'html' | 'assignment';
```

### 5. Tests

**Location:** `/home/adam/github/cadencelms_ui/src/features/player/ui/__tests__/AssignmentPlayer.test.tsx`

**Test Coverage:**
- Renders assignment description
- Shows text area for text assignments
- Shows file upload for file assignments
- Shows both text and file input for combined type
- Loads existing draft content
- Enable/disable save draft button based on changes
- Submit button functionality
- Submission confirmation dialog
- Submitted status display
- Grade and feedback display
- Resubmission flow (when allowed)
- Loading states

**Results:** All 16 tests passing

## File Structure

```
src/entities/assignment/
├── model/
│   ├── types.ts          (Assignment and submission types)
│   └── index.ts
├── api/
│   ├── assignmentApi.ts  (API client)
│   └── index.ts
├── hooks/
│   ├── useAssignments.ts (React Query hooks)
│   └── index.ts
├── ui/
│   └── index.ts          (Placeholder)
└── index.ts

src/features/player/ui/
├── AssignmentPlayer.tsx  (Main player component)
├── __tests__/
│   └── AssignmentPlayer.test.tsx
└── index.ts              (Updated with export)

src/pages/learner/player/
└── CoursePlayerPage.tsx  (Updated with assignment routing)
```

## Verification

- TypeScript compilation: **PASSED** (0 errors)
- Unit tests: **PASSED** (16/16 tests)
- Integration: Assignment player integrated into course player routing

## UI/UX Features

1. **Draft Functionality**
   - Autosave capability
   - Resume work from previous session
   - Clear "Save Draft" button

2. **File Upload**
   - Visual upload button with file icon
   - File size and type validation
   - Display uploaded files with size
   - Delete individual files
   - Upload progress indicator

3. **Submission Flow**
   - Confirmation dialog before final submit
   - Clear warning about submission being final
   - Timestamp display for submitted work

4. **Grading Display**
   - Score and percentage shown prominently
   - Feedback section for instructor comments
   - Graded timestamp

5. **Resubmission**
   - Clear indication when resubmission is available
   - Attempt counter (e.g., "Attempt 1 of 3")
   - "Start Resubmission" button

## API Expectations

The component expects the assignment data to be embedded in the content attempt response:

```typescript
{
  id: "attempt-123",
  content: {
    type: "assignment",
    assignment: {
      id: "assignment-456",
      title: "Essay Assignment",
      description: "<p>Write about...</p>",
      type: "text_and_file",
      allowResubmission: true,
      maxSubmissions: 3,
      // ... other assignment fields
    }
  },
  // ... other attempt fields
}
```

## Next Steps

### Backend Requirements
1. Implement assignment CRUD endpoints
2. Implement submission endpoints with file upload support
3. Implement grading endpoints for instructors
4. Add assignment to content type when creating content
5. Embed assignment data in content attempt responses

### Future Enhancements
1. Rich text editor for text submissions
2. Multiple file upload at once
3. Rubric display for grading criteria
4. Peer review functionality
5. Late submission handling with penalties
6. Assignment templates

## Notes

- File upload uses FormData for multipart/form-data requests
- All mutations properly invalidate React Query cache
- Component follows existing player component patterns (VideoPlayer, ScormPlayer)
- Responsive design with max-width container
- Error handling for file validation and API errors
- Loading states for all async operations
