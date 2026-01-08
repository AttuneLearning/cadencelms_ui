/**
 * MSW server setup for testing
 * Provides mock API server for unit and integration tests
 */

import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { env } from '@/shared/config/env';

/**
 * Default request handlers
 * Can be overridden in individual tests using server.use()
 */
const handlers = [
  // Default health check endpoint
  http.get(`${env.apiBaseUrl}/health`, () => {
    return HttpResponse.json({ status: 'ok' });
  }),

  // Default catch-all for unhandled requests
  http.get('*', () => {
    return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
];

/**
 * Create MSW server instance for Node environment (tests)
 * Configure in test setup file with:
 * - beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
 * - afterEach(() => server.resetHandlers())
 * - afterAll(() => server.close())
 */
export const server = setupServer(...handlers);
