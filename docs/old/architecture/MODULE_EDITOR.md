# Module/Lesson Editor Documentation

The Module/Lesson Editor allows staff to organize content into structured lessons within course modules.

## Overview

The editor provides:
- **Module details editing** - Update title, description, and duration
- **Lesson management** - Add, remove, and reorder lessons
- **Drag-and-drop** - Intuitive lesson reordering
- **Lesson settings** - Configure completion criteria and unlock conditions
- **Preview** - See how learners will experience the module

## Components

### ModuleEditorPage

Main page component for editing module lessons.

**Route:** `/staff/courses/:courseId/modules/:moduleId/edit`

**Features:**
- Fetches and displays module details
- Lists all lessons in the module
- Drag-and-drop reordering with `@dnd-kit`
- Sidebar with module summary
- Save/cancel actions

**Example usage:**
```tsx
// Navigate to module editor
navigate(`/staff/courses/${courseId}/modules/${moduleId}/edit`);
```

### LessonItem

Individual lesson component with drag handle and actions menu.

**Props:**
- `lesson: LessonListItem` - Lesson data
- `onEdit: (lesson) => void` - Edit settings callback
- `onRemove: (lessonId) => void` - Remove lesson callback
- `onPreview?: (lesson) => void` - Optional preview callback

**Features:**
- Content type icon and badge
- Duration display
- Required/Optional badge
- Completion criteria display
- Actions menu (Edit Settings, Preview, Remove)
- Drag handle for reordering

**Example:**
```tsx
<LessonItem
  lesson={lesson}
  onEdit={handleEditLesson}
  onRemove={handleRemoveLesson}
  onPreview={handlePreviewLesson}
/>
```

### LessonSettingsDialog

Dialog for configuring lesson completion criteria and unlock conditions.

**Props:**
- `open: boolean` - Dialog open state
- `onOpenChange: (open) => void` - Open state callback
- `lesson: LessonListItem | null` - Current lesson being edited
- `availablePreviousLessons?: Array<{id, title}>` - Lessons that can be prerequisites
- `onSave: (lessonId, settings) => void` - Save settings callback

**Features:**
- Custom title override
- Required/Optional toggle
- Completion criteria configuration:
  - View time percentage
  - Quiz passing score
  - Manual completion
  - Auto-complete on launch
- Unlock conditions:
  - Previous lesson requirement
  - Delay after enrollment

**Example:**
```tsx
<LessonSettingsDialog
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  lesson={selectedLesson}
  availablePreviousLessons={previousLessons}
  onSave={handleSaveLessonSettings}
/>
```

## Types

### Lesson Types (`lessonTypes.ts`)

**CompletionCriteriaType:**
- `view_time` - Must view X% of content
- `quiz_score` - Must achieve X% score
- `manual` - Staff manually marks complete
- `auto` - Auto-complete on launch

**CompletionCriteria:**
```typescript
{
  type: CompletionCriteriaType;
  requiredPercentage?: number;    // For view_time (0-100)
  minimumScore?: number;           // For quiz_score (0-100)
  allowEarlyCompletion?: boolean;  // Can complete before criteria met
}
```

**LessonSettings:**
```typescript
{
  isRequired: boolean;
  completionCriteria: CompletionCriteria;
  unlockConditions?: {
    previousLessonId?: string;     // Must complete this lesson first
    delayMinutes?: number;         // Must wait X minutes after enrollment
  };
  customTitle?: string;            // Override content title
}
```

**LessonListItem:**
```typescript
{
  id: string;
  order: number;
  title: string;
  type: ContentType;
  duration: number | null;
  settings: LessonSettings;
  isPublished: boolean;
}
```

## Drag-and-Drop Implementation

The editor uses `@dnd-kit` for drag-and-drop functionality.

**Setup:**
```tsx
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
);

const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  if (over && active.id !== over.id) {
    setLessons((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  }
};
```

**Usage:**
```tsx
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <SortableContext
    items={lessons.map((l) => l.id)}
    strategy={verticalListSortingStrategy}
  >
    {lessons.map((lesson) => (
      <LessonItem key={lesson.id} lesson={lesson} {...handlers} />
    ))}
  </SortableContext>
</DndContext>
```

## API Integration

### Current Implementation

The current implementation uses the existing course-segment API and maintains lessons in local state. In a production environment, you would integrate with a lessons API.

### Suggested API Endpoints

```typescript
// List lessons in a module
GET /api/v2/courses/:courseId/modules/:moduleId/lessons

// Get lesson details
GET /api/v2/courses/:courseId/modules/:moduleId/lessons/:lessonId

// Add lesson to module
POST /api/v2/courses/:courseId/modules/:moduleId/lessons
{
  contentId: string;
  order: number;
  settings: LessonSettings;
}

// Update lesson settings
PUT /api/v2/courses/:courseId/modules/:moduleId/lessons/:lessonId
{
  settings: Partial<LessonSettings>;
}

// Remove lesson from module
DELETE /api/v2/courses/:courseId/modules/:moduleId/lessons/:lessonId

// Reorder lessons
PATCH /api/v2/courses/:courseId/modules/:moduleId/lessons/reorder
{
  lessonIds: string[];
}
```

### Creating API Hooks

```typescript
// In entities/course-segment/api/lessonApi.ts
export async function listModuleLessons(
  courseId: string,
  moduleId: string
): Promise<LessonListItem[]> {
  const response = await client.get(
    `/api/v2/courses/${courseId}/modules/${moduleId}/lessons`
  );
  return response.data.data;
}

// In entities/course-segment/hooks/useLessons.ts
export function useModuleLessons(courseId: string, moduleId: string) {
  return useQuery({
    queryKey: ['lessons', courseId, moduleId],
    queryFn: () => listModuleLessons(courseId, moduleId),
    enabled: !!courseId && !!moduleId,
  });
}
```

## File Structure

```
src/
├── entities/
│   └── course-segment/
│       ├── model/
│       │   ├── types.ts              # Course segment types
│       │   └── lessonTypes.ts        # Lesson-specific types
│       ├── api/
│       │   └── courseSegmentApi.ts   # API methods
│       └── hooks/
│           └── useCourseSegments.ts  # React Query hooks
├── features/
│   └── courses/
│       ├── ui/
│       │   ├── LessonItem.tsx        # Lesson list item component
│       │   └── LessonSettingsDialog.tsx  # Settings dialog
│       └── index.ts                  # Public API
└── pages/
    └── staff/
        └── courses/
            └── ModuleEditorPage.tsx  # Main editor page
```

## Styling and UI

The editor uses shadcn/ui components for consistent styling:

- **Card** - Module details and lesson list containers
- **Dialog** - Lesson settings configuration
- **Button** - Actions and form controls
- **Badge** - Required/Optional, Draft indicators
- **Input/Textarea** - Form fields
- **Select** - Dropdown selections
- **Switch** - Toggle controls
- **Separator** - Visual dividers

## Accessibility

The editor includes accessibility features:

- **Keyboard navigation** - Full keyboard support for drag-and-drop
- **ARIA labels** - Descriptive labels for screen readers
- **Focus management** - Proper focus handling in dialogs
- **Semantic HTML** - Proper heading hierarchy and landmarks

## Future Enhancements

Potential improvements:

1. **Content Selector** - Modal to browse and select content from library
2. **Bulk Operations** - Select multiple lessons for batch actions
3. **Lesson Preview** - Preview content directly in the editor
4. **Conditional Logic** - Advanced unlock conditions and branching
5. **Analytics** - Show completion rates and engagement metrics
6. **Templates** - Save and reuse common lesson structures
7. **Version History** - Track changes and revert if needed
8. **Collaborative Editing** - Real-time updates for multiple editors

## Testing

Example test cases:

```typescript
describe('ModuleEditorPage', () => {
  it('loads module details', () => {
    // Test module data fetching and display
  });

  it('reorders lessons via drag-and-drop', () => {
    // Test drag-and-drop functionality
  });

  it('saves lesson settings', () => {
    // Test settings dialog and save
  });

  it('removes lessons', () => {
    // Test lesson removal
  });
});
```

## Troubleshooting

**Issue:** Lessons not reordering
- Check that lesson IDs are unique
- Verify `sortableKeyboardCoordinates` is imported correctly
- Ensure `arrayMove` is updating state properly

**Issue:** Dialog not opening
- Verify `selectedLesson` is set before opening
- Check dialog `open` state management
- Ensure dialog triggers are not disabled

**Issue:** Settings not saving
- Verify API endpoints are correct
- Check form validation
- Ensure mutation callbacks are invalidating queries
