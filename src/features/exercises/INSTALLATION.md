# Exercise Builder Installation Guide

## Prerequisites

Ensure you have the following dependencies installed:

```bash
npm install @radix-ui/react-radio-group
```

Or if using yarn:

```bash
yarn add @radix-ui/react-radio-group
```

## Verification

After installation, verify that these Radix UI components are available:
- `@radix-ui/react-tabs` (should already be installed)
- `@radix-ui/react-separator` (should already be installed)
- `@radix-ui/react-radio-group` (newly added)

## Files Created

The following files were created as part of the Exercise Builder feature:

### Pages
- `/src/pages/staff/courses/ExerciseBuilderPage.tsx` - Main exercise builder page

### Features
- `/src/features/exercises/ui/QuestionBankSelector.tsx` - Question bank selector
- `/src/features/exercises/ui/ExercisePreview.tsx` - Exercise preview component
- `/src/features/exercises/ui/index.ts` - UI exports
- `/src/features/exercises/index.ts` - Feature exports

### Shared UI Components
- `/src/shared/ui/radio-group.tsx` - Radio group component (new)

### Documentation
- `/src/features/exercises/README.md` - Feature documentation

### Exports
- `/src/pages/staff/courses/index.ts` - Page exports

## Setup Routes

Add the following route to your router configuration:

```tsx
import { ExerciseBuilderPage } from '@/pages/staff/courses';

// In your router configuration
{
  path: 'exercises/new',
  element: <ExerciseBuilderPage />,
},
{
  path: 'exercises/:exerciseId',
  element: <ExerciseBuilderPage />,
}
```

## Usage Example

### Create New Exercise
```tsx
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();

  // Navigate to create new exercise
  const handleCreateExercise = () => {
    navigate('/staff/courses/exercises/new');
  };

  // Navigate to create exercise for specific course
  const handleCreateForCourse = (courseId: string) => {
    navigate(`/staff/courses/exercises/new?courseId=${courseId}`);
  };
}
```

### Edit Existing Exercise
```tsx
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();

  // Navigate to edit exercise
  const handleEditExercise = (exerciseId: string) => {
    navigate(`/staff/courses/exercises/${exerciseId}`);
  };
}
```

## API Requirements

Ensure the following APIs are available and working:

### Exercise APIs
- `GET /api/v2/content/exercises` - List exercises
- `GET /api/v2/content/exercises/:id` - Get exercise
- `POST /api/v2/content/exercises` - Create exercise
- `PUT /api/v2/content/exercises/:id` - Update exercise
- `GET /api/v2/content/exercises/:id/questions` - Get questions
- `POST /api/v2/content/exercises/:id/questions/bulk` - Bulk add questions

### Question APIs
- `GET /api/v2/questions` - List questions
- `GET /api/v2/questions/:id` - Get question

### Department APIs
- `GET /api/v2/departments` - List departments

## Testing

Test the following user flows:

1. **Create Exercise**
   - Navigate to `/staff/courses/exercises/new`
   - Fill in exercise details
   - Save exercise
   - Verify redirect to edit mode

2. **Add Questions**
   - Open question bank
   - Filter and search questions
   - Select multiple questions
   - Add to exercise
   - Verify questions appear

3. **Preview Exercise**
   - Switch to preview tab
   - Navigate through questions
   - Verify correct answers display
   - Check question formatting

4. **Link to Course**
   - Create exercise with courseId param
   - Add questions
   - Click "Save & Add to Module"
   - Verify navigation to course module editor

## Troubleshooting

### Radio Group Not Found
If you see "Cannot find module '@radix-ui/react-radio-group'":
```bash
npm install @radix-ui/react-radio-group
```

### Type Errors
Ensure TypeScript types are up to date:
```bash
npm install --save-dev @types/react @types/react-dom
```

### API Errors
Check that:
1. Backend server is running
2. API endpoints match contract
3. Authentication tokens are valid
4. CORS is configured correctly

## Support

For issues or questions:
1. Check the [README.md](./README.md) for detailed documentation
2. Review the API contracts in `/contracts/api/`
3. Check entity documentation in `/src/entities/`
