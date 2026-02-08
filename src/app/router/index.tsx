/**
 * App router with authentication guards
 * Version: 2.0.0 - Phase 4 Implementation
 * Date: 2026-01-10
 *
 * Updated to use V2 role system with UserTypes and permissions
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@/pages/home';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard';
// import { CoursesPage } from '@/pages/courses';
// import { CourseViewerPage } from '@/pages/course-viewer';
import { NotFoundPage } from '@/pages/not-found';
import {
  ProtectedRoute,
  StaffOnlyRoute,
  LearnerOnlyRoute,
  AdminOnlyRoute,
} from './ProtectedRoute';

// Staff pages
import { StaffDashboardPage } from '@/pages/staff/dashboard';
import { CourseAnalyticsPage, CourseSummaryPage } from '@/pages/staff/analytics';
import { StaffCalendarPage } from '@/pages/staff/calendar';
import { StudentProgressPage } from '@/pages/staff/students';
import { StudentDetailPage } from '@/pages/staff/students/StudentDetailPage';
import { StaffCoursesPage } from '@/pages/staff/courses/StaffCoursesPage';
import { CourseEditorPage } from '@/pages/staff/courses/CourseEditorPage';
import { ModuleEditorPage } from '@/pages/staff/courses/ModuleEditorPage';
import { CreateLearningActivityPage } from '@/pages/staff/courses/CreateLearningActivityPage';
import { ContentUploaderPage } from '@/pages/staff/courses/ContentUploaderPage';
import { ExerciseBuilderPage } from '@/pages/staff/courses/ExerciseBuilderPage';
import { ActivityEditorPage } from '@/features/learning-activity-editor';
import { CoursePreviewPage } from '@/pages/staff/courses/CoursePreviewPage';
import { FlashcardDeckPage } from '@/pages/staff/courses/FlashcardDeckPage';
import { MatchingGamePage } from '@/pages/staff/courses/MatchingGamePage';
import { ClassManagementPage as StaffClassManagementPage } from '@/pages/staff/classes/ClassManagementPage';
import { ClassDetailsPage as StaffClassDetailsPage } from '@/pages/staff/classes/ClassDetailsPage';
import { GradingPage, GradingDetailPage } from '@/pages/staff/grading';
import { StaffReportsPage } from '@/pages/staff/reports';
import { StaffSettingsPage } from '@/pages/staff/settings';
import { StaffQuestionBankPage } from '@/pages/staff/QuestionBankPage';
import { FlashcardBuilderPage } from '@/pages/staff/FlashcardBuilderPage';
import { MatchGameBuilderPage } from '@/pages/staff/MatchGameBuilderPage';
import { QuizBuilderPage } from '@/pages/staff/QuizBuilderPage';

// Department-scoped staff pages
import { DepartmentCoursesPage, DepartmentCreateCoursePage, DepartmentClassesPage, DepartmentStudentsPage, DepartmentEnrollmentPage, DepartmentReportsPage, DepartmentSettingsPage, DepartmentProgramsPage } from '@/pages/staff/departments';

// Department-scoped learner pages (Navigation Redesign Phase 5)
import { LearnerDepartmentCoursesPage, LearnerDepartmentEnrollmentsPage, LearnerDepartmentProgressPage } from '@/pages/learner/departments';

// Admin pages
import { AdminDashboardPage } from '@/pages/admin/dashboard/AdminDashboardPage';
import { AdminAnalyticsPage } from '@/pages/admin/analytics';
import { AdminCalendarPage } from '@/pages/admin/calendar';
import { UserManagementPage } from '@/pages/admin/users/UserManagementPage';
import { ProgramManagementPage } from '@/pages/admin/programs';
import { CourseManagementPage } from '@/pages/admin/courses';
import { ClassManagementPage } from '@/pages/admin/classes';
import { ContentManagementPage } from '@/pages/admin/content';
import { TemplateManagementPage } from '@/pages/admin/templates';
import { ExerciseManagementPage } from '@/pages/admin/exercises';
import { QuestionBankPage } from '@/pages/admin/questions';
import { StaffManagementPage } from '@/pages/admin/staff/StaffManagementPage';
import { LearnerManagementPage } from '@/pages/admin/learners/LearnerManagementPage';
import { DepartmentManagementPage } from '@/pages/admin/departments/DepartmentManagementPage';
import { DepartmentDetailsPage } from '@/pages/admin/departments/DepartmentDetailsPage';
import { AcademicYearManagementPage } from '@/pages/admin/academic-years/AcademicYearManagementPage';
import { CertificateTemplateManagementPage } from '@/pages/admin/certificates/CertificateTemplateManagementPage';
import { CertificateTemplateEditorPage } from '@/pages/admin/certificates/CertificateTemplateEditorPage';
import { ReportBuilderPage } from '@/pages/admin/reports/ReportBuilderPage';
import {
  ReportJobsPage,
  ReportJobDetailPage,
  ReportTemplatesPageNew,
  ReportTemplateDetailPage,
  ReportSchedulesPage,
  ReportScheduleDetailPage,
  CustomReportBuilderPage,
  ReportTemplatesPage,
  ReportViewerPage,
} from '@/pages/admin/reports';
import {
  SettingsDashboardPage,
  GeneralSettingsPage,
  EmailSettingsPage,
  NotificationSettingsPage,
  SecuritySettingsPage,
  AppearanceSettingsPage,
} from '@/pages/admin/settings';
import { AuditLogsPage, AuditLogDetailPage } from '@/pages/admin/audit-logs';
import { EnrollmentManagementPage } from '@/pages/admin/enrollments';

// Profile page
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { ProfileExtendedDemo } from '@/pages/profile/ProfileExtendedDemo';

// Settings pages
import { ChangePasswordPage } from '@/pages/settings';

// Select department page (V2)
import { SelectDepartmentPage } from '@/pages/select-department';

// Learner pages
import { LearnerDashboardPage } from '@/pages/learner/dashboard';
import { LearnerCalendarPage } from '@/pages/learner/calendar';
import { ExerciseTakingPage } from '@/pages/learner/exercises/ExerciseTakingPage';
import { ExerciseResultsPage } from '@/pages/learner/exercises/ExerciseResultsPage';
import { ProgressDashboardPage, CourseProgressPage } from '@/pages/learner/progress';
import { CourseCatalogPage } from '@/pages/learner/catalog/CourseCatalogPage';
import { CourseDetailsPage } from '@/pages/learner/catalog/CourseDetailsPage';
import { CoursePlayerPage } from '@/pages/learner/player/CoursePlayerPage';
import { MyCoursesPage } from '@/pages/learner/courses/MyCoursesPage';
import { MyLearningPage } from '@/pages/learner/learning';
import { MyClassesPage } from '@/pages/learner/classes';
import { CertificatesPage, CertificateViewPage } from '@/pages/learner/certificates';
import { MyProgramsPage, ProgramDetailPage } from '@/pages/learner/programs';
import { LearnerTestPage } from '@/pages/learner/test-page';
import { LearnerSettingsPage } from '@/pages/learner/settings';
import { InboxPage } from '@/pages/learner/inbox/InboxPage';
import { CourseForumPage, ThreadDetailPage } from '@/pages/learner/forums';

// Auth error page (replaces direct login redirects for better debugging)
import { AuthErrorPage } from '@/pages/auth-error';

// Public pages
import { CertificateVerificationPage } from '@/pages/public/CertificateVerificationPage';

// Unauthorized page component
const UnauthorizedPage = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Unauthorized</h1>
      <p className="text-muted-foreground mb-4">
        You don't have permission to access this page.
      </p>
      <a href="/dashboard" className="text-primary hover:underline">
        Go to Dashboard
      </a>
    </div>
  </div>
);

export function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/auth-error" element={<AuthErrorPage />} />
      <Route path="/select-department" element={<SelectDepartmentPage />} />
      <Route path="/verify/:certificateId" element={<CertificateVerificationPage />} />
      <Route path="/verify" element={<CertificateVerificationPage />} />
      <Route path="/404" element={<NotFoundPage />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      {/* Archived old course page */}
      {/* <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <CoursesPage />
          </ProtectedRoute>
        }
      /> */}
      {/* <Route
        path="/courses/:courseId"
        element={
          <ProtectedRoute>
            <CourseViewerPage />
          </ProtectedRoute>
        }
      /> */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/change-password"
        element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />

      {/* Learner-only routes (V2) */}
      <Route
        path="/learner/dashboard"
        element={
          <LearnerOnlyRoute>
            <LearnerDashboardPage />
          </LearnerOnlyRoute>
        }
      />
      <Route
        path="/learner/profile"
        element={
          <LearnerOnlyRoute>
            <ProfilePage />
          </LearnerOnlyRoute>
        }
      />
      <Route
        path="/learner/settings"
        element={
          <LearnerOnlyRoute>
            <LearnerSettingsPage />
          </LearnerOnlyRoute>
        }
      />
      <Route
        path="/learner/profile/details"
        element={
          <LearnerOnlyRoute>
            <ProfileExtendedDemo />
          </LearnerOnlyRoute>
        }
      />
      <Route
        path="/learner/profile/demographics"
        element={
          <LearnerOnlyRoute>
            <ProfileExtendedDemo />
          </LearnerOnlyRoute>
        }
      />
      {/* My Learning Route */}
      <Route
        path="/learner/learning"
        element={
          <LearnerOnlyRoute>
            <MyLearningPage />
          </LearnerOnlyRoute>
        }
      />
      {/* Course Catalog Routes */}
      <Route
        path="/learner/catalog"
        element={
          <LearnerOnlyRoute>
            <CourseCatalogPage />
          </LearnerOnlyRoute>
        }
      />
      <Route
        path="/learner/catalog/:courseId"
        element={
          <LearnerOnlyRoute>
            <CourseDetailsPage />
          </LearnerOnlyRoute>
        }
      />
      {/* Calendar Route (ISS-014) */}
      <Route
        path="/learner/calendar"
        element={
          <LearnerOnlyRoute>
            <LearnerCalendarPage />
          </LearnerOnlyRoute>
        }
      />
      {/* My Classes Route */}
      <Route
        path="/learner/classes"
        element={
          <LearnerOnlyRoute>
            <MyClassesPage />
          </LearnerOnlyRoute>
        }
      />
      {/* Inbox Route */}
      <Route
        path="/learner/inbox"
        element={
          <LearnerOnlyRoute>
            <InboxPage />
          </LearnerOnlyRoute>
        }
      />
      {/* My Courses Route */}
      <Route
        path="/learner/courses"
        element={
          <LearnerOnlyRoute>
            <MyCoursesPage />
          </LearnerOnlyRoute>
        }
      />
      {/* My Programs Routes */}
      <Route
        path="/learner/programs"
        element={
          <LearnerOnlyRoute>
            <MyProgramsPage />
          </LearnerOnlyRoute>
        }
      />
      <Route
        path="/learner/programs/:programId"
        element={
          <LearnerOnlyRoute>
            <ProgramDetailPage />
          </LearnerOnlyRoute>
        }
      />
      {/* Course Player Routes */}
      <Route
        path="/learner/courses/:courseId/player"
        element={
          <LearnerOnlyRoute>
            <CoursePlayerPage />
          </LearnerOnlyRoute>
        }
      />
      <Route
        path="/learner/courses/:courseId/player/:contentId"
        element={
          <LearnerOnlyRoute>
            <CoursePlayerPage />
          </LearnerOnlyRoute>
        }
      />
      <Route
        path="/learner/courses/:courseId/player/:moduleId/:lessonId"
        element={
          <LearnerOnlyRoute>
            <CoursePlayerPage />
          </LearnerOnlyRoute>
        }
      />
      <Route
        path="/learner/exercises/:exerciseId/take"
        element={
          <LearnerOnlyRoute>
            <ExerciseTakingPage />
          </LearnerOnlyRoute>
        }
      />
      <Route
        path="/learner/exercises/:exerciseId/results/:attemptId"
        element={
          <LearnerOnlyRoute>
            <ExerciseResultsPage />
          </LearnerOnlyRoute>
        }
      />
      {/* Progress Routes */}
      <Route
        path="/learner/progress"
        element={
          <LearnerOnlyRoute>
            <ProgressDashboardPage />
          </LearnerOnlyRoute>
        }
      />
      <Route
        path="/learner/courses/:courseId/progress"
        element={
          <LearnerOnlyRoute>
            <CourseProgressPage />
          </LearnerOnlyRoute>
        }
      />
      {/* Certificates Routes */}
      <Route
        path="/learner/certificates"
        element={
          <LearnerOnlyRoute>
            <CertificatesPage />
          </LearnerOnlyRoute>
        }
      />
      <Route
        path="/learner/certificates/:certificateId"
        element={
          <LearnerOnlyRoute>
            <CertificateViewPage />
          </LearnerOnlyRoute>
        }
      />
      <Route
        path="/learner/test-page"
        element={
          <LearnerOnlyRoute>
            <LearnerTestPage />
          </LearnerOnlyRoute>
        }
      />

      {/* Forum Routes */}
      <Route
        path="/learner/courses/:courseId/forum"
        element={
          <LearnerOnlyRoute>
            <CourseForumPage />
          </LearnerOnlyRoute>
        }
      />
      <Route
        path="/learner/courses/:courseId/forum/:threadId"
        element={
          <LearnerOnlyRoute>
            <ThreadDetailPage />
          </LearnerOnlyRoute>
        }
      />

      {/* Learner department-scoped routes (Navigation Redesign Phase 5) */}
      <Route
        path="/learner/departments/:deptId/courses"
        element={
          <LearnerOnlyRoute>
            <LearnerDepartmentCoursesPage />
          </LearnerOnlyRoute>
        }
      />
      <Route
        path="/learner/departments/:deptId/enrollments"
        element={
          <LearnerOnlyRoute>
            <LearnerDepartmentEnrollmentsPage />
          </LearnerOnlyRoute>
        }
      />
      <Route
        path="/learner/departments/:deptId/progress"
        element={
          <LearnerOnlyRoute>
            <LearnerDepartmentProgressPage />
          </LearnerOnlyRoute>
        }
      />

      {/* Staff-only routes */}
      <Route
        path="/staff/dashboard"
        element={
          <StaffOnlyRoute>
            <StaffDashboardPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/profile"
        element={
          <StaffOnlyRoute>
            <ProfilePage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/settings"
        element={
          <StaffOnlyRoute>
            <StaffSettingsPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/profile/details"
        element={
          <StaffOnlyRoute>
            <ProfileExtendedDemo />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/profile/demographics"
        element={
          <StaffOnlyRoute>
            <ProfileExtendedDemo />
          </StaffOnlyRoute>
        }
      />
      {/* Course Summary - Aggregated analytics across departments */}
      <Route
        path="/staff/analytics/courses"
        element={
          <StaffOnlyRoute>
            <CourseSummaryPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/analytics"
        element={
          <StaffOnlyRoute>
            <CourseAnalyticsPage />
          </StaffOnlyRoute>
        }
      />
      {/* Calendar Route (ISS-014) */}
      <Route
        path="/staff/calendar"
        element={
          <StaffOnlyRoute>
            <StaffCalendarPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/students"
        element={
          <StaffOnlyRoute>
            <StudentProgressPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/students/:studentId"
        element={
          <StaffOnlyRoute>
            <StudentDetailPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/courses/:courseId/modules/:moduleId/edit"
        element={
          <StaffOnlyRoute>
            <ModuleEditorPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/courses/:courseId/modules/:moduleId/learning-activities/new"
        element={
          <StaffOnlyRoute>
            <CreateLearningActivityPage />
          </StaffOnlyRoute>
        }
      />
      {/* Module-level Flashcard Deck Editor */}
      <Route
        path="/staff/courses/:courseId/modules/:moduleId/flashcards"
        element={
          <StaffOnlyRoute>
            <FlashcardDeckPage />
          </StaffOnlyRoute>
        }
      />
      {/* Module-level Matching Game Editor */}
      <Route
        path="/staff/courses/:courseId/modules/:moduleId/matching"
        element={
          <StaffOnlyRoute>
            <MatchingGamePage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/courses/:courseId/modules/:moduleId/learning-activities/:activityId/edit"
        element={
          <StaffOnlyRoute>
            <ActivityEditorPage />
          </StaffOnlyRoute>
        }
      />
      {/* Activity Editor Page - for complex types (exercise, assessment, assignment) */}
      <Route
        path="/staff/courses/:courseId/modules/:moduleId/activities/new/:type"
        element={
          <StaffOnlyRoute>
            <ActivityEditorPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/courses/:courseId/modules/:moduleId/activities/:activityId/edit"
        element={
          <StaffOnlyRoute>
            <ActivityEditorPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/courses"
        element={
          <StaffOnlyRoute>
            <StaffCoursesPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/courses/new"
        element={
          <StaffOnlyRoute>
            <CourseEditorPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/courses/:courseId/edit"
        element={
          <StaffOnlyRoute>
            <CourseEditorPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/courses/content/upload"
        element={
          <StaffOnlyRoute>
            <ContentUploaderPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/courses/exercises/new"
        element={
          <StaffOnlyRoute>
            <ExerciseBuilderPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/courses/exercises/:exerciseId"
        element={
          <StaffOnlyRoute>
            <ExerciseBuilderPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/courses/:courseId/preview"
        element={
          <StaffOnlyRoute>
            <CoursePreviewPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/courses/:courseId/preview/:moduleId"
        element={
          <StaffOnlyRoute>
            <CoursePreviewPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/classes"
        element={
          <StaffOnlyRoute>
            <StaffClassManagementPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/classes/:classId"
        element={
          <StaffOnlyRoute>
            <StaffClassDetailsPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/grading"
        element={
          <StaffOnlyRoute>
            <GradingPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/grading/:attemptId"
        element={
          <StaffOnlyRoute>
            <GradingDetailPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/reports"
        element={
          <StaffOnlyRoute>
            <StaffReportsPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/questions"
        element={
          <StaffOnlyRoute>
            <StaffQuestionBankPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/flashcards"
        element={
          <StaffOnlyRoute>
            <FlashcardBuilderPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/flashcards/:flashcardId"
        element={
          <StaffOnlyRoute>
            <FlashcardBuilderPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/quizzes"
        element={
          <StaffOnlyRoute>
            <QuizBuilderPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/quizzes/:quizId"
        element={
          <StaffOnlyRoute>
            <QuizBuilderPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/match-games"
        element={
          <StaffOnlyRoute>
            <MatchGameBuilderPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/match-games/:matchGameId"
        element={
          <StaffOnlyRoute>
            <MatchGameBuilderPage />
          </StaffOnlyRoute>
        }
      />

      {/* Department-scoped staff routes */}
      <Route
        path="/staff/departments/:deptId/courses/create"
        element={
          <StaffOnlyRoute>
            <DepartmentCreateCoursePage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/departments/:deptId/courses"
        element={
          <StaffOnlyRoute>
            <DepartmentCoursesPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/departments/:deptId/classes"
        element={
          <StaffOnlyRoute>
            <DepartmentClassesPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/departments/:deptId/students"
        element={
          <StaffOnlyRoute>
            <DepartmentStudentsPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/departments/:deptId/enrollments"
        element={
          <StaffOnlyRoute>
            <DepartmentEnrollmentPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/departments/:deptId/reports"
        element={
          <StaffOnlyRoute>
            <DepartmentReportsPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/departments/:deptId/settings"
        element={
          <StaffOnlyRoute>
            <DepartmentSettingsPage />
          </StaffOnlyRoute>
        }
      />
      <Route
        path="/staff/departments/:deptId/manage"
        element={
          <StaffOnlyRoute>
            <DepartmentProgramsPage />
          </StaffOnlyRoute>
        }
      />

      {/* Admin-only routes */}
      <Route
        path="/admin"
        element={
          <AdminOnlyRoute>
            <AdminDashboardPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <AdminOnlyRoute>
            <AdminDashboardPage />
          </AdminOnlyRoute>
        }
      />
      {/* Analytics Route (ISS-014) */}
      <Route
        path="/admin/analytics"
        element={
          <AdminOnlyRoute>
            <AdminAnalyticsPage />
          </AdminOnlyRoute>
        }
      />
      {/* Calendar Route (ISS-014) */}
      <Route
        path="/admin/calendar"
        element={
          <AdminOnlyRoute>
            <AdminCalendarPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminOnlyRoute>
            <UserManagementPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/programs"
        element={
          <AdminOnlyRoute>
            <ProgramManagementPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <AdminOnlyRoute>
            <CourseManagementPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/classes"
        element={
          <AdminOnlyRoute>
            <ClassManagementPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/content"
        element={
          <AdminOnlyRoute>
            <ContentManagementPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/templates"
        element={
          <AdminOnlyRoute>
            <TemplateManagementPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/exercises"
        element={
          <AdminOnlyRoute>
            <ExerciseManagementPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/questions"
        element={
          <AdminOnlyRoute>
            <QuestionBankPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/departments"
        element={
          <AdminOnlyRoute>
            <DepartmentManagementPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/departments/:departmentId"
        element={
          <AdminOnlyRoute>
            <DepartmentDetailsPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/staff"
        element={
          <AdminOnlyRoute>
            <StaffManagementPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/learners"
        element={
          <AdminOnlyRoute>
            <LearnerManagementPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/enrollments"
        element={
          <AdminOnlyRoute>
            <EnrollmentManagementPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/academic-years"
        element={
          <AdminOnlyRoute>
            <AcademicYearManagementPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/certificates"
        element={
          <AdminOnlyRoute>
            <CertificateTemplateManagementPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/certificates/new"
        element={
          <AdminOnlyRoute>
            <CertificateTemplateEditorPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/certificates/:templateId"
        element={
          <AdminOnlyRoute>
            <CertificateTemplateEditorPage />
          </AdminOnlyRoute>
        }
      />
      {/* New Report System 2.0 Routes */}
      <Route
        path="/admin/reports"
        element={
          <AdminOnlyRoute>
            <ReportJobsPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/reports/jobs/:id"
        element={
          <AdminOnlyRoute>
            <ReportJobDetailPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/reports/templates"
        element={
          <AdminOnlyRoute>
            <ReportTemplatesPageNew />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/reports/templates/:id"
        element={
          <AdminOnlyRoute>
            <ReportTemplateDetailPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/reports/schedules"
        element={
          <AdminOnlyRoute>
            <ReportSchedulesPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/reports/schedules/:id"
        element={
          <AdminOnlyRoute>
            <ReportScheduleDetailPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/reports/builder"
        element={
          <AdminOnlyRoute>
            <CustomReportBuilderPage />
          </AdminOnlyRoute>
        }
      />
      {/* Old report routes - to be replaced in Phase 2 */}
      <Route
        path="/admin/reports/old"
        element={
          <AdminOnlyRoute>
            <ReportBuilderPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/reports/old/templates"
        element={
          <AdminOnlyRoute>
            <ReportTemplatesPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/reports/old/:reportId"
        element={
          <AdminOnlyRoute>
            <ReportViewerPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <AdminOnlyRoute>
            <AuditLogsPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/audit-logs/:logId"
        element={
          <AdminOnlyRoute>
            <AuditLogDetailPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminOnlyRoute>
            <SettingsDashboardPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/settings/general"
        element={
          <AdminOnlyRoute>
            <GeneralSettingsPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/settings/email"
        element={
          <AdminOnlyRoute>
            <EmailSettingsPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/settings/notifications"
        element={
          <AdminOnlyRoute>
            <NotificationSettingsPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/settings/security"
        element={
          <AdminOnlyRoute>
            <SecuritySettingsPage />
          </AdminOnlyRoute>
        }
      />
      <Route
        path="/admin/settings/appearance"
        element={
          <AdminOnlyRoute>
            <AppearanceSettingsPage />
          </AdminOnlyRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
