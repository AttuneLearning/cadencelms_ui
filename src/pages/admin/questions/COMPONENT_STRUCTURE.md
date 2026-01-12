# Question Bank Page - Component Structure

## Component Hierarchy

```
QuestionBankPage (Main Component)
│
├── Header Section
│   ├── Title & Description
│   └── Action Bar
│       ├── Bulk Delete Button (conditional)
│       ├── Filters Toggle Button (with badge)
│       ├── Bulk Import Button
│       └── Add Question Button
│
├── Filter Panel (collapsible)
│   └── Card
│       ├── Filter Header (with Clear All)
│       └── Filter Grid
│           ├── Question Type Select
│           ├── Difficulty Select
│           ├── Department Select
│           ├── Tag Select
│           └── Search Input
│
├── Error State (conditional)
│   └── Error Card
│
├── Loading State (conditional)
│   └── Spinner with Text
│
├── Data Table
│   └── Columns
│       ├── Selection Checkbox
│       ├── Question Text (with tags)
│       ├── Question Type Badge
│       ├── Difficulty Badge
│       ├── Points
│       ├── Department
│       ├── Last Updated
│       └── Actions Dropdown
│           ├── Preview
│           ├── Edit
│           ├── Duplicate
│           └── Delete
│
├── Pagination Info
│
└── Dialogs
    ├── Create/Edit Dialog
    │   └── QuestionForm Component
    │       ├── Question Text (textarea)
    │       ├── Type & Points (grid)
    │       ├── Difficulty Select
    │       ├── Answer Options (conditional)
    │       │   └── Multiple Options with Checkboxes
    │       ├── Correct Answer (conditional)
    │       ├── Tags Input with Chips
    │       ├── Explanation (textarea)
    │       └── Form Actions (Cancel/Submit)
    │
    ├── Preview Dialog
    │   └── Question Details
    │       ├── Question Text
    │       ├── Metadata Grid
    │       │   ├── Type Badge
    │       │   ├── Difficulty Badge
    │       │   ├── Points
    │       │   └── Department
    │       ├── Answer Options (conditional)
    │       │   └── Color-coded Options List
    │       ├── Correct Answer (conditional)
    │       ├── Explanation (conditional)
    │       ├── Tags (conditional)
    │       └── Timestamps
    │
    ├── Bulk Import Dialog
    │   └── Import Form
    │       ├── Format Select (JSON/CSV)
    │       ├── Department Select (optional)
    │       ├── File Upload Input
    │       ├── File Info Display
    │       ├── Download Template Button
    │       └── Import Actions (Cancel/Import)
    │
    ├── Delete Confirmation Dialog
    │   └── ConfirmDialog
    │       ├── Warning Message
    │       └── Actions (Cancel/Delete)
    │
    ├── Bulk Delete Confirmation Dialog
    │   └── ConfirmDialog
    │       ├── Count Display
    │       └── Actions (Cancel/Delete All)
    │
    └── Duplicate Confirmation Dialog
        └── ConfirmDialog
            └── Actions (Cancel/Duplicate)
```

## Data Flow

```
User Action
    ↓
Event Handler
    ↓
State Update / API Call
    ↓
React Query Mutation
    ↓
Backend API
    ↓
Response
    ↓
Cache Invalidation
    ↓
UI Update + Toast
```

## State Management

### Local State (useState)
```typescript
selectedQuestions: QuestionListItem[]      // Bulk selection
questionToEdit: QuestionListItem | null    // Edit dialog
questionToDelete: string | null            // Delete confirmation
questionToDuplicate: string | null         // Duplicate confirmation
questionToPreview: QuestionListItem | null // Preview dialog
isCreateDialogOpen: boolean                // Create dialog
isDeleteConfirmOpen: boolean               // Delete dialog
isDuplicateConfirmOpen: boolean            // Duplicate dialog
isBulkDeleteConfirmOpen: boolean           // Bulk delete dialog
isBulkImportDialogOpen: boolean            // Import dialog
isPreviewDialogOpen: boolean               // Preview dialog
filters: QuestionFilters                   // Filter values
showFilters: boolean                       // Filter panel
tagFilter: string                          // Tag filter value
availableTags: string[]                    // Extracted tags
bulkImportFormat: 'json' | 'csv'           // Import format
bulkImportFile: File | null                // Upload file
bulkImportData: BulkImportQuestionItem[]   // Parsed data
bulkImportDepartment: string               // Import department
```

### Server State (React Query)
```typescript
useQuestions(filters)           // Questions list
useDepartments({ limit: 1000 }) // Departments list
useCreateQuestion(...)          // Create mutation
useUpdateQuestion(...)          // Update mutation
useDeleteQuestion(...)          // Delete mutation
useDuplicateQuestion(...)       // Duplicate mutation
useBulkImportQuestions(...)     // Import mutation
```

## Key Functions

### Event Handlers
```typescript
handleDelete(id: string)                              // Single delete
handleBulkDelete()                                    // Bulk delete
handleDuplicate(id: string)                           // Duplicate
handlePreview(question: QuestionListItem)             // Preview
handleFormSubmit(data: QuestionFormData)              // Create/Edit
handleFilterChange(key, value)                        // Filter update
handleFileUpload(e: ChangeEvent)                      // File upload
handleBulkImportSubmit()                              // Import submit
handleExportTemplate()                                // Download template
```

### Confirmation Handlers
```typescript
confirmDelete()           // Execute delete
confirmBulkDelete()       // Execute bulk delete
confirmDuplicate()        // Execute duplicate
```

### Helper Functions
```typescript
formatQuestionType(type: QuestionType): string
formatDifficulty(difficulty: QuestionDifficulty): string
getDifficultyVariant(difficulty): BadgeVariant
clearFilters()
```

## Column Definitions

```typescript
const columns: ColumnDef<QuestionListItem>[] = [
  { id: 'select', header: Checkbox, cell: Checkbox },
  { accessorKey: 'questionText', header: 'Question', cell: TextWithTags },
  { accessorKey: 'questionType', header: 'Type', cell: Badge },
  { accessorKey: 'difficulty', header: 'Difficulty', cell: ColorBadge },
  { accessorKey: 'points', header: 'Points', cell: Number },
  { accessorKey: 'department', header: 'Department', cell: Text },
  { accessorKey: 'updatedAt', header: 'Last Updated', cell: FormattedDate },
  { id: 'actions', cell: ActionsDropdown }
]
```

## Toast Notifications

### Success Messages
- "Question created" - After successful creation
- "Question updated" - After successful update
- "Question deleted" - After successful deletion
- "Question duplicated" - After successful duplication
- "Bulk import completed" - After bulk import with stats

### Error Messages
- "Failed to create question" - Creation error
- "Failed to update question" - Update error
- "Failed to delete question" - Deletion error
- "Failed to duplicate question" - Duplication error
- "Failed to import questions" - Import error
- "Failed to parse file" - File parsing error
- "No questions to import" - Empty import

## UI States

### Loading States
1. Initial page load - Full page spinner
2. Creating question - Button loading state
3. Updating question - Button loading state
4. Deleting question - Dialog loading state
5. Bulk import - Dialog loading state

### Empty States
- No questions found - Empty table state
- No filters active - Clean slate
- No tags available - Empty tag select

### Error States
- API error - Error card with message
- Validation error - Form field errors
- Parse error - Toast notification

## Accessibility Features

- Semantic HTML elements
- ARIA labels for icon buttons
- Keyboard navigation support
- Screen reader friendly labels
- Focus management in dialogs
- Color contrast compliance
- Touch target sizes

## Responsive Breakpoints

- Mobile: 1 column filters
- Tablet: 2 column filters
- Desktop: 3 column filters
- Full width table with horizontal scroll
- Stacked dialog on mobile
- Touch-friendly buttons (min 44x44px)

## Performance Optimizations

- React Query caching (5min stale time)
- Pagination (50 items per page)
- Debounced search (via DataTable)
- Lazy dialog rendering
- Memoized filter options
- Optimistic updates
- Cache invalidation on mutation

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features
- CSS Grid & Flexbox
- Native form validation
- File API support

## Security Considerations

- File upload validation
- Input sanitization
- XSS prevention
- CSRF protection (via API)
- Role-based access (via route guard)

---

**Last Updated**: 2026-01-08
**Component Version**: 1.0.0
**Status**: Production Ready
