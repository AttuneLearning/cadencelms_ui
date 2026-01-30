# LMS UI - Complete Implementation Plan

**Document Version:** 1.0.0
**Date:** 2026-01-09
**Status:** Ready for Review

---

## Executive Summary

This document outlines the complete implementation plan for the remaining LMS UI features. The plan is organized into **8 phases** that can be executed with **parallel development** to maximize efficiency.

**Total Remaining Work:** ~31,000 lines of code across 24 major features

**Critical Path:** Phase 4 (Learner Experience) → Phase 5 (Backend Integration) → Phase 6 (Staff Teaching)

---

## Current State

### ✅ Completed (as of 2026-01-09)

- **Authentication:** Login/logout, role-based routing, protected routes
- **Phase 2 Entities:** Programs, Courses, Classes, Course Segments, Program Levels (entities + tests + admin pages)
- **Phase 3 Entities:** Content, Templates, Exercises, Questions (entities + tests + admin pages)
- **Staff Course Builder:** 5 complete features (Course List, Editor, Content Uploader, Module Editor, Exercise Builder, Preview)
- **Learner Dashboard:** Basic placeholder (needs real data)
- **Staff Dashboard:** Basic placeholder (needs real data)
- **Admin Dashboard:** Basic placeholder

### ❌ Not Started

- **Phase 1 Admin Pages:** Department, Staff, Learner, Academic Year management
- **Phase 4 Entities:** Enrollments, Progress, Content Attempts, Learning Events
- **Phase 5 Entities:** Exam Attempts, Reports
- **Phase 6 Entities:** Settings, Audit Logs, System Health
- **Learner Course Player:** SCORM player, video player, content viewer
- **Learner Quiz Taking:** Exercise/quiz interface
- **Course Catalog:** Browse and enroll in courses
- **Staff Grading:** Grade submissions, provide feedback
- **Staff Analytics:** Real data dashboards
- **Reports:** Comprehensive reporting system

---

## Phase 4: Core Learner Experience (CRITICAL PATH)
**Priority:** 🔴 **HIGHEST**
**Estimated Effort:** ~10,000 lines, 6 major features
**Timeline:** 4-5 weeks
**Parallelizable:** Yes (3 independent tracks)

### Overview
Build the core learning experience so learners can enroll in courses, consume content, take quizzes, and track progress. This is the **most critical** phase as it enables the primary LMS function.

### Dependencies
- ✅ Phase 3 entities (Content, Exercises, Questions) - COMPLETE
- ❌ Phase 4 backend entities (Enrollments, Progress, Content Attempts) - NEEDS IMPLEMENTATION

### Features

#### **Track A: Course Discovery & Enrollment** (Parallel)

**4.1 Course Catalog Page** (~1,500 lines)
- **Description:** Browse and search available courses
- **Components:**
  - `/src/pages/learner/catalog/CourseCatalogPage.tsx`
  - `/src/features/courses/ui/CourseCard.tsx` (enhanced)
  - `/src/features/courses/ui/CourseFilters.tsx`
- **Features:**
  - Grid/list view toggle
  - Search by title, code, description
  - Filter by department, program, difficulty, status
  - Sort by name, date, popularity
  - Pagination
  - Course preview modal
- **API Integration:**
  - `useCourses()` - List available courses
  - `useCourse()` - Get course details
- **Route:** `/learner/catalog`
- **Acceptance Criteria:**
  - [ ] Display all published courses
  - [ ] Search returns relevant results
  - [ ] Filters work correctly
  - [ ] Pagination handles 100+ courses
  - [ ] Mobile responsive

**4.2 Course Details & Enrollment Page** (~1,200 lines)
- **Description:** Detailed course view with enrollment
- **Components:**
  - `/src/pages/learner/catalog/CourseDetailsPage.tsx`
  - `/src/features/enrollments/ui/EnrollmentButton.tsx`
  - `/src/features/courses/ui/CourseModuleList.tsx`
- **Features:**
  - Course overview (title, description, instructors)
  - Module/lesson breakdown
  - Prerequisites display
  - Duration, credits, passing score
  - Enroll button with confirmation
  - Already enrolled state
  - Prerequisites check
- **API Integration:**
  - `useCourse()` - Course details
  - `useEnroll()` - Enroll in course
  - `useEnrollmentStatus()` - Check enrollment
- **Route:** `/learner/catalog/:courseId`
- **Acceptance Criteria:**
  - [ ] Shows complete course information
  - [ ] Enrollment creates record in backend
  - [ ] Prerequisites enforced
  - [ ] Already enrolled shows "Continue" button
  - [ ] Error handling for enrollment failures

**4.3 My Courses Page** (~1,000 lines)
- **Description:** List of enrolled courses
- **Components:**
  - `/src/pages/learner/courses/MyCoursesPage.tsx`
  - `/src/features/courses/ui/EnrolledCourseCard.tsx`
- **Features:**
  - List of enrolled courses
  - Progress bar for each course
  - Filter by status (In Progress, Completed, Not Started)
  - Sort by enrollment date, progress, due date
  - Continue learning button
  - Quick stats (modules completed, grade)
- **API Integration:**
  - `useMyEnrollments()` - Get user's enrollments
  - `useEnrollmentProgress()` - Get progress for each
- **Route:** `/learner/courses`
- **Acceptance Criteria:**
  - [ ] Shows all enrolled courses
  - [ ] Progress bars accurate
  - [ ] Filters work
  - [ ] Continue button goes to last viewed content
  - [ ] Empty state for no enrollments

---

#### **Track B: Course Player & Content Viewing** (Parallel)

**4.4 Course Player Page** (~3,000 lines) ⭐ **MOST CRITICAL**
- **Description:** Main learning interface - view SCORM, videos, documents
- **Components:**
  - `/src/pages/learner/player/CoursePlayerPage.tsx`
  - `/src/features/player/ui/ScormPlayer.tsx`
  - `/src/features/player/ui/VideoPlayer.tsx`
  - `/src/features/player/ui/DocumentViewer.tsx`
  - `/src/features/player/ui/PlayerSidebar.tsx`
  - `/src/features/player/ui/PlayerControls.tsx`
- **Features:**
  - **SCORM Player:**
    - Launch SCORM packages in iframe
    - SCORM API integration (scorm12 or scorm2004)
    - Capture completion status
    - Save suspend data
  - **Video Player:**
    - HTML5 video player with controls
    - Track watch time and percentage
    - Resume from last position
    - Quality selection
    - Speed controls
    - Fullscreen support
  - **Document Viewer:**
    - PDF viewer (pdf.js or react-pdf)
    - Image viewer
    - Slide navigation for presentations
  - **Navigation:**
    - Sidebar with course modules/lessons
    - Previous/Next buttons
    - Lesson lock/unlock based on prerequisites
    - Progress indicator
  - **Progress Tracking:**
    - Auto-save progress every 30 seconds
    - Mark as complete button
    - Time tracking
    - Resume from last position on return
- **API Integration:**
  - `useEnrollment()` - Get enrollment details
  - `useCourseContent()` - Get course structure
  - `useContentAttempt()` - Track content viewing
  - `useUpdateProgress()` - Save progress
  - `useCompleteContent()` - Mark content complete
- **Route:** `/learner/courses/:courseId/player` or `/learner/courses/:courseId/player/:contentId`
- **Acceptance Criteria:**
  - [ ] SCORM packages launch and play correctly
  - [ ] Videos play with progress tracking
  - [ ] Documents render properly
  - [ ] Progress saves automatically
  - [ ] Resume works correctly
  - [ ] Sidebar navigation works
  - [ ] Previous/Next buttons respect prerequisites
  - [ ] Completion tracked accurately
  - [ ] Works on mobile/tablet
  - [ ] Handles network interruptions gracefully

**SCORM Integration Notes:**
- Use `pipwerks/scormcloud` or similar SCORM API wrapper
- Support SCORM 1.2 and SCORM 2004
- Capture: `cmi.core.lesson_status`, `cmi.core.score`, `cmi.suspend_data`
- Handle SCORM API calls: Initialize, GetValue, SetValue, Commit, Terminate

**Video Player Notes:**
- Use `video.js` or `react-player` for cross-browser support
- Track watch percentage (e.g., must watch 80%)
- Prevent seeking past unwatched sections (optional)
- Save current timestamp on pause/exit

**4.5 Progress Tracking Page** (~800 lines)
- **Description:** Detailed progress view for a course
- **Components:**
  - `/src/pages/learner/progress/CourseProgressPage.tsx`
  - `/src/features/progress/ui/ProgressChart.tsx`
  - `/src/features/progress/ui/ModuleProgressList.tsx`
- **Features:**
  - Overall course progress (%)
  - Module-by-module breakdown
  - Lesson completion status
  - Time spent per module
  - Quiz scores
  - Completion date (if complete)
  - Certificate download (if earned)
- **API Integration:**
  - `useEnrollmentProgress()` - Get detailed progress
  - `useContentAttempts()` - Get content attempt history
  - `useExamAttempts()` - Get quiz attempt history
- **Route:** `/learner/courses/:courseId/progress`
- **Acceptance Criteria:**
  - [ ] Shows accurate progress percentages
  - [ ] Breakdown by module visible
  - [ ] Quiz scores displayed
  - [ ] Time tracking shown
  - [ ] Visual progress indicators (charts)

---

#### **Track C: Quiz Taking Interface** (Parallel)

**4.6 Exercise/Quiz Taking Page** (~2,500 lines)
- **Description:** Interface for learners to take quizzes and exams
- **Components:**
  - `/src/pages/learner/exercises/ExerciseTakingPage.tsx`
  - `/src/features/exercises/ui/QuestionRenderer.tsx`
  - `/src/features/exercises/ui/MultipleChoiceQuestion.tsx`
  - `/src/features/exercises/ui/TrueFalseQuestion.tsx`
  - `/src/features/exercises/ui/ShortAnswerQuestion.tsx`
  - `/src/features/exercises/ui/EssayQuestion.tsx`
  - `/src/features/exercises/ui/MatchingQuestion.tsx`
  - `/src/features/exercises/ui/ExerciseTimer.tsx`
  - `/src/features/exercises/ui/ExerciseSubmission.tsx`
- **Features:**
  - Display all question types:
    - Multiple choice (single select)
    - True/False
    - Short answer (text input)
    - Essay (textarea)
    - Matching (drag-and-drop or dropdowns)
  - Question navigation (question list sidebar)
  - Mark for review
  - Timer (countdown for timed quizzes)
  - Auto-submit when timer expires
  - Save answers as you go (auto-save)
  - Submit confirmation dialog
  - Review answers before submit (if allowed)
  - Results page after submission:
    - Score (if available)
    - Correct/incorrect answers (if feedback enabled)
    - Explanations (if provided)
    - Option to retry (if attempts remaining)
- **API Integration:**
  - `useExercise()` - Get exercise/quiz details
  - `useStartExerciseAttempt()` - Start attempt
  - `useSaveAnswer()` - Save individual answer
  - `useSubmitExerciseAttempt()` - Submit attempt
  - `useExerciseAttemptResult()` - Get results
- **Route:** `/learner/exercises/:exerciseId/take`
- **Acceptance Criteria:**
  - [ ] All question types render correctly
  - [ ] Answers auto-save
  - [ ] Timer works accurately
  - [ ] Auto-submit on timer expiration
  - [ ] Submit confirmation shown
  - [ ] Results display correctly
  - [ ] Retry works (if allowed)
  - [ ] Navigation between questions works
  - [ ] Review before submit works
  - [ ] Handles network issues gracefully

---

### Phase 4 Dependencies

**Backend Entities Required:**
1. **Enrollments** - Track course enrollments
2. **Progress** - Track content completion
3. **Content Attempts** - Track SCORM/video viewing
4. **Exam Attempts** - Track quiz submissions

**These must be implemented in the backend and frontend before Phase 4 features work.**

---

### Phase 4 Testing Checklist

- [ ] Enroll in course successfully
- [ ] View course content in player
- [ ] SCORM package launches and completes
- [ ] Video plays and tracks progress
- [ ] Document viewer works
- [ ] Progress saves automatically
- [ ] Resume from last position works
- [ ] Take quiz and submit
- [ ] View quiz results
- [ ] Retry quiz (if allowed)
- [ ] View progress page with accurate data
- [ ] Complete course and see completion status
- [ ] Certificate generated (if applicable)

---

## Phase 5: Backend Integration - Phase 4 Entities
**Priority:** 🔴 **HIGHEST** (Enables Phase 4)
**Estimated Effort:** ~4,000 lines, 4 entities
**Timeline:** 2-3 weeks
**Parallelizable:** Yes (4 independent entities)

### Overview
Implement frontend entities for Phase 4 backend APIs (Enrollments, Progress, Content Attempts, Learning Events). These entities must be complete before Phase 4 features can function.

### Entities to Implement

#### **5.1 Enrollment Entity** (~1,000 lines)

**Files to Create:**
- `/src/entities/enrollment/model/types.ts` - TypeScript types
- `/src/entities/enrollment/api/enrollmentApi.ts` - API client
- `/src/entities/enrollment/hooks/useEnrollments.ts` - React Query hooks
- `/src/entities/enrollment/ui/EnrollmentCard.tsx` - UI component
- `/src/entities/enrollment/index.ts` - Public exports

**Types:**
```typescript
interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  classId?: string;
  status: 'active' | 'completed' | 'withdrawn' | 'expired';
  enrollmentDate: Date;
  completionDate?: Date;
  progress: number; // 0-100
  grade?: number;
  attempts?: number;
  lastAccessDate?: Date;
}
```

**API Endpoints:**
- `GET /api/v2/enrollments` - List enrollments
- `GET /api/v2/enrollments/:id` - Get enrollment
- `POST /api/v2/enrollments` - Create enrollment (enroll in course)
- `PATCH /api/v2/enrollments/:id` - Update enrollment
- `DELETE /api/v2/enrollments/:id` - Delete enrollment (withdraw)

**Hooks:**
- `useEnrollments()` - List user's enrollments
- `useEnrollment(id)` - Get single enrollment
- `useEnroll()` - Enroll in course
- `useWithdraw()` - Withdraw from course
- `useEnrollmentStatus(courseId)` - Check if enrolled

**Acceptance Criteria:**
- [ ] Types match backend contract
- [ ] All CRUD operations work
- [ ] React Query caching configured
- [ ] Error handling implemented
- [ ] Optimistic updates for enroll/withdraw

---

#### **5.2 Progress Entity** (~1,200 lines)

**Files to Create:**
- `/src/entities/progress/model/types.ts`
- `/src/entities/progress/api/progressApi.ts`
- `/src/entities/progress/hooks/useProgress.ts`
- `/src/entities/progress/ui/ProgressBar.tsx`
- `/src/entities/progress/ui/ProgressChart.tsx`
- `/src/entities/progress/index.ts`

**Types:**
```typescript
interface Progress {
  id: string;
  enrollmentId: string;
  courseId: string;
  userId: string;
  overallProgress: number; // 0-100
  moduleProgress: {
    moduleId: string;
    completionPercentage: number;
    lessonsCompleted: number;
    totalLessons: number;
  }[];
  completedContent: string[]; // Content IDs
  timeSpent: number; // minutes
  lastActivityDate: Date;
  estimatedCompletion?: Date;
}
```

**API Endpoints:**
- `GET /api/v2/progress/:enrollmentId` - Get progress for enrollment
- `POST /api/v2/progress/:enrollmentId/update` - Update progress
- `GET /api/v2/progress/user/:userId` - Get all user progress

**Hooks:**
- `useProgress(enrollmentId)` - Get progress for enrollment
- `useUpdateProgress()` - Update progress
- `useUserProgress(userId)` - Get all user progress

**Acceptance Criteria:**
- [ ] Types match backend contract
- [ ] Progress updates work
- [ ] Real-time progress calculation
- [ ] Progress charts render correctly
- [ ] Performance optimized (debounced updates)

---

#### **5.3 Content Attempt Entity** (~1,000 lines)

**Files to Create:**
- `/src/entities/content-attempt/model/types.ts`
- `/src/entities/content-attempt/api/contentAttemptApi.ts`
- `/src/entities/content-attempt/hooks/useContentAttempts.ts`
- `/src/entities/content-attempt/index.ts`

**Types:**
```typescript
interface ContentAttempt {
  id: string;
  enrollmentId: string;
  contentId: string;
  userId: string;
  attemptNumber: number;
  status: 'in-progress' | 'completed' | 'abandoned';
  startDate: Date;
  completionDate?: Date;
  timeSpent: number; // seconds
  progress: number; // 0-100
  scormData?: {
    lessonStatus: string;
    suspendData: string;
    score?: number;
  };
  videoData?: {
    currentTime: number;
    duration: number;
    watchPercentage: number;
  };
}
```

**API Endpoints:**
- `GET /api/v2/content-attempts?enrollmentId=&contentId=` - List attempts
- `GET /api/v2/content-attempts/:id` - Get attempt
- `POST /api/v2/content-attempts` - Start new attempt
- `PATCH /api/v2/content-attempts/:id` - Update attempt (save progress)
- `POST /api/v2/content-attempts/:id/complete` - Mark complete

**Hooks:**
- `useContentAttempts(enrollmentId, contentId)` - Get attempts
- `useContentAttempt(id)` - Get single attempt
- `useStartContentAttempt()` - Start new attempt
- `useUpdateContentAttempt()` - Update attempt progress
- `useCompleteContentAttempt()` - Complete attempt

**Acceptance Criteria:**
- [ ] Types match backend contract
- [ ] SCORM data saves correctly
- [ ] Video progress tracks accurately
- [ ] Auto-save debounced (every 30s)
- [ ] Resume works correctly

---

#### **5.4 Learning Event Entity** (~800 lines)

**Files to Create:**
- `/src/entities/learning-event/model/types.ts`
- `/src/entities/learning-event/api/learningEventApi.ts`
- `/src/entities/learning-event/hooks/useLearningEvents.ts`
- `/src/entities/learning-event/index.ts`

**Types:**
```typescript
interface LearningEvent {
  id: string;
  userId: string;
  enrollmentId: string;
  eventType: 'content_view' | 'content_complete' | 'quiz_start' | 'quiz_submit' | 'login' | 'logout';
  eventData: Record<string, any>;
  timestamp: Date;
  sessionId?: string;
}
```

**API Endpoints:**
- `GET /api/v2/learning-events?userId=&enrollmentId=` - List events
- `POST /api/v2/learning-events` - Log event

**Hooks:**
- `useLearningEvents(filters)` - Get events
- `useLogLearningEvent()` - Log event

**Acceptance Criteria:**
- [ ] Types match backend contract
- [ ] Events log successfully
- [ ] Performance optimized (batched if needed)
- [ ] Event data captured correctly

---

### Phase 5 Testing Checklist

- [ ] Enrollment CRUD works
- [ ] Progress updates in real-time
- [ ] Content attempts save/resume
- [ ] SCORM data persists
- [ ] Video progress tracks
- [ ] Learning events log correctly
- [ ] All hooks have proper error handling
- [ ] React Query cache invalidation works

---

## Phase 6: Staff Teaching Features
**Priority:** 🟡 **MEDIUM**
**Estimated Effort:** ~8,000 lines, 4 major features
**Timeline:** 3-4 weeks
**Parallelizable:** Yes (4 independent tracks)

### Overview
Build staff features for teaching, grading, and monitoring student progress.

### Features

#### **Track A: Class & Enrollment Management** (Parallel)

**6.1 Class Management Page** (~2,000 lines)
- **Description:** Manage classes and enroll students
- **Components:**
  - `/src/pages/staff/classes/ClassManagementPage.tsx`
  - `/src/features/classes/ui/ClassCard.tsx`
  - `/src/features/classes/ui/EnrollStudentsDialog.tsx`
  - `/src/features/classes/ui/StudentList.tsx`
- **Features:**
  - List classes assigned to staff
  - View class details (course, students, schedule)
  - Enroll students in class/course
  - Remove students from class
  - Send announcements to class
  - View class progress summary
- **API Integration:**
  - `useClasses()` - List staff's classes
  - `useClass()` - Get class details
  - `useEnrollStudent()` - Enroll student
  - `useRemoveStudent()` - Remove student
- **Route:** `/staff/classes`
- **Acceptance Criteria:**
  - [ ] Shows all staff classes
  - [ ] Can enroll students
  - [ ] Student list displays correctly
  - [ ] Bulk enrollment works
  - [ ] Announcements send successfully

---

#### **Track B: Grading & Feedback** (Parallel)

**6.2 Grading Interface** (~2,500 lines)
- **Description:** Grade student submissions and provide feedback
- **Components:**
  - `/src/pages/staff/grading/GradingPage.tsx`
  - `/src/features/grading/ui/SubmissionList.tsx`
  - `/src/features/grading/ui/SubmissionViewer.tsx`
  - `/src/features/grading/ui/GradingForm.tsx`
  - `/src/features/grading/ui/FeedbackEditor.tsx`
- **Features:**
  - List pending submissions (essays, assignments)
  - View student submission
  - Grade essay questions
  - Assign scores
  - Provide written feedback
  - Manual completion override
  - Bulk grading actions
  - Grade history
- **API Integration:**
  - `useSubmissions()` - Get pending submissions
  - `useSubmission()` - Get single submission
  - `useGradeSubmission()` - Submit grade
  - `useOverrideCompletion()` - Manual completion
- **Route:** `/staff/grading`
- **Acceptance Criteria:**
  - [ ] Lists all pending submissions
  - [ ] Can view submission content
  - [ ] Grading saves correctly
  - [ ] Feedback displays to student
  - [ ] Grade history tracked
  - [ ] Bulk actions work

---

#### **Track C: Student Monitoring** (Parallel)

**6.3 Student Progress Monitoring** (~2,000 lines)
- **Description:** Monitor individual student progress
- **Components:**
  - `/src/pages/staff/students/StudentProgressPage.tsx`
  - `/src/features/progress/ui/StudentProgressCard.tsx`
  - `/src/features/progress/ui/StudentProgressChart.tsx`
  - `/src/features/progress/ui/InterventionTools.tsx`
- **Features:**
  - List students in staff's classes
  - View individual student progress
  - Filter by at-risk, on-track, completed
  - Course completion rates
  - Quiz scores and attempts
  - Time spent in courses
  - Last activity date
  - Send reminder/encouragement messages
  - Manual interventions (extend deadline, reset quiz)
- **API Integration:**
  - `useStudents()` - Get students in classes
  - `useStudentProgress()` - Get student progress
  - `useSendMessage()` - Send message to student
  - `useResetAttempt()` - Reset quiz attempt
- **Route:** `/staff/students` (already exists, needs enhancement)
- **Acceptance Criteria:**
  - [ ] Shows all students with progress
  - [ ] At-risk filter works
  - [ ] Progress details accurate
  - [ ] Can send messages
  - [ ] Intervention tools work

---

#### **Track D: Analytics Dashboard** (Parallel)

**6.4 Staff Analytics Dashboard** (~1,500 lines)
- **Description:** Real-time analytics for staff
- **Components:**
  - `/src/pages/staff/analytics/AnalyticsDashboardPage.tsx` (enhance existing)
  - `/src/features/analytics/ui/CourseCompletionChart.tsx`
  - `/src/features/analytics/ui/EngagementChart.tsx`
  - `/src/features/analytics/ui/PerformanceMetrics.tsx`
- **Features:**
  - Course completion rates (real data)
  - Average quiz scores by course
  - Student engagement metrics
  - Time spent in courses
  - Most/least engaged students
  - Content effectiveness (completion rates by content)
  - Trend charts (weekly/monthly)
- **API Integration:**
  - `useAnalytics()` - Get analytics data
  - `useCourseMetrics()` - Course-specific metrics
  - `useStudentMetrics()` - Student-specific metrics
- **Route:** `/staff/analytics` (already exists, needs real data)
- **Acceptance Criteria:**
  - [ ] Charts display real data
  - [ ] Filters work (date range, course, class)
  - [ ] Metrics accurate
  - [ ] Performance optimized for large datasets
  - [ ] Export functionality (CSV/PDF)

---

### Phase 6 Testing Checklist

- [ ] Enroll students in classes
- [ ] View student list
- [ ] Grade essay submission
- [ ] Provide feedback
- [ ] View student progress
- [ ] Send message to student
- [ ] Reset quiz attempt
- [ ] View analytics with real data
- [ ] Export reports

---

## Phase 7: Phase 1 Admin Pages
**Priority:** 🟢 **LOW-MEDIUM**
**Estimated Effort:** ~3,000 lines, 4 features
**Timeline:** 2 weeks
**Parallelizable:** Yes (4 independent pages)

### Overview
Create admin pages for managing Phase 1 entities (Department, Staff, Learner, Academic Year). These follow the same patterns as Phase 2 and 3 admin pages.

### Features

**7.1 Department Management Page** (~800 lines)
- **Pattern:** Follow `/src/pages/admin/programs/ProgramManagementPage.tsx`
- **Components:**
  - `/src/pages/admin/departments/DepartmentManagementPage.tsx`
  - `/src/features/departments/ui/DepartmentCard.tsx`
  - `/src/features/departments/ui/DepartmentForm.tsx`
- **Features:**
  - List departments
  - Create/edit/delete departments
  - Hierarchical tree view (parent/child)
  - Search and filter
  - Department stats (staff count, student count)
- **Route:** `/admin/departments`
- **Acceptance Criteria:**
  - [ ] CRUD operations work
  - [ ] Tree view displays hierarchy
  - [ ] Search/filter works
  - [ ] Stats accurate

**7.2 Staff Management Page** (~800 lines)
- **Components:**
  - `/src/pages/admin/staff/StaffManagementPage.tsx`
  - `/src/features/staff/ui/StaffCard.tsx`
  - `/src/features/staff/ui/StaffForm.tsx`
- **Features:**
  - List all staff
  - Create/edit/delete staff accounts
  - Assign departments and roles
  - Filter by department, role, status
  - Permissions management
- **Route:** `/admin/staff`
- **Acceptance Criteria:**
  - [ ] CRUD operations work
  - [ ] Department assignments work
  - [ ] Role/permission changes work
  - [ ] Filters work

**7.3 Learner Management Page** (~800 lines)
- **Components:**
  - `/src/pages/admin/learners/LearnerManagementPage.tsx`
  - `/src/features/learners/ui/LearnerCard.tsx`
  - `/src/features/learners/ui/LearnerForm.tsx`
- **Features:**
  - List all learners
  - Create/edit/delete learner accounts
  - Assign to departments/programs
  - Filter by department, program, status
  - View enrollment history
- **Route:** `/admin/learners`
- **Acceptance Criteria:**
  - [ ] CRUD operations work
  - [ ] Department/program assignments work
  - [ ] Enrollment history shows
  - [ ] Filters work

**7.4 Academic Year Management Page** (~600 lines)
- **Components:**
  - `/src/pages/admin/academic-years/AcademicYearManagementPage.tsx`
  - `/src/features/academic-years/ui/AcademicYearCard.tsx`
  - `/src/features/academic-years/ui/AcademicYearForm.tsx`
- **Features:**
  - List academic years
  - Create/edit/delete academic years
  - Set start/end dates
  - Mark current academic year
  - View associated classes
- **Route:** `/admin/academic-years`
- **Acceptance Criteria:**
  - [ ] CRUD operations work
  - [ ] Date validation works
  - [ ] Current year marked correctly
  - [ ] Associated classes shown

---

## Phase 8: Advanced Features & System Management
**Priority:** 🟢 **LOW**
**Estimated Effort:** ~6,000 lines, 5 features
**Timeline:** 3-4 weeks
**Parallelizable:** Yes (3 independent tracks)

### Overview
Advanced features including exam attempts, comprehensive reports, system settings, audit logs, and certificates.

### Features

#### **Track A: Assessment & Exam Attempts** (Parallel)

**8.1 Exam Attempt Entity & History** (~1,500 lines)
- **Description:** Track exam attempts (separate from content attempts)
- **Components:**
  - `/src/entities/exam-attempt/` - Entity files
  - `/src/features/exams/ui/ExamAttemptHistory.tsx`
  - `/src/features/exams/ui/ExamAttemptDetails.tsx`
- **Features:**
  - Entity for exam attempts (if not covered by content attempts)
  - View attempt history
  - View detailed attempt results
  - Retry logic
- **Route:** `/learner/exercises/:exerciseId/attempts`
- **Acceptance Criteria:**
  - [ ] Attempt history accurate
  - [ ] Can view past attempts
  - [ ] Retry works correctly

---

#### **Track B: Reporting System** (Parallel)

**8.2 Comprehensive Reports** (~2,500 lines)
- **Description:** Generate and export reports
- **Components:**
  - `/src/pages/admin/reports/ReportsPage.tsx`
  - `/src/features/reports/ui/ReportBuilder.tsx`
  - `/src/features/reports/ui/ReportViewer.tsx`
  - `/src/features/reports/ui/ReportExporter.tsx`
- **Features:**
  - Report types:
    - Course completion report
    - Student progress report
    - Enrollment report
    - Quiz performance report
    - Department report
  - Filters: date range, department, course, user
  - Visualizations (charts, tables)
  - Export formats: CSV, PDF, Excel
  - Scheduled reports
  - Save report templates
- **API Integration:**
  - `useReports()` - Get available reports
  - `useGenerateReport()` - Generate report
  - `useExportReport()` - Export report
- **Route:** `/admin/reports`
- **Acceptance Criteria:**
  - [ ] All report types work
  - [ ] Filters apply correctly
  - [ ] Charts render accurately
  - [ ] Export to CSV/PDF works
  - [ ] Large datasets handled efficiently

---

#### **Track C: System Administration** (Parallel)

**8.3 System Settings Page** (~1,000 lines)
- **Description:** Configure system-wide settings
- **Components:**
  - `/src/pages/admin/settings/SettingsPage.tsx`
  - `/src/features/settings/ui/SettingsForm.tsx`
  - `/src/features/settings/ui/SettingsCategory.tsx`
- **Features:**
  - General settings (site name, logo, timezone)
  - Email settings (SMTP config, templates)
  - Authentication settings (password policy, session timeout)
  - Enrollment settings (auto-enrollment, prerequisites)
  - Content settings (SCORM version, upload limits)
  - Notification settings
- **API Integration:**
  - `useSettings()` - Get all settings
  - `useUpdateSetting()` - Update setting
- **Route:** `/admin/settings`
- **Acceptance Criteria:**
  - [ ] Settings load correctly
  - [ ] Updates save successfully
  - [ ] Validation works
  - [ ] Changes apply system-wide

**8.4 Audit Log Viewer** (~800 lines)
- **Description:** View system audit logs
- **Components:**
  - `/src/pages/admin/audit-logs/AuditLogsPage.tsx`
  - `/src/features/audit-logs/ui/AuditLogTable.tsx`
  - `/src/features/audit-logs/ui/AuditLogFilters.tsx`
- **Features:**
  - List all audit events
  - Filter by user, action, date, entity
  - Search logs
  - View event details
  - Export logs
- **API Integration:**
  - `useAuditLogs()` - Get audit logs
- **Route:** `/admin/audit-logs`
- **Acceptance Criteria:**
  - [ ] Logs display correctly
  - [ ] Filters work
  - [ ] Search returns relevant results
  - [ ] Performance optimized (pagination)

**8.5 Certificate System** (~1,200 lines)
- **Description:** Generate and manage certificates
- **Components:**
  - `/src/features/certificates/ui/CertificateGenerator.tsx`
  - `/src/features/certificates/ui/CertificateViewer.tsx`
  - `/src/features/certificates/ui/CertificateTemplate.tsx`
  - `/src/pages/learner/certificates/CertificatesPage.tsx`
- **Features:**
  - Generate certificate on course completion
  - Certificate templates (customizable)
  - PDF generation
  - Certificate verification (QR code or unique ID)
  - View earned certificates
  - Download certificate
  - Share certificate (LinkedIn, etc.)
- **API Integration:**
  - `useCertificates()` - Get user certificates
  - `useGenerateCertificate()` - Generate certificate
  - `useVerifyCertificate()` - Verify certificate authenticity
- **Route:** `/learner/certificates`
- **Acceptance Criteria:**
  - [ ] Certificate generates on completion
  - [ ] PDF renders correctly
  - [ ] Can download certificate
  - [ ] Verification works
  - [ ] Template customization works

---

## Implementation Guidelines

### Code Quality Standards

**All phases must follow:**

1. **TypeScript Strict Mode:** No `any` types, proper type definitions
2. **FSD Architecture:** Follow Feature-Sliced Design pattern
3. **Component Standards:**
   - Functional components with hooks
   - Props interfaces defined
   - Error boundaries implemented
4. **Testing:**
   - Unit tests for hooks (Vitest)
   - Component tests (React Testing Library)
   - Integration tests for critical flows
   - MSW for API mocking
5. **Performance:**
   - React Query for caching
   - Debounced input handlers
   - Lazy loading for routes
   - Optimistic updates where appropriate
6. **Accessibility:**
   - Semantic HTML
   - ARIA labels
   - Keyboard navigation
   - Screen reader support
7. **Responsive Design:**
   - Mobile-first approach
   - Breakpoints: mobile (< 640px), tablet (640-1024px), desktop (> 1024px)
8. **Error Handling:**
   - User-friendly error messages
   - Toast notifications
   - Retry mechanisms
   - Fallback UI states

---

### Dependencies & Tech Stack

**Core:**
- React 18
- TypeScript 5.x (strict mode)
- Vite
- React Router v6

**State Management:**
- Zustand (auth, navigation)
- React Query v5 (server state)

**Forms:**
- react-hook-form
- Zod validation

**UI:**
- shadcn/ui components
- Radix UI primitives
- Tailwind CSS
- Lucide React icons

**Content Players:**
- `video.js` or `react-player` - Video player
- `pdf.js` or `react-pdf` - PDF viewer
- SCORM API wrapper (e.g., `pipwerks/scorm-api-wrapper` or custom)

**Charts & Visualization:**
- `recharts` or `chart.js` - Analytics charts

**File Handling:**
- `react-dropzone` - File uploads (already used)

---

### Parallel Development Strategy

**To maximize efficiency, implement phases in parallel using multiple developers or agents:**

**Phase 4 - 3 Parallel Tracks:**
- **Track A:** Course Catalog & Enrollment (Dev 1)
- **Track B:** Course Player & Content Viewing (Dev 2) - Most complex
- **Track C:** Quiz Taking Interface (Dev 3)

**Phase 5 - 4 Parallel Tracks:**
- **Entity 1:** Enrollments (Dev 1)
- **Entity 2:** Progress (Dev 2)
- **Entity 3:** Content Attempts (Dev 3)
- **Entity 4:** Learning Events (Dev 4)

**Phase 6 - 4 Parallel Tracks:**
- **Track A:** Class Management (Dev 1)
- **Track B:** Grading Interface (Dev 2)
- **Track C:** Student Monitoring (Dev 3)
- **Track D:** Analytics Dashboard (Dev 4)

**Phase 7 - 4 Parallel Tracks:**
- **Admin Page 1:** Departments (Dev 1)
- **Admin Page 2:** Staff (Dev 2)
- **Admin Page 3:** Learners (Dev 3)
- **Admin Page 4:** Academic Years (Dev 4)

**Phase 8 - 3 Parallel Tracks:**
- **Track A:** Exam Attempts (Dev 1)
- **Track B:** Reporting System (Dev 2)
- **Track C:** System Admin (Settings, Audit Logs, Certificates) (Dev 3)

---

### Estimated Timeline

**With parallel development (3-4 developers/agents):**

| Phase | Duration | Calendar Weeks |
|-------|----------|----------------|
| Phase 4: Learner Experience | 4-5 weeks | Weeks 1-5 |
| Phase 5: Backend Entities | 2-3 weeks | Weeks 2-4 (overlaps with Phase 4) |
| Phase 6: Staff Teaching | 3-4 weeks | Weeks 6-9 |
| Phase 7: Phase 1 Admin | 2 weeks | Weeks 10-11 |
| Phase 8: Advanced Features | 3-4 weeks | Weeks 12-15 |

**Total Timeline:** ~15 weeks (3.5 months) with parallel development

**Sequential Development:** ~25-30 weeks (6-7 months)

---

## Risk Assessment

### High Risk Items

**1. SCORM Player Integration** (Phase 4.4)
- **Risk:** SCORM packages vary in implementation quality
- **Mitigation:** Test with multiple SCORM packages (1.2 and 2004), implement robust error handling, provide fallback for incompatible packages

**2. Video Progress Tracking** (Phase 4.4)
- **Risk:** Users may manipulate playback to fake progress
- **Mitigation:** Track watch percentage, prevent seeking beyond viewed sections, server-side validation

**3. Performance with Large Datasets** (Phases 6, 8)
- **Risk:** Analytics and reports slow with 1000+ students
- **Mitigation:** Implement pagination, lazy loading, server-side aggregation, caching

**4. Backend Dependency** (Phase 5)
- **Risk:** Phase 4 features blocked if backend entities incomplete
- **Mitigation:** Mock backend responses, coordinate with backend team, implement Phase 5 entities first

### Medium Risk Items

**1. Cross-browser Compatibility** (Phase 4.4)
- **Risk:** SCORM/video players may not work in all browsers
- **Mitigation:** Test in Chrome, Firefox, Safari, Edge. Provide browser compatibility warnings.

**2. Mobile Experience** (Phase 4)
- **Risk:** Course player may not work well on mobile
- **Mitigation:** Responsive design, touch gestures, test on actual devices

**3. File Upload Size Limits** (Content Uploader)
- **Risk:** Large SCORM packages may fail to upload
- **Mitigation:** Chunked uploads, progress indicators, retry logic

---

## Success Metrics

### Phase 4 Success Criteria
- [ ] Learners can enroll in courses
- [ ] SCORM packages play correctly
- [ ] Videos track progress accurately
- [ ] Quizzes can be taken and graded
- [ ] Progress saves and resumes correctly
- [ ] 90%+ completion rate for test scenarios
- [ ] < 2s load time for course player
- [ ] Mobile responsive (works on phones/tablets)

### Phase 6 Success Criteria
- [ ] Staff can enroll students in classes
- [ ] Grading workflow completes in < 5 minutes
- [ ] Student progress accurately reflects completion
- [ ] Analytics load in < 3s
- [ ] Intervention tools work correctly

### Overall Success Criteria
- [ ] All features build without TypeScript errors
- [ ] 90%+ test coverage for critical paths
- [ ] Lighthouse score > 90 (Performance, Accessibility)
- [ ] Zero critical security vulnerabilities
- [ ] Complete user flows work end-to-end

---

## Next Steps

1. **Review this plan** with the team
2. **Prioritize phases** based on business needs
3. **Assign developers/agents** to parallel tracks
4. **Set up task tracking** (Jira, Linear, GitHub Projects)
5. **Coordinate with backend team** on Phase 5 entities
6. **Begin Phase 4 implementation** (highest priority)
7. **Schedule regular sync meetings** (daily standups recommended)

---

## Appendix

### File Structure Template

```
src/
├── entities/
│   ├── enrollment/
│   │   ├── model/
│   │   │   └── types.ts
│   │   ├── api/
│   │   │   └── enrollmentApi.ts
│   │   ├── hooks/
│   │   │   └── useEnrollments.ts
│   │   ├── ui/
│   │   │   └── EnrollmentCard.tsx
│   │   └── index.ts
│   ├── progress/
│   ├── content-attempt/
│   └── learning-event/
├── features/
│   ├── player/
│   │   ├── ui/
│   │   │   ├── ScormPlayer.tsx
│   │   │   ├── VideoPlayer.tsx
│   │   │   ├── DocumentViewer.tsx
│   │   │   ├── PlayerSidebar.tsx
│   │   │   └── PlayerControls.tsx
│   │   └── lib/
│   │       └── scormApi.ts
│   ├── grading/
│   ├── analytics/
│   └── certificates/
├── pages/
│   ├── learner/
│   │   ├── catalog/
│   │   │   ├── CourseCatalogPage.tsx
│   │   │   └── CourseDetailsPage.tsx
│   │   ├── courses/
│   │   │   └── MyCoursesPage.tsx
│   │   ├── player/
│   │   │   └── CoursePlayerPage.tsx
│   │   ├── exercises/
│   │   │   └── ExerciseTakingPage.tsx
│   │   ├── progress/
│   │   │   └── CourseProgressPage.tsx
│   │   └── certificates/
│   │       └── CertificatesPage.tsx
│   ├── staff/
│   │   ├── classes/
│   │   ├── grading/
│   │   └── students/
│   └── admin/
│       ├── departments/
│       ├── staff/
│       ├── learners/
│       ├── academic-years/
│       ├── reports/
│       ├── settings/
│       └── audit-logs/
└── shared/
    └── lib/
        ├── scorm/
        └── video/
```

---

## Document Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-09 | Claude Sonnet 4.5 | Initial implementation plan |

---

**END OF DOCUMENT**
