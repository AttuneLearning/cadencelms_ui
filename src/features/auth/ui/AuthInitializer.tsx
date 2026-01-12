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
  const { initializeAuth, isLoading } = useAuthStore();
  const [isInitializing, setIsInitializing] = React.useState(true);

  React.useEffect(() => {
    const initialize = async () => {
      console.log('[AuthInitializer] Starting auth initialization...');
      try {
        await initializeAuth();
        console.log('[AuthInitializer] Auth initialization complete');
      } catch (error) {
        console.error('[AuthInitializer] Auth initialization failed:', error);
        // Don't throw - let the app render without authentication
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, [initializeAuth]);

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
