/**
 * Dexie IndexedDB database schema
 * Stores LMS data for offline access
 */

import Dexie, { type Table } from 'dexie';

/**
 * Course entity stored in IndexedDB
 */
export interface Course {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  metadata?: {
    duration?: number;
    level?: string;
    tags?: string[];
  };
  // Sync metadata
  syncedAt?: number;
  isDirty?: boolean; // Has local changes not synced
}

/**
 * Lesson entity stored in IndexedDB
 */
export interface Lesson {
  _id: string;
  courseId: string;
  title: string;
  description?: string;
  type: 'video' | 'scorm' | 'document' | 'quiz';
  order: number;
  content?: {
    url?: string;
    scormPackageId?: string;
    documentUrl?: string;
  };
  duration?: number;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
  // Sync metadata
  syncedAt?: number;
  isDirty?: boolean;
}

/**
 * Enrollment entity stored in IndexedDB
 */
export interface Enrollment {
  _id: string;
  userId: string;
  courseId: string;
  status: 'enrolled' | 'in-progress' | 'completed' | 'dropped';
  enrolledAt: string;
  completedAt?: string;
  progress: number; // 0-100
  metadata?: {
    certificateIssued?: boolean;
    lastAccessedAt?: string;
  };
  // Sync metadata
  syncedAt?: number;
  isDirty?: boolean;
}

/**
 * Progress tracking entity stored in IndexedDB
 */
export interface Progress {
  _id: string;
  userId: string;
  enrollmentId: string;
  lessonId: string;
  courseId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  score?: number;
  completedAt?: string;
  timeSpent: number; // seconds
  attempts: number;
  lastAccessedAt: string;
  metadata?: {
    bookmarks?: number[];
    notes?: string;
    scormData?: Record<string, unknown>;
  };
  // Sync metadata
  syncedAt?: number;
  isDirty?: boolean;
}

/**
 * SCORM package metadata stored in IndexedDB
 */
export interface SCORMPackage {
  _id: string;
  lessonId: string;
  courseId: string;
  title: string;
  version: '1.2' | '2004';
  manifestUrl: string;
  launchUrl: string;
  size: number;
  isDownloaded: boolean;
  downloadedAt?: number;
  fileHandleId?: string; // Reference to File System API handle
  metadata?: {
    identifier?: string;
    organizations?: unknown[];
  };
  // Sync metadata
  syncedAt?: number;
}

/**
 * Sync queue entry for offline mutations
 */
export interface SyncQueueEntry {
  id?: number; // Auto-incremented
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'course' | 'lesson' | 'enrollment' | 'progress';
  entityId: string;
  payload: unknown;
  createdAt: number;
  attempts: number;
  lastAttemptAt?: number;
  error?: string;
  status: 'pending' | 'processing' | 'failed' | 'completed';
}

/**
 * User entity stored in IndexedDB (cached from API)
 */
export interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  avatar?: string;
  metadata?: Record<string, unknown>;
  // Sync metadata
  syncedAt?: number;
}

/**
 * LMS Database class extending Dexie
 */
export class LMSDatabase extends Dexie {
  // Define tables with types
  courses!: Table<Course, string>;
  lessons!: Table<Lesson, string>;
  enrollments!: Table<Enrollment, string>;
  progress!: Table<Progress, string>;
  scormPackages!: Table<SCORMPackage, string>;
  syncQueue!: Table<SyncQueueEntry, number>;
  users!: Table<User, string>;

  constructor() {
    super('lms-database');

    // Define database schema
    this.version(1).stores({
      courses: '_id, status, syncedAt, isDirty',
      lessons: '_id, courseId, type, order, syncedAt, isDirty',
      enrollments: '_id, userId, courseId, status, syncedAt, isDirty',
      progress:
        '_id, userId, enrollmentId, lessonId, courseId, status, lastAccessedAt, syncedAt, isDirty',
      scormPackages: '_id, lessonId, courseId, isDownloaded, downloadedAt',
      syncQueue: '++id, status, type, entity, createdAt, attempts',
      users: '_id, email, syncedAt',
    });
  }

  /**
   * Clear all data from the database
   */
  async clearAll(): Promise<void> {
    await Promise.all([
      this.courses.clear(),
      this.lessons.clear(),
      this.enrollments.clear(),
      this.progress.clear(),
      this.scormPackages.clear(),
      this.syncQueue.clear(),
      this.users.clear(),
    ]);
  }

  /**
   * Get database size information
   */
  async getSize(): Promise<{
    courses: number;
    lessons: number;
    enrollments: number;
    progress: number;
    scormPackages: number;
    syncQueue: number;
    users: number;
    total: number;
  }> {
    const [courses, lessons, enrollments, progress, scormPackages, syncQueue, users] =
      await Promise.all([
        this.courses.count(),
        this.lessons.count(),
        this.enrollments.count(),
        this.progress.count(),
        this.scormPackages.count(),
        this.syncQueue.count(),
        this.users.count(),
      ]);

    const total = courses + lessons + enrollments + progress + scormPackages + syncQueue + users;

    return {
      courses,
      lessons,
      enrollments,
      progress,
      scormPackages,
      syncQueue,
      users,
      total,
    };
  }

  /**
   * Get all entities that need syncing (marked as dirty)
   */
  async getDirtyEntities(): Promise<{
    courses: Course[];
    lessons: Lesson[];
    enrollments: Enrollment[];
    progress: Progress[];
  }> {
    const [courses, lessons, enrollments, progress] = await Promise.all([
      this.courses.where('isDirty').equals(1).toArray(),
      this.lessons.where('isDirty').equals(1).toArray(),
      this.enrollments.where('isDirty').equals(1).toArray(),
      this.progress.where('isDirty').equals(1).toArray(),
    ]);

    return { courses, lessons, enrollments, progress };
  }

  /**
   * Mark entities as synced
   */
  async markAsSynced(
    entity: 'courses' | 'lessons' | 'enrollments' | 'progress',
    ids: string[]
  ): Promise<void> {
    const table = this[entity];
    const syncedAt = Date.now();

    await Promise.all(
      ids.map((id) =>
        table.update(id, {
          syncedAt,
          isDirty: false,
        })
      )
    );
  }
}

/**
 * Singleton database instance
 */
export const db = new LMSDatabase();

/**
 * Initialize database and setup event handlers
 */
export async function initDatabase(): Promise<void> {
  try {
    // Open the database
    await db.open();

    console.log('[Database] Initialized successfully');

    // Log database size
    const size = await db.getSize();
    console.log('[Database] Size:', size);
  } catch (error) {
    console.error('[Database] Failed to initialize:', error);
    throw error;
  }
}

/**
 * Export database instance and initialization function
 */
export default db;
