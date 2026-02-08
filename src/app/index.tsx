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

// Global variable to survive sessionStorage clears
if (!(window as any).__loopBreaker) {
  (window as any).__loopBreaker = { count: 0, time: Date.now() };
}

export const App: React.FC = () => {

  // EMERGENCY: Detect page reload loops (use both storage AND global variable)
  // BUT ONLY CHECK ON MOUNT, NOT EVERY RENDER
  const [loopDetected, setLoopDetected] = React.useState(false);

  React.useEffect(() => {
    const globalBreaker = (window as any).__loopBreaker;
    const timeSince = Date.now() - globalBreaker.time;

    // Reset if more than 1 second passed
    if (timeSince > 1000) {
      globalBreaker.count = 1;
      globalBreaker.time = Date.now();
    } else {
      globalBreaker.count++;
    }

    // If app MOUNTED more than 3 times in 1 second, we have a reload loop
    if (timeSince < 1000 && globalBreaker.count > 3) {
      console.error('[App] EMERGENCY: Page reload loop detected in useEffect!');
      setLoopDetected(true);
    }

    (window as any).__loopBreaker = globalBreaker;
  }, []); // Only run on mount

  if (loopDetected) {
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
