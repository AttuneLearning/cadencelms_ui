/**
 * Tests for Program API Client
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import * as programApi from '../programApi';
import type {
  ProgramsListResponse,
  ProgramLevelsResponse,
  ProgramEnrollmentsResponse,
} from '../../model/types';
import {
  mockProgramListItems,
  mockFullProgram,
  mockCreateProgramPayload,
  mockUpdateProgramPayload,
  mockProgramLevelDetails,
  mockProgramEnrollments,
  createMockProgram,
} from '@/test/mocks/data/programs';

describe('programApi', () => {
  const baseUrl = env.apiBaseUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('listPrograms', () => {
    it('should fetch paginated list of programs without filters', async () => {
      const mockResponse: ProgramsListResponse = {
        programs: mockProgramListItems,
        pagination: {
          page: 1,
          limit: 20,
          total: mockProgramListItems.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/programs`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await programApi.listPrograms();

      expect(result).toEqual(mockResponse);
      expect(result.programs).toHaveLength(mockProgramListItems.length);
    });

    it('should fetch programs with pagination params', async () => {
      const mockResponse: ProgramsListResponse = {
        programs: mockProgramListItems.slice(0, 2),
        pagination: {
          page: 1,
          limit: 2,
          total: mockProgramListItems.length,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/programs`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await programApi.listPrograms({ page: 1, limit: 2 });

      expect(result).toEqual(mockResponse);
      expect(capturedParams).not.toBeNull();
      expect(capturedParams!.get('page')).toBe('1');
      expect(capturedParams!.get('limit')).toBe('2');
    });

    it('should fetch programs with search filter', async () => {
      const filteredPrograms = mockProgramListItems.filter((p) =>
        p.name.toLowerCase().includes('business')
      );

      const mockResponse: ProgramsListResponse = {
        programs: filteredPrograms,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredPrograms.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/programs`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await programApi.listPrograms({
        search: 'business',
      });

      expect(result.programs).toHaveLength(filteredPrograms.length);
    });

    it('should fetch programs with department filter', async () => {
      const filteredPrograms = mockProgramListItems.filter(
        (p) => p.department.id === 'dept-2'
      );

      const mockResponse: ProgramsListResponse = {
        programs: filteredPrograms,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredPrograms.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/programs`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await programApi.listPrograms({
        department: 'dept-2',
      });

      expect(result.programs).toHaveLength(filteredPrograms.length);
      expect(result.programs.every((p) => p.department.id === 'dept-2')).toBe(
        true
      );
    });

    it('should fetch programs with status filter', async () => {
      const filteredPrograms = mockProgramListItems.filter(
        (p) => p.status === 'active'
      );

      const mockResponse: ProgramsListResponse = {
        programs: filteredPrograms,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredPrograms.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/programs`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await programApi.listPrograms({
        status: 'active',
      });

      expect(result.programs).toHaveLength(filteredPrograms.length);
      expect(result.programs.every((p) => p.status === 'active')).toBe(true);
    });

    it('should handle empty program list', async () => {
      const mockResponse: ProgramsListResponse = {
        programs: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/programs`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await programApi.listPrograms();

      expect(result.programs).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it('should handle API error', async () => {
      server.use(
        http.get(`${baseUrl}/programs`, () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      await expect(programApi.listPrograms()).rejects.toThrow();
    });
  });

  describe('getProgram', () => {
    it('should fetch single program by ID', async () => {
      const programId = 'program-1';

      server.use(
        http.get(`${baseUrl}/programs/${programId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockFullProgram,
          });
        })
      );

      const result = await programApi.getProgram(programId);

      expect(result).toEqual(mockFullProgram);
      expect(result.id).toBe(programId);
    });

    it('should handle program not found error', async () => {
      const programId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/programs/${programId}`, () => {
          return HttpResponse.json(
            { message: 'Program not found' },
            { status: 404 }
          );
        })
      );

      await expect(programApi.getProgram(programId)).rejects.toThrow();
    });

    it('should handle unauthorized access', async () => {
      const programId = 'program-1';

      server.use(
        http.get(`${baseUrl}/programs/${programId}`, () => {
          return HttpResponse.json(
            { message: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      await expect(programApi.getProgram(programId)).rejects.toThrow();
    });
  });

  describe('createProgram', () => {
    it('should create new program', async () => {
      const newProgram = createMockProgram({
        name: mockCreateProgramPayload.name,
        code: mockCreateProgramPayload.code,
        description: mockCreateProgramPayload.description,
      });

      let capturedRequestBody: any = null;

      server.use(
        http.post(`${baseUrl}/programs`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json(
            {
              success: true,
              data: newProgram,
            },
            { status: 201 }
          );
        })
      );

      const result = await programApi.createProgram(mockCreateProgramPayload);

      expect(result).toEqual(newProgram);
      expect(capturedRequestBody).toMatchObject({
        name: mockCreateProgramPayload.name,
        code: mockCreateProgramPayload.code,
        department: mockCreateProgramPayload.department,
        credential: mockCreateProgramPayload.credential,
      });
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        ...mockCreateProgramPayload,
        code: 'invalid code with spaces',
      };

      server.use(
        http.post(`${baseUrl}/programs`, () => {
          return HttpResponse.json(
            {
              message: 'Validation failed',
              errors: {
                code: ['Code must contain only uppercase letters, numbers, and hyphens'],
              },
            },
            { status: 400 }
          );
        })
      );

      await expect(programApi.createProgram(invalidData)).rejects.toThrow();
    });

    it('should handle duplicate code error', async () => {
      server.use(
        http.post(`${baseUrl}/programs`, () => {
          return HttpResponse.json(
            { message: 'Program code already exists' },
            { status: 409 }
          );
        })
      );

      await expect(
        programApi.createProgram(mockCreateProgramPayload)
      ).rejects.toThrow();
    });

    it('should create program with minimal required fields', async () => {
      const minimalPayload = {
        name: 'Minimal Program',
        code: 'MIN-001',
        department: 'dept-1',
        credential: 'certificate' as const,
        duration: 1,
        durationUnit: 'months' as const,
      };

      const newProgram = createMockProgram({
        name: minimalPayload.name,
        code: minimalPayload.code,
        department: { id: 'dept-1', name: 'Test Department', code: 'TD' },
        credential: minimalPayload.credential,
        duration: minimalPayload.duration,
        durationUnit: minimalPayload.durationUnit,
      });

      server.use(
        http.post(`${baseUrl}/programs`, () => {
          return HttpResponse.json(
            {
              success: true,
              data: newProgram,
            },
            { status: 201 }
          );
        })
      );

      const result = await programApi.createProgram(minimalPayload);

      expect(result).toEqual(newProgram);
    });
  });

  describe('updateProgram', () => {
    it('should update existing program', async () => {
      const programId = 'program-1';
      const updatedProgram = {
        ...mockFullProgram,
        ...mockUpdateProgramPayload,
      };

      let capturedRequestBody: any = null;

      server.use(
        http.put(`${baseUrl}/programs/${programId}`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json({
            success: true,
            data: updatedProgram,
          });
        })
      );

      const result = await programApi.updateProgram(
        programId,
        mockUpdateProgramPayload
      );

      expect(result).toEqual(updatedProgram);
      expect(capturedRequestBody).toEqual(mockUpdateProgramPayload);
    });

    it('should handle partial updates', async () => {
      const programId = 'program-1';
      const partialUpdate = { name: 'Updated Name' };
      const updatedProgram = { ...mockFullProgram, name: 'Updated Name' };

      server.use(
        http.put(`${baseUrl}/programs/${programId}`, () => {
          return HttpResponse.json({
            success: true,
            data: updatedProgram,
          });
        })
      );

      const result = await programApi.updateProgram(programId, partialUpdate);

      expect(result.name).toBe('Updated Name');
    });

    it('should handle program not found error', async () => {
      const programId = 'non-existent';

      server.use(
        http.put(`${baseUrl}/programs/${programId}`, () => {
          return HttpResponse.json(
            { message: 'Program not found' },
            { status: 404 }
          );
        })
      );

      await expect(
        programApi.updateProgram(programId, mockUpdateProgramPayload)
      ).rejects.toThrow();
    });

    it('should handle validation errors on update', async () => {
      const programId = 'program-1';

      server.use(
        http.put(`${baseUrl}/programs/${programId}`, () => {
          return HttpResponse.json(
            {
              message: 'Validation failed',
              errors: {
                duration: ['Duration must be greater than 0'],
              },
            },
            { status: 400 }
          );
        })
      );

      await expect(
        programApi.updateProgram(programId, { duration: 0 })
      ).rejects.toThrow();
    });
  });

  describe('deleteProgram', () => {
    it('should delete program by ID', async () => {
      const programId = 'program-1';
      let deleteCalled = false;

      server.use(
        http.delete(`${baseUrl}/programs/${programId}`, () => {
          deleteCalled = true;
          return HttpResponse.json({}, { status: 204 });
        })
      );

      await programApi.deleteProgram(programId);

      expect(deleteCalled).toBe(true);
    });

    it('should handle program not found error', async () => {
      const programId = 'non-existent';

      server.use(
        http.delete(`${baseUrl}/programs/${programId}`, () => {
          return HttpResponse.json(
            { message: 'Program not found' },
            { status: 404 }
          );
        })
      );

      await expect(programApi.deleteProgram(programId)).rejects.toThrow();
    });

    it('should handle forbidden deletion', async () => {
      const programId = 'program-1';

      server.use(
        http.delete(`${baseUrl}/programs/${programId}`, () => {
          return HttpResponse.json(
            { message: 'Cannot delete program with active enrollments' },
            { status: 403 }
          );
        })
      );

      await expect(programApi.deleteProgram(programId)).rejects.toThrow();
    });
  });

  describe('publishProgram', () => {
    it('should publish program', async () => {
      const programId = 'program-1';
      const publishedProgram = { ...mockFullProgram, isPublished: true };

      server.use(
        http.put(`${baseUrl}/programs/${programId}`, async ({ request }) => {
          const body = await request.json() as any;
          expect(body.isPublished).toBe(true);
          return HttpResponse.json({
            success: true,
            data: publishedProgram,
          });
        })
      );

      const result = await programApi.publishProgram(programId);

      expect(result.isPublished).toBe(true);
    });

    it('should handle publish error', async () => {
      const programId = 'program-1';

      server.use(
        http.put(`${baseUrl}/programs/${programId}`, () => {
          return HttpResponse.json(
            { message: 'Cannot publish program without courses' },
            { status: 400 }
          );
        })
      );

      await expect(programApi.publishProgram(programId)).rejects.toThrow();
    });
  });

  describe('unpublishProgram', () => {
    it('should unpublish program', async () => {
      const programId = 'program-1';
      const unpublishedProgram = { ...mockFullProgram, isPublished: false };

      server.use(
        http.put(`${baseUrl}/programs/${programId}`, async ({ request }) => {
          const body = await request.json() as any;
          expect(body.isPublished).toBe(false);
          return HttpResponse.json({
            success: true,
            data: unpublishedProgram,
          });
        })
      );

      const result = await programApi.unpublishProgram(programId);

      expect(result.isPublished).toBe(false);
    });

    it('should handle unpublish error', async () => {
      const programId = 'program-1';

      server.use(
        http.put(`${baseUrl}/programs/${programId}`, () => {
          return HttpResponse.json(
            { message: 'Program not found' },
            { status: 404 }
          );
        })
      );

      await expect(programApi.unpublishProgram(programId)).rejects.toThrow();
    });
  });

  describe('duplicateProgram', () => {
    it('should duplicate program', async () => {
      const programId = 'program-1';
      const duplicatedProgram = createMockProgram({
        name: `${mockFullProgram.name} (Copy)`,
        code: `${mockFullProgram.code}-COPY`,
        isPublished: false,
      });

      server.use(
        http.get(`${baseUrl}/programs/${programId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockFullProgram,
          });
        }),
        http.post(`${baseUrl}/programs`, async ({ request }) => {
          const body = await request.json() as any;
          expect(body.name).toContain('(Copy)');
          expect(body.code).toContain('COPY');
          expect(body.isPublished).toBe(false);
          return HttpResponse.json(
            {
              success: true,
              data: duplicatedProgram,
            },
            { status: 201 }
          );
        })
      );

      const result = await programApi.duplicateProgram(programId);

      expect(result.name).toContain('(Copy)');
      expect(result.code).toContain('COPY');
      expect(result.isPublished).toBe(false);
    });

    it('should handle duplicate error when original not found', async () => {
      const programId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/programs/${programId}`, () => {
          return HttpResponse.json(
            { message: 'Program not found' },
            { status: 404 }
          );
        })
      );

      await expect(programApi.duplicateProgram(programId)).rejects.toThrow();
    });

    it('should handle duplicate creation failure', async () => {
      const programId = 'program-1';

      server.use(
        http.get(`${baseUrl}/programs/${programId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockFullProgram,
          });
        }),
        http.post(`${baseUrl}/programs`, () => {
          return HttpResponse.json(
            { message: 'Failed to create duplicate' },
            { status: 500 }
          );
        })
      );

      await expect(programApi.duplicateProgram(programId)).rejects.toThrow();
    });
  });

  describe('getProgramLevels', () => {
    it('should fetch all levels for a program', async () => {
      const programId = 'program-1';
      const mockResponse: ProgramLevelsResponse = {
        programId,
        programName: mockFullProgram.name,
        levels: mockProgramLevelDetails,
      };

      server.use(
        http.get(`${baseUrl}/programs/${programId}/levels`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await programApi.getProgramLevels(programId);

      expect(result).toEqual(mockResponse);
      expect(result.levels).toHaveLength(mockProgramLevelDetails.length);
      expect(result.programId).toBe(programId);
    });

    it('should handle empty levels list', async () => {
      const programId = 'program-3';
      const mockResponse: ProgramLevelsResponse = {
        programId,
        programName: 'Test Program',
        levels: [],
      };

      server.use(
        http.get(`${baseUrl}/programs/${programId}/levels`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await programApi.getProgramLevels(programId);

      expect(result.levels).toHaveLength(0);
    });

    it('should handle program not found error', async () => {
      const programId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/programs/${programId}/levels`, () => {
          return HttpResponse.json(
            { message: 'Program not found' },
            { status: 404 }
          );
        })
      );

      await expect(programApi.getProgramLevels(programId)).rejects.toThrow();
    });
  });

  describe('getProgramEnrollments', () => {
    it('should fetch all enrollments for a program', async () => {
      const programId = 'program-1';
      const mockResponse: ProgramEnrollmentsResponse = {
        programId,
        programName: mockFullProgram.name,
        enrollments: mockProgramEnrollments,
        pagination: {
          page: 1,
          limit: 20,
          total: mockProgramEnrollments.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/programs/${programId}/enrollments`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await programApi.getProgramEnrollments(programId);

      expect(result).toEqual(mockResponse);
      expect(result.enrollments).toHaveLength(mockProgramEnrollments.length);
      expect(result.programId).toBe(programId);
    });

    it('should fetch enrollments with pagination', async () => {
      const programId = 'program-1';
      const mockResponse: ProgramEnrollmentsResponse = {
        programId,
        programName: mockFullProgram.name,
        enrollments: mockProgramEnrollments.slice(0, 2),
        pagination: {
          page: 1,
          limit: 2,
          total: mockProgramEnrollments.length,
          totalPages: 2,
          hasNext: true,
          hasPrev: false,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(
          `${baseUrl}/programs/${programId}/enrollments`,
          ({ request }) => {
            capturedParams = new URL(request.url).searchParams;
            return HttpResponse.json({
              success: true,
              data: mockResponse,
            });
          }
        )
      );

      const result = await programApi.getProgramEnrollments(programId, {
        page: 1,
        limit: 2,
      });

      expect(result.enrollments).toHaveLength(2);
      expect(capturedParams).not.toBeNull();
      expect(capturedParams!.get('page')).toBe('1');
      expect(capturedParams!.get('limit')).toBe('2');
    });

    it('should fetch enrollments with status filter', async () => {
      const programId = 'program-1';
      const filteredEnrollments = mockProgramEnrollments.filter(
        (e) => e.status === 'active'
      );

      const mockResponse: ProgramEnrollmentsResponse = {
        programId,
        programName: mockFullProgram.name,
        enrollments: filteredEnrollments,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredEnrollments.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/programs/${programId}/enrollments`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await programApi.getProgramEnrollments(programId, {
        status: 'active',
      });

      expect(result.enrollments).toHaveLength(filteredEnrollments.length);
      expect(result.enrollments.every((e) => e.status === 'active')).toBe(true);
    });

    it('should handle empty enrollments list', async () => {
      const programId = 'program-3';
      const mockResponse: ProgramEnrollmentsResponse = {
        programId,
        programName: 'Test Program',
        enrollments: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/programs/${programId}/enrollments`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await programApi.getProgramEnrollments(programId);

      expect(result.enrollments).toHaveLength(0);
    });

    it('should handle program not found error', async () => {
      const programId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/programs/${programId}/enrollments`, () => {
          return HttpResponse.json(
            { message: 'Program not found' },
            { status: 404 }
          );
        })
      );

      await expect(
        programApi.getProgramEnrollments(programId)
      ).rejects.toThrow();
    });
  });
});
