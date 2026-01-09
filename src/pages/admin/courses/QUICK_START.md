# Quick Start Guide - Course Management Page

## Installation & Setup

### 1. Add Route to Router Configuration

```tsx
// In your router configuration file (e.g., src/app/router.tsx)
import { CourseManagementPage } from '@/pages/admin/courses';

// Add to your routes
{
  path: '/admin/courses',
  element: <CourseManagementPage />,
}
```

### 2. Verify Dependencies

All dependencies should already be installed. Verify these imports work:

```tsx
// Course entity
import { useCourses, CourseForm } from '@/entities/course';

// UI components
import { DataTable } from '@/shared/ui/data-table';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
```

### 3. Test Navigation

Navigate to `/admin/courses` in your application.

## Basic Usage

### Viewing Courses

1. Navigate to `/admin/courses`
2. All courses are displayed in a paginated table
3. Use pagination controls at the bottom to navigate pages

### Searching & Filtering

1. Click the "Filters" button in the header
2. Enter search terms or select filters
3. Table updates automatically
4. Click "Clear All" to reset filters

### Creating a Course

1. Click "Add Course" button
2. Fill in required fields (marked with *)
   - Title
   - Code (format: 2-4 letters + 3 digits)
   - Department ID
3. Optionally fill in:
   - Description
   - Credits
   - Duration
   - Program ID
   - Course Settings
4. Click "Create Course"

### Editing a Course

1. Click the "⋮" menu icon in the course row
2. Select "Edit Course"
3. Modify fields as needed
4. Click "Update Course"

### Publishing a Course

1. Click the "⋮" menu icon
2. Select "Publish"
3. Confirm in the dialog
4. Course status changes to "Published"

### Duplicating a Course

1. Click the "⋮" menu icon
2. Select "Duplicate"
3. Enter a unique course code
4. Optionally modify the title
5. Choose whether to include modules and settings
6. Click "Duplicate Course"

### Exporting a Course

1. Click the "⋮" menu icon
2. Select "Export"
3. Choose export format:
   - JSON (for data backup)
   - PDF (for documentation)
   - SCORM 1.2/2004 (for LMS compatibility)
   - xAPI (for learning records)
4. Click "Export"

### Deleting a Course

1. Click the "⋮" menu icon
2. Select "Delete Course"
3. Confirm in the dialog (this action cannot be undone)
4. Course and all associated data are removed

## Common Workflows

### Workflow 1: Creating and Publishing a Course

```
1. Click "Add Course"
2. Fill in course details
3. Click "Create Course"
4. Course appears with "Draft" status
5. Click "⋮" → "Publish"
6. Confirm
7. Course is now visible to students
```

### Workflow 2: Updating Course Settings

```
1. Click "⋮" → "Edit Course"
2. Scroll to "Course Settings" section
3. Modify settings:
   - Self-enrollment
   - Passing score
   - Max attempts
   - Certificate
4. Click "Update Course"
```

### Workflow 3: Managing Course Modules

```
1. Click the module count link in the table
   OR
   Click "⋮" → "View Segments"
2. Navigate to course segments page
3. Manage modules/segments
```

### Workflow 4: Archiving Old Courses

```
1. Filter by department or program
2. Click "⋮" → "Archive" for old courses
3. Confirm each archival
4. Archived courses are hidden from students
```

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Focus search | `/` |
| Open filters | `f` |
| Create course | `n` |
| Close dialog | `Esc` |
| Navigate table | `↑` `↓` |
| Select row | `Space` |

*Note: Keyboard shortcuts may require implementation*

## Troubleshooting

### Problem: Courses not loading
**Solution**:
- Check browser console for errors
- Verify API connection
- Check if course entity is properly configured
- Ensure React Query provider is set up

### Problem: Cannot create course
**Solution**:
- Verify all required fields are filled
- Check course code format (e.g., WEB101)
- Ensure department ID is valid
- Check browser console for validation errors

### Problem: Filters not working
**Solution**:
- Click "Clear All" to reset filters
- Refresh the page
- Check if filter values are valid

### Problem: Export not downloading
**Solution**:
- Check browser's download settings
- Verify export format is supported
- Check network tab for API errors

## API Requirements

The page expects these endpoints to be available:

```
GET    /api/courses              - List courses
POST   /api/courses              - Create course
GET    /api/courses/:id          - Get course details
PUT    /api/courses/:id          - Update course
DELETE /api/courses/:id          - Delete course
POST   /api/courses/:id/publish  - Publish course
POST   /api/courses/:id/unpublish - Unpublish course
POST   /api/courses/:id/archive  - Archive course
POST   /api/courses/:id/duplicate - Duplicate course
GET    /api/courses/:id/export   - Export course
```

## Data Requirements

### Minimum Required Fields
- `title`: string (1-200 chars)
- `code`: string (pattern: [A-Z]{2,4}[0-9]{3})
- `department`: string (department ID)

### Optional Fields
- `description`: string (0-2000 chars)
- `program`: string (program ID)
- `credits`: number (0-10)
- `duration`: number (hours)
- `instructors`: string[] (instructor IDs)
- `settings`: CourseSettings object

## Component Props

The page is a standalone component with no required props:

```tsx
<CourseManagementPage />
```

## Customization

### Changing Default Filter Values

Edit the initial state in CourseManagementPage.tsx:

```tsx
const [filters, setFilters] = useState<CourseFilters>({
  page: 1,
  limit: 10,  // Change page size
  status: 'published',  // Default to published courses
});
```

### Adding Custom Columns

Add to the columns array:

```tsx
{
  accessorKey: 'customField',
  header: 'Custom Field',
  cell: ({ row }) => row.original.customField,
}
```

### Modifying Action Menu

Edit the actions dropdown:

```tsx
<DropdownMenuItem onClick={() => handleCustomAction(course)}>
  <CustomIcon className="mr-2 h-4 w-4" />
  Custom Action
</DropdownMenuItem>
```

## Performance Tips

1. **Filter Smart**: Use specific filters to reduce data load
2. **Pagination**: Adjust page size based on your needs
3. **Search Wisely**: Search is client-side, works on loaded data
4. **Bulk Operations**: Select multiple courses for batch operations

## Next Steps

1. ✅ Set up routing
2. ✅ Test course creation
3. ✅ Test course editing
4. ✅ Test publishing workflow
5. 📝 Create course segments page
6. 📝 Implement export download logic
7. 📝 Add bulk operations
8. 📝 Add analytics dashboard

## Support

For issues or questions:
- Check IMPLEMENTATION_SUMMARY.md for technical details
- Check COMPONENT_STRUCTURE.md for architecture
- Check README.md for feature documentation
- Review the UserManagementPage for similar patterns

## Example Course Code Formats

Valid course codes:
- `WEB101` ✓
- `CS2030` ✓
- `MATH101` ✓
- `ENG1001` ✗ (too many digits)
- `web101` ✗ (lowercase)
- `W101` ✗ (too few letters)

## Testing Checklist

- [ ] Navigate to page successfully
- [ ] See list of courses
- [ ] Create new course
- [ ] Edit existing course
- [ ] Delete course (with confirmation)
- [ ] Publish course
- [ ] Unpublish course
- [ ] Archive course
- [ ] Duplicate course
- [ ] Export course
- [ ] Filter by status
- [ ] Search courses
- [ ] Navigate to segments
- [ ] Select multiple courses
- [ ] Pagination works
- [ ] Toast notifications appear
- [ ] Loading states show
- [ ] Error handling works
