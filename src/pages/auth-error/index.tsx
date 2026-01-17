/**
 * AuthErrorPage - Debug-friendly authentication error page
 * Version: 1.0.0
 * Date: 2026-01-15
 *
 * Replaces direct login redirects with a debug page that shows
 * authentication state for easier troubleshooting.
 * 
 * Previously, auth failures would redirect to /login which caused
 * confusion and redirect loops. This page provides visibility into
 * the actual auth state.
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldX, RefreshCw, LogIn, Home, Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { useAuthStore } from '@/features/auth/model';
import { getAccessToken, getRefreshToken } from '@/shared/utils/tokenStorage';
import { hasAdminToken, getAdminTokenExpiry } from '@/shared/utils/adminTokenStorage';

interface AuthErrorState {
  reason?: 'no-auth' | 'no-role-hierarchy' | 'missing-usertype' | 'missing-permission' | 'session-expired' | 'token-refresh-failed';
  requiredUserTypes?: string[];
  requiredPermission?: string;
  from?: string;
}

export const AuthErrorPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as AuthErrorState | undefined;
  
  // Also check URL query params (for hard redirects from API client)
  const searchParams = new URLSearchParams(location.search);
  const queryReason = searchParams.get('reason') as AuthErrorState['reason'] | null;
  
  const {
    isAuthenticated,
    roleHierarchy,
    user,
    isAdminSessionActive,
    adminSessionExpiry,
  } = useAuthStore();

  const [showDebug, setShowDebug] = React.useState(false);
  
  // Combine state reason with query param reason
  const reason = state?.reason || queryReason || 'unknown';

  // Gather debug information
  const debugInfo = React.useMemo(() => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    const hasAdminTok = hasAdminToken();
    const adminExpiry = getAdminTokenExpiry();

    return {
      // Auth state
      isAuthenticated,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenExpiry: accessToken?.expiresAt ? new Date(accessToken.expiresAt).toISOString() : null,
      
      // User info
      userId: user?._id || null,
      userEmail: user?.email || null,
      
      // Role hierarchy
      hasRoleHierarchy: !!roleHierarchy,
      primaryUserType: roleHierarchy?.primaryUserType || null,
      allUserTypes: roleHierarchy?.allUserTypes || [],
      defaultDashboard: roleHierarchy?.defaultDashboard || null,
      permissionCount: roleHierarchy?.allPermissions?.length || 0,
      
      // Admin session
      isAdminSessionActive,
      hasAdminToken: hasAdminTok,
      adminSessionExpiry: adminSessionExpiry?.toISOString() || null,
      adminTokenExpiry: adminExpiry?.toISOString() || null,
      
      // Navigation state
      attemptedPath: state?.from || location.pathname,
      requiredUserTypes: state?.requiredUserTypes || [],
      requiredPermission: state?.requiredPermission || null,
      reason,
      
      // Timestamp
      timestamp: new Date().toISOString(),
    };
  }, [isAuthenticated, roleHierarchy, user, isAdminSessionActive, adminSessionExpiry, state, location.pathname, reason]);

  // Determine the error message based on state
  const getErrorMessage = () => {
    if (reason === 'token-refresh-failed') {
      return 'Your session could not be refreshed. This usually means your session has expired.';
    }
    if (!isAuthenticated) {
      return 'You are not logged in. Your session may have expired.';
    }
    if (!roleHierarchy) {
      return 'Your role information could not be loaded. This may be a temporary issue.';
    }
    if (reason === 'missing-usertype') {
      return `This page requires one of these user types: ${state?.requiredUserTypes?.join(', ')}. You have: ${roleHierarchy.allUserTypes.join(', ')}.`;
    }
    if (reason === 'missing-permission') {
      return `This page requires the permission: ${state?.requiredPermission}.`;
    }
    if (reason === 'session-expired') {
      return 'Your admin session has expired. Please re-authenticate.';
    }
    return 'An authentication error occurred. Please try logging in again.';
  };

  const handleRetry = () => {
    // Clear any loop detection counters
    sessionStorage.removeItem('auth_init_loop_check');
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith('redirectLoop_')) {
        sessionStorage.removeItem(key);
      }
    }
    // Reload the page
    window.location.reload();
  };

  const handleReinitialize = async () => {
    try {
      const { initializeAuth } = useAuthStore.getState();
      await initializeAuth();
      // Navigate back to attempted path
      if (state?.from) {
        window.location.href = state.from;
      } else {
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Re-initialization failed:', error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/50">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <ShieldX className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-2xl">Authentication Required</CardTitle>
          <CardDescription>
            {getErrorMessage()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Action buttons */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleRetry}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
            <Button asChild className="flex-1">
              <Link to="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>
          </div>

          <div className="flex justify-center">
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>

          {/* Debug toggle */}
          <div className="border-t pt-4">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-muted-foreground"
              onClick={() => setShowDebug(!showDebug)}
            >
              <span className="flex items-center">
                <Bug className="mr-2 h-4 w-4" />
                Debug Information
              </span>
              {showDebug ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {showDebug && (
              <div className="mt-3 rounded-md bg-muted p-3 text-xs font-mono overflow-auto max-h-64">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Re-initialize button (for stuck states) */}
          {showDebug && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={handleReinitialize}
            >
              Force Re-initialize Auth
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
