/**
 * Tests for Demographics API Client
 * TDD RED Phase - Tests written before implementation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import {
  demographicsApi,
  type DemographicsApiResponse,
} from '../demographicsApi';
import {
  mockDemographicsComplete,
  mockDemographicsMinimal,
  mockDemographicsResponse,
} from '@/test/fixtures/person.fixtures';
import type { IDemographicsUpdateRequest } from '@/shared/types/person';

describe('demographicsApi', () => {
  const baseUrl = env.apiFullUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('getMyDemographics', () => {
    it('should fetch current user demographics data', async () => {
      server.use(
        http.get(`${baseUrl}/users/me/demographics`, () => {
          return HttpResponse.json(mockDemographicsResponse);
        })
      );

      const result = await demographicsApi.getMyDemographics();

      expect(result.success).toBe(true);
      expect(result.data.legalGender).toBe(mockDemographicsComplete.legalGender);
      expect(result.data.race).toEqual(mockDemographicsComplete.race);
      expect(result.data.citizenship).toBe(mockDemographicsComplete.citizenship);
    });

    it('should handle minimal demographics data', async () => {
      const minimalResponse = {
        success: true,
        data: mockDemographicsMinimal,
      };

      server.use(
        http.get(`${baseUrl}/users/me/demographics`, () => {
          return HttpResponse.json(minimalResponse);
        })
      );

      const result = await demographicsApi.getMyDemographics();

      expect(result.success).toBe(true);
      expect(result.data.legalGender).toBeNull();
      expect(result.data.race).toBeNull();
      expect(result.data.allowReporting).toBe(false);
    });

    it('should handle optional consent fields', async () => {
      const response = {
        success: true,
        data: {
          ...mockDemographicsMinimal,
          allowReporting: true,
          allowResearch: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/users/me/demographics`, () => {
          return HttpResponse.json(response);
        })
      );

      const result = await demographicsApi.getMyDemographics();

      expect(result.data.allowReporting).toBe(true);
      expect(result.data.allowResearch).toBe(false);
    });

    it('should handle 401 unauthorized error', async () => {
      server.use(
        http.get(`${baseUrl}/users/me/demographics`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Invalid or expired token',
              code: 'UNAUTHORIZED',
            },
            { status: 401 }
          );
        })
      );

      await expect(demographicsApi.getMyDemographics()).rejects.toThrow();
    });

    it('should handle 404 demographics not found', async () => {
      server.use(
        http.get(`${baseUrl}/users/me/demographics`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Demographics data not found',
              code: 'DEMOGRAPHICS_NOT_FOUND',
            },
            { status: 404 }
          );
        })
      );

      await expect(demographicsApi.getMyDemographics()).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      server.use(
        http.get(`${baseUrl}/users/me/demographics`, () => {
          return HttpResponse.error();
        })
      );

      await expect(demographicsApi.getMyDemographics()).rejects.toThrow();
    });
  });

  describe('updateMyDemographics', () => {
    it('should update current user demographics data', async () => {
      const updateData: IDemographicsUpdateRequest = {
        legalGender: 'female',
        isHispanicLatino: false,
        race: ['asian', 'white'],
        citizenship: 'us-citizen',
        allowReporting: true,
        allowResearch: true,
      };

      const updatedResponse = {
        success: true,
        message: 'Demographics data updated successfully',
        data: {
          ...mockDemographicsComplete,
          ...updateData,
        },
      };

      let capturedRequestBody: any = null;

      server.use(
        http.put(`${baseUrl}/users/me/demographics`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json(updatedResponse);
        })
      );

      const result = await demographicsApi.updateMyDemographics(updateData);

      expect(result.success).toBe(true);
      expect(result.data.legalGender).toBe(updateData.legalGender);
      expect(result.data.race).toEqual(updateData.race);
      expect(capturedRequestBody).toEqual(updateData);
    });

    it('should handle partial updates', async () => {
      const updateData: IDemographicsUpdateRequest = {
        allowReporting: true,
      };

      const updatedResponse = {
        success: true,
        message: 'Demographics data updated successfully',
        data: {
          ...mockDemographicsMinimal,
          allowReporting: true,
        },
      };

      server.use(
        http.put(`${baseUrl}/users/me/demographics`, () => {
          return HttpResponse.json(updatedResponse);
        })
      );

      const result = await demographicsApi.updateMyDemographics(updateData);

      expect(result.success).toBe(true);
      expect(result.data.allowReporting).toBe(true);
    });

    it('should update veteran status', async () => {
      const updateData: IDemographicsUpdateRequest = {
        veteranStatus: 'veteran',
        militaryBranch: 'US Army',
        yearsOfService: 8,
        dischargeType: 'honorable',
      };

      const updatedResponse = {
        success: true,
        message: 'Demographics data updated successfully',
        data: {
          ...mockDemographicsComplete,
          ...updateData,
        },
      };

      server.use(
        http.put(`${baseUrl}/users/me/demographics`, () => {
          return HttpResponse.json(updatedResponse);
        })
      );

      const result = await demographicsApi.updateMyDemographics(updateData);

      expect(result.success).toBe(true);
      expect(result.data.veteranStatus).toBe('veteran');
      expect(result.data.militaryBranch).toBe('US Army');
    });

    it('should update disability information', async () => {
      const updateData: IDemographicsUpdateRequest = {
        hasDisability: true,
        disabilityType: ['physical', 'visual'],
        accommodationsRequired: true,
      };

      const updatedResponse = {
        success: true,
        message: 'Demographics data updated successfully',
        data: {
          ...mockDemographicsComplete,
          ...updateData,
        },
      };

      server.use(
        http.put(`${baseUrl}/users/me/demographics`, () => {
          return HttpResponse.json(updatedResponse);
        })
      );

      const result = await demographicsApi.updateMyDemographics(updateData);

      expect(result.success).toBe(true);
      expect(result.data.hasDisability).toBe(true);
      expect(result.data.disabilityType).toEqual(['physical', 'visual']);
    });

    it('should handle 400 validation errors', async () => {
      const invalidData: IDemographicsUpdateRequest = {
        race: ['invalid-race-category'] as any,
      };

      server.use(
        http.put(`${baseUrl}/users/me/demographics`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Validation failed',
              code: 'VALIDATION_ERROR',
              errors: {
                race: ['Invalid race category'],
              },
            },
            { status: 400 }
          );
        })
      );

      await expect(demographicsApi.updateMyDemographics(invalidData)).rejects.toThrow();
    });

    it('should handle 401 unauthorized error', async () => {
      const updateData: IDemographicsUpdateRequest = { allowReporting: true };

      server.use(
        http.put(`${baseUrl}/users/me/demographics`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Invalid or expired token',
              code: 'UNAUTHORIZED',
            },
            { status: 401 }
          );
        })
      );

      await expect(demographicsApi.updateMyDemographics(updateData)).rejects.toThrow();
    });

    it('should handle empty update object', async () => {
      const updateData: IDemographicsUpdateRequest = {};

      const response = {
        success: true,
        message: 'Demographics data updated successfully',
        data: mockDemographicsComplete,
      };

      server.use(
        http.put(`${baseUrl}/users/me/demographics`, () => {
          return HttpResponse.json(response);
        })
      );

      const result = await demographicsApi.updateMyDemographics(updateData);

      expect(result.success).toBe(true);
    });

    it('should update consent fields separately', async () => {
      const updateData: IDemographicsUpdateRequest = {
        allowReporting: true,
        allowResearch: false,
      };

      const updatedResponse = {
        success: true,
        message: 'Demographics data updated successfully',
        data: {
          ...mockDemographicsComplete,
          allowReporting: true,
          allowResearch: false,
        },
      };

      server.use(
        http.put(`${baseUrl}/users/me/demographics`, () => {
          return HttpResponse.json(updatedResponse);
        })
      );

      const result = await demographicsApi.updateMyDemographics(updateData);

      expect(result.success).toBe(true);
      expect(result.data.allowReporting).toBe(true);
      expect(result.data.allowResearch).toBe(false);
    });

    it('should handle prefer-not-to-say values', async () => {
      const updateData: IDemographicsUpdateRequest = {
        legalGender: 'prefer-not-to-say',
        veteranStatus: 'prefer-not-to-say',
        citizenship: 'prefer-not-to-say',
      };

      const updatedResponse = {
        success: true,
        message: 'Demographics data updated successfully',
        data: {
          ...mockDemographicsComplete,
          ...updateData,
        },
      };

      server.use(
        http.put(`${baseUrl}/users/me/demographics`, () => {
          return HttpResponse.json(updatedResponse);
        })
      );

      const result = await demographicsApi.updateMyDemographics(updateData);

      expect(result.success).toBe(true);
      expect(result.data.legalGender).toBe('prefer-not-to-say');
    });
  });
});
