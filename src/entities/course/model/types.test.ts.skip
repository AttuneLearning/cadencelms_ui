/**
 * Tests for course types
 * Validates type definitions and type safety
 */

import { describe, it, expect, expectTypeOf } from 'vitest';
import {
  CourseStatus,
  CourseDifficulty,
  type Course,
  type CourseCategory,
  type CourseInstructor,
  type CourseStats,
  type CourseMetadata,
  type CreateCourseInput,
  type UpdateCourseInput,
  type CourseQueryParams,
  type CourseEnrollment,
} from './types';

describe('Course Types', () => {
  describe('CourseStatus Enum', () => {
    it('should have correct enum values', () => {
      expect(CourseStatus.DRAFT).toBe('draft');
      expect(CourseStatus.PUBLISHED).toBe('published');
      expect(CourseStatus.ARCHIVED).toBe('archived');
    });
  });

  describe('CourseDifficulty Enum', () => {
    it('should have correct enum values', () => {
      expect(CourseDifficulty.BEGINNER).toBe('beginner');
      expect(CourseDifficulty.INTERMEDIATE).toBe('intermediate');
      expect(CourseDifficulty.ADVANCED).toBe('advanced');
    });
  });

  describe('CourseCategory Type', () => {
    it('should match expected structure', () => {
      const category: CourseCategory = {
        id: '1',
        name: 'Programming',
        slug: 'programming',
      };

      expectTypeOf(category).toMatchTypeOf<CourseCategory>();
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('slug');
    });
  });

  describe('CourseInstructor Type', () => {
    it('should match expected structure with required fields', () => {
      const instructor: CourseInstructor = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      };

      expectTypeOf(instructor).toMatchTypeOf<CourseInstructor>();
      expect(instructor).toHaveProperty('id');
      expect(instructor).toHaveProperty('name');
      expect(instructor).toHaveProperty('email');
    });

    it('should allow optional fields', () => {
      const instructor: CourseInstructor = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://example.com/avatar.jpg',
        title: 'Senior Developer',
        bio: 'Experienced developer',
      };

      expectTypeOf(instructor).toMatchTypeOf<CourseInstructor>();
      expect(instructor).toHaveProperty('avatar');
      expect(instructor).toHaveProperty('title');
      expect(instructor).toHaveProperty('bio');
    });
  });

  describe('CourseStats Type', () => {
    it('should match expected structure', () => {
      const stats: CourseStats = {
        totalEnrollments: 100,
        activeEnrollments: 75,
        completionRate: 0.8,
        averageRating: 4.5,
        totalReviews: 50,
      };

      expectTypeOf(stats).toMatchTypeOf<CourseStats>();
      expect(stats.totalEnrollments).toBe(100);
      expect(stats.activeEnrollments).toBe(75);
      expect(stats.completionRate).toBe(0.8);
    });
  });

  describe('CourseMetadata Type', () => {
    it('should match expected structure', () => {
      const metadata: CourseMetadata = {
        duration: 120,
        lessonsCount: 10,
        skillLevel: CourseDifficulty.INTERMEDIATE,
        language: 'en',
        lastUpdated: '2024-01-01T00:00:00Z',
        prerequisites: ['Basic programming knowledge'],
        learningObjectives: ['Learn TypeScript', 'Build React apps'],
        tags: ['typescript', 'react'],
      };

      expectTypeOf(metadata).toMatchTypeOf<CourseMetadata>();
      expect(metadata.duration).toBe(120);
      expect(metadata.lessonsCount).toBe(10);
      expect(metadata.skillLevel).toBe(CourseDifficulty.INTERMEDIATE);
    });
  });

  describe('Course Type', () => {
    it('should match expected structure with all fields', () => {
      const course: Course = {
        id: '1',
        title: 'Introduction to TypeScript',
        description: 'Learn TypeScript from scratch',
        thumbnail: 'https://example.com/thumbnail.jpg',
        status: CourseStatus.PUBLISHED,
        instructor: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
        },
        category: {
          id: '1',
          name: 'Programming',
          slug: 'programming',
        },
        metadata: {
          duration: 120,
          lessonsCount: 10,
          skillLevel: CourseDifficulty.INTERMEDIATE,
          language: 'en',
          lastUpdated: '2024-01-01T00:00:00Z',
        },
        stats: {
          totalEnrollments: 100,
          activeEnrollments: 75,
          completionRate: 0.8,
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        isEnrolled: true,
        enrollmentId: 'enroll-1',
        progress: 50,
      };

      expectTypeOf(course).toMatchTypeOf<Course>();
      expect(course.id).toBe('1');
      expect(course.title).toBe('Introduction to TypeScript');
      expect(course.status).toBe(CourseStatus.PUBLISHED);
    });
  });

  describe('CreateCourseInput Type', () => {
    it('should match expected structure', () => {
      const input: CreateCourseInput = {
        title: 'New Course',
        description: 'Course description',
        instructorId: '1',
        categoryId: '1',
        duration: 120,
        skillLevel: CourseDifficulty.BEGINNER,
      };

      expectTypeOf(input).toMatchTypeOf<CreateCourseInput>();
      expect(input).toHaveProperty('title');
      expect(input).toHaveProperty('description');
      expect(input).toHaveProperty('instructorId');
    });
  });

  describe('UpdateCourseInput Type', () => {
    it('should allow partial updates', () => {
      const input: UpdateCourseInput = {
        title: 'Updated Title',
        status: CourseStatus.ARCHIVED,
      };

      expectTypeOf(input).toMatchTypeOf<UpdateCourseInput>();
      expect(input).toHaveProperty('title');
      expect(input).toHaveProperty('status');
    });

    it('should allow empty updates', () => {
      const input: UpdateCourseInput = {};

      expectTypeOf(input).toMatchTypeOf<UpdateCourseInput>();
      expect(input).toEqual({});
    });
  });

  describe('CourseQueryParams Type', () => {
    it('should allow all query parameters', () => {
      const params: CourseQueryParams = {
        page: 1,
        pageSize: 10,
        search: 'typescript',
        categoryId: '1',
        instructorId: '1',
        status: CourseStatus.PUBLISHED,
        skillLevel: CourseDifficulty.INTERMEDIATE,
        sortBy: 'title',
        sortOrder: 'asc',
        enrolled: true,
      };

      expectTypeOf(params).toMatchTypeOf<CourseQueryParams>();
      expect(params.page).toBe(1);
      expect(params.search).toBe('typescript');
    });

    it('should allow partial query parameters', () => {
      const params: CourseQueryParams = {
        search: 'react',
      };

      expectTypeOf(params).toMatchTypeOf<CourseQueryParams>();
      expect(params).toHaveProperty('search');
    });
  });

  describe('CourseEnrollment Type', () => {
    it('should match expected structure', () => {
      const enrollment: CourseEnrollment = {
        id: '1',
        courseId: '1',
        userId: '1',
        enrolledAt: '2024-01-01T00:00:00Z',
        lastAccessedAt: '2024-01-10T00:00:00Z',
        progress: 50,
        status: 'active',
        completedAt: undefined,
      };

      expectTypeOf(enrollment).toMatchTypeOf<CourseEnrollment>();
      expect(enrollment.courseId).toBe('1');
      expect(enrollment.progress).toBe(50);
      expect(enrollment.status).toBe('active');
    });

    it('should allow completed status with completedAt', () => {
      const enrollment: CourseEnrollment = {
        id: '1',
        courseId: '1',
        userId: '1',
        enrolledAt: '2024-01-01T00:00:00Z',
        progress: 100,
        status: 'completed',
        completedAt: '2024-02-01T00:00:00Z',
      };

      expect(enrollment.status).toBe('completed');
      expect(enrollment.completedAt).toBeDefined();
    });
  });
});
