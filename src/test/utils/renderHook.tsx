/**
 * Test utilities for React Query hooks
 * Provides wrapper with QueryClientProvider for testing hooks
 */

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook as rtlRenderHook, RenderHookOptions } from '@testing-library/react';

/**
 * Create a new QueryClient for testing
 * Configured with minimal retry and cache times for faster tests
 */
export function createTestQueryClient() {
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
  });
}

/**
 * Wrapper component that provides QueryClient context
 */
export function createWrapper(queryClient: QueryClient = createTestQueryClient()) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

/**
 * Render a hook with QueryClient context
 */
export function renderHook<TProps, TResult>(
  hook: (props: TProps) => TResult,
  options?: Omit<RenderHookOptions<TProps>, 'wrapper'> & {
    queryClient?: QueryClient;
  }
) {
  const { queryClient, ...renderOptions } = options || {};
  const client = queryClient || createTestQueryClient();

  return {
    ...rtlRenderHook(hook, {
      ...renderOptions,
      wrapper: createWrapper(client),
    }),
    queryClient: client,
  };
}
