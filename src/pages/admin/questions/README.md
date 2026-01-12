# Question Bank Management Page

## Overview

The Question Bank Management page (`QuestionBankPage.tsx`) is a comprehensive admin interface for managing the question bank used in assessments and quizzes. It follows the Feature-Sliced Design (FSD) architecture and uses the Question entity from `src/entities/question/`.

## File Location

- **Main Component**: `src/pages/admin/questions/QuestionBankPage.tsx`
- **Public API**: `src/pages/admin/questions/index.ts`

## Features

### 1. Question List & Display
- **Data Table**: Displays questions in a sortable, searchable table
- **Columns**:
  - Selection checkbox (for bulk operations)
  - Question text (with tag preview)
  - Question type badge
  - Difficulty badge
  - Points
  - Department
  - Last updated date
  - Actions menu

### 2. Filtering & Search
- **Question Type Filter**: All 5 question types (multiple_choice, true_false, short_answer, essay, fill_blank)
- **Difficulty Filter**: Easy, Medium, Hard
- **Department Filter**: Filter by department
- **Tag Filter**: Filter by tags with autocomplete
- **Search**: Full-text search across question text
- **Active Filter Counter**: Badge showing number of active filters
- **Clear Filters**: One-click clear all filters

### 3. CRUD Operations

#### Create
- Opens dialog with QuestionForm component
- Validates required fields
- Creates question and refreshes list

#### Edit
- Opens dialog with pre-filled QuestionForm
- Updates existing question
- Refreshes list on success

#### Delete
- Single question deletion with confirmation dialog
- Shows warning about irreversible action
- Removes from list on success

#### Duplicate
- Creates copy of existing question
- Appends "(Copy)" to question text
- Confirmation dialog before duplication

### 4. Bulk Operations

#### Bulk Delete
- Select multiple questions via checkboxes
- Shows count of selected questions
- Confirmation dialog before deletion
- Deletes all selected questions

#### Bulk Import
- Supports JSON and CSV formats
- File upload with format detection
- Department assignment (optional)
- Preview of parsed questions
- Shows import results (imported, failed, updated)
- Download template button for reference

### 5. Question Preview
- Modal dialog showing complete question details
- Displays:
  - Question text
  - Type and difficulty badges
  - Points
  - Department
  - Answer options (for multiple choice/true-false)
  - Correct answer (for other types)
  - Explanation (if provided)
  - Tags
  - Created/Updated timestamps

### 6. UI Components Used

From `@/shared/ui`:
- `DataTable` - Main table component
- `Button` - Action buttons
- `Badge` - Type/difficulty/status indicators
- `Checkbox` - Bulk selection
- `Dialog` - Modals for forms and preview
- `Select` - Dropdown filters
- `Input` - Text search
- `Textarea` - For bulk import content
- `Card` - Filter container
- `Label` - Form labels
- `ConfirmDialog` - Confirmation dialogs
- `DropdownMenu` - Row action menus

From `@/entities/question`:
- `QuestionForm` - Create/edit form component
- `useQuestions` - Fetch questions list
- `useCreateQuestion` - Create mutation
- `useUpdateQuestion` - Update mutation
- `useDeleteQuestion` - Delete mutation
- `useDuplicateQuestion` - Duplicate mutation
- `useBulkImportQuestions` - Bulk import mutation

From `@/entities/department`:
- `useDepartments` - Fetch departments for filters

### 7. State Management

Local State:
- `selectedQuestions` - Bulk selection state
- `questionToEdit` - Question being edited
- `questionToDelete` - Question to be deleted
- `questionToDuplicate` - Question to be duplicated
- `questionToPreview` - Question for preview modal
- `filters` - Active filter values
- `showFilters` - Filter panel visibility
- `bulkImportData` - Parsed import data
- Dialog open/close states

Query State (React Query):
- Questions list with pagination
- Departments list
- Mutation states for all CRUD operations

### 8. Error Handling

- Toast notifications for success/error states
- Error card display for list loading failures
- Form validation errors in QuestionForm
- Bulk import parsing errors
- Network error handling via React Query

### 9. Loading States

- Skeleton/spinner for initial list load
- Button loading states during mutations
- Disabled states for forms during submission
- Loading indicator in bulk import dialog

### 10. Pagination

- Shows current page info
- Displays total count
- Shows number of items per page
- Page navigation (via DataTable component)

## Usage Example

```tsx
import { QuestionBankPage } from '@/pages/admin/questions';

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/admin/questions" element={<QuestionBankPage />} />
    </Routes>
  );
}
```

## Type Definitions

All types are imported from `@/entities/question`:

```typescript
type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'short_answer'
  | 'essay'
  | 'fill_blank';

type QuestionDifficulty = 'easy' | 'medium' | 'hard';

interface QuestionListItem {
  id: string;
  questionText: string;
  questionType: QuestionType;
  options: AnswerOption[];
  correctAnswer: string | string[];
  points: number;
  difficulty: QuestionDifficulty;
  tags: string[];
  explanation: string | null;
  department: string | null;
  createdAt: string;
  updatedAt: string;
}
```

## Helper Functions

### formatQuestionType(type: QuestionType): string
Converts question type enum to display string.

### formatDifficulty(difficulty: QuestionDifficulty): string
Converts difficulty enum to display string.

### getDifficultyVariant(difficulty: QuestionDifficulty)
Returns badge variant based on difficulty level:
- Easy → 'secondary'
- Medium → 'default'
- Hard → 'destructive'

## Bulk Import Format

### JSON Format
```json
[
  {
    "questionText": "What is 2+2?",
    "questionType": "multiple_choice",
    "options": [
      { "text": "3", "isCorrect": false },
      { "text": "4", "isCorrect": true }
    ],
    "points": 1,
    "difficulty": "easy",
    "tags": ["math", "basic"],
    "explanation": "Basic addition"
  }
]
```

### CSV Format
Headers: `questionText,questionType,points,difficulty,tags,explanation`

## Accessibility

- Semantic HTML elements
- ARIA labels for icon buttons
- Keyboard navigation support
- Screen reader friendly
- Focus management in dialogs

## Performance Considerations

- React Query caching (5-minute stale time)
- Optimistic updates for mutations
- Pagination for large datasets
- Debounced search (via DataTable)
- Lazy loading of dialogs

## Future Enhancements

- [ ] Question usage statistics
- [ ] Bulk edit operations
- [ ] Advanced tag management
- [ ] Question versioning
- [ ] Export questions to various formats
- [ ] Question templates
- [ ] AI-assisted question generation
- [ ] Question difficulty analysis
- [ ] Related questions suggestions

## Testing

Located at: `src/pages/admin/questions/__tests__/`

Test coverage should include:
- Rendering with mock data
- Filter functionality
- CRUD operations
- Bulk operations
- Error states
- Loading states
- Form validation
- Preview modal

## Dependencies

- React 18+
- @tanstack/react-table
- @tanstack/react-query
- date-fns
- lucide-react (icons)
- shadcn/ui components

## Related Files

- `src/entities/question/` - Question entity implementation
- `src/entities/department/` - Department entity
- `src/shared/ui/` - Shared UI components
- `src/pages/admin/programs/ProgramManagementPage.tsx` - Similar pattern reference
