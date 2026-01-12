import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@/pages/home';
import { LoginPage } from '@/pages/login';
import { DashboardPage } from '@/pages/dashboard';
// import { CoursesPage } from '@/pages/courses';
// import { CourseViewerPage } from '@/pages/course-viewer';
import { AdminPage } from '@/pages/admin';
import { NotFoundPage } from '@/pages/not-found';
import { CoursePreviewPage } from '@/pages/staff/courses';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      {/* Archived old course pages */}
      {/* <Route path="/courses" element={<CoursesPage />} /> */}
      {/* <Route path="/courses/:courseId" element={<CourseViewerPage />} /> */}

      {/* Staff Course Preview Routes */}
      <Route path="/staff/courses/:courseId/preview" element={<CoursePreviewPage />} />
      <Route path="/staff/courses/:courseId/preview/:moduleId" element={<CoursePreviewPage />} />

      <Route path="/admin" element={<AdminPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
