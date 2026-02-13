/**
 * API endpoint constants
 * Centralized endpoint definitions for all API calls
 *
 * IMPORTANT: All endpoint paths are RELATIVE to the baseURL
 *
 * Pattern:
 * - baseURL is set in .env: VITE_API_BASE_URL=http://localhost:5150
 * - API prefix is set in .env: VITE_API_PREFIX=/api/v2
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

  courseModules: {
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
    // Content library
    list: '/content',
    byId: (id: string) => `/content/${id}`,
    // SCORM packages
    scorm: {
      list: '/content/scorm',
      create: '/content/scorm',
      byId: (id: string) => `/content/scorm/${id}`,
      update: (id: string) => `/content/scorm/${id}`,
      delete: (id: string) => `/content/scorm/${id}`,
      launch: (id: string) => `/content/scorm/${id}/launch`,
      publish: (id: string) => `/content/scorm/${id}/publish`,
      unpublish: (id: string) => `/content/scorm/${id}/unpublish`,
    },
    // Media library
    media: {
      list: '/media',
      create: '/media/upload-url',
      uploadUrl: '/media/upload-url',
      confirm: '/media/confirm',
      byId: (id: string) => `/media/${id}`,
      update: (id: string) => `/media/${id}`,
      delete: (id: string) => `/media/${id}`,
    },
    // Legacy aliases (deprecated - use scorm.list / scorm.create)
    scormPackages: '/content/scorm',
    uploadScorm: '/content/scorm',
  },

  admin: {
    // Staff user management endpoints
    staff: {
      list: '/users/staff', // GET with ?page=&limit=&search=&department=&role=&status=&sort=
      byId: (id: string) => `/users/staff/${id}`,
      create: '/users/staff', // POST (requires escalation)
      update: (id: string) => `/users/staff/${id}`, // PUT (requires escalation)
      delete: (id: string) => `/users/staff/${id}`, // DELETE (requires escalation + system-admin)
      updateDepartments: (id: string) => `/users/staff/${id}/departments`, // PATCH
    },
    // Learner management endpoints (TODO: confirm with API team)
    learners: {
      list: '/users/learners',
      byId: (id: string) => `/users/learners/${id}`,
      create: '/users/learners',
      update: (id: string) => `/users/learners/${id}`,
      delete: (id: string) => `/users/learners/${id}`,
    },
    // Legacy users endpoints (deprecated - use staff or learners)
    users: {
      list: '/users/staff', // Redirect to staff
      byId: (id: string) => `/users/staff/${id}`,
      create: '/users/staff',
      update: (id: string) => `/users/staff/${id}`,
      delete: (id: string) => `/users/staff/${id}`,
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
  },

  analytics: {
    userProgress: '/analytics/user-progress',
    courseStats: (courseId: string) => `/analytics/courses/${courseId}/stats`,
    learningPath: '/analytics/learning-path',
    // Course Summary Analytics
    courseSummary: '/analytics/courses/summary',
    courseSummaryExport: '/analytics/courses/summary/export',
  },

  progress: {
    // By entity
    program: (programId: string) => `/progress/program/${programId}`,
    course: (courseId: string) => `/progress/course/${courseId}`,
    class: (classId: string) => `/progress/class/${classId}`,
    learner: (learnerId: string) => `/progress/learner/${learnerId}`,
    learnerProgram: (learnerId: string, programId: string) => `/progress/learner/${learnerId}/program/${programId}`,
    // Actions
    update: '/progress/update',
    // Reports
    reportsSummary: '/progress/reports/summary',
    reportsDetailed: '/progress/reports/detailed',
    // Legacy alias
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

  exercises: {
    attempts: (exerciseId: string) => `/content/exercises/${exerciseId}/attempts`,
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

  assessmentAttempts: {
    start: (assessmentId: string) => `/assessments/${assessmentId}/attempts/start`,
    save: (assessmentId: string, attemptId: string) =>
      `/assessments/${assessmentId}/attempts/${attemptId}/save`,
    submit: (assessmentId: string, attemptId: string) =>
      `/assessments/${assessmentId}/attempts/${attemptId}/submit`,
    grade: (assessmentId: string, attemptId: string) =>
      `/assessments/${assessmentId}/attempts/${attemptId}/grade`,
    list: (assessmentId: string) => `/assessments/${assessmentId}/attempts`,
    my: (assessmentId: string) => `/assessments/${assessmentId}/attempts/my`,
    byId: (assessmentId: string, attemptId: string) =>
      `/assessments/${assessmentId}/attempts/${attemptId}`,
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

  reports: {
    // Core reports
    completion: '/reports/completion',
    performance: '/reports/performance',
    export: '/reports/export',
    // Transcript
    transcript: (learnerId: string) => `/reports/transcript/${learnerId}`,
    generateTranscript: (learnerId: string) => `/reports/transcript/${learnerId}/generate`,
    // Entity-specific reports
    course: (courseId: string) => `/reports/course/${courseId}`,
    program: (programId: string) => `/reports/program/${programId}`,
    department: (departmentId: string) => `/reports/department/${departmentId}`,
    // Legacy/generic (may be deprecated)
    list: '/reports',
    byId: (id: string) => `/reports/${id}`,
    create: '/reports',
    delete: (id: string) => `/reports/${id}`,
    download: (id: string, format: string) => `/reports/${id}/download?format=${format}`,
  },

  reportJobs: {
    list: '/reports/jobs',
    create: '/reports/jobs',
    byId: (id: string) => `/reports/jobs/${id}`,
    status: (id: string) => `/reports/jobs/${id}/status`,
    download: (id: string) => `/reports/jobs/${id}/download`,
    cancel: (id: string) => `/reports/jobs/${id}/cancel`,
    retry: (id: string) => `/reports/jobs/${id}/retry`,
    delete: (id: string) => `/reports/jobs/${id}`,
    bulkDelete: '/reports/jobs/bulk-delete',
  },

  reportSchedules: {
    list: '/reports/schedules',
    create: '/reports/schedules',
    byId: (id: string) => `/reports/schedules/${id}`,
    update: (id: string) => `/reports/schedules/${id}`,
    delete: (id: string) => `/reports/schedules/${id}`,
    activate: (id: string) => `/reports/schedules/${id}/activate`,
    deactivate: (id: string) => `/reports/schedules/${id}/deactivate`,
    trigger: (id: string) => `/reports/schedules/${id}/trigger`,
    history: (id: string) => `/reports/schedules/${id}/history`,
  },

  reportTemplates: {
    list: '/reports/templates',
    create: '/reports/templates',
    byId: (id: string) => `/reports/templates/${id}`,
    update: (id: string) => `/reports/templates/${id}`,
    delete: (id: string) => `/reports/templates/${id}`,
    clone: (id: string) => `/reports/templates/${id}/clone`,
    // Legacy aliases (old paths)
    setDefault: (id: string) => `/reports/templates/${id}/set-default`,
    toggleShared: (id: string) => `/reports/templates/${id}/toggle-shared`,
  },

  settings: {
    get: '/settings',
    updateGeneral: '/settings/general',
    updateEmail: '/settings/email',
    updateNotifications: '/settings/notifications',
    updateSecurity: '/settings/security',
    updateAppearance: '/settings/appearance',
    testEmail: '/settings/email/test',
  },

  exceptions: {
    byEnrollment: (enrollmentId: string) => `/enrollments/${enrollmentId}/exceptions`,
    extraAttempts: (enrollmentId: string) => `/enrollments/${enrollmentId}/exceptions/attempts`,
    extendedAccess: (enrollmentId: string) => `/enrollments/${enrollmentId}/exceptions/access`,
    moduleUnlock: (enrollmentId: string) => `/enrollments/${enrollmentId}/exceptions/module-unlock`,
    gradeOverride: (enrollmentId: string) => `/enrollments/${enrollmentId}/exceptions/grade`,
    excusedContent: (enrollmentId: string) => `/enrollments/${enrollmentId}/exceptions/excuse`,
    byId: (enrollmentId: string, exceptionId: string) =>
      `/enrollments/${enrollmentId}/exceptions/${exceptionId}`,
  },

  auditLogs: {
    list: '/audit-logs',
    byId: (id: string) => `/audit-logs/${id}`,
    export: '/audit-logs/export',
  },

  calendar: {
    learner: '/calendar/learner',
    staff: '/calendar/staff',
    system: '/calendar/system',
    reminders: '/calendar/reminders',
  },
} as const;
