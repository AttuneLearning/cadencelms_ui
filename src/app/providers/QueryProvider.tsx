/**
 * TanStack Query Provider
 * Configures React Query with caching, persistence, and defaults
 */

import React from 'react';
import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  PersistQueryClientProvider,
  type Persister,
} from '@tanstack/react-query-persist-client';
import { del, get, set } from 'idb-keyval';
import { isDevelopment } from '@/shared/config/env';

/**
 * IndexedDB-based persister for offline support
 */
const persister: Persister = {
  persistClient: async (client) => {
    await set('react-query-cache', client);
  },
  restoreClient: async () => {
    return await get('react-query-cache');
  },
  removeClient: async () => {
    await del('react-query-cache');
  },
};

/**
 * Query client configuration
 */
const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // Stale time - data considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000, // 5 minutes

      // Cache time - keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)

      // Retry configuration
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as { status: number }).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }

        // Retry up to 2 times for other errors
        return failureCount < 2;
      },

      retryDelay: (attemptIndex) => {
        // Exponential backoff: 1s, 2s, 4s
        return Math.min(1000 * 2 ** attemptIndex, 30000);
      },

      // Refetch configuration
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,

      // Network mode - use cache when offline
      networkMode: 'online',
    },

    mutations: {
      // Retry mutations once on failure
      retry: 1,

      // Network mode for mutations
      networkMode: 'online',
    },
  },
};

/**
 * Create query client instance
 */
export const queryClient = new QueryClient(queryClientConfig);

/**
 * Query provider props
 */
interface QueryProviderProps {
  children: React.ReactNode;
  enablePersistence?: boolean;
  enableDevtools?: boolean;
}

/**
 * Query provider with optional persistence and devtools
 */
export const QueryProvider: React.FC<QueryProviderProps> = ({
  children,
  enablePersistence = true,
  enableDevtools = isDevelopment,
}) => {
  if (enablePersistence) {
    return (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          buster: 'v1', // Increment to invalidate all cached data
        }}
      >
        {children}
        {enableDevtools && (
          <ReactQueryDevtools
            initialIsOpen={false}
          />
        )}
      </PersistQueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {enableDevtools && (
        <ReactQueryDevtools
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  );
};

/**
 * Export query client for use in tests and utilities
 */
export { queryClient as default };
