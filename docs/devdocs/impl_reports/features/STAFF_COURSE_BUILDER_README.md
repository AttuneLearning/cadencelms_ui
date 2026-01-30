# Staff Course Builder - Implementation Guide

## Overview

The Staff Course Builder provides a comprehensive interface for instructors to create, edit, and organize courses with intuitive drag-and-drop module management.

## Components Created

### 1. StaffCoursesPage (`/src/pages/staff/courses/StaffCoursesPage.tsx`)

**Purpose**: Main landing page listing all courses the staff member teaches or can edit.

**Features**:
- Grid-based course card layout with responsive design
- Search functionality (by title or code)
- Status filtering (Draft, Published, Archived)
- Course cards showing:
  - Course status badge
  - Module count and duration
  - Enrollment count
  - Department
  - Last updated timestamp
- "Create Course" button
- Empty state with helpful prompts
- Pagination support

**Route**: `/staff/courses`

**Usage Example**:
```tsx
import { StaffCoursesPage } from '@/pages/staff/courses';

// In your router configuration
<Route path="/staff/courses" element={<StaffCoursesPage />} />
```

### 2. CourseEditorPage (`/src/pages/staff/courses/CourseEditorPage.tsx`)

**Purpose**: Two-column editor for course details and module organization.

**Features**:

**Left Column - Course Details**:
- Course title and code (with validation)
- Description textarea
- Credits and duration inputs
- Department and program assignment
- Course settings:
  - Allow self-enrollment
  - Passing score percentage
  - Maximum attempts
  - Certificate on completion

**Right Column - Module Organizer**:
- Drag-and-drop module list (powered by @dnd-kit)
- Add module button
- Module reordering with visual feedback
- Edit/delete actions per module
- Module stats (duration, passing score, content ID)

**Top Actions**:
- Back button with unsaved changes warning
- Status badge (Draft/Published/Archived)
- Publish/Unpublish toggle
- Save changes button

**Routes**: 
- Create: `/staff/courses/new`
- Edit: `/staff/courses/:courseId/edit`

**Usage Example**:
```tsx
import { CourseEditorPage } from '@/pages/staff/courses';

// In your router configuration
<Route path="/staff/courses/new" element={<CourseEditorPage />} />
<Route path="/staff/courses/:courseId/edit" element={<CourseEditorPage />} />
```

### 3. ModuleList Component (`/src/features/courses/ui/ModuleList.tsx`)

**Purpose**: Reusable drag-and-drop sortable list of course modules.

**Features**:
- Drag-and-drop reordering with @dnd-kit
- Visual feedback during drag (shadow, ring)
- Grip handle for dragging
- Module type icons (Video, Document, SCORM, Exercise, Custom)
- Module metadata display:
  - Order number
  - Published/Draft status
  - Type badge
  - Duration
  - Passing score
  - Content ID reference
- Action menu (Edit, Delete)
- Empty state with "Add First Module" prompt
- Auto-save on reorder

**Props**:
```typescript
interface ModuleListProps {
  modules: CourseSegmentListItem[];
  onReorder: (reorderedModules: CourseSegmentListItem[]) => void;
  onEdit: (module: CourseSegmentListItem) => void;
  onDelete: (module: CourseSegmentListItem) => void;
  onAdd: () => void;
  isLoading?: boolean;
}
```

**Usage Example**:
```tsx
import { ModuleList } from '@/features/courses';

<ModuleList
  modules={courseModules}
  onReorder={handleReorder}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onAdd={handleAdd}
  isLoading={isSaving}
/>
```

### 4. ModuleDialog Component (`/src/features/courses/ui/ModuleDialog.tsx`)

**Purpose**: Dialog wrapper for the CourseSegmentForm to add/edit modules.

**Features**:
- Create or edit mode
- Uses existing CourseSegmentForm from entities
- Form validation with react-hook-form + zod
- Module settings:
  - Title and description
  - Type selection (Video, Document, SCORM, Exercise, Custom)
  - Content ID reference
  - Passing score and duration
  - Multiple attempts configuration
  - Time limits
  - Feedback settings
  - Question shuffling
  - Publish toggle

**Props**:
```typescript
interface ModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  module?: CourseSegmentListItem;
  nextOrder?: number;
  onSubmit: (data: CreateCourseSegmentPayload | UpdateCourseSegmentPayload) => Promise<void>;
  isLoading?: boolean;
}
```

**Usage Example**:
```tsx
import { ModuleDialog } from '@/features/courses';

<ModuleDialog
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  mode="create"
  nextOrder={modules.length + 1}
  onSubmit={handleCreateModule}
  isLoading={isCreating}
/>
```

## Technical Architecture

### Dependencies Installed

```json
{
  "@dnd-kit/core": "^6.x",
  "@dnd-kit/sortable": "^8.x",
  "@dnd-kit/utilities": "^3.x"
}
```

### FSD Architecture Pattern

```
src/
├── pages/staff/courses/          # Staff-specific pages
│   ├── StaffCoursesPage.tsx     # Course list page
│   ├── CourseEditorPage.tsx     # Course editor
│   └── index.tsx                # Public exports
│
├── features/courses/             # Course-specific features
│   └── ui/
│       ├── ModuleList.tsx       # Drag-drop module list
│       ├── ModuleDialog.tsx     # Module create/edit dialog
│       └── index.ts             # Public exports
│
└── entities/                     # Existing entities (used by features)
    ├── course/                   # Course entity
    └── course-segment/           # Module entity
```

### Data Flow

1. **Course List** → Uses `useCourses()` hook
2. **Course Editor** → Uses `useCourse()`, `useUpdateCourse()`, `usePublishCourse()`
3. **Module Management** → Uses:
   - `useCourseSegments()` - Fetch modules
   - `useCreateCourseSegment()` - Add module
   - `useUpdateCourseSegment()` - Edit module
   - `useDeleteCourseSegment()` - Remove module
   - `useReorderCourseSegments()` - Reorder modules

### State Management

- **React Query** for server state (courses, modules)
- **React Hook Form** for form state (course details, module forms)
- **Local state** for UI (dialogs, filters, drag state)

## User Workflow

### Creating a New Course

1. Click "Create Course" on StaffCoursesPage
2. Navigate to `/staff/courses/new`
3. Fill in course details (title, code, description, etc.)
4. Configure course settings
5. Click "Create Course"
6. Redirected to `/staff/courses/:id/edit`
7. Add modules using "Add Module" button
8. Drag to reorder modules
9. Click "Publish" when ready

### Editing an Existing Course

1. Click "Edit Course" on a course card
2. Navigate to `/staff/courses/:id/edit`
3. Modify course details in left column
4. Manage modules in right column:
   - Add new modules
   - Edit existing modules
   - Delete modules
   - Drag to reorder
5. Click "Save Changes"
6. Publish/unpublish as needed

### Module Management

1. **Add Module**: Click "Add Module" → Fill form → Save
2. **Edit Module**: Click menu → "Edit Module" → Modify → Save
3. **Delete Module**: Click menu → "Delete Module" → Confirm
4. **Reorder**: Drag modules by grip handle → Auto-saves

## Validation Rules

### Course Code
- Format: `^[A-Z]{2,4}[0-9]{3}$`
- Example: `WEB101`, `MATH201`

### Course Title
- Min: 1 character
- Max: 200 characters

### Credits
- Min: 0
- Max: 10

### Passing Score
- Min: 0%
- Max: 100%

## UI Components Used

- **shadcn/ui**: Card, Button, Input, Textarea, Dialog, Badge, Select, Checkbox, Separator
- **lucide-react**: Icons
- **date-fns**: Date formatting

## Accessibility Features

- Keyboard navigation for drag-and-drop (Arrow keys)
- ARIA labels on interactive elements
- Focus management in dialogs
- Screen reader-friendly status indicators

## Future Enhancements

- [ ] Bulk module operations
- [ ] Module templates
- [ ] Course preview mode
- [ ] Content library integration
- [ ] Collaborative editing
- [ ] Version history
- [ ] Analytics integration

## Testing

Run TypeScript checks:
```bash
npm run typecheck
```

The components pass strict TypeScript validation and follow the existing codebase patterns.

## Support

For questions or issues, refer to:
- Course entity: `/src/entities/course/`
- Course segment entity: `/src/entities/course-segment/`
- Admin course management: `/src/pages/admin/courses/CourseManagementPage.tsx`
