/**
 * Header Component - Phase 3 Update
 * Version: 2.2.0
 * Date: 2026-01-13
 *
 * Updated to use Person Data v2.0:
 * - Uses useDisplayName() hook for user display name
 * - Uses useCurrentUser() hook for computed values
 * - Uses UserAvatar component with person data
 * - Shows pronouns (optional, subtle)
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, LogOut, KeyRound, BookOpen, Building2 } from 'lucide-react';
import { ThemeToggle } from '@/features/theme/ui/ThemeToggle';
import { useAuthStore } from '@/features/auth/model/authStore';
import { useDisplayName } from '@/features/auth/hooks/useDisplayName';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useNavigation } from '@/shared/lib/navigation';
import { useDepartmentContext } from '@/shared/hooks';
import { Button } from '@/shared/ui/button';
import { Separator } from '@/shared/ui/separator';
import { UserAvatar } from '@/entities/user/ui/UserAvatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { getUserTypeDisplayLabel, getRoleDisplayLabel } from '@/shared/lib/displayUtils';
import { cn } from '@/shared/lib/utils';
import type { UserType } from '@/shared/types/auth';
import { EscalationModal } from '@/features/auth/ui/EscalationModal';
import { AdminSessionIndicator } from '@/features/auth/ui/AdminSessionIndicator';
import { NotificationBell } from '@/features/notifications';
import { useNotificationSummary, useMarkNotificationsAsRead } from '@/entities/notification';

// ============================================================================
// Dashboard Tab Configuration
// ============================================================================

interface DashboardTab {
  userType: UserType;
  label: string;
  path: string;
  basePath: string; // For active detection
}

/**
 * Get dashboard path for a given userType
 */
const getDashboardPath = (userType: UserType): string => {
  switch (userType) {
    case 'learner':
      return '/learner/dashboard';
    case 'staff':
      return '/staff/dashboard';
    case 'global-admin':
      return '/admin/dashboard';
    default:
      return '/dashboard';
  }
};

/**
 * Get base path for active state detection
 */
const getBasePath = (userType: UserType): string => {
  switch (userType) {
    case 'learner':
      return '/learner';
    case 'staff':
      return '/staff';
    case 'global-admin':
      return '/admin';
    default:
      return '/';
  }
};

export const Header: React.FC = () => {
  const { isAuthenticated, user, roleHierarchy, logout, isAdminSessionActive } = useAuthStore();
  const displayName = useDisplayName();
  const { person, primaryEmail } = useCurrentUser();
  const { toggleSidebar } = useNavigation();
  const {
    currentDepartmentName,
    currentDepartmentRoles,
  } = useDepartmentContext();
  const navigate = useNavigate();
  const location = useLocation();

  // ISS-013: Escalation modal state
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [pendingAdminPath, setPendingAdminPath] = useState('/admin/dashboard');

  // Notification system hooks
  const { data: notificationSummary, isLoading: notificationsLoading } = useNotificationSummary();
  const markAsReadMutation = useMarkNotificationsAsRead();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Handle notification click - navigate to relevant page or mark as read
  const handleNotificationClick = (notificationId: string, actionUrl?: string | null) => {
    markAsReadMutation.mutate({ notificationIds: [notificationId] });
    if (actionUrl) {
      navigate(actionUrl);
    }
  };

  // Handle mark single notification as read
  const handleMarkNotificationAsRead = (notificationId: string) => {
    markAsReadMutation.mutate({ notificationIds: [notificationId] });
  };

  // Handle view all notifications
  const handleViewAllNotifications = () => {
    navigate('/learner/inbox');
  };

  // Handle notification settings
  const handleNotificationSettings = () => {
    navigate('/learner/inbox');
  };

  // ISS-013: Handle admin tab click with escalation modal
  const handleAdminTabClick = (e: React.MouseEvent, targetPath: string) => {
    // If already in admin session, navigate normally
    if (isAdminSessionActive) {
      return; // Let the Link handle navigation
    }

    // Otherwise, prevent navigation and show escalation modal
    e.preventDefault();
    setPendingAdminPath(targetPath);
    setShowEscalationModal(true);
  };

  // Detect current dashboard context from route
  const getCurrentDashboardUserType = (): UserType => {
    const path = location.pathname;
    if (path.startsWith('/admin')) return 'global-admin';
    if (path.startsWith('/staff')) return 'staff';
    if (path.startsWith('/learner')) return 'learner';
    // Default to primary user type
    return roleHierarchy?.primaryUserType || 'learner';
  };

  // Get user type display label based on current dashboard context
  const getContextualUserTypeLabel = (): string => {
    if (!roleHierarchy) return 'User';

    const contextUserType = getCurrentDashboardUserType();

    // Use server-provided displayAs from roleHierarchy
    return getUserTypeDisplayLabel(
      contextUserType,
      roleHierarchy.userTypeDisplayMap
    );
  };

  // Get role badge initial (first letter, uppercase)
  const getRoleBadgeInitial = (role: string): string => {
    const displayLabel = getRoleDisplayLabel(role, roleHierarchy?.roleDisplayMap);
    return displayLabel.charAt(0).toUpperCase();
  };

  // Get roles to display based on current dashboard context
  const getContextualRoles = (): string[] => {
    const dashboardType = getCurrentDashboardUserType();
    
    // For global-admin dashboard, show global admin roles if available
    if (dashboardType === 'global-admin') {
      // Global admins may have 'system-admin' or similar roles
      const globalRoles = roleHierarchy?.globalRoles?.map(r => r.role) || [];
      if (globalRoles.length > 0) return globalRoles;
      // Fallback: if user is global-admin, show that
      if (roleHierarchy?.allUserTypes?.includes('global-admin')) {
        return ['system-admin'];
      }
    }
    
    // For staff/learner dashboards, show current department roles
    return currentDepartmentRoles;
  };

  // Build dashboard tabs from user's available userTypes
  const dashboardTabs: DashboardTab[] = React.useMemo(() => {
    if (!roleHierarchy?.allUserTypes) return [];

    return roleHierarchy.allUserTypes.map((userType) => ({
      userType,
      label: getUserTypeDisplayLabel(userType, roleHierarchy.userTypeDisplayMap),
      path: getDashboardPath(userType),
      basePath: getBasePath(userType),
    }));
  }, [roleHierarchy]);


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Mobile menu button */}
        {isAuthenticated && (
          <Button
            variant="ghost"
            size="sm"
            className="mr-2 lg:hidden"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Logo */}
        <div className="mr-4 flex items-center">
          <Link
            to="/"
            className="mr-4 flex items-center space-x-2"
            aria-label="LMS UI V2 Home"
          >
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="hidden font-bold text-lg sm:inline-block">LMS UI V2</span>
          </Link>

          {/* Dashboard Tabs (Desktop) */}
          {isAuthenticated && dashboardTabs.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-6 hidden md:block" />
              <nav className="hidden md:flex items-center gap-1">
                {dashboardTabs.map((tab) => {
                  const isActive = location.pathname.startsWith(tab.basePath);
                  const isAdminTab = tab.userType === 'global-admin';

                  return (
                    <Link
                      key={tab.userType}
                      to={tab.path}
                      onClick={isAdminTab ? (e) => handleAdminTabClick(e, tab.path) : undefined}
                      className={cn(
                        "px-3 py-1.5 text-sm rounded-t transition-all",
                        isActive
                          ? "bg-primary/10 border-b-2 border-primary font-medium text-foreground"
                          : "border-b-2 border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      {tab.label}
                    </Link>
                  );
                })}
              </nav>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                {/* ISS-013 Phase 2: Admin Session Indicator */}
                <AdminSessionIndicator />

                {/* ISS-103: Notification Bell */}
                <NotificationBell
                  summary={notificationSummary ?? null}
                  isLoading={notificationsLoading}
                  onViewAll={handleViewAllNotifications}
                  onSettings={handleNotificationSettings}
                  onNotificationClick={handleNotificationClick}
                  onMarkAsRead={handleMarkNotificationAsRead}
                />

                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full"
                      aria-label="User menu"
                    >
                      <UserAvatar
                        person={person ?? undefined}
                        displayName={displayName}
                        size="md"
                        className="h-9 w-9"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        {/* Display Name */}
                        <p className="text-sm font-medium leading-none">
                          {displayName || 'User'}
                        </p>
                        {/* Pronouns (subtle) */}
                        {person?.pronouns && (
                          <p className="text-xs text-muted-foreground italic">
                            {person.pronouns}
                          </p>
                        )}
                        {/* Primary Email */}
                        <p className="text-xs text-muted-foreground">
                          {primaryEmail || user?.email || 'No email'}
                        </p>
                        {/* UserType with role badges */}
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-xs leading-none text-muted-foreground">
                            {getContextualUserTypeLabel()}
                          </span>
                          {/* Role badge circles */}
                          {getContextualRoles().slice(0, 4).map((role) => (
                            <span
                              key={role}
                              className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-primary/10 text-primary text-[10px] font-medium"
                              title={getRoleDisplayLabel(role, roleHierarchy?.roleDisplayMap)}
                            >
                              {getRoleBadgeInitial(role)}
                            </span>
                          ))}
                          {getContextualRoles().length > 4 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{getContextualRoles().length - 4}
                            </span>
                          )}
                        </div>
                        {currentDepartmentName && (
                          <div className="flex items-center gap-1 mt-2 pt-2 border-t">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {currentDepartmentName}
                            </span>
                          </div>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/learner/courses" className="cursor-pointer">
                        <BookOpen className="mr-2 h-4 w-4" />
                        <span>My Courses</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings/change-password" className="cursor-pointer">
                        <KeyRound className="mr-2 h-4 w-4" />
                        <span>Change Password</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link to="/login">Sign In</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>

      {/* ISS-013: Escalation Modal */}
      <EscalationModal
        open={showEscalationModal}
        onOpenChange={setShowEscalationModal}
        redirectPath={pendingAdminPath}
      />
    </header>
  );
};
