/**
 * Tests for API client with interceptors
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { client, ApiClientError } from './client';
import { env } from '@/shared/config/env';

describe('API Client', () => {
  const testEndpoint = '/test';
  const testUrl = `${env.apiBaseUrl}${testEndpoint}`;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('Request Interceptor', () => {
    it('should inject authorization token from localStorage', async () => {
      // Set up auth token in storage
      const mockToken = 'test-token-123';
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: { accessToken: mockToken },
        })
      );

      let capturedAuthHeader: string | undefined;

      server.use(
        http.get(testUrl, ({ request }) => {
          capturedAuthHeader = request.headers.get('Authorization') || undefined;
          return HttpResponse.json({ success: true });
        })
      );

      await client.get(testEndpoint);

      expect(capturedAuthHeader).toBe(`Bearer ${mockToken}`);
    });

    it('should not inject token if not present in storage', async () => {
      let capturedAuthHeader: string | null = null;

      server.use(
        http.get(testUrl, ({ request }) => {
          capturedAuthHeader = request.headers.get('Authorization');
          return HttpResponse.json({ success: true });
        })
      );

      await client.get(testEndpoint);

      expect(capturedAuthHeader).toBeNull();
    });

    it('should skip auth injection when X-Skip-Auth header is set', async () => {
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: { accessToken: 'test-token' },
        })
      );

      let capturedAuthHeader: string | null = null;

      server.use(
        http.get(testUrl, ({ request }) => {
          capturedAuthHeader = request.headers.get('Authorization');
          return HttpResponse.json({ success: true });
        })
      );

      await client.get(testEndpoint, {
        headers: { 'X-Skip-Auth': 'true' },
      });

      expect(capturedAuthHeader).toBeNull();
    });
  });

  describe('Response Interceptor - Error Handling', () => {
    it('should handle network errors', async () => {
      server.use(
        http.get(testUrl, () => {
          return HttpResponse.error();
        })
      );

      await expect(client.get(testEndpoint)).rejects.toThrow(ApiClientError);
      await expect(client.get(testEndpoint)).rejects.toMatchObject({
        message: 'Network error. Please check your internet connection.',
        status: 0,
        code: 'NETWORK_ERROR',
      });
    });

    it('should handle 400 Bad Request errors', async () => {
      const errorMessage = 'Invalid request data';
      const errorCode = 'VALIDATION_ERROR';
      const errors = {
        email: ['Email is required'],
        password: ['Password must be at least 6 characters'],
      };

      server.use(
        http.get(testUrl, () => {
          return HttpResponse.json(
            {
              message: errorMessage,
              code: errorCode,
              errors: errors,
            },
            { status: 400 }
          );
        })
      );

      await expect(client.get(testEndpoint)).rejects.toThrow(ApiClientError);
      await expect(client.get(testEndpoint)).rejects.toMatchObject({
        message: errorMessage,
        status: 400,
        code: errorCode,
        errors: errors,
      });
    });

    it('should handle 403 Forbidden errors', async () => {
      server.use(
        http.get(testUrl, () => {
          return HttpResponse.json(
            {
              message: 'Access denied',
              code: 'FORBIDDEN',
            },
            { status: 403 }
          );
        })
      );

      await expect(client.get(testEndpoint)).rejects.toThrow(ApiClientError);
      await expect(client.get(testEndpoint)).rejects.toMatchObject({
        message: 'Access denied',
        status: 403,
        code: 'FORBIDDEN',
      });
    });

    it('should handle 404 Not Found errors', async () => {
      server.use(
        http.get(testUrl, () => {
          return HttpResponse.json(
            {
              message: 'Resource not found',
              code: 'NOT_FOUND',
            },
            { status: 404 }
          );
        })
      );

      await expect(client.get(testEndpoint)).rejects.toThrow(ApiClientError);
      await expect(client.get(testEndpoint)).rejects.toMatchObject({
        message: 'Resource not found',
        status: 404,
        code: 'NOT_FOUND',
      });
    });

    it('should handle 500 Server errors', async () => {
      server.use(
        http.get(testUrl, () => {
          return HttpResponse.json(
            {
              message: 'Internal server error',
              code: 'SERVER_ERROR',
            },
            { status: 500 }
          );
        })
      );

      await expect(client.get(testEndpoint)).rejects.toThrow(ApiClientError);
      await expect(client.get(testEndpoint)).rejects.toMatchObject({
        message: 'Internal server error',
        status: 500,
        code: 'SERVER_ERROR',
      });
    });
  });

  describe('Response Interceptor - Token Refresh', () => {
    it('should attempt token refresh on 401 error', async () => {
      const oldToken = 'old-token';
      const newToken = 'new-token';

      localStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: { accessToken: oldToken },
        })
      );

      let requestCount = 0;

      // First request fails with 401
      // After token refresh, retry succeeds
      server.use(
        http.get(testUrl, ({ request }) => {
          requestCount++;
          const authHeader = request.headers.get('Authorization');

          if (authHeader === `Bearer ${oldToken}`) {
            // First attempt with old token
            return HttpResponse.json(
              { message: 'Unauthorized' },
              { status: 401 }
            );
          } else if (authHeader === `Bearer ${newToken}`) {
            // Retry with new token
            return HttpResponse.json({ success: true });
          }

          return HttpResponse.json({ message: 'Invalid token' }, { status: 401 });
        }),
        http.post(`${env.apiBaseUrl}/auth/refresh`, () => {
          return HttpResponse.json({ accessToken: newToken });
        })
      );

      const response = await client.get(testEndpoint);

      expect(response.data).toEqual({ success: true });
      expect(requestCount).toBe(2); // Original request + retry

      // Verify token was updated in storage
      const storage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      expect(storage.state.accessToken).toBe(newToken);
    });

    it('should not retry token refresh for auth endpoints', async () => {
      const authEndpoint = '/auth/login';
      const authUrl = `${env.apiBaseUrl}${authEndpoint}`;

      server.use(
        http.post(authUrl, () => {
          return HttpResponse.json(
            { message: 'Invalid credentials' },
            { status: 401 }
          );
        })
      );

      await expect(client.post(authEndpoint)).rejects.toThrow(ApiClientError);
      await expect(client.post(authEndpoint)).rejects.toMatchObject({
        message: 'Invalid credentials',
        status: 401,
      });

      // Verify no token in storage (cleared on auth failure)
      const storage = localStorage.getItem('auth-storage');
      expect(storage).toBeNull();
    });

    it('should clear auth and reject if token refresh fails', async () => {
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: { accessToken: 'expired-token' },
        })
      );

      server.use(
        http.get(testUrl, () => {
          return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }),
        http.post(`${env.apiBaseUrl}/auth/refresh`, () => {
          return HttpResponse.json(
            { message: 'Refresh token expired' },
            { status: 401 }
          );
        })
      );

      await expect(client.get(testEndpoint)).rejects.toThrow(ApiClientError);
      await expect(client.get(testEndpoint)).rejects.toMatchObject({
        message: 'Session expired. Please login again.',
        status: 401,
        code: 'TOKEN_EXPIRED',
      });

      // Verify auth was cleared
      const storage = localStorage.getItem('auth-storage');
      expect(storage).toBeNull();
    });

    it('should skip token refresh when X-Skip-Refresh header is set', async () => {
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: { accessToken: 'test-token' },
        })
      );

      server.use(
        http.get(testUrl, () => {
          return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
        })
      );

      await expect(
        client.get(testEndpoint, {
          headers: { 'X-Skip-Refresh': 'true' },
        })
      ).rejects.toThrow(ApiClientError);

      // Verify auth was cleared
      const storage = localStorage.getItem('auth-storage');
      expect(storage).toBeNull();
    });
  });

  describe('Successful Requests', () => {
    it('should handle successful GET request', async () => {
      const mockData = { id: 1, name: 'Test' };

      server.use(
        http.get(testUrl, () => {
          return HttpResponse.json(mockData);
        })
      );

      const response = await client.get(testEndpoint);

      expect(response.data).toEqual(mockData);
      expect(response.status).toBe(200);
    });

    it('should handle successful POST request', async () => {
      const requestData = { name: 'New Item' };
      const responseData = { id: 1, ...requestData };

      server.use(
        http.post(testUrl, async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(requestData);
          return HttpResponse.json(responseData, { status: 201 });
        })
      );

      const response = await client.post(testEndpoint, requestData);

      expect(response.data).toEqual(responseData);
      expect(response.status).toBe(201);
    });

    it('should handle successful PUT request', async () => {
      const requestData = { id: 1, name: 'Updated Item' };

      server.use(
        http.put(testUrl, async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(requestData);
          return HttpResponse.json(requestData);
        })
      );

      const response = await client.put(testEndpoint, requestData);

      expect(response.data).toEqual(requestData);
      expect(response.status).toBe(200);
    });

    it('should handle successful DELETE request', async () => {
      server.use(
        http.delete(testUrl, () => {
          return HttpResponse.json({ success: true }, { status: 204 });
        })
      );

      const response = await client.delete(testEndpoint);

      expect(response.status).toBe(204);
    });
  });

  describe('Request Configuration', () => {
    it('should include credentials for cross-origin requests', async () => {
      let capturedCredentials: RequestCredentials | undefined;

      server.use(
        http.get(testUrl, ({ request }) => {
          capturedCredentials = request.credentials;
          return HttpResponse.json({ success: true });
        })
      );

      await client.get(testEndpoint);

      expect(capturedCredentials).toBe('include');
    });

    it('should set correct Content-Type header', async () => {
      let capturedContentType: string | undefined;

      server.use(
        http.post(testUrl, ({ request }) => {
          capturedContentType = request.headers.get('Content-Type') || undefined;
          return HttpResponse.json({ success: true });
        })
      );

      await client.post(testEndpoint, { data: 'test' });

      expect(capturedContentType).toBe('application/json');
    });
  });
});
