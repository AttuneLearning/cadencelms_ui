/**
 * Tests for Program Level API Client
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import {
  getProgramLevel,
  updateProgramLevel,
  deleteProgramLevel,
  reorderProgramLevel,
} from '../programLevelApi';
import {
  mockProgramLevel,
  mockProgramLevelWithCourses,
  mockMinimalProgramLevel,
  mockUpdateProgramLevelFormData,
  mockReorderedLevels,
} from '@/test/mocks/data/programLevels';

describe('programLevelApi', () => {
  const baseUrl = env.apiBaseUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('getProgramLevel', () => {
    it('should fetch program level by ID', async () => {
      const levelId = 'level-1';

      server.use(
        http.get(`${baseUrl}/program-levels/${levelId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockProgramLevel,
          });
        })
      );

      const result = await getProgramLevel(levelId);

      expect(result).toEqual(mockProgramLevel);
      expect(result.id).toBe(levelId);
      expect(result.program).toBeDefined();
      expect(result.courses).toHaveLength(6);
    });

    it('should fetch program level with courses', async () => {
      const levelId = 'level-2';

      server.use(
        http.get(`${baseUrl}/program-levels/${levelId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockProgramLevelWithCourses,
          });
        })
      );

      const result = await getProgramLevel(levelId);

      expect(result).toEqual(mockProgramLevelWithCourses);
      expect(result.courses).toHaveLength(8);
      expect(result.program.name).toBe('Bachelor of Science in Computer Science');
    });

    it('should fetch minimal program level without optional fields', async () => {
      const levelId = 'level-5';

      server.use(
        http.get(`${baseUrl}/program-levels/${levelId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockMinimalProgramLevel,
          });
        })
      );

      const result = await getProgramLevel(levelId);

      expect(result).toEqual(mockMinimalProgramLevel);
      expect(result.description).toBeNull();
      expect(result.requiredCredits).toBeNull();
      expect(result.courses).toHaveLength(0);
    });

    it('should handle program level not found error', async () => {
      const levelId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/program-levels/${levelId}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Program level not found',
            },
            { status: 404 }
          );
        })
      );

      await expect(getProgramLevel(levelId)).rejects.toThrow();
    });

    it('should handle forbidden access', async () => {
      const levelId = 'level-1';

      server.use(
        http.get(`${baseUrl}/program-levels/${levelId}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Forbidden',
            },
            { status: 403 }
          );
        })
      );

      await expect(getProgramLevel(levelId)).rejects.toThrow();
    });

    it('should handle server error', async () => {
      const levelId = 'level-1';

      server.use(
        http.get(`${baseUrl}/program-levels/${levelId}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Internal server error',
            },
            { status: 500 }
          );
        })
      );

      await expect(getProgramLevel(levelId)).rejects.toThrow();
    });
  });

  describe('updateProgramLevel', () => {
    it('should update program level', async () => {
      const levelId = 'level-1';
      const updatedLevel = {
        ...mockProgramLevel,
        ...mockUpdateProgramLevelFormData,
        updatedAt: new Date().toISOString(),
      };

      let capturedRequestBody: any = null;

      server.use(
        http.put(
          `${baseUrl}/program-levels/${levelId}`,
          async ({ request }) => {
            capturedRequestBody = await request.json();
            return HttpResponse.json({
              success: true,
              data: updatedLevel,
            });
          }
        )
      );

      const result = await updateProgramLevel(levelId, mockUpdateProgramLevelFormData);

      expect(result).toEqual(updatedLevel);
      expect(capturedRequestBody).toEqual(mockUpdateProgramLevelFormData);
      expect(result.name).toBe(mockUpdateProgramLevelFormData.name);
      expect(result.description).toBe(mockUpdateProgramLevelFormData.description);
    });

    it('should update with partial data', async () => {
      const levelId = 'level-1';
      const partialUpdate = { name: 'Updated Name' };
      const updatedLevel = {
        ...mockProgramLevel,
        name: 'Updated Name',
        updatedAt: new Date().toISOString(),
      };

      server.use(
        http.put(`${baseUrl}/program-levels/${levelId}`, () => {
          return HttpResponse.json({
            success: true,
            data: updatedLevel,
          });
        })
      );

      const result = await updateProgramLevel(levelId, partialUpdate);

      expect(result.name).toBe('Updated Name');
      expect(result.description).toBe(mockProgramLevel.description);
    });

    it('should update required credits', async () => {
      const levelId = 'level-1';
      const update = {
        name: mockProgramLevel.name,
        requiredCredits: 35,
      };
      const updatedLevel = {
        ...mockProgramLevel,
        requiredCredits: 35,
        updatedAt: new Date().toISOString(),
      };

      server.use(
        http.put(`${baseUrl}/program-levels/${levelId}`, () => {
          return HttpResponse.json({
            success: true,
            data: updatedLevel,
          });
        })
      );

      const result = await updateProgramLevel(levelId, update);

      expect(result.requiredCredits).toBe(35);
    });

    it('should handle validation errors', async () => {
      const levelId = 'level-1';
      const invalidData = {
        name: '', // Empty name should fail validation
      };

      server.use(
        http.put(`${baseUrl}/program-levels/${levelId}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Validation failed',
              errors: {
                name: ['Level name is required'],
              },
            },
            { status: 400 }
          );
        })
      );

      await expect(updateProgramLevel(levelId, invalidData)).rejects.toThrow();
    });

    it('should handle program level not found error', async () => {
      const levelId = 'non-existent';

      server.use(
        http.put(`${baseUrl}/program-levels/${levelId}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Program level not found',
            },
            { status: 404 }
          );
        })
      );

      await expect(
        updateProgramLevel(levelId, mockUpdateProgramLevelFormData)
      ).rejects.toThrow();
    });
  });

  describe('deleteProgramLevel', () => {
    it('should delete program level by ID', async () => {
      const levelId = 'level-1';
      let deleteCalled = false;

      server.use(
        http.delete(`${baseUrl}/program-levels/${levelId}`, () => {
          deleteCalled = true;
          return HttpResponse.json(
            {
              success: true,
            },
            { status: 204 }
          );
        })
      );

      await deleteProgramLevel(levelId);

      expect(deleteCalled).toBe(true);
    });

    it('should handle program level not found error', async () => {
      const levelId = 'non-existent';

      server.use(
        http.delete(`${baseUrl}/program-levels/${levelId}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Program level not found',
            },
            { status: 404 }
          );
        })
      );

      await expect(deleteProgramLevel(levelId)).rejects.toThrow();
    });

    it('should handle forbidden deletion when level has courses', async () => {
      const levelId = 'level-1';

      server.use(
        http.delete(`${baseUrl}/program-levels/${levelId}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Cannot delete level with associated courses',
            },
            { status: 403 }
          );
        })
      );

      await expect(deleteProgramLevel(levelId)).rejects.toThrow();
    });

    it('should handle server error during deletion', async () => {
      const levelId = 'level-1';

      server.use(
        http.delete(`${baseUrl}/program-levels/${levelId}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Internal server error',
            },
            { status: 500 }
          );
        })
      );

      await expect(deleteProgramLevel(levelId)).rejects.toThrow();
    });
  });

  describe('reorderProgramLevel', () => {
    it('should reorder program level within sequence', async () => {
      const levelId = 'level-2';
      const payload = { newOrder: 1 };

      let capturedRequestBody: any = null;

      server.use(
        http.patch(
          `${baseUrl}/program-levels/${levelId}/reorder`,
          async ({ request }) => {
            capturedRequestBody = await request.json();
            return HttpResponse.json({
              success: true,
              data: {
                updatedLevels: mockReorderedLevels,
              },
            });
          }
        )
      );

      const result = await reorderProgramLevel(levelId, payload);

      expect(result.updatedLevels).toEqual(mockReorderedLevels);
      expect(capturedRequestBody).toEqual(payload);
      expect(capturedRequestBody.newOrder).toBe(1);
    });

    it('should reorder level to higher position', async () => {
      const levelId = 'level-1';
      const payload = { newOrder: 3 };
      const reorderedLevels = [
        { id: 'level-2', name: 'Year 2: Core Concepts', order: 1 },
        { id: 'level-3', name: 'Year 3: Advanced Topics', order: 2 },
        { id: 'level-1', name: 'Year 1: Foundation', order: 3 },
      ];

      server.use(
        http.patch(`${baseUrl}/program-levels/${levelId}/reorder`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              updatedLevels: reorderedLevels,
            },
          });
        })
      );

      const result = await reorderProgramLevel(levelId, payload);

      expect(result.updatedLevels).toEqual(reorderedLevels);
      expect(result.updatedLevels[2].order).toBe(3);
    });

    it('should reorder level to lower position', async () => {
      const levelId = 'level-3';
      const payload = { newOrder: 1 };
      const reorderedLevels = [
        { id: 'level-3', name: 'Year 3: Advanced Topics', order: 1 },
        { id: 'level-1', name: 'Year 1: Foundation', order: 2 },
        { id: 'level-2', name: 'Year 2: Core Concepts', order: 3 },
      ];

      server.use(
        http.patch(`${baseUrl}/program-levels/${levelId}/reorder`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              updatedLevels: reorderedLevels,
            },
          });
        })
      );

      const result = await reorderProgramLevel(levelId, payload);

      expect(result.updatedLevels).toEqual(reorderedLevels);
      expect(result.updatedLevels[0].order).toBe(1);
    });

    it('should handle invalid order position', async () => {
      const levelId = 'level-1';
      const payload = { newOrder: -1 };

      server.use(
        http.patch(`${baseUrl}/program-levels/${levelId}/reorder`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Invalid order position',
            },
            { status: 400 }
          );
        })
      );

      await expect(reorderProgramLevel(levelId, payload)).rejects.toThrow();
    });

    it('should handle order position out of range', async () => {
      const levelId = 'level-1';
      const payload = { newOrder: 999 };

      server.use(
        http.patch(`${baseUrl}/program-levels/${levelId}/reorder`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Order position out of range',
            },
            { status: 400 }
          );
        })
      );

      await expect(reorderProgramLevel(levelId, payload)).rejects.toThrow();
    });

    it('should handle program level not found error', async () => {
      const levelId = 'non-existent';
      const payload = { newOrder: 1 };

      server.use(
        http.patch(`${baseUrl}/program-levels/${levelId}/reorder`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Program level not found',
            },
            { status: 404 }
          );
        })
      );

      await expect(reorderProgramLevel(levelId, payload)).rejects.toThrow();
    });

    it('should return multiple updated levels when reordering', async () => {
      const levelId = 'level-2';
      const payload = { newOrder: 1 };
      const reorderedLevels = [
        { id: 'level-2', name: 'Year 2: Core Concepts', order: 1 },
        { id: 'level-1', name: 'Year 1: Foundation', order: 2 },
        { id: 'level-3', name: 'Year 3: Advanced Topics', order: 3 },
        { id: 'level-4', name: 'Year 4: Capstone', order: 4 },
      ];

      server.use(
        http.patch(`${baseUrl}/program-levels/${levelId}/reorder`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              updatedLevels: reorderedLevels,
            },
          });
        })
      );

      const result = await reorderProgramLevel(levelId, payload);

      expect(result.updatedLevels).toHaveLength(4);
      expect(result.updatedLevels.every((level) => level.order > 0)).toBe(true);
    });
  });
});
