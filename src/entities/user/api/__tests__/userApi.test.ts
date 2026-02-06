/**
 * Tests for User API Client
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { userApi, type UserListResponse } from '../userApi';
import {
  mockUsers,
  mockFullUser,
  mockUserFormData,
  mockUpdateUserFormData,
  createMockUser
} from '@/test/mocks/data/users';

describe('userApi', () => {
  const baseUrl = env.apiFullUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('list', () => {
    it('should fetch paginated list of users without filters', async () => {
      const mockResponse: UserListResponse = {
        users: mockUsers,
        total: mockUsers.length,
        page: 1,
        pageSize: 20,
      };

      server.use(
        http.get(`${baseUrl}/users/staff`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await userApi.list();

      expect(result).toEqual(mockResponse);
      expect(result.users).toHaveLength(mockUsers.length);
    });

    it('should fetch paginated list with page and pageSize params', async () => {
      const mockResponse: UserListResponse = {
        users: mockUsers.slice(0, 2),
        total: mockUsers.length,
        page: 1,
        pageSize: 2,
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/users/staff`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await userApi.list({ page: 1, pageSize: 2 });

      expect(result).toEqual(mockResponse);
      expect(capturedParams).not.toBeNull();
      expect(capturedParams!.get('page')).toBe('1');
      expect(capturedParams!.get('pageSize')).toBe('2');
    });

    it('should fetch users with search filter', async () => {
      const filteredUsers = mockUsers.filter(u =>
        u.firstName.toLowerCase().includes('john')
      );

      const mockResponse: UserListResponse = {
        users: filteredUsers,
        total: filteredUsers.length,
        page: 1,
        pageSize: 20,
      };

      server.use(
        http.get(`${baseUrl}/users/staff`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await userApi.list({
        filters: { search: 'john' },
      });

      expect(result.users).toHaveLength(filteredUsers.length);
    });

    it('should fetch users with role filter', async () => {
      const filteredUsers = mockUsers.filter(u => u.userTypes?.includes('staff'));

      const mockResponse: UserListResponse = {
        users: filteredUsers,
        total: filteredUsers.length,
        page: 1,
        pageSize: 20,
      };

      server.use(
        http.get(`${baseUrl}/users/staff`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await userApi.list({
        filters: { role: 'staff' },
      });

      expect(result.users).toHaveLength(filteredUsers.length);
      expect(result.users.every(u => u.userTypes?.includes('staff'))).toBe(true);
    });

    it('should fetch users with status filter', async () => {
      const filteredUsers = mockUsers.filter(u => u.status === 'suspended');

      const mockResponse: UserListResponse = {
        users: filteredUsers,
        total: filteredUsers.length,
        page: 1,
        pageSize: 20,
      };

      server.use(
        http.get(`${baseUrl}/users/staff`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await userApi.list({
        filters: { status: 'suspended' },
      });

      expect(result.users).toHaveLength(filteredUsers.length);
      expect(result.users.every(u => u.status === 'suspended')).toBe(true);
    });

    it('should handle empty user list', async () => {
      const mockResponse: UserListResponse = {
        users: [],
        total: 0,
        page: 1,
        pageSize: 20,
      };

      server.use(
        http.get(`${baseUrl}/users/staff`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await userApi.list();

      expect(result.users).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle API error', async () => {
      server.use(
        http.get(`${baseUrl}/users/staff`, () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      await expect(userApi.list()).rejects.toThrow();
    });
  });

  describe('getById', () => {
    it('should fetch single user by ID', async () => {
      const userId = 'user-1';

      server.use(
        http.get(`${baseUrl}/users/staff/${userId}`, () => {
          return HttpResponse.json(mockFullUser);
        })
      );

      const result = await userApi.getById(userId);

      expect(result).toEqual(mockFullUser);
      expect(result._id).toBe(userId);
    });

    it('should handle user not found error', async () => {
      const userId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/users/staff/${userId}`, () => {
          return HttpResponse.json(
            { message: 'User not found' },
            { status: 404 }
          );
        })
      );

      await expect(userApi.getById(userId)).rejects.toThrow();
    });

    it('should handle unauthorized access', async () => {
      const userId = 'user-1';

      server.use(
        http.get(`${baseUrl}/users/staff/${userId}`, () => {
          return HttpResponse.json(
            { message: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      await expect(userApi.getById(userId)).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create new user', async () => {
      const newUser = createMockUser({
        email: mockUserFormData.email,
        firstName: mockUserFormData.firstName,
        lastName: mockUserFormData.lastName,
      });

      let capturedRequestBody: any = null;

      server.use(
        http.post(`${baseUrl}/users/staff`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json(newUser, { status: 201 });
        })
      );

      const result = await userApi.create(mockUserFormData);

      expect(result).toEqual(newUser);
      expect(capturedRequestBody).toMatchObject({
        email: mockUserFormData.email,
        firstName: mockUserFormData.firstName,
        lastName: mockUserFormData.lastName,
        roles: mockUserFormData.roles,
      });
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        ...mockUserFormData,
        email: 'invalid-email',
      };

      server.use(
        http.post(`${baseUrl}/users/staff`, () => {
          return HttpResponse.json(
            {
              message: 'Validation failed',
              errors: {
                email: ['Invalid email format'],
              },
            },
            { status: 400 }
          );
        })
      );

      await expect(userApi.create(invalidData)).rejects.toThrow();
    });

    it('should handle duplicate email error', async () => {
      server.use(
        http.post(`${baseUrl}/users/staff`, () => {
          return HttpResponse.json(
            { message: 'Email already exists' },
            { status: 409 }
          );
        })
      );

      await expect(userApi.create(mockUserFormData)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update existing user', async () => {
      const userId = 'user-1';
      const updatedUser = {
        ...mockFullUser,
        ...mockUpdateUserFormData,
      };

      let capturedRequestBody: any = null;

      server.use(
        http.put(`${baseUrl}/users/staff/${userId}`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json(updatedUser);
        })
      );

      const result = await userApi.update(userId, mockUpdateUserFormData);

      expect(result).toEqual(updatedUser);
      expect(capturedRequestBody).toEqual(mockUpdateUserFormData);
    });

    it('should handle partial updates', async () => {
      const userId = 'user-1';
      const partialUpdate = { firstName: 'Updated' };
      const updatedUser = { ...mockFullUser, firstName: 'Updated' };

      server.use(
        http.put(`${baseUrl}/users/staff/${userId}`, () => {
          return HttpResponse.json(updatedUser);
        })
      );

      const result = await userApi.update(userId, partialUpdate);

      expect(result.firstName).toBe('Updated');
    });

    it('should handle user not found error', async () => {
      const userId = 'non-existent';

      server.use(
        http.put(`${baseUrl}/users/staff/${userId}`, () => {
          return HttpResponse.json(
            { message: 'User not found' },
            { status: 404 }
          );
        })
      );

      await expect(userApi.update(userId, mockUpdateUserFormData)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete user by ID', async () => {
      const userId = 'user-1';
      let deleteCalled = false;

      server.use(
        http.delete(`${baseUrl}/users/staff/${userId}`, () => {
          deleteCalled = true;
          return HttpResponse.json({}, { status: 204 });
        })
      );

      await userApi.delete(userId);

      expect(deleteCalled).toBe(true);
    });

    it('should handle user not found error', async () => {
      const userId = 'non-existent';

      server.use(
        http.delete(`${baseUrl}/users/staff/${userId}`, () => {
          return HttpResponse.json(
            { message: 'User not found' },
            { status: 404 }
          );
        })
      );

      await expect(userApi.delete(userId)).rejects.toThrow();
    });

    it('should handle unauthorized deletion', async () => {
      const userId = 'user-1';

      server.use(
        http.delete(`${baseUrl}/users/staff/${userId}`, () => {
          return HttpResponse.json(
            { message: 'Forbidden: Cannot delete this user' },
            { status: 403 }
          );
        })
      );

      await expect(userApi.delete(userId)).rejects.toThrow();
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple users', async () => {
      const userIds = ['user-1', 'user-2', 'user-3'];
      let capturedRequestBody: any = null;

      server.use(
        http.post(`${baseUrl}/users/staff/bulk-delete`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json({}, { status: 204 });
        })
      );

      await userApi.bulkDelete(userIds);

      expect(capturedRequestBody).toEqual({ ids: userIds });
    });

    it('should handle empty array', async () => {
      let bulkDeleteCalled = false;

      server.use(
        http.post(`${baseUrl}/users/staff/bulk-delete`, async ({ request }) => {
          bulkDeleteCalled = true;
          const body = await request.json() as { ids: string[] };
          expect(body?.ids).toHaveLength(0);
          return HttpResponse.json({}, { status: 204 });
        })
      );

      await userApi.bulkDelete([]);

      expect(bulkDeleteCalled).toBe(true);
    });

    it('should handle partial failure', async () => {
      const userIds = ['user-1', 'non-existent'];

      server.use(
        http.post(`${baseUrl}/users/staff/bulk-delete`, () => {
          return HttpResponse.json(
            {
              message: 'Some users could not be deleted',
              failed: ['non-existent'],
            },
            { status: 207 }
          );
        })
      );

      // Should not throw - partial success is handled by backend
      await userApi.bulkDelete(userIds);
    });

    it('should handle server error', async () => {
      const userIds = ['user-1', 'user-2'];

      server.use(
        http.post(`${baseUrl}/users/staff/bulk-delete`, () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      await expect(userApi.bulkDelete(userIds)).rejects.toThrow();
    });
  });
});
