# Exercise Entity

Complete implementation of the Exercise entity for Phase 3, following FSD architecture and the exercises.contract.ts v1.0.0 specification.

## Overview

This entity manages exercises and exams, including:
- Exercise creation, editing, and deletion
- Question management (add, remove, reorder)
- Multiple exercise types (quiz, exam, practice, assessment)
- Question bank integration
- Scoring and grading configuration

## Contract Implementation

Implements all 10 endpoints from `/contracts/api/exercises.contract.ts`:

1. **GET /api/v2/content/exercises** - List exercises with filtering
2. **POST /api/v2/content/exercises** - Create new exercise
3. **GET /api/v2/content/exercises/:id** - Get exercise details
4. **PUT /api/v2/content/exercises/:id** - Update exercise
5. **DELETE /api/v2/content/exercises/:id** - Delete exercise (soft)
6. **GET /api/v2/content/exercises/:id/questions** - Get exercise questions
7. **POST /api/v2/content/exercises/:id/questions** - Add question
8. **POST /api/v2/content/exercises/:id/questions/bulk** - Bulk add questions
9. **DELETE /api/v2/content/exercises/:id/questions/:questionId** - Remove question
10. **PATCH /api/v2/content/exercises/:id/questions/reorder** - Reorder questions

## Structure

```
src/entities/exercise/
├── api/
│   └── exerciseApi.ts          # API client (180 lines)
├── model/
│   ├── types.ts                # TypeScript types (341 lines)
│   ├── exerciseKeys.ts         # React Query keys (23 lines)
│   └── useExercise.ts          # React Query hooks (331 lines)
├── ui/
│   ├── ExerciseCard.tsx        # Card component (164 lines)
│   ├── ExerciseList.tsx        # List component (48 lines)
│   ├── ExerciseForm.tsx        # Create/edit form (337 lines)
│   └── QuestionSelector.tsx    # Question management (415 lines)
├── index.ts                    # Barrel export (78 lines)
└── README.md                   # This file

Total: 1,917 lines of code
```

## Types

### Exercise Types
- `ExerciseType`: 'quiz' | 'exam' | 'practice' | 'assessment'
- `ExerciseStatus`: 'draft' | 'published' | 'archived'
- `ExerciseDifficulty`: 'easy' | 'medium' | 'hard'
- `QuestionType`: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'matching'

### Core Interfaces
- `Exercise`: Full exercise details with populated references
- `ExerciseListItem`: Compact version for list views
- `ExerciseQuestion`: Question with answer options and metadata
- `CreateExercisePayload`: Create exercise request
- `UpdateExercisePayload`: Update exercise request
- `AddQuestionPayload`: Add question request
- `BulkAddQuestionsPayload`: Bulk add questions request

## API Client

### Exercise Endpoints
```typescript
listExercises(filters?: ExerciseFilters): Promise<ExercisesListResponse>
getExercise(id: string): Promise<Exercise>
createExercise(payload: CreateExercisePayload): Promise<Exercise>
updateExercise(id: string, payload: UpdateExercisePayload): Promise<Exercise>
deleteExercise(id: string): Promise<void>
```

### Question Endpoints
```typescript
getExerciseQuestions(id: string, query?: GetQuestionsQuery): Promise<ExerciseQuestionsResponse>
addExerciseQuestion(id: string, payload: AddQuestionPayload): Promise<AddQuestionResponse>
bulkAddExerciseQuestions(id: string, payload: BulkAddQuestionsPayload): Promise<BulkAddQuestionsResponse>
removeExerciseQuestion(id: string, questionId: string): Promise<RemoveQuestionResponse>
reorderExerciseQuestions(id: string, payload: ReorderQuestionsPayload): Promise<ReorderQuestionsResponse>
```

### Status Actions
```typescript
publishExercise(id: string): Promise<Exercise>
unpublishExercise(id: string): Promise<Exercise>
archiveExercise(id: string): Promise<Exercise>
```

## React Query Hooks

### Query Hooks
```typescript
useExercises(filters?: ExerciseFilters)           // List exercises
useExercise(id: string)                           // Get single exercise
useExerciseQuestions(id: string, query?)          // Get exercise questions
```

### Mutation Hooks - Exercises
```typescript
useCreateExercise()                               // Create exercise
useUpdateExercise()                               // Update exercise
useDeleteExercise()                               // Delete exercise
usePublishExercise()                              // Publish exercise
useUnpublishExercise()                            // Unpublish exercise
useArchiveExercise()                              // Archive exercise
```

### Mutation Hooks - Questions
```typescript
useAddExerciseQuestion()                          // Add single question
useBulkAddExerciseQuestions()                     // Bulk add questions
useRemoveExerciseQuestion()                       // Remove question
useReorderExerciseQuestions()                     // Reorder questions
```

## UI Components

### ExerciseCard
Displays an exercise as a card with:
- Type, status, and difficulty badges
- Question count and total points
- Time limit and passing score
- Department information
- Feature flags (shuffle, feedback, review)

Props:
```typescript
interface ExerciseCardProps {
  exercise: ExerciseListItem;
  className?: string;
  showDepartment?: boolean;
}
```

### ExerciseList
Displays a grid or list of exercises:
- Grid or list layout variants
- Empty state handling
- Customizable empty message

Props:
```typescript
interface ExerciseListProps {
  exercises: ExerciseListItem[];
  className?: string;
  variant?: 'grid' | 'list';
  showDepartment?: boolean;
  emptyMessage?: string;
}
```

### ExerciseForm
Comprehensive form for creating/editing exercises:
- Basic information (title, description, type)
- Department and difficulty selection
- Time limit configuration (minutes)
- Passing score (percentage)
- Behavior options (shuffle, feedback, review)
- Instructions field
- Validation and error handling

Props:
```typescript
interface ExerciseFormProps {
  exercise?: Exercise;
  onSubmit: (data: CreateExercisePayload | UpdateExercisePayload) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
}
```

### QuestionSelector
Manages questions within an exercise:
- Add new questions inline
- Question type selection (multiple choice, true/false, etc.)
- Dynamic answer options
- Question list with drag handles
- Remove questions
- Shows correct answers with visual indicators
- Summary of total questions and points

Props:
```typescript
interface QuestionSelectorProps {
  questions: ExerciseQuestion[];
  onAddQuestion: (question: QuestionFormData) => void;
  onRemoveQuestion: (questionId: string) => void;
  onReorderQuestions?: (questionIds: string[]) => void;
  isLoading?: boolean;
  error?: string;
  exerciseId?: string;
}
```

## Features

### Exercise Management
- Create exercises with custom settings
- Update exercise details
- Soft delete (archive) exercises
- Publish/unpublish exercises
- Multiple exercise types (quiz, exam, practice, assessment)
- Difficulty levels (easy, medium, hard)

### Question Management
- Add questions from question bank or create new
- Support for 5 question types:
  - Multiple Choice
  - True/False
  - Short Answer
  - Essay
  - Matching
- Bulk add questions
- Remove questions
- Reorder questions
- Configurable points per question

### Settings & Configuration
- Time limits (0 = unlimited)
- Passing score percentage (0-100)
- Shuffle questions option
- Show feedback option
- Allow review option
- Custom instructions

### Filtering & Search
- Filter by type (quiz, exam, practice, assessment)
- Filter by department
- Filter by difficulty
- Filter by status (draft, published, archived)
- Full-text search on title and description
- Sorting support

### Optimistic Updates
- Exercise detail updates
- Question additions
- Question removals
- Question reordering
- Status changes

## Usage Examples

### List Exercises
```typescript
import { useExercises, ExerciseList } from '@/entities/exercise';

function ExercisesPage() {
  const { data, isLoading } = useExercises({
    type: 'quiz',
    department: 'dept-123',
    status: 'published',
    page: 1,
    limit: 20,
  });

  if (isLoading) return <div>Loading...</div>;

  return <ExerciseList exercises={data?.exercises || []} />;
}
```

### Create Exercise
```typescript
import { useCreateExercise, ExerciseForm } from '@/entities/exercise';

function CreateExercisePage() {
  const createExercise = useCreateExercise();

  const handleSubmit = (data) => {
    createExercise.mutate(data, {
      onSuccess: (exercise) => {
        console.log('Exercise created:', exercise.id);
      },
    });
  };

  return (
    <ExerciseForm
      onSubmit={handleSubmit}
      onCancel={() => navigate('/exercises')}
      isLoading={createExercise.isPending}
    />
  );
}
```

### Manage Questions
```typescript
import {
  useExerciseQuestions,
  useAddExerciseQuestion,
  useRemoveExerciseQuestion,
  QuestionSelector
} from '@/entities/exercise';

function ExerciseQuestionsPage({ exerciseId }) {
  const { data } = useExerciseQuestions(exerciseId);
  const addQuestion = useAddExerciseQuestion();
  const removeQuestion = useRemoveExerciseQuestion();

  return (
    <QuestionSelector
      questions={data?.questions || []}
      onAddQuestion={(q) => addQuestion.mutate({ id: exerciseId, payload: q })}
      onRemoveQuestion={(qId) => removeQuestion.mutate({ id: exerciseId, questionId: qId })}
      isLoading={addQuestion.isPending || removeQuestion.isPending}
    />
  );
}
```

### Publish Exercise
```typescript
import { usePublishExercise } from '@/entities/exercise';

function PublishButton({ exerciseId }) {
  const publishExercise = usePublishExercise();

  const handlePublish = () => {
    publishExercise.mutate(exerciseId, {
      onSuccess: () => {
        toast.success('Exercise published successfully');
      },
    });
  };

  return (
    <Button onClick={handlePublish} disabled={publishExercise.isPending}>
      Publish Exercise
    </Button>
  );
}
```

## Contract Compliance

This implementation strictly follows the exercises.contract.ts specification:

- All 10 endpoints implemented
- Exact type mappings from contract examples
- Proper error handling for all error codes
- Query parameters match contract definitions
- Request/response shapes match contract
- Status transitions follow contract rules
- Validation constraints from contract

## Notes

- Exercises start in 'draft' status
- Must have at least 1 question to publish
- Cannot modify published exercises with active attempts
- Questions remain in question bank when removed
- Department cannot be changed after creation
- Time limits are in seconds (API) but displayed as minutes (UI)
- Soft delete sets status to 'archived'

## Future Enhancements

Potential improvements not in current scope:
- Drag-and-drop question reordering
- Question bank browser/search
- Question templates
- Exercise templates
- Import/export exercises
- Analytics dashboard
- Duplicate exercise functionality
- Preview mode for learners
