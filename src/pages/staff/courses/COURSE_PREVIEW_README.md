# Course Preview Feature

## Overview
The Course Preview feature allows staff members to see exactly what learners will experience when taking their course. This is a read-only preview mode that simulates the learner experience without tracking actual progress.

## Features

### 1. Course Preview Page (`CoursePreviewPage.tsx`)
The main page that displays the course preview experience.

**Features:**
- **Preview Mode Banner**: Clear indication that user is in preview mode with "Exit Preview" button
- **Course Overview**: Displays course information as learners see it
  - Course title, code, and description
  - Duration, credits, and instructor information
  - Course settings and requirements
  - Simulated progress indicators
- **Module Navigation**: Sidebar showing all modules with their status
- **Module Viewer**: Previews individual modules/lessons
- **Learner View Simulation**: Simulates locked/unlocked states based on prerequisites

**Routes:**
- `/staff/courses/:courseId/preview` - Course overview
- `/staff/courses/:courseId/preview/:moduleId` - Specific module preview

**Key Props:**
- Uses `courseId` and optional `moduleId` from URL params
- Fetches course data using `useCourse` hook
- Fetches course segments/modules using `useCourseSegments` hook
- Maintains simulated progress state locally

### 2. Course Navigation Component (`CourseNavigation.tsx`)
A sidebar component that displays the course structure and allows navigation between modules.

**Features:**
- **Module List**: Shows all modules in order
- **Progress Indicators**:
  - Checkmark for completed modules
  - Lock icon for locked modules
  - Circle for available modules
- **Overall Progress**: Progress bar showing completion percentage
- **Expandable Modules**: Click to expand/collapse module details
- **Module Status**: Shows published/draft status
- **Module Types**: Visual icons for different content types (SCORM, video, document, exercise)
- **Duration Display**: Shows module duration

**Props:**
```typescript
interface CourseNavigationProps {
  modules: CourseSegment[];
  currentModuleId?: string;
  onModuleClick: (moduleId: string) => void;
  className?: string;
  simulatedProgress?: {
    [moduleId: string]: {
      isCompleted: boolean;
      isLocked: boolean;
      progress?: number;
    };
  };
}
```

### 3. Lesson Player Preview Component (`LessonPlayerPreview.tsx`)
Displays individual module content with type-specific previews.

**Features:**
- **Content Type Previews**:
  - **SCORM**: Shows SCORM package preview with read-only indicator
  - **Video**: Simulated video player with play/pause and progress bar
  - **Document**: Document viewer preview with description
  - **Exercise/Quiz**: Preview of quiz interface with example questions
- **Navigation Controls**: Previous/Next buttons to navigate between modules
- **Progress Simulation**: Simulated progress tracking for preview purposes
- **Lock State**: Shows locked content when prerequisites aren't met
- **Completion Simulation**: "Mark as Complete" button to simulate learner actions

**Props:**
```typescript
interface LessonPlayerPreviewProps {
  module: CourseSegment;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  isLocked?: boolean;
  className?: string;
}
```

**Content Type Handling:**
- `scorm`: Displays SCORM package information with preview notice
- `video`: Shows video player interface with simulated playback
- `document`: Displays document viewer with content description
- `exercise`: Shows quiz/assessment interface with sample questions

## Usage

### Accessing Course Preview

1. **From Course Management Page:**
   ```typescript
   navigate(`/staff/courses/${courseId}/preview`);
   ```

2. **Direct Link:**
   ```
   /staff/courses/abc123/preview
   ```

3. **Preview Specific Module:**
   ```
   /staff/courses/abc123/preview/module456
   ```

### Example: Adding Preview Button to Course Editor
```typescript
import { Button } from '@/shared/ui/button';
import { Eye } from 'lucide-react';

function CourseEditorHeader({ courseId }: { courseId: string }) {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate(`/staff/courses/${courseId}/preview`)}
      className="gap-2"
    >
      <Eye className="h-4 w-4" />
      Preview as Learner
    </Button>
  );
}
```

## Data Flow

1. **Course Data**: Fetched via `useCourse(courseId)` hook
2. **Module Data**: Fetched via `useCourseSegments(courseId)` hook
3. **Simulated Progress**: Managed in local component state
4. **Module Navigation**: URL params control current view

## Simulated Progress

The preview mode simulates learner progress:

```typescript
const [simulatedProgress, setSimulatedProgress] = useState({
  [moduleId]: {
    isCompleted: false,    // Has learner completed this?
    isLocked: false,       // Is this locked by prerequisites?
    progress: 0,           // Progress percentage (0-100)
  }
});
```

**Initial State:**
- First module is unlocked
- All other modules are locked
- No modules are completed
- All progress is at 0%

**Preview Actions:**
- Click "Mark as Complete" to simulate completion
- Simulated progress updates automatically during video playback
- Navigation respects locked/unlocked states

## Integration with Existing Code

### Required Entities
- **Course**: `@/entities/course`
- **CourseSegment**: `@/entities/course-segment`

### Required Hooks
- `useCourse(courseId)` - Fetches course details
- `useCourseSegments(courseId, filters)` - Fetches course modules

### UI Components Used
- shadcn/ui Card, Button, Badge, Progress, Alert
- Lucide React icons
- Custom utility functions from `@/shared/lib/utils`

## Preview Mode Limitations

The preview is **read-only** and does not:
- Track actual learner progress
- Save completion status
- Record scores or attempts
- Launch actual SCORM content
- Play actual videos (shows simulation)
- Submit quiz answers

These are intentional limitations to provide a safe preview environment without affecting actual course data.

## Styling & Design

- Uses consistent shadcn/ui components
- Responsive layout with sidebar navigation
- Clear visual indicators for preview mode
- Accessibility-friendly with proper ARIA labels
- Mobile-responsive grid layout

## Future Enhancements

Potential improvements:
1. **Full SCORM Preview**: Embed actual SCORM player in sandboxed iframe
2. **Real Video Playback**: Show actual video content with controls disabled
3. **Interactive Quiz Preview**: Allow staff to go through quiz questions
4. **Progress Persistence**: Save preview progress in localStorage
5. **Multi-user Preview**: Simulate different learner personas
6. **Analytics Preview**: Show how analytics will track learner activity
7. **Mobile Preview Mode**: Toggle between desktop/mobile views
8. **Certificate Preview**: Show what certificate learners will receive

## Troubleshooting

### Module Not Loading
- Check that courseId and moduleId are valid
- Verify API endpoints are working
- Check browser console for errors

### Navigation Not Working
- Ensure React Router is properly configured
- Verify route paths match exactly
- Check that navigate function is available

### Styling Issues
- Verify Tailwind CSS is configured
- Check that shadcn/ui components are installed
- Ensure global styles are imported

## Related Files

**Pages:**
- `/src/pages/staff/courses/CoursePreviewPage.tsx`

**Components:**
- `/src/features/courses/ui/CourseNavigation.tsx`
- `/src/features/courses/ui/LessonPlayerPreview.tsx`

**Routing:**
- `/src/app/routing/index.tsx`

**Entities:**
- `/src/entities/course/`
- `/src/entities/course-segment/`

## Support

For issues or questions:
1. Check the component prop types
2. Review the API contracts
3. Test with sample course data
4. Check browser console for errors
