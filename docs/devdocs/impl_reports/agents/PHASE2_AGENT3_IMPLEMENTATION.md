# Phase 2 Agent 3: Content Viewer & Progress Tracking - Implementation Guide

## Overview
Agent 3 is responsible for building the Content Viewer widget and Progress Tracking features for Phase 2 of the LMS UI v2 project.

## Branch
`feat/phase2-content-progress`

## Components to Implement

### 1. Content Viewer Widget (`src/widgets/content-viewer/`)

This widget provides a unified interface for displaying different types of learning content.

**Directory Structure:**
```
src/widgets/content-viewer/
├── ui/
│   ├── VideoPlayer.tsx          - HTML5 video player with custom controls
│   ├── DocumentViewer.tsx       - PDF/document viewer with zoom
│   ├── ExternalLinkViewer.tsx   - External content iframe viewer
│   └── ContentViewer.tsx        - Main router component
└── index.ts                     - Public exports
```

**Features:**
- **VideoPlayer**: Native HTML5 video playback with play/pause, seek, volume, fullscreen, skip forward/back (10s)
- **DocumentViewer**: PDF display with zoom controls (50%-200%), download option, scroll progress tracking
- **ExternalLinkViewer**: Iframe embedding with fallback for blocked content
- **ContentViewer**: Routes to appropriate viewer based on content type (video, document, external-link, scorm, quiz, assignment)

**Key APIs:**
```typescript
interface ContentViewerProps {
  content: ViewableContent;
  onProgress?: (data: { currentTime?: number; duration?: number; percent?: number; scrollPercent?: number }) => void;
  onComplete?: () => void;
  initialPosition?: number;
  className?: string;
}
```

### 2. Progress Tracking Feature (`src/features/content-progress/`)

This feature handles all progress tracking logic and UI components.

**Directory Structure:**
```
src/features/content-progress/
├── lib/
│   └── useProgressTracker.ts    - Main progress tracking hook
├── ui/
│   ├── ProgressBar.tsx          - Visual progress indicator
│   ├── TimeSpentDisplay.tsx     - Time formatting component
│   └── LessonCompleteButton.tsx - Mark complete button
└── index.ts                     - Public exports
```

**Features:**
- **useProgressTracker**: Custom hook that automatically tracks time spent, auto-saves every 30s, handles start/stop/complete
- **ProgressBar**: Visual progress bar with 3 sizes (sm/md/lg) and 3 variants (default/success/warning)
- **TimeSpentDisplay**: Formats seconds to readable time (short: "0:00", long: "X hours, Y minutes")
- **LessonCompleteButton**: Button with loading/success states and toast notifications

**Key Hook API:**
```typescript
const {
  timeSpent,        // Current time in seconds
  lastPosition,     // Last video/scroll position
  isTracking,       // Whether actively tracking
  startTracking,    // Start tracking time
  stopTracking,     // Stop tracking time
  updateProgress,   // Manual progress update
  completeLesson,   // Mark lesson complete
} = useProgressTracker({
  courseId: string,
  lessonId: string,
  autoSaveInterval?: number,  // Default 30000ms
  enabled?: boolean,          // Default true
});
```

### 3. Lesson Player Page (`src/pages/learner/lesson/`)

The main page for viewing lesson content.

**Directory Structure:**
```
src/pages/learner/lesson/
├── LessonPlayerPage.tsx         - Main lesson player
└── index.ts                     - Public exports
```

**Features:**
- Loads lesson and progress data via React Query
- Displays ContentViewer with lesson content
- Automatic progress tracking on mount
- Previous/Next lesson navigation
- Lesson information panel
- Time spent display in header
- Mark as complete button
- Breadcrumb navigation
- Loading and error states

**Route:**
`/courses/:courseId/lessons/:lessonId`

### 4. Progress Dashboard Widget (`src/widgets/progress-dashboard/`)

Displays user progress statistics and activity.

**Directory Structure:**
```
src/widgets/progress-dashboard/
├── ui/
│   ├── ProgressStats.tsx        - Overall statistics cards
│   ├── CourseProgressCard.tsx   - Individual course progress
│   ├── ActivityTimeline.tsx     - Recent activity timeline
│   └── ProgressDashboard.tsx    - Main dashboard component
└── index.ts                     - Public exports
```

**Features:**
- **ProgressStats**: 6 stat cards (lessons completed, time spent, avg score, courses in progress/completed, streak)
- **CourseProgressCard**: Card showing single course progress with link to course
- **ActivityTimeline**: Chronological activity list with icons, badges, relative timestamps
- **ProgressDashboard**: Combines all components, fetches data, handles loading/error states

## Shared Components

### Progress Component (`src/shared/ui/progress.tsx`)

Radix UI progress bar primitive component. Must be added to `src/shared/ui/index.ts` exports.

```typescript
import { Progress } from '@/shared/ui/progress';
<Progress value={75} className="h-2" />
```

## Dependencies

### NPM Packages
```bash
npm install @radix-ui/react-progress
```

Already installed:
- `@tanstack/react-query` - Data fetching
- `date-fns` - Date formatting
- `lucide-react` - Icons

## Entity APIs Used

### Lesson API (`@/entities/lesson/api/lessonApi`)
- `getById(courseId, lessonId)` - Get single lesson
- `getListByCourseId(courseId)` - Get all lessons (for navigation)
- `getNext(courseId, currentLessonId?)` - Get next lesson

### Progress API (`@/entities/progress/api/progressApi`)
- `getLessonProgress(courseId, lessonId)` - Get progress for lesson
- `getCourseProgress(courseId)` - Get progress for entire course
- `startLesson(courseId, lessonId)` - Mark lesson as started
- `updateLessonProgress(courseId, lessonId, data)` - Update progress
- `completeLesson(courseId, lessonId, data?)` - Mark lesson complete
- `getStats()` - Get overall user statistics

## Implementation Checklist

### Setup
- [x] Create branch `feat/phase2-content-progress`
- [ ] Install @radix-ui/react-progress
- [ ] Create directory structure

### Content Viewer Widget
- [ ] Create `src/widgets/content-viewer/ui/VideoPlayer.tsx`
- [ ] Create `src/widgets/content-viewer/ui/DocumentViewer.tsx`
- [ ] Create `src/widgets/content-viewer/ui/ExternalLinkViewer.tsx`
- [ ] Create `src/widgets/content-viewer/ui/ContentViewer.tsx`
- [ ] Create `src/widgets/content-viewer/index.ts`

### Progress Tracking Feature
- [ ] Create `src/features/content-progress/lib/useProgressTracker.ts`
- [ ] Create `src/features/content-progress/ui/ProgressBar.tsx`
- [ ] Create `src/features/content-progress/ui/TimeSpentDisplay.tsx`
- [ ] Create `src/features/content-progress/ui/LessonCompleteButton.tsx`
- [ ] Create `src/features/content-progress/index.ts`

### Lesson Player Page
- [ ] Create `src/pages/learner/lesson/LessonPlayerPage.tsx`
- [ ] Create `src/pages/learner/lesson/index.ts`

### Progress Dashboard Widget
- [ ] Create `src/widgets/progress-dashboard/ui/ProgressStats.tsx`
- [ ] Create `src/widgets/progress-dashboard/ui/CourseProgressCard.tsx`
- [ ] Create `src/widgets/progress-dashboard/ui/ActivityTimeline.tsx`
- [ ] Create `src/widgets/progress-dashboard/ui/ProgressDashboard.tsx`
- [ ] Create `src/widgets/progress-dashboard/index.ts`

### Shared Components
- [ ] Create `src/shared/ui/progress.tsx`
- [ ] Add progress export to `src/shared/ui/index.ts`

### Testing
- [ ] Test video playback and controls
- [ ] Test document viewing and zoom
- [ ] Test external link embedding
- [ ] Test progress tracking auto-save
- [ ] Test lesson navigation (prev/next)
- [ ] Test mark as complete
- [ ] Test progress dashboard displays
- [ ] Test offline compatibility

## Key Design Decisions

### 1. Progress Tracking Architecture
- **Client-side tracking**: Time tracking happens in browser for accuracy
- **Auto-save**: Progress saved every 30 seconds to minimize data loss
- **Position tracking**: Last position (video time or scroll %) saved for resume functionality
- **Manual completion**: Users must explicitly mark lessons complete (not automatic)

### 2. Content Type Handling
- **Type-based routing**: ContentViewer routes to specific viewer based on content type
- **Graceful degradation**: Unsupported content types show informative placeholders
- **Extensibility**: Easy to add new content types (quiz, SCORM, etc.)

### 3. Offline-Ready Design
- React Query with persistence enabled
- Auto-save progress locally
- Sync when connection restored
- Graceful handling of network errors

### 4. User Experience
- **Responsive design**: Works on mobile, tablet, desktop
- **Dark mode support**: Uses Tailwind CSS theme
- **Accessibility**: ARIA labels, keyboard navigation
- **Loading states**: Skeleton screens and spinners
- **Error handling**: User-friendly error messages with retry options

## Content Type Support

### Currently Supported
1. **Video** (`type: 'video'`): HTML5 video player
2. **Document** (`type: 'document'`): PDF/document viewer
3. **External Link** (`type: 'external-link'`): Iframe embed

### Placeholders Added
1. **SCORM** (`type: 'scorm'`): Shows "Coming soon" message
2. **Quiz** (`type: 'quiz'`): Shows "Coming soon" message
3. **Assignment** (`type: 'assignment'`): Shows "Coming soon" message

## Progress Tracking Workflow

1. **User navigates to lesson** → `LessonPlayerPage` loads
2. **Page loads lesson data** → React Query fetches lesson + progress
3. **Progress tracker starts** → `useProgressTracker` hook initializes
4. **Start API call** → `progressApi.startLesson()` called
5. **User views content** → Time tracked every second
6. **Auto-save** → Every 30s, progress saved via `updateLessonProgress()`
7. **User completes** → Clicks "Mark as Complete" button
8. **Complete API call** → `progressApi.completeLesson()` called
9. **Progress updated** → React Query cache invalidated, UI updates

## Testing Scenarios

### Manual Testing
1. **Video Player**:
   - Play/pause works
   - Seek bar updates and is clickable
   - Volume mute/unmute works
   - Fullscreen works
   - Skip forward/back works
   - Time display accurate

2. **Progress Tracking**:
   - Time starts when lesson loads
   - Auto-saves every 30 seconds (check network tab)
   - Resumes from last position
   - Completes successfully
   - Progress persists on refresh

3. **Navigation**:
   - Previous/Next buttons work
   - Previous disabled on first lesson
   - Next disabled on last lesson
   - Back to course works

4. **Dashboard**:
   - Stats display correctly
   - Course cards show progress
   - Activity timeline shows recent items
   - All links work

## File Templates

### VideoPlayer Template (485 lines)
See full implementation in `/tmp/VideoPlayer.tsx`

### ProgressTracker Hook Template (229 lines)
See full implementation in `/tmp/useProgressTracker.ts`

### LessonPlayerPage Template (320 lines)
See full implementation in `/tmp/LessonPlayerPage.tsx`

## Integration Points

### Router Integration
Add route to `src/app/router/index.tsx`:
```typescript
import { LessonPlayerPage } from '@/pages/learner/lesson';

// In routes array
{
  path: '/courses/:courseId/lessons/:lessonId',
  element: <LessonPlayerPage />,
}
```

### Dashboard Integration
Use ProgressDashboard in dashboard page:
```typescript
import { ProgressDashboard } from '@/widgets/progress-dashboard';
import { useAuth } from '@/features/auth';

const DashboardPage = () => {
  const { user } = useAuth();
  return <ProgressDashboard userId={user.id} />;
};
```

## Notes for Next Agent

- Entity UI components completed by Agent 1 (course, lesson entities)
- Routing setup may need lesson player route added
- Progress entity APIs are ready to use
- Consider adding unit tests for progress tracker hook
- May want to add video playback speed control in future
- Consider adding bookmarks/notes feature in future

## Offline Considerations

This implementation is designed to work with offline infrastructure (Phase 3):

1. **React Query persistence**: Progress data cached in IndexedDB
2. **Auto-save queue**: Progress updates queued when offline
3. **Optimistic updates**: UI updates immediately, syncs later
4. **Error handling**: Graceful handling of network failures
5. **Resume support**: Last position saved for offline resume

## Success Criteria

- [ ] All content types display correctly
- [ ] Video player fully functional
- [ ] Progress tracking accurate
- [ ] Auto-save working (verify in network tab)
- [ ] Lesson navigation working
- [ ] Mark complete functional
- [ ] Dashboard displays stats
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Works on mobile
- [ ] Works in dark mode

## Next Steps After Completion

1. Add lesson player route to router
2. Test integration with course viewer page
3. Add unit tests for critical functions
4. Consider adding E2E tests for lesson flow
5. Document any API changes needed
6. Prepare for Phase 3 offline enhancements
