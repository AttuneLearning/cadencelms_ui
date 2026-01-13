/**
 * Test Wrapper Utilities - Phase 3
 * Version: 1.0.0
 * Date: 2026-01-13
 *
 * Provides comprehensive test wrappers with all necessary providers:
 * - React Query (QueryClientProvider)
 * - React Router (MemoryRouter)
 * - Custom routing options
 */

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, RenderOptions } from '@testing-library/react';

// ============================================================================
// Query Client Factory
// ============================================================================

/**
 * Create a fresh QueryClient instance for testing
 * Configured with no retries and minimal cache times for fast tests
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  });
}

// ============================================================================
// Wrapper Factory
// ============================================================================

export interface TestWrapperOptions {
  /**
   * Custom QueryClient instance
   * If not provided, a new one will be created
   */
  queryClient?: QueryClient;

  /**
   * Initial route entries for MemoryRouter
   * @default ['/']
   */
  initialEntries?: string[];

  /**
   * Initial index for MemoryRouter
   * @default 0
   */
  initialIndex?: number;

  /**
   * Route path pattern for Routes configuration
   * If provided, wraps children in <Routes><Route path={routePath} element={children} /></Routes>
   * This is needed for components that use useParams or other route-based hooks
   * @example '/admin/audit-logs/:logId'
   */
  routePath?: string;

  /**
   * Additional wrapper components to nest
   * Applied from outer to inner (first = outermost)
   */
  additionalWrappers?: React.ComponentType<{ children: ReactNode }>[];
}

/**
 * Create a test wrapper component with all necessary providers
 *
 * @example
 * ```tsx
 * const TestWrapper = createTestWrapper();
 * render(<MyComponent />, { wrapper: TestWrapper });
 * ```
 *
 * @example
 * ```tsx
 * const TestWrapper = createTestWrapper({
 *   initialEntries: ['/dashboard'],
 * });
 * render(<MyComponent />, { wrapper: TestWrapper });
 * ```
 */
export function createTestWrapper(options: TestWrapperOptions = {}) {
  const {
    queryClient = createTestQueryClient(),
    initialEntries = ['/'],
    initialIndex = 0,
    routePath,
    additionalWrappers = [],
  } = options;

  return function TestWrapper({ children }: { children: ReactNode }) {
    let wrapped = children;

    // If routePath is provided, wrap in Routes/Route for param support
    if (routePath) {
      wrapped = (
        <Routes>
          <Route path={routePath} element={wrapped} />
        </Routes>
      );
    }

    // Apply additional wrappers from innermost to outermost
    for (let i = additionalWrappers.length - 1; i >= 0; i--) {
      const Wrapper = additionalWrappers[i];
      wrapped = <Wrapper>{wrapped}</Wrapper>;
    }

    // Wrap with core providers
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
          {wrapped}
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
}

// ============================================================================
// Render Helper
// ============================================================================

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * Test wrapper options
   */
  wrapperOptions?: TestWrapperOptions;
}

/**
 * Render a component with all necessary providers
 * Convenience wrapper around @testing-library/react's render
 *
 * @example
 * ```tsx
 * const { getByText } = renderWithProviders(<MyComponent />);
 * ```
 *
 * @example
 * ```tsx
 * const { getByText } = renderWithProviders(<MyComponent />, {
 *   wrapperOptions: {
 *     initialEntries: ['/dashboard'],
 *   },
 * });
 * ```
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options: RenderWithProvidersOptions = {}
) {
  const { wrapperOptions, ...renderOptions } = options;
  const TestWrapper = createTestWrapper(wrapperOptions);

  return {
    ...render(ui, { wrapper: TestWrapper, ...renderOptions }),
    // Also return the wrapper for access to providers if needed
    wrapper: TestWrapper,
  };
}

// ============================================================================
// Exports
// ============================================================================

export { QueryClient } from '@tanstack/react-query';
export { MemoryRouter } from 'react-router-dom';
