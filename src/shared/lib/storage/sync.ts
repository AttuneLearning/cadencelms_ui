/**
 * Offline sync engine
 * Handles synchronization between IndexedDB and backend API
 */

import { db, type Course, type Lesson, type Enrollment, type Progress } from './db';
import {
  courseQueries,
  lessonQueries,
  enrollmentQueries,
  progressQueries,
  syncQueueQueries,
} from './queries';

/**
 * Sync result interface
 */
export interface SyncResult {
  success: boolean;
  synced: {
    courses: number;
    lessons: number;
    enrollments: number;
    progress: number;
  };
  failed: {
    courses: number;
    lessons: number;
    enrollments: number;
    progress: number;
  };
  errors: string[];
}

/**
 * Sync configuration
 */
export interface SyncConfig {
  /**
   * API client instance (injected from external)
   */
  apiClient: {
    get: <T>(url: string) => Promise<{ data: T }>;
    post: <T>(url: string, data?: unknown) => Promise<{ data: T }>;
    put: <T>(url: string, data?: unknown) => Promise<{ data: T }>;
    delete: <T>(url: string) => Promise<{ data: T }>;
  };

  /**
   * User ID for syncing user-specific data
   */
  userId?: string;

  /**
   * Endpoints configuration
   */
  endpoints: {
    courses: string;
    lessons: string;
    enrollments: string;
    progress: string;
  };

  /**
   * Callbacks
   */
  onProgress?: (current: number, total: number) => void;
  onError?: (error: Error) => void;
}

/**
 * Sync engine class
 */
export class SyncEngine {
  private config: SyncConfig;
  private isSyncing = false;

  constructor(config: SyncConfig) {
    this.config = config;
  }

  /**
   * Check if sync is currently in progress
   */
  get isRunning(): boolean {
    return this.isSyncing;
  }

  /**
   * Perform full sync (download from server and upload local changes)
   */
  async fullSync(): Promise<SyncResult> {
    if (this.isSyncing) {
      throw new Error('Sync already in progress');
    }

    this.isSyncing = true;

    const result: SyncResult = {
      success: true,
      synced: { courses: 0, lessons: 0, enrollments: 0, progress: 0 },
      failed: { courses: 0, lessons: 0, enrollments: 0, progress: 0 },
      errors: [],
    };

    try {
      // Step 1: Upload local changes (push)
      await this.pushLocalChanges(result);

      // Step 2: Download server data (pull)
      await this.pullServerData(result);

      // Step 3: Process sync queue
      await this.processSyncQueue(result);

      console.log('[SyncEngine] Full sync completed', result);
    } catch (error) {
      result.success = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(errorMessage);
      console.error('[SyncEngine] Full sync failed:', error);
      this.config.onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      this.isSyncing = false;
    }

    return result;
  }

  /**
   * Push local changes to server
   */
  private async pushLocalChanges(result: SyncResult): Promise<void> {
    const dirtyEntities = await db.getDirtyEntities();

    // Push courses
    for (const course of dirtyEntities.courses) {
      try {
        await this.config.apiClient.put(`${this.config.endpoints.courses}/${course._id}`, course);
        await db.courses.update(course._id, { isDirty: false, syncedAt: Date.now() });
        result.synced.courses++;
      } catch (error) {
        result.failed.courses++;
        result.errors.push(`Failed to sync course ${course._id}: ${error}`);
      }
    }

    // Push lessons
    for (const lesson of dirtyEntities.lessons) {
      try {
        await this.config.apiClient.put(`${this.config.endpoints.lessons}/${lesson._id}`, lesson);
        await db.lessons.update(lesson._id, { isDirty: false, syncedAt: Date.now() });
        result.synced.lessons++;
      } catch (error) {
        result.failed.lessons++;
        result.errors.push(`Failed to sync lesson ${lesson._id}: ${error}`);
      }
    }

    // Push enrollments
    for (const enrollment of dirtyEntities.enrollments) {
      try {
        await this.config.apiClient.put(
          `${this.config.endpoints.enrollments}/${enrollment._id}`,
          enrollment
        );
        await db.enrollments.update(enrollment._id, { isDirty: false, syncedAt: Date.now() });
        result.synced.enrollments++;
      } catch (error) {
        result.failed.enrollments++;
        result.errors.push(`Failed to sync enrollment ${enrollment._id}: ${error}`);
      }
    }

    // Push progress
    for (const progress of dirtyEntities.progress) {
      try {
        await this.config.apiClient.put(
          `${this.config.endpoints.progress}/${progress._id}`,
          progress
        );
        await db.progress.update(progress._id, { isDirty: false, syncedAt: Date.now() });
        result.synced.progress++;
      } catch (error) {
        result.failed.progress++;
        result.errors.push(`Failed to sync progress ${progress._id}: ${error}`);
      }
    }
  }

  /**
   * Pull server data to local database
   */
  private async pullServerData(result: SyncResult): Promise<void> {
    try {
      // Pull courses
      const coursesResponse = await this.config.apiClient.get<Course[]>(
        this.config.endpoints.courses
      );
      await courseQueries.bulkUpsert(coursesResponse.data);
      result.synced.courses += coursesResponse.data.length;

      // Pull enrollments (user-specific)
      if (this.config.userId) {
        const enrollmentsResponse = await this.config.apiClient.get<Enrollment[]>(
          `${this.config.endpoints.enrollments}?userId=${this.config.userId}`
        );
        await enrollmentQueries.bulkUpsert(enrollmentsResponse.data);
        result.synced.enrollments += enrollmentsResponse.data.length;

        // Pull lessons for enrolled courses
        const enrolledCourseIds = enrollmentsResponse.data.map((e) => e.courseId);
        for (const courseId of enrolledCourseIds) {
          const lessonsResponse = await this.config.apiClient.get<Lesson[]>(
            `${this.config.endpoints.lessons}?courseId=${courseId}`
          );
          await lessonQueries.bulkUpsert(lessonsResponse.data);
          result.synced.lessons += lessonsResponse.data.length;
        }

        // Pull progress
        const progressResponse = await this.config.apiClient.get<Progress[]>(
          `${this.config.endpoints.progress}?userId=${this.config.userId}`
        );
        await progressQueries.bulkUpsert(progressResponse.data);
        result.synced.progress += progressResponse.data.length;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Failed to pull server data: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Process sync queue entries
   */
  private async processSyncQueue(result: SyncResult): Promise<void> {
    const pendingEntries = await syncQueueQueries.getPending();

    for (const entry of pendingEntries) {
      try {
        switch (entry.type) {
          case 'CREATE':
            await this.config.apiClient.post(this.getEndpointForEntity(entry.entity), entry.payload);
            break;
          case 'UPDATE':
            await this.config.apiClient.put(
              `${this.getEndpointForEntity(entry.entity)}/${entry.entityId}`,
              entry.payload
            );
            break;
          case 'DELETE':
            await this.config.apiClient.delete(
              `${this.getEndpointForEntity(entry.entity)}/${entry.entityId}`
            );
            break;
        }

        // Mark as completed
        if (entry.id) {
          await syncQueueQueries.markCompleted(entry.id);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (entry.id) {
          await syncQueueQueries.markFailed(entry.id, errorMessage);
        }
        result.errors.push(`Failed to process sync queue entry ${entry.id}: ${errorMessage}`);
      }
    }
  }

  /**
   * Get endpoint URL for entity type
   */
  private getEndpointForEntity(entity: string): string {
    switch (entity) {
      case 'course':
        return this.config.endpoints.courses;
      case 'lesson':
        return this.config.endpoints.lessons;
      case 'enrollment':
        return this.config.endpoints.enrollments;
      case 'progress':
        return this.config.endpoints.progress;
      default:
        throw new Error(`Unknown entity type: ${entity}`);
    }
  }

  /**
   * Download specific course with all lessons for offline access
   */
  async downloadCourse(courseId: string): Promise<void> {
    try {
      // Download course
      const courseResponse = await this.config.apiClient.get<Course>(
        `${this.config.endpoints.courses}/${courseId}`
      );
      await courseQueries.upsert(courseResponse.data);

      // Download lessons
      const lessonsResponse = await this.config.apiClient.get<Lesson[]>(
        `${this.config.endpoints.lessons}?courseId=${courseId}`
      );
      await lessonQueries.bulkUpsert(lessonsResponse.data);

      console.log(`[SyncEngine] Downloaded course ${courseId} for offline access`);
    } catch (error) {
      console.error(`[SyncEngine] Failed to download course ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Queue an offline mutation for later sync
   */
  async queueMutation(
    type: 'CREATE' | 'UPDATE' | 'DELETE',
    entity: 'course' | 'lesson' | 'enrollment' | 'progress',
    entityId: string,
    payload: unknown
  ): Promise<number> {
    return await syncQueueQueries.add({
      type,
      entity,
      entityId,
      payload,
    });
  }

  /**
   * Clear sync queue (for testing/debugging)
   */
  async clearSyncQueue(): Promise<void> {
    await syncQueueQueries.clearCompleted();
  }

  /**
   * Get sync queue status
   */
  async getSyncQueueStatus(): Promise<{
    pending: number;
    failed: number;
    completed: number;
  }> {
    const [pending, failed] = await Promise.all([
      syncQueueQueries.getPending(),
      syncQueueQueries.getFailed(),
    ]);

    return {
      pending: pending.length,
      failed: failed.length,
      completed: 0, // Would need to query for this if we keep completed entries
    };
  }
}

/**
 * Create a sync engine instance
 */
export function createSyncEngine(config: SyncConfig): SyncEngine {
  return new SyncEngine(config);
}

/**
 * Global sync engine instance (set by app initialization)
 */
let globalSyncEngine: SyncEngine | null = null;

/**
 * Initialize global sync engine
 */
export function initSyncEngine(config: SyncConfig): SyncEngine {
  globalSyncEngine = createSyncEngine(config);
  return globalSyncEngine;
}

/**
 * Get global sync engine instance
 */
export function getSyncEngine(): SyncEngine {
  if (!globalSyncEngine) {
    throw new Error('Sync engine not initialized. Call initSyncEngine() first.');
  }
  return globalSyncEngine;
}
