/**
 * AuthInitializer Component - Phase 6 Implementation
 * Version: 2.0.0
 * Date: 2026-01-10
 *
 * Initializes authentication state on app load
 * Restores session from stored tokens if available
 */

import React from 'react';
import { useAuthStore } from '../model';
import { Loader2 } from 'lucide-react';

interface AuthInitializerProps {
  children: React.ReactNode;
}

/**
 * AuthInitializer Component
 *
 * Wraps the app to initialize authentication state on mount.
 * Shows a loading state while checking for existing session.
 *
 * @example
 * <AuthInitializer>
 *   <App />
 * </AuthInitializer>
 */
export const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const mountId = React.useRef(Math.random().toString(36).substr(2, 9));
  console.log(`[AuthInitializer] Component ${mountId.current} rendering`);

  // Track mount/unmount
  React.useEffect(() => {
    console.log(`[AuthInitializer] Component ${mountId.current} MOUNTED`);
    return () => {
      console.log(`[AuthInitializer] Component ${mountId.current} UNMOUNTING!`);
    };
  }, []);

  const { initializeAuth, isLoading } = useAuthStore();
  const [isInitializing, setIsInitializing] = React.useState(true);

  // EMERGENCY CIRCUIT BREAKER: Check if we're in a loop before doing ANYTHING
  const loopCheck = sessionStorage.getItem('auth_init_loop_check');
  const { count = 0, time = Date.now() } = loopCheck ? JSON.parse(loopCheck) : {};
  const timeSince = Date.now() - time;

  // If we've initialized more than 5 times in 2 seconds, we're in a loop - STOP
  if (timeSince < 2000 && count > 5) {
    console.error(`[AuthInitializer ${mountId.current}] EMERGENCY: Initialization loop detected! Breaking circuit.`);
    sessionStorage.clear();
    localStorage.clear();

    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center max-w-md p-6">
          <h1 className="text-2xl font-bold mb-4 text-destructive">Emergency Loop Break</h1>
          <p className="text-muted-foreground mb-4">
            Detected infinite initialization loop. All storage has been cleared.
          </p>
          <a
            href="/login"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            onClick={() => {
              sessionStorage.clear();
              localStorage.clear();
              window.location.href = '/login';
            }}
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Update loop counter
  sessionStorage.setItem('auth_init_loop_check', JSON.stringify({
    count: timeSince < 2000 ? count + 1 : 1,
    time: Date.now()
  }));

  const hasInitialized = React.useRef(false);

  React.useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized.current) {
      console.log('[AuthInitializer] Already initialized, skipping');
      return;
    }

    const initialize = async () => {
      console.log('[AuthInitializer] Starting auth initialization...');
      hasInitialized.current = true;

      try {
        await initializeAuth();
        console.log('[AuthInitializer] Auth initialization complete');
        // Clear loop counter on success
        sessionStorage.removeItem('auth_init_loop_check');
      } catch (error) {
        console.error('[AuthInitializer] Auth initialization failed:', error);
        // Don't throw - let the app render without authentication
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
    // Empty dependency array - only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show loading screen while initializing
  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Render app after initialization
  return <>{children}</>;
};
