/**
 * App router with authentication guards
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@/pages/home';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard';
// import { CoursesPage } from '@/pages/courses';
// import { CourseViewerPage } from '@/pages/course-viewer';
import { NotFoundPage } from '@/pages/not-found';
import { ProtectedRoute } from './guards';

// Staff pages
import { StaffDashboardPage } from '@/pages/staff/dashboard';
import { CourseAnalyticsPage } from '@/pages/staff/analytics';
import { StudentProgressPage } from '@/pages/staff/students';
import { StudentDetailPage } from '@/pages/staff/students/StudentDetailPage';
import { StaffCoursesPage } from '@/pages/staff/courses/StaffCoursesPage';
import { CourseEditorPage } from '@/pages/staff/courses/CourseEditorPage';
import { ModuleEditorPage } from '@/pages/staff/courses/ModuleEditorPage';
import { ContentUploaderPage } from '@/pages/staff/courses/ContentUploaderPage';
import { ExerciseBuilderPage } from '@/pages/staff/courses/ExerciseBuilderPage';
import { CoursePreviewPage } from '@/pages/staff/courses/CoursePreviewPage';
import { ClassManagementPage as StaffClassManagementPage } from '@/pages/staff/classes/ClassManagementPage';
import { ClassDetailsPage as StaffClassDetailsPage } from '@/pages/staff/classes/ClassDetailsPage';
import { GradingPage, GradingDetailPage } from '@/pages/staff/grading';

// Admin pages
import { AdminDashboardPage } from '@/pages/admin/dashboard/AdminDashboardPage';
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
import { AcademicYearManagementPage } from '@/pages/admin/academic-years/AcademicYearManagementPage';

// Profile page
import { ProfilePage } from '@/pages/profile/ProfilePage';

// Learner pages
import { LearnerDashboardPage } from '@/pages/learner/dashboard';
import { ExerciseTakingPage } from '@/pages/learner/exercises/ExerciseTakingPage';
import { ExerciseResultsPage } from '@/pages/learner/exercises/ExerciseResultsPage';
import { ProgressDashboardPage, CourseProgressPage } from '@/pages/learner/progress';
import { CourseCatalogPage } from '@/pages/learner/catalog/CourseCatalogPage';
import { CourseDetailsPage } from '@/pages/learner/catalog/CourseDetailsPage';
import { CoursePlayerPage } from '@/pages/learner/player/CoursePlayerPage';
import { MyCoursesPage } from '@/pages/learner/courses/MyCoursesPage';
import { MyLearningPage } from '@/pages/learner/learning';
import { CertificatesPage } from '@/pages/learner/certificates';

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

      {/* Learner-only routes */}
      <Route
        path="/learner/dashboard"
        element={
          <ProtectedRoute roles={['learner']}>
            <LearnerDashboardPage />
          </ProtectedRoute>
        }
      />
      {/* My Learning Route */}
      <Route
        path="/learner/learning"
        element={
          <ProtectedRoute roles={['learner']}>
            <MyLearningPage />
          </ProtectedRoute>
        }
      />
      {/* Course Catalog Routes */}
      <Route
        path="/learner/catalog"
        element={
          <ProtectedRoute roles={['learner']}>
            <CourseCatalogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/learner/catalog/:courseId"
        element={
          <ProtectedRoute roles={['learner']}>
            <CourseDetailsPage />
          </ProtectedRoute>
        }
      />
      {/* My Courses Route */}
      <Route
        path="/learner/courses"
        element={
          <ProtectedRoute roles={['learner']}>
            <MyCoursesPage />
          </ProtectedRoute>
        }
      />
      {/* Course Player Routes */}
      <Route
        path="/learner/courses/:courseId/player"
        element={
          <ProtectedRoute roles={['learner']}>
            <CoursePlayerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/learner/courses/:courseId/player/:contentId"
        element={
          <ProtectedRoute roles={['learner']}>
            <CoursePlayerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/learner/exercises/:exerciseId/take"
        element={
          <ProtectedRoute roles={['learner']}>
            <ExerciseTakingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/learner/exercises/:exerciseId/results/:attemptId"
        element={
          <ProtectedRoute roles={['learner']}>
            <ExerciseResultsPage />
          </ProtectedRoute>
        }
      />
      {/* Progress Routes */}
      <Route
        path="/learner/progress"
        element={
          <ProtectedRoute roles={['learner']}>
            <ProgressDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/learner/courses/:courseId/progress"
        element={
          <ProtectedRoute roles={['learner']}>
            <CourseProgressPage />
          </ProtectedRoute>
        }
      />
      {/* Certificates Route */}
      <Route
        path="/learner/certificates"
        element={
          <ProtectedRoute roles={['learner']}>
            <CertificatesPage />
          </ProtectedRoute>
        }
      />

      {/* Staff-only routes */}
      <Route
        path="/staff/dashboard"
        element={
          <ProtectedRoute roles={['staff', 'global-admin']}>
            <StaffDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/analytics"
        element={
          <ProtectedRoute roles={['staff', 'global-admin']}>
            <CourseAnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/students"
        element={
          <ProtectedRoute roles={['staff', 'global-admin']}>
            <StudentProgressPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/students/:studentId"
        element={
          <ProtectedRoute roles={['staff', 'global-admin']}>
            <StudentDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/courses/:courseId/modules/:moduleId/edit"
        element={
          <ProtectedRoute roles={['staff', 'global-admin']}>
            <ModuleEditorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/courses"
        element={
          <ProtectedRoute roles={['staff', 'global-admin']}>
            <StaffCoursesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/courses/new"
        element={
          <ProtectedRoute roles={['staff', 'global-admin']}>
            <CourseEditorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/courses/:courseId/edit"
        element={
          <ProtectedRoute roles={['staff', 'global-admin']}>
            <CourseEditorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/courses/content/upload"
        element={
          <ProtectedRoute roles={['staff', 'global-admin']}>
            <ContentUploaderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/courses/exercises/new"
        element={
          <ProtectedRoute roles={['staff', 'global-admin']}>
            <ExerciseBuilderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/courses/exercises/:exerciseId"
        element={
          <ProtectedRoute roles={['staff', 'global-admin']}>
            <ExerciseBuilderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/courses/:courseId/preview"
        element={
          <ProtectedRoute roles={['staff', 'global-admin']}>
            <CoursePreviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/courses/:courseId/preview/:moduleId"
        element={
          <ProtectedRoute roles={['staff', 'global-admin']}>
            <CoursePreviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/classes"
        element={
          <ProtectedRoute roles={['staff', 'global-admin']}>
            <StaffClassManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/classes/:classId"
        element={
          <ProtectedRoute roles={['staff', 'global-admin']}>
            <StaffClassDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/grading"
        element={
          <ProtectedRoute roles={['staff', 'global-admin']}>
            <GradingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/grading/:attemptId"
        element={
          <ProtectedRoute roles={['staff', 'global-admin']}>
            <GradingDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Admin-only routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['global-admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute roles={['global-admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={['global-admin']}>
            <UserManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/programs"
        element={
          <ProtectedRoute roles={['global-admin']}>
            <ProgramManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute roles={['global-admin']}>
            <CourseManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/classes"
        element={
          <ProtectedRoute roles={['global-admin']}>
            <ClassManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/content"
        element={
          <ProtectedRoute roles={['global-admin']}>
            <ContentManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/templates"
        element={
          <ProtectedRoute roles={['global-admin']}>
            <TemplateManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/exercises"
        element={
          <ProtectedRoute roles={['global-admin']}>
            <ExerciseManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/questions"
        element={
          <ProtectedRoute roles={['global-admin']}>
            <QuestionBankPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/departments"
        element={
          <ProtectedRoute roles={['global-admin']}>
            <DepartmentManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/staff"
        element={
          <ProtectedRoute roles={['global-admin']}>
            <StaffManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/learners"
        element={
          <ProtectedRoute roles={['global-admin']}>
            <LearnerManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/academic-years"
        element={
          <ProtectedRoute roles={['global-admin']}>
            <AcademicYearManagementPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
