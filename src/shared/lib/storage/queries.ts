/**
 * IndexedDB query helpers
 * Provides convenient methods for querying LMS data from IndexedDB
 */

import { db, type Course, type Lesson, type Enrollment, type Progress } from './db';

/**
 * Course queries
 */
export const courseQueries = {
  /**
   * Get all courses
   */
  getAll: async (): Promise<Course[]> => {
    return await db.courses.toArray();
  },

  /**
   * Get course by ID
   */
  getById: async (id: string): Promise<Course | undefined> => {
    return await db.courses.get(id);
  },

  /**
   * Get courses by status
   */
  getByStatus: async (status: Course['status']): Promise<Course[]> => {
    return await db.courses.where('status').equals(status).toArray();
  },

  /**
   * Search courses by title
   */
  search: async (query: string): Promise<Course[]> => {
    const lowerQuery = query.toLowerCase();
    return await db.courses
      .filter((course) => course.title.toLowerCase().includes(lowerQuery))
      .toArray();
  },

  /**
   * Upsert course (update or insert)
   */
  upsert: async (course: Course): Promise<string> => {
    await db.courses.put({
      ...course,
      syncedAt: Date.now(),
      isDirty: false,
    });
    return course._id;
  },

  /**
   * Bulk upsert courses
   */
  bulkUpsert: async (courses: Course[]): Promise<void> => {
    const now = Date.now();
    await db.courses.bulkPut(
      courses.map((course) => ({
        ...course,
        syncedAt: now,
        isDirty: false,
      }))
    );
  },

  /**
   * Delete course by ID
   */
  delete: async (id: string): Promise<void> => {
    await db.courses.delete(id);
  },

  /**
   * Mark course as dirty (needs sync)
   */
  markDirty: async (id: string): Promise<void> => {
    await db.courses.update(id, { isDirty: true });
  },
};

/**
 * Lesson queries
 */
export const lessonQueries = {
  /**
   * Get all lessons
   */
  getAll: async (): Promise<Lesson[]> => {
    return await db.lessons.toArray();
  },

  /**
   * Get lesson by ID
   */
  getById: async (id: string): Promise<Lesson | undefined> => {
    return await db.lessons.get(id);
  },

  /**
   * Get lessons by course ID
   */
  getByCourseId: async (courseId: string): Promise<Lesson[]> => {
    return await db.lessons.where('courseId').equals(courseId).sortBy('order');
  },

  /**
   * Get lessons by type
   */
  getByType: async (type: Lesson['type']): Promise<Lesson[]> => {
    return await db.lessons.where('type').equals(type).toArray();
  },

  /**
   * Upsert lesson (update or insert)
   */
  upsert: async (lesson: Lesson): Promise<string> => {
    await db.lessons.put({
      ...lesson,
      syncedAt: Date.now(),
      isDirty: false,
    });
    return lesson._id;
  },

  /**
   * Bulk upsert lessons
   */
  bulkUpsert: async (lessons: Lesson[]): Promise<void> => {
    const now = Date.now();
    await db.lessons.bulkPut(
      lessons.map((lesson) => ({
        ...lesson,
        syncedAt: now,
        isDirty: false,
      }))
    );
  },

  /**
   * Delete lesson by ID
   */
  delete: async (id: string): Promise<void> => {
    await db.lessons.delete(id);
  },

  /**
   * Mark lesson as dirty (needs sync)
   */
  markDirty: async (id: string): Promise<void> => {
    await db.lessons.update(id, { isDirty: true });
  },
};

/**
 * Enrollment queries
 */
export const enrollmentQueries = {
  /**
   * Get all enrollments
   */
  getAll: async (): Promise<Enrollment[]> => {
    return await db.enrollments.toArray();
  },

  /**
   * Get enrollment by ID
   */
  getById: async (id: string): Promise<Enrollment | undefined> => {
    return await db.enrollments.get(id);
  },

  /**
   * Get enrollments by user ID
   */
  getByUserId: async (userId: string): Promise<Enrollment[]> => {
    return await db.enrollments.where('userId').equals(userId).toArray();
  },

  /**
   * Get enrollments by course ID
   */
  getByCourseId: async (courseId: string): Promise<Enrollment[]> => {
    return await db.enrollments.where('courseId').equals(courseId).toArray();
  },

  /**
   * Get enrollment by user ID and course ID
   */
  getByUserAndCourse: async (
    userId: string,
    courseId: string
  ): Promise<Enrollment | undefined> => {
    return await db.enrollments
      .where(['userId', 'courseId'])
      .equals([userId, courseId])
      .first();
  },

  /**
   * Get enrollments by status
   */
  getByStatus: async (status: Enrollment['status']): Promise<Enrollment[]> => {
    return await db.enrollments.where('status').equals(status).toArray();
  },

  /**
   * Get active enrollments for user
   */
  getActiveByUserId: async (userId: string): Promise<Enrollment[]> => {
    return await db.enrollments
      .where('userId')
      .equals(userId)
      .filter((e) => e.status === 'enrolled' || e.status === 'in-progress')
      .toArray();
  },

  /**
   * Upsert enrollment (update or insert)
   */
  upsert: async (enrollment: Enrollment): Promise<string> => {
    await db.enrollments.put({
      ...enrollment,
      syncedAt: Date.now(),
      isDirty: false,
    });
    return enrollment._id;
  },

  /**
   * Bulk upsert enrollments
   */
  bulkUpsert: async (enrollments: Enrollment[]): Promise<void> => {
    const now = Date.now();
    await db.enrollments.bulkPut(
      enrollments.map((enrollment) => ({
        ...enrollment,
        syncedAt: now,
        isDirty: false,
      }))
    );
  },

  /**
   * Update enrollment progress
   */
  updateProgress: async (id: string, progress: number): Promise<void> => {
    await db.enrollments.update(id, {
      progress,
      isDirty: true,
    });
  },

  /**
   * Delete enrollment by ID
   */
  delete: async (id: string): Promise<void> => {
    await db.enrollments.delete(id);
  },

  /**
   * Mark enrollment as dirty (needs sync)
   */
  markDirty: async (id: string): Promise<void> => {
    await db.enrollments.update(id, { isDirty: true });
  },
};

/**
 * Progress queries
 */
export const progressQueries = {
  /**
   * Get all progress records
   */
  getAll: async (): Promise<Progress[]> => {
    return await db.progress.toArray();
  },

  /**
   * Get progress by ID
   */
  getById: async (id: string): Promise<Progress | undefined> => {
    return await db.progress.get(id);
  },

  /**
   * Get progress by enrollment ID
   */
  getByEnrollmentId: async (enrollmentId: string): Promise<Progress[]> => {
    return await db.progress.where('enrollmentId').equals(enrollmentId).toArray();
  },

  /**
   * Get progress by user ID and lesson ID
   */
  getByUserAndLesson: async (userId: string, lessonId: string): Promise<Progress | undefined> => {
    return await db.progress.where(['userId', 'lessonId']).equals([userId, lessonId]).first();
  },

  /**
   * Get progress by course ID
   */
  getByCourseId: async (courseId: string): Promise<Progress[]> => {
    return await db.progress.where('courseId').equals(courseId).toArray();
  },

  /**
   * Get completed progress for enrollment
   */
  getCompletedByEnrollment: async (enrollmentId: string): Promise<Progress[]> => {
    return await db.progress
      .where('enrollmentId')
      .equals(enrollmentId)
      .filter((p) => p.status === 'completed')
      .toArray();
  },

  /**
   * Get in-progress items for user
   */
  getInProgressByUser: async (userId: string): Promise<Progress[]> => {
    return await db.progress
      .where('userId')
      .equals(userId)
      .filter((p) => p.status === 'in-progress')
      .sortBy('lastAccessedAt');
  },

  /**
   * Upsert progress (update or insert)
   */
  upsert: async (progress: Progress): Promise<string> => {
    await db.progress.put({
      ...progress,
      syncedAt: Date.now(),
      isDirty: false,
    });
    return progress._id;
  },

  /**
   * Bulk upsert progress records
   */
  bulkUpsert: async (progressRecords: Progress[]): Promise<void> => {
    const now = Date.now();
    await db.progress.bulkPut(
      progressRecords.map((progress) => ({
        ...progress,
        syncedAt: now,
        isDirty: false,
      }))
    );
  },

  /**
   * Update progress status
   */
  updateStatus: async (id: string, status: Progress['status']): Promise<void> => {
    await db.progress.update(id, {
      status,
      lastAccessedAt: new Date().toISOString(),
      isDirty: true,
    });
  },

  /**
   * Update progress time spent
   */
  updateTimeSpent: async (id: string, additionalSeconds: number): Promise<void> => {
    const existing = await db.progress.get(id);
    if (existing) {
      await db.progress.update(id, {
        timeSpent: existing.timeSpent + additionalSeconds,
        lastAccessedAt: new Date().toISOString(),
        isDirty: true,
      });
    }
  },

  /**
   * Complete progress
   */
  complete: async (id: string, score?: number): Promise<void> => {
    const now = new Date().toISOString();
    await db.progress.update(id, {
      status: 'completed',
      completedAt: now,
      lastAccessedAt: now,
      score,
      isDirty: true,
    });
  },

  /**
   * Delete progress by ID
   */
  delete: async (id: string): Promise<void> => {
    await db.progress.delete(id);
  },

  /**
   * Mark progress as dirty (needs sync)
   */
  markDirty: async (id: string): Promise<void> => {
    await db.progress.update(id, { isDirty: true });
  },
};

/**
 * SCORM package queries
 */
export const scormQueries = {
  /**
   * Get SCORM package by ID
   */
  getById: async (id: string) => {
    return await db.scormPackages.get(id);
  },

  /**
   * Get SCORM package by lesson ID
   */
  getByLessonId: async (lessonId: string) => {
    return await db.scormPackages.where('lessonId').equals(lessonId).first();
  },

  /**
   * Get downloaded SCORM packages
   */
  getDownloaded: async () => {
    return await db.scormPackages.where('isDownloaded').equals(1).toArray();
  },

  /**
   * Mark SCORM package as downloaded
   */
  markDownloaded: async (id: string, fileHandleId: string): Promise<void> => {
    await db.scormPackages.update(id, {
      isDownloaded: true,
      downloadedAt: Date.now(),
      fileHandleId,
    });
  },

  /**
   * Upsert SCORM package
   */
  upsert: async (scormPackage: typeof db.scormPackages extends Table<infer T> ? T : never) => {
    await db.scormPackages.put(scormPackage);
    return scormPackage._id;
  },
};

/**
 * Sync queue queries
 */
export const syncQueueQueries = {
  /**
   * Add item to sync queue
   */
  add: async (
    entry: Omit<typeof db.syncQueue extends Table<infer T> ? T : never, 'id'>
  ): Promise<number> => {
    return await db.syncQueue.add({
      ...entry,
      createdAt: Date.now(),
      attempts: 0,
      status: 'pending',
    });
  },

  /**
   * Get pending sync queue entries
   */
  getPending: async () => {
    return await db.syncQueue.where('status').equals('pending').toArray();
  },

  /**
   * Get failed sync queue entries
   */
  getFailed: async () => {
    return await db.syncQueue.where('status').equals('failed').toArray();
  },

  /**
   * Mark sync queue entry as completed
   */
  markCompleted: async (id: number): Promise<void> => {
    await db.syncQueue.update(id, { status: 'completed' });
  },

  /**
   * Mark sync queue entry as failed
   */
  markFailed: async (id: number, error: string): Promise<void> => {
    const entry = await db.syncQueue.get(id);
    if (entry) {
      await db.syncQueue.update(id, {
        status: 'failed',
        error,
        attempts: entry.attempts + 1,
        lastAttemptAt: Date.now(),
      });
    }
  },

  /**
   * Delete sync queue entry
   */
  delete: async (id: number): Promise<void> => {
    await db.syncQueue.delete(id);
  },

  /**
   * Clear completed entries
   */
  clearCompleted: async (): Promise<void> => {
    await db.syncQueue.where('status').equals('completed').delete();
  },
};

/**
 * User queries
 */
export const userQueries = {
  /**
   * Get user by ID
   */
  getById: async (id: string) => {
    return await db.users.get(id);
  },

  /**
   * Upsert user
   */
  upsert: async (user: typeof db.users extends Table<infer T> ? T : never) => {
    await db.users.put({
      ...user,
      syncedAt: Date.now(),
    });
    return user._id;
  },
};
