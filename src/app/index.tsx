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
  // EMERGENCY: Detect page reload loops
  const loopKey = 'app_load_loop_check';
  const loopData = sessionStorage.getItem(loopKey);
  const { count = 0, time = Date.now() } = loopData ? JSON.parse(loopData) : {};
  const timeSince = Date.now() - time;

  // If app loaded more than 10 times in 3 seconds, we have a reload loop
  if (timeSince < 3000 && count > 10) {
    console.error('[App] EMERGENCY: Page reload loop detected!');
    sessionStorage.clear();
    localStorage.clear();

    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#ef4444' }}>
            Emergency: Page Reload Loop
          </h1>
          <p style={{ marginBottom: '16px', color: '#666' }}>
            The page was reloading infinitely. All storage has been cleared.
          </p>
          <p style={{ marginBottom: '16px', color: '#666' }}>
            Please close this browser tab/window completely and open a new one.
          </p>
          <button
            onClick={() => {
              sessionStorage.clear();
              localStorage.clear();
              window.location.href = '/login';
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Force Navigate to Login
          </button>
        </div>
      </div>
    );
  }

  // Update loop counter
  sessionStorage.setItem(loopKey, JSON.stringify({
    count: timeSince < 3000 ? count + 1 : 1,
    time: Date.now()
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInitializer>
          <AppLayout>
            <AppRouter />
          </AppLayout>
        </AuthInitializer>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
