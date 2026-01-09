# Class Management Page

Comprehensive admin interface for managing classes with full CRUD operations, roster management, and enrollment capabilities.

## Features

### Core Functionality
- **List View**: Paginated table of all classes with sorting and filtering
- **Create/Edit**: Modal dialog with ClassForm for creating and updating classes
- **Delete**: Single and bulk delete operations with confirmation dialogs
- **Search & Filter**: Filter by status, course, program, instructor, term, and search

### Class Information Display
- Class name and course details
- Program and level information
- Instructor assignments (primary and secondary)
- Start and end dates
- Enrollment counts with capacity indicators
- Status badges (upcoming, active, completed, cancelled)
- Academic term information

### Enrollment Management
- **View Roster**: Modal showing all enrolled learners with progress tracking
- **Manage Enrollments**: Add or remove learners from classes
- **Drop Learners**: Remove learners with confirmation and reason tracking
- **Enrollment Status**: Visual indicators for full, available, and waitlist states
- **Progress Tracking**: View learner completion percentages and scores

### Actions
- Edit class details
- View class roster with progress
- Manage class enrollments
- Add learners to class
- Drop learners from class
- Delete single class
- Bulk delete multiple classes

## Usage

```tsx
import { ClassManagementPage } from '@/pages/admin/classes';

// In your router
<Route path="/admin/classes" element={<ClassManagementPage />} />
```

## Components Used

### From @/entities/class
- `useClasses` - Fetch classes with filters
- `useCreateClass` - Create new class
- `useUpdateClass` - Update existing class
- `useDeleteClass` - Delete class
- `useClassRoster` - Fetch class roster
- `useClassEnrollments` - Fetch enrollments
- `useEnrollLearners` - Add learners to class
- `useDropLearner` - Remove learner from class
- `ClassForm` - Form component for create/edit

### From @/shared/ui
- `DataTable` - Table with sorting, filtering, pagination
- `Button`, `Badge`, `Checkbox` - Basic UI components
- `Dialog` - Modal dialogs for forms and views
- `Select`, `Input`, `Label` - Form controls
- `DropdownMenu` - Action menus
- `ConfirmDialog` - Confirmation dialogs
- `Skeleton` - Loading states

## State Management

The page manages several pieces of local state:
- `selectedClasses` - Selected rows for bulk operations
- `classToEdit` - Class being edited
- `classToDelete` - Class to be deleted (for confirmation)
- `rosterClassId` - Class ID for roster view
- `enrollmentClassId` - Class ID for enrollment management
- `filters` - Active filters (status, course, program, instructor, term, search)

## API Integration

Uses React Query hooks for all server operations:
- Automatic cache invalidation after mutations
- Loading and error states
- Optimistic updates
- Toast notifications for user feedback

## Responsive Design

- Mobile-friendly layout
- Responsive table columns
- Stacked filters on smaller screens
- Scrollable modals for mobile devices

## Error Handling

- Toast notifications for all operations
- Error messages from API displayed to user
- Confirmation dialogs for destructive actions
- Loading states during async operations

## Future Enhancements

- Advanced filtering (date ranges, instructor selection)
- Export roster to CSV
- Bulk enrollment operations
- Class duplication/cloning
- Waitlist management
- Email notifications for enrollment changes
- Integration with calendar view
- Class statistics and analytics dashboard
