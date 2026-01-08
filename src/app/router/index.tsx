/**
 * App router with authentication guards
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@/pages/home';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard';
import { CoursesPage } from '@/pages/courses';
import { CourseViewerPage } from '@/pages/course-viewer';
import { AdminPage } from '@/pages/admin';
import { NotFoundPage } from '@/pages/not-found';
import { ProtectedRoute } from './guards';

// Staff pages
import { StaffDashboardPage } from '@/pages/staff/dashboard';
import { CourseAnalyticsPage } from '@/pages/staff/analytics';
import { StudentProgressPage } from '@/pages/staff/students';

// Admin pages
import { AdminDashboardPage } from '@/pages/admin/dashboard/AdminDashboardPage';
import { UserManagementPage } from '@/pages/admin/users/UserManagementPage';
import { CourseManagementPage } from '@/pages/admin/courses/CourseManagementPage';

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
      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <CoursesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId"
        element={
          <ProtectedRoute>
            <CourseViewerPage />
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
        path="/admin/courses"
        element={
          <ProtectedRoute roles={['global-admin']}>
            <CourseManagementPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
