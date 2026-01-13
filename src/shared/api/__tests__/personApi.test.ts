/**
 * Tests for Person API Client
 * TDD RED Phase - Tests written before implementation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import {
  personApi,
  type PersonApiResponse,
  type PersonExtendedApiResponse,
} from '../personApi';
import {
  mockPersonWithAllFields,
  mockPersonMinimal,
  mockPersonResponse,
  mockPersonExtendedLearner,
  mockPersonExtendedStaff,
  mockPersonExtendedLearnerResponse,
  mockPersonExtendedStaffResponse,
} from '@/test/fixtures/person.fixtures';
import type { IPersonUpdateRequest } from '@/shared/types/person';

describe('personApi', () => {
  const baseUrl = env.apiBaseUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('getMyPerson', () => {
    it('should fetch current user person data', async () => {
      server.use(
        http.get(`${baseUrl}/api/v2/users/me/person`, () => {
          return HttpResponse.json(mockPersonResponse);
        })
      );

      const result = await personApi.getMyPerson();

      expect(result.success).toBe(true);
      expect(result.data.firstName).toBe(mockPersonWithAllFields.firstName);
      expect(result.data.lastName).toBe(mockPersonWithAllFields.lastName);
      expect(result.data.emails).toHaveLength(2);
      expect(result.data.phones).toHaveLength(2);
    });

    it('should handle minimal person data', async () => {
      const minimalResponse = {
        success: true,
        data: mockPersonMinimal,
      };

      server.use(
        http.get(`${baseUrl}/api/v2/users/me/person`, () => {
          return HttpResponse.json(minimalResponse);
        })
      );

      const result = await personApi.getMyPerson();

      expect(result.success).toBe(true);
      expect(result.data.emails).toHaveLength(1);
      expect(result.data.phones).toHaveLength(0);
    });

    it('should handle 401 unauthorized error', async () => {
      server.use(
        http.get(`${baseUrl}/api/v2/users/me/person`, () => {
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

      await expect(personApi.getMyPerson()).rejects.toThrow();
    });

    it('should handle 404 person not found error', async () => {
      server.use(
        http.get(`${baseUrl}/api/v2/users/me/person`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Person data not found for user',
              code: 'PERSON_NOT_FOUND',
            },
            { status: 404 }
          );
        })
      );

      await expect(personApi.getMyPerson()).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      server.use(
        http.get(`${baseUrl}/api/v2/users/me/person`, () => {
          return HttpResponse.error();
        })
      );

      await expect(personApi.getMyPerson()).rejects.toThrow();
    });
  });

  describe('updateMyPerson', () => {
    it('should update current user person data', async () => {
      const updateData: IPersonUpdateRequest = {
        preferredFirstName: 'Janey',
        pronouns: 'she/her',
        bio: 'Updated bio',
      };

      const updatedResponse = {
        success: true,
        message: 'Person data updated successfully',
        data: {
          ...mockPersonWithAllFields,
          ...updateData,
        },
      };

      let capturedRequestBody: any = null;

      server.use(
        http.put(`${baseUrl}/api/v2/users/me/person`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json(updatedResponse);
        })
      );

      const result = await personApi.updateMyPerson(updateData);

      expect(result.success).toBe(true);
      expect(result.data.preferredFirstName).toBe(updateData.preferredFirstName);
      expect(capturedRequestBody).toEqual(updateData);
    });

    it('should handle partial updates', async () => {
      const updateData: IPersonUpdateRequest = {
        bio: 'Just the bio update',
      };

      const updatedResponse = {
        success: true,
        message: 'Person data updated successfully',
        data: {
          ...mockPersonWithAllFields,
          bio: updateData.bio,
        },
      };

      server.use(
        http.put(`${baseUrl}/api/v2/users/me/person`, () => {
          return HttpResponse.json(updatedResponse);
        })
      );

      const result = await personApi.updateMyPerson(updateData);

      expect(result.success).toBe(true);
      expect(result.data.bio).toBe(updateData.bio);
    });

    it('should update communication preferences', async () => {
      const updateData: IPersonUpdateRequest = {
        communicationPreferences: {
          preferredMethod: 'sms',
          notificationFrequency: 'immediate',
        },
      };

      const updatedResponse = {
        success: true,
        message: 'Person data updated successfully',
        data: {
          ...mockPersonWithAllFields,
          communicationPreferences: {
            ...mockPersonWithAllFields.communicationPreferences,
            ...updateData.communicationPreferences,
          },
        },
      };

      server.use(
        http.put(`${baseUrl}/api/v2/users/me/person`, () => {
          return HttpResponse.json(updatedResponse);
        })
      );

      const result = await personApi.updateMyPerson(updateData);

      expect(result.success).toBe(true);
      expect(result.data.communicationPreferences.preferredMethod).toBe('sms');
    });

    it('should handle 400 validation errors', async () => {
      const invalidData: IPersonUpdateRequest = {
        firstName: '', // Invalid: empty string
      };

      server.use(
        http.put(`${baseUrl}/api/v2/users/me/person`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Validation failed',
              code: 'VALIDATION_ERROR',
              errors: {
                firstName: ['First name must be at least 1 character'],
              },
            },
            { status: 400 }
          );
        })
      );

      await expect(personApi.updateMyPerson(invalidData)).rejects.toThrow();
    });

    it('should handle 401 unauthorized error', async () => {
      const updateData: IPersonUpdateRequest = { bio: 'Test' };

      server.use(
        http.put(`${baseUrl}/api/v2/users/me/person`, () => {
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

      await expect(personApi.updateMyPerson(updateData)).rejects.toThrow();
    });

    it('should handle empty update object', async () => {
      const updateData: IPersonUpdateRequest = {};

      const response = {
        success: true,
        message: 'Person data updated successfully',
        data: mockPersonWithAllFields,
      };

      server.use(
        http.put(`${baseUrl}/api/v2/users/me/person`, () => {
          return HttpResponse.json(response);
        })
      );

      const result = await personApi.updateMyPerson(updateData);

      expect(result.success).toBe(true);
    });
  });

  describe('getMyPersonExtended', () => {
    it('should fetch learner extended person data', async () => {
      server.use(
        http.get(`${baseUrl}/api/v2/users/me/person/extended`, () => {
          return HttpResponse.json(mockPersonExtendedLearnerResponse);
        })
      );

      const result = await personApi.getMyPersonExtended();

      expect(result.success).toBe(true);
      expect(result.data.role).toBe('learner');
      if (result.data.role === 'learner') {
        expect(result.data.learner.studentId).toBe('STU123456');
        expect(result.data.learner.emergencyContacts).toHaveLength(1);
      }
    });

    it('should fetch staff extended person data', async () => {
      server.use(
        http.get(`${baseUrl}/api/v2/users/me/person/extended`, () => {
          return HttpResponse.json(mockPersonExtendedStaffResponse);
        })
      );

      const result = await personApi.getMyPersonExtended();

      expect(result.success).toBe(true);
      expect(result.data.role).toBe('staff');
      if (result.data.role === 'staff') {
        expect(result.data.staff.professionalTitle).toContain('Professor');
        expect(result.data.staff.publications).toHaveLength(1);
      }
    });

    it('should handle 401 unauthorized error', async () => {
      server.use(
        http.get(`${baseUrl}/api/v2/users/me/person/extended`, () => {
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

      await expect(personApi.getMyPersonExtended()).rejects.toThrow();
    });

    it('should handle 404 extended data not found', async () => {
      server.use(
        http.get(`${baseUrl}/api/v2/users/me/person/extended`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Extended person data not found',
              code: 'EXTENDED_DATA_NOT_FOUND',
            },
            { status: 404 }
          );
        })
      );

      await expect(personApi.getMyPersonExtended()).rejects.toThrow();
    });
  });

  describe('updateMyPersonExtended', () => {
    it('should update learner extended data', async () => {
      const updateData = {
        housingStatus: 'off-campus' as const,
        roomNumber: null,
        vehicleOnCampus: true,
        vehicleInfo: 'Toyota Camry, Plate: ABC123',
      };

      const updatedResponse = {
        success: true,
        message: 'Extended person data updated successfully',
        data: {
          role: 'learner' as const,
          learner: {
            ...mockPersonExtendedLearner.learner,
            ...updateData,
          },
        },
      };

      let capturedRequestBody: any = null;

      server.use(
        http.put(`${baseUrl}/api/v2/users/me/person/extended`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json(updatedResponse);
        })
      );

      const result = await personApi.updateMyPersonExtended(updateData);

      expect(result.success).toBe(true);
      expect(capturedRequestBody).toEqual(updateData);
      if (result.data.role === 'learner') {
        expect(result.data.learner.housingStatus).toBe('off-campus');
        expect(result.data.learner.vehicleOnCampus).toBe(true);
      }
    });

    it('should update staff extended data', async () => {
      const updateData = {
        headline: 'Updated research focus on quantum computing',
        researchInterests: ['Quantum Computing', 'Machine Learning', 'AI'],
      };

      const updatedResponse = {
        success: true,
        message: 'Extended person data updated successfully',
        data: {
          role: 'staff' as const,
          staff: {
            ...mockPersonExtendedStaff.staff,
            ...updateData,
          },
        },
      };

      server.use(
        http.put(`${baseUrl}/api/v2/users/me/person/extended`, () => {
          return HttpResponse.json(updatedResponse);
        })
      );

      const result = await personApi.updateMyPersonExtended(updateData);

      expect(result.success).toBe(true);
      if (result.data.role === 'staff') {
        expect(result.data.staff.headline).toBe(updateData.headline);
        expect(result.data.staff.researchInterests).toEqual(updateData.researchInterests);
      }
    });

    it('should handle 400 validation errors', async () => {
      const invalidData = {
        studentId: '', // Invalid if sent by user
      };

      server.use(
        http.put(`${baseUrl}/api/v2/users/me/person/extended`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Validation failed',
              code: 'VALIDATION_ERROR',
              errors: {
                studentId: ['Student ID cannot be updated by user'],
              },
            },
            { status: 400 }
          );
        })
      );

      await expect(personApi.updateMyPersonExtended(invalidData)).rejects.toThrow();
    });

    it('should handle 401 unauthorized error', async () => {
      const updateData = { bio: 'Test' };

      server.use(
        http.put(`${baseUrl}/api/v2/users/me/person/extended`, () => {
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

      await expect(personApi.updateMyPersonExtended(updateData)).rejects.toThrow();
    });
  });
});
