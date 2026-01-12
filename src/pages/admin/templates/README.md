# Template Management Page

Comprehensive admin interface for managing course templates with full CRUD operations, filtering, preview, and bulk actions.

## Location

`src/pages/admin/templates/TemplateManagementPage.tsx`

## Features

### Core Functionality
- **CRUD Operations**: Create, Read, Update, Delete templates
- **Template Types**: Master (global), Department (dept-specific), Custom (instructor-level)
- **Status Management**: Active, Draft
- **Bulk Actions**: Select and delete multiple templates
- **Duplicate**: Clone existing templates with modified names
- **Preview**: Live preview of templates with rendered HTML/CSS

### UI Components
- **Data Table**: Sortable, searchable table with pagination
- **Filters**: Type, Status, Department, Search
- **Forms**: Comprehensive create/edit form with validation
- **Dialogs**: Modal dialogs for create/edit/preview
- **Confirmations**: Safe deletion and duplication confirmations

### Template Features
- **HTML/CSS Editor**: Built-in editors for template content
- **Placeholder Support**: Dynamic placeholders for course data
- **Department Assignment**: Link templates to specific departments
- **Global Visibility**: Master templates visible institution-wide
- **Usage Tracking**: Display courses using each template

## Data Flow

### Queries (Read Operations)
```typescript
// List templates with filters
useTemplates(filters?: TemplateFilters)

// Preview template
useTemplatePreview(id: string, params?: TemplatePreviewParams)
```

### Mutations (Write Operations)
```typescript
// Create new template
useCreateTemplate()

// Update existing template
useUpdateTemplate()

// Delete template (with force option)
useDeleteTemplate()

// Duplicate template
useDuplicateTemplate()
```

## Page Structure

```
TemplateManagementPage
├── Header
│   ├── Title & Description
│   └── Actions
│       ├── Bulk Delete Button (conditional)
│       ├── Filters Toggle
│       └── Create Template Button
├── Filters Panel (collapsible)
│   ├── Type Filter
│   ├── Status Filter
│   ├── Department Filter
│   └── Search Input
├── Data Table
│   └── Columns
│       ├── Select (checkbox)
│       ├── Template Name (with creator)
│       ├── Type (badge)
│       ├── Status (badge)
│       ├── Department (with global indicator)
│       ├── Usage Count
│       ├── Last Updated
│       └── Actions (dropdown)
│           ├── Preview
│           ├── Edit
│           ├── Duplicate
│           └── Delete
└── Dialogs
    ├── Create/Edit Dialog
    │   └── TemplateForm Component
    ├── Preview Dialog
    │   └── Rendered HTML with CSS
    ├── Delete Confirmation
    ├── Bulk Delete Confirmation
    └── Duplicate Confirmation
```

## Table Columns

| Column | Description | Features |
|--------|-------------|----------|
| Select | Checkbox for bulk selection | Select all, individual select |
| Template Name | Name with creator info | Icon, name, creator display |
| Type | Master/Department/Custom | Color-coded badge |
| Status | Active/Draft | Status badge |
| Department | Department or Global | Badge for global, name for dept |
| Usage Count | Courses using template | Count with label |
| Last Updated | Timestamp | Formatted date |
| Actions | Dropdown menu | Preview, Edit, Duplicate, Delete |

## Filters

### Type Filter
- All Types (default)
- Master
- Department
- Custom

### Status Filter
- All Statuses (default)
- Active
- Draft

### Department Filter
- All Departments (default)
- Individual departments (from API)

### Search
- Full-text search across template names

## Template Operations

### Create Template
1. Click "Add Template" button
2. Fill in form:
   - Name (required)
   - Type (required, cannot change after creation)
   - Department (required for department type)
   - Status (Active/Draft)
   - Global visibility (master type only)
   - CSS styles (optional)
   - HTML structure (optional)
3. Submit form
4. Success: Toast notification, table refresh
5. Error: Display error message

### Edit Template
1. Click "Edit" in actions dropdown
2. Form opens with existing data
3. Modify editable fields:
   - Name
   - Status
   - Global visibility (master type)
   - CSS
   - HTML
4. Note: Type and Department cannot be changed
5. Submit changes
6. Success: Toast notification, cache update

### Delete Template
1. Click "Delete" in actions dropdown
2. Confirmation dialog appears
3. If template in use:
   - Error shown
   - Option to force delete
4. Confirm deletion
5. Success: Toast with affected courses count
6. Table refreshes

### Duplicate Template
1. Click "Duplicate" in actions dropdown
2. Confirmation dialog appears
3. Confirm duplication
4. New template created as draft
5. Name appended with "(Copy)"
6. Success: Toast notification, table refresh

### Preview Template
1. Click "Preview" in actions dropdown
2. Preview dialog opens
3. Shows:
   - Template metadata
   - Sample data placeholders
   - Rendered HTML with applied CSS
4. Preview in bordered card
5. Close to return to table

### Bulk Delete
1. Select multiple templates (checkboxes)
2. "Delete Selected" button appears
3. Click button
4. Confirmation shows count
5. Confirm to delete all
6. Force delete enabled for in-use templates
7. Success: Toast with count

## Form Validation

### Required Fields
- **Name**: 1-200 characters
- **Type**: Must select (master/department/custom)
- **Department**: Required when type is "department"

### Optional Fields
- **CSS**: Max 50,000 characters
- **HTML**: Max 100,000 characters
- **Status**: Defaults to "draft"
- **Global**: Only for master type

### Type-Specific Rules
- **Master**: Can set global visibility
- **Department**: Must select department
- **Custom**: No additional requirements

### Edit Restrictions
- Cannot change type after creation
- Cannot change department after creation
- Can change all other fields

## Template Placeholders

Templates support dynamic placeholders:

- `{{courseTitle}}` - Course title
- `{{courseCode}}` - Course code
- `{{content}}` - Main content area
- `{{instructorName}}` - Instructor name
- `{{departmentName}}` - Department name

## States & Loading

### Loading States
- Initial page load: Spinner with message
- Preview loading: Spinner in dialog
- Form submission: Button disabled with spinner
- Mutation in progress: Button disabled

### Error States
- API error: Card with error message
- Preview error: Error message in dialog
- Form error: Alert above form
- Validation error: Field-level messages

### Empty States
- No templates: Table shows "No results"
- No filters match: Clear filters button
- No departments: Select disabled

## Responsive Design

### Desktop (≥1024px)
- Full table with all columns
- 4-column filter grid
- Wide dialogs

### Tablet (768-1023px)
- Condensed table
- 2-column filter grid
- Medium dialogs

### Mobile (<768px)
- Stacked cards instead of table
- 1-column filter grid
- Full-width dialogs

## Type Definitions

```typescript
interface TemplateListItem {
  id: string;
  name: string;
  type: TemplateType; // 'master' | 'department' | 'custom'
  status: TemplateStatus; // 'active' | 'draft'
  department: string | null;
  departmentName: string | null;
  isGlobal: boolean;
  createdBy: UserRef;
  usageCount: number;
  previewUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TemplateFilters {
  type?: TemplateType;
  department?: string;
  status?: TemplateStatus;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}
```

## Integration Points

### Entity Layer
- `@/entities/template` - Template entity hooks and types
- `@/entities/department` - Department data for filters/forms

### Shared UI
- `@/shared/ui/data-table` - Main table component
- `@/shared/ui/dialog` - Modal dialogs
- `@/shared/ui/confirm-dialog` - Confirmation dialogs
- `@/shared/ui/form` - Form components
- `@/shared/ui/badge` - Status/type badges
- `@/shared/ui/button` - Action buttons

### External Libraries
- `@tanstack/react-table` - Table functionality
- `@tanstack/react-query` - Data fetching/caching
- `date-fns` - Date formatting
- `lucide-react` - Icons

## Error Handling

### Delete Errors
- **409 Conflict**: Template in use
  - Show message about courses
  - Enable force delete option
  - Retry with force flag
- **404 Not Found**: Template already deleted
  - Show error toast
  - Refresh table
- **500 Server Error**: Generic error
  - Show error toast
  - Allow retry

### Form Errors
- Validation errors shown inline
- API errors shown in alert
- Network errors handled by React Query

### Preview Errors
- Loading failures shown in dialog
- Retry button available
- Fallback to error state

## Performance Optimizations

- **Query Caching**: 5-minute stale time for lists
- **Optimistic Updates**: Cache updated before API response
- **Pagination**: Limit 50 items per page
- **Debounced Search**: 300ms delay on search input
- **Conditional Fetching**: Preview only loads when dialog open

## Accessibility

- Keyboard navigation support
- ARIA labels on interactive elements
- Focus management in dialogs
- Screen reader announcements
- Color contrast compliance
- Semantic HTML structure

## Testing Considerations

### Unit Tests
- Component rendering
- User interactions
- Form validation
- State management

### Integration Tests
- CRUD operations
- Filter application
- Bulk actions
- Error scenarios

### E2E Tests
- Complete workflows
- Multi-step operations
- Cross-page navigation
- Error recovery

## Usage Example

```tsx
import { TemplateManagementPage } from '@/pages/admin/templates';

// In route configuration
<Route path="/admin/templates" element={<TemplateManagementPage />} />
```

## Future Enhancements

- [ ] Export templates to JSON
- [ ] Import templates from JSON
- [ ] Template versioning
- [ ] Template categories/tags
- [ ] Advanced search with regex
- [ ] Template comparison view
- [ ] Batch status updates
- [ ] Template usage analytics
- [ ] Template permissions
- [ ] Template inheritance
