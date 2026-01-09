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

// Admin pages
import { AdminDashboardPage } from '@/pages/admin/dashboard/AdminDashboardPage';
import { UserManagementPage } from '@/pages/admin/users/UserManagementPage';
import { ProgramManagementPage } from '@/pages/admin/programs';
import { CourseManagementPage } from '@/pages/admin/courses';
import { ClassManagementPage } from '@/pages/admin/classes';
// TODO: Uncomment when these pages are implemented
// import { StaffManagementPage } from '@/pages/admin/staff/StaffManagementPage';
// import { LearnerManagementPage } from '@/pages/admin/learners/LearnerManagementPage';
// import { DepartmentManagementPage } from '@/pages/admin/departments/DepartmentManagementPage';
// import { AcademicYearManagementPage } from '@/pages/admin/academic-years/AcademicYearManagementPage';

// Profile page
import { ProfilePage } from '@/pages/profile/ProfilePage';

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
      {/* TODO: Uncomment when these pages are implemented */}
      {/* <Route
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
        path="/admin/departments"
        element={
          <ProtectedRoute roles={['global-admin']}>
            <DepartmentManagementPage />
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
      /> */}

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
