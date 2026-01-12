/**
 * Main App component - Phase 6 Update
 * Version: 2.0.0
 * Date: 2026-01-10
 *
 * Sets up routing with BrowserRouter and providers
 * Includes V2 authentication initialization
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './router';
import { AppLayout } from '@/widgets/layout/AppLayout';
import { AuthInitializer } from '@/features/auth/ui';

// Create a QueryClient instance for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthInitializer>
          <AppLayout>
            <AppRouter />
          </AppLayout>
        </AuthInitializer>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
