/**
 * MSW server setup for testing
 * Provides mock API server for unit and integration tests
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * Create MSW server instance for Node environment (tests)
 * Configure in test setup file with:
 * - beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
 * - afterEach(() => server.resetHandlers())
 * - afterAll(() => server.close())
 *
 * Individual tests can override default handlers using server.use()
 */
export const server = setupServer(...handlers);
