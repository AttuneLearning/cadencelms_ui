/**
 * Storage module exports
 * Provides unified access to offline storage functionality
 */

// Database
export { db, LMSDatabase, initDatabase } from './db';
export type {
  Course,
  Lesson,
  Enrollment,
  Progress,
  SCORMPackage,
  SyncQueueEntry,
  User,
} from './db';

// Queries
export {
  courseQueries,
  lessonQueries,
  enrollmentQueries,
  progressQueries,
  scormQueries,
  syncQueueQueries,
  userQueries,
} from './queries';

// Sync
export {
  SyncEngine,
  createSyncEngine,
  initSyncEngine,
  getSyncEngine,
} from './sync';
export type { SyncResult, SyncConfig } from './sync';

// File System
export {
  SCORMFileManager,
  initSCORMFileManager,
  getSCORMFileManager,
  isFileSystemSupported,
  formatBytes,
} from './fileSystem';
export type { SCORMDownloadResult } from './fileSystem';
