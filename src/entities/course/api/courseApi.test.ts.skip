/**
 * Tests for course API
 * Tests API functions for course operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  unenrollFromCourse,
  getCourseProgress,
  getEnrolledCourses,
} from './courseApi';
import { CourseStatus, CourseDifficulty } from '../model/types';
import type { Course, CreateCourseInput, UpdateCourseInput } from '../model/types';

describe('Course API', () => {
  const baseUrl = env.apiBaseUrl;

  const mockCourse: Course = {
    id: '1',
    title: 'Introduction to TypeScript',
    description: 'Learn TypeScript from scratch',
    thumbnail: 'https://example.com/thumbnail.jpg',
    status: CourseStatus.PUBLISHED,
    instructor: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://example.com/avatar.jpg',
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
      averageRating: 4.5,
      totalReviews: 50,
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('getCourses', () => {
    it('should fetch a list of courses', async () => {
      const mockResponse = {
        data: [mockCourse],
        meta: {
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
          totalCount: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/courses`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await getCourses();

      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual(mockCourse);
    });

    it('should fetch courses with query parameters', async () => {
      server.use(
        http.get(`${baseUrl}/courses`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('page')).toBe('2');
          expect(url.searchParams.get('pageSize')).toBe('20');
          expect(url.searchParams.get('search')).toBe('typescript');

          return HttpResponse.json({
            data: [mockCourse],
            meta: {
              currentPage: 2,
              pageSize: 20,
              totalPages: 3,
              totalCount: 50,
              hasNextPage: true,
              hasPreviousPage: true,
            },
          });
        })
      );

      const result = await getCourses({
        page: 2,
        pageSize: 20,
        search: 'typescript',
      });

      expect(result.meta.currentPage).toBe(2);
      expect(result.meta.pageSize).toBe(20);
    });

    it('should handle filter parameters', async () => {
      server.use(
        http.get(`${baseUrl}/courses`, ({ request }) => {
          const url = new URL(request.url);
          const filtersParam = url.searchParams.get('filters');

          if (filtersParam) {
            const filters = JSON.parse(filtersParam);
            expect(filters.categoryId).toBe('1');
            expect(filters.skillLevel).toBe('intermediate');
          }

          return HttpResponse.json({
            data: [mockCourse],
            meta: {
              currentPage: 1,
              pageSize: 10,
              totalPages: 1,
              totalCount: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          });
        })
      );

      await getCourses({
        categoryId: '1',
        skillLevel: CourseDifficulty.INTERMEDIATE,
      });
    });
  });

  describe('getCourse', () => {
    it('should fetch a single course by ID', async () => {
      server.use(
        http.get(`${baseUrl}/courses/1`, () => {
          return HttpResponse.json(mockCourse);
        })
      );

      const result = await getCourse('1');

      expect(result).toEqual(mockCourse);
      expect(result.id).toBe('1');
      expect(result.title).toBe('Introduction to TypeScript');
    });

    it('should throw error if course not found', async () => {
      server.use(
        http.get(`${baseUrl}/courses/999`, () => {
          return HttpResponse.json(
            { message: 'Course not found', code: 'NOT_FOUND' },
            { status: 404 }
          );
        })
      );

      await expect(getCourse('999')).rejects.toThrow();
    });
  });

  describe('createCourse', () => {
    it('should create a new course', async () => {
      const input: CreateCourseInput = {
        title: 'New Course',
        description: 'Course description',
        instructorId: '1',
        categoryId: '1',
        duration: 120,
        skillLevel: CourseDifficulty.BEGINNER,
        language: 'en',
      };

      server.use(
        http.post(`${baseUrl}/courses`, async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(input);
          return HttpResponse.json({ ...mockCourse, ...input }, { status: 201 });
        })
      );

      const result = await createCourse(input);

      expect(result.title).toBe(input.title);
      expect(result.description).toBe(input.description);
    });

    it('should handle validation errors', async () => {
      const input: CreateCourseInput = {
        title: '',
        description: '',
        instructorId: '1',
        categoryId: '1',
        duration: 120,
        skillLevel: CourseDifficulty.BEGINNER,
      };

      server.use(
        http.post(`${baseUrl}/courses`, () => {
          return HttpResponse.json(
            {
              message: 'Validation error',
              code: 'VALIDATION_ERROR',
              errors: {
                title: ['Title is required'],
                description: ['Description is required'],
              },
            },
            { status: 400 }
          );
        })
      );

      await expect(createCourse(input)).rejects.toThrow();
    });
  });

  describe('updateCourse', () => {
    it('should update an existing course', async () => {
      const input: UpdateCourseInput = {
        title: 'Updated Title',
        status: CourseStatus.ARCHIVED,
      };

      server.use(
        http.put(`${baseUrl}/courses/1`, async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(input);
          return HttpResponse.json({ ...mockCourse, ...input });
        })
      );

      const result = await updateCourse('1', input);

      expect(result.title).toBe(input.title);
      expect(result.status).toBe(input.status);
    });

    it('should handle not found error', async () => {
      server.use(
        http.put(`${baseUrl}/courses/999`, () => {
          return HttpResponse.json(
            { message: 'Course not found', code: 'NOT_FOUND' },
            { status: 404 }
          );
        })
      );

      await expect(updateCourse('999', { title: 'Updated' })).rejects.toThrow();
    });
  });

  describe('deleteCourse', () => {
    it('should delete a course', async () => {
      server.use(
        http.delete(`${baseUrl}/courses/1`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(deleteCourse('1')).resolves.toBeUndefined();
    });

    it('should handle not found error', async () => {
      server.use(
        http.delete(`${baseUrl}/courses/999`, () => {
          return HttpResponse.json(
            { message: 'Course not found', code: 'NOT_FOUND' },
            { status: 404 }
          );
        })
      );

      await expect(deleteCourse('999')).rejects.toThrow();
    });
  });

  describe('enrollInCourse', () => {
    it('should enroll user in a course', async () => {
      const mockResponse = {
        enrollmentId: 'enroll-1',
        message: 'Successfully enrolled',
      };

      server.use(
        http.post(`${baseUrl}/courses/1/enroll`, () => {
          return HttpResponse.json(mockResponse, { status: 201 });
        })
      );

      const result = await enrollInCourse('1');

      expect(result.enrollmentId).toBe('enroll-1');
      expect(result.message).toBe('Successfully enrolled');
    });

    it('should handle already enrolled error', async () => {
      server.use(
        http.post(`${baseUrl}/courses/1/enroll`, () => {
          return HttpResponse.json(
            { message: 'Already enrolled', code: 'ALREADY_ENROLLED' },
            { status: 400 }
          );
        })
      );

      await expect(enrollInCourse('1')).rejects.toThrow();
    });
  });

  describe('unenrollFromCourse', () => {
    it('should unenroll user from a course', async () => {
      server.use(
        http.post(`${baseUrl}/courses/1/unenroll`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(unenrollFromCourse('1')).resolves.toBeUndefined();
    });
  });

  describe('getCourseProgress', () => {
    it('should fetch course progress for user', async () => {
      const mockProgress = {
        courseId: '1',
        progress: 50,
        completedLessons: 5,
        totalLessons: 10,
        lastAccessedAt: '2024-01-10T00:00:00Z',
      };

      server.use(
        http.get(`${baseUrl}/courses/1/progress`, () => {
          return HttpResponse.json(mockProgress);
        })
      );

      const result = await getCourseProgress('1');

      expect(result.courseId).toBe('1');
      expect(result.progress).toBe(50);
      expect(result.completedLessons).toBe(5);
      expect(result.totalLessons).toBe(10);
    });

    it('should handle not enrolled error', async () => {
      server.use(
        http.get(`${baseUrl}/courses/1/progress`, () => {
          return HttpResponse.json(
            { message: 'Not enrolled in course', code: 'NOT_ENROLLED' },
            { status: 403 }
          );
        })
      );

      await expect(getCourseProgress('1')).rejects.toThrow();
    });
  });

  describe('getEnrolledCourses', () => {
    it('should fetch courses user is enrolled in', async () => {
      const mockResponse = {
        data: [{ ...mockCourse, isEnrolled: true, progress: 50 }],
        meta: {
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
          totalCount: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/courses`, ({ request }) => {
          const url = new URL(request.url);
          const filtersParam = url.searchParams.get('filters');

          if (filtersParam) {
            const filters = JSON.parse(filtersParam);
            expect(filters.enrolled).toBe(true);
          }

          return HttpResponse.json(mockResponse);
        })
      );

      const result = await getEnrolledCourses();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].isEnrolled).toBe(true);
    });
  });
});
