# Course Management Page

Comprehensive admin interface for managing courses in the LMS.

## Features

### Core Functionality
- **CRUD Operations**: Create, read, update, and delete courses
- **Bulk Selection**: Select multiple courses for batch operations
- **Search & Filter**: Filter courses by status, department, program, and instructor
- **Responsive Design**: Optimized for desktop and mobile viewing

### Course Actions
- **Create/Edit**: Full form with validation for course details and settings
- **Delete**: Confirmation dialog with warning about cascading deletes
- **Publish/Unpublish**: Control course visibility to students
- **Archive**: Archive outdated courses while preserving data
- **Duplicate**: Create copies of courses with configurable options
- **Export**: Export courses in multiple formats (JSON, PDF, SCORM, xAPI)
- **View Segments**: Navigate to course module/segment management

### Data Display
The table displays the following course information:
- Code (unique identifier)
- Title and description
- Department and program
- Credits and duration
- Status (draft, published, archived)
- Instructors (with overflow handling)
- Module count (clickable link)
- Enrollment count
- Created date

### Filters
- **Search**: Full-text search across course fields
- **Status**: Filter by draft, published, or archived
- **Department**: Filter by department ID
- **Program**: Filter by program ID
- **Instructor**: Filter by instructor ID

## Usage

```tsx
import { CourseManagementPage } from '@/pages/admin/courses';

// In your router configuration
<Route path="/admin/courses" element={<CourseManagementPage />} />
```

## Dependencies

### Entities
- `@/entities/course`: Course entity with types, hooks, and components

### Shared UI Components
- `DataTable`: Table with sorting, filtering, and pagination
- `Dialog`: Modal dialogs for forms
- `ConfirmDialog`: Confirmation dialogs for destructive actions
- `Select`, `Input`, `Button`, `Badge`, `Checkbox`, `Label`: Form controls
- `DropdownMenu`: Action menus

### Hooks
- `useCourses`: Fetch course list with filters
- `useCreateCourse`: Create new course
- `useUpdateCourse`: Update existing course
- `useDeleteCourse`: Delete course
- `usePublishCourse`: Publish course
- `useUnpublishCourse`: Unpublish course
- `useArchiveCourse`: Archive course
- `useDuplicateCourse`: Duplicate course

## State Management

The component uses local React state for:
- Dialog visibility and types
- Selected courses for bulk operations
- Course being edited or acted upon
- Filter values
- Form data for duplicate and export operations

All server state is managed through React Query hooks from the course entity.

## Navigation

Clicking the module count navigates to:
```
/admin/courses/{courseId}/segments
```

## Error Handling

- API errors are caught and displayed using toast notifications
- Loading states are shown during async operations
- Form validation prevents invalid submissions
- Confirmation dialogs prevent accidental destructive actions

## Accessibility

- Semantic HTML structure
- ARIA labels for icon buttons
- Keyboard navigation support
- Screen reader friendly
- Focus management in dialogs

## Future Enhancements

- Bulk operations (delete, publish, archive multiple courses)
- Advanced filtering with date ranges
- Export to Excel/CSV
- Course templates
- Import courses from file
- Drag-and-drop reordering
- Preview mode
