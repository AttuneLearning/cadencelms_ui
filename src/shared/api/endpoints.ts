/**
 * API endpoint constants
 * Centralized endpoint definitions for all API calls
 *
 * IMPORTANT: All endpoint paths are RELATIVE to the baseURL
 *
 * Pattern:
 * - baseURL is set in .env: VITE_API_BASE_URL=http://localhost:5000/api/v2
 * - All paths here should be RELATIVE (start with / but NO /api/v2 prefix)
 * - Example: '/enrollments' → http://localhost:5000/api/v2/enrollments
 *
 * ❌ WRONG: '/api/v2/enrollments' → http://localhost:5000/api/v2/api/v2/enrollments
 * ✅ CORRECT: '/enrollments' → http://localhost:5000/api/v2/enrollments
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

  courseSegments: {
    list: (courseId: string) => `/courses/${courseId}/modules`,
    byId: (courseId: string, moduleId: string) => `/courses/${courseId}/modules/${moduleId}`,
    create: (courseId: string) => `/courses/${courseId}/modules`,
    update: (courseId: string, moduleId: string) => `/courses/${courseId}/modules/${moduleId}`,
    delete: (courseId: string, moduleId: string) => `/courses/${courseId}/modules/${moduleId}`,
    reorder: (courseId: string) => `/courses/${courseId}/modules/reorder`,
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
    staff: {
      list: '/admin/staff',
      byId: (id: string) => `/admin/staff/${id}`,
      create: '/admin/staff',
      update: (id: string) => `/admin/staff/${id}`,
      delete: (id: string) => `/admin/staff/${id}`,
    },
    learners: {
      list: '/admin/learners',
      byId: (id: string) => `/admin/learners/${id}`,
      create: '/admin/learners',
      update: (id: string) => `/admin/learners/${id}`,
      delete: (id: string) => `/admin/learners/${id}`,
    },
    departments: {
      list: '/admin/departments',
      byId: (id: string) => `/admin/departments/${id}`,
      create: '/admin/departments',
      update: (id: string) => `/admin/departments/${id}`,
      delete: (id: string) => `/admin/departments/${id}`,
      hierarchy: '/admin/departments/hierarchy',
    },
    academicYears: {
      list: '/admin/academic-years',
      byId: (id: string) => `/admin/academic-years/${id}`,
      create: '/admin/academic-years',
      update: (id: string) => `/admin/academic-years/${id}`,
      delete: (id: string) => `/admin/academic-years/${id}`,
      active: '/admin/academic-years/active',
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

  classes: {
    list: '/classes',
    byId: (id: string) => `/classes/${id}`,
    roster: (id: string) => `/classes/${id}/roster`,
    enrollments: (id: string) => `/classes/${id}/enrollments`,
    enrollment: (id: string, enrollmentId: string) => `/classes/${id}/enrollments/${enrollmentId}`,
    progress: (id: string) => `/classes/${id}/progress`,
  },

  learningEvents: {
    list: '/learning-events',
    byId: (id: string) => `/learning-events/${id}`,
    create: '/learning-events',
    createBatch: '/learning-events/batch',
    learnerActivity: (learnerId: string) => `/learning-events/learner/${learnerId}`,
    courseActivity: (courseId: string) => `/learning-events/course/${courseId}`,
    classActivity: (classId: string) => `/learning-events/class/${classId}`,
    stats: '/learning-events/stats',
  },

  examAttempts: {
    list: '/exam-attempts',
    byId: (id: string) => `/exam-attempts/${id}`,
    create: '/exam-attempts',
    submitAnswers: (id: string) => `/exam-attempts/${id}/answers`,
    submit: (id: string) => `/exam-attempts/${id}/submit`,
    results: (id: string) => `/exam-attempts/${id}/results`,
    grade: (id: string) => `/exam-attempts/${id}/grade`,
    byExam: (examId: string) => `/exam-attempts/exam/${examId}`,
  },

  certificates: {
    list: '/certificates',
    byId: (id: string) => `/certificates/${id}`,
    generate: '/certificates/generate',
    pdf: (id: string) => `/certificates/${id}/pdf`,
    verify: (code: string) => `/certificates/verify/${code}`,
  },

  certificateTemplates: {
    list: '/certificate-templates',
    byId: (id: string) => `/certificate-templates/${id}`,
    create: '/certificate-templates',
    update: (id: string) => `/certificate-templates/${id}`,
    delete: (id: string) => `/certificate-templates/${id}`,
  },
} as const;
