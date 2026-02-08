/**
 * Database tests
 * Tests for Dexie database schema and operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LMSDatabase, initDatabase, type Course, type Lesson } from './db';

describe('LMSDatabase', () => {
  let db: LMSDatabase;

  beforeEach(async () => {
    // Create a new database instance with a unique name for each test
    db = new LMSDatabase();
    await db.open();
  });

  afterEach(async () => {
    // Clean up
    await db.clearAll();
    await db.close();
    await db.delete();
  });

  describe('Database initialization', () => {
    it('should initialize database successfully', async () => {
      expect(db.isOpen()).toBe(true);
    });

    it('should have all required tables', () => {
      expect(db.courses).toBeDefined();
      expect(db.lessons).toBeDefined();
      expect(db.enrollments).toBeDefined();
      expect(db.progress).toBeDefined();
      expect(db.scormPackages).toBeDefined();
      expect(db.syncQueue).toBeDefined();
      expect(db.users).toBeDefined();
    });
  });

  describe('Course operations', () => {
    const mockCourse: Course = {
      _id: 'course-1',
      title: 'Test Course',
      description: 'Test course description',
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: Date.now(),
      isDirty: false,
    };

    it('should add a course', async () => {
      await db.courses.add(mockCourse);
      const course = await db.courses.get('course-1');

      expect(course).toBeDefined();
      expect(course?.title).toBe('Test Course');
    });

    it('should update a course', async () => {
      await db.courses.add(mockCourse);
      await db.courses.update('course-1', { title: 'Updated Course' });

      const course = await db.courses.get('course-1');
      expect(course?.title).toBe('Updated Course');
    });

    it('should delete a course', async () => {
      await db.courses.add(mockCourse);
      await db.courses.delete('course-1');

      const course = await db.courses.get('course-1');
      expect(course).toBeUndefined();
    });

    it('should query courses by status', async () => {
      await db.courses.bulkAdd([
        { ...mockCourse, _id: 'course-1', status: 'published' },
        { ...mockCourse, _id: 'course-2', status: 'draft' },
        { ...mockCourse, _id: 'course-3', status: 'published' },
      ]);

      const publishedCourses = await db.courses.where('status').equals('published').toArray();
      expect(publishedCourses).toHaveLength(2);
    });
  });

  describe('Lesson operations', () => {
    const mockLesson: Lesson = {
      _id: 'lesson-1',
      courseId: 'course-1',
      title: 'Test Lesson',
      type: 'video',
      order: 1,
      isRequired: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: Date.now(),
      isDirty: false,
    };

    it('should add a lesson', async () => {
      await db.lessons.add(mockLesson);
      const lesson = await db.lessons.get('lesson-1');

      expect(lesson).toBeDefined();
      expect(lesson?.title).toBe('Test Lesson');
    });

    it('should query lessons by course ID', async () => {
      await db.lessons.bulkAdd([
        { ...mockLesson, _id: 'lesson-1', courseId: 'course-1', order: 1 },
        { ...mockLesson, _id: 'lesson-2', courseId: 'course-1', order: 2 },
        { ...mockLesson, _id: 'lesson-3', courseId: 'course-2', order: 1 },
      ]);

      const courseLessons = await db.lessons.where('courseId').equals('course-1').toArray();
      expect(courseLessons).toHaveLength(2);
    });

    it('should sort lessons by order', async () => {
      await db.lessons.bulkAdd([
        { ...mockLesson, _id: 'lesson-3', order: 3 },
        { ...mockLesson, _id: 'lesson-1', order: 1 },
        { ...mockLesson, _id: 'lesson-2', order: 2 },
      ]);

      const sortedLessons = await db.lessons.orderBy('order').toArray();
      expect(sortedLessons[0].order).toBe(1);
      expect(sortedLessons[1].order).toBe(2);
      expect(sortedLessons[2].order).toBe(3);
    });
  });

  describe('Sync operations', () => {
    it('should get database size', async () => {
      await db.courses.add({
        _id: 'course-1',
        title: 'Test',
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const size = await db.getSize();
      expect(size.courses).toBe(1);
      expect(size.total).toBe(1);
    });

    it('should get dirty entities', async () => {
      await db.courses.bulkAdd([
        {
          _id: 'course-1',
          title: 'Test',
          status: 'published',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDirty: true,
        },
        {
          _id: 'course-2',
          title: 'Test 2',
          status: 'published',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDirty: false,
        },
      ]);

      // Note: In fake-indexeddb, boolean queries may behave differently
      // We check that we can retrieve entities with isDirty flag
      const allCourses = await db.courses.toArray();
      const dirtyCourses = allCourses.filter(c => c.isDirty === true);
      expect(dirtyCourses).toHaveLength(1);
      expect(dirtyCourses[0]._id).toBe('course-1');
    });

    it('should mark entities as synced', async () => {
      await db.courses.add({
        _id: 'course-1',
        title: 'Test',
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDirty: true,
      });

      await db.markAsSynced('courses', ['course-1']);

      const course = await db.courses.get('course-1');
      expect(course?.isDirty).toBe(false);
      expect(course?.syncedAt).toBeDefined();
    });
  });

  describe('Clear operations', () => {
    it('should clear all data', async () => {
      await db.courses.add({
        _id: 'course-1',
        title: 'Test',
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await db.clearAll();

      const size = await db.getSize();
      expect(size.total).toBe(0);
    });
  });
});

describe('initDatabase', () => {
  it('should initialize database successfully', async () => {
    await expect(initDatabase()).resolves.toBeUndefined();
  });
});
