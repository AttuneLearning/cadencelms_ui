# Exercise Builder Feature

This feature provides a comprehensive quiz/assessment builder for staff to create, edit, and manage exercises within the LMS.

## Overview

The Exercise Builder allows staff to:
- Create new exercises (quizzes, exams, assessments, practice tests)
- Configure exercise settings (time limits, passing scores, behavior)
- Add questions from the question bank
- Preview exercises as learners will see them
- Link exercises to course modules

## Components

### 1. ExerciseBuilderPage (`/src/pages/staff/courses/ExerciseBuilderPage.tsx`)

**Purpose**: Main page for creating and editing exercises

**Features**:
- Three-tab interface: Settings, Questions, Preview
- Create new exercises or edit existing ones
- Save and add directly to course modules
- Real-time validation
- Unsaved changes tracking

**Usage**:
```tsx
// Navigate to create new exercise
/staff/courses/exercises/new

// Navigate to edit existing exercise
/staff/courses/exercises/:exerciseId

// Create exercise for specific course
/staff/courses/exercises/new?courseId=123
```

**Props**: None (uses URL params and search params)

**Key Features**:
- **Settings Tab**: Configure exercise metadata and behavior
  - Title, description, type
  - Department assignment
  - Difficulty level
  - Time limit and passing score
  - Attempts allowed
  - Shuffle questions, show feedback, allow review options

- **Questions Tab**: Manage exercise questions
  - Add questions from question bank
  - View selected questions
  - Remove questions
  - See total points

- **Preview Tab**: Preview how exercise appears to learners
  - Full exercise preview with navigation
  - Shows correct answers (staff view)
  - Display all question types

### 2. QuestionBankSelector (`/src/features/exercises/ui/QuestionBankSelector.tsx`)

**Purpose**: Browse and select questions from the question bank

**Features**:
- Search questions by text
- Filter by type, difficulty, and tags
- Preview individual questions
- Select multiple questions
- Pagination support
- Shows question details (options, points, difficulty)
- Prevents duplicate selection

**Props**:
```typescript
interface QuestionBankSelectorProps {
  onSelect: (questions: QuestionReference[]) => void;
  onCancel: () => void;
  department?: string;
  preSelectedQuestionIds?: string[];
}
```

**Usage**:
```tsx
<QuestionBankSelector
  onSelect={(questions) => {
    // Handle selected questions
  }}
  onCancel={() => setShowSelector(false)}
  department="dept-123"
  preSelectedQuestionIds={['q1', 'q2']}
/>
```

**Key Features**:
- Advanced filtering (type, difficulty, tag, search)
- Question preview dialog
- Selection summary with total points
- Select/deselect all on page
- Pagination controls
- Disabled state for already-added questions

### 3. ExercisePreview (`/src/features/exercises/ui/ExercisePreview.tsx`)

**Purpose**: Preview exercise as learners will see it

**Features**:
- Display exercise metadata
- Show all questions with proper formatting
- Question navigator for multiple questions
- Support for all question types
- Display correct answers and explanations (staff view)
- Shows exercise settings (time limit, passing score, etc.)

**Props**:
```typescript
interface ExercisePreviewProps {
  exercise: {
    id: string;
    title: string;
    description?: string;
    type: ExerciseType;
    difficulty: ExerciseDifficulty;
    timeLimit: number;
    passingScore: number;
    shuffleQuestions: boolean;
    showFeedback: boolean;
    allowReview: boolean;
    instructions?: string;
    totalPoints: number;
    questionCount: number;
    status: string;
  };
  questions: ExerciseQuestion[];
  showAnswers?: boolean;
}
```

**Usage**:
```tsx
<ExercisePreview
  exercise={exerciseData}
  questions={questionsList}
  showAnswers={true} // Show correct answers (staff view)
/>
```

**Supported Question Types**:
- Multiple Choice (radio buttons)
- True/False (radio buttons)
- Short Answer (text area with expected answer)
- Essay (large text area with criteria)
- Matching (checkboxes)

## Data Flow

### Creating an Exercise

1. User navigates to `/staff/courses/exercises/new`
2. User fills in exercise settings (title, type, difficulty, etc.)
3. User clicks "Save" to create the exercise
4. Page redirects to edit mode with exercise ID
5. User adds questions from question bank
6. User saves questions
7. User previews exercise
8. User can save and add to course module

### Editing an Exercise

1. User navigates to `/staff/courses/exercises/:exerciseId`
2. Existing exercise data is loaded
3. User can modify settings or questions
4. Changes are saved individually (settings or questions)
5. Preview updates in real-time

### Adding to Course Module

1. User creates/edits exercise with `courseId` query param
2. After saving, user clicks "Save & Add to Module"
3. Exercise is saved and user is redirected to course module editor
4. Module can be created with exercise linked via `contentId`

## API Integration

### Exercise Entity (`@/entities/exercise`)

**Used APIs**:
- `useExercise(id)` - Get exercise details
- `useExercises(filters)` - List exercises
- `useCreateExercise()` - Create new exercise
- `useUpdateExercise()` - Update exercise
- `useExerciseQuestions(id)` - Get exercise questions
- `useBulkAddExerciseQuestions()` - Add multiple questions
- `useReorderExerciseQuestions()` - Reorder questions

### Question Entity (`@/entities/question`)

**Used APIs**:
- `useQuestions(filters)` - List questions from bank
- `useQuestion(id)` - Get question details

### Department Entity (`@/entities/department`)

**Used APIs**:
- `useDepartments()` - List departments for selection

## State Management

### Form State
- Managed locally with `useState`
- Tracks all exercise settings
- Handles unsaved changes detection

### Question Selection
- Tracks selected questions in local state
- Maintains question order
- Supports add/remove operations

### Tab Navigation
- Three tabs: settings, questions, preview
- Questions tab disabled until exercise is saved
- Preview tab disabled until questions are added

## Validation

### Exercise Settings
- Title required
- Department required
- Passing score between 0-100
- Time limit non-negative
- Attempts allowed non-negative

### Questions
- At least one question recommended before publishing
- Each question has points and correct answer
- Questions maintain order

## TypeScript Types

### Main Types
```typescript
// From @/entities/exercise
type ExerciseType = 'quiz' | 'exam' | 'practice' | 'assessment';
type ExerciseDifficulty = 'easy' | 'medium' | 'hard';
type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'matching';

interface QuestionReference {
  questionId?: string;
  questionText?: string;
  questionType?: QuestionType;
  options?: string[];
  correctAnswer?: string | string[];
  points?: number;
  order?: number;
  explanation?: string;
  difficulty?: ExerciseDifficulty;
  tags?: string[];
}
```

## UI Components Used

- **shadcn/ui**: Button, Card, Input, Label, Textarea, Select, Checkbox, Badge, Dialog, Tabs, Alert, RadioGroup, Separator
- **lucide-react**: Icons for UI elements
- **React Query**: Data fetching and caching
- **React Router**: Navigation and URL params

## Accessibility

- Keyboard navigation support
- ARIA labels on interactive elements
- Screen reader friendly
- Focus management in dialogs
- Semantic HTML structure

## Responsive Design

- Mobile-friendly layout
- Responsive grid layouts
- Touch-friendly controls
- Scrollable content areas
- Adaptive dialog sizes

## Best Practices

1. **Save Early**: Create exercise before adding questions
2. **Preview Often**: Use preview tab to verify appearance
3. **Clear Instructions**: Provide clear instructions for learners
4. **Appropriate Time Limits**: Set realistic time limits based on question count
5. **Feedback Options**: Enable feedback for practice exercises
6. **Question Quality**: Use diverse question types and difficulties
7. **Point Distribution**: Assign appropriate points per question

## Future Enhancements

- Drag-and-drop question reordering
- Bulk question import
- Question preview in selection
- Exercise templates
- Copy exercise functionality
- Question statistics
- Exercise analytics
- Version history
- Collaborative editing
- Auto-save functionality

## Related Documentation

- [Exercise Entity](/src/entities/exercise/README.md)
- [Question Entity](/src/entities/question/README.md)
- [Course Segments](/src/entities/course-segment/README.md)
