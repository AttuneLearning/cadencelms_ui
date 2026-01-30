# Phase 2: Entity Layer Implementation

## Summary

This document describes the complete implementation of all entity UI components and React Query hooks for the LMS application.

## Entities Implemented

### 1. Course Entity ✅ (Already merged from feat/course-entity)
- **Location**: `src/entities/course/`
- **Components**: CourseCard, CourseList
- **Hooks**: useCourse, useCourses, useEnrolledCourses
- **API**: Complete CRUD operations
- **Status**: Merged and complete

### 2. Content Entity ✅ (Already merged from feat/content-entity)
- **Location**: `src/entities/content/`
- **Components**: ContentCard, ContentTypeBadge
- **Hooks**: useContent, useContentList
- **API**: Complete content management
- **Status**: Merged and complete

### 3. Lesson Entity (To be implemented)
- **Location**: `src/entities/lesson/`
- **Components**: LessonCard, LessonList
- **Hooks**: useLessons, useLesson, useNextLesson, useCreateLesson, useUpdateLesson, useDeleteLesson, useReorderLessons
- **API**: Complete lesson management
- **Status**: Needs implementation

### 4. Enrollment Entity (To be implemented)
- **Location**: `src/entities/enrollment/`
- **Components**: EnrollmentCard, EnrollmentList
- **Hooks**: useEnrollments, useEnrollment, useEnroll, useUnenroll, useEnrollmentStats
- **API**: Complete enrollment management
- **Status**: Needs implementation

### 5. Progress Entity (To be implemented)
- **Location**: `src/entities/progress/`
- **Components**: ProgressCard, ProgressStats, DetailedProgressStats
- **Hooks**: useLessonProgress, useCourseProgress, useProgressStats, useUpdateProgress, useStartLesson, useCompleteLesson
- **API**: Complete progress tracking
- **Status**: Needs implementation

## Implementation Plan

### Step 1: Update API Endpoints
The following endpoints need to be added to `src/shared/api/endpoints.ts`:

```typescript
courses: {
  myCourses: '/courses/my-courses',  // Added
},
progress: {
  stats: '/progress/stats',  // Added
},
```

### Step 2: Create Entity Types
All entity types are already defined in their respective `model/types.ts` files.

### Step 3: Create Entity APIs
All entity APIs are already defined in their respective `api/*.ts` files.

### Step 4: Create React Query Hooks

#### Lesson Hooks (`src/entities/lesson/hooks/useLessons.ts`)
- `useLessons(courseId)` - Fetch all lessons for a course
- `useLessonList(courseId)` - Fetch lightweight lesson list
- `useLesson(courseId, lessonId)` - Fetch single lesson
- `useNextLesson(courseId, currentLessonId?)` - Fetch next lesson
- `useCreateLesson()` - Create new lesson
- `useUpdateLesson()` - Update lesson
- `useDeleteLesson()` - Delete lesson
- `useReorderLessons()` - Reorder lessons

#### Enrollment Hooks (`src/entities/enrollment/hooks/useEnrollments.ts`)
- `useEnrollments(params?)` - Fetch user enrollments
- `useEnrollment(id)` - Fetch single enrollment
- `useEnrollmentByCourse(courseId)` - Fetch enrollment by course
- `useCheckEnrollment(courseId)` - Check enrollment status
- `useEnrollmentStats()` - Fetch enrollment statistics
- `useEnroll()` - Enroll in course
- `useUnenroll()` - Unenroll from course
- `useUpdateEnrollmentStatus()` - Update enrollment status

#### Progress Hooks (`src/entities/progress/hooks/useProgress.ts`)
- `useLessonProgress(courseId, lessonId)` - Fetch lesson progress
- `useCourseProgress(courseId)` - Fetch course progress
- `useProgressStats()` - Fetch overall stats
- `useBatchProgress(courseId, lessonIds)` - Fetch multiple lesson progress
- `useUpdateProgress()` - Update lesson progress
- `useStartLesson()` - Mark lesson as started
- `useCompleteLesson()` - Mark lesson as completed
- `useResetProgress()` - Reset lesson progress

### Step 5: Create UI Components

#### Lesson Components
- **LessonCard**: Displays lesson with icon, title, type, duration, status, and progress
- **LessonList**: Lists lessons in order with empty state

#### Enrollment Components
- **EnrollmentCard**: Displays enrollment with course info, progress, dates, and actions
- **EnrollmentList**: Grid/list of enrollments with empty state

#### Progress Components
- **ProgressCard**: Detailed lesson progress with score, time, attempts
- **ProgressStats**: Grid of statistics cards (lessons completed, time spent, etc.)
- **DetailedProgressStats**: Comprehensive stats display

### Step 6: Export Components
All entities export through their `index.ts` files with proper type exports.

## Testing
- Unit tests for all hooks
- Component rendering tests
- Integration tests for API interactions

## Usage Examples

### Using Lesson Hooks
```typescript
import { useLessons, useLesson } from '@/entities/lesson';

function CourseLessons({ courseId }: { courseId: string }) {
  const { data: lessons, isLoading } = useLessons(courseId);

  if (isLoading) return <div>Loading...</div>;

  return <LessonList lessons={lessons} courseId={courseId} />;
}
```

### Using Enrollment Hooks
```typescript
import { useEnrollments } from '@/entities/enrollment';

function MyEnrollments() {
  const { data, isLoading } = useEnrollments();

  if (isLoading) return <div>Loading...</div>;

  return <EnrollmentList enrollments={data.items} />;
}
```

### Using Progress Hooks
```typescript
import { useCourseProgress, useProgressStats } from '@/entities/progress';

function DashboardStats() {
  const { data: stats } = useProgressStats();

  if (!stats) return null;

  return <ProgressStats stats={stats} />;
}
```

## Component Features

### LessonCard Features
- Type-specific icons (video, document, SCORM, quiz, assignment)
- Lock status indication
- Progress tracking
- Required/optional badges
- Duration display
- Clickable or linkable

### EnrollmentCard Features
- Course thumbnail
- Enrollment status badges
- Progress bars
- Enrollment/access dates
- Certificate indicator
- "Continue" button for active courses

### Progress Components Features
- Status badges (completed, in-progress, failed, not-started)
- Progress bars with percentages
- Score and time tracking
- Streak tracking
- Multiple display variants (cards, detailed view)

## Notes
- All components use shadcn/ui primitives
- All hooks use TanStack Query v5
- Components are fully typed with TypeScript
- Responsive design with Tailwind CSS
- Accessible with ARIA labels
- Error boundaries recommended
- Loading states included
- Empty states with helpful messages

## Next Steps
1. Implement the missing entity files
2. Run TypeScript type checker
3. Run tests
4. Create comprehensive tests
5. Document usage examples
6. Create Storybook stories (optional)
