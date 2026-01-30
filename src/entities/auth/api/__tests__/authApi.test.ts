/**
 * Tests for Authentication API
 * Testing switchDepartment function for V2 contract alignment
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { switchDepartment } from '../authApi';
import type { SwitchDepartmentResponse, SwitchDepartmentRequest } from '@/shared/types/auth';

describe('authApi - switchDepartment', () => {
  const baseUrl = env.apiFullUrl;
  const endpoint = `${baseUrl}/auth/switch-department`;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('Successful department switch', () => {
    it('should switch department and return department context with direct membership', async () => {
      const request: SwitchDepartmentRequest = {
        departmentId: 'dept-123',
      };

      const mockResponse: SwitchDepartmentResponse = {
        success: true,
        data: {
          currentDepartment: {
            departmentId: 'dept-123',
            departmentName: 'Cognitive Therapy',
            departmentSlug: 'cognitive-therapy',
            roles: ['instructor', 'content-admin'],
            accessRights: [
              'content:courses:read',
              'content:courses:manage',
              'grades:own-classes:manage',
            ],
          },
          childDepartments: [
            {
              departmentId: 'dept-456',
              departmentName: 'CBT Advanced',
              roles: ['instructor', 'content-admin'],
            },
            {
              departmentId: 'dept-789',
              departmentName: 'CBT Fundamentals',
              roles: ['instructor'],
            },
          ],
          isDirectMember: true,
          inheritedFrom: null,
        },
      };

      let capturedRequestBody: any = null;

      server.use(
        http.post(endpoint, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await switchDepartment(request);

      expect(result).toEqual(mockResponse);
      expect(capturedRequestBody).toEqual(request);
      expect(result.data.currentDepartment.departmentId).toBe('dept-123');
      expect(result.data.currentDepartment.roles).toHaveLength(2);
      expect(result.data.currentDepartment.accessRights).toHaveLength(3);
      expect(result.data.isDirectMember).toBe(true);
      expect(result.data.childDepartments).toHaveLength(2);
    });

    it('should switch to department with inherited membership from parent', async () => {
      const request: SwitchDepartmentRequest = {
        departmentId: 'dept-child-1',
      };

      const mockResponse: SwitchDepartmentResponse = {
        success: true,
        data: {
          currentDepartment: {
            departmentId: 'dept-child-1',
            departmentName: 'CBT Advanced',
            departmentSlug: 'cbt-advanced',
            roles: ['instructor'],
            accessRights: ['content:courses:read', 'grades:own-classes:manage'],
          },
          childDepartments: [],
          isDirectMember: false,
          inheritedFrom: 'dept-parent-1',
        },
      };

      server.use(
        http.post(endpoint, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await switchDepartment(request);

      expect(result).toEqual(mockResponse);
      expect(result.data.isDirectMember).toBe(false);
      expect(result.data.inheritedFrom).toBe('dept-parent-1');
    });

    it('should switch to department with no child departments', async () => {
      const request: SwitchDepartmentRequest = {
        departmentId: 'dept-solo-1',
      };

      const mockResponse: SwitchDepartmentResponse = {
        success: true,
        data: {
          currentDepartment: {
            departmentId: 'dept-solo-1',
            departmentName: 'Standalone Department',
            departmentSlug: 'standalone',
            roles: ['instructor'],
            accessRights: ['content:courses:read'],
          },
          childDepartments: [],
          isDirectMember: true,
          inheritedFrom: null,
        },
      };

      server.use(
        http.post(endpoint, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await switchDepartment(request);

      expect(result).toEqual(mockResponse);
      expect(result.data.childDepartments).toHaveLength(0);
    });

    it('should switch to department with multiple roles', async () => {
      const request: SwitchDepartmentRequest = {
        departmentId: 'dept-multi-role',
      };

      const mockResponse: SwitchDepartmentResponse = {
        success: true,
        data: {
          currentDepartment: {
            departmentId: 'dept-multi-role',
            departmentName: 'Psychology Department',
            departmentSlug: 'psychology',
            roles: ['instructor', 'department-admin', 'content-admin', 'billing-admin'],
            accessRights: [
              'content:courses:read',
              'content:courses:manage',
              'staff:department:manage',
              'learner:department:manage',
              'billing:department:read',
            ],
          },
          childDepartments: [],
          isDirectMember: true,
          inheritedFrom: null,
        },
      };

      server.use(
        http.post(endpoint, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await switchDepartment(request);

      expect(result.data.currentDepartment.roles).toHaveLength(4);
      expect(result.data.currentDepartment.roles).toContain('instructor');
      expect(result.data.currentDepartment.roles).toContain('department-admin');
      expect(result.data.currentDepartment.accessRights).toHaveLength(5);
    });
  });

  describe('Error handling', () => {
    it('should handle 401 UNAUTHORIZED - invalid or expired token', async () => {
      const request: SwitchDepartmentRequest = {
        departmentId: 'dept-123',
      };

      server.use(
        http.post(endpoint, () => {
          return HttpResponse.json(
            {
              success: false,
              code: 'UNAUTHORIZED',
              message: 'Invalid or expired token',
            },
            { status: 401 }
          );
        })
      );

      await expect(switchDepartment(request)).rejects.toThrow();
    });

    it('should handle 403 NOT_A_MEMBER - user not a member of department', async () => {
      const request: SwitchDepartmentRequest = {
        departmentId: 'dept-unauthorized',
      };

      server.use(
        http.post(endpoint, () => {
          return HttpResponse.json(
            {
              success: false,
              code: 'NOT_A_MEMBER',
              message: 'User is not a member of this department',
            },
            { status: 403 }
          );
        })
      );

      await expect(switchDepartment(request)).rejects.toThrow();
    });

    it('should handle 404 DEPARTMENT_NOT_FOUND - department does not exist', async () => {
      const request: SwitchDepartmentRequest = {
        departmentId: 'dept-nonexistent',
      };

      server.use(
        http.post(endpoint, () => {
          return HttpResponse.json(
            {
              success: false,
              code: 'DEPARTMENT_NOT_FOUND',
              message: 'Department not found',
            },
            { status: 404 }
          );
        })
      );

      await expect(switchDepartment(request)).rejects.toThrow();
    });

    it('should handle 500 internal server error', async () => {
      const request: SwitchDepartmentRequest = {
        departmentId: 'dept-123',
      };

      server.use(
        http.post(endpoint, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Internal server error',
            },
            { status: 500 }
          );
        })
      );

      await expect(switchDepartment(request)).rejects.toThrow();
    });

    it('should handle network error', async () => {
      const request: SwitchDepartmentRequest = {
        departmentId: 'dept-123',
      };

      server.use(
        http.post(endpoint, () => {
          return HttpResponse.error();
        })
      );

      await expect(switchDepartment(request)).rejects.toThrow();
    });
  });

  describe('Request validation', () => {
    it('should send correct departmentId in request body', async () => {
      const departmentId = 'dept-validation-test';
      const request: SwitchDepartmentRequest = { departmentId };

      let capturedBody: any = null;

      const mockResponse: SwitchDepartmentResponse = {
        success: true,
        data: {
          currentDepartment: {
            departmentId,
            departmentName: 'Test Department',
            departmentSlug: 'test',
            roles: ['instructor'],
            accessRights: ['content:courses:read'],
          },
          childDepartments: [],
          isDirectMember: true,
          inheritedFrom: null,
        },
      };

      server.use(
        http.post(endpoint, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json(mockResponse);
        })
      );

      await switchDepartment(request);

      expect(capturedBody).toEqual({ departmentId });
      expect(capturedBody.departmentId).toBe(departmentId);
    });

    it('should use POST method', async () => {
      const request: SwitchDepartmentRequest = {
        departmentId: 'dept-123',
      };

      let methodUsed = '';

      const mockResponse: SwitchDepartmentResponse = {
        success: true,
        data: {
          currentDepartment: {
            departmentId: 'dept-123',
            departmentName: 'Test',
            departmentSlug: 'test',
            roles: [],
            accessRights: [],
          },
          childDepartments: [],
          isDirectMember: true,
          inheritedFrom: null,
        },
      };

      server.use(
        http.post(endpoint, ({ request }) => {
          methodUsed = request.method;
          return HttpResponse.json(mockResponse);
        })
      );

      await switchDepartment(request);

      expect(methodUsed).toBe('POST');
    });
  });

  describe('Response structure validation', () => {
    it('should return response matching SwitchDepartmentResponse interface', async () => {
      const request: SwitchDepartmentRequest = {
        departmentId: 'dept-structure-test',
      };

      const mockResponse: SwitchDepartmentResponse = {
        success: true,
        data: {
          currentDepartment: {
            departmentId: 'dept-structure-test',
            departmentName: 'Structure Test Department',
            departmentSlug: 'structure-test',
            roles: ['instructor'],
            accessRights: ['content:courses:read'],
          },
          childDepartments: [],
          isDirectMember: true,
          inheritedFrom: null,
        },
      };

      server.use(
        http.post(endpoint, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await switchDepartment(request);

      // Verify response structure
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('currentDepartment');
      expect(result.data).toHaveProperty('childDepartments');
      expect(result.data).toHaveProperty('isDirectMember');
      expect(result.data).toHaveProperty('inheritedFrom');

      // Verify currentDepartment structure
      expect(result.data.currentDepartment).toHaveProperty('departmentId');
      expect(result.data.currentDepartment).toHaveProperty('departmentName');
      expect(result.data.currentDepartment).toHaveProperty('departmentSlug');
      expect(result.data.currentDepartment).toHaveProperty('roles');
      expect(result.data.currentDepartment).toHaveProperty('accessRights');

      // Verify types
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.data.isDirectMember).toBe('boolean');
      expect(Array.isArray(result.data.currentDepartment.roles)).toBe(true);
      expect(Array.isArray(result.data.currentDepartment.accessRights)).toBe(true);
      expect(Array.isArray(result.data.childDepartments)).toBe(true);
    });

    it('should handle childDepartments with correct structure', async () => {
      const request: SwitchDepartmentRequest = {
        departmentId: 'dept-parent',
      };

      const mockResponse: SwitchDepartmentResponse = {
        success: true,
        data: {
          currentDepartment: {
            departmentId: 'dept-parent',
            departmentName: 'Parent Department',
            departmentSlug: 'parent',
            roles: ['department-admin'],
            accessRights: ['staff:department:manage'],
          },
          childDepartments: [
            {
              departmentId: 'child-1',
              departmentName: 'Child 1',
              roles: ['department-admin'],
            },
            {
              departmentId: 'child-2',
              departmentName: 'Child 2',
              roles: ['instructor'],
            },
          ],
          isDirectMember: true,
          inheritedFrom: null,
        },
      };

      server.use(
        http.post(endpoint, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await switchDepartment(request);

      expect(result.data.childDepartments).toHaveLength(2);

      // Verify child department structure
      result.data.childDepartments.forEach((child) => {
        expect(child).toHaveProperty('departmentId');
        expect(child).toHaveProperty('departmentName');
        expect(child).toHaveProperty('roles');
        expect(Array.isArray(child.roles)).toBe(true);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle department with empty roles array', async () => {
      const request: SwitchDepartmentRequest = {
        departmentId: 'dept-no-roles',
      };

      const mockResponse: SwitchDepartmentResponse = {
        success: true,
        data: {
          currentDepartment: {
            departmentId: 'dept-no-roles',
            departmentName: 'No Roles Department',
            departmentSlug: 'no-roles',
            roles: [],
            accessRights: [],
          },
          childDepartments: [],
          isDirectMember: true,
          inheritedFrom: null,
        },
      };

      server.use(
        http.post(endpoint, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await switchDepartment(request);

      expect(result.data.currentDepartment.roles).toHaveLength(0);
      expect(result.data.currentDepartment.accessRights).toHaveLength(0);
    });

    it('should handle department with empty accessRights but has roles', async () => {
      const request: SwitchDepartmentRequest = {
        departmentId: 'dept-roles-no-rights',
      };

      const mockResponse: SwitchDepartmentResponse = {
        success: true,
        data: {
          currentDepartment: {
            departmentId: 'dept-roles-no-rights',
            departmentName: 'Roles Without Rights',
            departmentSlug: 'roles-no-rights',
            roles: ['observer'],
            accessRights: [],
          },
          childDepartments: [],
          isDirectMember: true,
          inheritedFrom: null,
        },
      };

      server.use(
        http.post(endpoint, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await switchDepartment(request);

      expect(result.data.currentDepartment.roles).toHaveLength(1);
      expect(result.data.currentDepartment.accessRights).toHaveLength(0);
    });

    it('should handle department ID with special characters', async () => {
      const specialDeptId = 'dept-special_123-test.v2';
      const request: SwitchDepartmentRequest = {
        departmentId: specialDeptId,
      };

      const mockResponse: SwitchDepartmentResponse = {
        success: true,
        data: {
          currentDepartment: {
            departmentId: specialDeptId,
            departmentName: 'Special Characters Dept',
            departmentSlug: 'special-chars',
            roles: ['instructor'],
            accessRights: ['content:courses:read'],
          },
          childDepartments: [],
          isDirectMember: true,
          inheritedFrom: null,
        },
      };

      server.use(
        http.post(endpoint, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await switchDepartment(request);

      expect(result.data.currentDepartment.departmentId).toBe(specialDeptId);
    });
  });
});
