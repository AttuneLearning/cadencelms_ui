# Template Management Page - Usage Guide

## Quick Start

### Import and Use

```tsx
import { TemplateManagementPage } from '@/pages/admin/templates';

// In your router configuration
<Route path="/admin/templates" element={<TemplateManagementPage />} />
```

## User Guide

### Creating a Template

1. **Open Create Dialog**
   ```
   Click "Add Template" button in the header
   ```

2. **Fill in Basic Information**
   - **Name**: Enter a descriptive name (e.g., "Computer Science Certificate Template")
   - **Type**: Select one of:
     - **Master**: For institution-wide templates (admin only)
     - **Department**: For department-specific templates
     - **Custom**: For individual instructor templates
   - **Department**: Select department (required for department type)
   - **Status**: Choose Active or Draft
   - **Global**: Toggle on for master templates to make visible institution-wide

3. **Add Template Content**
   - **CSS Styles**: Enter CSS stylesheet (up to 50,000 characters)
   - **HTML Structure**: Enter HTML with placeholders (up to 100,000 characters)

4. **Use Placeholders**
   ```html
   {{courseTitle}} - Course title
   {{courseCode}} - Course code
   {{content}} - Main content area
   {{instructorName}} - Instructor name
   {{departmentName}} - Department name
   ```

5. **Submit**
   - Click "Create Template"
   - Wait for success notification
   - Template appears in table

### Example Template

```html
<!-- HTML Structure -->
<div class="certificate">
  <h1>Certificate of Completion</h1>
  <div class="course-info">
    <h2>{{courseTitle}}</h2>
    <p>Course Code: {{courseCode}}</p>
  </div>
  <div class="content">
    {{content}}
  </div>
  <div class="footer">
    <p>Instructor: {{instructorName}}</p>
    <p>Department: {{departmentName}}</p>
  </div>
</div>
```

```css
/* CSS Styles */
.certificate {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
  border: 2px solid #333;
  font-family: 'Georgia', serif;
}

.certificate h1 {
  text-align: center;
  color: #1a365d;
  margin-bottom: 30px;
}

.course-info {
  margin: 20px 0;
}

.content {
  margin: 30px 0;
  line-height: 1.6;
}

.footer {
  margin-top: 40px;
  text-align: center;
  font-size: 14px;
}
```

### Editing a Template

1. **Open Edit Dialog**
   ```
   Click on template row → Actions (⋮) → Edit Template
   ```

2. **Modify Fields**
   - Can change: Name, Status, CSS, HTML, Global setting
   - Cannot change: Type, Department

3. **Save Changes**
   - Click "Update Template"
   - Changes reflected immediately

### Previewing a Template

1. **Open Preview**
   ```
   Click on template row → Actions (⋮) → Preview Template
   ```

2. **View Rendered Output**
   - See template with sample data
   - CSS styles applied
   - Preview in bordered card

3. **Check Metadata**
   - Template name
   - Generation timestamp
   - Sample placeholder values

### Duplicating a Template

1. **Start Duplication**
   ```
   Click on template row → Actions (⋮) → Duplicate
   ```

2. **Confirm Action**
   - Review confirmation dialog
   - Click "Duplicate"

3. **Result**
   - New template created with "(Copy)" suffix
   - Status set to Draft
   - All content copied
   - Edit to customize

### Deleting a Template

#### Simple Delete (Not in Use)
1. **Start Deletion**
   ```
   Click on template row → Actions (⋮) → Delete Template
   ```

2. **Confirm**
   - Review warning
   - Click "Delete"

3. **Success**
   - Template removed
   - Table refreshed

#### Force Delete (In Use)
1. **Attempt Delete**
   - System detects template is in use
   - Error message shows affected courses

2. **Enable Force Delete**
   - Confirmation updated
   - Shows force delete warning

3. **Confirm Force Delete**
   - Click "Force Delete"
   - Courses lose template reference
   - Template removed

### Bulk Operations

#### Selecting Templates
```
1. Click checkbox in header to select all
2. Or click individual row checkboxes
3. Selected count shows in header
```

#### Bulk Delete
```
1. Select multiple templates
2. Click "Delete Selected (X)" button
3. Confirm in dialog
4. All selected templates deleted
```

### Filtering Templates

#### By Type
```
Filters → Type → Select:
- All Types
- Master
- Department
- Custom
```

#### By Status
```
Filters → Status → Select:
- All Statuses
- Active
- Draft
```

#### By Department
```
Filters → Department → Select:
- All Departments
- [Individual departments from dropdown]
```

#### By Search
```
Filters → Search → Type template name
- Searches template names
- Updates table in real-time
```

#### Clear Filters
```
Click "Clear All" button in filter panel
- Resets all filters
- Shows all templates
```

## Developer Guide

### State Management

```tsx
// Filter state
const [filters, setFilters] = useState<TemplateFilters>({
  page: 1,
  limit: 50,
});

// Dialog states
const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
const [templateToEdit, setTemplateToEdit] = useState<TemplateListItem | null>(null);

// Selection state
const [selectedTemplates, setSelectedTemplates] = useState<TemplateListItem[]>([]);
```

### Data Fetching

```tsx
// List templates with filters
const { data, isLoading, error } = useTemplates(filters);

// Preview template
const { data: previewData } = useTemplatePreview(
  templateId,
  { format: 'json' },
  { enabled: isDialogOpen }
);
```

### Mutations

```tsx
// Create
const createTemplate = useCreateTemplate();
createTemplate.mutate(payload, {
  onSuccess: () => { /* ... */ },
  onError: (error) => { /* ... */ },
});

// Update
const updateTemplate = useUpdateTemplate();
updateTemplate.mutate({ id, payload }, { /* ... */ });

// Delete
const deleteTemplate = useDeleteTemplate();
deleteTemplate.mutate({ id, force: true }, { /* ... */ });

// Duplicate
const duplicateTemplate = useDuplicateTemplate();
duplicateTemplate.mutate({ id, payload }, { /* ... */ });
```

### Error Handling

```tsx
// API errors
if (error) {
  return (
    <Card className="p-6 border-destructive">
      <h3 className="font-semibold mb-2">Error loading templates</h3>
      <p className="text-sm">{error.message}</p>
    </Card>
  );
}

// Mutation errors
onError: (error: any) => {
  toast({
    title: 'Error',
    description: error.message || 'Operation failed',
    variant: 'destructive',
  });
}

// Template in use (409 Conflict)
if (error.statusCode === 409) {
  setForceDelete(true); // Enable force delete option
}
```

### Custom Columns

```tsx
const columns: ColumnDef<TemplateListItem>[] = [
  {
    accessorKey: 'name',
    header: 'Template Name',
    cell: ({ row }) => {
      const template = row.original;
      return (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <div>
            <div className="font-medium">{template.name}</div>
            <div className="text-xs text-muted-foreground">
              Created by {template.createdBy.firstName}
            </div>
          </div>
        </div>
      );
    },
  },
  // ... more columns
];
```

## API Reference

### Template Hooks

#### useTemplates
```tsx
useTemplates(filters?: TemplateFilters): UseQueryResult<TemplatesListResponse>
```

#### useTemplatePreview
```tsx
useTemplatePreview(
  id: string,
  params?: TemplatePreviewParams,
  options?: UseQueryOptions
): UseQueryResult<TemplatePreviewData | string>
```

#### useCreateTemplate
```tsx
useCreateTemplate(): UseMutationResult<Template, Error, CreateTemplatePayload>
```

#### useUpdateTemplate
```tsx
useUpdateTemplate(): UseMutationResult<
  Template,
  Error,
  { id: string; payload: UpdateTemplatePayload }
>
```

#### useDeleteTemplate
```tsx
useDeleteTemplate(): UseMutationResult<
  DeleteTemplateResponse,
  Error,
  { id: string; force?: boolean }
>
```

#### useDuplicateTemplate
```tsx
useDuplicateTemplate(): UseMutationResult<
  DuplicateTemplateResponse,
  Error,
  { id: string; payload: DuplicateTemplatePayload }
>
```

## Customization

### Styling
```tsx
// Customize page layout
<div className="space-y-8 p-8"> {/* Adjust spacing/padding */}

// Customize dialog size
<DialogContent className="max-w-4xl"> {/* Change max width */}

// Customize badge colors
function getTypeVariant(type: TemplateType) {
  // Modify badge colors for types
}
```

### Filters
```tsx
// Add custom filter
<div className="space-y-2">
  <Label htmlFor="filter-custom">Custom Filter</Label>
  <Select
    value={filters.custom || 'all'}
    onValueChange={(value) => handleFilterChange('custom', value)}
  >
    {/* Options */}
  </Select>
</div>
```

### Columns
```tsx
// Add custom column
{
  accessorKey: 'customField',
  header: 'Custom Field',
  cell: ({ row }) => {
    // Custom rendering
  },
}
```

## Troubleshooting

### Template Not Appearing
1. Check filters - may be filtered out
2. Verify template was created successfully
3. Check API response in network tab
4. Refresh page to clear cache

### Preview Not Loading
1. Check template has CSS/HTML content
2. Verify preview API endpoint is accessible
3. Check network tab for errors
4. Try re-opening preview dialog

### Delete Failing
1. Check if template is in use
2. Enable force delete if needed
3. Verify permissions
4. Check API error message

### Form Validation Errors
1. Ensure all required fields filled
2. Check character limits (name, CSS, HTML)
3. Verify department selected for department type
4. Review field-specific error messages

## Best Practices

### Template Naming
- Use descriptive names
- Include type in name (e.g., "CS Dept - Certificate Template")
- Add version numbers if needed
- Keep under 200 characters

### Template Organization
- Use Master templates for institution-wide standards
- Use Department templates for dept-specific branding
- Use Custom templates for instructor experimentation
- Start templates as Draft, activate when ready

### CSS Best Practices
- Use class selectors, avoid IDs
- Scope styles to avoid conflicts
- Use relative units (em, rem) for responsiveness
- Test preview before activating

### HTML Best Practices
- Use semantic HTML elements
- Include all placeholder types needed
- Maintain accessibility (ARIA labels, alt text)
- Keep structure simple and maintainable

### Performance Tips
- Keep CSS under 10KB when possible
- Minimize HTML complexity
- Use pagination for large template lists
- Clear filters when not needed

## Support

For issues or questions:
1. Check this guide first
2. Review README.md for architecture details
3. Check implementation checklist
4. Consult entity documentation
5. Review API contract
