/**
 * Main App component
 * Sets up routing with BrowserRouter and providers
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './router';
import { AppLayout } from '@/widgets/layout/AppLayout';

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
      <BrowserRouter>
        <AppLayout>
          <AppRouter />
        </AppLayout>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
