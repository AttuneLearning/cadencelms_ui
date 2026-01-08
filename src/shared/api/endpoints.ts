/**
 * API endpoint constants
 * Centralized endpoint definitions for all API calls
 */

export const endpoints = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },

  courses: {
    list: '/courses',
    byId: (id: string) => `/courses/${id}`,
    myCourses: '/courses/my-courses',
    enroll: (id: string) => `/courses/${id}/enroll`,
    unenroll: (id: string) => `/courses/${id}/unenroll`,
    progress: (id: string) => `/courses/${id}/progress`,
  },

  lessons: {
    list: (courseId: string) => `/courses/${courseId}/lessons`,
    byId: (courseId: string, lessonId: string) =>
      `/courses/${courseId}/lessons/${lessonId}`,
    complete: (courseId: string, lessonId: string) =>
      `/courses/${courseId}/lessons/${lessonId}/complete`,
  },

  enrollments: {
    list: '/enrollments',
    byId: (id: string) => `/enrollments/${id}`,
    myCourses: '/enrollments/my-courses',
  },

  users: {
    list: '/users',
    byId: (id: string) => `/users/${id}`,
    profile: '/users/profile',
    updateProfile: '/users/profile',
  },

  content: {
    scormPackages: '/content/scorm',
    uploadScorm: '/content/scorm/upload',
    byId: (id: string) => `/content/${id}`,
  },

  admin: {
    users: {
      list: '/admin/users',
      byId: (id: string) => `/admin/users/${id}`,
      create: '/admin/users',
      update: (id: string) => `/admin/users/${id}`,
      delete: (id: string) => `/admin/users/${id}`,
    },
    courses: {
      list: '/admin/courses',
      byId: (id: string) => `/admin/courses/${id}`,
      create: '/admin/courses',
      update: (id: string) => `/admin/courses/${id}`,
      delete: (id: string) => `/admin/courses/${id}`,
    },
    reports: {
      overview: '/admin/reports/overview',
      courseCompletion: '/admin/reports/course-completion',
      userActivity: '/admin/reports/user-activity',
    },
  },

  analytics: {
    userProgress: '/analytics/user-progress',
    courseStats: (courseId: string) => `/analytics/courses/${courseId}/stats`,
    learningPath: '/analytics/learning-path',
  },

  progress: {
    stats: '/progress/stats',
  },
} as const;
